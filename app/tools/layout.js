import React from 'react';

export default function ToolsLayout({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Crimson+Pro:ital,wght@0,700;0,900;1,700;1,900&family=JetBrains+Mono&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="tools-wrapper">
        {children}
      </div>
    </>
  );
}
