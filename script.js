'use strict';

let lenisInstance = null;

function lockScroll() {
    document.body.classList.add('modal-open');
    if (lenisInstance) lenisInstance.stop();
}

function unlockScroll() {
    document.body.classList.remove('modal-open');
    if (lenisInstance) lenisInstance.start();
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSmoothScroll();
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
    setupBudgetModal();
    setupProjectModal();
    setupContactForm();

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector('i');
    const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
    updateIcon(currentTheme);

    toggleBtn.addEventListener('click', () => {
        const oldTheme = htmlEl.getAttribute('data-theme');
        const newTheme = oldTheme === 'light' ? 'dark' : 'light';

        htmlEl.setAttribute('data-theme', newTheme);
        try { localStorage.setItem('theme', newTheme); } catch (e) {}
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            if (!target || target === '#' || target.length < 2) return;

            const el = document.querySelector(target);
            if (!el) return;

            e.preventDefault();
            lenisInstance.scrollTo(el, { offset: -80 });
        });
    });
}

function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = document.querySelector('[data-cursor-dot]');
    const outline = document.querySelector('[data-cursor-outline]');
    if (!dot || !outline) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.18;
        outlineY += (mouseY - outlineY) * 0.18;
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    const hoverSelector = 'a, button, select, .tilt-card, .github-badge, .project-card';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverSelector)) outline.classList.add('hovered');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverSelector)) outline.classList.remove('hovered');
    });
}

/* EFEITO CANVAS DE PARTÍCULAS VERDE NEON */
function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let particles = [];
    let animationFrameId = null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        return;
    }

    const particleCount = window.innerWidth < 768 ? 50 : 120;

    function resize() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        animate();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.radius = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random();
            this.fadeSign = Math.random() > 0.5 ? 1 : -1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            this.opacity += 0.005 * this.fadeSign;
            if (this.opacity >= 1) this.fadeSign = -1;
            if (this.opacity <= 0.1) this.fadeSign = 1;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(30, 215, 96, ${this.opacity})`;
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    resize();
}

function initUISounds() {
    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextRef) return;

    let audioCtx = null;
    function playPop() {
        try {
            if (!audioCtx) audioCtx = new AudioContextRef();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
    }
    document.addEventListener('click', (e) => {
        if (e.target.closest('.hover-sound')) playPop();
    });
}

function initEasterEgg() {
    const originalTitle = document.title;
    document.addEventListener('visibilitychange', () => {
        document.title = document.hidden ? '👀 Ei, Rafilsk está te esperando!' : originalTitle;
    });
}

async function fetchGitHubStats() {
    const badge = document.getElementById('github-badge');
    if (!badge) return;
    const statsEl = badge.querySelector('.gh-stats');
    if (!statsEl) return;
    const USERNAME = 'Dev-Rafilsk';

    try {
        const res = await fetch(`https://api.github.com/users/${USERNAME}`);
        if (!res.ok) throw new Error('Erro');
        const data = await res.json();
        statsEl.textContent = `${data.public_repos} Repositórios • ${data.followers} Seguidores`;
        badge.onclick = () => window.open(data.html_url, '_blank', 'noopener');
    } catch (err) {
        statsEl.textContent = 'Ver projetos open-source';
        badge.onclick = () => window.open(`https://github.com/${USERNAME}`, '_blank', 'noopener');
    }
}

function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    const closeMenu = () => {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 899) closeMenu();
    });
}

function setupNavScrollState() {
    const navWrap = document.querySelector('.nav-wrap');
    if (!navWrap) return;
    const updateState = () => navWrap.classList.toggle('scrolled', window.scrollY > 10);
    updateState();
    window.addEventListener('scroll', updateState, { passive: true });
}

function setupScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el) => observer.observe(el));
}

function setupTiltEffect() {
    if (window.matchMedia('(hover: none)').matches) return;
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
        let rafId = null;
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.15s var(--ease)';
        });
        card.addEventListener('mousemove', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
        });
        card.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.style.transition = 'transform 0.45s var(--ease)';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

function setupTerminalTyping() {
    const el = document.getElementById('terminal-text');
    if (!el) return;

    const lines = [
        'npm run deploy --projeto="seu-site"',
        'git commit -m "UX Elevada"',
        'status: online para projetos'
    ];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = lines[0];
        return;
    }

    let lineIdx = 0, charIdx = 0, deleting = false;

    function step() {
        const cur = lines[lineIdx];
        if (!deleting) {
            charIdx++;
            el.textContent = cur.slice(0, charIdx);
            if (charIdx === cur.length) {
                deleting = true;
                setTimeout(step, 2000);
                return;
            }
            setTimeout(step, 55);
        } else {
            charIdx--;
            el.textContent = cur.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                lineIdx = (lineIdx + 1) % lines.length;
                setTimeout(step, 500);
                return;
            }
            setTimeout(step, 28);
        }
    }
    step();
}

