import React, { useEffect, useRef } from 'react';

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  color: string;
  alpha: number;
}

export const FuturisticMotionBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Clinical Biomarker Node Labels
    const biomarkerLabels = [
      'HbA1c 7.6%', 'BP 152/96', 'eGFR 78', 'SpO2 98%', 'HR 114 BPM',
      'LDL 142', 'ADA 2026', 'KDIGO 2025', 'SHAP +34%', 'XAI Vector',
      'PPG Sensor', 'GATT BLE', 'ICD-10 I10', 'EHR Sync'
    ];

    const colors = ['#0284C7', '#059669', '#0D9488', '#6366F1', '#D97706'];

    // Initialize 28 Particle Nodes
    const particles: ParticleNode[] = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 2,
      label: biomarkerLabels[i % biomarkerLabels.length],
      color: colors[i % colors.length],
      alpha: Math.random() * 0.5 + 0.35,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cyber grid background
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Mouse Parallax Offset
      const mouseOffsetX = (mouseRef.current.x - width / 2) * 0.015;
      const mouseOffsetY = (mouseRef.current.y - height / 2) * 0.015;

      // Draw connecting energy threads between nearby nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.12;
            ctx.strokeStyle = `rgba(2, 132, 199, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x + mouseOffsetX, particles[i].y + mouseOffsetY);
            ctx.lineTo(particles[j].x + mouseOffsetX, particles[j].y + mouseOffsetY);
            ctx.stroke();
          }
        }
      }

      // Render Particles & Pulsing Text Labels
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const posX = p.x + mouseOffsetX;
        const posY = p.y + mouseOffsetY;

        // Glowing Node Orb
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(posX, posY, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Node Glow Halo
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.15;
        ctx.beginPath();
        ctx.arc(posX, posY, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node Label (for key nodes)
        if (idx % 2 === 0) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#475569';
          ctx.globalAlpha = p.alpha * 0.85;
          ctx.fillText(p.label, posX + p.radius + 6, posY + 3);
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 3D Soft Light Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/10 rounded-full blur-[100px] animate-float-orb-light" />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-[120px] animate-float-orb-light" style={{ animationDelay: '-6s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-teal-400/10 rounded-full blur-[110px] animate-float-orb-light" style={{ animationDelay: '-12s' }} />

      {/* HTML5 Canvas for Interactive Biomarker Neural Particles */}
      <canvas ref={canvasRef} className="block w-full h-full opacity-60" />
    </div>
  );
};
