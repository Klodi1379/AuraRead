import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDocuments, deleteDocument } from '../../store/documentsSlice';
import { documentService } from '../../services/api';
import {
  FaBook,
  FaCalendarAlt,
  FaEye,
  FaTrashAlt,
  FaUpload,
  FaFileAlt,
  FaLanguage,
  FaExclamationCircle,
  FaSearch,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt as FaFileGeneric
} from 'react-icons/fa';
import '../../styles/DocumentList.css';

const DocumentList = () => {
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.documents);
  const [localError, setLocalError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Function to generate a short description from document text
  const getDocumentPreview = (doc) => {
    if (doc.description) return doc.description;
    if (doc.text && doc.text.length > 0) {
      // Get first 150 characters of text as preview
      return doc.text.substring(0, 150) + (doc.text.length > 150 ? '...' : '');
    }
    return 'No preview available for this document.';
  };

  // Function to format date in a more readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If less than 1 day, show "Today" or "Yesterday"
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      // If less than a week, show the day of the week
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    } else if (diffDays < 365) {
      // If less than a year, show month and day
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else {
      // Otherwise show full date
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  // Function to get the appropriate icon for a document based on its type
  const getDocumentIcon = (doc) => {
    const filename = doc.file_name || doc.title || '';
    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="document-type-icon" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="document-type-icon" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="document-type-icon" />;
      default:
        return <FaFileGeneric className="document-type-icon" />;
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort documents based on selected option
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch(sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      case 'language':
        return (a.language || '').localeCompare(b.language || '');
      default:
        return 0;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching documents...');
        setLocalError(null);
        const resultAction = await dispatch(fetchDocuments()).unwrap();
        console.log('Documents fetched successfully:', resultAction);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setLocalError(err.toString());

        // Check if it's an authentication error
        if (err.includes('Authentication') || err.includes('credentials') || err.includes('token')) {
          setLocalError('Authentication error. Please try logging in again.');
        }
      }
    };

    fetchData();
  }, [dispatch]);

  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDocumentToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      setLocalError(null);
      await dispatch(deleteDocument(documentToDelete.id)).unwrap();
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      setLocalError(err.toString());
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="documents-page">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
      </div>
    </div>
  );

  if (error || localError) return (
    <div className="documents-page">
      <div className="error-container">
        <FaExclamationCircle className="error-icon" />
        <h2>Something went wrong</h2>
        <p>Error: {error || localError}</p>

        {(error || localError)?.includes('Authentication') ? (
          <div>
            <p>It looks like you may need to log in again.</p>
            <a href="/login" className="btn btn-primary">Go to Login</a>
          </div>
        ) : (
          <button onClick={() => dispatch(fetchDocuments())} className="btn btn-primary">
            Try Again
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="documents-page">
      <div className="documents-header">
        <h1>My Documents</h1>
        <Link to="/upload" className="btn btn-success">
          <FaUpload className="btn-icon" /> Upload New Document
        </Link>
      </div>

      {documents.length > 0 && (
        <div className="documents-toolbar">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="documents-count">
            {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
          <div className="sort-container">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Date (newest first)</option>
              <option value="title">Title (A-Z)</option>
              <option value="language">Language</option>
            </select>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt className="empty-state-icon" />
          <h2>No documents yet</h2>
          <p>
            Upload your first PDF document to start reading, annotating, and using
            text-to-speech features.
          </p>
          <Link to="/upload" className="btn btn-primary">
            <FaUpload className="btn-icon" /> Upload Your First Document
          </Link>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <FaSearch className="empty-state-icon" />
          <h2>No matching documents</h2>
          <p>
            No documents match your search criteria. Try adjusting your search term.
          </p>
          <button onClick={() => setSearchTerm('')} className="btn btn-primary">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="documents-container">
          {sortedDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-card-header">
                <div className="document-header-content">
                  {getDocumentIcon(doc)}
                  <h3 title={doc.title}>
                    <Link to={`/documents/${doc.id}`}>{doc.title}</Link>
                  </h3>
                </div>
              </div>
              <div className="document-card-body">
                <div className="document-info">
                  <div className="document-meta">
                    <div className="document-meta-item" title={new Date(doc.uploaded_at).toLocaleString()}>
                      <FaCalendarAlt />
                      <span>{formatDate(doc.uploaded_at)}</span>
                    </div>
                    {doc.language && (
                      <div className="document-meta-item">
                        <FaLanguage />
                        <span>{doc.language.toUpperCase()}</span>
                      </div>
                    )}
                    {doc.page_count > 0 && (
                      <div className="document-meta-item">
                        <FaBook />
                        <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                      </div>
                    )}
                  </div>
                  <div className="document-description">
                    {getDocumentPreview(doc)}
                  </div>
                </div>
              </div>
              <div className="document-card-footer">
                <div className="document-actions">
                  <Link to={`/documents/${doc.id}`} className="btn btn-primary">
                    <FaEye className="btn-icon" /> View
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(doc)}
                    className="btn btn-outline btn-danger"
                  >
                    <FaTrashAlt className="btn-icon" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="upload-container">
        <h2>Need to add more documents?</h2>
        <p>Upload PDF files to your library for easy access, annotation, and text-to-speech.</p>
        <Link to="/upload" className="btn btn-primary">
          <FaUpload className="btn-icon" /> Upload New Document
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && documentToDelete && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <div className="delete-confirm-header">
              <FaTrashAlt className="delete-icon" />
              <h3>Confirm Deletion</h3>
            </div>
            <div className="delete-confirm-body">
              <p>Are you sure you want to delete <strong>{documentToDelete.title}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-confirm-footer">
              <button
                onClick={handleCancelDelete}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-danger"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;