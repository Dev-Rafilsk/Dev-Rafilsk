document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initTheme();
    initCustomCursor();
    initBackgroundCanvas();
    initUISounds();
    initEasterEgg();
    fetchGitHubStats();
    setupMobileNav();
    setupNavScrollState();
    setupScrollReveal();
    setupTerminalTyping();
    setupBackToTop();
    setupTiltEffect();
    setupModals();
    setupContactForm();
});

function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smoothWheel: true
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            lenis.scrollTo(this.getAttribute('href'));
        });
    });
}

function initUISounds() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function playPop() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    document.querySelectorAll('.hover-sound').forEach(el => {
        el.addEventListener('click', () => {
            try { playPop(); } catch(e) {}
        });
    });
}

function initEasterEgg() {
    const originalTitle = document.title;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.title = '👀 Ei, volte para o projeto!';
        } else {
            document.title = originalTitle;
        }
    });
}

async function fetchGitHubStats() {
    const badge = document.getElementById('github-badge');
    const statsEl = badge.querySelector('.gh-stats');
    
    try {
        const res = await fetch('https://api.github.com/users/Dev-Rafilsk');
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        statsEl.innerHTML = `${data.public_repos} Repositórios • ${data.followers} Seguidores`;
        badge.onclick = () => window.open(data.html_url, '_blank');
    } catch (err) {
        statsEl.innerHTML = 'Ver projetos open-source';
        badge.onclick = () => window.open('https://github.com/Dev-Rafilsk', '_blank');
    }
}

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const icon = toggleBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    htmlEl.setAttribute('data-theme', initialTheme);
    updateIcon(initialTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
        if (window.updateCanvasTheme) window.updateCanvasTheme(newTheme);
    });

    function updateIcon(theme) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

function initCustomCursor() {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const dot = document.querySelector('[data-cursor-dot]');
    const outline = document.querySelector('[data-cursor-outline]');
    if (!dot || !outline) return;

    let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`;
    });

    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15; outlineY += (mouseY - outlineY) * 0.15;
        outline.style.left = `${outlineX}px`; outline.style.top = `${outlineY}px`;
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, select, .tilt-card, .github-badge')) {
            outline.classList.add('hovered');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, select, .tilt-card, .github-badge')) {
            outline.classList.remove('hovered');
        }
    });
}

function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [], animationFrameId;
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const particleCount = window.innerWidth < 768 ? 15 : 35; 
    
    function resize() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        animate();
    }
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth; this.y = Math.random() * window.innerHeight;
            this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? 'rgba(59, 219, 138, 0.4)' : 'rgba(46, 158, 108, 0.3)';
            ctx.fill();
        }
    }
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    window.updateCanvasTheme = (theme) => { isDark = theme === 'dark'; };

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isDark ? `rgba(168, 85, 247, ${(1 - dist/150) * 0.15})` : `rgba(124, 45, 147, ${(1 - dist/150) * 0.1})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    resize();
}

function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    const closeMenu = () => { document.body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', (e) => { e.stopPropagation(); const isOpen = document.body.classList.toggle('nav-open'); toggle.setAttribute('aria-expanded', String(isOpen)); });
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

function setupNavScrollState() {
    const navWrap = document.querySelector('.nav-wrap');
    if (!navWrap) return;
    const updateState = () => navWrap.classList.toggle('scrolled', window.scrollY > 0);
    updateState();
    window.addEventListener('scroll', updateState, { passive: true });
}

function setupScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    targets.forEach(el => observer.observe(el));
}

function setupTiltEffect() {
    if (window.matchMedia('(hover: none)').matches) return;
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const centerX = rect.width / 2, centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        });
        card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
    });
}

function setupTerminalTyping() {
    const el = document.getElementById('terminal-text');
    if (!el) return;
    const lines = ['npm run deploy --projeto="seu-site"', 'git commit -m "UX Elevada"', 'status: online para projetos'];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = lines[0]; return; }
    let lineIdx = 0, charIdx = 0, deleting = false;
    function step() {
        const cur = lines[lineIdx];
        if (!deleting) {
            charIdx++; el.textContent = cur.slice(0, charIdx);
            if (charIdx === cur.length) { deleting = true; setTimeout(step, 2000); return; }
            setTimeout(step, 50);
        } else {
            charIdx--; el.textContent = cur.slice(0, charIdx);
            if (charIdx === 0) { deleting = false; lineIdx = (lineIdx + 1) % lines.length; setTimeout(step, 500); return; }
            setTimeout(step, 25);
        }
    }
    step();
}

function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 600), { passive: true });
}

