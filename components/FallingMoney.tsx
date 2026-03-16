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
      for (let i = 0; i < 5; i++) {
        money.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height - canvas!.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 1.2 + 0.6,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.05,
          width: 80,
          height: 40,
          opacity: Math.random() * 0.5 + 0.4,
        });
      }
    }

    createMoney();

    function drawRealisticBill(bill: typeof money[0]) {
      ctx!.save();
      ctx!.globalAlpha = bill.opacity;
      ctx!.translate(bill.x, bill.y);
      ctx!.rotate(bill.rotation);

      // Background gradient (realistic green)
      const gradient = ctx!.createLinearGradient(-bill.width / 2, -bill.height / 2, -bill.width / 2, bill.height / 2);
      gradient.addColorStop(0, '#1b5e20');
      gradient.addColorStop(0.5, '#2e7d32');
      gradient.addColorStop(1, '#1b5e20');

      ctx!.fillStyle = gradient;
      ctx!.fillRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height);

      // Border
      ctx!.strokeStyle = '#0d3d1a';
      ctx!.lineWidth = 1.5;
      ctx!.strokeRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height);

      // Inner decorative border
      ctx!.strokeStyle = '#558b2f';
      ctx!.lineWidth = 0.5;
      ctx!.strokeRect(-bill.width / 2 + 3, -bill.height / 2 + 3, bill.width - 6, bill.height - 6);

      // Large "100" text on left
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `bold ${bill.width * 0.35}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText('100', -bill.width * 0.35, -bill.height * 0.1);

      // "UNITED STATES OF AMERICA" text
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `bold ${bill.width * 0.08}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.fillText('USA', 0, 0);

      // Serial-like numbers
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `${bill.width * 0.06}px monospace`;
      ctx!.textAlign = 'left';
      ctx!.fillText('A 123456789 B', -bill.width * 0.45, -bill.height * 0.35);
      ctx!.fillText('A 123456789 B', -bill.width * 0.45, bill.height * 0.35);

      // Corner "100" numbers
      ctx!.font = `bold ${bill.width * 0.12}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';

      ctx!.fillText('100', -bill.width * 0.38, -bill.height * 0.35);
      ctx!.fillText('100', bill.width * 0.38, bill.height * 0.35);

      // Decorative pattern (small squares)
      ctx!.fillStyle = '#ffffff';
      ctx!.globalAlpha = bill.opacity * 0.3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          ctx!.fillRect(-bill.width * 0.4 + i * 20, -bill.height * 0.3 + j * 15, 6, 6);
        }
      }

      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      money.forEach((bill, index) => {
        bill.x += bill.vx;
        bill.y += bill.vy;
        bill.rotation += bill.vr;

        if (bill.y > canvas!.height + 50) {
          money.splice(index, 1);
          if (money.length < 5) {
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
