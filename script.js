document.addEventListener('DOMContentLoaded', () => {
    setFooterYear();
    setupMobileNav();
    setupNavScrollState();
    setupScrollReveal();
    setupStartCounters();
    setupTerminalTyping();
    setupBackToTop();
    setupContactForm();
});

function setFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    const closeMenu = () => {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

function setupNavScrollState() {
    // Corrigido: 'doument' para 'document' e 'querySelectorAll' para 'querySelector'
    const navWrap = document.querySelector('.nav-wrap'); 
    if (!navWrap) return;

    const updateState = () => {
        navWrap.classList.toggle('scrolled', window.scrollY > 0);
    };

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

    const observer = new IntersectionObserver((entries, observer) => { 
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach((el) => observer.observe(el));
}

function setupStartCounters() {
    const panel = document.querySelector('.stats-panel');
    // Corrigido: '.stats-number' para '.stat-number' para casar com o HTML
    const numbers = document.querySelectorAll('.stat-number'); 
    if (!panel || !numbers.length) return;

    const animateNumbers = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const sufix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);
            el.textContent = value.toLocaleString('pt-BR') + sufix;
            if(progress < 1) {
                requestAnimationFrame(tick);
            }
        };
        requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                numbers.forEach(animateNumbers);
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(panel);
}

function setupTerminalTyping() {
  const el = document.getElementById('terminal-text');
  if (!el) return;

  const TERMINAL_LINES = [
    'npm run deploy --projeto="seu-site"',
    'git commit -m "mais um projeto no ar"',
    'status: disponível para novos projetos',
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    el.textContent = TERMINAL_LINES[0];
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 45;
  const DELETE_SPEED = 25;
  const PAUSE_AFTER_TYPE = 1600;
  const PAUSE_AFTER_DELETE = 300;

  function step() {
    const currentLine = TERMINAL_LINES[lineIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = currentLine.slice(0, charIndex);
      if (charIndex === currentLine.length) {
        deleting = true;
        setTimeout(step, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(step, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = currentLine.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % TERMINAL_LINES.length;
        setTimeout(step, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(step, DELETE_SPEED);
    }
  }

  step();
}

function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dados = {
      nome: form.name.value.trim(),
      email: form.email.value.trim(),
      tipo: form['project-type'].value,
      mensagem: form.message.value.trim(),
    };

    if (!dados.nome || !dados.email || !dados.mensagem) {
      note.textContent = 'Preencha nome, e-mail e mensagem antes de enviar.';
      note.style.color = '#b3261e';
      return;
    }

    sendViaMailto(dados);

    note.textContent = 'Abrindo seu aplicativo de e-mail com a mensagem pronta…';
    note.style.color = '';
    form.reset();
  });
}

function sendViaMailto(dados) {
  const destino = 'contato@devrafilsk.com';

  const assunto = `Orçamento — ${dados.tipo}`;
  const corpo =
    `Nome: ${dados.nome}\n` +
    `E-mail: ${dados.email}\n` +
    `Tipo de projeto: ${dados.tipo}\n\n` +
    `Mensagem:\n${dados.mensagem}`;

  const link = `mailto:${destino}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  window.location.href = link;
}
