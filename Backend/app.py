#flask code

from pyngrok import ngrok

# 🔴 GET YOUR TOKEN FROM: https://ngrok.com/
ngrok.set_auth_token("3BL33F7KN12xvVW8FKhqzUen0Jy_fKsohXknJa2cu4dCQa7x")


import tensorflow as tf
import cv2
import numpy as np
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import shutil
import time

print("✅ Libraries imported!")

print("Loading model...")
model_path = "/content/drive/MyDrive/video_deepfake_final.keras"

video_model = tf.keras.models.load_model(model_path)
print("✅ Model loaded successfully!")

def extract_frames(video_path, out_dir, n_frames=20):
    cap = cv2.VideoCapture(video_path)
    length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if length == 0:
        cap.release()
        return []

    os.makedirs(out_dir, exist_ok=True)
    frame_idxs = np.linspace(0, max(0, length-1), n_frames).astype(int)

    idx = 0
    saved = 0
    saved_files = []

    while cap.isOpened() and saved < n_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if idx in frame_idxs:
            frame_resized = cv2.resize(frame, (224, 224))
            filepath = os.path.join(out_dir, f"frame_{saved:03d}.jpg")
            cv2.imwrite(filepath, frame_resized)
            saved_files.append(filepath)
            saved += 1

        idx += 1

    cap.release()
    return saved_files

print("✅ Frame extraction ready!")

def predict_video(video_path, threshold=0.4):
    temp_dir = tempfile.mkdtemp()

    try:
        frame_files = extract_frames(video_path, temp_dir, n_frames=20)

        if len(frame_files) == 0:
            return None, None, "Failed to extract frames"

        sequence = []
        for frame_path in sorted(frame_files)[:20]:
            img = cv2.imread(frame_path)
            if img is None:
                continue
            img = cv2.resize(img, (224, 224))
            img = img / 255.0
            sequence.append(img)

        while len(sequence) < 20:
            sequence.append(np.zeros((224, 224, 3)))

        X = np.expand_dims(np.array(sequence[:20]), axis=0)
        prediction = video_model.predict(X, verbose=0)
        prob = float(prediction[0][0])

        is_deepfake = prob > threshold

        if prob < 0.3:
            confidence_level = "HIGH CONFIDENCE - REAL"
        elif prob < threshold:
            confidence_level = "LIKELY REAL"
        elif prob < 0.6:
            confidence_level = "LIKELY FAKE"
        else:
            confidence_level = "HIGH CONFIDENCE - FAKE"

        details = {
            'frameAnalyzed': len(frame_files),
            'processingTime': 0,
            'anomaliesDetected': int(prob * 100) if is_deepfake else int((1-prob) * 50),
            'confidenceLevel': confidence_level,
            'rawProbability': round(prob, 4)
        }

        confidence_percent = round(prob * 100 if is_deepfake else (1-prob) * 100, 2)
        return is_deepfake, confidence_percent, details

    except Exception as e:
        return None, None, str(e)
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

print("✅ Prediction function ready!")

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'API is running!', 'model_loaded': True})

@app.route('/analyze', methods=['POST'])
def analyze_video():
    start_time = time.time()

    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file'}), 400

        file = request.files['video']

        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        print(f"\n📹 Received: {file.filename}")

        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        file.save(temp_video.name)
        temp_video.close()

        is_deepfake, confidence, details = predict_video(temp_video.name)
        os.unlink(temp_video.name)

        if is_deepfake is None:
            return jsonify({'error': f'Prediction failed: {details}'}), 500

        processing_time = round(time.time() - start_time, 2)
        details['processingTime'] = processing_time

        result = {
            'isDeepfake': bool(is_deepfake),
            'confidence': float(confidence),
            'details': details
        }

        print(f"✅ Result: {'FAKE' if is_deepfake else 'REAL'} ({confidence}%)")
        return jsonify(result)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

print("✅ Flask API ready!")

from threading import Thread

def run_flask():
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

flask_thread = Thread(target=run_flask, daemon=True)
flask_thread.start()

time.sleep(2)

public_url = ngrok.connect(5000)

print("\n" + "="*60)
print("🎉 API IS RUNNING!")
print("="*60)
print(f"📡 PUBLIC URL: {public_url}")
print("="*60)
print("\n✅ COPY THE URL ABOVE AND USE IT IN YOUR REACT APP!")
print("✅ Test it: {}/health".format(public_url))
print("\n⚠️  KEEP THIS NOTEBOOK RUNNING!")
print("="*60 + "\n")