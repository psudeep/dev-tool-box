import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import axios from 'axios';

const ApiTester = () => {
  const [request, setRequest] = useState({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: ''
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);

  const makeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      let headers = {};
      try {
        headers = request.headers ? JSON.parse(request.headers) : {};
      } catch (e) {
        throw new Error('Invalid JSON in headers');
      }

      let data = null;
      if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          data = JSON.parse(request.body);
        } catch (e) {
          data = request.body;
        }
      }

      const config = {
        method: request.method.toLowerCase(),
        url: request.url,
        headers: headers,
        timeout: 30000,
        validateStatus: () => true // Accept all status codes
      };

      if (data !== null) {
        config.data = data;
      }

      const axiosResponse = await axios(config);
      const endTime = Date.now();
      
      const responseData = {
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: axiosResponse.headers,
        data: axiosResponse.data,
        time: endTime - startTime,
        size: JSON.stringify(axiosResponse.data).length,
        timestamp: new Date().toISOString()
      };

      setResponse(responseData);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        method: request.method,
        url: request.url,
        status: axiosResponse.status,
        time: endTime - startTime,
        timestamp: new Date().toISOString()
      };
      
      setRequestHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      
    } catch (error) {
      const endTime = Date.now();
      setResponse({
        error: true,
        message: error.message,
        status: error.response?.status || 'Error',
        statusText: error.response?.statusText || 'Network Error',
        time: endTime - startTime,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
  };

  const copyResponse = () => {
    if (response) {
      const copyData = response.error ? 
        { error: response.message, status: response.status } :
        response.data;
      navigator.clipboard.writeText(JSON.stringify(copyData, null, 2));
    }
  };

  const loadFromHistory = (historyItem) => {
    // Find full request from history if available, otherwise just set URL and method
    setRequest(prev => ({
      ...prev,
      method: historyItem.method,
      url: historyItem.url
    }));
  };

  const getStatusColor = (status) => {
    if (typeof status === 'string') return '#dc3545'; // Error
    if (status >= 200 && status < 300) return '#28a745'; // Success
    if (status >= 300 && status < 400) return '#ffc107'; // Redirect
    if (status >= 400 && status < 500) return '#fd7e14'; // Client Error
    if (status >= 500) return '#dc3545'; // Server Error
    return '#6c757d'; // Unknown
  };

  const formatResponseSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">API Tester</h1>
        <p className="tool-description">
          Test REST APIs with custom headers, methods, and request bodies. A lightweight Postman alternative.
        </p>
      </div>

      <div className="tool-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0">Request Configuration</h3>
          <label className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
            />
            Dark Mode
          </label>
        </div>

        {/* Method and URL */}
        <div className="form-group">
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-control"
              style={{ width: '120px' }}
              value={request.method}
              onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value }))}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
            <input
              type="url"
              className="form-control"
              placeholder="Enter API URL..."
              value={request.url}
              onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
            />
            <button
              className="btn btn-primary"
              onClick={makeRequest}
              disabled={loading || !request.url}
            >
              {loading ? '⏳ Sending...' : '🚀 Send'}
            </button>
          </div>
        </div>
      </div>

      <div className="split-layout">
        {/* Request Section */}
        <div className="split-panel">
          <div className="split-panel-header">Request</div>
          <div className="split-panel-content" style={{ padding: '0' }}>
            {/* Headers */}
            <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
              <label className="form-label">Headers (JSON format):</label>
              <CodeMirror
                value={request.headers}
                height="120px"
                extensions={[json()]}
                onChange={(value) => setRequest(prev => ({ ...prev, headers: value }))}
                theme={isDarkMode ? oneDark : undefined}
                placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'
              />
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(request.method) && (
              <div style={{ padding: '16px' }}>
                <label className="form-label">Request Body:</label>
                <CodeMirror
                  value={request.body}
                  height="200px"
                  extensions={[json()]}
                  onChange={(value) => setRequest(prev => ({ ...prev, body: value }))}
                  theme={isDarkMode ? oneDark : undefined}
                  placeholder='{\n  "key": "value"\n}'
                />
              </div>
            )}
          </div>
        </div>

        {/* Response Section */}
        <div className="split-panel">
          <div className="split-panel-header">
            Response
            {response && (
              <div className="d-flex gap-2 ml-auto">
                <button className="btn btn-secondary btn-sm" onClick={copyResponse}>
                  📋 Copy
                </button>
                <button className="btn btn-danger btn-sm" onClick={clearResponse}>
                  🗑️ Clear
                </button>
              </div>
            )}
          </div>
          <div className="split-panel-content" style={{ padding: '0' }}>
            {loading && (
              <div className="loading">
                Making request...
              </div>
            )}
            
            {response && !loading && (
              <>
                {/* Response Info */}
                <div style={{ padding: '16px', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <span
                        style={{
                          color: getStatusColor(response.status),
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        {response.status} {response.statusText}
                      </span>
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        {response.time}ms
                      </span>
                      {response.size && (
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          {formatResponseSize(response.size)}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {new Date(response.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Response Headers */}
                {response.headers && (
                  <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Response Headers</h4>
                    <CodeMirror
                      value={JSON.stringify(response.headers, null, 2)}
                      height="100px"
                      extensions={[json()]}
                      theme={isDarkMode ? oneDark : undefined}
                      editable={false}
                    />
                  </div>
                )}

                {/* Response Body */}
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Response Body</h4>
                  {response.error ? (
                    <div className="result-container error">
                      {response.message}
                    </div>
                  ) : (
                    <CodeMirror
                      value={typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                      height="250px"
                      extensions={[json()]}
                      theme={isDarkMode ? oneDark : undefined}
                      editable={false}
                    />
                  )}
                </div>
              </>
            )}

            {!response && !loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                Response will appear here after sending a request
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request History */}
      {requestHistory.length > 0 && (
        <div className="tool-section">
          <h3 className="section-title">Request History</h3>
          <div className="card">
            <div className="card-body p-0">
              {requestHistory.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between align-items-center p-3"
                  style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span
                      style={{
                        background: item.method === 'GET' ? '#28a745' : '#007bff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        minWidth: '50px',
                        textAlign: 'center'
                      }}
                    >
                      {item.method}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                      {item.url}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span
                      style={{
                        color: getStatusColor(item.status),
                        fontWeight: 'bold'
                      }}
                    >
                      {item.status}
                    </span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {item.time}ms
                    </span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="tool-section">
        <h3 className="section-title">Quick Examples</h3>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-secondary"
            onClick={() => setRequest({
              method: 'GET',
              url: 'https://jsonplaceholder.typicode.com/posts/1',
              headers: '{\n  "Content-Type": "application/json"\n}',
              body: ''
            })}
          >
            GET Example
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setRequest({
              method: 'POST',
              url: 'https://jsonplaceholder.typicode.com/posts',
              headers: '{\n  "Content-Type": "application/json"\n}',
              body: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}'
            })}
          >
            POST Example
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setRequest({
              method: 'GET',
              url: 'https://api.github.com/users/octocat',
              headers: '{\n  "Accept": "application/vnd.github.v3+json"\n}',
              body: ''
            })}
          >
            GitHub API
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiTester; 