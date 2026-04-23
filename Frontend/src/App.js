import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Video, X } from 'lucide-react';

export default function DeepfakeDetector() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
      setProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
  };

  const analyzeVideo = async () => {
    if (!file) return;

    setAnalyzing(true);
    setProgress(0);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Mock result - replace with actual API call
      const mockResult = {
        isDeepfake: Math.random() > 0.5,
        confidence: (Math.random() * 30 + 70).toFixed(2),
        details: {
          frameAnalyzed: Math.floor(Math.random() * 500 + 100),
          processingTime: (Math.random() * 5 + 2).toFixed(2),
          anomaliesDetected: Math.floor(Math.random() * 50)
        }
      };

      setResult(mockResult);
      setAnalyzing(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Deepfake Detector
          </h1>
          <p className="text-purple-200 text-lg">
            Upload a video to analyze for deepfake manipulation
          </p>
        </div>

        {/* Upload Section */}
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border-2 border-dashed border-purple-400/50 hover:border-purple-400 transition-all duration-300 cursor-pointer"
          >
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-20 h-20 text-purple-300 mb-6" />
              <span className="text-2xl font-semibold text-white mb-2">
                Drop your video here
              </span>
              <span className="text-purple-200 mb-6">
                or click to browse
              </span>
              <span className="text-sm text-purple-300">
                Supported formats: MP4, AVI, MOV, WebM
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Video Preview & Analysis */}
        {file && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/30">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-purple-300" />
                <div>
                  <h3 className="text-white font-semibold">{file.name}</h3>
                  <p className="text-purple-200 text-sm">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Preview */}
            <div className="mb-6 rounded-lg overflow-hidden bg-black">
              <video
                src={preview}
                controls
                className="w-full max-h-96 object-contain"
              />
            </div>

            {/* Analysis Button */}
            {!analyzing && !result && (
              <button
                onClick={analyzeVideo}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Analyze Video
              </button>
            )}

            {/* Progress Bar */}
            {analyzing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing video...
                  </span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-6">
                <div
                  className={`p-6 rounded-xl border-2 ${
                    result.isDeepfake
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-green-500/10 border-green-500'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {result.isDeepfake ? (
                      <XCircle className="w-12 h-12 text-red-500" />
                    ) : (
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {result.isDeepfake ? 'Deepfake Detected' : 'Authentic Video'}
                      </h3>
                      <p className="text-purple-200">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {result.details.frameAnalyzed}
                    </div>
                    <div className="text-purple-200 text-sm">Frames Analyzed</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {result.details.processingTime}s
                    </div>
                    <div className="text-purple-200 text-sm">Processing Time</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {result.details.anomaliesDetected}
                    </div>
                    <div className="text-purple-200 text-sm">Anomalies Found</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      analyzeVideo();
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Re-analyze
                  </button>
                  <button
                    onClick={removeFile}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Upload New Video
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong className="text-blue-100">Note:</strong> This interface uses
              simulated results for demonstration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}