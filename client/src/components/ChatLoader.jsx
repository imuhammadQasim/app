import React from 'react';

const ChatLoader = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.chatBubble}>
        <span style={styles.dot}></span>
        <span style={{ ...styles.dot, animationDelay: '0.2s' }}></span>
        <span style={{ ...styles.dot, animationDelay: '0.4s' }}></span>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  chatBubble: {
    backgroundColor: '#eee',
    borderRadius: '25px',
    padding: '12px 20px',
    display: 'flex',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#555',
    animation: 'blink 1.2s infinite ease-in-out',
  },
};

// Inject keyframes if not present
if (typeof document !== 'undefined') {
  const sheet = document.styleSheets[0];
  if (![...sheet.cssRules].some(r => r.name === 'blink')) {
    sheet.insertRule(`
      @keyframes blink {
        0%, 80%, 100% { opacity: 0; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1); }
      }
    `, sheet.cssRules.length);
  }
}

export default ChatLoader;
