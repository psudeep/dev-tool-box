import React, { useState, useRef, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import axios from 'axios';
import './ApiTester.css';

/* ── tiny helpers ─────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

const METHOD_COLORS = {
  GET: '#61affe', POST: '#49cc90', PUT: '#fca130',
  PATCH: '#50e3c2', DELETE: '#f93e3e', HEAD: '#9012fe', OPTIONS: '#0d5aa7',
};

const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const tryFixJson = (s) => {
  s = s.trim()
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/'/g, '"')
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');
  return s;
};
const beautifyJson = (r) => {
  try { return JSON.stringify(JSON.parse(r), null, 2); }
  catch { try { return JSON.stringify(JSON.parse(tryFixJson(r)), null, 2); } catch { return r; } }
};
const validateJson = (r) => {
  if (!r.trim()) return null;
  try { JSON.parse(r); return null; } catch (e) { return e.message; }
};

const DEFAULT_ENVS = [{ id: 'none', name: 'No Environment', vars: [] }];
const DEFAULT_HEADERS = () => [
  { key: 'Content-Type', value: 'application/json', enabled: true },
  { key: '', value: '', enabled: true },
];

const newTab = (overrides = {}) => ({
  id: uid(),
  name: 'New Request',
  method: 'GET',
  url: '',
  params: [{ key: '', value: '', enabled: true }],
  headers: DEFAULT_HEADERS(),
  bodyType: 'none',
  bodyRaw: '',
  authType: 'none',
  bearerToken: '',
  basicUser: '',
  basicPass: '',
  response: null,
  loading: false,
  dirty: false,
  reqTab: 'params',
  respTab: 'body',
  collectionId: null,
  requestId: null,
  ...overrides,
});

/* ── component ────────────────────────────────────────── */
export default function ApiTester() {
  /* tabs */
  const [tabs, setTabs] = useState(() => lsGet('api-tabs', [newTab()]));
  const [activeId, setActiveId] = useState(() => lsGet('api-active-tab', null) || tabs[0]?.id);
  const tabsRef = useRef(null);

  /* collections & envs */
  const [collections, setCollections] = useState(() => lsGet('api-collections', []));
  const [expandedCols, setExpandedCols] = useState({});
  const [environments, setEnvironments] = useState(() => lsGet('api-environments', DEFAULT_ENVS));
  const [activeEnvId, setActiveEnvId] = useState(() => localStorage.getItem('api-active-env') || 'none');

  /* UI */
  const [methodOpen, setMethodOpen] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  /* modals */
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveReqName, setSaveReqName] = useState('');
  const [saveToColId, setSaveToColId] = useState('');
  const [showNewColModal, setShowNewColModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [envSelId, setEnvSelId] = useState('none');
  const [newEnvName, setNewEnvName] = useState('');

  /* collection context menu + rename */
  const [colMenuOpen, setColMenuOpen] = useState(null); // colId or null
  const [renamingCol, setRenamingCol] = useState(null); // { id, name } or null
  const colMenuRef = useRef(null);

  /* resizable split pane */
  const [reqHeight, setReqHeight] = useState(270);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);
  const mainRef = useRef(null);

  const onResizerMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartH.current = reqHeight;

    const onMove = (ev) => {
      if (!isDragging.current) return;
      const delta = ev.clientY - dragStartY.current;
      const maxH = mainRef.current
        ? Math.floor(mainRef.current.clientHeight * 0.78)
        : window.innerHeight * 0.78;
      setReqHeight(Math.max(90, Math.min(maxH, dragStartH.current + delta)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const methodRef = useRef(null);

  /* persist */
  useEffect(() => { lsSet('api-collections', collections); }, [collections]);
  useEffect(() => { lsSet('api-environments', environments); }, [environments]);
  useEffect(() => { localStorage.setItem('api-active-env', activeEnvId); }, [activeEnvId]);
  useEffect(() => {
    // persist tabs without response (too big)
    const slim = tabs.map(t => ({ ...t, response: null, loading: false }));
    lsSet('api-tabs', slim);
    lsSet('api-active-tab', activeId);
  }, [tabs, activeId]);

  /* active tab helpers */
  const at = tabs.find(t => t.id === activeId) || tabs[0] || newTab();

  const upd = useCallback((updates) => {
    setTabs(prev => prev.map(t =>
      t.id === activeId ? { ...t, ...updates, dirty: t.requestId ? true : t.dirty } : t
    ));
  }, [activeId]);

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = (e) => {
      if (methodRef.current && !methodRef.current.contains(e.target)) setMethodOpen(false);
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setColMenuOpen(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── tab management ─────────────────────────────────── */
  const addTab = (override) => {
    const t = newTab(override);
    setTabs(prev => [...prev, t]);
    setActiveId(t.id);
  };

  const closeTab = (id, e) => {
    e.stopPropagation();
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (next.length === 0) { const t = newTab(); return [t]; }
      return next;
    });
    if (activeId === id) {
      const idx = tabs.findIndex(t => t.id === id);
      const next = tabs[idx + 1] || tabs[idx - 1];
      if (next) setActiveId(next.id);
    }
  };

  const duplicateTab = () => {
    const t = newTab({ ...at, id: uid(), name: at.name + ' Copy', response: null, loading: false });
    setTabs(prev => [...prev, t]);
    setActiveId(t.id);
  };

  /* ── env interpolation ──────────────────────────────── */
  const interpolate = useCallback((str) => {
    if (!str) return str;
    const env = environments.find(e => e.id === activeEnvId);
    if (!env) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => {
      const v = env.vars.find(v => v.key === k);
      return v ? v.value : `{{${k}}}`;
    });
  }, [environments, activeEnvId]);

  /* ── build request parts ───────────────────────────── */
  const buildUrl = (tab = at) => {
    const base = interpolate(tab.url).split('?')[0];
    const active = tab.params.filter(p => p.enabled && p.key);
    if (!active.length) return interpolate(tab.url);
    const qs = active.map(p => `${encodeURIComponent(interpolate(p.key))}=${encodeURIComponent(interpolate(p.value))}`).join('&');
    return `${base}?${qs}`;
  };

  const buildHeaders = (tab = at) => {
    const h = {};
    tab.headers.filter(r => r.enabled && r.key).forEach(r => { h[interpolate(r.key)] = interpolate(r.value); });
    if (tab.authType === 'bearer' && tab.bearerToken) h['Authorization'] = `Bearer ${interpolate(tab.bearerToken)}`;
    if (tab.authType === 'basic' && tab.basicUser)
      h['Authorization'] = `Basic ${btoa(`${interpolate(tab.basicUser)}:${interpolate(tab.basicPass)}`)}`;
    return h;
  };

  const generateCurl = (tab = at) => {
    const u = buildUrl(tab);
    const h = buildHeaders(tab);
    let curl = `curl -X ${tab.method} '${u}'`;
    Object.entries(h).forEach(([k, v]) => { curl += ` \\\n  -H '${k}: ${v}'`; });
    if (['POST', 'PUT', 'PATCH'].includes(tab.method) && tab.bodyRaw)
      curl += ` \\\n  -d '${interpolate(tab.bodyRaw).replace(/'/g, "\\'")}'`;
    return curl;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  /* ── make request ───────────────────────────────────── */
  const makeRequest = async (tabId = activeId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.url) return;

    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, loading: true, response: null } : t));
    const start = Date.now();

    try {
      const finalUrl = buildUrl(tab);
      const h = buildHeaders(tab);
      let data;
      if (['POST', 'PUT', 'PATCH'].includes(tab.method) && tab.bodyRaw)
        try { data = JSON.parse(interpolate(tab.bodyRaw)); } catch { data = interpolate(tab.bodyRaw); }

      const res = await axios({ method: tab.method.toLowerCase(), url: finalUrl, headers: h, data, timeout: 30000, validateStatus: () => true });
      const elapsed = Date.now() - start;
      const bodyStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      const result = {
        status: res.status, statusText: res.statusText, headers: res.headers,
        data: res.data, bodyStr, time: elapsed,
        size: new TextEncoder().encode(bodyStr).length,
        timestamp: new Date().toISOString(), error: false,
      };
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, loading: false, response: result, respTab: 'body' } : t));
      setHistory(prev => [{ id: Date.now(), method: tab.method, url: finalUrl, status: res.status, time: elapsed, timestamp: result.timestamp }, ...prev.slice(0, 49)]);
    } catch (err) {
      const result = { error: true, message: err.message, status: err.response?.status || 'ERR', statusText: err.response?.statusText || 'Network Error', time: Date.now() - start, timestamp: new Date().toISOString() };
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, loading: false, response: result } : t));
    }
  };

  /* ── collections ────────────────────────────────────── */
  const loadRequest = (req, colId) => {
    // Check if already open in a tab
    const existing = tabs.find(t => t.requestId === req.id);
    if (existing) { setActiveId(existing.id); return; }
    addTab({
      ...req, id: uid(), dirty: false,
      collectionId: colId, requestId: req.id,
      response: null, loading: false, reqTab: 'params', respTab: 'body',
    });
  };

  const openSaveModal = () => {
    const name = at.requestId
      ? collections.flatMap(c => c.requests).find(r => r.id === at.requestId)?.name || at.name
      : at.url ? (at.url.split('/').pop().split('?')[0] || 'New Request') : 'New Request';
    setSaveReqName(name);
    setSaveToColId(at.collectionId || collections[0]?.id || '');
    setShowSaveModal(true);
  };

  const doSave = () => {
    if (!saveReqName.trim() || !saveToColId) return;
    const snap = { method: at.method, url: at.url, params: at.params, headers: at.headers, bodyType: at.bodyType, bodyRaw: at.bodyRaw, authType: at.authType, bearerToken: at.bearerToken, basicUser: at.basicUser, basicPass: at.basicPass };
    setCollections(prev => prev.map(col => {
      if (col.id !== saveToColId) return col;
      const existing = at.requestId ? col.requests.find(r => r.id === at.requestId) : null;
      if (existing) return { ...col, requests: col.requests.map(r => r.id === at.requestId ? { ...r, ...snap, name: saveReqName } : r) };
      const newReq = { id: uid(), name: saveReqName, ...snap };
      setTabs(p => p.map(t => t.id === activeId ? { ...t, name: saveReqName, requestId: newReq.id, collectionId: saveToColId, dirty: false } : t));
      return { ...col, requests: [...col.requests, newReq] };
    }));
    if (at.requestId) setTabs(p => p.map(t => t.id === activeId ? { ...t, name: saveReqName, dirty: false } : t));
    setShowSaveModal(false);
  };

  const deleteRequest = (colId, reqId) => {
    setCollections(prev => prev.map(c => c.id === colId ? { ...c, requests: c.requests.filter(r => r.id !== reqId) } : c));
    setTabs(prev => prev.map(t => t.requestId === reqId ? { ...t, requestId: null, collectionId: null } : t));
  };

  const createCollection = () => {
    if (!newColName.trim()) return;
    const col = { id: uid(), name: newColName.trim(), requests: [] };
    setCollections(prev => [...prev, col]);
    setExpandedCols(prev => ({ ...prev, [col.id]: true }));
    setSaveToColId(col.id);
    setNewColName('');
    setShowNewColModal(false);
  };

  const renameCollection = (id, name) => {
    if (!name.trim()) return;
    setCollections(prev => prev.map(c => c.id === id ? { ...c, name: name.trim() } : c));
    setRenamingCol(null);
  };

  /* Postman v2.1 export */
  const exportCollection = (col) => {
    const parseUrl = (raw) => {
      try {
        const u = new URL(raw);
        return {
          raw,
          protocol: u.protocol.replace(':', ''),
          host: u.hostname.split('.'),
          path: u.pathname.split('/').filter(Boolean),
          query: [...u.searchParams.entries()].map(([k, v]) => ({ key: k, value: v })),
        };
      } catch { return { raw }; }
    };

    const postman = {
      info: {
        _postman_id: uid(),
        name: col.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        _exporter_id: 'dev-toolbox',
      },
      item: col.requests.map(req => {
        const item = {
          name: req.name,
          request: {
            method: req.method,
            header: (req.headers || [])
              .filter(h => h.enabled && h.key)
              .map(h => ({ key: h.key, value: h.value, type: 'text' })),
            url: parseUrl(req.url),
          },
          response: [],
        };

        // Auth
        if (req.authType === 'bearer') {
          item.request.auth = { type: 'bearer', bearer: [{ key: 'token', value: req.bearerToken || '', type: 'string' }] };
        } else if (req.authType === 'basic') {
          item.request.auth = { type: 'basic', basic: [{ key: 'username', value: req.basicUser || '', type: 'string' }, { key: 'password', value: req.basicPass || '', type: 'string' }] };
        }

        // Body
        if (req.bodyType && req.bodyType !== 'none') {
          if (req.bodyType === 'raw') {
            item.request.body = { mode: 'raw', raw: req.bodyRaw || '', options: { raw: { language: (req.rawLang || 'json').toLowerCase() } } };
          } else if (req.bodyType === 'form-data') {
            item.request.body = { mode: 'formdata', formdata: (req.params || []).filter(p => p.key).map(p => ({ key: p.key, value: p.value, type: 'text' })) };
          } else if (req.bodyType === 'x-www-form-urlencoded') {
            item.request.body = { mode: 'urlencoded', urlencoded: (req.params || []).filter(p => p.key).map(p => ({ key: p.key, value: p.value, type: 'text' })) };
          }
        }

        return item;
      }),
    };

    const blob = new Blob([JSON.stringify(postman, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${col.name.replace(/\s+/g, '_')}.postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setColMenuOpen(null);
  };

  /* ── environments ───────────────────────────────────── */
  const createEnv = () => {
    if (!newEnvName.trim()) return;
    const env = { id: uid(), name: newEnvName.trim(), vars: [] };
    setEnvironments(prev => [...prev, env]);
    setEnvSelId(env.id);
    setNewEnvName('');
  };
  const updateEnvVar = (envId, idx, field, val) =>
    setEnvironments(prev => prev.map(e => e.id !== envId ? e : { ...e, vars: e.vars.map((v, i) => i === idx ? { ...v, [field]: val } : v) }));
  const addEnvVar = (envId) =>
    setEnvironments(prev => prev.map(e => e.id !== envId ? e : { ...e, vars: [...e.vars, { key: '', value: '' }] }));
  const removeEnvVar = (envId, idx) =>
    setEnvironments(prev => prev.map(e => e.id !== envId ? e : { ...e, vars: e.vars.filter((_, i) => i !== idx) }));
  const deleteEnv = (id) => {
    if (id === 'none') return;
    setEnvironments(prev => prev.filter(e => e.id !== id));
    if (envSelId === id) setEnvSelId('none');
    if (activeEnvId === id) setActiveEnvId('none');
  };

  /* ── kv helpers ─────────────────────────────────────── */
  const addRow = (field) => upd({ [field]: [...at[field], { key: '', value: '', enabled: true }] });
  const updateRow = (field, idx, key, val) => upd({ [field]: at[field].map((r, i) => i === idx ? { ...r, [key]: val } : r) });
  const removeRow = (field, idx) => upd({ [field]: at[field].filter((_, i) => i !== idx) });

  /* ── misc ───────────────────────────────────────────── */
  const getStatusClass = (s) => {
    if (typeof s === 'string') return 'sc-err';
    if (s >= 200 && s < 300) return 'sc-2xx';
    if (s >= 300 && s < 400) return 'sc-3xx';
    if (s >= 400 && s < 500) return 'sc-4xx';
    return 'sc-5xx';
  };
  const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const resolvedUrl = interpolate(at.url);
  const hasVars = at.url !== resolvedUrl;

  // breadcrumb
  const parentCol = at.collectionId ? collections.find(c => c.id === at.collectionId) : null;
  const jsonError = at.reqTab === 'body' && at.bodyType === 'json' ? validateJson(at.bodyRaw) : null;

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div className="apt">

      {/* ═══ COLLECTIONS PANEL ═══ */}
      <aside className="apt-sidebar">
        <div className="apt-sb-head">
          <span>Collections</span>
          <button className="apt-sb-add" onClick={() => setShowNewColModal(true)} title="New Collection">+</button>
        </div>

        {/* env selector */}
        <div className="apt-env-row">
          <select className="apt-env-sel" value={activeEnvId} onChange={e => setActiveEnvId(e.target.value)}>
            {environments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button className="apt-env-btn" onClick={() => { setEnvSelId(activeEnvId); setShowEnvModal(true); }}>⚙</button>
        </div>

        {/* tree */}
        <div className="apt-tree">
          {collections.length === 0 && (
            <div className="apt-tree-empty">
              <p>No collections</p>
              <button className="apt-tree-cta" onClick={() => setShowNewColModal(true)}>+ New Collection</button>
            </div>
          )}
          {collections.map(col => (
            <div key={col.id} className="apt-col">
              {/* Collection header row */}
              <div className="apt-col-row" onClick={() => setExpandedCols(p => ({ ...p, [col.id]: !p[col.id] }))}>
                <span className="apt-col-arrow">{expandedCols[col.id] ? '▾' : '▸'}</span>

                {/* Inline rename input or name */}
                {renamingCol?.id === col.id ? (
                  <input
                    className="apt-col-rename-input"
                    value={renamingCol.name}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onChange={e => setRenamingCol({ id: col.id, name: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') renameCollection(col.id, renamingCol.name);
                      if (e.key === 'Escape') setRenamingCol(null);
                    }}
                    onBlur={() => renameCollection(col.id, renamingCol.name)}
                  />
                ) : (
                  <span className="apt-col-name">{col.name}</span>
                )}

                {/* + add request to this collection */}
                <button
                  className="apt-col-act apt-col-add"
                  title="Add new request"
                  onClick={e => {
                    e.stopPropagation();
                    setExpandedCols(p => ({ ...p, [col.id]: true }));
                    setSaveReqName('New Request');
                    setSaveToColId(col.id);
                    setShowSaveModal(true);
                  }}
                >+</button>

                {/* ··· context menu */}
                <div className="apt-col-menu-wrap" ref={colMenuOpen === col.id ? colMenuRef : null}>
                  <button
                    className="apt-col-act apt-col-dots"
                    title="More options"
                    onClick={e => { e.stopPropagation(); setColMenuOpen(v => v === col.id ? null : col.id); }}
                  >···</button>
                  {colMenuOpen === col.id && (
                    <div className="apt-col-menu">
                      <button onClick={e => { e.stopPropagation(); setRenamingCol({ id: col.id, name: col.name }); setColMenuOpen(null); }}>✏ Rename</button>
                      <button onClick={e => { e.stopPropagation(); exportCollection(col); }}>⬇ Export (Postman JSON)</button>
                      <div className="apt-col-menu-divider" />
                      <button className="apt-col-menu-danger" onClick={e => { e.stopPropagation(); setCollections(p => p.filter(c => c.id !== col.id)); setColMenuOpen(null); }}>✕ Delete collection</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Requests list */}
              {expandedCols[col.id] && (
                <div className="apt-col-reqs">
                  {col.requests.length === 0 && <div className="apt-req-none">No requests — click + to add</div>}
                  {col.requests.map(req => (
                    <div
                      key={req.id}
                      className={`apt-req ${tabs.some(t => t.requestId === req.id && t.id === activeId) ? 'apt-req--active' : ''}`}
                      onClick={() => loadRequest(req, col.id)}
                    >
                      <span className="apt-req-m" style={{ color: METHOD_COLORS[req.method] }}>{req.method}</span>
                      <span className="apt-req-n">{req.name}</span>
                      <button className="apt-req-del" onClick={e => { e.stopPropagation(); deleteRequest(col.id, req.id); }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="apt-main" ref={mainRef}>

        {/* ── Tab bar ── */}
        <div className="apt-tabbar" ref={tabsRef}>
          <div className="apt-tabbar-scroll">
            {tabs.map(t => (
              <div
                key={t.id}
                className={`apt-tab ${t.id === activeId ? 'apt-tab--active' : ''}`}
                onClick={() => setActiveId(t.id)}
              >
                <span className="apt-tab-m" style={{ color: METHOD_COLORS[t.method] || '#888' }}>{t.method}</span>
                <span className="apt-tab-n">{t.name || 'New Request'}</span>
                {t.dirty && <span className="apt-tab-dot" title="Unsaved changes" />}
                {t.loading && <span className="apt-tab-spin" />}
                <button className="apt-tab-x" onClick={e => closeTab(t.id, e)} title="Close tab">✕</button>
              </div>
            ))}
          </div>
          {/* New tab button — always visible */}
          <button
            className="apt-tabbar-add"
            onClick={() => addTab()}
            title="New Request (Ctrl+T)"
          >＋</button>
        </div>

        {/* ── Breadcrumb + actions ── */}
        <div className="apt-crumb-bar">
          <div className="apt-crumb">
            {parentCol && <><span className="apt-crumb-col">{parentCol.name}</span><span className="apt-crumb-sep"> › </span></>}
            <span className="apt-crumb-req">{at.name}</span>
          </div>
          <div className="apt-crumb-actions">
            <button className="apt-btn-ghost" onClick={openSaveModal}>💾 Save</button>
            <button className={`apt-btn-ghost ${copiedCurl ? 'apt-btn-ghost--ok' : ''}`} onClick={copyCurl}>⎘ {copiedCurl ? 'Copied!' : 'Copy cURL'}</button>
            <button className={`apt-btn-ghost ${showHistory ? 'apt-btn-ghost--active' : ''}`} onClick={() => setShowHistory(h => !h)}>
              ⏱ History {history.length > 0 && <span className="apt-badge">{history.length}</span>}
            </button>
          </div>
        </div>

        {/* ── URL bar ── */}
        <div className="apt-url-bar">
          <div className="apt-method-wrap" ref={methodRef}>
            <button className="apt-method-btn" style={{ color: METHOD_COLORS[at.method] }} onClick={() => setMethodOpen(o => !o)}>
              {at.method} <span className="apt-chev">▾</span>
            </button>
            {methodOpen && (
              <div className="apt-method-dd">
                {Object.keys(METHOD_COLORS).map(m => (
                  <div key={m} className={`apt-method-opt ${m === at.method ? 'active' : ''}`}
                    style={{ color: METHOD_COLORS[m] }}
                    onClick={() => { upd({ method: m }); setMethodOpen(false); }}>
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="apt-url-wrap">
            <input
              className="apt-url-input"
              placeholder="Enter URL or paste cURL  ·  use {{VARIABLE}} for env vars"
              value={at.url}
              onChange={e => upd({ url: e.target.value, name: e.target.value ? (e.target.value.split('/').pop().split('?')[0] || at.name) : at.name })}
              onKeyDown={e => e.key === 'Enter' && makeRequest()}
            />
            {hasVars && <div className="apt-url-resolved">→ {resolvedUrl}</div>}
          </div>

          <button className="apt-send-btn" onClick={() => makeRequest()} disabled={at.loading || !at.url}>
            {at.loading ? <><span className="apt-btn-spin" /> Sending</> : 'Send'}
          </button>
        </div>

        {/* ── Request config tabs ── */}
        <div className="apt-req-section" style={{ height: reqHeight }}>
          <div className="apt-req-tabs">
            <div className="apt-req-tabs-left">
              {['params', 'authorization', 'headers', 'body'].map(t => {
                const badges = { params: at.params.filter(p => p.enabled && p.key).length, headers: at.headers.filter(h => h.enabled && h.key).length };
                return (
                  <button key={t} className={`apt-rtab ${at.reqTab === t ? 'active' : ''}`} onClick={() => upd({ reqTab: t })}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    {badges[t] > 0 && <span className="apt-rtab-badge">{badges[t]}</span>}
                    {t === 'authorization' && at.authType !== 'none' && <span className="apt-rtab-dot" />}
                    {t === 'body' && at.bodyType !== 'none' && at.bodyRaw && <span className="apt-rtab-dot apt-rtab-dot--orange" />}
                  </button>
                );
              })}
            </div>
            <div className="apt-req-tabs-right">
              <button className="apt-rtab apt-rtab--dim">Cookies</button>
            </div>
          </div>

          <div className="apt-req-body">
            {/* Params */}
            {at.reqTab === 'params' && (
              <KVTable
                rows={at.params}
                onAdd={() => addRow('params')}
                onUpdate={(i, f, v) => updateRow('params', i, f, v)}
                onRemove={i => removeRow('params', i)}
                kPlaceholder="param key" vPlaceholder="value"
              />
            )}

            {/* Authorization */}
            {at.reqTab === 'authorization' && (
              <div className="apt-auth">
                <div className="apt-auth-row">
                  <label>Auth Type</label>
                  <select value={at.authType} onChange={e => upd({ authType: e.target.value })}>
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>
                {at.authType === 'bearer' && (
                  <div className="apt-auth-fields">
                    <label>Token</label>
                    <input className="apt-field" placeholder="Bearer token or {{TOKEN}}" value={at.bearerToken} onChange={e => upd({ bearerToken: e.target.value })} />
                  </div>
                )}
                {at.authType === 'basic' && (
                  <div className="apt-auth-fields">
                    <label>Username</label>
                    <input className="apt-field" placeholder="Username or {{USERNAME}}" value={at.basicUser} onChange={e => upd({ basicUser: e.target.value })} />
                    <label>Password</label>
                    <input className="apt-field" type="password" placeholder="Password or {{PASSWORD}}" value={at.basicPass} onChange={e => upd({ basicPass: e.target.value })} />
                  </div>
                )}
                {at.authType === 'none' && <p className="apt-hint">Select an auth type above. Credentials are injected into the request headers automatically.</p>}
              </div>
            )}

            {/* Headers */}
            {at.reqTab === 'headers' && (
              <KVTable
                rows={at.headers}
                onAdd={() => addRow('headers')}
                onUpdate={(i, f, v) => updateRow('headers', i, f, v)}
                onRemove={i => removeRow('headers', i)}
                kPlaceholder="Header name" vPlaceholder="value"
              />
            )}

            {/* Body */}
            {at.reqTab === 'body' && (
              <div className="apt-body">
                <div className="apt-body-types">
                  {['none', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary', 'GraphQL'].map(bt => (
                    <label key={bt} className="apt-body-opt">
                      <input type="radio" name={`bt-${at.id}`} checked={at.bodyType === bt} onChange={() => upd({ bodyType: bt })} />
                      {bt}
                    </label>
                  ))}
                  {at.bodyType === 'raw' && (
                    <select className="apt-raw-lang" value={at.rawLang || 'JSON'} onChange={e => upd({ rawLang: e.target.value })}>
                      {['JSON', 'Text', 'XML', 'HTML', 'JavaScript'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  )}
                  {at.bodyType === 'raw' && (
                    <div className="apt-body-btns">
                      <button className="apt-body-btn" onClick={() => upd({ bodyRaw: beautifyJson(at.bodyRaw) })}>Beautify</button>
                      {jsonError && <button className="apt-body-btn apt-body-btn--fix" onClick={() => upd({ bodyRaw: tryFixJson(at.bodyRaw) })}>Auto-fix</button>}
                    </div>
                  )}
                </div>

                {at.bodyType === 'none' && (
                  <div className="apt-body-none">This request does not have a body</div>
                )}
                {at.bodyType === 'raw' && (
                  <>
                    <div className={`apt-editor-wrap ${jsonError ? 'apt-editor-wrap--err' : ''}`}>
                      <CodeMirror
                        value={at.bodyRaw}
                        height="100%"
                        extensions={(at.rawLang || 'JSON') === 'JSON' ? [json()] : []}
                        theme={oneDark}
                        onChange={val => upd({ bodyRaw: val })}
                        placeholder="Request body..."
                      />
                    </div>
                    {jsonError && (
                      <div className="apt-json-err"><span>⚠</span>{jsonError}</div>
                    )}
                  </>
                )}
                {(at.bodyType === 'form-data' || at.bodyType === 'x-www-form-urlencoded') && (
                  <KVTable
                    rows={at.params}
                    onAdd={() => addRow('params')}
                    onUpdate={(i, f, v) => updateRow('params', i, f, v)}
                    onRemove={i => removeRow('params', i)}
                    kPlaceholder="key" vPlaceholder="value"
                  />
                )}
                {(at.bodyType === 'binary' || at.bodyType === 'GraphQL') && (
                  <div className="apt-body-none">{at.bodyType === 'binary' ? 'Select a file to upload' : 'GraphQL support coming soon'}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Drag handle ── */}
        <div className="apt-resizer" onMouseDown={onResizerMouseDown} title="Drag to resize" />

        {/* ── Response section ── */}
        <div className="apt-resp-section">
          <div className="apt-resp-bar">
            <div className="apt-req-tabs">
              <div className="apt-req-tabs-left">
                {['body', 'headers', 'curl'].map(t => (
                  <button key={t} className={`apt-rtab ${at.respTab === t ? 'active' : ''}`} onClick={() => upd({ respTab: t })}>
                    {t === 'curl' ? 'cURL Preview' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {at.response && !at.response.error && (
                <div className="apt-resp-meta">
                  <span className={`apt-status ${getStatusClass(at.response.status)}`}>{at.response.status} {at.response.statusText}</span>
                  <span className="apt-pill">{at.response.time} ms</span>
                  <span className="apt-pill">{fmtSize(at.response.size)}</span>
                  <button className="apt-copy-btn" onClick={() => navigator.clipboard.writeText(at.response.bodyStr)}>Copy</button>
                </div>
              )}
              {at.response?.error && <span className={`apt-status sc-err`}>{at.response.status} {at.response.statusText}</span>}
            </div>
          </div>

          <div className="apt-resp-body">
            {at.loading && (
              <div className="apt-resp-empty"><div className="apt-spinner" /><p>Sending request…</p></div>
            )}
            {!at.loading && !at.response && (
              <div className="apt-resp-empty">
                <p>Send request to get a response</p>
                <span className="apt-shortcut">⌘ ↵</span>
              </div>
            )}
            {!at.loading && at.response && (
              <>
                {at.respTab === 'body' && (
                  at.response.error
                    ? <div className="apt-err-msg">{at.response.message}</div>
                    : <CodeMirror value={at.response.bodyStr} height="100%" extensions={[json()]} theme={oneDark} editable={false} />
                )}
                {at.respTab === 'headers' && !at.response.error && (
                  <div className="apt-resp-hdrs">
                    {Object.entries(at.response.headers || {}).map(([k, v]) => (
                      <div key={k} className="apt-resp-hdr-row">
                        <span className="apt-hdr-k">{k}</span>
                        <span className="apt-hdr-v">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {at.respTab === 'curl' && (
                  <div className="apt-curl-prev">
                    <pre>{generateCurl()}</pre>
                    <button className="apt-copy-btn apt-curl-copy" onClick={copyCurl}>{copiedCurl ? '✓' : 'Copy'}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ HISTORY PANEL ═══ */}
      {showHistory && (
        <div className="apt-history">
          <div className="apt-history-head">
            <span>History</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {history.length > 0 && <button onClick={() => setHistory([])}>Clear</button>}
              <button className="apt-history-close" onClick={() => setShowHistory(false)}>✕</button>
            </div>
          </div>
          {history.length === 0 && <p className="apt-history-empty">No history yet</p>}
          {history.map(item => (
            <div key={item.id} className="apt-hist-item"
              onClick={() => { addTab({ method: item.method, url: item.url, name: item.url.split('/').pop().split('?')[0] || 'Request' }); setShowHistory(false); }}>
              <span style={{ color: METHOD_COLORS[item.method] || '#888', fontWeight: 700, fontSize: 11, minWidth: 58 }}>{item.method}</span>
              <span className="apt-hist-url">{item.url}</span>
              <span className={`apt-status ${getStatusClass(item.status)}`} style={{ fontSize: 11 }}>{item.status}</span>
              <span style={{ color: '#444', fontSize: 10 }}>{item.time}ms</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MODALS ═══ */}
      {showSaveModal && (
        <Modal title="Save Request" onClose={() => setShowSaveModal(false)}>
          <Field label="Request Name">
            <input className="apt-field" value={saveReqName} onChange={e => setSaveReqName(e.target.value)} placeholder="e.g. Get User" autoFocus />
          </Field>
          <Field label="Collection">
            {collections.length === 0
              ? <div className="apt-hint" style={{ textAlign: 'center' }}><p>No collections yet.</p><button className="apt-body-btn" onClick={() => { setShowSaveModal(false); setShowNewColModal(true); }}>+ Create Collection</button></div>
              : <select className="apt-field" value={saveToColId} onChange={e => setSaveToColId(e.target.value)}>{collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          </Field>
          <div className="apt-modal-actions">
            <button className="apt-send-btn" onClick={doSave} disabled={!saveReqName.trim() || !saveToColId}>Save</button>
            <button className="apt-btn-ghost" onClick={() => setShowSaveModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {showNewColModal && (
        <Modal title="New Collection" onClose={() => setShowNewColModal(false)}>
          <Field label="Name">
            <input className="apt-field" value={newColName} onChange={e => setNewColName(e.target.value)}
              placeholder="e.g. Regency API" autoFocus onKeyDown={e => e.key === 'Enter' && createCollection()} />
          </Field>
          <div className="apt-modal-actions">
            <button className="apt-send-btn" onClick={createCollection} disabled={!newColName.trim()}>Create</button>
            <button className="apt-btn-ghost" onClick={() => setShowNewColModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {showEnvModal && (
        <Modal title="Manage Environments" onClose={() => setShowEnvModal(false)} wide>
          <div className="apt-env-layout">
            <div className="apt-env-list">
              <div className="apt-env-list-head">Environments</div>
              {environments.map(e => (
                <div key={e.id} className={`apt-env-item ${envSelId === e.id ? 'active' : ''}`} onClick={() => setEnvSelId(e.id)}>
                  <span>{e.name}</span>
                  {e.id !== 'none' && <button className="apt-env-del" onClick={ev => { ev.stopPropagation(); deleteEnv(e.id); }}>✕</button>}
                </div>
              ))}
              <div className="apt-env-new">
                <input className="apt-field" placeholder="New env name…" value={newEnvName}
                  onChange={e => setNewEnvName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createEnv()} />
                <button className="apt-send-btn" style={{ padding: '6px 12px' }} onClick={createEnv}>+</button>
              </div>
            </div>
            <div className="apt-env-vars">
              {(() => {
                const env = environments.find(e => e.id === envSelId);
                if (!env) return <p className="apt-hint">Select an environment.</p>;
                if (env.id === 'none') return <p className="apt-hint">"No Environment" is a read-only placeholder.</p>;
                return (
                  <>
                    <div className="apt-env-vars-head">
                      <span>Variables in <strong>{env.name}</strong></span>
                      <button className="apt-send-btn" style={{ fontSize: 11, padding: '4px 12px' }} onClick={() => { setActiveEnvId(envSelId); setShowEnvModal(false); }}>Set Active</button>
                    </div>
                    <div className="apt-kv-header apt-env-kv-h"><span>Key</span><span>Value</span><span /></div>
                    {env.vars.map((v, i) => (
                      <div key={i} className="apt-kv-row apt-env-kv-r">
                        <input className="apt-field" placeholder="VARIABLE_NAME" value={v.key} onChange={e => updateEnvVar(env.id, i, 'key', e.target.value)} />
                        <input className="apt-field" placeholder="value" value={v.value} onChange={e => updateEnvVar(env.id, i, 'value', e.target.value)} />
                        <button className="apt-kv-rm" onClick={() => removeEnvVar(env.id, i)}>✕</button>
                      </div>
                    ))}
                    <button className="apt-add-row" onClick={() => addEnvVar(env.id)}>+ Add Variable</button>
                    <p className="apt-env-hint">Use <code>{'{{VARIABLE_NAME}}'}</code> in URL, headers, body, or auth fields</p>
                  </>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── KV table ────────────────────────────────────────────── */
function KVTable({ rows, onAdd, onUpdate, onRemove, kPlaceholder, vPlaceholder }) {
  return (
    <div className="apt-kv">
      <div className="apt-kv-header"><span /><span>Key</span><span>Value</span><span /></div>
      {rows.map((row, i) => (
        <div key={i} className="apt-kv-row">
          <input type="checkbox" checked={row.enabled} onChange={e => onUpdate(i, 'enabled', e.target.checked)} />
          <input className="apt-field apt-field--mono" placeholder={kPlaceholder} value={row.key} onChange={e => onUpdate(i, 'key', e.target.value)} />
          <input className="apt-field apt-field--mono" placeholder={vPlaceholder} value={row.value} onChange={e => onUpdate(i, 'value', e.target.value)} />
          <button className="apt-kv-rm" onClick={() => onRemove(i)}>✕</button>
        </div>
      ))}
      <button className="apt-add-row" onClick={onAdd}>+ Add Row</button>
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────── */
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="apt-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`apt-modal ${wide ? 'apt-modal--wide' : ''}`}>
        <div className="apt-modal-head"><span>{title}</span><button className="apt-modal-x" onClick={onClose}>✕</button></div>
        <div className="apt-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────────── */
function Field({ label, children }) {
  return <div className="apt-form-field"><label className="apt-form-label">{label}</label>{children}</div>;
}
