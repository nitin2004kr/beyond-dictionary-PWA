import React from 'react';

export default function NoteNinjaLayout({ children }) {
  return (
    <div className="note-ninja-layout">
      {/* NoteNinja manages its own header and footer internally to match the HTML design exactly */}
      {children}
    </div>
  );
}
