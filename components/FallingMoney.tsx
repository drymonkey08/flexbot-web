'use client';

import { useEffect, useRef } from 'react';

export default function FallingMoney() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Bill {
      x: number;
      y: number;
      vy: number;
      rotation: number;
      rotSpeed: number;
      wobblePhase: number;
      wobbleAmp: number;
      wobbleFreq: number;
      scale: number;
      opacity: number;
      showFront: boolean;
    }

    const bills: Bill[] = [];
    const BILL_W = 180;
    const BILL_H = 76;
    const MAX_BILLS = 12;

    function spawn(): Bill {
      return {
        x: Math.random() * canvas!.width,
        y: -BILL_H * (1 + Math.random() * 2),
        vy: 0.4 + Math.random() * 0.6,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 40 + Math.random() * 60,
        wobbleFreq: 0.008 + Math.random() * 0.008,
        scale: 0.7 + Math.random() * 0.4,
        opacity: 0.75 + Math.random() * 0.2,
        showFront: Math.random() > 0.3,
      };
    }

    for (let i = 0; i < MAX_BILLS; i++) {
      const b = spawn();
      b.y = Math.random() * canvas.height;
      bills.push(b);
    }

    // ── draw the FRONT of a $100 bill ──
    function drawFront(w: number, h: number) {
      // background
      const g = ctx!.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#e8e4d4');
      g.addColorStop(0.35, '#f0ece0');
      g.addColorStop(0.65, '#e2ddd0');
      g.addColorStop(1, '#d8d4c4');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);

      // green left panel
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(0, 0, w * 0.08, h);

      // green right panel
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(w * 0.92, 0, w * 0.08, h);

      // top green banner
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(w * 0.08, 0, w * 0.84, h * 0.06);

      // bottom green banner
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(w * 0.08, h * 0.94, w * 0.84, h * 0.06);

      // inner border
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);

      // "FEDERAL RESERVE NOTE" top
      ctx!.fillStyle = '#1a1a1a';
      ctx!.font = `bold ${w * 0.035}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('FEDERAL RESERVE NOTE', w * 0.5, h * 0.14);

      // "THE UNITED STATES OF AMERICA" banner
      ctx!.fillStyle = '#1a1a1a';
      ctx!.font = `bold ${w * 0.04}px serif`;
      ctx!.fillText('THE UNITED STATES OF AMERICA', w * 0.5, h * 0.24);

      // Large "100" top-left
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.14}px serif`;
      ctx!.textAlign = 'left';
      ctx!.fillText('100', w * 0.06, h * 0.45);

      // Benjamin Franklin portrait area (shaded oval)
      ctx!.save();
      ctx!.beginPath();
      ctx!.ellipse(w * 0.38, h * 0.55, w * 0.12, h * 0.32, 0, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(26, 107, 60, 0.12)';
      ctx!.fill();
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
      ctx!.restore();

      // Portrait detail lines (simplified face)
      ctx!.strokeStyle = 'rgba(26, 107, 60, 0.3)';
      ctx!.lineWidth = 0.8;
      // forehead
      ctx!.beginPath();
      ctx!.arc(w * 0.38, h * 0.38, w * 0.06, Math.PI * 0.8, Math.PI * 0.2);
      ctx!.stroke();
      // eyes
      ctx!.beginPath();
      ctx!.arc(w * 0.35, h * 0.5, w * 0.015, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(w * 0.41, h * 0.5, w * 0.015, 0, Math.PI * 2);
      ctx!.stroke();
      // nose
      ctx!.beginPath();
      ctx!.moveTo(w * 0.38, h * 0.52);
      ctx!.lineTo(w * 0.38, h * 0.6);
      ctx!.stroke();
      // mouth
      ctx!.beginPath();
      ctx!.arc(w * 0.38, h * 0.65, w * 0.025, 0.1, Math.PI - 0.1);
      ctx!.stroke();

      // Blue security strip
      ctx!.fillStyle = 'rgba(60, 100, 180, 0.5)';
      ctx!.fillRect(w * 0.56, h * 0.08, w * 0.02, h * 0.84);

      // Gold "100" watermark area (right)
      ctx!.fillStyle = 'rgba(180, 150, 60, 0.25)';
      ctx!.font = `bold ${w * 0.1}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('100', w * 0.73, h * 0.65);

      // Gold inkwell
      ctx!.beginPath();
      ctx!.arc(w * 0.63, h * 0.65, w * 0.04, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(180, 150, 60, 0.4)';
      ctx!.fill();
      ctx!.strokeStyle = 'rgba(180, 150, 60, 0.6)';
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // Serial numbers
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.03}px monospace`;
      ctx!.textAlign = 'left';
      ctx!.fillText('LL 87901308 C', w * 0.12, h * 0.35);
      ctx!.fillText('LL 87901308 C', w * 0.58, h * 0.88);

      // "L12" district
      ctx!.fillStyle = '#1a1a1a';
      ctx!.font = `bold ${w * 0.03}px serif`;
      ctx!.fillText('L12', w * 0.12, h * 0.88);

      // Bottom "100"
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.1}px serif`;
      ctx!.textAlign = 'right';
      ctx!.fillText('100', w * 0.94, h * 0.88);

      // Fine outer border
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(0, 0, w, h);
    }

    // ── draw the BACK of a $100 bill ──
    function drawBack(w: number, h: number) {
      // background
      const g = ctx!.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#d0e8c0');
      g.addColorStop(0.5, '#c8e0b8');
      g.addColorStop(1, '#d0e8c0');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);

      // green borders
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(0, 0, w * 0.06, h);
      ctx!.fillRect(w * 0.94, 0, w * 0.06, h);
      ctx!.fillRect(w * 0.06, 0, w * 0.88, h * 0.06);
      ctx!.fillRect(w * 0.06, h * 0.94, w * 0.88, h * 0.06);

      // "THE UNITED STATES OF AMERICA"
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.04}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('THE UNITED STATES OF AMERICA', w * 0.5, h * 0.18);

      // "IN GOD WE TRUST"
      ctx!.font = `bold ${w * 0.05}px serif`;
      ctx!.fillText('IN GOD WE TRUST', w * 0.5, h * 0.35);

      // Independence Hall (simplified building)
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1;
      // main body
      ctx!.strokeRect(w * 0.25, h * 0.4, w * 0.5, h * 0.3);
      // roof
      ctx!.beginPath();
      ctx!.moveTo(w * 0.22, h * 0.4);
      ctx!.lineTo(w * 0.5, h * 0.28);
      ctx!.lineTo(w * 0.78, h * 0.4);
      ctx!.closePath();
      ctx!.stroke();
      // tower/steeple
      ctx!.strokeRect(w * 0.46, h * 0.15, w * 0.08, h * 0.13);
      ctx!.beginPath();
      ctx!.moveTo(w * 0.46, h * 0.15);
      ctx!.lineTo(w * 0.5, h * 0.08);
      ctx!.lineTo(w * 0.54, h * 0.15);
      ctx!.closePath();
      ctx!.stroke();
      // windows
      for (let i = 0; i < 5; i++) {
        ctx!.strokeRect(w * 0.28 + i * w * 0.09, h * 0.48, w * 0.04, h * 0.08);
      }
      // door
      ctx!.strokeRect(w * 0.46, h * 0.55, w * 0.08, h * 0.15);

      // "ONE HUNDRED DOLLARS"
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.035}px serif`;
      ctx!.fillText('ONE HUNDRED DOLLARS', w * 0.5, h * 0.82);

      // Large gold "100" right side
      ctx!.fillStyle = 'rgba(180, 150, 60, 0.6)';
      ctx!.font = `bold ${w * 0.16}px serif`;
      ctx!.textAlign = 'right';
      ctx!.fillText('100', w * 0.93, h * 0.78);

      // "100" left side
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.1}px serif`;
      ctx!.textAlign = 'left';
      ctx!.fillText('100', w * 0.06, h * 0.85);

      // outer border
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(0, 0, w, h);
    }

    let t = 0;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      t++;

      for (let i = bills.length - 1; i >= 0; i--) {
        const b = bills[i];

        // physics
        b.vy = Math.min(b.vy + 0.005, 2.2);
        b.y += b.vy;

        // wobble (realistic air flutter)
        b.wobblePhase += b.wobbleFreq;
        const wobbleX = Math.sin(b.wobblePhase) * b.wobbleAmp * 0.15;
        b.x += wobbleX * 0.1;

        // rotation flutter
        b.rotSpeed += (Math.random() - 0.5) * 0.003;
        b.rotSpeed *= 0.99;
        b.rotation += b.rotSpeed;

        // keep in bounds
        if (b.x < -100) b.x = canvas!.width + 100;
        if (b.x > canvas!.width + 100) b.x = -100;

        // respawn at top
        if (b.y > canvas!.height + 100) {
          bills[i] = spawn();
          continue;
        }

        // draw
        const w = BILL_W * b.scale;
        const h = BILL_H * b.scale;

        ctx!.save();
        ctx!.globalAlpha = b.opacity;
        ctx!.translate(b.x, b.y);
        ctx!.rotate(b.rotation);
        ctx!.translate(-w / 2, -h / 2);

        if (b.showFront) {
          drawFront(w, h);
        } else {
          drawBack(w, h);
        }

        ctx!.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
