
import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  width?: 'fit-content' | '100%';
  direction?: 'up' | 'down' | 'left' | 'right';
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  className = "", 
  delay = 0, 
  width = "100%",
  direction = "up"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced threshold and removed margin for more reliable mobile triggering
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.05, // Trigger as soon as 5% is visible
        rootMargin: "0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  const getTransformClass = () => {
    if (!isVisible) {
      // Reduced displacement (32 -> 20) to prevent triggering horizontal scrollbars on mobile
      switch (direction) {
        case 'left': return '-translate-x-20 opacity-0 blur-sm'; 
        case 'right': return 'translate-x-20 opacity-0 blur-sm'; 
        case 'down': return '-translate-y-10 opacity-0 blur-sm'; 
        case 'up': default: return 'translate-y-10 opacity-0 blur-sm'; 
      }
    }
    return 'translate-x-0 translate-y-0 opacity-100 blur-0';
  };

  return (
    <div
      ref={ref}
      style={{ 
        transitionDelay: `${delay}ms`,
        width 
      }}
      className={`${className} transition-all duration-700 ease-out transform ${getTransformClass()}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
