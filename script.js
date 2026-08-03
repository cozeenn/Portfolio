(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Intro sequence
  document.body.classList.add('loading');
  const loader = document.querySelector('.loader');
  const loaderBar = loader?.querySelector('.loader-track i');
  const loaderCount = loader?.querySelector('.loader-meta b');
  let progress = 0;
  const finishLoader = () => {
    if (loader?.classList.contains('done')) return;
    progress = 100;
    if (loaderBar) loaderBar.style.width = '100%';
    if (loaderCount) loaderCount.textContent = '100';
    loader?.classList.add('done');
    document.body.classList.remove('loading');
    document.querySelectorAll('.hero .reveal').forEach((el, index) => {
      setTimeout(() => el.classList.add('visible'), 80 * index);
    });
  };
  const loadTimer = setInterval(() => {
    progress = Math.min(100, progress + Math.ceil(Math.random() * 12));
    if (loaderBar) loaderBar.style.width = `${progress}%`;
    if (loaderCount) loaderCount.textContent = String(progress).padStart(3, '0');
    if (progress === 100) {
      clearInterval(loadTimer);
      setTimeout(finishLoader, 280);
    }
  }, reducedMotion ? 5 : 55);
  window.addEventListener('load', () => setTimeout(finishLoader, 1600), { once: true });

  // Current Singapore time
  const timeNode = document.getElementById('localTime');
  const updateTime = () => {
    if (!timeNode) return;
    timeNode.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  };
  updateTime();
  setInterval(updateTime, 30000);
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile navigation
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-header nav');
  const toggleMenu = (force) => {
    const open = typeof force === 'boolean' ? force : !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuButton.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuButton?.addEventListener('click', () => toggleMenu());
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));

  // Reveals
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(el => observer.observe(el));

  // Scroll state, progress, and navigation
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress span');
  const navLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scrollTicking = false;
  const updateScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    header?.classList.toggle('scrolled', y > 30);
    let active = sections[0];
    sections.forEach(section => { if (section.offsetTop <= y + window.innerHeight * .35) active = section; });
    navLinks.forEach(link => link.classList.toggle('active', active && link.getAttribute('href') === `#${active.id}`));
    document.documentElement.style.setProperty('--scroll-y', `${y}px`);
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { requestAnimationFrame(updateScroll); scrollTicking = true; }
  }, { passive: true });
  updateScroll();

  // Custom cursor
  if (finePointer && !reducedMotion) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    document.addEventListener('mousemove', event => {
      mouseX = event.clientX; mouseY = event.clientY;
      dot.style.opacity = '1'; ring.style.opacity = '1';
      dot.style.transform = `translate3d(${mouseX - 2.5}px,${mouseY - 2.5}px,0)`;
    });
    const renderCursor = () => {
      ringX += (mouseX - ringX) * .15;
      ringY += (mouseY - ringY) * .15;
      const size = ring.classList.contains('project-hover') ? 76 : 42;
      ring.style.transform = `translate3d(${ringX - size / 2}px,${ringY - size / 2}px,0)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('project-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('project-hover'));
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  }

  // Magnetic links
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', event => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * .14}px,${y * .14}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // Subtle 3D portrait/project motion
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', event => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        const strength = el.classList.contains('hero-portrait') ? 5 : 1.2;
        el.style.transform = `perspective(1200px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // Interactive node field in hero
  const canvas = document.getElementById('networkCanvas');
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx && !reducedMotion) {
    let width = 0, height = 0, dpr = 1;
    let points = [];
    const pointer = { x: -1000, y: -1000 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(65, Math.max(28, Math.floor(width / 24)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        point.x += point.vx; point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        const pd = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        if (pd < 150) {
          point.x += (point.x - pointer.x) * .004;
          point.y += (point.y - pointer.y) * .004;
        }
        ctx.fillStyle = index % 9 === 0 ? 'rgba(199,255,46,.75)' : 'rgba(255,255,255,.24)';
        ctx.beginPath(); ctx.arc(point.x, point.y, index % 9 === 0 ? 1.5 : .8, 0, Math.PI * 2); ctx.fill();
        for (let j = index + 1; j < points.length; j++) {
          const other = points[j];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 115) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - distance / 115) * .07})`;
            ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(other.x, other.y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };
    canvas.addEventListener('mousemove', event => {
      const rect = canvas.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { pointer.x = -1000; pointer.y = -1000; });
    window.addEventListener('resize', resize);
    resize(); draw();
  }

  // Groq-powered portfolio assistant
  const chatLauncher = document.getElementById('chatLauncher');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const chatSuggestions = document.getElementById('chatSuggestions');
  const chatSend = chatForm?.querySelector('.chat-send');
  const conversation = [];
  let chatBusy = false;

  const setChatOpen = (open) => {
    if (!chatPanel || !chatLauncher) return;
    chatPanel.classList.toggle('open', open);
    chatLauncher.classList.toggle('hidden', open);
    chatPanel.setAttribute('aria-hidden', String(!open));
    chatLauncher.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => chatInput?.focus(), 180);
  };

  const messageTime = () => new Intl.DateTimeFormat('en', {
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());

  const appendChatMessage = (role, content, state = '') => {
    const message = document.createElement('div');
    message.className = `chat-message ${role}${state ? ` ${state}` : ''}`;
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = `${role === 'user' ? 'YOU' : 'REO AI'} / ${messageTime()}`;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    message.append(label, bubble);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
  };

  const appendTyping = () => {
    const message = document.createElement('div');
    message.className = 'chat-message assistant typing';
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = 'REO AI / THINKING';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-bubble';
    bubble.setAttribute('aria-label', 'Reo AI is typing');
    bubble.innerHTML = '<i></i><i></i><i></i>';
    message.append(label, bubble);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
  };

  const sendChatMessage = async (text) => {
    const clean = text.trim();
    if (!clean || chatBusy) return;
    chatBusy = true;
    chatSend.disabled = true;
    chatInput.disabled = true;
    appendChatMessage('user', clean);
    conversation.push({ role: 'user', content: clean });
    if (chatSuggestions) chatSuggestions.innerHTML = '';
    chatInput.value = '';
    chatInput.style.height = '';
    const typing = appendTyping();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation.slice(-10) }),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable right now.');
      const answer = String(data.message || '').trim();
      if (!answer) throw new Error('The assistant returned an empty response.');
      typing.remove();
      appendChatMessage('assistant', answer);
      conversation.push({ role: 'assistant', content: answer });
      if (conversation.length > 12) conversation.splice(0, conversation.length - 12);
    } catch (error) {
      typing.remove();
      const message = error.name === 'AbortError'
        ? 'That took too long. Please try again in a moment.'
        : error.message;
      appendChatMessage('assistant', message, 'error');
      conversation.pop();
    } finally {
      clearTimeout(timeout);
      chatBusy = false;
      chatSend.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  };

  chatLauncher?.addEventListener('click', () => setChatOpen(true));
  chatClose?.addEventListener('click', () => setChatOpen(false));
  chatForm?.addEventListener('submit', event => {
    event.preventDefault();
    sendChatMessage(chatInput.value);
  });
  chatInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });
  chatInput?.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 96)}px`;
  });
  chatSuggestions?.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => sendChatMessage(button.textContent));
  });
  if (window.location.hash === '#assistant') setChatOpen(true);
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#assistant') setChatOpen(true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chatPanel?.classList.contains('open')) setChatOpen(false);
  });
})();
