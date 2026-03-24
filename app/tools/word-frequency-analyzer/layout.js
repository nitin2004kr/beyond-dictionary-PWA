import React from 'react';

export default function WordFrequencyAnalyzerLayout({ children }) {
  return (
    <div className="analyzer-layout">
      {/* WordFrequencyAnalyzer manages its own header internally to match the HTML design exactly */}
      {children}
    </div>
  );
}
