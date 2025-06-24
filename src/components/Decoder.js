import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

const Decoder = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('base64');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [jwtParts, setJwtParts] = useState({ header: '', payload: '', signature: '' });

  const decodeBase64 = () => {
    try {
      const decoded = atob(input);
      setOutput(decoded);
      setError('');
    } catch (err) {
      setError('Invalid Base64 string');
      setOutput('');
    }
  };

  const encodeBase64 = () => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
      setError('');
    } catch (err) {
      setError('Error encoding to Base64');
      setOutput('');
    }
  };

  const decodeJWT = () => {
    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      setJwtParts({
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature: parts[2]
      });
      
      setOutput(JSON.stringify({ header, payload }, null, 2));
      setError('');
    } catch (err) {
      setError(`Invalid JWT: ${err.message}`);
      setOutput('');
      setJwtParts({ header: '', payload: '', signature: '' });
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setJwtParts({ header: '', payload: '', signature: '' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const handleDecode = () => {
    if (activeTab === 'base64') {
      decodeBase64();
    } else {
      decodeJWT();
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Base64 & JWT Decoder</h1>
        <p className="tool-description">
          Decode Base64 strings and JWT tokens to view their contents.
        </p>
      </div>

      <div className="tool-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex gap-2">
            <button
              className={`btn ${activeTab === 'base64' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('base64')}
            >
              Base64
            </button>
            <button
              className={`btn ${activeTab === 'jwt' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('jwt')}
            >
              JWT Token
            </button>
          </div>
          <label className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
            />
            Dark Mode
          </label>
        </div>
        
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-primary" onClick={handleDecode}>
            🔓 Decode
          </button>
          {activeTab === 'base64' && (
            <button className="btn btn-success" onClick={encodeBase64}>
              🔒 Encode
            </button>
          )}
          <button className="btn btn-danger" onClick={clearAll}>
            🗑️ Clear All
          </button>
          {output && (
            <button className="btn btn-primary" onClick={copyToClipboard}>
              📋 Copy Result
            </button>
          )}
        </div>
      </div>

      <div className="split-layout">
        <div className="split-panel">
          <div className="split-panel-header">
            Input {activeTab === 'base64' ? 'Base64 String' : 'JWT Token'}
          </div>
          <div className="split-panel-content">
            <CodeMirror
              value={input}
              height="450px"
              onChange={(value) => setInput(value)}
              theme={isDarkMode ? oneDark : undefined}
              placeholder={
                activeTab === 'base64' 
                  ? 'Paste your Base64 string here...' 
                  : 'Paste your JWT token here...'
              }
            />
          </div>
        </div>

        <div className="split-panel">
          <div className="split-panel-header">
            {error ? 'Error' : 'Decoded Content'}
          </div>
          <div className="split-panel-content">
            {error ? (
              <div className="result-container error">
                {error}
              </div>
            ) : (
              <CodeMirror
                value={output}
                height="450px"
                extensions={activeTab === 'jwt' ? [json()] : []}
                theme={isDarkMode ? oneDark : undefined}
                editable={false}
                placeholder="Decoded content will appear here..."
              />
            )}
          </div>
        </div>
      </div>

      {activeTab === 'jwt' && jwtParts.header && (
        <div className="tool-section">
          <h3 className="section-title">JWT Parts</h3>
          <div className="split-layout">
            <div className="split-panel">
              <div className="split-panel-header">Header</div>
              <div className="split-panel-content">
                <CodeMirror
                  value={jwtParts.header}
                  height="200px"
                  extensions={[json()]}
                  theme={isDarkMode ? oneDark : undefined}
                  editable={false}
                />
              </div>
            </div>
            <div className="split-panel">
              <div className="split-panel-header">Payload</div>
              <div className="split-panel-content">
                <CodeMirror
                  value={jwtParts.payload}
                  height="200px"
                  extensions={[json()]}
                  theme={isDarkMode ? oneDark : undefined}
                  editable={false}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="split-panel-header">Signature (Base64)</div>
            <div className="result-container">
              {jwtParts.signature}
            </div>
          </div>
        </div>
      )}

      <div className="tool-section">
        <h3 className="section-title">Sample Data</h3>
        <p>Click any sample to load it into the input:</p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-secondary"
            onClick={() => setInput('SGVsbG8gV29ybGQh')}
          >
            Base64: "Hello World!"
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setInput('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')}
          >
            Sample JWT Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default Decoder; 