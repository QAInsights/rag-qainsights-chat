(function() {
  const API_URL = 'https://qainsights-blog-rag.onrender.com/api/chat'; // Render backend endpoint
  const STORAGE_KEY = 'dosa_chat_history';

  const bubble   = document.getElementById('dosa-bubble');
  const window_  = document.getElementById('dosa-window');
  const messages = document.getElementById('dosa-messages');
  const input    = document.getElementById('dosa-input');
  const sendBtn  = document.getElementById('dosa-send');
  const clearBtn = document.getElementById('dosa-clear-btn');
  const themeBtn = document.getElementById('dosa-theme-btn');
  const badge    = document.getElementById('dosa-badge');
  const root     = document.getElementById('dosa-chat-root');

  let isOpen     = false;
  let isStreaming = false;
  let history    = [];
  let unread     = 0;
  let isLightMode = false;

  // ── Theme management ───────────────────────────────
  function saveTheme() {
    localStorage.setItem('dosa_theme', isLightMode ? 'light' : 'dark');
  }

  function loadTheme() {
    const saved = localStorage.getItem('dosa_theme');
    isLightMode = saved === 'light';
    updateTheme();
  }

  function updateTheme() {
    if (isLightMode) {
      root.classList.add('light');
      themeBtn.textContent = 'LIGHT MODE';
    } else {
      root.classList.remove('light');
      themeBtn.textContent = 'DARK MODE';
    }
    saveTheme();
  }

  function toggleTheme() {
    isLightMode = !isLightMode;
    updateTheme();
  }

  // ── Session storage ──────────────────────────────
  function saveHistory() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  function loadHistory() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  function restoreHistory() {
    history = loadHistory();
    if (history.length === 0) return;

    // Remove welcome + suggestions
    messages.innerHTML = '';

    history.forEach(msg => appendBubble(msg.role, msg.text, msg.time, false));
  }

  // ── Bubble toggle ─────────────────────────────────
  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    bubble.classList.toggle('open', isOpen);
    window_.classList.toggle('open', isOpen);

    if (isOpen) {
      unread = 0;
      badge.textContent = '';
      badge.classList.remove('visible');
      scrollToBottom();
      setTimeout(() => input.focus(), 250);
    }
  });

  // ── Theme toggle ───────────────────────────────────
  themeBtn.addEventListener('click', toggleTheme);

  // ── Clear history ─────────────────────────────────
  clearBtn.addEventListener('click', () => {
    history = [];
    sessionStorage.removeItem(STORAGE_KEY);
    messages.innerHTML = `
      <div class="dosa-welcome">
        <div class="dosa-welcome-icon"></div>
        <h3>QUERY EXAMPLES</h3>
      </div>
      <div class="dosa-suggestions">
        <button class="dosa-suggestion-btn">Who is the author of this blog?</button>
        <button class="dosa-suggestion-btn">What are the main topics covered?</button>
        <button class="dosa-suggestion-btn">QA testing best practices?</button>
      </div>`;
    bindSuggestions();
  });

  // ── Suggestion buttons ────────────────────────────
  function bindSuggestions() {
    document.querySelectorAll('.dosa-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent;
        sendMessage();
      });
    });
  }
  bindSuggestions();

  // ── Auto-resize textarea ──────────────────────────
  input.addEventListener('input', () => {
    input.style.height = '44px';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // ── Append message bubble ─────────────────────────
  function appendBubble(role, text, time, animate = true) {
    // Remove suggestions on first message
    const suggestions = messages.querySelector('.dosa-suggestions');
    const welcome = messages.querySelector('.dosa-welcome');
    if (suggestions) suggestions.remove();
    if (welcome) welcome.remove();

    const wrap = document.createElement('div');
    wrap.className = `dosa-msg ${role}`;
    if (!animate) wrap.style.animation = 'none';

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'dosa-msg-bubble';
    if (role === 'bot' && text) {
      bubbleEl.innerHTML = marked.parse(text);
    } else {
      bubbleEl.textContent = text;
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'dosa-msg-time';
    timeEl.textContent = time || now();

    wrap.appendChild(bubbleEl);
    wrap.appendChild(timeEl);
    messages.appendChild(wrap);
    scrollToBottom();
    return bubbleEl;
  }

  // ── Typing indicator ──────────────────────────────
  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'dosa-msg bot dosa-typing';
    wrap.id = 'dosa-typing-indicator';
    wrap.innerHTML = `<div class="dosa-msg-bubble"><div class="dosa-typing-dots"><span></span><span></span><span></span></div></div>`;
    messages.appendChild(wrap);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('dosa-typing-indicator');
    if (el) el.remove();
  }

  // ── Send message ──────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    const t = now();
    appendBubble('user', text, t);
    history.push({ role: 'user', text, time: t });
    saveHistory();

    input.value = '';
    input.style.height = '44px';
    sendBtn.disabled = true;
    isStreaming = true;

    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });

      hideTyping();

      if(res.status === 429) {
        appendBubble('bot', '⚠ Too many requests. Please try again later.', now());
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const botTime = now();
      const botBubble = appendBubble('bot', '', botTime);
      let fullText = '';

      // ── Streaming ──
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        botBubble.innerHTML = marked.parse(fullText);
        scrollToBottom();
      }

      history.push({ role: 'bot', text: fullText, time: botTime });
      saveHistory();

      // Unread badge if window is closed
      if (!isOpen) {
        unread++;
        badge.textContent = unread;
        badge.classList.add('visible');
      }

    } catch (err) {
      hideTyping();
      appendBubble('bot', '⚠ Could not connect. Try refreshing the page.', now());
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ── Helpers ───────────────────────────────────────
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── Init ──────────────────────────────────────────
  marked.setOptions({ breaks: true, gfm: true });
  loadTheme();
  restoreHistory();
})();
