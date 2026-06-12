import { useState, useEffect } from 'react';

export default function Header({ activeSection, onScrollTo, isLoggedIn, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: 'hero', name: 'Home' },
    { id: 'warehouse', name: 'Warehouse' },
    { id: 'problems', name: 'Challenges' },
    { id: 'solution', name: 'Solution' },
    { id: 'cta', name: 'Contact' }
  ];

  // Prevent scroll behind mobile drawer
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    onScrollTo(id);
  };

  return (
    <>
      <header id="site-header" className="site-header">
        <div className="header-container">
          <a href="#hero" className="header-logo" onClick={(e) => handleLinkClick(e, 'hero')}>
            DUNNAGE<span>PRO</span>
          </a>
          <nav className="desktop-nav" aria-label="Desktop navigation">
            {links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, link.id)}
              >
                {link.name}
              </a>
            ))}
            {isLoggedIn && (
              <button 
                onClick={onLogout} 
                className="nav-link" 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  textTransform: 'uppercase',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  letterSpacing: 'inherit',
                  padding: '8px 4px'
                }}
              >
                Logout
              </button>
            )}
          </nav>
          <button
            className={`menu-toggle ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isOpen}
          >
            <span className="hamburger-line line-1"></span>
            <span className="hamburger-line line-2"></span>
            <span className="hamburger-line line-3"></span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="sidebar-logo">DUNNAGE<span>PRO</span></div>
          </div>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map((link, idx) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`sidebar-link ${activeSection === link.id ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                style={{ transitionDelay: isOpen ? `${0.1 + idx * 0.05}s` : '0s' }}
              >
                {link.name}
              </a>
            ))}
            {isLoggedIn && (
              <button 
                onClick={() => { setIsOpen(false); onLogout(); }} 
                className="sidebar-link" 
                style={{ 
                  textAlign: 'left',
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  textTransform: 'uppercase',
                  color: 'var(--color-orange)',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(30px)',
                  transitionDelay: isOpen ? `${0.1 + links.length * 0.05}s` : '0s',
                  width: '100%',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  letterSpacing: 'inherit'
                }}
              >
                Logout
              </button>
            )}
          </nav>
          <div className="sidebar-footer">
            <p>&copy; 2026 DunnagePro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}
