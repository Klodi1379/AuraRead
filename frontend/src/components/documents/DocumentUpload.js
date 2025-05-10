import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../../store/documentsSlice';

const DocumentUpload = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.documents);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setFileError('Please select a PDF file');
      setFile(null);
      return;
    }
    
    setFileError('');
    setFile(selectedFile);
    
    // If no title is set yet, use the filename (without extension) as default title
    if (!title && selectedFile) {
      const fileName = selectedFile.name;
      const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
      setTitle(fileNameWithoutExt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a PDF file');
      return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    
    try {
      await dispatch(uploadDocument(formData)).unwrap();
      navigate('/documents');
    } catch (err) {
      // Error is handled by the slice
    }
  };

  return (
    <div className="document-upload">
      <h2>Upload Document</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Document Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="file">PDF File</label>
          <input
            type="file"
            id="file"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
          {fileError && <div className="error-message">{fileError}</div>}
        </div>
        
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;
