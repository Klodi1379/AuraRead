import React from 'react';
import DocumentList from '../components/documents/DocumentList';

const DocumentsPage = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;