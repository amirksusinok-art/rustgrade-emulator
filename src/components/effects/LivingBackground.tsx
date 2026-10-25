import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

export const LivingBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Particle colors for fire embers / sparks
    const colors = ['#FFD54F', '#FFB74D', '#FF9800', '#FF7043', '#E64A19'];
    const particles: Particle[] = [];
    const maxParticles = 35;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        speedY: Math.random() * 0.9 + 0.3,
        speedX: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.8 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render glowing embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.02) * 0.3;
        p.opacity -= p.fadeSpeed;

        if (p.opacity <= 0 || p.y < -10) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.opacity = Math.random() * 0.8 + 0.3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.closePath();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Warehouse Background Photo (Photo 5 from user) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: `url('/images/background/warehouse_bg.png')`,
          filter: 'brightness(0.38) contrast(1.15) saturate(0.85)',
        }}
      />

      {/* 2. Atmospheric Dark Rust Vignette & Deep Lighting */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 35%, rgba(13, 16, 22, 0.45) 0%, rgba(10, 12, 16, 0.85) 65%, rgba(6, 8, 10, 0.98) 100%),
            linear-gradient(180deg, rgba(14, 17, 24, 0.55) 0%, rgba(10, 12, 16, 0.75) 50%, rgba(6, 8, 11, 0.96) 100%)
          `,
        }}
      />

      {/* 3. Subtle Industrial Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 4. Workbench T3 Hanging Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-64 flex flex-col items-center pointer-events-none origin-top animate-lamp-swing opacity-50">
        {/* Wire */}
        <div className="w-[2px] h-36 bg-gradient-to-b from-[#1b202a] via-[#363c4e] to-[#262b37]" />
        {/* Lamp Hood */}
        <div className="w-14 h-5 bg-[#1B202A] border border-[#363C4E] rounded-t-lg -mt-1 shadow-md" />
        {/* Glowing Bulb */}
        <div className="w-6 h-6 rounded-full bg-[#FFD54F] shadow-[0_0_35px_#FFB74D] -mt-1 opacity-90" />
        {/* Light Cone */}
        <div 
          className="w-96 h-96 -mt-3 rounded-full opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 183, 77, 0.25) 0%, rgba(255, 183, 77, 0) 70%)',
          }}
        />
      </div>

      {/* 5. Canvas with fire sparks */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
