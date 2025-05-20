// Enhanced Document Viewer me AI dhe TTS të përmirësuar
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocument, extractDocumentText } from '../../store/documentsSlice';
import { fetchAnnotations, createAnnotation } from '../../store/annotationsSlice';
import {
  FaPlay, FaPause, FaStop, FaVolumeUp, FaRobot,
  FaBrain, FaHighlighter, FaBookmark, FaLanguage,
  FaExpand, FaCompress, FaFont, FaEye
} from 'react-icons/fa';

const SmartDocumentViewer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Document state
  const [selectedText, setSelectedText] = useState('');
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');

  // TTS state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // AI state
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Reading preferences
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState('light');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { currentDocument, extractedText, loading } = useSelector(state => state.documents);
  const { annotations } = useSelector(state => state.annotations);

  const contentRef = useRef(null);
  const audioRef = useRef(null);

  // Language options për TTS
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sq', name: 'Shqip' },
    { code: 'it', name: 'Italiano' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' }
  ];

  useEffect(() => {
    if (id) {
      dispatch(fetchDocument(id));
      dispatch(fetchAnnotations(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentDocument && !extractedText) {
      dispatch(extractDocumentText(id));
    }
  }, [currentDocument, extractedText, dispatch, id]);

  const handleTTSPlay = async () => {
    if (!extractedText) return;

    setIsLoadingAudio(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Using token for TTS request:', token ? 'Token available' : 'No token');

      const response = await fetch(`/api/documents/${id}/tts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          text: extractedText,
          language: currentLanguage,
          prefer_offline: true
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.playbackRate = audioSpeed;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Gabim në TTS. Sigurohuni që serveri është duke punuar.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleTTSStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const generateAISummary = async () => {
    if (!extractedText) return;

    setIsLoadingAI(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/ai/summarize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: id,
          text: extractedText
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
        setKeyPoints(data.key_points || []);
      } else {
        setAiSummary('AI shërbimi nuk është i disponueshëm. Provoni më vonë.');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiSummary('Gabim në gjenerimin e përmbledhjes.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const askAIQuestion = async () => {
    if (!aiQuestion || !extractedText) return;

    setIsLoadingAI(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/ai/question/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: id,
          question: aiQuestion,
          text: extractedText
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnswer(data.answer);
      } else {
        setAiAnswer('AI shërbimi nuk mund të përgjigjej pyetjes.');
      }
    } catch (error) {
      console.error('AI Question Error:', error);
      setAiAnswer('Gabim në përgjigjen e pyetjes.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setIsAnnotating(true);
    }
  };

  const saveAnnotation = async () => {
    if (!selectedText || !annotationNote) return;

    try {
      const annotationData = {
        document: id,
        selected_text: selectedText,
        note: annotationNote,
        start_offset: 0, // Simplified for now
        end_offset: selectedText.length,
        highlight_color: 'yellow'
      };

      dispatch(createAnnotation(annotationData));
      setIsAnnotating(false);
      setSelectedText('');
      setAnnotationNote('');
    } catch (error) {
      console.error('Annotation error:', error);
    }
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-yellow-50 text-yellow-900',
    dark: 'bg-gray-900 text-gray-100'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Po ngarkohet dokumenti...</span>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${themeClasses[theme]}`}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Document Title */}
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {currentDocument?.title || 'Dokumenti'}
            </h1>
          </div>

          {/* Reading Controls */}
          <div className="flex items-center space-x-4">
            {/* Font Size */}
            <div className="flex items-center space-x-2">
              <FaFont className="text-gray-500" />
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-16"
              />
              <span className="text-sm text-gray-600">{fontSize}px</span>
            </div>

            {/* Theme Toggle */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="light">Light</option>
              <option value="sepia">Sepia</option>
              <option value="dark">Dark</option>
            </select>

            {/* Language Selection */}
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>

            {/* Audio Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2x</option>
              </select>

              <button
                onClick={isPlaying ? handleTTSStop : handleTTSPlay}
                disabled={isLoadingAudio}
                className="btn btn-primary flex items-center space-x-2"
              >
                {isLoadingAudio ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : isPlaying ? (
                  <FaPause />
                ) : (
                  <FaPlay />
                )}
                <span>{isPlaying ? 'Ndale' : 'Luaj Audio'}</span>
              </button>
            </div>

            {/* AI Toggle */}
            <button
              onClick={() => setShowAISidebar(!showAISidebar)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FaBrain />
              <span>AI Asistent</span>
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={contentRef}
            className="max-w-4xl mx-auto leading-relaxed"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              lineHeight: lineHeight
            }}
            onMouseUp={handleTextSelection}
          >
            {extractedText ? (
              <div className="prose prose-lg max-w-none">
                {extractedText.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                <p>Po ekstraktohet teksti nga PDF-ja...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      {showAISidebar && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaRobot className="mr-2 text-blue-500" />
            AI Asistent
          </h3>

          {/* Generate Summary */}
          <div className="mb-6">
            <button
              onClick={generateAISummary}
              disabled={isLoadingAI || !extractedText}
              className="btn btn-primary w-full mb-3 flex items-center justify-center space-x-2"
            >
              {isLoadingAI ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FaBrain />
              )}
              <span>Gjeneroj Përmbledhje</span>
            </button>

            {aiSummary && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Përmbledhja:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{aiSummary}</p>
              </div>
            )}

            {keyPoints.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-3">
                <h4 className="font-medium mb-2">Pikat Kryesore:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ask Questions */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Bëj një Pyetje:</h4>
            <div className="space-y-2">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Çfarë dëshiron të dësh për këtë dokument?"
                className="textarea textarea-sm w-full"
                rows="3"
              />
              <button
                onClick={askAIQuestion}
                disabled={!aiQuestion || isLoadingAI}
                className="btn btn-sm btn-primary w-full"
              >
                Pyet AI-n
              </button>
            </div>

            {aiAnswer && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-3">
                <h5 className="font-medium mb-1">Përgjigja:</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annotation Modal */}
      {isAnnotating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Shto Shënim</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Teksti i zgjedhur:</p>
              <p className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded text-sm">
                "{selectedText}"
              </p>
            </div>
            <textarea
              value={annotationNote}
              onChange={(e) => setAnnotationNote(e.target.value)}
              placeholder="Shkruaj shënimin tënd këtu..."
              className="textarea w-full mb-4"
              rows="4"
            />
            <div className="flex space-x-2">
              <button onClick={saveAnnotation} className="btn btn-primary flex-1">
                Ruaj Shënimin
              </button>
              <button
                onClick={() => setIsAnnotating(false)}
                className="btn btn-secondary flex-1"
              >
                Anulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          console.error('Audio playback error');
          setIsPlaying(false);
        }}
      />
    </div>
  );
};

export default SmartDocumentViewer;
