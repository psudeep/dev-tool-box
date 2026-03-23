# Dev Toolbox — Claude Guide

## Project Overview

**Dev Toolbox** is a cross-platform desktop application (Electron + React) that bundles 7 developer utilities into a single lightweight app. Version 1.0.0.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 27 |
| UI framework | React 18 + React Router 6 |
| Code editors | CodeMirror 6 (JSON, JS, HTML, Markdown) |
| HTTP client | Axios |
| Markdown | marked + DOMPurify |
| Color picker | react-color (SketchPicker) |
| JWT decoding | jwt-decode |
| Build/packaging | Electron Builder 24 |
| Testing | Jest 29 + React Testing Library |

## Directory Structure

```
dev_tool_box/
├── src/
│   ├── main/
│   │   ├── main.js          # Electron main process (BrowserWindow, IPC, menus)
│   │   └── preload.js       # Secure IPC bridge (window.electronAPI)
│   ├── components/          # One file per tool
│   │   ├── Home.js / Home.css
│   │   ├── Sidebar.js / Sidebar.css
│   │   ├── JsonFormatter.js
│   │   ├── Decoder.js       # Base64 + JWT
│   │   ├── CurlConverter.js
│   │   ├── RegexTester.js
│   │   ├── ColorPicker.js
│   │   ├── MarkdownPreview.js
│   │   └── ApiTester.js
│   ├── __tests__/
│   │   ├── setup.js         # Mocks for Electron API, clipboard, URL
│   │   └── components/
│   │       └── JsonFormatter.test.js
│   ├── App.js               # Router + Electron menu navigation
│   ├── App.css
│   ├── index.js             # React entry point
│   └── index.css            # Global design system (buttons, cards, forms)
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── docs/                    # Project documentation
│   └── index.md             # Architecture & structure reference
├── .claude/                 # Claude Code configuration
│   ├── context/             # Project context files
│   ├── rules/               # Coding rules and conventions
│   └── agents/              # Agent task definitions
├── CLAUDE.md                # This file
├── jest.e2e.config.js
├── package.json
└── README.md
```

## Dev Workflow

```bash
npm run dev          # Concurrent: React dev server (port 3004) + Electron
npm test             # Jest unit tests
npm run test:e2e     # End-to-end tests
npm run build        # React production build
npm run build-all    # Package for macOS + Windows + Linux
```

## Architecture Essentials

### Process separation
- **Main process** (`src/main/main.js`): manages BrowserWindow, native menus, file dialogs, IPC handlers.
- **Preload** (`src/main/preload.js`): exposes `window.electronAPI` — the only safe bridge between renderer and main.
- **Renderer** (`src/` everything else): standard React SPA; must never use Node APIs directly.

### IPC surface (preload.js)
```js
window.electronAPI.getAppVersion()
window.electronAPI.showSaveDialog()
window.electronAPI.onNavigateTo(callback)
window.electronAPI.onMenuNew(callback)
window.electronAPI.onMenuOpen(callback)
window.electronAPI.removeAllListeners(channel)
```

### Routing (App.js)
| Route | Component |
|-------|-----------|
| `/` | Home |
| `/json-formatter` | JsonFormatter |
| `/decoder` | Decoder |
| `/curl-converter` | CurlConverter |
| `/regex-tester` | RegexTester |
| `/color-picker` | ColorPicker |
| `/markdown-preview` | MarkdownPreview |
| `/api-tester` | ApiTester |

## Implemented Tools

1. **JSON Formatter** — format, minify, validate JSON; syntax highlighting; sample templates
2. **Base64 / JWT Decoder** — encode/decode Base64; parse JWT header + payload + signature
3. **cURL Converter** — parse cURL commands → Fetch / Axios / XHR code
4. **Regex Tester** — live match highlighting, flag toggles, capture groups, common patterns
5. **Color Picker** — HEX/RGB/RGBA/HSL/HSLA conversion, color history, accessibility preview
6. **Markdown Preview** — live split-view, GFM, HTML export, cheat sheet
7. **API Tester** — all HTTP methods, custom headers/body, response timing, request history

## Security Rules

- Context isolation **on**, nodeIntegration **off** — never reverse these.
- All new IPC channels must be declared in `preload.js`; never use `ipcRenderer` directly in components.
- Sanitize any rendered HTML with DOMPurify (already in use in MarkdownPreview).
- Validate user input at component boundaries, not deep in utilities.

## Coding Conventions

- One component per file, co-located CSS (e.g. `Foo.js` + `Foo.css`).
- New tools follow the same pattern: route in `App.js`, nav entry in `Sidebar.js`, Tools menu item in `main.js`.
- Dark mode via a `darkMode` boolean state prop — keep consistent with existing components.
- Copy-to-clipboard via `navigator.clipboard.writeText()` — already mocked in test setup.
- No TypeScript currently; keep JS for consistency unless explicitly migrating.

## Testing

- Unit tests live in `src/__tests__/components/`.
- `src/__tests__/setup.js` mocks `window.electronAPI`, clipboard, and URL — import it for every component test.
- E2E config: `jest.e2e.config.js`, tests in `src/__tests__/e2e/`.
