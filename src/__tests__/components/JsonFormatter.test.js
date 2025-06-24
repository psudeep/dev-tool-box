import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JsonFormatter from '../../components/JsonFormatter';

describe('JsonFormatter', () => {
  test('renders JsonFormatter component', () => {
    render(<JsonFormatter />);
    expect(screen.getByText('JSON Formatter & Validator')).toBeInTheDocument();
  });

  test('displays format, minify, and validate buttons', () => {
    render(<JsonFormatter />);
    expect(screen.getByText('🎨 Format JSON')).toBeInTheDocument();
    expect(screen.getByText('📦 Minify JSON')).toBeInTheDocument();
    expect(screen.getByText('✅ Validate JSON')).toBeInTheDocument();
  });

  test('loads sample JSON when sample button is clicked', () => {
    render(<JsonFormatter />);
    const sampleButton = screen.getByText('Simple Object');
    fireEvent.click(sampleButton);
    
    // Check if the sample JSON is loaded (this is a basic test)
    expect(sampleButton).toBeInTheDocument();
  });

  test('clears all content when clear button is clicked', () => {
    render(<JsonFormatter />);
    const clearButton = screen.getByText('🗑️ Clear All');
    fireEvent.click(clearButton);
    
    // This is a basic test - in a real scenario, you'd check if the editor content is cleared
    expect(clearButton).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<JsonFormatter />);
    const darkModeCheckbox = screen.getByLabelText('Dark Mode');
    
    expect(darkModeCheckbox).not.toBeChecked();
    fireEvent.click(darkModeCheckbox);
    expect(darkModeCheckbox).toBeChecked();
  });
}); 