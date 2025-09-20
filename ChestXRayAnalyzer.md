# React + Tailwind CSS Chest X-Ray Analyzer

Here's the complete React.js component with Tailwind CSS for your chest X-ray diagnostic frontend:

## Main Component: ChestXRayAnalyzer.jsx

```jsx
import React, { useState, useRef, useCallback } from 'react';
import { 
  CloudArrowUpIcon, 
  HeartIcon, 
  EyeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const MEDICAL_FINDINGS = [
  'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion',
  'Emphysema', 'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'Nodule',
  'Pleural_Thickening', 'Pneumonia', 'Pneumothorax', 'No Finding'
];

const ChestXRayAnalyzer = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  // Simulate analysis with sample results
  const simulateAnalysis = useCallback(() => {
    const sampleResults = [
      {
        findings: [
          { condition: 'Pneumonia', confidence: 0.85 },
          { condition: 'Infiltration', confidence: 0.62 },
          { condition: 'Consolidation', confidence: 0.45 }
        ]
      },
      {
        findings: [
          { condition: 'Cardiomegaly', confidence: 0.78 },
          { condition: 'Edema', confidence: 0.56 }
        ]
      },
      {
        findings: [{ condition: 'No Finding', confidence: 0.92 }]
      }
    ];
    
    return sampleResults[Math.floor(Math.random() * sampleResults.length)];
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setError(null);
      startAnalysis();
    };
    reader.readAsDataURL(file);
  }, []);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResults(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate analysis completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResults(simulateAnalysis());
      setIsAnalyzing(false);
    }, 3000);
  }, [simulateAnalysis]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setAnalysisResults(null);
    setError(null);
    setIsAnalyzing(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (confidence) => {
    if (confidence >= 0.7) return 'text-red-600 bg-red-50 border-red-200';
    if (confidence >= 0.5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const formatConditionName = (condition) => {
    return condition.replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedX</h1>
                <p className="text-sm text-gray-600">AI Diagnostic System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
              <CheckCircleIcon className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!uploadedImage ? (
          // Welcome Section
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Chest X-Ray Analysis
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your chest X-ray image for comprehensive AI-powered diagnostic analysis. 
              Our system can detect 14+ medical conditions with high accuracy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <EyeIcon className="w-6 h-6 text-cyan-600" />
                </div>
                <span className="text-gray-700 font-medium">AI-Powered Detection</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DocumentIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-gray-700 font-medium">Detailed Reports</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HeartIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Clinical Grade</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Upload Section */}
        {!uploadedImage && (
          <div className="max-w-4xl mx-auto">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-50' 
                  : 'border-gray-300 bg-white hover:border-cyan-300 hover:bg-cyan-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <CloudArrowUpIcon className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Upload Chest X-Ray Image
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your X-ray image here, or click to select
                  </p>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                >
                  Select Image File
                </button>
                
                <p className="text-sm text-gray-500">
                  Supports JPEG, PNG, and other image formats
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {uploadedImage && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Header with Reset Button */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
                <button
                  onClick={resetAnalysis}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span>New Analysis</span>
                </button>
              </div>

              {/* Loading State */}
              {isAnalyzing && (
                <div className="text-center py-12">
                  <div className="animate-spin mx-auto w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full mb-4"></div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Analyzing X-Ray Image</h4>
                  <p className="text-gray-600 mb-4">Processing with AI diagnostic algorithms...</p>
                  
                  <div className="max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% Complete</p>
                </div>
              )}

              {/* Results Display */}
              {analysisResults && !isAnalyzing && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Original X-Ray</h4>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <img 
                        src={uploadedImage} 
                        alt="Chest X-Ray" 
                        className="w-full rounded-lg shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Findings Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Diagnostic Findings
                    </h4>
                    
                    {analysisResults.findings.some(f => f.condition === 'No Finding') ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                          <h5 className="text-lg font-medium text-green-800">Normal Result</h5>
                        </div>
                        <p className="text-green-700">
                          No significant pathological findings detected.
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Confidence: {(analysisResults.findings[0].confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-orange-800 mb-1">
                            Potential Abnormalities Detected
                          </h5>
                          <p className="text-sm text-orange-700">
                            Please consult with a healthcare professional for proper diagnosis.
                          </p>
                        </div>
                        
                        {analysisResults.findings.map((finding, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${getSeverityColor(finding.confidence)}`}
                          >
                            <div className="flex items-center justify-between">
                              <h6 className="font-medium">
                                {formatConditionName(finding.condition)}
                              </h6>
                              <span className="text-sm font-medium">
                                {(finding.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  finding.confidence >= 0.7 ? 'bg-red-400' :
                                  finding.confidence >= 0.5 ? 'bg-orange-400' : 'bg-yellow-400'
                                }`}
                                style={{ width: `${finding.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only 
                        and should not replace professional medical diagnosis. Please consult a qualified 
                        healthcare provider for proper medical evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChestXRayAnalyzer;
```

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

## Tailwind CSS Configuration

Create `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': {
          50: '#f0f9ff',
          500: '#0891b2',
          600: '#0e7490',
        },
        'medical-green': {
          50: '#f0fdf4',
          500: '#059669',
          600: '#047857',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
```

## Usage Instructions

1. **Install Dependencies:**
   ```bash
   npm install react react-dom @heroicons/react
   npm install -D tailwindcss autoprefixer postcss
   ```

2. **Setup Tailwind CSS:**
   ```bash
   npx tailwindcss init -p
   ```

3. **Add to your main CSS file:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Import and use the component:**
   ```jsx
   import ChestXRayAnalyzer from './components/ChestXRayAnalyzer';
   
   function App() {
     return <ChestXRayAnalyzer />;
   }
   ```

## Backend Integration

To connect with your Python backend, modify the `startAnalysis` function:

```jsx
const startAnalysis = async () => {
  setIsAnalyzing(true);
  setProgress(0);
  
  const formData = new FormData();
  // Convert base64 to blob first
  const response = await fetch(uploadedImage);
  const blob = await response.blob();
  formData.append('image', blob, 'xray.jpg');
  
  try {
    const result = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await result.json();
    setAnalysisResults(data);
  } catch (error) {
    setError('Analysis failed. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

## Key Features

- **Professional Medical UI/UX** with blue-green healthtech theme
- **Drag & Drop Upload** with visual feedback
- **Real-time Progress Tracking** during analysis
- **Comprehensive Results Display** with confidence scores
- **Responsive Design** for all device sizes
- **Error Handling** and user-friendly messages
- **Medical Disclaimer** for compliance
- **Clean Architecture** with reusable components

This React + Tailwind implementation provides the exact professional medical interface you requested with great UI/UX and your preferred blue-green color scheme.