function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const toggle = () => btn.classList.toggle('visible', window.scrollY > 600);
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });

    btn.addEventListener('click', () => {
        if (lenisInstance) {
            lenisInstance.scrollTo(0, { duration: 1.1 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

const projectDB = {
    'dr-lucas': {
        title: 'Dr. Lucas Moreira',
        desc: 'Landing Page sob medida para atendimento médico profissional. Foco total em conversão e usabilidade para agendamentos de consultas com design de alto padrão e velocidade de carregamento extrema.',
        tags: ['HTML5', 'CSS3', 'JavaScript'],
        liveUrl: 'https://drlucasmo.com.br',
        liveLabel: 'Acessar Site',
    },
    'dra-roberta': {
        title: 'Dra. Roberta Moitinho',
        desc: 'Página de presença digital médica responsiva. Interface desenhada para acolher o paciente, transmitir segurança e direcioná-lo rapidamente para a equipe de atendimento via WhatsApp.',
        tags: ['HTML5', 'CSS3', 'UX/UI'],
        liveUrl: 'https://drarobertamoitinho.com.br',
        liveLabel: 'Acessar Site',
    },
    'dr-marcelo': {
        title: 'Dr. Marcelo Pedrosa',
        desc: 'Site institucional otimizado para motores de busca (SEO) e estruturado em blocos dinâmicos para apresentar tratamentos, depoimentos e área de localização imersiva.',
        tags: ['HTML5', 'CSS3', 'JavaScript'],
        liveUrl: 'https://drmarcelopedrosamarinho.com.br',
        liveLabel: 'Acessar Site',
    },
    'dra-manuela': {
        title: 'Dra. Manuela Aguiar',
        desc: 'Projeto focado em destacar autoridade médica na área de atuação. Conta com carrossel interativo, layout clean e botões flutuantes para garantir altíssima taxa de contato.',
        tags: ['HTML5', 'CSS3', 'UX/UI'],
        liveUrl: 'https://dramanuelaaguiar.com.br',
        liveLabel: 'Acessar Site',
    },
    'scii': {
        title: 'SCII | Sistema de Chamada Inclusiva e Inteligente',
        desc: 'Projeto premiado com o 2º lugar na Startup Experience Wyden. Desenvolvido para acessibilidade hospitalar e clínica, permitindo o gerenciamento de chamadas de pacientes com deficiência.',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Acessibilidade'],
        githubUrl: 'https://github.com/Dev-Rafilsk/SCII-Sistema-de-Inclusao',
        images: ['./', '']
    },
    'dashboard': {
        title: 'Dashboard Analítico em Tempo Real',
        desc: 'Painel administrativo para visualização de métricas consumindo API REST nativa. Interface com Dark Mode, filtros dinâmicos e gráficos responsivos.',
        tags: ['Python', 'JavaScript', 'APIs REST'],
        githubUrl: 'https://github.com/Dev-Rafilsk',
        images: ['./assets/dash-1.jpg']
    }
};

function openModal(overlay) {
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
}

function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach((m) => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
    });
    unlockScroll();
}

function createImagePlaceholder(label) {
    const safeLabel = String(label || 'Projeto').replace(/[<>&"]/g, '');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#2e9e6c"/>
                    <stop offset="100%" stop-color="#7c2d93"/>
                </linearGradient>
            </defs>
            <rect width="800" height="450" fill="url(#g)"/>
            <text x="400" y="210" font-family="Sora, sans-serif" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle">
                ${safeLabel}
            </text>
            <text x="400" y="250" font-family="JetBrains Mono, monospace" font-size="15" fill="rgba(255,255,255,0.7)" text-anchor="middle">
                Sem imagem disponível
            </text>
        </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
}

function setupBudgetModal() {
    const budgetModal = document.getElementById('budget-modal');
    if (!budgetModal) return;

    document.querySelectorAll('[data-open-budget]').forEach((btn) => {
        btn.addEventListener('click', () => openModal(budgetModal));
    });
}

function setupProjectModal() {
    const projectModal = document.getElementById('project-modal');
    if (!projectModal) return;

    const track = document.getElementById('carousel-track');
    const indicatorsWrap = document.getElementById('carousel-indicators');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const pmTitle = document.getElementById('pm-title');
    const pmDesc = document.getElementById('pm-desc');
    const pmTags = document.getElementById('pm-tags');
    const pmActions = document.getElementById('pm-actions');

    let currentSlide = 0;
    let totalSlides = 0;

    function goToSlide(index) {
        if (totalSlides === 0) return;
        currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        Array.from(indicatorsWrap.children).forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });
    }

    function renderProject(project) {
        pmTitle.textContent = project.title || 'Projeto';
        pmDesc.textContent = project.desc || '';

        pmTags.innerHTML = '';
        (project.tags || []).forEach((tag) => {
            const li = document.createElement('li');
            li.textContent = tag;
            pmTags.appendChild(li);
        });

        pmActions.innerHTML = '';

        if (project.githubUrl && project.githubUrl.trim() !== '') {
            const ghLink = document.createElement('a');
            ghLink.href = project.githubUrl;
            ghLink.target = '_blank';
            ghLink.rel = 'noopener noreferrer';
            ghLink.className = 'btn btn-ghost btn-small hover-sound';
            ghLink.innerHTML = '<i class="fa-brands fa-github"></i> Ver no GitHub';
            pmActions.appendChild(ghLink);
        }

        if (project.liveUrl && project.liveUrl.trim() !== '') {
            const liveLink = document.createElement('a');
            liveLink.href = project.liveUrl;
            liveLink.target = '_blank';
            liveLink.rel = 'noopener noreferrer';
            liveLink.className = 'btn btn-primary btn-small hover-sound';
            const label = project.liveLabel || 'Ver Site';
            liveLink.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> ${label}`;
            pmActions.appendChild(liveLink);
        }

        track.innerHTML = '';
        indicatorsWrap.innerHTML = '';

        const images = (project.images && project.images.length)
            ? project.images
            : [createImagePlaceholder(project.title)];

        totalSlides = images.length;

        images.forEach((src, idx) => {
            const img = document.createElement('img');
            img.className = 'carousel-slide';
            img.alt = `${project.title} — Imagem ${idx + 1}`;
            img.loading = 'lazy';
            img.src = src;

            img.addEventListener('error', function handleError() {
                img.removeEventListener('error', handleError);
                img.src = createImagePlaceholder(project.title);
            });

            track.appendChild(img);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'indicator' + (idx === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ir para imagem ${idx + 1}`);
            dot.addEventListener('click', () => goToSlide(idx));
            indicatorsWrap.appendChild(dot);
        });

        const showControls = totalSlides > 1;
        prevBtn.style.display = showControls ? '' : 'none';
        nextBtn.style.display = showControls ? '' : 'none';
        indicatorsWrap.style.display = showControls ? '' : 'none';

        currentSlide = 0;
        goToSlide(0);
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.querySelectorAll('.project-card').forEach((card) => {
        const activate = (e) => {
            if (e && e.target.closest('.project-link')) return; 

            const id = card.getAttribute('data-project-id');
            const data = projectDB[id];
            if (!data) return;
            renderProject(data);
            openModal(projectModal);
        };
        card.addEventListener('click', activate);
    });
}

document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
        const overlay = closeBtn.closest('.modal-overlay');
        if (overlay) closeModal(overlay);
        return;
    }
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        closeModal(e.target);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const projectType = document.getElementById('project-type');
    const dynamicPrice = document.getElementById('dynamic-price');
    const successOverlay = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    const note = document.getElementById('form-note');

    const WHATSAPP_NUMBER = '5571982553729';

    if (projectType && dynamicPrice) {
        projectType.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            dynamicPrice.textContent = price ? price : 'Selecione um serviço acima';
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = form.name.value.trim();
        const tipoSelect = form['project-type'];
        const tipo = tipoSelect.value;
        const msg = form.message.value.trim();
        
        const selectedOption = tipoSelect.options[tipoSelect.selectedIndex];
        const orcamento = selectedOption ? selectedOption.getAttribute('data-price') : 'Não definido';

        if (!nome || !msg || !tipo) {
            note.textContent = 'Preencha todos os campos obrigatórios.';
            note.style.color = '#ff5f56';
            return;
        }

        note.textContent = '';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparando Briefing...';

        setTimeout(() => {
            if (successOverlay) successOverlay.classList.add('active');

            const texto =
                `Olá Rafilsk, meu nome é ${nome}! 👋\n\n` +
                `Tenho interesse em estruturar um projeto com você.\n\n` +
                `Serviço: ${tipo}\n` +
                ` ${orcamento}\n\n` +
                ` ${msg}`;

            const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

            setTimeout(() => {
                window.open(link, '_blank', 'noopener');

                setTimeout(() => {
                    if (successOverlay) successOverlay.classList.remove('active');
                    form.reset();
                    if (dynamicPrice) dynamicPrice.textContent = 'Selecione um serviço acima';

                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Enviar via WhatsApp <i class="fa-brands fa-whatsapp"></i>';

                    const budgetModal = document.getElementById('budget-modal');
                    if (budgetModal) closeModal(budgetModal);
                }, 1400);
            }, 1400);
        }, 500);
    });
}
