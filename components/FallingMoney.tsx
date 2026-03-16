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
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      wobbleAmount: number;
      wobbleSpeed: number;
      wobbleOffset: number;
      width: number;
      height: number;
      opacity: number;
      time: number;
    }

    const bills: Bill[] = [];

    function createBill(): Bill {
      return {
        x: Math.random() * canvas!.width,
        y: -100,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.5 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        wobbleAmount: Math.random() * 2 + 1,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        wobbleOffset: Math.random() * Math.PI * 2,
        width: 160,
        height: 80,
        opacity: 0.85,
        time: 0,
      };
    }

    // Create initial bills
    for (let i = 0; i < 3; i++) {
      bills.push(createBill());
    }

    function drawBill(bill: Bill) {
      ctx!.save();
      ctx!.globalAlpha = bill.opacity;
      ctx!.translate(bill.x, bill.y);
      ctx!.rotate(bill.rotation);

      // Main background - realistic green
      const gradient = ctx!.createLinearGradient(
        -bill.width / 2,
        -bill.height / 2,
        -bill.width / 2,
        bill.height / 2
      );
      gradient.addColorStop(0, '#0d5d2f');
      gradient.addColorStop(0.5, '#2d8659');
      gradient.addColorStop(1, '#0d5d2f');

      ctx!.fillStyle = gradient;
      ctx!.fillRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height);

      // Outer border
      ctx!.strokeStyle = '#053d19';
      ctx!.lineWidth = 3;
      ctx!.strokeRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height);

      // Inner gold border
      ctx!.strokeStyle = '#c9a961';
      ctx!.lineWidth = 1.5;
      ctx!.strokeRect(
        -bill.width / 2 + 6,
        -bill.height / 2 + 6,
        bill.width - 12,
        bill.height - 12
      );

      // Large "100" on left side
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `bold ${bill.width * 0.32}px 'Arial Black'`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText('100', -bill.width * 0.35, 0);

      // Large "100" on right side
      ctx!.fillText('100', bill.width * 0.35, 0);

      // Center text - "UNITED STATES OF AMERICA"
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `bold ${bill.width * 0.11}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.fillText('UNITED STATES', 0, -bill.height * 0.18);
      ctx!.font = `bold ${bill.width * 0.1}px Arial`;
      ctx!.fillText('OF AMERICA', 0, bill.height * 0.05);

      // "ONE HUNDRED DOLLARS"
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `${bill.width * 0.075}px Arial`;
      ctx!.fillText('ONE HUNDRED DOLLARS', 0, bill.height * 0.28);

      // Serial numbers - top left
      ctx!.fillStyle = '#ffffff';
      ctx!.font = `${bill.width * 0.06}px 'Courier New'`;
      ctx!.textAlign = 'left';
      ctx!.fillText('A 12345678 B', -bill.width * 0.47, -bill.height * 0.36);

      // Serial numbers - top right
      ctx!.textAlign = 'right';
      ctx!.fillText('A 12345678 B', bill.width * 0.47, -bill.height * 0.36);

      // Series year
      ctx!.textAlign = 'left';
      ctx!.font = `${bill.width * 0.055}px Arial`;
      ctx!.fillText('Series 2023', -bill.width * 0.47, bill.height * 0.36);

      // Federal Reserve
      ctx!.textAlign = 'right';
      ctx!.fillText('Federal Reserve', bill.width * 0.47, bill.height * 0.36);

      // Decorative corner seals
      ctx!.strokeStyle = '#ffffff';
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.arc(-bill.width * 0.42, -bill.height * 0.35, 6, 0, Math.PI * 2);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(bill.width * 0.42, bill.height * 0.35, 6, 0, Math.PI * 2);
      ctx!.stroke();

      // Security feature - fine lines
      ctx!.strokeStyle = '#ffffff';
      ctx!.lineWidth = 0.5;
      ctx!.globalAlpha = bill.opacity * 0.5;
      for (let i = 0; i < 10; i++) {
        const x = -bill.width * 0.45 + i * (bill.width * 0.09);
        ctx!.beginPath();
        ctx!.moveTo(x, -bill.height * 0.2);
        ctx!.lineTo(x, bill.height * 0.2);
        ctx!.stroke();
      }

      // Portrait area shading
      ctx!.globalAlpha = bill.opacity * 0.12;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(
        -bill.width * 0.3,
        -bill.height * 0.3,
        bill.width * 0.12,
        bill.height * 0.6
      );

      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = bills.length - 1; i >= 0; i--) {
        const bill = bills[i];

        // Update position
        bill.y += bill.vy;
        bill.vy += 0.15; // gravity
        bill.vy = Math.min(bill.vy, 3); // terminal velocity

        // Wobble effect (side to side flutter)
        bill.wobbleOffset += bill.wobbleSpeed;
        bill.x += Math.sin(bill.wobbleOffset) * bill.wobbleAmount * 0.01;

        // Rotation with flutter
        bill.rotation += bill.rotationSpeed;
        bill.rotationSpeed += (Math.random() - 0.5) * 0.01; // flutter effect
        bill.rotationSpeed *= 0.98; // damping

        // Keep x in bounds
        if (bill.x < -50) bill.x = canvas!.width + 50;
        if (bill.x > canvas!.width + 50) bill.x = -50;

        // Fade in/out effect
        if (bill.y < 100) {
          bill.opacity = Math.min(0.85, bill.y / 100);
        } else if (bill.y > canvas!.height - 100) {
          bill.opacity = 0.85 * ((canvas!.height - bill.y) / 100);
        } else {
          bill.opacity = 0.85;
        }

        // Remove when fully off screen and not visible
        if (bill.y > canvas!.height + 150) {
          bills.splice(i, 1);
          bills.push(createBill());
        } else {
          drawBill(bill);
        }
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
      style={{ opacity: 1 }}
    />
  );
}
