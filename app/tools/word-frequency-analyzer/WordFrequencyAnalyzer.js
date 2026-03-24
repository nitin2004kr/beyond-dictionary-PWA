'use client';

import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

export default function WordFrequencyAnalyzer() {
  const [content, setContent] = useState('');
  const [currentMode, setCurrentMode] = useState('word');
  const [filters, setFilters] = useState({
    excludeNumbers: false,
    excludeHashtags: false,
    excludeMentions: false,
    customExclusions: ''
  });
  const [analysisData, setAnalysisData] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    uniqueItems: 0,
    avgFreq: 0
  });
  const [sortOrder, setSortOrder] = useState('max-min');
  const [showResults, setShowResults] = useState(false);

  const fileInputRef = useRef(null);

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    if (showResults) analyzeText(mode);
  };

  const handleFilterChange = (e) => {
    const { id, checked, type, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setContent(text);
      analyzeText(currentMode, text);
    };
    reader.readAsText(file);
  };

  const analyzeText = (mode = currentMode, text = content) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      if (showResults) return;
      alert('Please enter some text to analyze.');
      return;
    }

    const customExList = filters.customExclusions
      .toLowerCase()
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let items = [];
    if (mode === 'word') {
      items = trimmedText.toLowerCase().match(/[#@a-z0-9]+(?:'[a-z0-9]+)*/g) || [];
    } else {
      items = trimmedText.toLowerCase()
        .split(/[,\n]+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    // Apply Filters
    items = items.filter(item => {
      if (filters.excludeNumbers && /\d/.test(item)) return false;
      if (filters.excludeHashtags && item.includes('#')) return false;
      if (filters.excludeMentions && item.includes('@')) return false;
      if (customExList.some(ex => item.includes(ex))) return false;
      return true;
    });

    if (items.length === 0) {
      alert(`No valid ${mode === 'word' ? 'words' : 'phrases'} found after applying filters.`);
      return;
    }

    const frequencyMap = {};
    items.forEach(item => {
      frequencyMap[item] = (frequencyMap[item] || 0) + 1;
    });

    const data = Object.entries(frequencyMap).map(([label, freq]) => ({
      label,
      freq,
      percent: ((freq / items.length) * 100).toFixed(2)
    }));

    setAnalysisData(data);
    setStats({
      totalItems: items.length,
      uniqueItems: data.length,
      avgFreq: (items.length / data.length).toFixed(1)
    });
    setShowResults(true);
  };

  const sortedData = [...analysisData].sort((a, b) => {
    if (sortOrder === 'max-min') return b.freq - a.freq;
    if (sortOrder === 'min-max') return a.freq - b.freq;
    return a.label.localeCompare(b.label);
  });

  const exportReport = (type) => {
    if (analysisData.length === 0) return;

    let exportContent = "";
    let filename = "";
    const dateStr = new Date().toISOString().slice(0, 10);

    if (type === 'full') {
      filename = `beyond_analysis_report_${currentMode}_${dateStr}.txt`;
      exportContent = `Beyond Dictionary Word Frequency Analysis Report\n`;
      exportContent += `Date: ${new Date().toLocaleString()}\n`;
      exportContent += `Mode: ${currentMode.toUpperCase()}\n`;
      exportContent += `-------------------------------------------\n`;
      exportContent += `Total Items: ${stats.totalItems}\n`;
      exportContent += `Unique Items: ${stats.uniqueItems}\n`;
      exportContent += `Avg. Frequency: ${stats.avgFreq}\n`;
      exportContent += `-------------------------------------------\n\n`;
      exportContent += `ITEM\t\tFREQUENCY\tPERCENTAGE\n`;
      exportContent += `-------------------------------------------\n`;

      sortedData.forEach(item => {
        exportContent += `${item.label}\t\t${item.freq}\t\t${item.percent}%\n`;
      });
    } else {
      filename = `beyond_unique_${currentMode}s_${dateStr}.txt`;
      const alphabetical = [...analysisData].sort((a, b) => a.label.localeCompare(b.label));
      alphabetical.forEach(item => {
        exportContent += `${item.label}\n`;
      });
    }

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setContent('');
    setFilters({
      excludeNumbers: false,
      excludeHashtags: false,
      excludeMentions: false,
      customExclusions: ''
    });
    setShowResults(false);
  };

  return (
    <div className="analyzer-container">
      <header>
        <div className="header-nav">
          <a href="/" className="logo">Beyond<span>.Dictionary</span></a>
          <span className="header-sep">›</span>
          <span className="header-crumb">Tools</span>
          <span className="header-sep">›</span>
          <span className="header-crumb">English Utility</span>
        </div>
      </header>

      <div className="container">
        <div className="card intro fade-in">
          <h1>Word Frequency Analyzer</h1>
          <p>A precision tool for writers, students, and linguists to uncover patterns in their writing.</p>

          <div className="how-it-works">
            <h3>How it works</h3>
            <p>
              <strong>{currentMode === 'word' ? 'Word Mode' : 'Phrase Mode'}:</strong>{' '}
              {currentMode === 'word' 
                ? 'Scans text for individual words, normalizing case and handling contractions.' 
                : 'Identifies segments separated by commas or line breaks. Leading/trailing spaces are removed.'}
            </p>
          </div>

          <div className="mode-switch">
            <button 
              className={`mode-btn ${currentMode === 'word' ? 'active' : ''}`} 
              onClick={() => handleModeChange('word')}
            >
              Word Mode
            </button>
            <button 
              className={`mode-btn ${currentMode === 'phrase' ? 'active' : ''}`} 
              onClick={() => handleModeChange('phrase')}
            >
              Phrase Mode
            </button>
          </div>

          <div className="input-group">
            <label htmlFor="textInput">
              {currentMode === 'word' ? 'Paste your text here:' : 'Paste comma-separated text:'}
            </label>
            <textarea 
              id="textInput" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentMode === 'word' 
                ? "Once upon a time, in a land far, far away..." 
                : "Apples, oranges, bananas\nRed, Blue, Green, Red"}
            />
          </div>

          <div className="file-upload">
            <label className="file-label" htmlFor="fileInput">
              <span>📁 Upload Text File</span>
              <input 
                type="file" 
                id="fileInput" 
                accept=".txt" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div className="input-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <label style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🛠️</span> Advanced Filters
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  id="excludeNumbers" 
                  checked={filters.excludeNumbers}
                  onChange={handleFilterChange}
                  style={{ width: '18px', height: '18px' }} 
                /> Exclude Numbers
              </label>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  id="excludeHashtags" 
                  checked={filters.excludeHashtags}
                  onChange={handleFilterChange}
                  style={{ width: '18px', height: '18px' }} 
                /> Exclude Hashtags (#)
              </label>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  id="excludeMentions" 
                  checked={filters.excludeMentions}
                  onChange={handleFilterChange}
                  style={{ width: '18px', height: '18px' }} 
                /> Exclude Mentions (@)
              </label>
            </div>
            <label htmlFor="customExclusions" style={{ fontSize: '14px', marginBottom: '8px' }}>Exclude words/phrases containing (comma separated):</label>
            <input 
              type="text" 
              id="customExclusions" 
              value={filters.customExclusions}
              onChange={handleFilterChange}
              placeholder="e.g. http, www, #, 2024"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn" onClick={clearAll} style={{ background: '#94a3b8' }}>
              Clear
            </button>
            <button className="btn" onClick={() => analyzeText()}>
              Analyze {currentMode === 'word' ? 'Vocabulary' : 'Phrases'} ✨
            </button>
          </div>
        </div>

        {showResults ? (
          <div className="card fade-in" id="resultsCard">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <div className="sort-controls">
                <label htmlFor="sortOrder">Sort by:</label>
                <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="max-min">Frequency: High to Low</option>
                  <option value="min-max">Frequency: Low to High</option>
                  <option value="abc">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.totalItems}</span>
                <span className="stat-label">Total {currentMode === 'word' ? 'Words' : 'Phrases'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.uniqueItems}</span>
                <span className="stat-label">Unique {currentMode === 'word' ? 'Words' : 'Phrases'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.avgFreq}</span>
                <span className="stat-label">Avg. Frequency</span>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{currentMode === 'word' ? 'Word' : 'Phrase'}</th>
                    <th>Frequency</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="word-cell">{item.label}</td>
                      <td className="freq-cell">{item.freq}</td>
                      <td>{item.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => exportReport('full')} style={{ background: 'var(--dark)', flex: 1, minWidth: '200px' }}>
                <span>📥 Full Stats Report</span>
              </button>
              <button className="btn" onClick={() => exportReport('unique')} style={{ background: 'var(--muted)', flex: 1, minWidth: '200px' }}>
                <span>📄 Unique List Only</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="card fade-in" id="emptyState">
            <div className="empty-state">
              <span className="empty-state-icon">📊</span>
              <p>Enter text above and click "Analyze" to see statistics.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
