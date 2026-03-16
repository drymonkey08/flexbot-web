'use client';

import { useEffect, useRef } from 'react';

export default function FallingMoney() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Money bills array
    const money: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      vr: number;
      size: number;
      opacity: number;
    }> = [];

    // Create initial money bills
    function createMoney() {
      for (let i = 0; i < 8; i++) {
        money.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height - canvas!.height,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 1.5 + 0.8,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.08,
          size: Math.random() * 12 + 18,
          opacity: Math.random() * 0.4 + 0.35,
        });
      }
    }

    createMoney();

    // Animation loop
    function animate() {
      // Clear canvas with trail effect matching gray background
      ctx!.fillStyle = 'rgba(245, 245, 245, 0.02)';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      // Draw and update money
      money.forEach((bill, index) => {
        // Update position
        bill.x += bill.vx;
        bill.y += bill.vy;
        bill.rotation += bill.vr;

        // Fade out at bottom
        if (bill.y > canvas!.height) {
          money.splice(index, 1);
          if (money.length < 8) {
            createMoney();
          }
          return;
        }

        // Draw money bill
        ctx!.save();
        ctx!.globalAlpha = bill.opacity;
        ctx!.translate(bill.x, bill.y);
        ctx!.rotate(bill.rotation);

        // Draw bill background (green)
        ctx!.fillStyle = '#22C55E';
        ctx!.fillRect(-bill.size / 2, -bill.size / 4, bill.size, bill.size / 2);

        // Draw border
        ctx!.strokeStyle = '#16A34A';
        ctx!.lineWidth = 1;
        ctx!.strokeRect(-bill.size / 2, -bill.size / 4, bill.size, bill.size / 2);

        // Draw dollar sign
        ctx!.fillStyle = '#FFFFFF';
        ctx!.font = `bold ${bill.size * 0.4}px Arial`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.fillText('$', 0, 0);

        // Draw corner numbers
        ctx!.font = `${bill.size * 0.15}px Arial`;
        ctx!.fillText('100', -bill.size * 0.35, -bill.size * 0.15);
        ctx!.fillText('100', bill.size * 0.35, bill.size * 0.15);

        ctx!.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
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
      className="fixed inset-0 pointer-events-none z-5"
      style={{ opacity: 1 }}
    />
  );
}
