# Coding Standards — Dev Toolbox

## File Conventions
- One component per file; CSS co-located (`Foo.js` + `Foo.css`)
- Component files use PascalCase; CSS files match component name
- Test files mirror component path: `src/__tests__/components/Foo.test.js`

## Adding a New Tool
1. Create `src/components/ToolName.js` + `ToolName.css`
2. Add route in `src/App.js`
3. Add nav entry in `src/components/Sidebar.js`
4. Add menu item in `src/main/main.js` under the Tools menu
5. Add a card on `src/components/Home.js`
6. Write unit tests in `src/__tests__/components/ToolName.test.js`

## Component Structure Template
```js
import React, { useState } from 'react';
import './ToolName.css';

function ToolName() {
  const [darkMode, setDarkMode] = useState(false);
  // ... state

  return (
    <div className={`tool-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tool-header">
        <h2>Tool Name</h2>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      {/* split layout: input left, output right */}
    </div>
  );
}

export default ToolName;
```

## Security
- Never set `nodeIntegration: true` or `contextIsolation: false` in BrowserWindow
- All new IPC channels must be added to `preload.js` — never import `ipcRenderer` in React components
- Sanitize any dynamically rendered HTML with DOMPurify
- Validate user input at the component boundary

## State Management
- Use `useState` / `useEffect` — no global state library needed currently
- Dark mode is local state per component — do not introduce a Context for it unless migrating all tools

## Styling
- Use CSS classes, not inline styles (except dynamic color values)
- Follow the existing color tokens in `src/index.css`
- Mobile-responsive: sidebar converts to horizontal nav via media query

## Testing
- Always import `src/__tests__/setup.js` (automatically via Jest config)
- Mock `window.electronAPI` is already provided by setup — do not re-mock
- Use React Testing Library (`render`, `screen`, `fireEvent`)
- Test: render, user interactions, output correctness, error states
