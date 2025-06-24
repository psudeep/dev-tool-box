import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setOutput('');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✅ Valid JSON');
    } catch (err) {
      setError(`❌ Invalid JSON: ${err.message}`);
      setOutput('');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">JSON Formatter & Validator</h1>
        <p className="tool-description">
          Format, validate, and beautify JSON data with syntax highlighting and error detection.
        </p>
      </div>

      <div className="tool-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="section-title mb-0">Controls</h3>
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
          <button className="btn btn-primary" onClick={formatJson}>
            🎨 Format JSON
          </button>
          <button className="btn btn-secondary" onClick={minifyJson}>
            📦 Minify JSON
          </button>
          <button className="btn btn-success" onClick={validateJson}>
            ✅ Validate JSON
          </button>
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
          <div className="split-panel-header">Input JSON</div>
          <div className="split-panel-content">
            <CodeMirror
              value={input}
              height="450px"
              extensions={[json()]}
              onChange={(value) => setInput(value)}
              theme={isDarkMode ? oneDark : undefined}
              placeholder="Paste your JSON here..."
            />
          </div>
        </div>

        <div className="split-panel">
          <div className="split-panel-header">
            {error ? 'Error' : 'Formatted JSON'}
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
                extensions={[json()]}
                theme={isDarkMode ? oneDark : undefined}
                editable={false}
                placeholder="Formatted JSON will appear here..."
              />
            )}
          </div>
        </div>
      </div>

      <div className="tool-section">
        <h3 className="section-title">Sample JSON</h3>
        <p>Click any sample to load it into the input:</p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-secondary"
            onClick={() => setInput('{"name":"John","age":30,"city":"New York","hobbies":["reading","coding","gaming"]}')}
          >
            Simple Object
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setInput('[{"id":1,"name":"Alice","email":"alice@example.com"},{"id":2,"name":"Bob","email":"bob@example.com"}]')}
          >
            Array of Objects
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setInput('{"users":[{"id":1,"profile":{"name":"Alice","preferences":{"theme":"dark","notifications":true}}}],"meta":{"total":1,"page":1}}')}
          >
            Complex Nested
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter; 