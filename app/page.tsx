'use client';

import { useEffect, useState, useRef } from 'react';
import data from './links.json';

const THEMES = [
  { id: 'dark', name: 'Dark Mode', icon: 'fas fa-moon' },
  { id: 'light', name: 'Light Mode', icon: 'fas fa-sun' },
  { id: 'fire', name: 'Inferno Mode', icon: 'fas fa-fire' },
  { id: 'skull', name: 'Gothic Skull', icon: 'fas fa-skull' },
  { id: 'matrix', name: 'Matrix Terminal', icon: 'fas fa-terminal' },
  { id: 'cyberpunk', name: 'Tech & OS Stack', icon: 'fas fa-microchip' },
  { id: 'ocean', name: 'Deep Ocean', icon: 'fas fa-water' },
  { id: 'vaporwave', name: 'Retro Vaporwave', icon: 'fas fa-compact-disc' },
  { id: 'aurora', name: 'Aurora Network', icon: 'fas fa-smog' },
  { id: 'gold', name: 'Luxury Gold', icon: 'fas fa-crown' }
];

export default function Home() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State Analitik Pengunjung
  const [visitorCount, setVisitorCount] = useState<string>('...');
  const [visitorCountry, setVisitorCountry] = useState<string>('...');

  useEffect(() => {
    setIsReady(true);
    const savedThemeId = localStorage.getItem('portfolio-theme-id');
    if (savedThemeId) {
      const idx = THEMES.findIndex(t => t.id === savedThemeId);
      if (idx !== -1) {
        setThemeIndex(idx);
        document.documentElement.setAttribute('data-theme', THEMES[idx].id);
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Eksekusi Pelacakan Latar Belakang (Gratis via Public API)
    // 1. Menambah & Mengambil Total Klik
    fetch('https://api.counterapi.dev/v1/portofolio-arzdhna/visits/up')
      .then(res => res.json())
      .then(data => setVisitorCount(data.count.toString()))
      .catch(() => setVisitorCount('Private'));

    // 2. Mendeteksi Geolocation Pengunjung
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setVisitorCountry(data.country_name))
      .catch(() => setVisitorCountry('Unknown'));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const currentThemeId = THEMES[themeIndex].id;
    let particles: Particle[] = [];
    let animationId: number;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const physicsConfig: Record<string, any> = {
      fire: { chars: ['🔥', '✨', '💨'], dir: -1, grav: -0.1, count: 35, isNetwork: false },
      skull: { chars: ['💀', '🩸', '🦇'], dir: 1, grav: 0.15, count: 25, isNetwork: false },
      matrix: { chars: ['>_', '{}', '</>', '0', '1', '[]'], dir: 1, grav: 0.05, count: 60, isText: true, isNetwork: false },
      cyberpunk: { chars: ['🐧', '🍎', '🐍', '🎮', '⚙️', '🗄️', '💻'], dir: 0, grav: 0, count: 25, isNetwork: false },
      ocean: { chars: ['🫧', '🫧', '🐟'], dir: -1, grav: -0.05, count: 40, isNetwork: false },
      vaporwave: { chars: ['💾', '🌴', '🕹️'], dir: 1, grav: 0.1, count: 20, isNetwork: false },
      aurora: { chars: ['✨', '⭐'], dir: 0, grav: 0, count: 50, isNetwork: true },
      gold: { chars: ['🪙', '✨', '💎'], dir: 1, grav: 0.15, count: 30, isNetwork: false },
      dark: { chars: [], count: 50, isNetwork: true },
      light: { chars: ['☁️', '☀️'], dir: 0, grav: 0, count: 15, isNetwork: false }
    };

    const activeConfig = physicsConfig[currentThemeId] || physicsConfig['dark'];

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number; char: string; baseX: number; baseY: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = activeConfig.dir === -1 ? height + Math.random() * 100 : Math.random() * height - 100;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = activeConfig.isText ? Math.random() * 10 + 12 : Math.random() * 20 + 15;
        this.char = activeConfig.chars.length > 0 ? activeConfig.chars[Math.floor(Math.random() * activeConfig.chars.length)] : '';

        if (activeConfig.isNetwork) {
          this.vx = (Math.random() - 0.5) * 1.5;
          this.vy = (Math.random() - 0.5) * 1.5;
          this.size = 2;
        } else if (activeConfig.isText) {
          this.vx = 0;
          this.vy = Math.random() * 2 + 1;
        } else if (activeConfig.dir === 0) {
          this.vx = (Math.random() - 0.5) * 1.5;
          this.vy = (Math.random() - 0.5) * 1.5;
        } else {
          this.vx = (Math.random() - 0.5) * 2;
          this.vy = activeConfig.dir * (Math.random() * 2 + 1);
        }
      }

      update() {
        if (activeConfig.isNetwork) {
          this.baseX += this.vx; this.baseY += this.vy;
          if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
          if (this.baseY < 0 || this.baseY > height) this.vy *= -1;
          
          const targetX = this.baseX + (mouseX - width / 2) * 0.05;
          const targetY = this.baseY + (mouseY - height / 2) * 0.05;
          this.x += (targetX - this.x) * 0.1;
          this.y += (targetY - this.y) * 0.1;
        } else {
          this.vy += activeConfig.grav;
          this.x += this.vx;
          this.y += this.vy;

          if (activeConfig.dir === -1 && this.y < -50) {
            this.y = height + 50; this.x = Math.random() * width;
          } else if (activeConfig.dir === 1 && this.y > height + 50) {
            this.y = -50; this.x = Math.random() * width; this.vy = 0; 
          } else if (activeConfig.dir === 0) {
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
          }
        }
      }

      draw() {
        if (!ctx) return;
        if (activeConfig.isNetwork && this.char === '') {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = currentThemeId === 'aurora' ? 'rgba(45, 212, 191, 0.7)' : 'rgba(14, 165, 233, 0.7)';
          ctx.fill();
        } else if (this.char !== '') {
          ctx.font = `${this.size}px monospace`;
          ctx.textAlign = 'center';
          if (activeConfig.isText) ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
          ctx.fillText(this.char, this.x, this.y);
        }
      }
    }

    for (let i = 0; i < activeConfig.count; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });

      if (activeConfig.isNetwork) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
              ctx.beginPath();
              const alpha = 1 - distance / 120;
              ctx.strokeStyle = currentThemeId === 'aurora' ? `rgba(45, 212, 191, ${alpha})` : `rgba(14, 165, 233, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
    };
    const handleMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [themeIndex, isReady]);

  const playRetroSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const cycleTheme = () => {
    playRetroSound();
    const nextIndex = (themeIndex + 1) % THEMES.length;
    setThemeIndex(nextIndex);
    const targetTheme = THEMES[nextIndex];
    document.documentElement.setAttribute('data-theme', targetTheme.id);
    localStorage.setItem('portfolio-theme-id', targetTheme.id);
  };

  const currentTheme = isReady ? THEMES[themeIndex] : THEMES[0];

  return (
    <>
      <canvas id="physics-canvas" ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }} />
      
      <main className="tilt-wrapper">
        <div className="container">
          <div className="profile">
            <img src={data.profile.avatar} alt="Profile" />
            <h1>{data.profile.name}</h1>
            <p>{data.profile.role}</p>
          </div>
          
          <div className="links">
            {data.links.map((link, index) => (
              <a key={index} href={link.url} className="link-btn" target="_blank" rel="noopener noreferrer" style={{ position: 'relative', zIndex: 10 }}>
                <i className={link.icon}></i>
                <span>{link.title}</span>
              </a>
            ))}
          </div>

          <button 
              className="theme-trigger-btn" 
              onClick={cycleTheme}
              style={{ opacity: isReady ? 1 : 0.5, cursor: isReady ? 'pointer' : 'wait', position: 'relative', zIndex: 10 }}
          >
            <i className={currentTheme.icon}></i> 
            {isReady ? `Ubah Mode: ${currentTheme.name}` : 'Menghubungkan Mesin...'}
          </button>
        </div>
      </main>

      {/* Teks Tracker Samaran */}
      <div className="visitor-tracker">
        total akses: {visitorCount} | pengguna: {visitorCountry.toLowerCase()}
      </div>
    </>
  );
}