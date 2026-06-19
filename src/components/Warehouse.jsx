import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Warehouse() {
  const containerRef = useRef();
  const videoRef = useRef();
  const [typedText, setTypedText] = useState('');

  // Typing animation effect on mount with a slight delay for cinematic timing
  useEffect(() => {
    // Reset scroll immediately to the very top on mount to guarantee visibility
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fullText = 'DUNNAGE PRO';
    let currentIdx = 0;
    let interval;

    const delayTimeout = setTimeout(() => {
      interval = setInterval(() => {
        setTypedText(fullText.slice(0, currentIdx + 1));
        currentIdx++;
        if (currentIdx >= fullText.length) {
          clearInterval(interval);
        }
      }, 100);
    }, 500); // 500ms delay for smooth cinematic entry

    return () => {
      clearTimeout(delayTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let targetTime = 0;
    let isSeeking = false;
    let frameId;

    const onSeeked = () => {
      isSeeking = false;
    };
    video.addEventListener('seeked', onSeeked);

    // Frame interpolation render loop to eliminate scrub stuttering
    const renderVideo = () => {
      if (video.readyState >= 2 && !isSeeking && Math.abs(video.currentTime - targetTime) > 0.05) {
        isSeeking = true;
        video.currentTime = targetTime;
      }
      frameId = requestAnimationFrame(renderVideo);
    };

    const bindScrub = () => {
      const duration = video.duration;
      if (!duration || isNaN(duration)) return;

      const proxy = { t: 0 };

      // Pin the warehouse section and scrub the currentTime proxy
      gsap.to(proxy, {
        t: duration,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: () => {
            targetTime = proxy.t;
          }
        }
      });

      frameId = requestAnimationFrame(renderVideo);
    };

    if (video.readyState >= 1) {
      bindScrub();
    } else {
      video.addEventListener('loadedmetadata', bindScrub, { once: true });
    }

    // Fade out the intro title as the user starts scrolling
    gsap.to('.warehouse-intro-text', {
      opacity: 0,
      y: -50,
      scale: 0.95,
      ease: 'power2.in',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '8% top',
        scrub: true,
      }
    });

    // GSAP timelines for text panels fade-in/out (excluding the intro title)
    const panels = gsap.utils.toArray('.warehouse-text').filter(panel => !panel.classList.contains('warehouse-intro-text'));
    panels.forEach((panel, i) => {
      const enter = 10 + i * 28;
      const peak = enter + 8;
      const exit = enter + 22;

      // Slide-in fade
      gsap.fromTo(panel,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: `${enter}% top`,
            end: `${peak}% top`,
            scrub: true,
          }
        }
      );

      // Slide-out fade
      gsap.to(panel, {
        opacity: 0,
        y: -40,
        scale: 0.97,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: container,
          start: `${peak + 4}% top`,
          end: `${exit}% top`,
          scrub: true,
        }
      });
    });

    return () => {
      video.removeEventListener('seeked', onSeeked);
      cancelAnimationFrame(frameId);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section id="warehouse" ref={containerRef} aria-label="Warehouse Experience">
      <div className="warehouse-sticky">
        <div className="warehouse-media">
          <img src="assets/Warehouse_Interior_Image.png" alt="Industrial warehouse interior" className="warehouse-fallback" />
          <video ref={videoRef} muted playsInline preload="auto">
            <source src="assets/Warehouse_Interior_Video.mp4" type="video/mp4" />
          </video>
          <div className="warehouse-ambient"></div>
        </div>

        {/* Cinematic Intro text (visible initially, fades on scroll) */}
        <div className="warehouse-text warehouse-intro-text">
          <h1 className="cinematic-title">
            {typedText.substring(0, 7)}
            <span style={{ color: 'var(--color-orange)' }}>
              {typedText.substring(7)}
            </span>
            <span className="typing-cursor">|</span>
          </h1>
          <p className="cinematic-subtitle">PREMIUM SOLUTIONS FOR MODERN LOGISTICS</p>
          <div className="accent-line"></div>
        </div>

        {/* Text panels overlay */}
        <div className="warehouse-text warehouse-text-1">
          <h2>Step Inside</h2>
          <p>The Future Of Warehousing</p>
          <div className="accent-line"></div>
        </div>

        <div className="warehouse-text warehouse-text-2">
          <h2>Where Innovation</h2>
          <p>Meets Industrial Strength</p>
          <div className="accent-line"></div>
        </div>

        <div className="warehouse-text warehouse-text-3">
          <h2>Precision. Protection.</h2>
          <p>Performance.</p>
          <div className="accent-line"></div>
        </div>
      </div>
    </section>
  );
}
