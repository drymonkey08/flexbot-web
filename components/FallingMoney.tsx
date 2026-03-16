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
        vy: 1.0 + Math.random() * 1.5,
        rotation: (Math.random() - 0.5) * 0.8,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 30 + Math.random() * 50,
        wobbleFreq: 0.012 + Math.random() * 0.012,
        scale: 0.55 + Math.random() * 0.5,
        opacity: 0.88 + Math.random() * 0.12,
        showFront: Math.random() > 0.35,
      };
    }

    for (let i = 0; i < MAX_BILLS; i++) {
      const b = spawn();
      b.y = Math.random() * canvas.height * 1.5 - canvas.height * 0.3;
      bills.push(b);
    }

    // Pre-render front and back onto offscreen canvases for performance
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = BILL_W * 2;
    frontCanvas.height = BILL_H * 2;
    const fctx = frontCanvas.getContext('2d')!;
    drawFrontBill(fctx, BILL_W * 2, BILL_H * 2);

    const backCanvas = document.createElement('canvas');
    backCanvas.width = BILL_W * 2;
    backCanvas.height = BILL_H * 2;
    const bctx = backCanvas.getContext('2d')!;
    drawBackBill(bctx, BILL_W * 2, BILL_H * 2);

    function drawFrontBill(c: CanvasRenderingContext2D, w: number, h: number) {
      // ── Cream/tan paper ──
      const bg = c.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#ece7d3');
      bg.addColorStop(0.5, '#f3eeda');
      bg.addColorStop(1, '#e8e3cf');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // Thin green border frame
      c.strokeStyle = '#1a6b3c';
      c.lineWidth = 3;
      c.strokeRect(2, 2, w - 4, h - 4);

      // Inner ornamental border
      c.strokeStyle = '#1a6b3c';
      c.lineWidth = 1;
      c.strokeRect(w * 0.04, h * 0.06, w * 0.92, h * 0.88);

      // "FEDERAL RESERVE NOTE"
      c.fillStyle = '#1a1a1a';
      c.font = `600 ${w * 0.032}px serif`;
      c.textAlign = 'center';
      c.fillText('FEDERAL RESERVE NOTE', w * 0.5, h * 0.14);

      // "THE UNITED STATES OF AMERICA"
      c.fillStyle = '#1a1a1a';
      c.font = `bold ${w * 0.038}px serif`;
      c.fillText('THE UNITED STATES OF AMERICA', w * 0.5, h * 0.24);

      // Large "100" top-left
      c.fillStyle = '#1a6b3c';
      c.font = `bold ${w * 0.14}px serif`;
      c.textAlign = 'left';
      c.fillText('100', w * 0.05, h * 0.52);

      // ── Benjamin Franklin Portrait ──
      // Oval frame
      c.save();
      c.beginPath();
      c.ellipse(w * 0.4, h * 0.55, w * 0.11, h * 0.34, 0, 0, Math.PI * 2);
      const ovalGrad = c.createRadialGradient(w * 0.4, h * 0.5, w * 0.02, w * 0.4, h * 0.55, w * 0.12);
      ovalGrad.addColorStop(0, 'rgba(26,107,60,0.15)');
      ovalGrad.addColorStop(1, 'rgba(26,107,60,0.04)');
      c.fillStyle = ovalGrad;
      c.fill();
      c.strokeStyle = '#1a6b3c';
      c.lineWidth = 2;
      c.stroke();
      c.restore();

      // Portrait - head shape
      const px = w * 0.4;
      const py = h * 0.52;
      c.strokeStyle = 'rgba(26,107,60,0.6)';
      c.fillStyle = 'rgba(26,107,60,0.12)';
      c.lineWidth = 1.2;

      // Head oval
      c.beginPath();
      c.ellipse(px, py - h * 0.02, w * 0.055, h * 0.2, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Hair (receding hairline / balding top with long sides)
      c.lineWidth = 1;
      c.strokeStyle = 'rgba(26,107,60,0.55)';
      // Left side hair flowing down
      c.beginPath();
      c.moveTo(px - w * 0.05, py - h * 0.12);
      c.quadraticCurveTo(px - w * 0.07, py, px - w * 0.06, py + h * 0.12);
      c.quadraticCurveTo(px - w * 0.05, py + h * 0.18, px - w * 0.04, py + h * 0.2);
      c.stroke();
      // Right side hair
      c.beginPath();
      c.moveTo(px + w * 0.04, py - h * 0.12);
      c.quadraticCurveTo(px + w * 0.06, py, px + w * 0.055, py + h * 0.12);
      c.quadraticCurveTo(px + w * 0.05, py + h * 0.18, px + w * 0.04, py + h * 0.2);
      c.stroke();
      // Balding top
      c.beginPath();
      c.arc(px, py - h * 0.16, w * 0.035, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();

      // Eyebrows
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(px - w * 0.035, py - h * 0.06);
      c.quadraticCurveTo(px - w * 0.02, py - h * 0.08, px - w * 0.008, py - h * 0.06);
      c.stroke();
      c.beginPath();
      c.moveTo(px + w * 0.008, py - h * 0.06);
      c.quadraticCurveTo(px + w * 0.02, py - h * 0.08, px + w * 0.035, py - h * 0.06);
      c.stroke();

      // Eyes
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(px - w * 0.02, py - h * 0.03, w * 0.012, h * 0.025, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(px + w * 0.02, py - h * 0.03, w * 0.012, h * 0.025, 0, 0, Math.PI * 2);
      c.stroke();
      // Pupils
      c.fillStyle = 'rgba(26,107,60,0.5)';
      c.beginPath();
      c.arc(px - w * 0.02, py - h * 0.03, w * 0.005, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(px + w * 0.02, py - h * 0.03, w * 0.005, 0, Math.PI * 2);
      c.fill();

      // Nose
      c.strokeStyle = 'rgba(26,107,60,0.5)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(px, py - h * 0.01);
      c.quadraticCurveTo(px - w * 0.008, py + h * 0.06, px + w * 0.005, py + h * 0.07);
      c.stroke();
      // Nostril
      c.beginPath();
      c.arc(px - w * 0.005, py + h * 0.065, w * 0.004, 0, Math.PI);
      c.stroke();

      // Mouth
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(px - w * 0.02, py + h * 0.1);
      c.quadraticCurveTo(px, py + h * 0.12, px + w * 0.02, py + h * 0.1);
      c.stroke();
      // Lower lip
      c.beginPath();
      c.moveTo(px - w * 0.015, py + h * 0.11);
      c.quadraticCurveTo(px, py + h * 0.14, px + w * 0.015, py + h * 0.11);
      c.stroke();

      // Chin
      c.beginPath();
      c.arc(px, py + h * 0.17, w * 0.02, 0, Math.PI);
      c.stroke();

      // Collar/jacket lines
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(px - w * 0.04, py + h * 0.2);
      c.lineTo(px - w * 0.06, py + h * 0.28);
      c.stroke();
      c.beginPath();
      c.moveTo(px + w * 0.04, py + h * 0.2);
      c.lineTo(px + w * 0.06, py + h * 0.28);
      c.stroke();

      // ── Blue security ribbon ──
      const ribbonGrad = c.createLinearGradient(w * 0.555, 0, w * 0.585, 0);
      ribbonGrad.addColorStop(0, 'rgba(30,70,170,0.7)');
      ribbonGrad.addColorStop(0.5, 'rgba(70,120,220,0.8)');
      ribbonGrad.addColorStop(1, 'rgba(30,70,170,0.7)');
      c.fillStyle = ribbonGrad;
      c.fillRect(w * 0.555, h * 0.07, w * 0.025, h * 0.86);
      // "100" micro-text on ribbon
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.font = `bold ${w * 0.018}px sans-serif`;
      c.textAlign = 'center';
      for (let ry = 0.15; ry < 0.9; ry += 0.15) {
        c.fillText('100', w * 0.567, h * ry);
      }

      // ── Gold inkwell ──
      c.beginPath();
      c.arc(w * 0.64, h * 0.65, w * 0.035, 0, Math.PI * 2);
      const inkGrad = c.createRadialGradient(w * 0.635, h * 0.63, 0, w * 0.64, h * 0.65, w * 0.035);
      inkGrad.addColorStop(0, 'rgba(220,180,60,0.8)');
      inkGrad.addColorStop(1, 'rgba(180,140,40,0.4)');
      c.fillStyle = inkGrad;
      c.fill();
      c.strokeStyle = 'rgba(180,140,40,0.7)';
      c.lineWidth = 1;
      c.stroke();

      // Gold watermark "100"
      c.fillStyle = 'rgba(200,165,50,0.18)';
      c.font = `bold ${w * 0.1}px serif`;
      c.textAlign = 'center';
      c.fillText('100', w * 0.75, h * 0.68);

      // Serial numbers
      c.fillStyle = '#1a6b3c';
      c.font = `bold ${w * 0.026}px monospace`;
      c.textAlign = 'left';
      c.fillText('LL 87901308 C', w * 0.1, h * 0.35);
      c.fillText('LL 87901308 C', w * 0.58, h * 0.92);

      // "L12"
      c.fillStyle = '#1a1a1a';
      c.font = `bold ${w * 0.025}px serif`;
      c.fillText('L12', w * 0.1, h * 0.92);

      // Bottom-right "100"
      c.fillStyle = '#1a6b3c';
      c.font = `bold ${w * 0.1}px serif`;
      c.textAlign = 'right';
      c.fillText('100', w * 0.95, h * 0.92);
    }

    function drawBackBill(c: CanvasRenderingContext2D, w: number, h: number) {
      // Light green paper
      const bg = c.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#c5dca8');
      bg.addColorStop(0.5, '#d0e6b4');
      bg.addColorStop(1, '#c5dca8');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      // Green border frame
      c.strokeStyle = '#1a6b3c';
      c.lineWidth = 3;
      c.strokeRect(2, 2, w - 4, h - 4);

      // Inner border
      c.lineWidth = 1;
      c.strokeRect(w * 0.04, h * 0.06, w * 0.92, h * 0.88);

      // "THE UNITED STATES OF AMERICA"
      c.fillStyle = '#1a6b3c';
      c.font = `bold ${w * 0.038}px serif`;
      c.textAlign = 'center';
      c.fillText('THE UNITED STATES OF AMERICA', w * 0.5, h * 0.16);

      // "IN GOD WE TRUST"
      c.font = `bold ${w * 0.048}px serif`;
      c.fillText('IN GOD WE TRUST', w * 0.5, h * 0.3);

      // Independence Hall
      c.strokeStyle = '#1a6b3c';
      c.fillStyle = 'rgba(26,107,60,0.06)';
      c.lineWidth = 1.2;

      // Main building
      c.fillRect(w * 0.2, h * 0.38, w * 0.6, h * 0.34);
      c.strokeRect(w * 0.2, h * 0.38, w * 0.6, h * 0.34);

      // Roof
      c.beginPath();
      c.moveTo(w * 0.18, h * 0.38);
      c.lineTo(w * 0.5, h * 0.26);
      c.lineTo(w * 0.82, h * 0.38);
      c.closePath();
      c.stroke();

      // Tower
      c.strokeRect(w * 0.44, h * 0.12, w * 0.12, h * 0.14);
      // Steeple
      c.beginPath();
      c.moveTo(w * 0.44, h * 0.12);
      c.lineTo(w * 0.5, h * 0.04);
      c.lineTo(w * 0.56, h * 0.12);
      c.closePath();
      c.stroke();

      // Windows (two rows)
      c.lineWidth = 0.8;
      for (let i = 0; i < 7; i++) {
        c.strokeRect(w * 0.23 + i * w * 0.075, h * 0.42, w * 0.035, h * 0.08);
        c.strokeRect(w * 0.23 + i * w * 0.075, h * 0.54, w * 0.035, h * 0.08);
      }

      // Front door
      c.lineWidth = 1.2;
      c.beginPath();
      c.rect(w * 0.465, h * 0.54, w * 0.07, h * 0.18);
      c.stroke();
      // Door arch
      c.beginPath();
      c.arc(w * 0.5, h * 0.54, w * 0.035, Math.PI, 0);
      c.stroke();

      // Columns
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(w * 0.43, h * 0.38); c.lineTo(w * 0.43, h * 0.72); c.stroke();
      c.beginPath(); c.moveTo(w * 0.57, h * 0.38); c.lineTo(w * 0.57, h * 0.72); c.stroke();

      // "ONE HUNDRED DOLLARS"
      c.fillStyle = '#1a6b3c';
      c.font = `bold ${w * 0.032}px serif`;
      c.textAlign = 'center';
      c.fillText('ONE HUNDRED DOLLARS', w * 0.5, h * 0.84);

      // Large gold "100" right
      c.fillStyle = 'rgba(195,160,50,0.75)';
      c.font = `bold ${w * 0.16}px serif`;
      c.textAlign = 'right';
      c.fillText('100', w * 0.95, h * 0.84);

      // "100" left
      c.fillStyle = '#1a6b3c';
      c.font = `bold ${w * 0.1}px serif`;
      c.textAlign = 'left';
      c.fillText('100', w * 0.05, h * 0.9);
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = bills.length - 1; i >= 0; i--) {
        const b = bills[i];

        // Gravity
        b.vy = Math.min(b.vy + 0.015, 2.8);
        b.y += b.vy;

        // Flutter
        b.wobblePhase += b.wobbleFreq;
        b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.02;

        // Rotation
        b.rotSpeed += (Math.random() - 0.5) * 0.003;
        b.rotSpeed *= 0.985;
        b.rotation += b.rotSpeed;

        // Wrap
        if (b.x < -150) b.x = canvas!.width + 150;
        if (b.x > canvas!.width + 150) b.x = -150;

        // Respawn
        if (b.y > canvas!.height + 120) {
          bills[i] = spawn();
          continue;
        }

        const w = BILL_W * b.scale;
        const h = BILL_H * b.scale;

        ctx!.save();
        ctx!.globalAlpha = b.opacity;
        ctx!.translate(b.x, b.y);
        ctx!.rotate(b.rotation);
        ctx!.drawImage(
          b.showFront ? frontCanvas : backCanvas,
          -w / 2, -h / 2, w, h
        );
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
