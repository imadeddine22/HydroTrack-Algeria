'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Registers a set of scroll-triggered GSAP animations for the main landing page.
 * Call this hook once inside the HomePage component.
 */
export function useGsapAnimations() {
  useEffect(() => {
    // Small delay so DOM is fully rendered
    const ctx = gsap.context(() => {

      /* ── 1. NAVBAR ─────────────────────────────────────────── */
      gsap.from('[data-gsap="navbar"]', {
        y: -80,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });

      /* ── 2. HERO ────────────────────────────────────────────── */
      const heroTl = gsap.timeline({ delay: 0.2 });
      heroTl
        .from('[data-gsap="hero-badge"]', {
          scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(2)',
        })
        .from('[data-gsap="hero-title"] > *', {
          y: 60, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        }, '-=0.2')
        .from('[data-gsap="hero-desc"]', {
          y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
        }, '-=0.3')
        .from('[data-gsap="hero-cta"] > *', {
          y: 20, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out',
        }, '-=0.2');

      /* ── 3. FEATURES ────────────────────────────────────────── */
      gsap.from('[data-gsap="features-title"]', {
        scrollTrigger: { trigger: '[data-gsap="features-title"]', start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
      });

      gsap.from('[data-gsap="feature-item"]', {
        scrollTrigger: {
          trigger: '[data-gsap="features-grid"]',
          start: 'top 80%',
        },
        y: 60, opacity: 0, duration: 0.7,
        stagger: 0.15, ease: 'power3.out',
      });

      /* ── 4. EXPLORE SECTION ─────────────────────────────────── */
      gsap.from('[data-gsap="explore-title"]', {
        scrollTrigger: { trigger: '[data-gsap="explore-title"]', start: 'top 85%' },
        x: -60, opacity: 0, duration: 0.8, ease: 'power3.out',
      });

      gsap.from('[data-gsap="explore-desc"]', {
        scrollTrigger: { trigger: '[data-gsap="explore-desc"]', start: 'top 88%' },
        x: -40, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.2,
      });

      gsap.from('[data-gsap="explore-img-1"]', {
        scrollTrigger: { trigger: '[data-gsap="explore-img-1"]', start: 'top 85%' },
        scale: 0.8, opacity: 0, rotation: -5, duration: 0.8, ease: 'back.out(1.5)',
      });

      gsap.from('[data-gsap="explore-img-2"]', {
        scrollTrigger: { trigger: '[data-gsap="explore-img-2"]', start: 'top 85%' },
        scale: 0.8, opacity: 0, rotation: 5, duration: 0.8, ease: 'back.out(1.5)', delay: 0.15,
      });

      gsap.from('[data-gsap="filter-panel"]', {
        scrollTrigger: { trigger: '[data-gsap="filter-panel"]', start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
      });

      gsap.from('[data-gsap="stat-card"]', {
        scrollTrigger: { trigger: '[data-gsap="stat-card"]', start: 'top 85%' },
        y: 30, opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)',
      });

      /* ── 5. ABOUT ───────────────────────────────────────────── */
      gsap.from('[data-gsap="about-image"]', {
        scrollTrigger: { trigger: '[data-gsap="about-image"]', start: 'top 80%' },
        x: -80, opacity: 0, duration: 1, ease: 'power3.out',
      });

      gsap.from('[data-gsap="about-badge"]', {
        scrollTrigger: { trigger: '[data-gsap="about-badge"]', start: 'top 85%' },
        y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
      });

      gsap.from('[data-gsap="about-title"]', {
        scrollTrigger: { trigger: '[data-gsap="about-title"]', start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.1,
      });

      gsap.from('[data-gsap="about-check"]', {
        scrollTrigger: { trigger: '[data-gsap="about-checks"]', start: 'top 85%' },
        x: 40, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out',
      });

      gsap.from('[data-gsap="about-bio"]', {
        scrollTrigger: { trigger: '[data-gsap="about-bio"]', start: 'top 90%' },
        y: 30, opacity: 0, scale: 0.95, duration: 0.6, ease: 'back.out(1.5)',
      });

      /* ── 6. CONTACT ─────────────────────────────────────────── */
      gsap.from('[data-gsap="contact-text"]', {
        scrollTrigger: { trigger: '[data-gsap="contact-text"]', start: 'top 85%' },
        x: -50, opacity: 0, duration: 0.8, ease: 'power3.out',
      });

      gsap.from('[data-gsap="contact-form"]', {
        scrollTrigger: { trigger: '[data-gsap="contact-form"]', start: 'top 85%' },
        x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1,
      });

      /* ── 7. FOOTER ──────────────────────────────────────────── */
      gsap.from('[data-gsap="footer-brand"]', {
        scrollTrigger: { trigger: '[data-gsap="footer-brand"]', start: 'top 90%' },
        y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
      });

      gsap.from('[data-gsap="footer-col"]', {
        scrollTrigger: { trigger: '[data-gsap="footer-col"]', start: 'top 90%' },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
      });

    });

    return () => ctx.revert();
  }, []);
}
