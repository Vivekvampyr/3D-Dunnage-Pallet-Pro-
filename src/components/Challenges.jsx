import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Challenges() {
  const containerRef = useRef();
  const [currentSlide, setCurrentSlide] = useState(-1);

  const slides = [
    {
      num: '01',
      title: 'Product Damage\nDuring Transportation',
      desc: 'Fragile storage systems lead to damaged goods, financial losses, and operational disruption during transportation.',
      img: 'assets/problem statements/PRODUCT DAMAGE DURING TRANSPORTATION.png'
    },
    {
      num: '02',
      title: 'Inefficient\nFloor Stacking',
      desc: 'Unorganized floor stacking wastes valuable warehouse space and slows down daily operations.',
      img: 'assets/problem statements/INEFFICIENT FLOOR STACKING.png'
    },
    {
      num: '03',
      title: 'Poor Load\nDistribution',
      desc: 'Improper load balancing increases instability, safety risks, and transportation failures.',
      img: 'assets/problem statements/POOR LOAD DISTRIBUTION.png'
    },
    {
      num: '04',
      title: 'Moisture And\nImpact Damage',
      desc: 'Exposure to moisture and impact can severely affect product safety and inventory quality.',
      img: 'assets/problem statements/MOISTURE AND IMPACT DAMAGE.png'
    },
    {
      num: '05',
      title: 'Slow Material\nHandling',
      desc: 'Inefficient warehouse movement reduces productivity and delays logistics performance.',
      img: 'assets/problem statements/SLOW MATERIAL HANDLING.png'
    },
    {
      num: '06',
      title: 'Unsafe Pallet\nSystems',
      desc: 'Weak pallet systems create unstable storage conditions and increase operational risk.',
      img: 'assets/problem statements/UNSAFE PALLET SYSTEMS.png'
    }
  ];

  useEffect(() => {
    // Intro header entry fade
    gsap.from('.problems-intro-inner', {
      scrollTrigger: {
        trigger: '.problems-intro',
        start: 'top 75%',
      },
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
    });

    // Pin timeline mapping scroll progress to active slide index
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalSlides = slides.length;

        if (progress < 0.08) {
          setCurrentSlide(-1);
          return;
        }

        const slideProgress = (progress - 0.08) / 0.92;
        const idx = Math.min(
          totalSlides - 1,
          Math.floor(slideProgress * totalSlides)
        );
        setCurrentSlide(idx);
      }
    });

    return () => {
      trigger.kill();
    };
  }, [slides.length]);

  const handleDotClick = (idx) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const totalScrollHeight = rect.height - window.innerHeight;
    
    // Map dot index to exact scroll target in the pinned track
    const targetScroll = absoluteTop + (0.08 + (idx / slides.length) * 0.92) * totalScrollHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <section id="problems" ref={containerRef} aria-label="Industry Challenges">
      <div className="problems-sticky">
        
        {/* Intro Section Header */}
        <div className="problems-intro" style={{
          opacity: currentSlide === -1 ? 1 : 0,
          visibility: currentSlide === -1 ? 'visible' : 'hidden',
          transition: 'opacity 0.6s var(--ease-smooth), visibility 0.6s'
        }}>
          <div className="problems-intro-inner">
            <span className="section-label">The Challenge</span>
            <h2>Industry Pain Points</h2>
            <p className="problems-header-sub">Critical challenges that cost the logistics industry billions every year</p>
          </div>
        </div>

        {/* Dynamic Slides Overlay */}
        <div className="problem-slide-container" style={{
          opacity: currentSlide === -1 ? 0 : 1,
          transition: 'opacity 0.6s var(--ease-smooth)'
        }}>
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`problem-slide ${currentSlide === idx ? 'active' : ''}`}
            >
              <div className="problem-slide-bg">
                <img src={slide.img} alt={slide.title} />
              </div>
              <div className="problem-slide-overlay"></div>
              <div className="problem-slide-content">
                <span className="problem-num">{slide.num}</span>
                <h3 className="problem-title">
                  {slide.title.split('\n').map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {line}
                      {lIdx < slide.title.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h3>
                <div className="problem-line"></div>
                <p className="problem-desc">{slide.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vertical Pagination dots (active index linked) */}
        <div className={`problem-progress ${currentSlide !== -1 ? 'visible' : ''}`}>
          <div className="problem-progress-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`progress-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Scroll to problem slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Counter tracker */}
        <div className={`problem-counter ${currentSlide !== -1 ? 'visible' : ''}`}>
          <span className="counter-current">
            {String(Math.max(1, currentSlide + 1)).padStart(2, '0')}
          </span>
          <span className="counter-sep">/</span>
          <span className="counter-total">06</span>
        </div>

      </div>
    </section>
  );
}
