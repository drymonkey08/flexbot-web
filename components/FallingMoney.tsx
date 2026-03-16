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

    const money: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      vr: number;
      width: number;
      height: number;
      opacity: number;
    }> = [];

    function createMoney() {
      for (let i = 0; i < 4; i++) {
        money.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height - canvas!.height * 1.2,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 0.8 + 0.5,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.04,
          width: 120,
          height: 60,
          opacity: Math.random() * 0.6 + 0.35,
        });
      }
    }

    createMoney();

    function drawRealisticBill(bill: typeof money[0]) {
      ctx!.save();
      ctx!.globalAlpha = bill.opacity;
      ctx!.translate(bill.x, bill.y);
      ctx!.rotate(bill.rotation);

      // Main bill background - realistic green gradient
      const gradient = ctx!.createLinearGradient(-bill.width / 2, -bill.height / 2, -bill.width / 2, bill.height / 2);
      gradient.addColorStop(0, '#1a5f2c');
      gradient.addColorStop(0.5, '#2d8659');
      gradient.addColorStop(1, '#1a5f2c');

      ctx!.fillStyle = gradient;
      ctx!.fillRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height);

      // Dark border
      ctx!.strokeStyle = '#0d3d1a';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height);

      // Inner decorative border (gold/tan)
      ctx!.strokeStyle = '#b8860b';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(-bill.width / 2 + 5, -bill.height / 2 + 5, bill.width - 10, bill.height - 10);

      // Left side - Large "100"
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `bold ${bill.width * 0.35}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText('100', -bill.width * 0.38, 0);

      // Right side - Large "100"
      ctx!.fillText('100', bill.width * 0.38, 0);

      // Center - "UNITED STATES OF AMERICA"
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `bold ${bill.width * 0.09}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.fillText('UNITED STATES', 0, -bill.height * 0.15);
      ctx!.font = `bold ${bill.width * 0.08}px Arial`;
      ctx!.fillText('OF AMERICA', 0, bill.height * 0.08);

      // "ONE HUNDRED DOLLARS"
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `${bill.width * 0.07}px Arial`;
      ctx!.fillText('ONE HUNDRED DOLLARS', 0, bill.height * 0.25);

      // Top left - small serial numbers
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `${bill.width * 0.055}px monospace`;
      ctx!.textAlign = 'left';
      ctx!.fillText('A 12345678 B', -bill.width * 0.45, -bill.height * 0.38);
      ctx!.fillText('Series 2023', -bill.width * 0.45, bill.height * 0.38);

      // Top right - small serial numbers
      ctx!.textAlign = 'right';
      ctx!.fillText('A 12345678 B', bill.width * 0.45, -bill.height * 0.38);
      ctx!.fillText('Federal Reserve', bill.width * 0.45, bill.height * 0.38);

      // Corner circles (representing Federal Reserve seal style)
      ctx!.strokeStyle = '#ffffff';
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.arc(-bill.width * 0.4, -bill.height * 0.35, 5, 0, Math.PI * 2);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(bill.width * 0.4, bill.height * 0.35, 5, 0, Math.PI * 2);
      ctx!.stroke();

      // Security features - vertical line pattern
      ctx!.strokeStyle = '#ffffff';
      ctx!.globalAlpha = bill.opacity * 0.4;
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const x = -bill.width * 0.4 + i * 12;
        ctx!.beginPath();
        ctx!.moveTo(x, -bill.height * 0.25);
        ctx!.lineTo(x, bill.height * 0.25);
        ctx!.stroke();
      }

      // Benjamin Franklin representation (portrait area - light shading)
      ctx!.globalAlpha = bill.opacity * 0.15;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(-bill.width * 0.35, -bill.height * 0.2, bill.width * 0.15, bill.height * 0.4);

      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      money.forEach((bill, index) => {
        bill.x += bill.vx;
        bill.y += bill.vy;
        bill.rotation += bill.vr;

        if (bill.y > canvas!.height + 100) {
          money.splice(index, 1);
          if (money.length < 4) {
            createMoney();
          }
          return;
        }

        drawRealisticBill(bill);
      });

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
      style={{ opacity: 1 }}
    />
  );
}
