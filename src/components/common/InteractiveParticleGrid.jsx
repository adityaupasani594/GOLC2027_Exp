import React, { useEffect, useRef } from 'react';

/**
 * InteractiveParticleGrid
 *
 * Full-screen, cursor-reactive animated canvas background.
 * - Dynamic deflection: Nearby particles deflect from the cursor and spring back with damped harmonic motion.
 * - Visual excitation: Particles and lattice grid lines transition from nodeColor (#6366f1) to highlightColor (#FF6F61).
 * - High-DPI / 60 FPS requestAnimationFrame with resize handling and mobile throttle.
 */
export default function InteractiveParticleGrid({
  backgroundColor = 'transparent',
  nodeColor = '#6366f1',
  highlightColor = '#8b5cf6',
  gridSpacing = 42,
  interactionRadius = 145,
  repelStrength = 7.5,
  springStiffness = 0.068,
  damping = 0.85,
  showConnections = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    // Detect mobile
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    const spacing = isMobile ? Math.max(gridSpacing * 1.4, 56) : gridSpacing;
    const radius = isMobile ? interactionRadius * 0.8 : interactionRadius;

    // Real-time cursor state
    const cursor = {
      x: -9999,
      y: -9999,
      active: false,
    };

    let width = 0;
    let height = 0;
    let particles = [];
    let cols = 0;
    let rows = 0;

    const hexToRgb = (hex) => {
      if (!hex || hex === 'transparent') return { r: 99, g: 102, b: 241 };
      const clean = hex.replace('#', '');
      const num = parseInt(clean, 16);
      if (clean.length === 3) {
        return {
          r: ((num >> 8) & 0xf) * 17,
          g: ((num >> 4) & 0xf) * 17,
          b: (num & 0xf) * 17,
        };
      }
      return {
        r: (num >> 16) & 0xff,
        g: (num >> 8) & 0xff,
        b: num & 0xff,
      };
    };

    const baseRgb = hexToRgb(nodeColor);
    const highlightRgb = hexToRgb(highlightColor);

    const initGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      particles = [];

      const startX = (width - (cols - 1) * spacing) / 2;
      const startY = (height - (rows - 1) * spacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = startX + c * spacing;
          const by = startY + r * spacing;
          particles.push({
            r,
            c,
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            highlight: 0,
            baseRadius: 2.4,
          });
        }
      }
    };

    initGrid();

    // Event listeners for pointer & touch
    const updateCursor = (clientX, clientY) => {
      cursor.x = clientX;
      cursor.y = clientY;
      cursor.active = true;
    };

    const handlePointerMove = (e) => {
      updateCursor(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      cursor.active = false;
      cursor.x = -9999;
      cursor.y = -9999;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updateCursor(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      cursor.active = false;
      cursor.x = -9999;
      cursor.y = -9999;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initGrid, 100);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS Spring Physics Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      const totalParticles = particles.length;

      // 1. Spring Physics Calculation
      for (let i = 0; i < totalParticles; i++) {
        const p = particles[i];

        // Cursor deflection
        if (cursor.active) {
          const dx = cursor.x - p.x;
          const dy = cursor.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius && dist > 0) {
            const proximity = 1 - dist / radius;
            const angle = Math.atan2(dy, dx);
            const force = proximity * proximity * repelStrength;

            p.vx -= Math.cos(angle) * force;
            p.vy -= Math.sin(angle) * force;

            p.highlight = Math.min(1, p.highlight + proximity * 0.85);
          }
        }

        // Spring pulling back to baseX, baseY
        const springX = (p.baseX - p.x) * springStiffness;
        const springY = (p.baseY - p.y) * springStiffness;

        p.vx = (p.vx + springX) * damping;
        p.vy = (p.vy + springY) * damping;

        p.x += p.vx;
        p.y += p.vy;

        p.highlight *= 0.93;
        if (p.highlight < 0.005) p.highlight = 0;
      }

      // 2. Render Grid Connection Lines
      if (showConnections) {
        ctx.lineWidth = 1.0;
        for (let i = 0; i < totalParticles; i++) {
          const p = particles[i];

          // Right neighbor
          if (p.c < cols - 1) {
            const right = particles[i + 1];
            drawLine(p, right);
          }

          // Bottom neighbor
          if (p.r < rows - 1) {
            const bottom = particles[i + cols];
            if (bottom) drawLine(p, bottom);
          }
        }
      }

      function drawLine(p1, p2) {
        const avgH = (p1.highlight + p2.highlight) * 0.5;
        // Non-active lines completely disappear
        if (avgH < 0.02) return;

        const alpha = avgH * 0.85;

        const r = Math.round(baseRgb.r + (highlightRgb.r - baseRgb.r) * avgH);
        const g = Math.round(baseRgb.g + (highlightRgb.g - baseRgb.g) * avgH);
        const b = Math.round(baseRgb.b + (highlightRgb.b - baseRgb.b) * avgH);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.stroke();
      }

      // 3. Render Particles
      for (let i = 0; i < totalParticles; i++) {
        const p = particles[i];
        const h = p.highlight;
        // Non-active particles completely disappear
        if (h < 0.02) continue;

        const r = Math.round(baseRgb.r + (highlightRgb.r - baseRgb.r) * h);
        const g = Math.round(baseRgb.g + (highlightRgb.g - baseRgb.g) * h);
        const b = Math.round(baseRgb.b + (highlightRgb.b - baseRgb.b) * h);

        const currentRadius = p.baseRadius + h * 2.2;
        const alpha = h * 0.95;

        // Single clean circle (no concentric outer ring)
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [
    backgroundColor,
    nodeColor,
    highlightColor,
    gridSpacing,
    interactionRadius,
    repelStrength,
    springStiffness,
    damping,
    showConnections,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
