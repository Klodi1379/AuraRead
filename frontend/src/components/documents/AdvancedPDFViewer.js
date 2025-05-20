// Enhanced PDF Viewer with PDF.js integration
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaPlay, FaPause, FaStop, FaVolumeMute, FaVolumeUp,
  FaSearchPlus, FaSearchMinus, FaExpand, FaBrain,
  FaRobot, FaHighlighter, FaBookmark
} from 'react-icons/fa';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AdvancedPDFViewer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // PDF State
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [pdfFile, setPdfFile] = useState(null);

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  const [audioSpeed, setAudioSpeed] = useState(1.0);

  // AI Features State
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  // Document Data
  const { currentDocument, extractedText } = useSelector(state => state.documents);

  useEffect(() => {
    if (currentDocument?.file) {
      setPdfFile(currentDocument.file);
    }
  }, [currentDocument]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const handlePlayTTS = async () => {
    if (!extractedText) return;

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
          language: 'en',
          prefer_offline: true
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.playbackRate = audioSpeed;
        audio.play();
        setIsPlaying(true);

        audio.onended = () => setIsPlaying(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const generateAISummary = async () => {
    if (!extractedText) return;

    try {
      const response = await fetch(`/api/ai/summarize/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          document_id: id,
          text: extractedText
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
        setKeyPoints(data.key_points);
      }
    } catch (error) {
      console.error('AI Summary Error:', error);
    }
  };

  const askAIQuestion = async () => {
    if (!aiQuestion || !extractedText) return;

    try {
      const response = await fetch(`/api/ai/question/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      }
    } catch (error) {
      console.error('AI Question Error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main PDF Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Page Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
                className="btn btn-sm"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                disabled={pageNumber >= numPages}
                className="btn btn-sm"
              >
                Next
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button onClick={handleZoomOut} className="btn btn-sm">
                <FaSearchMinus />
              </button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button onClick={handleZoomIn} className="btn btn-sm">
                <FaSearchPlus />
              </button>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm">Speed:</label>
              <select
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                className="select select-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2x</option>
              </select>
            </div>

            <button
              onClick={handlePlayTTS}
              disabled={isPlaying}
              className="btn btn-primary"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </button>
          </div>

          {/* AI Sidebar Toggle */}
          <button
            onClick={() => setShowAISidebar(!showAISidebar)}
            className="btn btn-secondary"
          >
            <FaBrain />
            AI Assistant
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          <div className="flex justify-center">
            {pdfFile && (
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                className="shadow-lg"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="bg-white"
                />
              </Document>
            )}
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      {showAISidebar && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaRobot className="mr-2" />
            AI Assistant
          </h3>

          {/* Generate Summary */}
          <div className="mb-6">
            <button
              onClick={generateAISummary}
              className="btn btn-primary w-full mb-3"
            >
              Generate Summary
            </button>

            {aiSummary && (
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-medium mb-2">Summary:</h4>
                <p className="text-sm text-gray-700">{aiSummary}</p>
              </div>
            )}

            {keyPoints.length > 0 && (
              <div className="bg-green-50 p-3 rounded mt-3">
                <h4 className="font-medium mb-2">Key Points:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
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
            <h4 className="font-medium mb-2">Ask a Question:</h4>
            <div className="space-y-2">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="What would you like to know about this document?"
                className="textarea textarea-sm w-full"
                rows="3"
              />
              <button
                onClick={askAIQuestion}
                disabled={!aiQuestion}
                className="btn btn-sm btn-primary w-full"
              >
                Ask AI
              </button>
            </div>

            {aiAnswer && (
              <div className="bg-yellow-50 p-3 rounded mt-3">
                <h5 className="font-medium mb-1">Answer:</h5>
                <p className="text-sm text-gray-700">{aiAnswer}</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button className="btn btn-sm btn-outline w-full">
              <FaHighlighter className="mr-2" />
              Smart Highlights
            </button>
            <button className="btn btn-sm btn-outline w-full">
              <FaBookmark className="mr-2" />
              Extract Citations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedPDFViewer;
