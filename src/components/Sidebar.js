import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const tools = [
    {
      path: '/',
      name: 'Home',
      icon: '🏠',
      description: 'Welcome to Dev Toolbox'
    },
    {
      path: '/json-formatter',
      name: 'JSON Formatter',
      icon: '📄',
      description: 'Format and validate JSON'
    },
    {
      path: '/decoder',
      name: 'Base64/JWT Decoder',
      icon: '🔓',
      description: 'Decode Base64 and JWT tokens'
    },
    {
      path: '/curl-converter',
      name: 'cURL Converter',
      icon: '🔄',
      description: 'Convert cURL to code'
    },
    {
      path: '/regex-tester',
      name: 'Regex Tester',
      icon: '🔍',
      description: 'Test regular expressions'
    },
    {
      path: '/color-picker',
      name: 'Color Picker',
      icon: '🎨',
      description: 'Pick and convert colors'
    },
    {
      path: '/markdown-preview',
      name: 'Markdown Preview',
      icon: '📝',
      description: 'Preview Markdown as HTML'
    },
    {
      path: '/api-tester',
      name: 'API Tester',
      icon: '🌐',
      description: 'Test REST APIs'
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <span className="sidebar-icon">🧰</span>
          Dev Toolbox
        </h1>
        <p className="sidebar-subtitle">Developer Utilities</p>
      </div>
      
      <nav className="sidebar-nav">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`sidebar-link ${location.pathname === tool.path ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{tool.icon}</span>
            <div className="sidebar-link-content">
              <div className="sidebar-link-name">{tool.name}</div>
              <div className="sidebar-link-description">{tool.description}</div>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
};

export default Sidebar; 