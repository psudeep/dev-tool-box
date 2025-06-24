import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownPreview = () => {
  const [markdownInput, setMarkdownInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [previewMode, setPreviewMode] = useState('split');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sampleMarkdown = `# Welcome to Markdown Preview

## Features
This tool supports **GitHub Flavored Markdown** with the following features:

### Text Formatting
- **Bold text** using \`**bold**\`
- *Italic text* using \`*italic*\`
- ~~Strikethrough~~ using \`~~strikethrough~~\`
- \`Inline code\` using backticks

### Lists
#### Unordered List:
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

#### Ordered List:
1. First item
2. Second item
3. Third item

### Links and Images
- [External Link](https://www.example.com)
- [Internal Link](#headers)

### Code Blocks
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Tables
| Feature | Status | Notes |
|---------|--------|-------|
| Headers | ✅ | H1-H6 supported |
| Lists | ✅ | Ordered & unordered |
| Code | ✅ | Inline & blocks |
| Tables | ✅ | With alignment |

### Blockquotes
> This is a blockquote
> 
> It can span multiple lines
> 
> > And can be nested

### Horizontal Rule
---

### Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Mathematical Expressions
For math expressions, you can use LaTeX syntax (if supported):
- Inline: \`$E = mc^2$\`
- Block: \`$$\\sum_{i=1}^{n} x_i$$\`

## Emoji Support 🚀
You can use emoji in your markdown! 😄 🎉 ⭐

---

*Happy writing!* 📝`;

  useEffect(() => {
    convertMarkdown();
  }, [markdownInput]);

  useEffect(() => {
    if (!markdownInput) {
      setMarkdownInput(sampleMarkdown);
    }
  }, []);

  const convertMarkdown = async () => {
    try {
      if (!markdownInput.trim()) {
        setHtmlOutput('');
        return;
      }

      // Configure marked options
      marked.setOptions({
        gfm: true,
        breaks: true,
        highlight: function(code, lang) {
          return code; // Basic highlighting, could be enhanced with a syntax highlighter
        }
      });

      const rawHtml = marked(markdownInput);
      const cleanHtml = DOMPurify.sanitize(rawHtml);
      setHtmlOutput(cleanHtml);
    } catch (error) {
      setHtmlOutput(`<div style="color: red;">Error converting markdown: ${error.message}</div>`);
    }
  };

  const clearAll = () => {
    setMarkdownInput('');
    setHtmlOutput('');
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdownInput);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
  };

  const exportHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        pre {
            background: #f4f4f4;
            border: 1px solid #ddd;
            border-left: 3px solid #f36d33;
            color: #666;
            page-break-inside: avoid;
            font-family: monospace;
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 1.6em;
            max-width: 100%;
            overflow: auto;
            padding: 1em 1.5em;
            display: block;
            word-wrap: break-word;
        }
        code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 16px;
            color: #666;
        }
    </style>
</head>
<body>
${htmlOutput}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewStyle = {
    padding: '20px',
    backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
    color: isDarkMode ? '#d4d4d4' : '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    height: '500px',
    overflow: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    lineHeight: '1.6'
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Markdown Preview</h1>
        <p className="tool-description">
          Write Markdown and see a live HTML preview with GitHub Flavored Markdown support.
        </p>
      </div>

      <div className="tool-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex gap-2 align-items-center">
            <label className="form-label mb-0">View:</label>
            <select 
              className="form-control" 
              style={{ width: 'auto' }}
              value={previewMode}
              onChange={(e) => setPreviewMode(e.target.value)}
            >
              <option value="split">Split View</option>
              <option value="markdown">Markdown Only</option>
              <option value="preview">Preview Only</option>
              <option value="html">HTML Source</option>
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
          <button className="btn btn-primary" onClick={() => setMarkdownInput(sampleMarkdown)}>
            📄 Load Sample
          </button>
          <button className="btn btn-danger" onClick={clearAll}>
            🗑️ Clear All
          </button>
          <button className="btn btn-secondary" onClick={copyMarkdown}>
            📋 Copy Markdown
          </button>
          <button className="btn btn-secondary" onClick={copyHtml}>
            📋 Copy HTML
          </button>
          <button className="btn btn-success" onClick={exportHtml}>
            💾 Export HTML
          </button>
        </div>
      </div>

      {previewMode === 'split' && (
        <div className="split-layout">
          <div className="split-panel">
            <div className="split-panel-header">Markdown Input</div>
            <div className="split-panel-content">
              <CodeMirror
                value={markdownInput}
                height="500px"
                extensions={[markdown()]}
                onChange={(value) => setMarkdownInput(value)}
                theme={isDarkMode ? oneDark : undefined}
                placeholder="Enter your Markdown here..."
              />
            </div>
          </div>

          <div className="split-panel">
            <div className="split-panel-header">HTML Preview</div>
            <div className="split-panel-content">
              <div 
                style={previewStyle}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          </div>
        </div>
      )}

      {previewMode === 'markdown' && (
        <div className="tool-section">
          <div className="split-panel-header">Markdown Input</div>
          <div className="split-panel-content">
            <CodeMirror
              value={markdownInput}
              height="600px"
              extensions={[markdown()]}
              onChange={(value) => setMarkdownInput(value)}
              theme={isDarkMode ? oneDark : undefined}
              placeholder="Enter your Markdown here..."
            />
          </div>
        </div>
      )}

      {previewMode === 'preview' && (
        <div className="tool-section">
          <div className="split-panel-header">HTML Preview</div>
          <div className="split-panel-content">
            <div 
              style={{ ...previewStyle, height: '600px' }}
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          </div>
        </div>
      )}

      {previewMode === 'html' && (
        <div className="tool-section">
          <div className="split-panel-header">Generated HTML Source</div>
          <div className="split-panel-content">
            <CodeMirror
              value={htmlOutput}
              height="600px"
              extensions={[html()]}
              theme={isDarkMode ? oneDark : undefined}
              editable={false}
              placeholder="Generated HTML will appear here..."
            />
          </div>
        </div>
      )}

      <div className="tool-section">
        <h3 className="section-title">Markdown Cheat Sheet</h3>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Headers</h4>
                <code># H1<br/># H2<br/>### H3</code>
              </div>
              <div>
                <h4>Emphasis</h4>
                <code>**bold**<br/>*italic*<br/>~~strikethrough~~</code>
              </div>
              <div>
                <h4>Lists</h4>
                <code>- Item 1<br/>- Item 2<br/><br/>1. Item 1<br/>2. Item 2</code>
              </div>
              <div>
                <h4>Links & Images</h4>
                <code>[Link](url)<br/>![Image](url)</code>
              </div>
              <div>
                <h4>Code</h4>
                <code>`inline code`<br/>```<br/>code block<br/>```</code>
              </div>
              <div>
                <h4>Tables</h4>
                <code>| Col1 | Col2 |<br/>|------|------|<br/>| Data | Data |</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview; 