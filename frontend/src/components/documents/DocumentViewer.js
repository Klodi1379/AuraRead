import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchDocument, extractDocumentText } from '../../store/documentsSlice';
import { fetchAnnotations, createAnnotation } from '../../store/annotationsSlice';
import { documentService } from '../../services/api';

// Helper to format error message
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.message) return error.message;
  return 'An unknown error occurred';
};

const DocumentViewer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const contentRef = useRef(null);

  const [selectedText, setSelectedText] = useState('');
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const {
    currentDocument,
    extractedText,
    loading: docLoading,
    textLoading,
    error: docError
  } = useSelector((state) => state.documents);

  const {
    annotations,
    loading: annoLoading,
    error: annoError
  } = useSelector((state) => state.annotations);

  useEffect(() => {
    if (id) {
      dispatch(fetchDocument(id));
      dispatch(fetchAnnotations(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Fetch the extracted text once we have the document
    if (currentDocument && currentDocument.id && !extractedText) {
      dispatch(extractDocumentText(currentDocument.id));
    }
  }, [dispatch, currentDocument, extractedText]);

  const handleTextSelection = () => {
    if (window.getSelection && !isAnnotating) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selection.rangeCount > 0) {
        setSelectedText(selectedText);
      }
    }
  };

  const startAnnotation = () => {
    if (selectedText) {
      setIsAnnotating(true);
    }
  };

  const cancelAnnotation = () => {
    setIsAnnotating(false);
    setSelectedText('');
    setAnnotationNote('');
  };

  const saveAnnotation = () => {
    if (!selectedText || !extractedText) return;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textContent = extractedText;

    // More robust approach to find the text position
    // Try to find the exact match first
    let startOffset = textContent.indexOf(selectedText);

    // If exact match fails, try to normalize whitespace
    if (startOffset === -1) {
      const normalizedText = textContent.replace(/\s+/g, ' ');
      const normalizedSelection = selectedText.replace(/\s+/g, ' ');
      startOffset = normalizedText.indexOf(normalizedSelection);

      // If still not found, log error but continue with a fallback
      if (startOffset === -1) {
        console.error('Could not determine exact text position, using approximate method');
        // Use the selection's container node to get an approximate position
        const container = range.startContainer;
        const containerText = container.textContent;
        const containerOffset = textContent.indexOf(containerText);

        if (containerOffset !== -1) {
          startOffset = containerOffset + range.startOffset;
        } else {
          console.error('Failed to find text position, annotation may be inaccurate');
          // Last resort: just use the first 100 chars as context
          const context = selectedText.substring(0, 100);
          startOffset = textContent.indexOf(context);
          if (startOffset === -1) {
            console.error('Could not determine text position at all');
            return;
          }
        }
      }
    }

    const endOffset = startOffset + selectedText.length;

    const annotationData = {
      document: parseInt(id),
      start_offset: startOffset,
      end_offset: endOffset,
      selected_text: selectedText,
      note: annotationNote,
      highlight_color: 'yellow', // Default color
    };

    dispatch(createAnnotation(annotationData));
    cancelAnnotation();
  };

  const playTextAudio = async () => {
    setAudioError(null);
    try {
      let textToRead = selectedText;
      if (!textToRead) {
        // If no text is selected, read the entire document
        textToRead = extractedText;
      }

      // Use the API service to convert text to speech
      const response = await documentService.convertToSpeech(id, textToRead);

      // The response.data is already a blob due to responseType: 'blob' in the API service
      const blob = response.data;

      // Create a URL for the blob
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            setAudioError(`Error playing audio: ${err.message}`);
            setIsPlaying(false);
          });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(formatErrorMessage(error));
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const renderDocumentWithAnnotations = () => {
    if (!extractedText) return null;

    let text = extractedText;

    // Sort annotations by start_offset in descending order to avoid offset shifts
    const sortedAnnotations = [...annotations].sort((a, b) => b.start_offset - a.start_offset);

    for (const annotation of sortedAnnotations) {
      const { start_offset, end_offset } = annotation;
      const beforeText = text.substring(0, start_offset);
      const highlightedText = text.substring(start_offset, end_offset);
      const afterText = text.substring(end_offset);

      text = beforeText + `<span class="highlight" data-annotation-id="${annotation.id}" title="${annotation.note}">${highlightedText}</span>` + afterText;
    }

    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  if (docLoading) return <div>Loading document...</div>;
  if (textLoading) return <div>Extracting document text...</div>;
  if (docError) return <div>Error loading document: {docError}</div>;
  if (annoError) return <div>Error loading annotations: {annoError}</div>;
  if (!currentDocument) return <div>Document not found</div>;
  if (!extractedText) return <div>No text could be extracted from this document</div>;

  return (
    <div className="document-viewer">
      <h2>{currentDocument.title}</h2>

      {audioError && <div className="error-message">{audioError}</div>}

      <div className="viewer-controls">
        <button onClick={playTextAudio} disabled={isPlaying}>
          {selectedText ? 'Read Selection' : 'Read Document'}
        </button>
        {isPlaying && (
          <button onClick={stopAudio}>Stop</button>
        )}
        {selectedText && !isAnnotating && (
          <button onClick={startAnnotation}>
            Annotate Selection
          </button>
        )}
      </div>

      {isAnnotating && (
        <div className="annotation-form">
          <h3>Create Annotation</h3>
          <p><strong>Selected text:</strong> {selectedText}</p>
          <div className="form-group">
            <label htmlFor="annotation-note">Notes:</label>
            <textarea
              id="annotation-note"
              value={annotationNote}
              onChange={(e) => setAnnotationNote(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button onClick={saveAnnotation}>Save</button>
            <button onClick={cancelAnnotation}>Cancel</button>
          </div>
        </div>
      )}

      <div className="document-content" onMouseUp={handleTextSelection} ref={contentRef}>
        {renderDocumentWithAnnotations()}
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} onEnded={() => setIsPlaying(false)} />

      <div className="annotations-panel">
        <h3>Annotations</h3>
        {annotations.length === 0 ? (
          <p>No annotations yet. Select text to create annotations.</p>
        ) : (
          <ul>
            {annotations.map((annotation) => (
              <li key={annotation.id} className="annotation-item">
                <div className="annotation-text">"{annotation.selected_text}"</div>
                {annotation.note && <div className="annotation-note">{annotation.note}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;