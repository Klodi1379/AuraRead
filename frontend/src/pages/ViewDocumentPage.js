import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from '../components/documents/DocumentViewer';
import EnhancedDocumentViewer from '../components/documents/EnhancedDocumentViewer';
import SmartDocumentViewer from '../components/documents/SmartDocumentViewer';
import { FaBrain, FaBolt, FaFileAlt, FaInfoCircle } from 'react-icons/fa';

const ViewDocumentPage = () => {
  const [viewerType, setViewerType] = useState('smart'); // 'standard', 'enhanced', 'smart'
  const [showViewerInfo, setShowViewerInfo] = useState(false);

  // Load saved preference from localStorage if available
  useEffect(() => {
    const savedViewerType = localStorage.getItem('preferredViewerType');
    if (savedViewerType) {
      setViewerType(savedViewerType);
    }
  }, []);

  // Save preference to localStorage when changed
  const handleViewerChange = (type) => {
    setViewerType(type);
    localStorage.setItem('preferredViewerType', type);
  };

  const renderViewer = () => {
    switch (viewerType) {
      case 'standard':
        return <DocumentViewer />;
      case 'enhanced':
        return <EnhancedDocumentViewer />;
      case 'smart':
      default:
        return <SmartDocumentViewer />;
    }
  };

  const viewerInfo = {
    smart: {
      title: 'Smart Viewer',
      description: 'Combines AI features with enhanced TTS. Includes AI summaries, question answering, and modern UI.',
      features: ['AI Summaries', 'Question Answering', 'Text-to-Speech', 'Modern UI']
    },
    enhanced: {
      title: 'Enhanced Viewer',
      description: 'Improved reading experience with Windows TTS support, annotations, and customizable display options.',
      features: ['Windows TTS Support', 'Annotations', 'Customizable Display', 'Reading Preferences']
    },
    standard: {
      title: 'Standard Viewer',
      description: 'Basic document viewer with simple TTS and annotation features.',
      features: ['Basic TTS', 'Simple Annotations', 'Lightweight Interface']
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <nav className="border-b border-gray-200 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link to="/documents" className="btn btn-secondary inline-flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kthehu tek Dokumentet
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowViewerInfo(!showViewerInfo)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="View information about different viewer modes"
            >
              <FaInfoCircle />
            </button>

            {showViewerInfo && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white shadow-lg rounded-lg border border-gray-200 z-10 p-4">
                <h3 className="font-medium text-gray-900 mb-2">Viewer Types</h3>
                {Object.entries(viewerInfo).map(([key, info]) => (
                  <div key={key} className={`mb-3 p-2 rounded ${viewerType === key ? 'bg-blue-50 border border-blue-100' : ''}`}>
                    <h4 className="font-medium text-gray-800">{info.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{info.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {info.features.map(feature => (
                        <span key={feature} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewerChange('smart')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                viewerType === 'smart'
                  ? 'bg-white shadow-sm text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaBrain className="text-blue-500" />
              <span>Smart</span>
            </button>

            <button
              onClick={() => handleViewerChange('enhanced')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                viewerType === 'enhanced'
                  ? 'bg-white shadow-sm text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaBolt className="text-yellow-500" />
              <span>Enhanced</span>
            </button>

            <button
              onClick={() => handleViewerChange('standard')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                viewerType === 'standard'
                  ? 'bg-white shadow-sm text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFileAlt className="text-gray-500" />
              <span>Standard</span>
            </button>
          </div>
        </div>
      </nav>

      {renderViewer()}
    </div>
  );
};

export default ViewDocumentPage;