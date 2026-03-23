# Project Context: Dev Toolbox

## Summary
Dev Toolbox is an Electron + React desktop app providing 7 developer utilities: JSON Formatter, Base64/JWT Decoder, cURL Converter, Regex Tester, Color Picker, Markdown Preview, and API Tester.

## Current State (v1.0.0)
- All 7 tools are fully implemented and working
- Basic unit test coverage exists for JsonFormatter
- No E2E tests written yet
- Dark mode is per-component (not global)
- No persistent settings/preferences storage
- No plugin system

## Intended Users
Developers who want a fast, offline-capable, privacy-respecting toolbox without opening a browser tab.

## Key Design Principles
- Tools are self-contained — no cross-tool state
- All processing is local/client-side
- Minimal dependencies per tool
- Consistent UX: split-pane input/output, sample data, copy-to-clipboard, dark mode toggle
