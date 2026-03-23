# Dev Toolbox — Project Architecture & Structure

## What Is This?

Dev Toolbox is a cross-platform desktop application that bundles essential developer utilities into a single app. Built with Electron (desktop shell) and React (UI), it runs on macOS, Windows, and Linux.

**App ID:** `com.devtools.toolbox`
**Version:** 1.0.0
**Dev server port:** 3004

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Electron Process                   │
│                                                      │
│  ┌─────────────────┐       ┌──────────────────────┐ │
│  │   Main Process  │ IPC   │  Renderer Process    │ │
│  │  (main.js)      │◄─────►│  (React SPA)         │ │
│  │                 │       │                      │ │
│  │  - BrowserWindow│       │  - React 18          │ │
│  │  - Native menus │       │  - React Router 6    │ │
│  │  - File dialogs │       │  - CodeMirror 6      │ │
│  │  - IPC handlers │       │  - 7 tool components │ │
│  └────────┬────────┘       └──────────────────────┘ │
│           │ preload.js                               │
│           │ (window.electronAPI bridge)              │
└───────────┼─────────────────────────────────────────┘
            │
            ▼
     Native OS APIs
  (file system, dialogs)
```

---

## Directory Structure

```
dev_tool_box/
│
├── src/                          # All source code
│   │
│   ├── main/                     # Electron main process
│   │   ├── main.js               # Entry: BrowserWindow, menus, IPC handlers
│   │   └── preload.js            # IPC bridge — window.electronAPI
│   │
│   ├── components/               # React UI components (one per tool)
│   │   ├── Home.js               # Landing page with tool cards
│   │   ├── Home.css
│   │   ├── Sidebar.js            # Left navigation with all tool links
│   │   ├── Sidebar.css
│   │   ├── JsonFormatter.js      # Tool 1: JSON format/validate/minify
│   │   ├── Decoder.js            # Tool 2: Base64 encode/decode + JWT parser
│   │   ├── CurlConverter.js      # Tool 3: cURL → Fetch/Axios/XHR
│   │   ├── RegexTester.js        # Tool 4: Live regex match tester
│   │   ├── ColorPicker.js        # Tool 5: Color format converter
│   │   ├── MarkdownPreview.js    # Tool 6: Live markdown renderer
│   │   └── ApiTester.js          # Tool 7: REST API client
│   │
│   ├── __tests__/                # Test suite
│   │   ├── setup.js              # Global test mocks (Electron, clipboard)
│   │   └── components/
│   │       └── JsonFormatter.test.js
│   │
│   ├── App.js                    # Root: Router + menu event listener
│   ├── App.css                   # Tool layout, split-pane, syntax highlight
│   ├── index.js                  # React DOM entry point
│   └── index.css                 # Global design system
│
├── public/                       # Static assets served by CRA
│   ├── index.html                # HTML shell
│   ├── manifest.json             # PWA manifest
│   └── favicon.ico
│
├── docs/                         # Project documentation
│   └── index.md                  # This file
│
├── .claude/                      # Claude Code workspace config
│   ├── context/                  # Background context for Claude
│   ├── rules/                    # Coding rules and standards
│   └── agents/                   # Agent task definitions
│
├── CLAUDE.md                     # Claude Code primary guide
├── package.json                  # Dependencies, scripts, Electron Builder config
├── jest.e2e.config.js            # E2E test configuration
├── README.md                     # User-facing documentation
└── .gitignore
```

---

## Tool Inventory

| # | Route | Component | Key Libraries |
|---|-------|-----------|--------------|
| 1 | `/json-formatter` | `JsonFormatter.js` | CodeMirror (JSON, JS), js-beautify |
| 2 | `/decoder` | `Decoder.js` | jwt-decode, btoa/atob |
| 3 | `/curl-converter` | `CurlConverter.js` | Custom parser, CodeMirror (JS) |
| 4 | `/regex-tester` | `RegexTester.js` | Native JS RegExp |
| 5 | `/color-picker` | `ColorPicker.js` | react-color (SketchPicker) |
| 6 | `/markdown-preview` | `MarkdownPreview.js` | marked, DOMPurify, CodeMirror (MD/HTML) |
| 7 | `/api-tester` | `ApiTester.js` | Axios, CodeMirror (JSON) |

---

## Data Flow per Tool

Most tools follow this pattern:

```
User Input (textarea / CodeMirror editor)
        │
        ▼
  Local state (useState)
        │
        ▼
  Processing function (pure JS, runs in renderer)
        │
        ▼
  Output state → displayed in result panel
        │
        ▼
  Optional: copy-to-clipboard / file save (via electronAPI)
```

The API Tester is the exception — it makes real HTTP requests via Axios from the renderer process.

---

## IPC Communication

```
Renderer (React)          Preload (window.electronAPI)     Main Process
─────────────────         ────────────────────────────     ────────────
getAppVersion()      ───► ipcRenderer.invoke()        ───► handle('get-app-version')
showSaveDialog()     ───► ipcRenderer.invoke()        ───► handle('show-save-dialog')
onNavigateTo(cb)     ◄─── ipcRenderer.on()            ◄─── webContents.send()
onMenuNew(cb)        ◄─── ipcRenderer.on()            ◄─── menu click handler
onMenuOpen(cb)       ◄─── ipcRenderer.on()            ◄─── menu click handler
```

---

## Build & Packaging

```
npm run dev           →  CRA dev server (port 3004) + Electron watching localhost
npm run build         →  React production build → build/
npm run build-all     →  Electron Builder packages for all platforms:

  macOS:   dist/Dev Toolbox-{version}-universal.dmg
  Windows: dist/Dev Toolbox Setup {version}.exe  (NSIS)
  Linux:   dist/Dev Toolbox-{version}.AppImage
           dist/dev-toolbox_{version}_amd64.deb
```

---

## Styling System

Global design tokens are defined in `src/index.css`:

| Token | Value |
|-------|-------|
| Primary button | `#3498db` |
| Success | `#27ae60` |
| Danger | `#e74c3c` |
| Sidebar bg | `#2c3e50` |
| Font | System font stack |

Component-level CSS is co-located with each `.js` file.

---

## Testing Strategy

| Type | Location | Runner |
|------|----------|--------|
| Unit (component) | `src/__tests__/components/` | `npm test` |
| E2E | `src/__tests__/e2e/` | `npm run test:e2e` |

Mock setup in `src/__tests__/setup.js` covers:
- `window.electronAPI` — all 5 methods stubbed
- `navigator.clipboard.writeText`
- `URL.createObjectURL` / `URL.revokeObjectURL`

---

## Key Constraints & Decisions

- **No TypeScript** — project is plain JS; keep consistent unless explicitly migrating.
- **Context isolation ON** — all IPC must go through `preload.js`; never import `ipcRenderer` directly in components.
- **No backend server** — all processing is client-side in the renderer. The only network calls are from ApiTester (user-initiated).
- **Dark mode** — implemented per-component via a `darkMode` boolean state; not a global theme context yet.
- **Port 3004** — hardcoded in `main.js` for dev. CRA's `PORT` env var must match.
