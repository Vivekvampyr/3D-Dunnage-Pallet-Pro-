import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PalletModel from './PalletModel';

gsap.registerPlugin(ScrollTrigger);

export default function Solution() {
  const containerRef = useRef();
  const trackRef = useRef();
  const showcaseRef = useRef();

  const benefits = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      title: 'Maximum Stability',
      desc: 'Engineered for maximum load stability and protection during high-speed transit.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      ),
      title: 'Smart Stacking',
      desc: 'Optimized warehouse space with modular, interlocking stacking architecture.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
      title: 'Industrial Grade',
      desc: 'Built to withstand severe industrial transportation and environmental conditions.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
      title: 'Supply Efficiency',
      desc: 'Improves operational efficiency and turnaround times across the entire supply chain.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      ),
      title: 'Long-term ROI',
      desc: 'Durable, reusable, and designed for years of flawless performance.'
    }
  ];

  useLayoutEffect(() => {
    const track = trackRef.current;
    const solutionSec = containerRef.current;
    const showcase = showcaseRef.current;
    if (!track || !solutionSec || !showcase) return;

    const getScrollAmount = () => {
      let trackHeight = track.scrollHeight;
      return -(trackHeight - window.innerHeight + window.innerHeight * 0.1);
    };

    let mm = gsap.matchMedia();

    // Desktop Layout (min-width: 1025px)
    mm.add("(min-width: 1025px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: solutionSec,
          start: 'top top',
          end: '+=400%', // 400vh pin duration
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      // Phase 1: Reveal product centered
      tl.to(showcase, { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 1 }, 0)
        .to('#solution-bg-text', { scale: 1.1, ease: 'none', duration: 1.5 }, 0)
        .to('.solution-headline', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 0.2);

      tl.to({}, { duration: 0.5 }); // Pause slightly in view

      // Phase 2: Translate product to right, scroll benefit cards vertically on left
      tl.to(track, { y: getScrollAmount, ease: 'none', duration: 3 }, 'phase2')
        .to(showcase, { x: '22vw', scale: 0.95, ease: 'power1.inOut', duration: 3 }, 'phase2')
        .to('.solution-headline', { opacity: 0, y: -50, ease: 'power1.in', duration: 1 }, 'phase2');
    });

    // Mobile/Tablet Layout (max-width: 1024px)
    mm.add("(max-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: solutionSec,
          start: 'top top',
          end: '+=400%',
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      tl.to(showcase, { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 1 }, 0)
        .to('#solution-bg-text', { scale: 1.1, ease: 'none', duration: 1.5 }, 0)
        .to('.solution-headline', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 0.2);

      tl.to({}, { duration: 0.5 });

      // On mobile, dim the product in background and scroll cards centrally
      tl.to(track, { y: getScrollAmount, ease: 'none', duration: 3 }, 'phase2')
        .to(showcase, { opacity: 0.18, scale: 0.9, ease: 'power1.inOut', duration: 3 }, 'phase2')
        .to('.solution-headline', { opacity: 0, y: -50, ease: 'power1.in', duration: 1 }, 'phase2');
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section id="solution" ref={containerRef} aria-label="Dunnage Pallet Solution">
      <div className="solution-sticky">
        
        {/* Outline Typography */}
        <div className="solution-bg-text" id="solution-bg-text">
          DUNNAGE PRO
        </div>

        {/* 3D Visualizer Canvas (Mouse interactions active) */}
        <div className="product-showcase" ref={showcaseRef} style={{ opacity: 0, transform: 'scale(0.65) translateY(60px)' }}>
          <div className="product-spotlight"></div>
          <PalletModel />
        </div>

        {/* Section Title */}
        <div className="solution-headline" style={{ opacity: 0, transform: 'translateY(-20px)' }}>
          <h2>The Foundation Of<br /><span>Efficient</span> Logistics</h2>
        </div>

        {/* Left Side Scrolling Benefits Deck */}
        <div className="benefits-track-container">
          <div className="benefits-track" ref={trackRef}>
            {benefits.map((b, idx) => (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
