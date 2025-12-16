"use client";

import { useConfig } from "@/context/ConfigContext";
import React, { useEffect, useState, useRef } from "react";

export default function BackgroundEffects() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (config.mode === "christmas") {
    return <SnowEffect />;
  } else {
    return <FireworksEffect />;
  }
}

function SnowEffect() {
  const snowflakes = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 5 + 4}s`,
    animationDelay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.6 + 0.4,
    size: `${Math.random() * 8 + 4}px`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-900 to-emerald-900" />
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-red-600/20 to-transparent blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-emerald-600/20 to-transparent blur-3xl" />
      <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-2xl" />

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: flake.left,
            top: -20,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
            boxShadow: '0 0 6px rgba(255,255,255,0.9)',
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); }
          100% { transform: translateY(110vh) translateX(30px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function FireworksEffect() {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailsCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const trailsCanvas = trailsCanvasRef.current;
    if (!mainCanvas || !trailsCanvas) return;

    const mainCtx = mainCanvas.getContext('2d');
    const trailsCtx = trailsCanvas.getContext('2d');
    if (!mainCtx || !trailsCtx) return;

    let animationId: number;
    let stars: Star[] = [];
    let sparks: Spark[] = [];

    const GRAVITY = 0.06;
    const COLORS = ['#ff0043', '#14fc56', '#1e7fff', '#e60aff', '#ffbf36', '#ffffff'];

    interface Star {
      x: number; y: number;
      prevX: number; prevY: number;
      speedX: number; speedY: number;
      life: number; fullLife: number;
      color: string;
      secondColor?: string;
      transitionTime?: number;
    }

    interface Spark {
      x: number; y: number;
      prevX: number; prevY: number;
      speedX: number; speedY: number;
      life: number;
      color: string;
    }

    const resize = () => {
      mainCanvas.width = trailsCanvas.width = window.innerWidth;
      mainCanvas.height = trailsCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    const createBurst = (x: number, y: number, color: string) => {
      const count = 100 + Math.random() * 50;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
        const speed = 1 + Math.random() * 5;
        stars.push({
          x, y, prevX: x, prevY: y,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          life: 1500 + Math.random() * 500,
          fullLife: 1500 + Math.random() * 500,
          color: Math.random() > 0.2 ? color : randomColor(),
          secondColor: Math.random() > 0.5 ? randomColor() : undefined,
          transitionTime: 600 + Math.random() * 400
        });
      }
      // Add sparks
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3;
        sparks.push({
          x, y, prevX: x, prevY: y,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          life: 200 + Math.random() * 200,
          color: '#ffbf36'
        });
      }
    };

    const launchShell = () => {
      const x = Math.random() * mainCanvas.width * 0.6 + mainCanvas.width * 0.2;
      const targetY = mainCanvas.height * 0.15 + Math.random() * mainCanvas.height * 0.35;
      const color = randomColor();

      // Launch comet
      const launchSpeed = 12 + Math.random() * 4;
      let cometY = mainCanvas.height;
      let cometVy = -launchSpeed;

      const animateComet = () => {
        cometY += cometVy;
        cometVy += GRAVITY;

        // Draw comet trail
        trailsCtx.beginPath();
        trailsCtx.arc(x, cometY, 3, 0, Math.PI * 2);
        trailsCtx.fillStyle = '#fff';
        trailsCtx.fill();

        // Add spark
        if (Math.random() > 0.3) {
          sparks.push({
            x, y: cometY, prevX: x, prevY: cometY,
            speedX: (Math.random() - 0.5) * 2,
            speedY: Math.random() * 2,
            life: 100 + Math.random() * 100,
            color: '#ffbf36'
          });
        }

        if (cometY <= targetY || cometVy >= 0) {
          createBurst(x, cometY, color);
        } else {
          requestAnimationFrame(animateComet);
        }
      };
      animateComet();
    };

    // Initial launch
    setTimeout(() => launchShell(), 500);
    setTimeout(() => launchShell(), 1000);

    // Auto launch
    const launchInterval = setInterval(() => {
      launchShell();
      if (Math.random() > 0.6) launchShell();
    }, 1200 + Math.random() * 800);

    const animate = () => {
      const width = mainCanvas.width;
      const height = mainCanvas.height;

      // Fade trails - use clearRect for main, fillRect for trails
      mainCtx.clearRect(0, 0, width, height);
      trailsCtx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      trailsCtx.fillRect(0, 0, width, height);

      // Update and draw stars
      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.life -= 16;

        if (star.life <= 0) {
          stars.splice(i, 1);
          continue;
        }

        star.prevX = star.x;
        star.prevY = star.y;
        star.x += star.speedX;
        star.y += star.speedY;
        star.speedX *= 0.98;
        star.speedY *= 0.98;
        star.speedY += GRAVITY;

        // Color transition
        let color = star.color;
        if (star.secondColor && star.transitionTime && star.life < star.transitionTime) {
          color = star.secondColor;
        }

        const alpha = star.life / star.fullLife;

        // Draw on trails canvas
        trailsCtx.beginPath();
        trailsCtx.moveTo(star.x, star.y);
        trailsCtx.lineTo(star.prevX, star.prevY);
        trailsCtx.strokeStyle = color;
        trailsCtx.lineWidth = 2;
        trailsCtx.globalAlpha = alpha;
        trailsCtx.stroke();
        trailsCtx.globalAlpha = 1;

        // Draw on main canvas (brighter point)
        mainCtx.beginPath();
        mainCtx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        mainCtx.fillStyle = color;
        mainCtx.globalAlpha = alpha;
        mainCtx.fill();
        mainCtx.globalAlpha = 1;
      }

      // Update and draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.life -= 16;

        if (spark.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        spark.prevX = spark.x;
        spark.prevY = spark.y;
        spark.x += spark.speedX;
        spark.y += spark.speedY;
        spark.speedX *= 0.95;
        spark.speedY *= 0.95;
        spark.speedY += GRAVITY * 0.5;

        const alpha = spark.life / 400;
        trailsCtx.beginPath();
        trailsCtx.moveTo(spark.x, spark.y);
        trailsCtx.lineTo(spark.prevX, spark.prevY);
        trailsCtx.strokeStyle = spark.color;
        trailsCtx.lineWidth = 1;
        trailsCtx.globalAlpha = alpha;
        trailsCtx.stroke();
        trailsCtx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(launchInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
      <canvas ref={trailsCanvasRef} className="absolute inset-0" style={{ mixBlendMode: 'lighten' }} />
      <canvas ref={mainCanvasRef} className="absolute inset-0" style={{ mixBlendMode: 'lighten' }} />
    </div>
  );
}