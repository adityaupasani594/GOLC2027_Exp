import React, { useEffect, useRef } from 'react';

function triggerMathJax(nodes) {
  if (typeof window === 'undefined') return;
  if (window.MathJax?.typesetPromise) {
    if (nodes) {
      const elList = Array.isArray(nodes) ? nodes : [nodes];
      // Filter for elements currently attached to DOM
      const validNodes = elList.filter(n => n && document.contains(n));
      if (validNodes.length > 0) {
        window.MathJax.typesetPromise(validNodes).catch(() => {});
      }
    } else {
      window.MathJax.typesetPromise().catch(() => {});
    }
  }
}

export function useMathJax(deps = []) {
  useEffect(() => {
    triggerMathJax();

    const handleReady = () => triggerMathJax();
    window.addEventListener('mathjax-ready', handleReady);

    let timer;
    if (!window.MathJax?.typesetPromise) {
      let attempts = 0;
      timer = setInterval(() => {
        attempts++;
        if (window.MathJax?.typesetPromise) {
          triggerMathJax();
          clearInterval(timer);
        } else if (attempts > 30) {
          clearInterval(timer);
        }
      }, 200);
    }

    return () => {
      window.removeEventListener('mathjax-ready', handleReady);
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function MathJaxSpan({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      triggerMathJax(ref.current);
    }
  }, [children]);
  return <span ref={ref} className={className}>{children}</span>;
}

export function MathJaxDiv({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      triggerMathJax(ref.current);
    }
  }, [children]);
  return <div ref={ref} className={className}>{children}</div>;
}
