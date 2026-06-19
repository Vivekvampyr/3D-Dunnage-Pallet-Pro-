import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef();
  const formRef = useRef();
  const nameInputRef = useRef();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 72%',
        toggleActions: 'play none none none',
      }
    });

    tl.fromTo('#cta-headline', { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
      .fromTo('#cta-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('#cta-buttons', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .fromTo('#contact-form', { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
      .fromTo('#trust-indicators', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3');

    return () => {
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, []);

  const handleQuoteClick = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleContactClick = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert('Please fill in your name and email address.');
      return;
    }

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          phone: phone.trim(),
          message: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setName('');
        setEmail('');
        setCompany('');
        setPhone('');
        setMessage('');
      }, 3500);
    } catch (err) {
      console.error('Inquiry submit error:', err);
      alert('Failed to send inquiry. Please ensure the backend server is running.');
    }
  };

  return (
    <section id="cta" ref={containerRef} aria-label="Call to Action">
      <div className="cta-bg"></div>

      <div className="cta-content">
        <h2 id="cta-headline">Built For The Future Of Industrial Logistics</h2>
        <p className="cta-subtitle" id="cta-subtitle">Protect Your Products. Improve Efficiency. Scale Smarter.</p>

        <div className="cta-buttons" id="cta-buttons">
          <button className="btn-primary" onClick={handleQuoteClick}>
            Request A Quote
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button className="btn-secondary" onClick={handleContactClick}>Contact Us</button>
        </div>

        {/* Contact Form */}
        <div className="contact-form-container" id="contact-form" ref={formRef}>
          <h3 className="form-title">Get In Touch</h3>
          <form id="inquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="form-name">Full Name</label>
                <input
                  type="text"
                  id="form-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  ref={nameInputRef}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="form-email">Email Address</label>
                <input
                  type="email"
                  id="form-email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="form-company">Company</label>
                <input
                  type="text"
                  id="form-company"
                  placeholder="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="form-phone">Phone</label>
                <input
                  type="tel"
                  id="form-phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="form-message">Message</label>
                <textarea
                  id="form-message"
                  placeholder="Tell us about your logistics requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group full-width form-submit">
                {isSubmitted ? (
                  <button type="button" className="btn-primary" style={{ background: '#2d8a4e', pointerEvents: 'none' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Sent Successfully
                  </button>
                ) : (
                  <button type="submit" className="btn-primary" id="form-submit-btn">
                    Send Inquiry
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators" id="trust-indicators">
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <span className="trust-value">ISO 9001</span>
            <span className="trust-label">Certified</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <span className="trust-value">500+</span>
            <span className="trust-label">Clients Worldwide</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span className="trust-value">10+</span>
            <span className="trust-label">Years Experience</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span className="trust-value">99.9%</span>
            <span className="trust-label">Delivery Rate</span>
          </div>
        </div>
      </div>
    </section>
  );
}
