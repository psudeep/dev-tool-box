import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const tools = [
    {
      path: '/json-formatter',
      name: 'JSON Formatter',
      icon: '📄',
      description: 'Format, validate, and beautify JSON data with syntax highlighting and error detection.',
      features: ['Syntax validation', 'Pretty formatting', 'Minification', 'Error highlighting']
    },
    {
      path: '/decoder',
      name: 'Base64/JWT Decoder',
      icon: '🔓',
      description: 'Decode Base64 strings and JWT tokens to view their contents.',
      features: ['Base64 encode/decode', 'JWT token parsing', 'Header inspection', 'Payload viewing']
    },
    {
      path: '/curl-converter',
      name: 'cURL Converter',
      icon: '🔄',
      description: 'Convert cURL commands to JavaScript fetch, Axios, and other code formats.',
      features: ['Multiple output formats', 'Header preservation', 'Method detection', 'Data handling']
    },
    {
      path: '/regex-tester',
      name: 'Regex Tester',
      icon: '🔍',
      description: 'Test regular expressions against sample text with match highlighting.',
      features: ['Live matching', 'Group capture', 'Flag support', 'Match highlighting']
    },
    {
      path: '/color-picker',
      name: 'Color Picker',
      icon: '🎨',
      description: 'Pick colors and convert between different color formats (HEX, RGB, HSL).',
      features: ['Visual color picker', 'Format conversion', 'Color palette', 'Copy to clipboard']
    },
    {
      path: '/markdown-preview',
      name: 'Markdown Preview',
      icon: '📝',
      description: 'Write Markdown and see a live HTML preview with syntax highlighting.',
      features: ['Live preview', 'Syntax highlighting', 'Export HTML', 'GitHub flavored']
    },
    {
      path: '/api-tester',
      name: 'API Tester',
      icon: '🌐',
      description: 'Test REST APIs with custom headers, methods, and request bodies.',
      features: ['Multiple HTTP methods', 'Custom headers', 'Request history', 'Response formatting']
    }
  ];

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">
          <span className="home-icon">🧰</span>
          Welcome to Dev Toolbox
        </h1>
        <p className="home-subtitle">
          A comprehensive collection of developer utilities in one convenient desktop application.
          Choose a tool from the sidebar or click on any card below to get started.
        </p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <Link key={tool.path} to={tool.path} className="tool-card">
            <div className="tool-card-header">
              <span className="tool-card-icon">{tool.icon}</span>
              <h3 className="tool-card-title">{tool.name}</h3>
            </div>
            <p className="tool-card-description">{tool.description}</p>
            <div className="tool-card-features">
              {tool.features.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="home-footer">
        <div className="feature-highlights">
          <h2>Why Dev Toolbox?</h2>
          <div className="highlights-grid">
            <div className="highlight-item">
              <span className="highlight-icon">⚡</span>
              <h3>Fast & Lightweight</h3>
              <p>Native desktop performance with minimal resource usage</p>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🔒</span>
              <h3>Privacy First</h3>
              <p>All processing happens locally - your data never leaves your machine</p>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🎯</span>
              <h3>Developer Focused</h3>
              <p>Built by developers, for developers with the most common tools you need</p>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🌍</span>
              <h3>Cross Platform</h3>
              <p>Works on Windows, macOS, and Linux with consistent experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 