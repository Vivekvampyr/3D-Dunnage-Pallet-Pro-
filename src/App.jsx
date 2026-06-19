import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from './components/Header';
import Hero from './components/Hero';
import GateTransition from './components/GateTransition';
import Warehouse from './components/Warehouse';
import Challenges from './components/Challenges';
import Solution from './components/Solution';
import Contact from './components/Contact';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [preloaderProgress, setPreloaderProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setUser] = useState(null);
  const [isGateActive, setIsGateActive] = useState(false);
  const [gateDone, setGateDone] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const lenisInstance = useRef(null);

  // Restore user session on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Token verification failed');
      return res.json();
    })
    .then(data => {
      setUser(data.user);
      setIsLoggedIn(true);
      setGateDone(true); // Bypass gate animation on refresh if session is active
    })
    .catch(err => {
      console.warn('Session restoring error:', err);
      localStorage.removeItem('token');
    });
  }, []);

  // Simulated asset preloader progress sequence
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 0.02, 0.85);
      setPreloaderProgress(progress);
    }, 30);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setPreloaderProgress(1);
      setTimeout(() => {
        setPreloaderVisible(false);
      }, 400);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // Enforce scroll locks before portal entry
  useEffect(() => {
    if (!gateDone) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [gateDone]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setIsGateActive(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setGateDone(false);
    document.body.classList.remove('gate-done');
    // Scroll instantly to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleGateComplete = () => {
    setIsGateActive(false);
    setGateDone(true);
    setIsLoggedIn(true);
    document.body.classList.add('gate-done');

    // Stagger GSAP animation for header links
    setTimeout(() => {
      gsap.from('.nav-link', {
        opacity: 0,
        y: -20,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      });
    }, 450);
  };

  // Launch smooth scroll and bind spy checks upon successful entry
  useLayoutEffect(() => {
    if (!isLoggedIn) return;

    const whSection = document.getElementById('warehouse');
    if (whSection) {
      setTimeout(() => {
        window.scrollTo({ top: whSection.offsetTop, behavior: 'instant' });
      }, 50);
    }

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });

    lenisInstance.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Track active sections for the floating spy highlights
    const sections = ['hero', 'warehouse', 'problems', 'solution', 'cta'];
    const triggers = [];

    sections.forEach((secId) => {
      const element = document.getElementById(secId);
      if (!element) return;

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            setActiveSection(secId);
          }
        }
      });
      triggers.push(trigger);
    });

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      triggers.forEach(t => t.kill());
    };
  }, [isLoggedIn]);

  const handleScrollTo = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (lenisInstance.current) {
      const offset = window.innerWidth <= 768 ? -70 : -80;
      lenisInstance.current.scrollTo(target, { offset });
    } else {
      const offset = window.innerWidth <= 768 ? 70 : 80;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* 1. preloader screen */}
      {preloaderVisible && (
        <div id="preloader" role="status" aria-label="Loading">
          <div className="preloader-brand">DUNNAGE<span>PRO</span></div>
          <div className="preloader-bar">
            <div
              className="preloader-progress"
              style={{ transform: `scaleX(${preloaderProgress})` }}
            ></div>
          </div>
        </div>
      )}

      {/* 2. site navbar */}
      <Header activeSection={activeSection} onScrollTo={handleScrollTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      {/* 3. hero login access block */}
      {!isLoggedIn && <Hero onLoginSuccess={handleLoginSuccess} />}

      {/* 4. gate entrance video player */}
      <GateTransition active={isGateActive} onComplete={handleGateComplete} />

      {/* 5. main website sections */}
      {isLoggedIn && (
        <>
          <Warehouse />
          <Challenges />
          <Solution />
          <Contact />
          <Footer />
        </>
      )}
    </>
  );
}
