# Agent: Add New Tool

## Purpose
Step-by-step checklist for adding a new developer utility to Dev Toolbox.

## Inputs Required
- Tool name (e.g. "UUID Generator")
- Route slug (e.g. `uuid-generator`)
- Brief description (for sidebar and home card)
- Icon/emoji for sidebar

## Checklist

### 1. Component
- [ ] Create `src/components/{ToolName}.js`
- [ ] Create `src/components/{ToolName}.css`
- [ ] Implement: dark mode toggle, sample data button, copy-to-clipboard, clear button
- [ ] Follow split-pane layout: input panel (left) + output panel (right)

### 2. Routing
- [ ] Import component in `src/App.js`
- [ ] Add `<Route path="/{route-slug}" element={<ToolName />} />` inside the routes

### 3. Navigation
- [ ] Add entry to `src/components/Sidebar.js` nav items array with name, path, icon, description

### 4. Native Menu
- [ ] Add menu item under Tools submenu in `src/main/main.js`
- [ ] Wire click handler to send `navigate-to` IPC message with route

### 5. Home Page
- [ ] Add tool card to `src/components/Home.js` with name, description, feature tags, link

### 6. Tests
- [ ] Create `src/__tests__/components/{ToolName}.test.js`
- [ ] Test: renders without crash, sample button loads data, clear button resets, dark mode toggles

### 7. Docs
- [ ] Add row to tool inventory table in `docs/index.md`
- [ ] Update CLAUDE.md tool list if needed
