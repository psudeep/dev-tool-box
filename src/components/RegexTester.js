import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testString]);

  const testRegex = () => {
    try {
      if (!pattern) {
        setMatches([]);
        setError('');
        setHighlightedText(testString);
        return;
      }

      const regex = new RegExp(pattern, flags);
      const foundMatches = [];
      let match;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
          
          // Prevent infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
        }
      }

      setMatches(foundMatches);
      setError('');
      
      // Highlight matches in text
      if (foundMatches.length > 0) {
        let highlighted = testString;
        let offset = 0;
        
        foundMatches.forEach(match => {
          const start = match.index + offset;
          const end = start + match.match.length;
          const before = highlighted.substring(0, start);
          const matchText = highlighted.substring(start, end);
          const after = highlighted.substring(end);
          
          highlighted = before + `<mark style="background-color: #ffeb3b; color: #000;">${matchText}</mark>` + after;
          offset += 47; // Length of mark tags
        });
        
        setHighlightedText(highlighted);
      } else {
        setHighlightedText(testString);
      }
      
    } catch (err) {
      setError(`Invalid regex: ${err.message}`);
      setMatches([]);
      setHighlightedText(testString);
    }
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
    setHighlightedText('');
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
  };

  const handleFlagChange = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Regex Tester</h1>
        <p className="tool-description">
          Test regular expressions against sample text with live matching and group capture.
        </p>
      </div>

      <div className="tool-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0">Pattern & Flags</h3>
          <label className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
            />
            Dark Mode
          </label>
        </div>
        
        <div className="form-group">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="form-label">Pattern:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              /{pattern || 'pattern'}/{flags}
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter your regex pattern..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Flags:</label>
          <div className="d-flex gap-3">
            {[
              { flag: 'g', name: 'Global' },
              { flag: 'i', name: 'Ignore Case' },
              { flag: 'm', name: 'Multiline' },
              { flag: 's', name: 'Dot All' },
              { flag: 'u', name: 'Unicode' },
              { flag: 'y', name: 'Sticky' }
            ].map(({ flag, name }) => (
              <label key={flag} className="d-flex align-items-center gap-1">
                <input
                  type="checkbox"
                  checked={flags.includes(flag)}
                  onChange={() => handleFlagChange(flag)}
                />
                <span>{flag}</span>
                <small style={{ opacity: 0.7 }}>({name})</small>
              </label>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-danger" onClick={clearAll}>
            🗑️ Clear All
          </button>
          {pattern && (
            <button className="btn btn-primary" onClick={copyPattern}>
              📋 Copy Pattern
            </button>
          )}
        </div>
      </div>

      <div className="split-layout">
        <div className="split-panel">
          <div className="split-panel-header">Test String</div>
          <div className="split-panel-content">
            <CodeMirror
              value={testString}
              height="300px"
              onChange={(value) => setTestString(value)}
              theme={isDarkMode ? oneDark : undefined}
              placeholder="Enter text to test against your regex..."
            />
          </div>
        </div>

        <div className="split-panel">
          <div className="split-panel-header">Highlighted Matches</div>
          <div className="split-panel-content">
            <div 
              style={{
                padding: '12px',
                height: '300px',
                overflow: 'auto',
                backgroundColor: isDarkMode ? '#282c34' : '#f8f9fa',
                color: isDarkMode ? '#abb2bf' : '#333',
                fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              dangerouslySetInnerHTML={{ __html: highlightedText || 'Matches will be highlighted here...' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="tool-section">
          <div className="alert alert-error">
            {error}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="tool-section">
          <h3 className="section-title">Match Results ({matches.length} matches)</h3>
          <div className="card">
            <div className="card-body">
              {matches.map((match, index) => (
                <div key={index} className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Match #{index + 1}</strong>
                    <small style={{ opacity: 0.7 }}>Position: {match.index}</small>
                  </div>
                  <div className="mb-2">
                    <strong>Full Match:</strong> <code>{match.match}</code>
                  </div>
                  {match.groups.length > 0 && (
                    <div className="mb-2">
                      <strong>Groups:</strong>
                      <div className="mt-1">
                        {match.groups.map((group, groupIndex) => (
                          <div key={groupIndex} className="ml-3">
                            Group {groupIndex + 1}: <code>{group || '(empty)'}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(match.namedGroups).length > 0 && (
                    <div>
                      <strong>Named Groups:</strong>
                      <div className="mt-1">
                        {Object.entries(match.namedGroups).map(([name, value]) => (
                          <div key={name} className="ml-3">
                            {name}: <code>{value}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="tool-section">
        <h3 className="section-title">Common Patterns</h3>
        <p>Click any pattern to load it:</p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPattern('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b');
              setTestString('Contact us at john.doe@example.com or support@test.org');
            }}
          >
            Email
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)');
              setTestString('Visit https://www.example.com or http://test.org for more info');
            }}
          >
            URL
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPattern('\\d{3}-\\d{3}-\\d{4}');
              setTestString('Call me at 123-456-7890 or 555-123-4567');
            }}
          >
            Phone (US)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPattern('#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})');
              setTestString('Primary color is #ff0000 and secondary is #00f');
            }}
          >
            Hex Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegexTester; 