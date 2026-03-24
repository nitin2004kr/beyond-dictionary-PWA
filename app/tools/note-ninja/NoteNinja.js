'use client';

import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

export default function NoteNinja() {
  const [content, setContent] = useState('');
  const [history, setHistory] = useState(['']);
  const [historyStep, setHistoryStep] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 1,
    readabilityScore: 0,
    readingLevel: 'N/A'
  });
  const [wikiLinks, setWikiLinks] = useState([]);

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('noteninja_draft');
    if (saved) {
      setContent(saved);
      updateStats(saved);
      const initialHistory = [saved];
      setHistory(initialHistory);
      setHistoryStep(0);
    }
    
    if (!localStorage.getItem('noteninja_visited')) {
      setTimeout(() => setShowGuide(true), 1000);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert('Focus session complete!');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveState = (newContent) => {
    setHistory((prev) => {
      const updated = prev.slice(0, historyStep + 1);
      if (updated[updated.length - 1] === newContent) return prev;
      updated.push(newContent);
      if (updated.length > 50) updated.shift();
      return updated;
    });
    setHistoryStep((prev) => Math.min(prev + 1, 49));
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setContent(value);
    updateStats(value);
    updateWikiIndex(value);

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveState(value);
      localStorage.setItem('noteninja_draft', value);
    }, 1000);
  };

  const updateStats = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    
    let score = 0;
    let level = 'N/A';

    if (words > 5) {
      const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
      const syllables = (text.match(/[aeiouy]+/gi) || []).length;
      score = Math.round(206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words)));
      score = Math.max(0, Math.min(100, score));

      if (score > 90) level = "Easy";
      else if (score > 60) level = "Standard";
      else if (score > 30) level = "Academic";
      else level = "Complex";
    }

    setStats({ chars, words, lines, readabilityScore: score, readingLevel: level });
  };

  const updateWikiIndex = (text) => {
    const links = text.match(/\[\[(.*?)\]\]/g) || [];
    const uniqueLinks = [...new Set(links.map(l => l.replace(/[\[\]]/g, '')))];
    setWikiLinks(uniqueLinks);
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      const prevContent = history[prevStep];
      setContent(prevContent);
      setHistoryStep(prevStep);
      updateStats(prevContent);
      localStorage.setItem('noteninja_draft', prevContent);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      const nextContent = history[nextStep];
      setContent(nextContent);
      setHistoryStep(nextStep);
      updateStats(nextContent);
      localStorage.setItem('noteninja_draft', nextContent);
    }
  };

  const convertCase = (mode) => {
    const el = editorRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);
    let textToProcess = selectedText || content;
    let result = "";

    switch (mode) {
      case 'upper': result = textToProcess.toUpperCase(); break;
      case 'lower': result = textToProcess.toLowerCase(); break;
      case 'title': result = textToProcess.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); break;
      case 'sentence': result = textToProcess.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase()); break;
      case 'camel':
        result = textToProcess.split('\n').map(line => line.trim().toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())).join('\n');
        break;
      case 'pascal':
        result = textToProcess.split('\n').map(line => line.trim().toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (m, chr) => chr.toUpperCase())).join('\n');
        break;
      case 'snake':
        result = textToProcess.split('\n').map(line => {
          const words = line.trim().match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
          return words ? words.map(x => x.toLowerCase()).join('_') : line;
        }).join('\n');
        break;
      default: break;
    }

    if (selectedText) {
      const newContent = content.substring(0, start) + result + content.substring(end);
      setContent(newContent);
      saveState(newContent);
    } else {
      setContent(result);
      saveState(result);
    }
  };

  const cleanText = (mode) => {
    let result = content;
    switch (mode) {
      case 'spaces': result = content.replace(/[ ]+/g, ' '); break;
      case 'lines': result = content.replace(/\n\s*\n/g, '\n').replace(/\n{2,}/g, '\n'); break;
      case 'tabs': result = content.replace(/\t/g, '    '); break;
      case 'trim': result = content.split('\n').map(line => line.trim()).filter(l => l.length > 0).join('\n'); break;
      default: break;
    }
    setContent(result);
    saveState(result);
  };

  const formatList = (mode) => {
    const el = editorRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);
    if (!selectedText) return;

    const lines = selectedText.split('\n');
    const markerRegex = /^(\s*)([-*•]\s|\d+\.\s|\[[ x]\]\s)/;
    const firstLine = lines.find(l => l.trim().length > 0) || "";
    let isToggleOff = false;

    if (mode === 'bullet' && /^[-*•]\s/.test(firstLine.trim())) isToggleOff = true;
    if (mode === 'number' && /^\d+\.\s/.test(firstLine.trim())) isToggleOff = true;
    if (mode === 'todo' && /^\[[ x]\]\s/.test(firstLine.trim())) isToggleOff = true;

    let result = "";
    if (isToggleOff) {
      result = lines.map(l => l.replace(markerRegex, '$1')).join('\n');
    } else {
      switch (mode) {
        case 'bullet': result = lines.map(l => `- ${l.replace(markerRegex, '$1')}`).join('\n'); break;
        case 'number': result = lines.map((l, i) => `${i + 1}. ${l.replace(markerRegex, '$1')}`).join('\n'); break;
        case 'todo': result = lines.map(l => `[ ] ${l.replace(markerRegex, '$1')}`).join('\n'); break;
        case 'sub': result = lines.map(l => `    ${l}`).join('\n'); break;
        default: break;
      }
    }

    const newContent = content.substring(0, start) + result + content.substring(end);
    setContent(newContent);
    saveState(newContent);
  };

  const scanText = () => {
    const text = content.trim();
    if (!text) return alert("Please enter some text to scan.");

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);

    const passiveTerms = ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
    let passiveCount = 0;
    words.forEach((w, i) => {
      if (passiveTerms.includes(w.toLowerCase()) && words[i + 1] && (words[i + 1].endsWith('ed') || words[i + 1].match(/^(built|drawn|kept|made|said|seen|told|written)$/i))) {
        passiveCount++;
      }
    });

    const adverbs = text.match(/\w+ly\b/g) || [];
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25);

    let report = "📈 Writing Analysis Report\n\n";
    report += `• Passive Voice: ${passiveCount} instances. ${passiveCount > 3 ? "⚠️ Try using active verbs for more impact!" : "✅ Good use of active voice."}\n`;
    report += `• Adverbs: ${adverbs.length} found. ${adverbs.length > 5 ? "⚠️ Use stronger verbs instead of many adverbs." : "✅ Well balanced."}\n`;
    report += `• Long Sentences: ${longSentences.length} sentences exceed 25 words. ${longSentences.length > 0 ? "⚠️ Consider breaking them up for clarity." : "✅ Sentences are crisp."}\n`;

    alert(report + "\nTip: Red underlines (enabled) will show spelling errors as you type.");
  };

  const downloadText = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteninja_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  const nextSlide = () => {
    if (currentSlide < 4) setCurrentSlide(currentSlide + 1);
    else {
      setShowGuide(false);
      localStorage.setItem('noteninja_visited', 'true');
    }
  };

  return (
    <div className={`note-ninja-container ${isDistractionFree ? 'distraction-free' : ''}`} data-theme={theme}>
      <header>
        <div className="header-nav">
          <a href="/" className="logo"><i className="fa-solid fa-user-ninja"></i> Note<span>Ninja</span></a>
          <span style={{ color: 'var(--border)', margin: '0 10px' }}>|</span>
          <span className="header-crumb">Tools</span>
          <span style={{ color: 'var(--border)', margin: '0 5px' }}>›</span>
          <span className="header-crumb">English Utility</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-tool" onClick={undo} title="Undo (Ctrl+Z)" style={{ width: '40px', height: '40px' }}>
            <i className="fa-solid fa-rotate-left"></i>
          </button>
          <button className="btn-tool" onClick={redo} title="Redo (Ctrl+Y)" style={{ width: '40px', height: '40px' }}>
            <i className="fa-solid fa-rotate-right"></i>
          </button>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
          <button className="btn-tool" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ width: '40px', height: '40px' }}>
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button className="btn-tool" onClick={() => setIsDistractionFree(!isDistractionFree)} style={{ width: '40px', height: '40px' }}>
            <i className={`fa-solid ${isDistractionFree ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
          <button className="btn-tool" onClick={() => setShowGuide(true)}
            style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '0 16px', height: '40px', borderRadius: '20px' }}>
            <i className="fa-solid fa-circle-question" style={{ color: 'white', marginRight: '5px' }}></i> Guide
          </button>
        </div>
      </header>

      <main>
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Command Center</div>
            <div className="status-badge">Sync Ready</div>
          </div>

          <div className="sidebar-scroll">
            <div className="tool-group">
              <h4><i className="fa-solid fa-font"></i> Typography</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn-tool" onClick={() => convertCase('upper')}>UPPER</button>
                <button className="btn-tool" onClick={() => convertCase('lower')}>lower</button>
                <button className="btn-tool" onClick={() => convertCase('title')}>Title Case</button>
                <button className="btn-tool" onClick={() => convertCase('sentence')}>Sentence</button>
                <button className="btn-tool" onClick={() => convertCase('camel')}>camelCase</button>
                <button className="btn-tool" onClick={() => convertCase('pascal')}>PascalCase</button>
                <button className="btn-tool" onClick={() => convertCase('snake')}>snake_case</button>
              </div>
            </div>

            <div className="tool-group">
              <h4><i className="fa-solid fa-broom"></i> Refinement</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn-tool" onClick={() => cleanText('spaces')}>Spaces</button>
                <button className="btn-tool" onClick={() => cleanText('lines')}>Blank Lines</button>
                <button className="btn-tool" onClick={() => cleanText('tabs')}>Tabs &gt; Spc</button>
                <button className="btn-tool" onClick={() => cleanText('trim')}>Trim All</button>
              </div>
            </div>

            <div className="tool-group">
              <h4><i className="fa-solid fa-list-ul"></i> Structure</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn-tool" onClick={() => formatList('bullet')}>Bullets</button>
                <button className="btn-tool" onClick={() => formatList('number')}>Numbering</button>
                <button className="btn-tool" onClick={() => formatList('todo')}>Checklist</button>
                <button className="btn-tool" onClick={() => formatList('sub')}>Indent Tab</button>
              </div>
            </div>

            <div className="tool-group" style={{ background: 'var(--primary-gradient)', color: 'white' }}>
              <h4 style={{ color: 'white' }}><i className="fa-solid fa-clock" style={{ color: 'white' }}></i> Focus Timer</h4>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-tool" onClick={() => setIsTimerRunning(!isTimerRunning)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                  <i className={`fa-solid ${isTimerRunning ? 'fa-pause' : 'fa-play'}`} style={{ color: 'white' }}></i>
                </button>
                <button className="btn-tool" onClick={() => { setTimeLeft(25 * 60); setIsTimerRunning(false); }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                  <i className="fa-solid fa-rotate" style={{ color: 'white' }}></i>
                </button>
              </div>
              <div className="progress-container" style={{ background: 'rgba(255,255,255,0.1)', marginTop: '16px' }}>
                <div id="progressBar" style={{ background: 'white', width: `${( (25 * 60 - timeLeft) / (25 * 60) ) * 100}%` }}></div>
              </div>
            </div>

            <div className="tool-group">
              <h4><i className="fa-solid fa-chart-simple"></i> Analytics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>FLESCH (0-100)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{stats.readabilityScore}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>LEARNER LEVEL</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{stats.readingLevel}</div>
                </div>
              </div>
              <button className="btn-tool" onClick={scanText}
                style={{ width: '100%', height: '44px', background: 'var(--border)' }}>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Scan for Polish
              </button>
            </div>

            <div className="tool-group">
              <h4><i className="fa-solid fa-link"></i> Wiki Links</h4>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {wikiLinks.length > 0 ? wikiLinks.map((link, i) => (
                  <span key={i} className="badge">{link}</span>
                )) : 'No links found. Use [[topic]]'}
              </div>
            </div>
          </div>
        </aside>

        <div className="editor-container">
          <textarea
            ref={editorRef}
            id="editor"
            value={content}
            onChange={handleInput}
            placeholder="Write or paste your text here to begin..."
            spellCheck="true"
          />

          <div className="df-toolbar">
            <button className="btn-tool" onClick={undo} title="Undo"><i className="fa-solid fa-rotate-left"></i></button>
            <button className="btn-tool" onClick={redo} title="Redo"><i className="fa-solid fa-rotate-right"></i></button>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
            <button className="btn-tool" onClick={() => convertCase('title')} title="Title Case">T</button>
            <button className="btn-tool" onClick={() => cleanText('spaces')} title="Clean Spaces"><i className="fa-solid fa-broom"></i></button>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
            <button className="btn-tool" onClick={() => setIsDistractionFree(false)} title="Exit (Esc)"
              style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none' }}>
              <i className="fa-solid fa-compress"></i> Exit
            </button>
          </div>
        </div>
      </main>

      <footer className="status-bar">
        <div className="stat-item">
          <span>{stats.charCount} {stats.chars} chars</span>
          <span>{stats.words} words</span>
          <span>{stats.lines} lines</span>
        </div>
        <div className="stat-item">
          <span className="badge">{stats.readingLevel}</span>
          <button onClick={downloadText}
            style={{ background: 'transparent', border: 'none', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <i className="fa-solid fa-file-export"></i> Export
          </button>
        </div>
      </footer>

      {showGuide && (
        <div className={`guide-overlay active`}>
          <div className="guide-modal">
            {currentSlide === 0 && (
              <div className="guide-slide active">
                <div className="guide-icon"><i className="fa-solid fa-user-ninja"></i></div>
                <h2 className="guide-title">Welcome to NoteNinja</h2>
                <p className="guide-text">The elite workspace for writers and developers. Let's take a quick tour of your new superpower.</p>
              </div>
            )}
            {currentSlide === 1 && (
              <div className="guide-slide active">
                <div className="guide-icon"><i className="fa-solid fa-font"></i></div>
                <h2 className="guide-title">Precision Typography</h2>
                <p className="guide-text">Instantly convert between camelCase, PascalCase, snake_case, or Title Case. Perfect for variable naming or clean documentation.</p>
              </div>
            )}
            {currentSlide === 2 && (
              <div className="guide-slide active">
                <div className="guide-icon"><i className="fa-solid fa-broom"></i></div>
                <h2 className="guide-title">Instant Refinement</h2>
                <p className="guide-text">One-click removal of blank lines, collapsing extra spaces, and trimming messy text. Keep your drafts professional and compact.</p>
              </div>
            )}
            {currentSlide === 3 && (
              <div className="guide-slide active">
                <div className="guide-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                <h2 className="guide-title">Deep Analytics</h2>
                <p className="guide-text">Track your Flesch Reading Ease score and tone in real-time. Our "Polish" engine flags passive voice to make your writing punchier.</p>
              </div>
            )}
            {currentSlide === 4 && (
              <div className="guide-slide active">
                <div className="guide-icon"><i className="fa-solid fa-clock"></i></div>
                <h2 className="guide-title">Focus & History</h2>
                <p className="guide-text">Use the Pomodoro timer to maintain flow, and never worry about mistakes with full Undo/Redo across 50 history steps.</p>
              </div>
            )}

            <div className="guide-nav">
              <button className="btn-guide btn-prev" onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))} style={{ opacity: currentSlide === 0 ? 0 : 1 }}>Back</button>
              <div className="guide-dots">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`}></div>
                ))}
              </div>
              <button className="btn-guide btn-next" onClick={nextSlide}>{currentSlide === 4 ? 'Finish' : 'Next'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
