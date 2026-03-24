import React from 'react';

export default function CreativePlaygroundLayout({ children }) {
  return (
    <div className="tool-layout">
      {/* 
        The header and footer for this page are specific to its design.
        We don't use the global Header/Footer here to maintain the 
        exact design requested.
      */}
      {children}
      <footer style={{ 
        textAlign: 'center', 
        padding: '24px', 
        background: '#0f172a', 
        color: '#94a3b8', 
        fontSize: '11px',
        borderTop: '1px solid rgba(245, 158, 11, 0.1)'
      }}>
        &copy; 2026 Creative Styles Playground | LLOS.ai
      </footer>
    </div>
  );
}
