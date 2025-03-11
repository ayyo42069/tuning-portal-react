"use client";

import React, { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxContextType {
  scrollY: number;
  registerParallaxElement: (element: HTMLElement, speed: number) => void;
  unregisterParallaxElement: (element: HTMLElement) => void;
}

const ParallaxContext = createContext<ParallaxContextType | null>(null);

export const useParallax = () => {
  const context = useContext(ParallaxContext);
  if (!context) {
    throw new Error('useParallax must be used within a ParallaxProvider');
  }
  return context;
};

interface ParallaxProviderProps {
  children: ReactNode;
}

export const ParallaxProvider: React.FC<ParallaxProviderProps> = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);
  const parallaxElements = useRef<Map<HTMLElement, number>>(new Map());
  const gsapContext = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Create a GSAP context for better memory management
    gsapContext.current = gsap.context(() => {});

    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update parallax elements
      parallaxElements.current.forEach((speed, element) => {
        gsap.to(element, {
          y: window.scrollY * speed,
          ease: 'none',
          duration: 0.5,
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      gsapContext.current?.revert(); // Clean up all GSAP animations
    };
  }, []);

  const registerParallaxElement = (element: HTMLElement, speed: number) => {
    parallaxElements.current.set(element, speed);
  };

  const unregisterParallaxElement = (element: HTMLElement) => {
    parallaxElements.current.delete(element);
  };

  return (
    <ParallaxContext.Provider
      value={{
        scrollY,
        registerParallaxElement,
        unregisterParallaxElement,
      }}
    >
      {children}
    </ParallaxContext.Provider>
  );
};

// Custom hook for creating parallax effect on an element
export const useParallaxEffect = (speed: number = 0.1) => {
  const { registerParallaxElement, unregisterParallaxElement } = useParallax();
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      registerParallaxElement(element, speed);
      return () => unregisterParallaxElement(element);
    }
  }, [registerParallaxElement, unregisterParallaxElement, speed]);

  return elementRef;
};

// Custom hook for 3D hover effect
export const use3DHoverEffect = (intensity: number = 30) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX; // -1 to 1
      const deltaY = (y - centerY) / centerY; // -1 to 1
      
      gsap.to(element, {
        rotationY: deltaX * intensity,
        rotationX: -deltaY * intensity,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.5,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotationY: 0,
        rotationX: 0,
        ease: 'elastic.out(1, 0.3)',
        duration: 1.5,
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return elementRef;
};

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (options: {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  animation?: gsap.TweenVars;
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      trigger = element,
      start = 'top bottom',
      end = 'bottom top',
      scrub = false,
      markers = false,
      animation = { y: 50, opacity: 0 }
    } = options;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        markers,
      }
    });

    tl.from(element, { ...animation, duration: 1 });

    return () => {
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [options]);

  return elementRef;
};