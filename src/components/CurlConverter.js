import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const CurlConverter = () => {
  const [curlInput, setCurlInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [outputFormat, setOutputFormat] = useState('fetch');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const parseCurl = (curlCommand) => {
    const result = {
      method: 'GET',
      url: '',
      headers: {},
      data: null
    };

    // Clean up the curl command
    let command = curlCommand.trim();
    if (command.startsWith('curl ')) {
      command = command.substring(5);
    }

    // Extract URL
    const urlMatch = command.match(/(?:^|\s)(https?:\/\/[^\s]+|'[^']+'|"[^"]+")(?:\s|$)/);
    if (urlMatch) {
      result.url = urlMatch[1].replace(/['"]/g, '');
    }

    // Extract method
    const methodMatch = command.match(/-X\s+(\w+)/i);
    if (methodMatch) {
      result.method = methodMatch[1].toUpperCase();
    }

    // Extract headers
    const headerMatches = command.matchAll(/-H\s+['"]([^'"]+)['"]/g);
    for (const match of headerMatches) {
      const [key, value] = match[1].split(':').map(s => s.trim());
      if (key && value) {
        result.headers[key] = value;
      }
    }

    // Extract data
    const dataMatch = command.match(/-d\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      try {
        result.data = JSON.parse(dataMatch[1]);
      } catch {
        result.data = dataMatch[1];
      }
    }

    return result;
  };

  const generateFetch = (parsed) => {
    const options = {
      method: parsed.method
    };

    if (Object.keys(parsed.headers).length > 0) {
      options.headers = parsed.headers;
    }

    if (parsed.data !== null) {
      options.body = typeof parsed.data === 'string' ? parsed.data : JSON.stringify(parsed.data);
    }

    return `fetch('${parsed.url}', ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generateAxios = (parsed) => {
    const config = {
      method: parsed.method.toLowerCase(),
      url: parsed.url
    };

    if (Object.keys(parsed.headers).length > 0) {
      config.headers = parsed.headers;
    }

    if (parsed.data !== null) {
      config.data = parsed.data;
    }

    return `import axios from 'axios';

axios(${JSON.stringify(config, null, 2)})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;
  };

  const generateXHR = (parsed) => {
    let code = `const xhr = new XMLHttpRequest();
xhr.open('${parsed.method}', '${parsed.url}');

`;

    if (Object.keys(parsed.headers).length > 0) {
      Object.entries(parsed.headers).forEach(([key, value]) => {
        code += `xhr.setRequestHeader('${key}', '${value}');\n`;
      });
      code += '\n';
    }

    code += `xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};

`;

    if (parsed.data !== null) {
      const dataStr = typeof parsed.data === 'string' ? parsed.data : JSON.stringify(parsed.data);
      code += `xhr.send('${dataStr}');`;
    } else {
      code += 'xhr.send();';
    }

    return code;
  };

  const convertCurl = () => {
    try {
      if (!curlInput.trim()) {
        setError('Please enter a cURL command');
        setOutput('');
        return;
      }

      const parsed = parseCurl(curlInput);
      
      if (!parsed.url) {
        setError('Could not find URL in cURL command');
        setOutput('');
        return;
      }

      let result = '';
      switch (outputFormat) {
        case 'fetch':
          result = generateFetch(parsed);
          break;
        case 'axios':
          result = generateAxios(parsed);
          break;
        case 'xhr':
          result = generateXHR(parsed);
          break;
        default:
          result = generateFetch(parsed);
      }

      setOutput(result);
      setError('');
    } catch (err) {
      setError(`Error converting cURL: ${err.message}`);
      setOutput('');
    }
  };

  const clearAll = () => {
    setCurlInput('');
    setOutput('');
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">cURL to Code Converter</h1>
        <p className="tool-description">
          Convert cURL commands to JavaScript fetch, Axios, and XMLHttpRequest code.
        </p>
      </div>

      <div className="tool-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex gap-2 align-items-center">
            <label className="form-label mb-0">Output Format:</label>
            <select 
              className="form-control" 
              style={{ width: 'auto' }}
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
            >
              <option value="fetch">JavaScript Fetch</option>
              <option value="axios">Axios</option>
              <option value="xhr">XMLHttpRequest</option>
            </select>
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
          <button className="btn btn-primary" onClick={convertCurl}>
            🔄 Convert
          </button>
          <button className="btn btn-danger" onClick={clearAll}>
            🗑️ Clear All
          </button>
          {output && (
            <button className="btn btn-primary" onClick={copyToClipboard}>
              📋 Copy Code
            </button>
          )}
        </div>
      </div>

      <div className="split-layout">
        <div className="split-panel">
          <div className="split-panel-header">cURL Command</div>
          <div className="split-panel-content">
            <CodeMirror
              value={curlInput}
              height="450px"
              onChange={(value) => setCurlInput(value)}
              theme={isDarkMode ? oneDark : undefined}
              placeholder="Paste your cURL command here..."
            />
          </div>
        </div>

        <div className="split-panel">
          <div className="split-panel-header">
            {error ? 'Error' : `${outputFormat.toUpperCase()} Code`}
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
                extensions={[javascript()]}
                theme={isDarkMode ? oneDark : undefined}
                editable={false}
                placeholder="Converted code will appear here..."
              />
            )}
          </div>
        </div>
      </div>

      <div className="tool-section">
        <h3 className="section-title">Sample cURL Commands</h3>
        <p>Click any sample to load it into the input:</p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-secondary"
            onClick={() => setCurlInput('curl -X GET https://jsonplaceholder.typicode.com/posts/1')}
          >
            Simple GET
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setCurlInput('curl -X POST https://jsonplaceholder.typicode.com/posts -H "Content-Type: application/json" -d \'{"title":"foo","body":"bar","userId":1}\'')}
          >
            POST with JSON
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setCurlInput('curl -X GET https://api.github.com/user -H "Authorization: Bearer YOUR_TOKEN" -H "Accept: application/vnd.github.v3+json"')}
          >
            GET with Headers
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurlConverter; 