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
    const BILL_W = 200;
    const BILL_H = 84;
    const MAX_BILLS = 15;

    function spawn(): Bill {
      return {
        x: Math.random() * canvas!.width,
        y: -BILL_H * (1 + Math.random() * 3),
        vy: 1.2 + Math.random() * 1.5,
        rotation: (Math.random() - 0.5) * 0.8,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 30 + Math.random() * 50,
        wobbleFreq: 0.015 + Math.random() * 0.015,
        scale: 0.6 + Math.random() * 0.5,
        opacity: 0.85 + Math.random() * 0.15,
        showFront: Math.random() > 0.3,
      };
    }

    // Stagger initial bills across screen
    for (let i = 0; i < MAX_BILLS; i++) {
      const b = spawn();
      b.y = Math.random() * canvas.height * 1.5 - canvas.height * 0.3;
      bills.push(b);
    }

    // ── FRONT of $100 ──
    function drawFront(w: number, h: number) {
      // Cream/tan paper background (like real bill)
      const bg = ctx!.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#ede8d5');
      bg.addColorStop(0.3, '#f2edd8');
      bg.addColorStop(0.7, '#eae5d0');
      bg.addColorStop(1, '#e5e0cc');
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // Green left border strip
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(0, 0, w * 0.06, h);

      // Green right border strip
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(w * 0.94, 0, w * 0.06, h);

      // Top thin green bar
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(w * 0.06, 0, w * 0.88, h * 0.045);

      // Bottom thin green bar
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(w * 0.06, h * 0.955, w * 0.88, h * 0.045);

      // Inner ornamental border
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 0.8;
      ctx!.strokeRect(w * 0.035, h * 0.035, w * 0.93, h * 0.93);

      // "FEDERAL RESERVE NOTE"
      ctx!.fillStyle = '#222';
      ctx!.font = `600 ${w * 0.032}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('FEDERAL RESERVE NOTE', w * 0.5, h * 0.13);

      // "THE UNITED STATES OF AMERICA"
      ctx!.fillStyle = '#222';
      ctx!.font = `bold ${w * 0.038}px serif`;
      ctx!.fillText('THE UNITED STATES OF AMERICA', w * 0.5, h * 0.23);

      // Large "100" top-left in green
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.13}px serif`;
      ctx!.textAlign = 'left';
      ctx!.fillText('100', w * 0.065, h * 0.48);

      // Franklin portrait oval
      ctx!.save();
      ctx!.beginPath();
      ctx!.ellipse(w * 0.4, h * 0.55, w * 0.115, h * 0.33, 0, 0, Math.PI * 2);
      const portraitGrad = ctx!.createRadialGradient(w * 0.4, h * 0.5, 0, w * 0.4, h * 0.55, w * 0.12);
      portraitGrad.addColorStop(0, 'rgba(26,107,60,0.18)');
      portraitGrad.addColorStop(1, 'rgba(26,107,60,0.06)');
      ctx!.fillStyle = portraitGrad;
      ctx!.fill();
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1.2;
      ctx!.stroke();
      ctx!.restore();

      // Simplified Franklin face
      ctx!.strokeStyle = 'rgba(26,107,60,0.45)';
      ctx!.lineWidth = 0.7;
      // head outline
      ctx!.beginPath();
      ctx!.arc(w * 0.4, h * 0.48, w * 0.065, Math.PI * 0.85, Math.PI * 0.15);
      ctx!.stroke();
      // left eye
      ctx!.beginPath();
      ctx!.ellipse(w * 0.375, h * 0.5, w * 0.012, w * 0.008, 0, 0, Math.PI * 2);
      ctx!.stroke();
      // right eye
      ctx!.beginPath();
      ctx!.ellipse(w * 0.42, h * 0.5, w * 0.012, w * 0.008, 0, 0, Math.PI * 2);
      ctx!.stroke();
      // nose
      ctx!.beginPath();
      ctx!.moveTo(w * 0.398, h * 0.53);
      ctx!.quadraticCurveTo(w * 0.39, h * 0.6, w * 0.4, h * 0.61);
      ctx!.stroke();
      // mouth
      ctx!.beginPath();
      ctx!.arc(w * 0.4, h * 0.66, w * 0.022, 0.15, Math.PI - 0.15);
      ctx!.stroke();

      // Blue 3D security ribbon (vertical)
      const ribbonGrad = ctx!.createLinearGradient(w * 0.56, 0, w * 0.59, 0);
      ribbonGrad.addColorStop(0, 'rgba(40,80,180,0.65)');
      ribbonGrad.addColorStop(0.5, 'rgba(80,130,220,0.75)');
      ribbonGrad.addColorStop(1, 'rgba(40,80,180,0.65)');
      ctx!.fillStyle = ribbonGrad;
      ctx!.fillRect(w * 0.56, h * 0.06, w * 0.025, h * 0.88);

      // Gold inkwell with liberty bell
      ctx!.beginPath();
      ctx!.arc(w * 0.64, h * 0.65, w * 0.035, 0, Math.PI * 2);
      const inkGrad = ctx!.createRadialGradient(w * 0.64, h * 0.63, 0, w * 0.64, h * 0.65, w * 0.035);
      inkGrad.addColorStop(0, 'rgba(210,170,60,0.7)');
      inkGrad.addColorStop(1, 'rgba(180,140,40,0.4)');
      ctx!.fillStyle = inkGrad;
      ctx!.fill();
      ctx!.strokeStyle = 'rgba(180,140,40,0.6)';
      ctx!.lineWidth = 0.8;
      ctx!.stroke();

      // Gold watermark "100" right area
      ctx!.fillStyle = 'rgba(200,165,50,0.2)';
      ctx!.font = `bold ${w * 0.09}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('100', w * 0.75, h * 0.65);

      // Green serial numbers
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.028}px monospace`;
      ctx!.textAlign = 'left';
      ctx!.fillText('LL 87901308 C', w * 0.1, h * 0.34);
      ctx!.fillText('LL 87901308 C', w * 0.58, h * 0.9);

      // "L12" district
      ctx!.fillStyle = '#222';
      ctx!.font = `bold ${w * 0.028}px serif`;
      ctx!.fillText('L12', w * 0.1, h * 0.9);

      // Bottom-right "100"
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.09}px serif`;
      ctx!.textAlign = 'right';
      ctx!.fillText('100', w * 0.935, h * 0.9);

      // Outer border
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1.8;
      ctx!.strokeRect(0, 0, w, h);
    }

    // ── BACK of $100 ──
    function drawBack(w: number, h: number) {
      // Light green paper
      const bg = ctx!.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#c8deb0');
      bg.addColorStop(0.5, '#d0e6b8');
      bg.addColorStop(1, '#c8deb0');
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // Green borders
      ctx!.fillStyle = '#1a6b3c';
      ctx!.fillRect(0, 0, w * 0.05, h);
      ctx!.fillRect(w * 0.95, 0, w * 0.05, h);
      ctx!.fillRect(w * 0.05, 0, w * 0.9, h * 0.045);
      ctx!.fillRect(w * 0.05, h * 0.955, w * 0.9, h * 0.045);

      // "THE UNITED STATES OF AMERICA"
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.038}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('THE UNITED STATES OF AMERICA', w * 0.5, h * 0.16);

      // "IN GOD WE TRUST"
      ctx!.font = `bold ${w * 0.045}px serif`;
      ctx!.fillText('IN GOD WE TRUST', w * 0.5, h * 0.32);

      // Independence Hall
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1;
      // main building body
      ctx!.fillStyle = 'rgba(26,107,60,0.08)';
      ctx!.fillRect(w * 0.22, h * 0.4, w * 0.56, h * 0.32);
      ctx!.strokeRect(w * 0.22, h * 0.4, w * 0.56, h * 0.32);
      // roof line
      ctx!.beginPath();
      ctx!.moveTo(w * 0.2, h * 0.4);
      ctx!.lineTo(w * 0.5, h * 0.28);
      ctx!.lineTo(w * 0.8, h * 0.4);
      ctx!.closePath();
      ctx!.stroke();
      // center tower
      ctx!.strokeRect(w * 0.45, h * 0.15, w * 0.1, h * 0.13);
      ctx!.beginPath();
      ctx!.moveTo(w * 0.45, h * 0.15);
      ctx!.lineTo(w * 0.5, h * 0.06);
      ctx!.lineTo(w * 0.55, h * 0.15);
      ctx!.closePath();
      ctx!.stroke();
      // windows row
      for (let i = 0; i < 6; i++) {
        ctx!.strokeRect(w * 0.25 + i * w * 0.085, h * 0.47, w * 0.04, h * 0.09);
      }
      // door
      ctx!.strokeRect(w * 0.465, h * 0.56, w * 0.07, h * 0.16);
      // columns
      ctx!.strokeRect(w * 0.44, h * 0.4, w * 0.01, h * 0.32);
      ctx!.strokeRect(w * 0.55, h * 0.4, w * 0.01, h * 0.32);

      // "ONE HUNDRED DOLLARS"
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.032}px serif`;
      ctx!.textAlign = 'center';
      ctx!.fillText('ONE HUNDRED DOLLARS', w * 0.5, h * 0.84);

      // Large gold "100" right
      ctx!.fillStyle = 'rgba(195,160,50,0.7)';
      ctx!.font = `bold ${w * 0.15}px serif`;
      ctx!.textAlign = 'right';
      ctx!.fillText('100', w * 0.94, h * 0.82);

      // Green "100" left
      ctx!.fillStyle = '#1a6b3c';
      ctx!.font = `bold ${w * 0.09}px serif`;
      ctx!.textAlign = 'left';
      ctx!.fillText('100', w * 0.055, h * 0.88);

      // Outer border
      ctx!.strokeStyle = '#1a6b3c';
      ctx!.lineWidth = 1.8;
      ctx!.strokeRect(0, 0, w, h);
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = bills.length - 1; i >= 0; i--) {
        const b = bills[i];

        // Gravity + terminal velocity
        b.vy = Math.min(b.vy + 0.02, 3);
        b.y += b.vy;

        // Side-to-side flutter
        b.wobblePhase += b.wobbleFreq;
        b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.02;

        // Rotation with random flutter
        b.rotSpeed += (Math.random() - 0.5) * 0.004;
        b.rotSpeed *= 0.98;
        b.rotation += b.rotSpeed;

        // Wrap horizontally
        if (b.x < -120) b.x = canvas!.width + 120;
        if (b.x > canvas!.width + 120) b.x = -120;

        // Respawn when off bottom
        if (b.y > canvas!.height + 120) {
          bills[i] = spawn();
          continue;
        }

        // Draw
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
