import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = () => {
  const [color, setColor] = useState('#ff0000');
  const [colorHistory, setColorHistory] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const handleColorChange = (colorObj) => {
    setColor(colorObj.hex);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const addToHistory = () => {
    if (!colorHistory.includes(color)) {
      setColorHistory([color, ...colorHistory.slice(0, 9)]);
    }
  };

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const colorFormats = [
    { label: 'HEX', value: color.toUpperCase() },
    { label: 'RGB', value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '' },
    { label: 'RGBA', value: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '' },
    { label: 'HSL', value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '' },
    { label: 'HSLA', value: hsl ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` : '' }
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Color Picker & Converter</h1>
        <p className="tool-description">
          Pick colors visually and convert between different color formats (HEX, RGB, HSL).
        </p>
      </div>

      <div className="split-layout" style={{ alignItems: 'flex-start' }}>
        <div className="split-panel">
          <div className="split-panel-header">Color Picker</div>
          <div className="split-panel-content" style={{ padding: '20px', textAlign: 'center' }}>
            <SketchPicker
              color={color}
              onChange={handleColorChange}
              width="100%"
            />
            <button 
              className="btn btn-primary mt-3"
              onClick={addToHistory}
            >
              💾 Add to Palette
            </button>
          </div>
        </div>

        <div className="split-panel">
          <div className="split-panel-header">Color Information</div>
          <div className="split-panel-content" style={{ padding: '20px' }}>
            {/* Color Preview */}
            <div className="mb-4">
              <div className="split-panel-header">Preview</div>
              <div 
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: color,
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              />
              <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '18px' }}>
                {color.toUpperCase()}
              </div>
            </div>

            {/* Color Formats */}
            <div className="mb-4">
              <div className="split-panel-header">Color Formats</div>
              {colorFormats.map((format) => (
                <div key={format.label} className="form-group">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label mb-1">{format.label}:</label>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '12px' }}
                      onClick={() => copyToClipboard(format.value)}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    value={format.value}
                    readOnly
                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                  />
                </div>
              ))}
            </div>

            {/* Color Input */}
            <div className="mb-4">
              <div className="split-panel-header">Manual Input</div>
              <div className="form-group">
                <label className="form-label">Enter Color (HEX):</label>
                <input
                  type="text"
                  className="form-control"
                  value={color}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || value === '#') {
                      setColor(value);
                    }
                  }}
                  placeholder="#ff0000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color History/Palette */}
      <div className="tool-section">
        <h3 className="section-title">Color Palette</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
          {colorHistory.map((historyColor, index) => (
            <div
              key={index}
              style={{
                width: '80px',
                height: '60px',
                backgroundColor: historyColor,
                border: '2px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '4px',
                color: 'white',
                textShadow: '1px 1px 1px rgba(0,0,0,0.7)',
                fontSize: '11px',
                fontWeight: '600'
              }}
              onClick={() => setColor(historyColor)}
              title={`Click to select ${historyColor}`}
            >
              {historyColor.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Predefined Colors */}
      <div className="tool-section">
        <h3 className="section-title">Predefined Colors</h3>
        <div className="d-flex gap-2 flex-wrap">
          {[
            { name: 'Red', color: '#ff0000' },
            { name: 'Green', color: '#00ff00' },
            { name: 'Blue', color: '#0000ff' },
            { name: 'Yellow', color: '#ffff00' },
            { name: 'Magenta', color: '#ff00ff' },
            { name: 'Cyan', color: '#00ffff' },
            { name: 'Orange', color: '#ffa500' },
            { name: 'Purple', color: '#800080' },
            { name: 'Pink', color: '#ffc0cb' },
            { name: 'Brown', color: '#a52a2a' },
            { name: 'Gray', color: '#808080' },
            { name: 'Black', color: '#000000' },
            { name: 'White', color: '#ffffff' }
          ].map((preset) => (
            <button
              key={preset.name}
              className="btn btn-secondary"
              onClick={() => setColor(preset.color)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: preset.color,
                  border: '1px solid #ddd',
                  borderRadius: '2px'
                }}
              />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Accessibility */}
      <div className="tool-section">
        <h3 className="section-title">Accessibility Information</h3>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4>Text on White Background</h4>
                <div
                  style={{
                    backgroundColor: 'white',
                    color: color,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  Sample text in selected color
                </div>
              </div>
              <div>
                <h4>White Text on Color Background</h4>
                <div
                  style={{
                    backgroundColor: color,
                    color: 'white',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  Sample white text on selected color
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker; 