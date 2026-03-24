'use client';

import React, { useState, useEffect } from 'react';
import { creativeStyles, themes } from './data';
import './styles.css';

export default function CreativePlayground() {
    const API = 'http://localhost:5517';

    const [customInput, setCustomInput] = useState('');
    const [contextFor, setContextFor] = useState('');
    const [contextWho, setContextWho] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [results, setResults] = useState({}); // { styleId: [ { input, text, tone } ] }
    const [generating, setGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const [batchStatus, setBatchStatus] = useState('');

    const updateResults = (styleId, newItem) => {
        setResults(prev => {
            const current = prev[styleId] || [];
            return { ...prev, [styleId]: [...current, newItem] };
        });
    };

    const pickTheme = (input) => {
        setSelectedTheme(input);
        setCustomInput(input);
    };

    const selectCard = (id) => {
        setSelectedStyleId(id);
    };

    const callAPI = async (styleName, input, defaults) => {
        const body = {
            voice: styleName,
            input: input,
            mode: 'creative',
            size: defaults.size,
            sentence_style: defaults.sentence_style,
            language: 'english'
        };
        if (contextFor) body.context_for = contextFor;
        if (contextWho) body.context_who = contextWho;

        const resp = await fetch(`${API}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const data = await resp.json();
        return data.text || data.aphorism || '';
    };

    const generateOne = async () => {
        if (generating) return;
        if (!customInput.trim()) { alert('Enter an input or pick a theme'); return; }
        if (!selectedStyleId) { alert('Click a style card first'); return; }

        const style = creativeStyles.find(s => s.id === selectedStyleId);
        setGenerating(true);
        setStatus(`Generating ${style.name} for "${customInput}"...`);

        try {
            const text = await callAPI(style.name, customInput, style.defaults);
            updateResults(style.id, { input: customInput, text });
            setStatus(`Done — ${text.split(/\s+/).length} words`);
        } catch (e) {
            setStatus(`Error: ${e.message}`);
        }
        setGenerating(false);
    };

    const generateAll = async () => {
        if (generating) return;
        if (!customInput.trim()) { alert('Enter an input or pick a theme'); return; }

        setGenerating(true);
        for (let i = 0; i < creativeStyles.length; i++) {
            const style = creativeStyles[i];
            setStatus(`${i + 1}/${creativeStyles.length} — ${style.name}...`);

            try {
                const text = await callAPI(style.name, customInput, style.defaults);
                updateResults(style.id, { input: customInput, text });
            } catch (e) {
                setStatus(`Error on ${style.name}: ${e.message}`);
            }
            if (i < creativeStyles.length - 1) await new Promise(r => setTimeout(r, 300));
        }

        setStatus(`All 20 done for "${customInput}"`);
        setGenerating(false);
    };

    const batchRun = async () => {
        if (generating) return;
        if (!confirm('This will fire ~180 API calls (20 styles x 9 themes). Continue?')) return;

        setGenerating(true);
        let done = 0;
        const total = creativeStyles.length * themes.length;

        for (const theme of themes) {
            for (const style of creativeStyles) {
                done++;
                setBatchStatus(`${done}/${total} — ${style.name} × ${theme.label}`);

                try {
                    const text = await callAPI(style.name, theme.input, style.defaults);
                    updateResults(style.id, { input: theme.input, text });
                } catch (e) {
                    console.error(`Error: ${style.name} x ${theme.label}:`, e);
                }
                await new Promise(r => setTimeout(r, 250));
            }
        }

        setBatchStatus(`Done! ${total} generations complete.`);
        setGenerating(false);
    };

    const exportResults = () => {
        const data = { timestamp: new Date().toISOString(), results };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'creative_styles_results.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearAll = () => {
        if (!confirm('Clear all generated results?')) return;
        setResults({});
    };

    const totalGenerations = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div className="creative-playground-container">
            <header>
                <h1>Creative Styles <span>Playground</span></h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {totalGenerations > 0 ? `${totalGenerations} generations` : ''}
                    </span>
                    <button className="btn-outline" onClick={exportResults}>Export JSON</button>
                    <button className="btn-outline" onClick={clearAll}>Clear All</button>
                </div>
            </header>

            <div className="controls">
                <div className="control-group">
                    <label>Custom Input</label>
                    <input 
                        type="text" 
                        value={customInput} 
                        onChange={(e) => setCustomInput(e.target.value)} 
                        placeholder="Enter a raw thought, or use a theme pill below..."
                    />
                </div>
                <div className="control-group">
                    <label>Context (for what?)</label>
                    <input 
                        type="text" 
                        value={contextFor} 
                        onChange={(e) => setContextFor(e.target.value)} 
                        placeholder="e.g. meditation app, coffee brand..." 
                        style={{ width: '200px' }}
                    />
                </div>
                <div className="control-group">
                    <label>Audience (for whom?)</label>
                    <input 
                        type="text" 
                        value={contextWho} 
                        onChange={(e) => setContextWho(e.target.value)} 
                        placeholder="e.g. stressed millennials..." 
                        style={{ width: '200px' }}
                    />
                </div>
                <button className="btn" onClick={generateOne} disabled={generating}>Generate Selected</button>
                <button className="btn" onClick={generateAll} disabled={generating}>Generate All 20</button>
            </div>

            <div className="theme-pills">
                {themes.map(t => (
                    <div 
                        key={t.input}
                        className={`theme-pill ${customInput === t.input ? 'active' : ''}`} 
                        onClick={() => pickTheme(t.input)}
                    >
                        {t.label}
                    </div>
                ))}
            </div>

            <div className="batch-bar">
                <button className="btn-outline" onClick={batchRun} disabled={generating}>
                    Batch: All 20 x All 9 Themes (180 calls)
                </button>
                <span className="sep">|</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{batchStatus}</span>
            </div>

            <div className="status">
                {status && <span className="progress">{status}</span>}
            </div>

            <div className="results">
                {creativeStyles.map(s => {
                    const outputs = results[s.id] || [];
                    const isSelected = s.id === selectedStyleId;

                    return (
                        <div 
                            key={s.id}
                            className="style-card" 
                            onClick={() => selectCard(s.id)}
                            style={isSelected ? { borderColor: 'var(--primary)', boxShadow: '0 0 20px rgba(245,158,11,0.15)' } : {}}
                        >
                            <div className="style-header">
                                <span className="style-name">{s.name}</span>
                                <span className="style-cat">{s.cat}</span>
                            </div>
                            <div className="style-tagline">{s.tagline}</div>
                            <div className="style-tagline" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                                Defaults: {s.defaults.size} · {s.defaults.sentence_style}
                            </div>
                            
                            {outputs.length > 0 ? (
                                outputs.map((o, idx) => {
                                    const wc = o.text.split(/\s+/).length;
                                    const wcClass = wc <= 12 ? 'word-count-ok' : 'word-count-warn';
                                    return (
                                        <div key={idx} className="output-item">
                                            <div className="output-text">"{o.text}"</div>
                                            <div className="output-meta">
                                                <span className="output-input">Input: {o.input}</span>
                                                <span className={`output-words ${wcClass}`}>{wc} words</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-output">No outputs yet — generate to see results</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
