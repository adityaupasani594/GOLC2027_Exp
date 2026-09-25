import React, { useEffect, useRef } from 'react';

export function useMathJax(deps = []) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function MathJaxSpan({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([ref.current]).catch(() => {});
    }
  }, [children]);
  return <span ref={ref} className={className}>{children}</span>;
}

export function MathJaxDiv({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([ref.current]).catch(() => {});
    }
  }, [children]);
  return <div ref={ref} className={className}>{children}</div>;
}
