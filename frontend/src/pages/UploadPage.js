import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpTrayIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const navigate = useNavigate();

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = ['application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        success: false,
        message: 'Only PDF files are supported.'
      });
      return;
    }
    
    setFile(file);
    
    // Extract title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    setTitle(fileName);
    setUploadStatus(null);
  };

  const handleTagAdd = () => {
    if (newTag.trim() !== '' && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API call to upload document
    setUploadStatus({ loading: true });
    
    setTimeout(() => {
      setUploadStatus({
        success: true,
        message: 'Document uploaded successfully!'
      });
      
      // Redirect after successful upload
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="bg-primary-600 px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-white">Upload Document</h1>
          <p className="mt-2 text-primary-100">
            Upload PDF documents to your library
          </p>
        </div>
        
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              } transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="space-y-3">
                  <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <div className="text-gray-600">
                    <p className="font-medium">
                      Drag and drop your PDF file
                    </p>
                    <p className="text-sm text-gray-500">Or click to browse</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload').click()}
                    className="btn btn-primary inline-flex items-center mt-2"
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    Browse Files
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <DocumentIcon className="h-12 w-12 mx-auto text-primary-600" />
                  <p className="font-medium text-primary-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="btn btn-secondary text-sm px-3 py-1 inline-flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1.5" />
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {/* Document Info */}
            {file && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="label">
                    Document Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="label">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    rows="3"
                    className="input resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">Tags (optional)</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <TagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="input pl-10"
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleTagAdd();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="btn btn-secondary"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-600 focus:outline-none"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Upload Status */}
            {uploadStatus && !uploadStatus.loading && (
              <div
                className={`p-4 rounded-md ${
                  uploadStatus.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {uploadStatus.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        uploadStatus.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {uploadStatus.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Link
                to="/documents"
                className="btn btn-secondary inline-flex items-center justify-center order-2 sm:order-1"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Documents
              </Link>
              <div className="order-1 sm:order-2 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setTitle('');
                    setDescription('');
                    setTags([]);
                    setUploadStatus(null);
                  }}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!file || !title || uploadStatus?.loading}
                  className={`btn btn-primary ${
                    uploadStatus?.loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadStatus?.loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadPage;