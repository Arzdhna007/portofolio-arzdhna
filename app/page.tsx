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

const ADMIN_EMAIL = "admin@arrizqi.com";
const ADMIN_PASS = "axon2026";

export default function Home() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [visitorCount, setVisitorCount] = useState<string>('...');
  const [visitorCountry, setVisitorCountry] = useState<string>('...');

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminInputEmail, setAdminInputEmail] = useState('');
  const [adminInputPass, setAdminInputPass] = useState('');

  useEffect(() => {
    setIsReady(true);
    const savedName = localStorage.getItem('portfolio-visitor-name');
    if (savedName) setIsUnlocked(true);

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

    fetch('https://api.counterapi.dev/v1/portofolio-arzdhna/visits/up')
      .then(res => res.json())
      .then(data => setVisitorCount(data.count.toString()))
      .catch(() => setVisitorCount('Private'));

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setVisitorCountry(data.country_name))
      .catch(() => setVisitorCountry('Unknown'));
  }, []);

  useEffect(() => {
    if (!isReady || (!isUnlocked && !isAdminLoggedIn)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth; let height = window.innerHeight;
    canvas.width = width; canvas.height = height;

    const currentThemeId = THEMES[themeIndex].id;
    let particles: any[] = []; let animationId: number;
    let mouseX = width / 2; let mouseY = height / 2;

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
        this.x = Math.random() * width; this.y = activeConfig.dir === -1 ? height + Math.random() * 100 : Math.random() * height - 100;
        this.baseX = this.x; this.baseY = this.y;
        this.size = activeConfig.isText ? Math.random() * 10 + 12 : Math.random() * 20 + 15;
        this.char = activeConfig.chars.length > 0 ? activeConfig.chars[Math.floor(Math.random() * activeConfig.chars.length)] : '';
        if (activeConfig.isNetwork) { this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; this.size = 2; } 
        else if (activeConfig.isText) { this.vx = 0; this.vy = Math.random() * 2 + 1; } 
        else if (activeConfig.dir === 0) { this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; } 
        else { this.vx = (Math.random() - 0.5) * 2; this.vy = activeConfig.dir * (Math.random() * 2 + 1); }
      }
      update() {
        if (activeConfig.isNetwork) {
          this.baseX += this.vx; this.baseY += this.vy;
          if (this.baseX < 0 || this.baseX > width) this.vx *= -1; if (this.baseY < 0 || this.baseY > height) this.vy *= -1;
          this.x += (this.baseX + (mouseX - width / 2) * 0.05 - this.x) * 0.1; this.y += (this.baseY + (mouseY - height / 2) * 0.05 - this.y) * 0.1;
        } else {
          this.vy += activeConfig.grav; this.x += this.vx; this.y += this.vy;
          if (activeConfig.dir === -1 && this.y < -50) { this.y = height + 50; this.x = Math.random() * width; } 
          else if (activeConfig.dir === 1 && this.y > height + 50) { this.y = -50; this.x = Math.random() * width; this.vy = 0; } 
          else if (activeConfig.dir === 0) { if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; }
        }
      }
      draw() {
        if (!ctx) return;
        if (activeConfig.isNetwork && this.char === '') {
          ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = currentThemeId === 'aurora' ? 'rgba(45, 212, 191, 0.7)' : 'rgba(14, 165, 233, 0.7)'; ctx.fill();
        } else if (this.char !== '') {
          ctx.font = `${this.size}px monospace`; ctx.textAlign = 'center';
          if (activeConfig.isText) ctx.fillStyle = 'rgba(34, 197, 94, 0.9)'; ctx.fillText(this.char, this.x, this.y);
        }
      }
    }

    for (let i = 0; i < activeConfig.count; i++) particles.push(new Particle());
    const animate = () => {
      ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); });
      if (activeConfig.isNetwork) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y; const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath(); ctx.strokeStyle = currentThemeId === 'aurora' ? `rgba(45, 212, 191, ${1 - dist / 120})` : `rgba(14, 165, 233, ${1 - dist / 120})`;
              ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
    const handleMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('resize', handleResize); window.addEventListener('mousemove', handleMouseMove);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouseMove); };
  }, [themeIndex, isReady, isUnlocked, isAdminLoggedIn]);

  // Transmisi Webhook Telegram
  const sendToTelegram = async (nameData: string) => {
    const botToken = "8927941197:AAFh-ckEeYSu-p1PyquptMI4JMR1-Z3uN9Q"; 
    const chatId = "6221684331";

    const text = `🚨 *AKSES PORTOFOLIO BARU*\n\n👤 *Identitas:* ${nameData}\n🌍 *Lokasi:* ${visitorCountry}\n💻 *Peramban:* ${navigator.userAgent}`;
    
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
      });
    } catch (e) { console.error("Gagal mentransmisikan data ke AXON"); }
  };

  const validateAndUnlock = () => {
    const name = visitorName.trim();
    if (name.length < 3) { setErrorMsg("Nama terlalu pendek. Minimal 3 karakter."); return; }
    if (/[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+/.test(name)) { setErrorMsg("Sistem menolak angka atau simbol khusus."); return; }
    if (!/[aeiouy]/i.test(name)) { setErrorMsg("Anomali: Nama tidak memiliki huruf vokal."); return; }
    if (/(.)\1{2,}/.test(name)) { setErrorMsg("Anomali: Indikasi Spam ketikan acak."); return; }

    setErrorMsg("");
    localStorage.setItem('portfolio-visitor-name', name);
    setIsUnlocked(true);
    sendToTelegram(name);
  };

  const handleAdminAuth = () => {
    if (adminInputEmail === ADMIN_EMAIL && adminInputPass === ADMIN_PASS) {
      setErrorMsg("");
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
    } else {
      setErrorMsg("Kredensial Otorisasi Ditolak.");
    }
  };

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

  if (!isReady) return null;

  // --- PANEL ADMINISTRATOR (Tertutup) ---
  if (isAdminLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '20px', transform: 'none' }}>
        <div style={{ maxWidth: '500px', width: '100%', background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333', transform: 'none' }}>
          <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <span><i className="fas fa-server"></i> Panel Administrator</span>
            <button onClick={() => setIsAdminLoggedIn(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Tutup</button>
          </h2>
          <div style={{ padding: '15px', background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a3e635' }}><strong>Status Koneksi AXON: Aktif</strong></p>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
              Untuk alasan keamanan dan mematuhi kebijakan privasi, server portofolio <strong>tidak menyimpan</strong> data nama pengunjung. Setiap data masukan secara otomatis dikanalisasi dan dikirim langsung ke perangkat Telegram Anda.
            </p>
          </div>
          <button style={{ width: '100%', padding: '12px', background: '#22c55e', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold' }} onClick={() => window.open('https://t.me/ArrizqiPramadhana', '_blank')}>
            Buka Log Telegram AXON
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING GATEKEEPER (DIISOLASI DARI EFEK MIRING GLOBAL) ---
  if (!isUnlocked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', padding: '20px', margin: 0, transform: 'none' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px', width: '100%', background: 'rgba(30, 30, 30, 0.9)', padding: '40px 30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', transform: 'none' }}>
          
          <i className="fas fa-shield-halved" style={{ fontSize: '3rem', color: '#2dd4bf', marginBottom: '20px' }}></i>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#fff', fontWeight: '600' }}>Verifikasi Identitas</h2>
          
        <input 
            type="text" 
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && validateAndUnlock()}
            placeholder="Ketik nama asli Anda..."
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '10px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(0,0,0,0.4)', 
              color: '#fff', 
              outline: 'none', 
              marginBottom: '10px', 
              fontFamily: 'inherit', 
              textAlign: 'center', 
              fontSize: '1rem', 
              
              /* -- KONTROL MANUAL ABSOLUT -- */
              position: 'relative',
              left: '-13px',               /* GESER POSISI: Ubah ke '10px' untuk geser kanan, '-10px' untuk geser kiri */
              transform: 'rotate(0deg)'  /* KOREKSI ROTASI: Ubah ke '2deg' atau '-2deg' jika bentuk kotaknya yang miring/berputar */
            }}
          />
          
          <p style={{ color: '#ef4444', fontSize: '0.85rem', minHeight: '20px', margin: '0 0 15px' }}>{errorMsg}</p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => window.history.back()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#ccc', cursor: 'pointer', fontWeight: '600', transform: 'none' }}>Kembali</button>
            <button onClick={validateAndUnlock} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2dd4bf', color: '#000', cursor: 'pointer', fontWeight: 'bold', transform: 'none' }}>Lanjutkan</button>
          </div>
          
          <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '25px', lineHeight: '1.4' }}>
            *Input divalidasi untuk keamanan sistem. Nama Anda tidak dibagikan ke pihak ketiga.<br/>
           </p>
        </div>
      </div>
    );
  }

  // --- RENDERING UTAMA (Portofolio) ---
  const currentTheme = THEMES[themeIndex];
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
                <i className={link.icon}></i><span>{link.title}</span>
              </a>
            ))}
          </div>
          <button className="theme-trigger-btn" onClick={cycleTheme} style={{ position: 'relative', zIndex: 10 }}>
            <i className={currentTheme.icon}></i> Ubah Mode: {currentTheme.name}
          </button>
        </div>
      </main>
      <div className="visitor-tracker">
        total akses: {visitorCount} | pengguna: {visitorCountry.toLowerCase()}
      </div>
    </>
  );
}