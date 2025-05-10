import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchDocument, extractDocumentText, updateDocument } from '../../store/documentsSlice';
import { fetchAnnotations, createAnnotation } from '../../store/annotationsSlice';
import { documentService } from '../../services/api';
import { FaFont, FaSearch, FaSearchMinus, FaSearchPlus, FaColumns, FaExpand, FaCompress, FaLanguage } from 'react-icons/fa';
import '../../styles/DocumentViewer.css';

// Helper to format error message
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.message) return error.message;
  return 'An unknown error occurred';
};

// Font options
const fontOptions = [
  { name: 'Default', value: 'inherit' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Sans-serif', value: 'Arial, sans-serif' },
  { name: 'Monospace', value: 'Courier New, monospace' },
  { name: 'Dyslexic', value: 'OpenDyslexic, sans-serif' },
];

// Language options for TTS
const languageOptions = [
  { name: 'English', code: 'en' },
  { name: 'Albanian', code: 'sq' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Spanish', code: 'es' },
  { name: 'Greek', code: 'el' },
];

// TTS engine options
const ttsEngineOptions = [
  { name: 'Offline (Local)', value: true, description: 'Uses your computer\'s built-in TTS engine. Works without internet but may have limited language support.' },
  { name: 'Online (Google)', value: false, description: 'Uses Google\'s TTS service. Better quality but requires internet and may have rate limits.' },
];

const EnhancedDocumentViewer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const contentRef = useRef(null);
  const resizeRef = useRef(null);

  // Document content states
  const [selectedText, setSelectedText] = useState('');
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');

  // Audio states
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [preferOfflineTTS, setPreferOfflineTTS] = useState(true);
  const [availableVoices, setAvailableVoices] = useState({ windows_sapi: [], pyttsx3: [] });
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [highlightedText, setHighlightedText] = useState(null);
  const [currentSentence, setCurrentSentence] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [cachedAudio, setCachedAudio] = useState({});

  // Reading preferences states
  const [fontSize, setFontSize] = useState(16); // in pixels
  const [fontFamily, setFontFamily] = useState(fontOptions[0].value);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [contentWidth, setContentWidth] = useState('100%');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light', 'sepia', 'dark'

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

  // Set current language when document loads
  useEffect(() => {
    if (currentDocument && currentDocument.language) {
      setCurrentLanguage(currentDocument.language);
    }
  }, [currentDocument]);

  // Fetch available voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoadingVoices(true);
        const response = await documentService.getAvailableVoices();
        setAvailableVoices(response.data);

        // Set a default voice if available
        if (response.data.windows_sapi && response.data.windows_sapi.length > 0) {
          // Try to find a voice matching the current language
          const langCode = currentLanguage.toLowerCase().replace('_', '-');
          const matchingVoice = response.data.windows_sapi.find(
            voice => voice.language.toLowerCase().includes(langCode)
          );

          if (matchingVoice) {
            setSelectedVoice(matchingVoice.id);
          } else {
            // Default to the first voice
            setSelectedVoice(response.data.windows_sapi[0].id);
          }
        }

        setLoadingVoices(false);
      } catch (error) {
        console.error('Error fetching voices:', error);
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [currentLanguage]);

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Text selection handler
  const handleTextSelection = () => {
    if (window.getSelection && !isAnnotating) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selection.rangeCount > 0) {
        setSelectedText(selectedText);
      }
    }
  };

  // Font size handlers
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  // Line height handlers
  const increaseLineHeight = () => setLineHeight(prev => Math.min(prev + 0.2, 3.0));
  const decreaseLineHeight = () => setLineHeight(prev => Math.max(prev - 0.2, 1.0));

  // Content width handlers
  const increaseWidth = () => {
    if (contentWidth === '100%') return;
    const currentWidth = parseInt(contentWidth);
    setContentWidth(`${Math.min(currentWidth + 10, 100)}%`);
  };

  const decreaseWidth = () => {
    if (contentWidth === '100%') {
      setContentWidth('80%');
      return;
    }
    const currentWidth = parseInt(contentWidth);
    setContentWidth(`${Math.max(currentWidth - 10, 50)}%`);
  };

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (contentRef.current.requestFullscreen) {
        contentRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Theme handler
  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'sepia';
      if (current === 'sepia') return 'dark';
      return 'light';
    });
  };

  // Language handler
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setCurrentLanguage(newLanguage);

    // Update the document language in the database
    if (currentDocument && currentDocument.id) {
      dispatch(updateDocument({
        id: currentDocument.id,
        data: { language: newLanguage }
      }));
    }
  };

  // TTS engine handler
  const handleTTSEngineChange = (e) => {
    const value = e.target.value === 'true'; // Convert string to boolean
    setPreferOfflineTTS(value);

    // Clear audio cache when changing engines
    setCachedAudio({});
  };

  // Voice selection handler
  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);

    // Clear audio cache when changing voice
    setCachedAudio({});
  };

  // Annotation handlers
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

  // Split text into sentences
  const splitIntoSentences = (text) => {
    // Simple sentence splitting - can be improved for more complex cases
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  };

  // Split sentence into words
  const splitIntoWords = (sentence) => {
    return sentence.trim().split(/\s+/);
  };

  // Find the current sentence and word position
  const findTextPosition = (text, word, sentenceIndex = 0) => {
    const sentences = splitIntoSentences(text);
    if (sentences.length === 0 || sentenceIndex >= sentences.length) return null;

    const currentSentence = sentences[sentenceIndex];
    const sentenceStart = text.indexOf(currentSentence);
    if (sentenceStart === -1) return null;

    const sentenceEnd = sentenceStart + currentSentence.length;

    // Find the word position within the sentence
    const wordStart = currentSentence.indexOf(word);
    if (wordStart === -1) return null;

    const wordEnd = wordStart + word.length;

    return {
      sentenceStart: sentenceStart,
      sentenceEnd: sentenceEnd,
      wordStart: sentenceStart + wordStart,
      wordEnd: sentenceStart + wordEnd
    };
  };

  // Highlight the current word being read
  const highlightCurrentWord = () => {
    if (!currentSentence || wordIndex < 0) return;

    const words = splitIntoWords(currentSentence);
    if (wordIndex >= words.length) return;

    const word = words[wordIndex];
    setHighlightedText({
      word: word,
      sentence: currentSentence
    });

    // Move to next word after a delay (approximating speech rate)
    const wordDuration = (word.length * 80) + 200; // Rough estimate: 80ms per character + 200ms base
    setTimeout(() => {
      setWordIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= words.length) {
          return -1; // End of sentence
        }
        return nextIndex;
      });
    }, wordDuration);
  };

  // Generate a cache key for audio
  const getAudioCacheKey = (text, language) => {
    // Use a short hash of the text to keep the key manageable
    const textHash = text.length + '_' + text.substring(0, 20).replace(/\s+/g, '_');
    // Include the TTS engine preference and voice in the cache key
    const voiceKey = selectedVoice ? selectedVoice.split('\\').pop() : 'default';
    return `${language}_${preferOfflineTTS ? 'offline' : 'online'}_${voiceKey}_${textHash}`;
  };

  // Audio handlers
  const playTextAudio = async () => {
    setAudioError(null);
    setIsLoadingAudio(true);

    try {
      let textToRead = selectedText;
      if (!textToRead) {
        // If no text is selected, read the entire document
        textToRead = extractedText;
      }

      // Limit text length to avoid rate limiting issues
      const maxTextLength = 1000; // Limit to 1000 characters
      if (textToRead.length > maxTextLength) {
        console.log(`Text too long (${textToRead.length} chars), truncating to ${maxTextLength} chars`);
        textToRead = textToRead.substring(0, maxTextLength) + "...";
      }

      // Set the current sentence and prepare for word highlighting
      setCurrentSentence(textToRead);
      setWordIndex(0);

      // Start highlighting words immediately
      highlightCurrentWord();

      // Check if we have this audio in cache
      const cacheKey = getAudioCacheKey(textToRead, currentLanguage);
      let audioBlob;
      let url;

      if (cachedAudio[cacheKey]) {
        console.log('Using cached audio');
        url = cachedAudio[cacheKey];
      } else {
        try {
          console.log(`Using ${preferOfflineTTS ? 'offline' : 'online'} TTS engine`);

          // Use the API service to convert text to speech with the current language, engine preference, and voice
          const response = await documentService.convertToSpeech(
            id,
            textToRead,
            currentLanguage,
            preferOfflineTTS,
            selectedVoice
          );

          // The response.data is already a blob due to responseType: 'blob' in the API service
          audioBlob = response.data;

          // Create a URL for the blob
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }

          url = URL.createObjectURL(audioBlob);

          // Cache the audio URL
          setCachedAudio(prev => ({
            ...prev,
            [cacheKey]: url
          }));
        } catch (error) {
          console.error('Error converting text to speech:', error);

          // Check if the error is related to rate limiting
          const errorMessage = error.response?.data?.error || error.message;
          if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
            throw new Error('Google TTS rate limit reached. Please try again later or with a smaller text selection, or switch to the offline TTS engine.');
          } else {
            throw error;
          }
        }
      }

      setAudioUrl(url);
      setIsLoadingAudio(false);

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
            setIsLoadingAudio(false);
            // Reset highlighting
            setHighlightedText(null);
            setWordIndex(-1);
          });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(formatErrorMessage(error));
      setIsPlaying(false);
      setIsLoadingAudio(false);
      // Reset highlighting
      setHighlightedText(null);
      setWordIndex(-1);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);

      // Reset highlighting
      setHighlightedText(null);
      setWordIndex(-1);
    }
  };

  // Effect to update word highlighting when wordIndex changes
  useEffect(() => {
    if (isPlaying && wordIndex >= 0) {
      highlightCurrentWord();
    }
  }, [wordIndex, isPlaying]);

  // Render document with annotations and TTS highlighting
  const renderDocumentWithAnnotations = () => {
    if (!extractedText) return null;

    let text = extractedText;

    // Sort annotations by start_offset in descending order to avoid offset shifts
    const sortedAnnotations = [...annotations].sort((a, b) => b.start_offset - a.start_offset);

    // Add annotation highlights
    for (const annotation of sortedAnnotations) {
      const { start_offset, end_offset } = annotation;
      const beforeText = text.substring(0, start_offset);
      const highlightedText = text.substring(start_offset, end_offset);
      const afterText = text.substring(end_offset);

      text = beforeText + `<span class="highlight annotation" data-annotation-id="${annotation.id}" title="${annotation.note}">${highlightedText}</span>` + afterText;
    }

    // Add TTS sentence and word highlighting if active
    if (isPlaying && highlightedText && highlightedText.word && highlightedText.sentence) {
      // Find the positions of the current sentence and word
      const positions = findTextPosition(text, highlightedText.word);

      if (positions) {
        // Insert the sentence highlight first (from end to start to avoid offset shifts)
        const beforeSentence = text.substring(0, positions.sentenceStart);
        const sentenceText = text.substring(positions.sentenceStart, positions.sentenceEnd);
        const afterSentence = text.substring(positions.sentenceEnd);

        // Then insert the word highlight
        const sentenceBeforeWord = sentenceText.substring(0, positions.wordStart - positions.sentenceStart);
        const wordText = sentenceText.substring(positions.wordStart - positions.sentenceStart, positions.wordEnd - positions.sentenceStart);
        const sentenceAfterWord = sentenceText.substring(positions.wordEnd - positions.sentenceStart);

        const highlightedSentence =
          sentenceBeforeWord +
          `<span class="highlight tts-word">${wordText}</span>` +
          sentenceAfterWord;

        text = beforeSentence +
               `<span class="highlight tts-sentence">${highlightedSentence}</span>` +
               afterSentence;
      }
    }

    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  // Loading and error states
  if (docLoading) return <div>Loading document...</div>;
  if (textLoading) return <div>Extracting document text...</div>;
  if (docError) return <div>Error loading document: {docError}</div>;
  if (annoError) return <div>Error loading annotations: {annoError}</div>;
  if (!currentDocument) return <div>Document not found</div>;
  if (!extractedText) return <div>No text could be extracted from this document</div>;

  // Compute content style based on user preferences
  const contentStyle = {
    fontSize: `${fontSize}px`,
    fontFamily,
    lineHeight,
    width: contentWidth,
    margin: contentWidth === '100%' ? '0' : '0 auto',
  };

  // Compute container class based on theme
  const containerClass = `document-viewer ${theme}-theme ${isFullscreen ? 'fullscreen' : ''}`;

  return (
    <div className={containerClass}>
      <h2>{currentDocument.title}</h2>

      {audioError && (
        <div className="error-message">
          <strong>Audio Error:</strong> {audioError}
          {audioError.includes('rate limit') && (
            <div className="error-help">
              <p>The Text-to-Speech service is currently rate limited. Try these solutions:</p>
              <ul>
                <li><strong>Switch to the Offline TTS engine</strong> using the dropdown below</li>
                <li>Select a smaller portion of text to read</li>
                <li>Wait a few minutes before trying again</li>
                <li>Try a different language</li>
              </ul>
            </div>
          )}
          {!preferOfflineTTS && audioError.includes('Error generating speech') && (
            <div className="error-help">
              <p>There was an error with the online TTS service. Try switching to the offline TTS engine.</p>
            </div>
          )}
          {preferOfflineTTS && audioError.includes('Error generating speech') && (
            <div className="error-help">
              <p>There was an error with the offline TTS engine. This could be due to:</p>
              <ul>
                <li>Missing or incompatible speech engine on your computer</li>
                <li>The selected language may not be supported by your local TTS engine</li>
                <li>Try switching to the online TTS engine</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reading controls */}
      <div className="reading-controls-toggle">
        <button onClick={() => setShowControls(!showControls)} className="control-toggle-btn">
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>

      {showControls && (
        <div className="reading-controls">
          <div className="control-group">
            <button onClick={decreaseFontSize} title="Decrease font size" className="icon-button">
              <FaSearchMinus size={20} /> <span className="button-text">Smaller</span>
            </button>
            <span className="font-size-display">{fontSize}px</span>
            <button onClick={increaseFontSize} title="Increase font size" className="icon-button">
              <FaSearchPlus size={20} /> <span className="button-text">Larger</span>
            </button>
          </div>

          <div className="control-group">
            <label htmlFor="font-select" className="control-label">Font:</label>
            <select
              id="font-select"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="font-select"
            >
              {fontOptions.map(font => (
                <option key={font.name} value={font.value}>{font.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button onClick={decreaseWidth} title="Decrease width" className="icon-button">
              <FaCompress size={20} /> <span className="button-text">Narrow</span>
            </button>
            <button onClick={increaseWidth} title="Increase width" className="icon-button">
              <FaExpand size={20} /> <span className="button-text">Wide</span>
            </button>
          </div>

          <div className="control-group">
            <button onClick={toggleTheme} title="Change theme" className="theme-button">
              <span className="theme-indicator" data-theme={theme}></span>
              <span className="button-text">Theme: {theme}</span>
            </button>
          </div>

          <div className="control-group">
            <button onClick={toggleFullscreen} title="Toggle fullscreen" className="icon-button">
              {isFullscreen ?
                <><FaCompress size={20} /> <span className="button-text">Exit Fullscreen</span></> :
                <><FaExpand size={20} /> <span className="button-text">Fullscreen</span></>
              }
            </button>
          </div>
        </div>
      )}

      <div className="document-container">
        {/* Left side: Document content */}
        <div className="document-main">
          {/* Audio controls */}
          <div className="viewer-controls">
            <div className="audio-controls">
              <button
                onClick={playTextAudio}
                disabled={isPlaying || isLoadingAudio}
                className={`audio-button ${isLoadingAudio ? 'loading' : ''}`}
              >
                {isLoadingAudio ? 'Loading...' : (selectedText ? 'Read Selection' : 'Read Document')}
              </button>
              {isPlaying && (
                <button onClick={stopAudio} className="audio-button stop">Stop</button>
              )}
            </div>

            <div className="language-selector">
              <label htmlFor="language-select" className="control-label">
                <FaLanguage size={20} /> TTS Language:
              </label>
              <select
                id="language-select"
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="language-select"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="tts-engine-selector">
              <label htmlFor="tts-engine-select" className="control-label">
                TTS Engine:
              </label>
              <select
                id="tts-engine-select"
                value={preferOfflineTTS.toString()}
                onChange={handleTTSEngineChange}
                className="tts-engine-select"
              >
                {ttsEngineOptions.map(engine => (
                  <option key={engine.name} value={engine.value.toString()}>
                    {engine.name}
                  </option>
                ))}
              </select>
              <div className="tts-engine-description">
                {ttsEngineOptions.find(engine => engine.value === preferOfflineTTS)?.description}
              </div>
            </div>

            {/* Voice selector - only show when offline engine is selected */}
            {preferOfflineTTS && (
              <div className="voice-selector">
                <label htmlFor="voice-select" className="control-label">
                  Voice:
                </label>
                {loadingVoices ? (
                  <span className="loading-voices">Loading voices...</span>
                ) : (
                  <select
                    id="voice-select"
                    value={selectedVoice || ''}
                    onChange={handleVoiceChange}
                    className="voice-select"
                    disabled={loadingVoices}
                  >
                    <optgroup label="Windows Voices">
                      {availableVoices.windows_sapi && availableVoices.windows_sapi.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.language})
                        </option>
                      ))}
                    </optgroup>
                    {availableVoices.pyttsx3 && availableVoices.pyttsx3.length > 0 && (
                      <optgroup label="System Voices">
                        {availableVoices.pyttsx3.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} ({voice.language})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
              </div>
            )}

            {selectedText && !isAnnotating && (
              <button onClick={startAnnotation} className="annotate-button">
                Annotate Selection
              </button>
            )}
          </div>

          {/* Annotation form */}
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

          {/* Document content */}
          <div
            className="document-content"
            onMouseUp={handleTextSelection}
            ref={contentRef}
            style={contentStyle}
          >
            {renderDocumentWithAnnotations()}
          </div>

          {/* Audio element */}
          <audio ref={audioRef} style={{ display: 'none' }} onEnded={() => setIsPlaying(false)} />
        </div>

        {/* Right side: Annotations panel */}
        <div className="annotations-sidebar">
          <div className="annotations-panel">
            <h3>Annotations</h3>
            {annotations.length === 0 ? (
              <p>No annotations yet. Select text to create annotations.</p>
            ) : (
              <ul className="annotations-list">
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
      </div>
    </div>
  );
};

export default EnhancedDocumentViewer;
