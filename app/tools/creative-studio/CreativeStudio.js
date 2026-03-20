'use client';

import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import { 
    creativeStyles, 
    personas, 
    moods, 
    tones, 
    sizes, 
    howCloseOptions, 
    sentenceStyles 
} from './data';

export default function CreativeStudio() {
    // --- Configuration State ---
    const [selectedPersona, setSelectedPersona] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('concealed');
    const [selectedMood, setSelectedMood] = useState('neutral');
    const [selectedTone, setSelectedTone] = useState('');
    const [selectedSize, setSelectedSize] = useState('punchy');
    const [selectedHowClose, setSelectedHowClose] = useState('interpret');
    const [selectedSentence, setSelectedSentence] = useState('auto');
    const [activeCategory, setActiveCategory] = useState('All');
    const [ctxFor, setCtxFor] = useState('');
    const [ctxWho, setCtxWho] = useState('');
    const [userInput, setUserInput] = useState('');

    // --- UI State ---
    const [activePanes, setActivePanes] = useState({
        history: false,
        explain: false,
        editor: false,
        blend: false,
        inspire: false
    });
    const [mobileTab, setMobileTab] = useState('create');
    const [isGenerating, setIsGenerating] = useState(false);
    const [creativeOutput, setCreativeOutput] = useState('');
    const [canvasState, setCanvasState] = useState('empty'); // empty, result, edit
    const [status, setStatus] = useState('Ready');
    const [history, setHistory] = useState([]);
    const [shuffledHistory, setShuffledHistory] = useState([]);

    // --- References ---
    const creativeOutputRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        // Load history from localStorage
        const savedHistory = localStorage.getItem('creative_history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        // Save history to localStorage
        localStorage.setItem('creative_history', JSON.stringify(history));
    }, [history]);

    // --- Logic functions ---
    const togglePane = (pane) => {
        setActivePanes(prev => ({
            ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
            [pane]: !prev[pane]
        }));
    };

    const handleGenerate = async (mode = 'creative', customInput = null) => {
        if (isGenerating) return;
        setIsGenerating(true);
        setStatus('Writing…');

        const allStyles = Object.values(creativeStyles).flat();
        const styleData = allStyles.find(s => s.id === selectedStyle);
        
        const payload = {
            mode: mode.startsWith('creative_') ? mode : 'creative',
            voice: styleData?.name || selectedStyle,
            voice_tagline: styleData?.tagline || '',
            persona: selectedPersona,
            input: customInput || userInput || '(open theme)',
            context_for: ctxFor,
            context_who: ctxWho,
            sentence_style: selectedSentence,
            size: selectedSize,
            mood: selectedMood,
            tone_delivery: selectedTone,
            how_close: selectedHowClose,
        };

        try {
            const serverUrl = 'http://localhost:5517';
            const res = await fetch(`${serverUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            const text = data.text || data.aphorism || '';
            
            if (text) {
                const cleanedText = text.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
                setCreativeOutput(cleanedText);
                setCanvasState('result');
                addToHistory(cleanedText, payload);
            }
        } catch (err) {
            setStatus('Error: ' + err.message);
        } finally {
            setIsGenerating(false);
            setStatus('Ready');
        }
    };

    const handleRefine = () => {
        const refineInput = document.getElementById('refineInput')?.value;
        if (refineInput) {
            handleGenerate('refine', `ORIGINAL: ${creativeOutput}\nREFINE: ${refineInput}`);
        }
    };

    const filterStyles = (query) => {
        // This is handled by the render filtering now
    };

    const addToHistory = (text, metadata) => {
        const newItem = {
            id: Date.now(),
            text,
            timestamp: new Date().toISOString(),
            metadata
        };
        setHistory(prev => [newItem, ...prev].slice(0, 300));
    };

    const [explanation, setExplanation] = useState('Select "Explain" to analyze this aphorism.');

    const explainAphorism = async () => {
        if (!creativeOutput) return;
        setStatus('Explaining…');
        setExplanation('Checking our records…');
        try {
            const serverUrl = 'http://localhost:5517';
            const res = await fetch(`${serverUrl}/api/explain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: creativeOutput }),
            });
            const data = await res.json();
            setExplanation(data.explanation || 'No explanation available.');
        } catch (err) {
            setStatus('Error: ' + err.message);
            setExplanation('Could not retrieve explanation.');
        } finally {
            setStatus('Ready');
        }
    };

    const getWordCount = (text) => {
        return text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    };

    const handleSpeak = () => {
        if (!creativeOutput) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(creativeOutput);
        window.speechSynthesis.speak(utterance);
    };

    // --- Render Helpers ---
    const [styleSearch, setStyleSearch] = useState('');

    const filteredStyles = (activeCategory === 'All' 
        ? Object.values(creativeStyles).flat() 
        : (creativeStyles[activeCategory] || [])
    ).filter(s => 
        s.name.toLowerCase().includes(styleSearch.toLowerCase()) || 
        s.tagline.toLowerCase().includes(styleSearch.toLowerCase())
    );

    const selectHistoryItem = (item) => {
        setCreativeOutput(item.text);
        setCanvasState('result');
        if (item.metadata) {
            if (item.metadata.persona) setSelectedPersona(item.metadata.persona);
            if (item.metadata.mood) setSelectedMood(item.metadata.mood);
            if (item.metadata.size) setSelectedSize(item.metadata.size);
            if (item.metadata.tone_delivery) setSelectedTone(item.metadata.tone_delivery);
            // etc
        }
        if (window.innerWidth <= 900) setMobileTab('create');
    };

    const deleteHistoryItem = (id, e) => {
        e.stopPropagation();
        setHistory(prev => prev.filter(i => i.id !== id));
    };

    const renderSidebar = () => (
        <aside className={`sidebar ${mobileTab === 'configure' ? 'mob-view-active' : ''}`}>
            <div className="sidebar-search">
                <div className="category-title">CREATIVE STUDIO</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div className="search-wrap" style={{ flex: 1 }}>
                        <input 
                            type="text" 
                            placeholder="Search all settings..." 
                            id="styleSearch" 
                            value={styleSearch}
                            onChange={(e) => setStyleSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="context-section">
                <div className="context-label">CONTEXT</div>
                <input 
                    type="text" 
                    placeholder="Purpose — e.g. wedding toast" 
                    value={ctxFor}
                    onChange={(e) => setCtxFor(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="Audience — e.g. teenagers"
                    value={ctxWho}
                    onChange={(e) => setCtxWho(e.target.value)}
                    style={{ marginTop: '6px' }}
                />
            </div>

            {/* PERSONA section */}
            <div className={`config-section ${activePanes.persona ? 'active' : ''}`}>
                <div className="config-header" onClick={() => togglePane('persona')}>
                    <span>WRITING AS</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
                <div className="config-content">
                    <div className={`persona-card ${!selectedPersona ? 'active' : ''}`} onClick={() => setSelectedPersona('')}>
                        <strong>None</strong><span>Default mode</span>
                    </div>
                    {personas.map(p => (
                        <div 
                            key={p.id} 
                            className={`persona-card ${p.id === selectedPersona ? 'active' : ''}`}
                            onClick={() => setSelectedPersona(p.id)}
                        >
                            <strong>{p.name}</strong><span>{p.tagline}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* STYLE section */}
            <div className={`config-section ${activePanes.style ? 'active' : ''}`}>
                <div className="config-header" onClick={() => togglePane('style')}>
                    <span>STYLE</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
                <div className="config-content">
                    <div className="category-filters">
                        {['All', ...Object.keys(creativeStyles)].map(cat => (
                            <button 
                                key={cat}
                                className={`cat-pill ${cat === activeCategory ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div id="styleList">
                        {filteredStyles.map(s => (
                            <div 
                                key={s.id} 
                                className={`style-card ${s.id === selectedStyle ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedStyle(s.id);
                                    if (s.size) setSelectedSize(s.size);
                                    if (s.sentence) setSelectedSentence(s.sentence);
                                }}
                            >
                                <div className="sc-name">{s.name}</div>
                                <div className="sc-tag">{s.tagline}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MOOD section */}
            <div className="mood-section">
                <div className="mood-label">MOOD</div>
                <div className="mood-pills">
                    {moods.map(m => (
                        <button 
                            key={m.id} 
                            className={`mood-pill ${m.id === selectedMood ? 'active' : ''}`}
                            onClick={() => setSelectedMood(m.id)}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* TONE section */}
            <div className="mood-section">
                <div className="mood-label">TONE</div>
                <div className="mood-pills">
                    {tones.map(t => (
                        <button 
                            key={t.id} 
                            className={`mood-pill ${t.id === selectedTone ? 'active' : ''}`}
                            onClick={() => setSelectedTone(t.id)}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* SIZE section */}
            <div className={`config-section ${activePanes.size ? 'active' : ''}`}>
                <div className="config-header" onClick={() => togglePane('size')}>
                    <span>SIZE</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
                <div className="config-content">
                    {sizes.map(s => (
                        <div 
                            key={s.id} 
                            className={`config-item ${s.id === selectedSize ? 'active' : ''}`}
                            onClick={() => setSelectedSize(s.id)}
                        >
                            <strong>{s.name}</strong><span>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* HOW CLOSE section */}
            <div className={`config-section ${activePanes.howClose ? 'active' : ''}`}>
                <div className="config-header" onClick={() => togglePane('howClose')}>
                    <span>HOW CLOSE?</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
                <div className="config-content">
                    {howCloseOptions.map(h => (
                        <div 
                            key={h.id} 
                            className={`config-item ${h.id === selectedHowClose ? 'active' : ''}`}
                            onClick={() => setSelectedHowClose(h.id)}
                            title={h.desc}
                        >
                            {h.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* SENTENCE STYLE section */}
            <div className={`config-section ${activePanes.sentenceStyle ? 'active' : ''}`}>
                <div className="config-header" onClick={() => togglePane('sentenceStyle')}>
                    <span>SENTENCE STYLE</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
                <div className="config-content">
                    {sentenceStyles.map(s => (
                        <div 
                            key={s.id} 
                            className={`config-item ${s.id === selectedSentence ? 'active' : ''}`}
                            onClick={() => setSelectedSentence(s.id)}
                        >
                            {s.name}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );

    const clearHistory = () => {
        if (window.confirm('Delete all history?')) {
            setHistory([]);
        }
    };

    const getFontSize = (text) => {
        const len = text.length;
        if (len < 15) return '64px';
        if (len < 30) return '52px';
        if (len < 60) return '42px';
        if (len < 100) return '34px';
        if (len < 150) return '28px';
        return '22px';
    };

    const getSummary = () => {
        const parts = [];
        if (selectedPersona) {
            const p = personas.find(x => x.id === selectedPersona);
            if (p) parts.push(p.name);
        }
        const s = Object.values(creativeStyles).flat().find(x => x.id === selectedStyle);
        if (s) parts.push(s.name);
        if (selectedMood !== 'neutral') parts.push(selectedMood);
        if (selectedTone) parts.push(selectedTone);
        return parts.join(' • ');
    };

    return (
        <div className="creative-studio-container">
            <header className="studio-header">
                <div className="header-left">
                    <button className="mobile-toggle" onClick={() => togglePane('sidebar')}>☰</button>
                    <div className="logo">
                        <i className="fa-solid fa-pen-nib"></i>
                        <span>Creative</span>&nbsp;Studio
                    </div>
                </div>
                <div className="header-right">
                    <button className="tab-btn" onClick={() => togglePane('history')} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-clock-rotate-left"></i> <span className="btn-label">History</span>
                    </button>
                </div>
            </header>

            <main className="studio-main">
                {renderSidebar()}

                <section className={`content ${mobileTab === 'create' ? 'mob-create-active' : ''}`}>
                    {canvasState === 'empty' ? (
                        <div className="mob-welcome">
                            <div className="mob-welcome-icon"><i className="fa-solid fa-feather-pointed"></i></div>
                            <div className="mob-welcome-title">What's worth saying?</div>
                            <div className="mob-welcome-sub">Type a thought below. The Studio will shape it.</div>
                        </div>
                    ) : (
                        <div className="aphorism-display">
                            <div className="config-summary-bar" style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', fontWeight: '700' }}>
                                {getSummary()}
                            </div>
                            <h1 className="aphorism-text" style={{ fontSize: getFontSize(creativeOutput) }}>
                                {creativeOutput}
                            </h1>
                            <span className="word-count-badge" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '2px 10px', borderRadius: '12px', fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                                {getWordCount(creativeOutput)} WORDS
                            </span>
                            <div className="display-actions">
                                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(creativeOutput)}>
                                    <i className="fa-regular fa-copy"></i>
                                </button>
                                <button className="copy-btn" onClick={() => { togglePane('explain'); explainAphorism(); }}>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Explain
                                </button>
                                <button className="copy-btn" onClick={() => togglePane('editor')}>
                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                </button>
                                <button className="copy-btn" onClick={handleSpeak}>
                                    <i className="fa-solid fa-volume-high"></i> Speak
                                </button>
                                <div className="refine-wrapper" style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '8px' }}>
                                    <input 
                                        type="text" 
                                        id="refineInput" 
                                        placeholder="Refine..." 
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', borderRadius: '20px', padding: '7px 14px', fontSize: '11px', width: '150px', outline: 'none' }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                    />
                                    <button className="copy-btn" onClick={handleRefine} style={{ background: 'var(--primary-gradient)', color: 'white', borderColor: 'transparent' }}>
                                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="input-controls">
                        <div className="text-input-wrapper">
                            <input 
                                type="text" 
                                id="userInput" 
                                placeholder="What's on your mind?" 
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                            <button className="send-btn" onClick={() => handleGenerate()}>
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                        <div className="action-chips" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button className="action-chip" onClick={() => handleGenerate('expand')}>Expand</button>
                            <button className="action-chip" onClick={() => handleGenerate('contract')}>Contract</button>
                            <button className="action-chip" onClick={() => handleGenerate('random')}>Random</button>
                            <button className="action-chip" onClick={() => handleGenerate('complete')}>Fill Blanks</button>
                        </div>
                        <div id="status" style={{ marginTop: '10px', fontSize: '12px', color: 'var(--primary)' }}>{status}</div>
                    </div>

                    <div className="cost-bar" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '3px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                        <div className="cost-progress" style={{ width: '15%', height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                    </div>
                </section>

                {/* Explain Pane */}
                <aside className={`history-pane ${activePanes.explain ? 'active' : ''}`}>
                    <div className="history-pane-header">
                        <h3>EXPLAIN</h3>
                        <button onClick={() => togglePane('explain')} className="close-btn" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="pane-content" style={{ padding: '16px', fontSize: '14px', lineHeight: '1.5', overflowY: 'auto', flex: 1 }}>
                        <div id="explainContent" dangerouslySetInnerHTML={{ __html: explanation }}></div>
                    </div>
                </aside>

                {/* Editor Pane */}
                <aside className={`history-pane ${activePanes.editor ? 'active' : ''}`}>
                    <div className="history-pane-header">
                        <h3>EDITOR</h3>
                        <button onClick={() => togglePane('editor')} className="close-btn" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="pane-content" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <textarea 
                            value={creativeOutput} 
                            onChange={(e) => setCreativeOutput(e.target.value)}
                            style={{ width: '100%', flex: 1, minHeight: '300px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', padding: '10px', fontSize: '18px', fontFamily: 'Crimson Pro, serif', outline: 'none', resize: 'none' }}
                        />
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button className="copy-btn" onClick={() => togglePane('editor')} style={{ flex: 1 }}>Done</button>
                        </div>
                    </div>
                </aside>

                {/* Blend Pane */}
                <aside className={`history-pane ${activePanes.blend ? 'active' : ''}`}>
                    <div className="history-pane-header">
                        <h3>BLEND</h3>
                        <button onClick={() => togglePane('blend')} className="close-btn" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="pane-content" style={{ padding: '16px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Combine this aphorism with another style or concept.</div>
                    </div>
                </aside>

                {/* Trace Pane */}
                <aside className={`history-pane ${activePanes.trace ? 'active' : ''}`}>
                    <div className="history-pane-header">
                        <h3>TRACE</h3>
                        <button onClick={() => togglePane('trace')} className="close-btn" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="pane-content" style={{ padding: '16px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Analyzing connections to literature and philosophy...</div>
                    </div>
                </aside>

                {/* History Pane */}
                <aside className={`history-pane ${activePanes.history ? 'active' : ''}`}>
                    <div className="history-pane-header">
                        <h3>History</h3>
                    </div>
                    <div className="history-list">
                        {history.length === 0 ? (
                            <div className="history-empty">Generate your first aphorism.</div>
                        ) : (
                            history.map(item => (
                                <div key={item.id} className="history-item" onClick={() => selectHistoryItem(item)}>
                                    <div className="hi-text">{item.text}</div>
                                    <div className="hi-meta-row">
                                        <div className="hi-meta">{new Date(item.timestamp).toLocaleTimeString()}</div>
                                        <button className="hi-delete" onClick={(e) => deleteHistoryItem(item.id, e)} title="Delete">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </main>

            {/* Mobile Tab Bar */}
            <div className="mobile-tab-bar">
                <button className={`mob-tab ${mobileTab === 'create' ? 'active' : ''}`} onClick={() => setMobileTab('create')}>
                    <i className="fa-solid fa-pen-nib"></i>
                    <span>Create</span>
                </button>
                <button className={`mob-tab ${mobileTab === 'configure' ? 'active' : ''}`} onClick={() => setMobileTab('configure')}>
                    <i className="fa-solid fa-sliders"></i>
                    <span>Configure</span>
                </button>
                <button className={`mob-tab ${mobileTab === 'history' ? 'active' : ''}`} onClick={() => setMobileTab('history')}>
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    <span>History</span>
                </button>
            </div>
        </div>
    );
}