const projectDB = {
    'scii': {
        title: 'SCII | Sistema de Chamada Inclusiva',
        desc: 'Desenvolvido durante a Startup Experience Wyden, conquistou o 2º lugar. O sistema visa transformar hospitais e clínicas em ambientes totalmente acessíveis para pacientes com deficiência, controlando chamadas via painel intuitivo e notificações visuais/sonoras.',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Acessibilidade'],
        github: 'https://github.com/Dev-Rafilsk',
        images: [
            'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
            'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'  
        ]
    },
    'landing': {
        title: 'Landing Pages de Alta Conversão',
        desc: 'Construção de páginas profissionais focadas no nicho médico (como Dra. Manuela Aguiar). Foco absoluto em velocidade de carregamento, responsividade e botões de chamada para ação estratégicos ligados diretamente ao WhatsApp da clínica.',
        tags: ['UX/UI Design', 'HTML5', 'CSS Grid', 'SEO'],
        github: 'https://github.com/Dev-Rafilsk',
        images: [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1551076805-e18690c5e577?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]
    },
    'dashboard': {
        title: 'Dashboard Analítico',
        desc: 'Interface rica para acompanhamento de dados em tempo real. O sistema consome uma API dedicada usando Fetch nativo, exibindo gráficos complexos, filtros de datas e painéis de conversão com Dark Mode integrado.',
        tags: ['Python', 'JavaScript Vanilla', 'APIs', 'JSON'],
        github: 'https://github.com/Dev-Rafilsk',
        images: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
            'https://images.unsplash.com/photo-1543286386-2e659306cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]
    }
};

function setupModals() {
    const budgetModal = document.getElementById('budget-modal');
    const projectModal = document.getElementById('project-modal');
    
    document.querySelectorAll('[data-open-budget]').forEach(btn => {
        btn.addEventListener('click', () => {
            budgetModal.classList.add('active');
            document.body.classList.add('modal-open');
        });
    });

    let currentSlide = 0;
    const track = document.getElementById('carousel-track');
    const indicatorsWrap = document.getElementById('carousel-indicators');

    function updateCarousel() {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        Array.from(indicatorsWrap.children).forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });
    }

    document.getElementById('carousel-prev')?.addEventListener('click', () => {
        if(currentSlide > 0) { currentSlide--; updateCarousel(); }
    });
    document.getElementById('carousel-next')?.addEventListener('click', () => {
        const total = track.children.length;
        if(currentSlide < total - 1) { currentSlide++; updateCarousel(); }
    });

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-project-id');
            const data = projectDB[id];
            if(!data) return;

            document.getElementById('pm-title').innerText = data.title;
            document.getElementById('pm-desc').innerText = data.desc;
            document.getElementById('pm-github').href = data.github;
            
            const tagsWrap = document.getElementById('pm-tags');
            tagsWrap.innerHTML = '';
            data.tags.forEach(tag => {
                const li = document.createElement('li'); li.innerText = tag; tagsWrap.appendChild(li);
            });

            track.innerHTML = '';
            indicatorsWrap.innerHTML = '';
            currentSlide = 0;

            data.images.forEach((src, idx) => {
                const img = document.createElement('img');
                img.src = src; img.className = 'carousel-slide';
                track.appendChild(img);

                const dot = document.createElement('div');
                dot.className = 'indicator' + (idx === 0 ? ' active' : '');
                dot.onclick = () => { currentSlide = idx; updateCarousel(); };
                indicatorsWrap.appendChild(dot);
            });
            updateCarousel();

            projectModal.classList.add('active');
            document.body.classList.add('modal-open');
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            document.body.classList.remove('modal-open');
        }
    });
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    const budgetInput = document.getElementById('budget');
    const budgetValue = document.getElementById('budget-value');
    const budgetStatus = document.getElementById('budget-status');
    const successOverlay = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    const note = document.getElementById('form-note');
    
    if (!form) return;

    if (budgetInput && budgetValue) {
        budgetInput.addEventListener('input', () => {
            const val = parseInt(budgetInput.value);
            budgetValue.textContent = `R$ ${val.toLocaleString('pt-BR')}`;
            if (val < 3000) { budgetStatus.textContent = 'Projeto Simples'; budgetStatus.style.color = 'var(--green)'; }
            else if (val < 10000) { budgetStatus.textContent = 'Projeto Intermediário'; budgetStatus.style.color = 'var(--purple)'; }
            else { budgetStatus.textContent = 'Projeto Avançado'; budgetStatus.style.color = '#ff5f56'; }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = form.name.value.trim(), tipo = form['project-type'].value, msg = form.message.value.trim();
        const orcamento = budgetInput ? `R$ ${parseInt(budgetInput.value).toLocaleString('pt-BR')}` : 'N/A';

        if (!nome || !msg) { note.textContent = 'Preencha os campos obrigatórios.'; return; }

        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparando Briefing...';
        
        setTimeout(() => {
            if (successOverlay) successOverlay.classList.add('active');
            const texto = `Olá Rafilsk, meu nome é *${nome}*! 👋\n\nTenho interesse em estruturar um projeto com você.\n\n*Serviço:* ${tipo}\n*Orçamento estimado:* ${orcamento}\n\n*Briefing:* ${msg}`;
            const link = `https://wa.me/5571984510297?text=${encodeURIComponent(texto)}`;

            setTimeout(() => {
                window.open(link, '_blank');
                setTimeout(() => {
                    successOverlay.classList.remove('active');
                    form.reset(); note.textContent = '';
                    submitBtn.innerHTML = 'Enviar via WhatsApp <i class="fa-brands fa-whatsapp"></i>';
                    document.getElementById('budget-modal').classList.remove('active');
                    document.body.classList.remove('modal-open');
                }, 1500);
            }, 1500);
        }, 600);
    });
}
