import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from '../components/documents/DocumentViewer';
import EnhancedDocumentViewer from '../components/documents/EnhancedDocumentViewer';

const ViewDocumentPage = () => {
  const [useEnhancedViewer, setUseEnhancedViewer] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <nav className="border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <Link to="/documents" className="btn btn-secondary inline-flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Documents
        </Link>
        <button
          className="btn inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => setUseEnhancedViewer(!useEnhancedViewer)}
        >
          {useEnhancedViewer ? 'Switch to Standard Viewer' : 'Switch to Enhanced Viewer'}
        </button>
      </nav>

      {useEnhancedViewer ? <EnhancedDocumentViewer /> : <DocumentViewer />}
    </div>
  );
};

export default ViewDocumentPage;