function initTheme() {
  const button = document.querySelector('.theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.dataset.theme = saved;
  button?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}

function initLibs() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ]
    });
  }
  if (window.hljs) hljs.highlightAll();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function initReveal() {
  const items = document.querySelectorAll('.home section, .lora-stage, .card, .tab-shell, .game-panel, .game-hero');
  if (!items.length) return;
  items.forEach((item) => item.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

function initPointerGlow() {
  document.querySelectorAll('.card, .button, .tab-shell, .game-panel, .adapter-lab, .calculator-card, .course-progress-card, .practice-task, .question, .author-card').forEach((node) => {
    node.addEventListener('pointermove', (event) => {
      const box = node.getBoundingClientRect();
      node.style.setProperty('--mx', `${event.clientX - box.left}px`);
      node.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  });
}

function initHomeTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  if (!buttons.length) return;
  buttons.forEach((button) => button.addEventListener('click', () => {
    const target = button.dataset.tab;
    buttons.forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `tab-${target}`);
    });
  }));
}

function initLoraCalculator() {
  const form = document.getElementById('loraCalculator');
  const output = document.getElementById('loraCalcResult');
  if (!form || !output) return;
  const formatter = new Intl.NumberFormat('ru-RU');
  const update = () => {
    const data = new FormData(form);
    const dout = Math.max(1, Number(data.get('dout')) || 1);
    const din = Math.max(1, Number(data.get('din')) || 1);
    const rank = Math.max(1, Number(data.get('rank')) || 1);
    const lora = rank * (dout + din);
    const full = dout * din;
    const pct = full ? lora / full * 100 : 0;
    output.textContent = `${formatter.format(lora)} параметров, ${pct.toFixed(2)}% от полной матрицы`;
  };
  form.addEventListener('input', update);
  update();
}

function initAdapterLab() {
  const lab = document.getElementById('adapterLab');
  if (!lab) return;
  const rank = lab.querySelector('[name="labRank"]');
  const alpha = lab.querySelector('[name="labAlpha"]');
  const dropout = lab.querySelector('[name="labDropout"]');
  const quant = lab.querySelector('[name="labQuant"]');
  const bars = {
    quality: lab.querySelector('[data-metric="quality"] i'),
    memory: lab.querySelector('[data-metric="memory"] i'),
    overfit: lab.querySelector('[data-metric="overfit"] i')
  };
  const labels = lab.querySelectorAll('.lab-value');
  const update = () => {
    const r = Number(rank.value);
    const a = Number(alpha.value);
    const d = Number(dropout.value);
    const q = quant.checked;
    const quality = Math.min(96, 34 + r * 1.15 + a * 0.22 - d * 0.9);
    const memory = Math.min(100, (q ? 18 : 42) + r * (q ? 0.8 : 1.8));
    const overfit = Math.min(100, 18 + r * 0.55 + a * 0.38 - d * 2.2);
    bars.quality.style.width = `${quality}%`;
    bars.memory.style.width = `${memory}%`;
    bars.overfit.style.width = `${Math.max(4, overfit)}%`;
    labels[0].textContent = `r=${r}`;
    labels[1].textContent = `alpha=${a}`;
    labels[2].textContent = `dropout=${d}%`;
    if (quality > 82 && memory < 74 && overfit < 62) unlockAchievement('balanced');
  };
  lab.addEventListener('input', update);
  update();
}

const achievements = {
  balanced: 'Сбалансирован rank, alpha и dropout',
  lab: 'LoRA Quest: адаптер готов к оценке',
  test: 'Итоговая проверка открыта'
};

function unlockAchievement(id) {
  if (!achievements[id]) return;
  const key = `ach-${id}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  const toast = document.createElement('aside');
  toast.className = 'achievement-toast';
  toast.innerHTML = `<strong>Достижение</strong><span>${achievements[id]}</span>`;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 5200);
}

function initAchievements() {
  if (document.getElementById('quiz')) unlockAchievement('test');
}

function initCommandPalette() {
  const nested = location.pathname.includes('/lectures/') || location.pathname.includes('/practicals/');
  const root = nested ? '../' : '';
  const links = [
    ['Главная', `${root}index.html`],
    ['Содержание курса', `${root}index.html#course-map`],
    ['Визуализации', `${root}index.html#visual-lab`],
    ['LoRA Quest', `${root}game.html`],
    ['Об авторах', `${root}authors.html`],
    ['Итоговый тест', `${root}test.html`],
    ...Array.from({ length: 8 }, (_, i) => [`Лекция ${i + 1}`, `${root}lectures/lecture${i + 1}.html`]),
    ...Array.from({ length: 8 }, (_, i) => [`Практика ${i + 1}`, `${root}practicals/practical${i + 1}.html`])
  ];
  const palette = document.createElement('div');
  palette.className = 'command-palette';
  palette.hidden = true;
  palette.innerHTML = '<div class="command-box"><input placeholder="Куда перейти?"><div class="command-results"></div></div>';
  document.body.append(palette);
  const input = palette.querySelector('input');
  const results = palette.querySelector('.command-results');
  const render = () => {
    const query = input.value.trim().toLowerCase();
    const found = links.filter(([title]) => title.toLowerCase().includes(query)).slice(0, 8);
    results.innerHTML = found.map(([title, href]) => `<a href="${href}">${title}<span>${href}</span></a>`).join('');
  };
  const open = () => {
    palette.hidden = false;
    input.value = '';
    render();
    input.focus();
  };
  const close = () => {
    palette.hidden = true;
  };
  document.addEventListener('keydown', (event) => {
    const typing = event.target?.closest?.('input, textarea, select, [contenteditable="true"]');
    if (typing) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
    if (event.key === 'Escape') close();
  });
  palette.addEventListener('click', (event) => {
    if (event.target === palette) close();
  });
  input.addEventListener('input', render);
}

function initLoraQuestGame() {
  const game = document.getElementById('loraQuestGame');
  if (!game) return;
  const board = game.querySelector('.adapter-board');
  const log = game.querySelector('.game-log');
  const levelMap = game.querySelector('.level-map');
  const missionTitle = game.querySelector('[data-mission-title]');
  const missionGoal = game.querySelector('[data-mission-goal]');
  const missionScenario = game.querySelector('[data-mission-scenario]');
  const actionsBox = game.querySelector('.game-actions');
  const feedback = game.querySelector('.mission-feedback');
  const report = game.querySelector('.quest-report');
  const storageKey = 'loraQuestProgress';
  const levels = [
    {
      title: 'Дорогой full fine-tuning',
      goal: 'Сохранить качество при лимите 24 GB GPU.',
      scenario: 'Команда хочет дообучить 7B-модель для поддержки. Full fine-tuning выглядит привычно, но память ограничена.',
      metrics: { quality: 62, memory: 54, forgetting: 24, dataset: 66, readiness: 30 },
      actions: [
        { label: 'Full fine-tuning всех весов', ok: false, delta: { quality: 12, memory: 48, forgetting: 18, readiness: -12 }, why: 'Качество может вырасти, но память взлетает выше лимита. Для адаптера задачи это слишком дорогой старт.', hint: 'Выбери PEFT-подход: базовые веса заморожены, обучается маленькая поправка.' },
        { label: 'LoRA с замороженной базой', ok: true, delta: { quality: 14, memory: 14, forgetting: 4, readiness: 26 }, why: 'LoRA обучает A/B-матрицы, поэтому резко снижает число trainable parameters и оставляет запас памяти.' },
        { label: 'Prompt-only без адаптера', ok: false, delta: { quality: 2, memory: -4, forgetting: 0, readiness: 2 }, why: 'Память почти не тратится, но задача требует устойчивого изменения поведения модели, а не только инструкции.', hint: 'Когда нужен новый навык или стиль ответа, LoRA обычно сильнее prompt-only.' }
      ]
    },
    {
      title: 'Rank и alpha',
      goal: 'Подобрать r/alpha/dropout без переобучения.',
      scenario: 'Датасет небольшой. Нужно поднять validation score, но не дать адаптеру слишком агрессивно переписать базу.',
      metrics: { quality: 68, memory: 45, forgetting: 28, dataset: 58, readiness: 42 },
      controls: true
    },
    {
      title: 'Target modules',
      goal: 'Выбрать модули для Llama-like архитектуры.',
      scenario: 'Нужно решить, куда вставлять LoRA: только attention или ещё MLP-проекции.',
      metrics: { quality: 62, memory: 48, forgetting: 30, dataset: 70, readiness: 38 },
      modules: true
    },
    {
      title: 'QLoRA survival',
      goal: 'Уместиться в 16 GB и сохранить trainability.',
      scenario: 'Модель 13B не помещается в обычном режиме. Нужна конфигурация памяти, а не магическое увеличение GPU.',
      metrics: { quality: 64, memory: 92, forgetting: 32, dataset: 72, readiness: 36 },
      actions: [
        { label: 'NF4 + double quant + checkpointing', ok: true, delta: { quality: 9, memory: -34, forgetting: 2, readiness: 28 }, why: 'QLoRA хранит базу в 4-bit NF4, double quant экономит ещё память, checkpointing снижает activation memory.' },
        { label: 'Увеличить batch size до 16', ok: false, delta: { quality: 5, memory: 24, forgetting: 8, readiness: -14 }, why: 'Большой batch может стабилизировать обучение, но здесь первым ограничением является память.', hint: 'Сначала включи QLoRA и gradient accumulation, потом повышай effective batch.' },
        { label: 'rank 128 без квантования', ok: false, delta: { quality: 8, memory: 30, forgetting: 16, readiness: -18 }, why: 'Высокий rank увеличивает ёмкость и память, а без квантования 13B не переживёт лимит.', hint: 'Для ограниченной GPU начни с r=8..32 и NF4.' }
      ]
    },
    {
      title: 'Eval & Deploy',
      goal: 'Пройти validation, regression prompts и выбрать деплой.',
      scenario: 'Train loss красивый. Теперь надо доказать, что адаптер полезен вне train split и правильно доставить его в inference.',
      metrics: { quality: 78, memory: 58, forgetting: 54, dataset: 74, readiness: 58 },
      actions: [
        { label: 'Baseline, validation split, regression prompts', ok: true, delta: { quality: 10, memory: 2, forgetting: -18, readiness: 26 }, why: 'Eval отделяет реальный прирост от запоминания train split и ловит регрессии поведения базовой модели.' },
        { label: 'Смотреть только train loss', ok: false, delta: { quality: 4, memory: 0, forgetting: 18, readiness: -16 }, why: 'Train loss не показывает generalization. Можно получить высокий train score и слабый validation.', hint: 'Добавь baseline, held-out validation и ручные контрольные prompts.' },
        { label: 'Adapter-first для частых переключений задач', ok: true, delta: { quality: 6, memory: -4, forgetting: -4, readiness: 18 }, why: 'Adapter-first удобно хранит маленькие LoRA-адаптеры отдельно и переключает их без копирования полной базы.' }
      ]
    }
  ];
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  let state = { level: saved.level || 0, unlocked: saved.unlocked || 1, completed: saved.completed || [], metrics: levels[saved.level || 0].metrics };
  const meters = {
    quality: game.querySelector('[data-game-meter="quality"] i'),
    memory: game.querySelector('[data-game-meter="memory"] i'),
    forgetting: game.querySelector('[data-game-meter="forgetting"] i'),
    dataset: game.querySelector('[data-game-meter="dataset"] i'),
    readiness: game.querySelector('[data-game-meter="readiness"] i')
  };
  const values = {
    quality: game.querySelector('[data-game-value="quality"]'),
    memory: game.querySelector('[data-game-value="memory"]'),
    forgetting: game.querySelector('[data-game-value="forgetting"]'),
    dataset: game.querySelector('[data-game-value="dataset"]'),
    readiness: game.querySelector('[data-game-value="readiness"]')
  };
  const clamp = (value) => Math.max(0, Math.min(100, value));
  const persist = () => localStorage.setItem(storageKey, JSON.stringify({
    level: state.level,
    unlocked: state.unlocked,
    completed: state.completed
  }));
  const renderStats = () => {
    Object.keys(meters).forEach((key) => {
      if (!meters[key] || !values[key]) return;
      meters[key].style.width = state.metrics[key] + '%';
      values[key].textContent = state.metrics[key] + '%';
    });
  };
  const addLog = (text, tone = '') => {
    log.innerHTML = `<p class="${tone}">${text}</p>` + log.innerHTML;
  };
  const renderBoard = () => {
    const level = levels[state.level];
    board.innerHTML = ['Data', 'Target modules', 'LoRA config', 'Memory plan', 'Eval', 'Deploy'].map((step, index) => {
      const active = state.metrics.readiness > 24 + index * 11;
      return `<div class="adapter-node ${active ? 'active' : ''}"><b>${index + 1}</b><span>${step}</span></div>`;
    }).join('');
    board.setAttribute('aria-label', `Пайплайн миссии: ${level.title}`);
  };
  const renderMap = () => {
    levelMap.innerHTML = levels.map((level, index) => {
      const done = state.completed.includes(index);
      const locked = index >= state.unlocked;
      return `<button type="button" class="${index === state.level ? 'active' : ''} ${done ? 'done' : ''}" ${locked ? 'disabled' : ''} data-level="${index}" aria-label="Уровень ${index + 1}: ${level.title}">
        <span>${index + 1}</span><b>${level.title}</b>
      </button>`;
    }).join('');
    levelMap.querySelectorAll('button:not([disabled])').forEach((button) => {
      button.addEventListener('click', () => {
        state.level = Number(button.dataset.level);
        loadLevel();
      });
    });
  };
  const applyAction = (action) => {
    Object.keys(action.delta).forEach((key) => {
      state.metrics[key] = clamp(state.metrics[key] + action.delta[key]);
    });
    renderStats();
    renderBoard();
    feedback.innerHTML = `<strong>${action.ok ? 'Хороший ход' : 'Рискованный ход'}</strong><p>${action.why}</p>${action.hint ? `<p class="hint">${action.hint}</p>` : ''}`;
    addLog(`${action.label}: ${action.why}`, action.ok ? 'success' : 'warning');
    if (action.ok) completeLevel(action.why);
  };
  const completeLevel = (reason) => {
    if (!state.completed.includes(state.level)) state.completed.push(state.level);
    state.unlocked = Math.max(state.unlocked, Math.min(levels.length, state.level + 2));
    persist();
    renderMap();
    if (state.completed.length === levels.length) {
      report.hidden = false;
      report.innerHTML = '<h3>Финальный отчёт</h3><p>Вы прошли путь Adapter Engineer: выбрали LoRA вместо дорогого full fine-tuning, сбалансировали rank/alpha/dropout, подобрали target_modules, применили QLoRA для памяти и закрыли eval/deploy-план.</p>';
      unlockAchievement('lab');
    }
    game.querySelector('[data-game-next]').disabled = state.level >= levels.length - 1;
  };
  const renderControlsLevel = () => {
    actionsBox.innerHTML = `
      <div class="quest-control"><label>rank r <b data-rank-value>16</b><input type="range" min="4" max="96" value="16" data-quest-rank></label></div>
      <div class="quest-control"><label>alpha <b data-alpha-value>32</b><input type="range" min="8" max="192" value="32" data-quest-alpha></label></div>
      <div class="quest-control"><label>dropout <b data-dropout-value>0.05</b><input type="range" min="0" max="20" value="5" data-quest-dropout></label></div>
      <button type="button" class="action-card good" data-tune-check><strong>Проверить настройки</strong><span>Цель: r 8-32, alpha около 2r, dropout 0.05-0.1 для небольшого датасета.</span></button>`;
    const update = () => {
      const r = Number(game.querySelector('[data-quest-rank]').value);
      const alpha = Number(game.querySelector('[data-quest-alpha]').value);
      const dropout = Number(game.querySelector('[data-quest-dropout]').value) / 100;
      game.querySelector('[data-rank-value]').textContent = r;
      game.querySelector('[data-alpha-value]').textContent = alpha;
      game.querySelector('[data-dropout-value]').textContent = dropout.toFixed(2);
    };
    actionsBox.querySelectorAll('input').forEach((input) => input.addEventListener('input', update));
    actionsBox.querySelector('[data-tune-check]').addEventListener('click', () => {
      const r = Number(game.querySelector('[data-quest-rank]').value);
      const alpha = Number(game.querySelector('[data-quest-alpha]').value);
      const dropout = Number(game.querySelector('[data-quest-dropout]').value) / 100;
      const ok = r >= 8 && r <= 32 && alpha >= r && alpha <= r * 3 && dropout >= 0.04 && dropout <= 0.12;
      applyAction(ok
        ? { label: `r=${r}, alpha=${alpha}, dropout=${dropout.toFixed(2)}`, ok: true, delta: { quality: 16, memory: 12, forgetting: -6, dataset: 4, readiness: 28 }, why: 'Баланс ёмкости и регуляризации: rank даёт выразительность, alpha не доминирует, dropout снижает overfit.' }
        : { label: `r=${r}, alpha=${alpha}, dropout=${dropout.toFixed(2)}`, ok: false, delta: { quality: 5, memory: r > 48 ? 24 : 8, forgetting: alpha > r * 4 || dropout < 0.02 ? 20 : 8, dataset: 0, readiness: -12 }, why: 'Конфигурация несбалансирована: слишком высокий rank/alpha или нулевой dropout повышают память и overfit.', hint: 'Попробуй r=16, alpha=32, dropout=0.05.' });
    });
    update();
  };
  const renderModulesLevel = () => {
    const modules = ['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj', 'embed_tokens', 'lm_head'];
    actionsBox.innerHTML = `<div class="module-picker">${modules.map((m) => `<label><input type="checkbox" value="${m}" ${['q_proj', 'v_proj'].includes(m) ? 'checked' : ''}> ${m}</label>`).join('')}</div><button class="action-card good" type="button" data-modules-check><strong>Проверить target_modules</strong><span>Attention-проекции обычно безопасный старт, MLP добавляет ёмкость и расход памяти.</span></button>`;
    actionsBox.querySelector('[data-modules-check]').addEventListener('click', () => {
      const picked = [...actionsBox.querySelectorAll('input:checked')].map((input) => input.value);
      const hasCore = picked.includes('q_proj') && picked.includes('v_proj');
      const hasBad = picked.includes('embed_tokens') || picked.includes('lm_head');
      const hasMlp = picked.some((m) => ['gate_proj', 'up_proj', 'down_proj'].includes(m));
      applyAction(hasCore && !hasBad
        ? { label: picked.join(', '), ok: true, delta: { quality: hasMlp ? 18 : 12, memory: hasMlp ? 18 : 8, forgetting: hasMlp ? 6 : 2, dataset: 4, readiness: 26 }, why: hasMlp ? 'Attention + MLP повышает ёмкость адаптера, но требует больше памяти и eval-контроля.' : 'q_proj/v_proj дают понятный минимальный LoRA-старт для attention без лишнего риска.' }
        : { label: picked.join(', ') || 'ничего не выбрано', ok: false, delta: { quality: -4, memory: 10, forgetting: 10, dataset: 0, readiness: -16 }, why: 'Без q_proj/v_proj адаптер слабо влияет на attention, а lm_head/embed_tokens часто требуют отдельной осторожности.', hint: 'Начни с q_proj и v_proj; добавляй o_proj/MLP только при нехватке качества.' });
    });
  };
  const renderActions = () => {
    const level = levels[state.level];
    if (level.controls) return renderControlsLevel();
    if (level.modules) return renderModulesLevel();
    actionsBox.innerHTML = level.actions.map((action, index) => (
      `<button type="button" class="action-card ${action.ok ? 'good' : 'risk'}" data-action="${index}"><strong>${action.label}</strong><span>${action.ok ? 'Почему помогает' : 'Где риск'}: ${action.why}</span></button>`
    )).join('');
    actionsBox.querySelectorAll('.action-card').forEach((button, index) => {
      button.addEventListener('click', () => applyAction(level.actions[index]));
    });
  };
  function loadLevel() {
    const level = levels[state.level];
    state.metrics = { ...level.metrics };
    missionTitle.textContent = `Уровень ${state.level + 1}. ${level.title}`;
    missionGoal.textContent = level.goal;
    missionScenario.textContent = level.scenario;
    feedback.innerHTML = '<strong>Выберите инженерное решение</strong><p>После хода появится объяснение, что изменилось и почему это важно для LoRA.</p>';
    renderStats();
    renderBoard();
    renderMap();
    renderActions();
    game.querySelector('[data-game-next]').disabled = !state.completed.includes(state.level) || state.level >= levels.length - 1;
    persist();
  }
  game.querySelector('[data-game-reset]').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    state = { level: 0, unlocked: 1, completed: [], metrics: levels[0].metrics };
    log.innerHTML = '';
    report.hidden = true;
    addLog('LoRA Quest начат заново. Пройдите миссии от выбора PEFT до deploy.');
    loadLevel();
  });
  game.querySelector('[data-game-next]').addEventListener('click', () => {
    if (state.level < levels.length - 1) {
      state.level += 1;
      state.unlocked = Math.max(state.unlocked, state.level + 1);
      loadLevel();
    }
  });
  addLog('LoRA Quest: выберите миссию и соберите устойчивый adapter pipeline.');
  loadLevel();
}

function initCourseProgress() {
  const total = 8;
  const completed = Array.from({ length: total }, (_, i) => i + 1)
    .filter((id) => localStorage.getItem(`lora_course_lecture_${id}_completed`) === 'true');
  const count = completed.length;
  const pct = Math.round(count / total * 100);
  document.querySelectorAll('[data-progress-count]').forEach((node) => {
    node.textContent = `${count} из ${total} лекций`;
  });
  document.querySelectorAll('[data-progress-message]').forEach((node) => {
    node.textContent = `Ты прошёл ${pct}% маршрута LoRA-инженера`;
  });
  document.querySelectorAll('[data-progress-bar]').forEach((node) => {
    node.style.width = `${pct}%`;
  });
  document.querySelectorAll('[data-lecture-progress-text]').forEach((node) => {
    node.textContent = `Пройдено ${count} из ${total}: ${pct}% маршрута LoRA-инженера`;
  });
}

function initMiniTests() {
  document.querySelectorAll('.mini-test').forEach((test) => {
    const lectureId = Number(test.dataset.lectureId);
    const result = test.querySelector('.mini-test__result');
    const button = test.querySelector('.mini-test__button');
    const key = `lora_course_lecture_${lectureId}_completed`;
    const setAlreadyDone = () => {
      if (localStorage.getItem(key) === 'true' && result && !result.textContent.trim()) {
        result.textContent = 'Лекция уже засчитана в прогресс.';
        result.classList.add('success');
      }
    };
    setAlreadyDone();
    button?.addEventListener('click', () => {
      const questions = [...test.querySelectorAll('.mini-test__question')];
      let score = 0;
      questions.forEach((question) => {
        const picked = question.querySelector('input:checked');
        const ok = picked && picked.value === question.dataset.answer;
        question.classList.toggle('correct', !!ok);
        question.classList.toggle('wrong', !!picked && !ok);
        if (ok) score += 1;
      });
      if (!result) return;
      result.classList.remove('success', 'warning');
      if (score >= 2) {
        localStorage.setItem(key, 'true');
        result.textContent = localStorage.getItem(key) === 'true'
          ? `Лекция пройдена. Прогресс обновлён. Результат: ${score} из 3.`
          : 'Лекция пройдена. Прогресс обновлён.';
        result.classList.add('success');
        initCourseProgress();
      } else {
        result.textContent = 'Пока рано засчитывать лекцию. Перечитай ключевые блоки и попробуй ещё раз.';
        result.classList.add('warning');
      }
    });
  });
}

function initInlineChecks() {
  document.querySelectorAll('.inline-check').forEach((box) => {
    const button = box.querySelector('.inline-check__button');
    const answer = box.querySelector('.inline-check__answer');
    if (!button || !answer) return;
    button.addEventListener('click', () => {
      const hidden = answer.hidden;
      answer.hidden = !hidden;
      button.textContent = hidden ? 'Скрыть ответ' : 'Показать ответ';
    });
  });
}

function enhanceCodeEditor(editor) {
  if (!editor || editor.closest('.code-editor-shell')) return;
  const shell = document.createElement('div');
  shell.className = 'code-editor-shell';
  const gutter = document.createElement('pre');
  gutter.className = 'code-editor-gutter';
  editor.parentNode.insertBefore(shell, editor);
  shell.append(gutter, editor);
  const update = () => {
    const lineCount = Math.max(1, editor.value.split('\n').length);
    gutter.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
  };
  editor.addEventListener('input', update);
  editor.addEventListener('scroll', () => { gutter.scrollTop = editor.scrollTop; });
  update();
}

function buildLoraConfigPreview(config) {
  const target = config.targetModules.map((item) => `"${item}"`).join(', ');
  const quant = config.quantization === 'none' ? '' : `
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="${config.quantization}",
    bnb_4bit_use_double_quant=${config.doubleQuant ? 'True' : 'False'}
)`;
  return `${quant}
lora_config = LoraConfig(
    r=${config.rank},
    lora_alpha=${config.alpha},
    lora_dropout=${config.dropout.toFixed(2)},
    target_modules=[${target}],
    bias="none",
    task_type="CAUSAL_LM"
)

training_plan = {
    "batch_size": ${config.batchSize},
    "sequence_length": ${config.sequenceLength},
    "learning_rate": ${config.learningRate},
    "validation_split": ${config.validationSplit.toFixed(2)},
    "gradient_checkpointing": ${config.gradientCheckpointing ? 'True' : 'False'}
}`.trim();
}

function reviewLoraPlan(config) {
  const warnings = [];
  const tips = [];
  const alphaRatio = config.alpha / Math.max(1, config.rank);
  const moduleSet = new Set(config.targetModules);
  const memoryLoad = (config.quantization === 'none' ? 46 : 20)
    + config.rank * (config.quantization === 'none' ? 1.2 : 0.62)
    + config.batchSize * config.sequenceLength / 800
    - (config.gradientCheckpointing ? 10 : 0)
    - (config.doubleQuant ? 4 : 0);
  if (config.rank > 64) warnings.push('rank выше 64 резко увеличивает память и риск overfit; начните с 8-32, если нет сильного сигнала качества.');
  if (alphaRatio > 4) warnings.push('alpha слишком велик относительно rank: адаптер может доминировать и ухудшать forgetting score.');
  if (config.dropout < 0.03) warnings.push('dropout почти выключен. Для небольших датасетов это повышает риск переобучения.');
  if (config.validationSplit < 0.05) warnings.push('validation split слишком мал или отсутствует: вы не увидите generalization до деплоя.');
  if (!moduleSet.has('q_proj') || !moduleSet.has('v_proj')) warnings.push('target_modules без q_proj/v_proj часто дают слабый старт для attention-LoRA.');
  if (moduleSet.has('lm_head') || moduleSet.has('embed_tokens')) warnings.push('lm_head/embed_tokens требуют отдельной проверки: они могут увеличить память и изменить словарь/голову модели.');
  if (memoryLoad > 86) warnings.push('высокий риск OOM: уменьшите batch/sequence length/rank или включите NF4, double quantization и checkpointing.');
  if (config.quantization !== 'none') tips.push('QLoRA снижает память базы; качество держится за счёт обучения LoRA-адаптера поверх 4-bit весов.');
  if (config.gradientCheckpointing) tips.push('Gradient checkpointing экономит activation memory ценой более медленного шага обучения.');
  if (moduleSet.has('gate_proj') || moduleSet.has('up_proj') || moduleSet.has('down_proj')) tips.push('MLP-проекции добавляют ёмкость, но требуют eval-контроля и большего memory budget.');
  tips.push(`Оценка memory load: ${Math.round(Math.max(8, Math.min(100, memoryLoad)))}%.`);
  return [
    warnings.length ? 'Предупреждения:\n- ' + warnings.join('\n- ') : 'План выглядит сбалансированным для первого LoRA/QLoRA-эксперимента.',
    'Советы инженера:\n- ' + tips.join('\n- '),
    'Это статический помощник: он анализирует конфиг и риски, но не запускает Python в браузере.'
  ].join('\n\n');
}

function getStudioConfig(studio) {
  return {
    rank: Number(studio.querySelector('[name="rank"]').value),
    alpha: Number(studio.querySelector('[name="alpha"]').value),
    dropout: Number(studio.querySelector('[name="dropout"]').value) / 100,
    targetModules: [...studio.querySelectorAll('[name="targetModules"]:checked')].map((input) => input.value),
    quantization: studio.querySelector('[name="quantization"]').value,
    doubleQuant: studio.querySelector('[name="doubleQuant"]').checked,
    batchSize: Number(studio.querySelector('[name="batchSize"]').value),
    sequenceLength: Number(studio.querySelector('[name="sequenceLength"]').value),
    learningRate: studio.querySelector('[name="learningRate"]').value,
    validationSplit: Number(studio.querySelector('[name="validationSplit"]').value) / 100,
    gradientCheckpointing: studio.querySelector('[name="gradientCheckpointing"]').checked
  };
}

function initConfigStudio() {
  document.querySelectorAll('.code-runner').forEach((runner, index) => {
    const id = runner.dataset.runnerId || `runner-${index}`;
    const key = `loraConfigStudio:${id}`;
    runner.classList.add('config-studio');
    runner.innerHTML = `
      <div class="code-runner__head"><h2>LoRA Config Studio</h2><span>сборка конфига и проверка рисков без запуска Python</span></div>
      <form class="config-studio__grid" aria-label="Параметры LoRA Config Studio">
        <label>rank r<input name="rank" type="number" min="1" max="256" value="16"></label>
        <label>alpha<input name="alpha" type="number" min="1" max="512" value="32"></label>
        <label>dropout, %<input name="dropout" type="number" min="0" max="50" value="5"></label>
        <label>quantization<select name="quantization"><option value="nf4">QLoRA NF4</option><option value="fp4">QLoRA FP4</option><option value="none">без квантования</option></select></label>
        <label>batch size<input name="batchSize" type="number" min="1" max="128" value="4"></label>
        <label>sequence length<input name="sequenceLength" type="number" min="128" max="32768" value="2048"></label>
        <label>learning rate<input name="learningRate" value="2e-4"></label>
        <label>validation split, %<input name="validationSplit" type="number" min="0" max="40" value="10"></label>
        <label class="config-studio__toggle"><input name="doubleQuant" type="checkbox" checked> double quantization</label>
        <label class="config-studio__toggle"><input name="gradientCheckpointing" type="checkbox" checked> gradient checkpointing</label>
      </form>
      <fieldset class="config-studio__modules"><legend>target_modules</legend>
        ${['q_proj', 'v_proj', 'k_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj', 'lm_head'].map((module) => `<label><input type="checkbox" name="targetModules" value="${module}" ${['q_proj', 'v_proj'].includes(module) ? 'checked' : ''}> ${module}</label>`).join('')}
      </fieldset>
      <div class="code-runner__actions"><button class="code-runner__build button" type="button">Собрать конфиг</button><button class="code-runner__run button secondary" type="button">Проверить план</button><button class="code-runner__solution-btn button secondary" type="button">Показать пример</button><button class="code-runner__copy button secondary" type="button">Скопировать конфиг</button><button class="code-runner__clear button secondary" type="button">Сбросить</button></div>
      <div class="config-studio__workspace"><pre class="code-runner__solution"><code class="language-python"></code></pre><pre class="code-runner__output" aria-live="polite"></pre></div>`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([name, value]) => {
          if (name === 'targetModules') {
            runner.querySelectorAll('[name="targetModules"]').forEach((input) => { input.checked = value.includes(input.value); });
          } else {
            const input = runner.querySelector(`[name="${name}"]`);
            if (input?.type === 'checkbox') input.checked = value;
            else if (input) input.value = value;
          }
        });
      } catch {}
    }
    const preview = runner.querySelector('.code-runner__solution code');
    const output = runner.querySelector('.code-runner__output');
    const sync = () => {
      const config = getStudioConfig(runner);
      preview.textContent = buildLoraConfigPreview(config);
      localStorage.setItem(key, JSON.stringify(config));
    };
    runner.addEventListener('input', sync);
    runner.querySelector('.code-runner__build').addEventListener('click', () => {
      sync();
      output.textContent = 'Конфиг собран в live-preview. Проверьте план, чтобы увидеть риски перед реальным запуском в Python-окружении.';
    });
    runner.querySelector('.code-runner__run').addEventListener('click', () => {
      output.textContent = reviewLoraPlan(getStudioConfig(runner));
    });
    runner.querySelector('.code-runner__solution-btn').addEventListener('click', () => {
      runner.querySelector('[name="rank"]').value = id.includes('6') ? 8 : 16;
      runner.querySelector('[name="alpha"]').value = id.includes('6') ? 16 : 32;
      runner.querySelector('[name="dropout"]').value = id.includes('3') ? 10 : 5;
      runner.querySelector('[name="quantization"]').value = id.includes('6') ? 'nf4' : 'none';
      runner.querySelector('[name="validationSplit"]').value = id.includes('7') ? 15 : 10;
      sync();
      output.textContent = 'Пример применён. Нажмите «Проверить план», чтобы увидеть риски и советы.';
    });
    runner.querySelector('.code-runner__clear').addEventListener('click', () => {
      localStorage.removeItem(key);
      runner.querySelector('form').reset();
      runner.querySelectorAll('[name="targetModules"]').forEach((input) => { input.checked = ['q_proj', 'v_proj'].includes(input.value); });
      sync();
      output.textContent = 'Поля сброшены. Соберите новый конфиг.';
    });
    runner.querySelector('.code-runner__copy').addEventListener('click', async (event) => {
      try {
        await navigator.clipboard.writeText(preview.textContent);
        event.currentTarget.textContent = 'Скопировано';
        setTimeout(() => { event.currentTarget.textContent = 'Скопировать конфиг'; }, 1400);
      } catch {
        const area = document.createElement('textarea');
        area.value = preview.textContent;
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
    });
    sync();
    output.textContent = 'Соберите конфиг и нажмите «Проверить план». Python здесь не запускается.';
  });
}

function initCodePractice() {
  document.querySelectorAll('.code-practice').forEach((box, index) => {
    const id = box.dataset.practiceId || `practice-${index}`;
    const editor = box.querySelector('.code-practice__editor');
    const solution = box.querySelector('.code-practice__solution');
    const solutionBtn = box.querySelector('.code-practice__solution-btn');
    const copyBtn = box.querySelector('.code-practice__copy');
    const clearBtn = box.querySelector('.code-practice__clear');
    if (!editor) return;
    box.classList.add('config-practice');
    const key = `loraCourseCode:${id}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) editor.value = saved;
    enhanceCodeEditor(editor);
    editor.addEventListener('input', () => localStorage.setItem(key, editor.value));
    const reviewBtn = document.createElement('button');
    reviewBtn.className = 'code-practice__review button';
    reviewBtn.type = 'button';
    reviewBtn.textContent = 'Проверить план';
    const reviewOutput = document.createElement('pre');
    reviewOutput.className = 'code-runner__output';
    reviewOutput.setAttribute('aria-live', 'polite');
    reviewOutput.textContent = 'Опишите LoraConfig или план обучения, затем проверьте риски. Код не выполняется.';
    box.querySelector('.code-practice__actions')?.prepend(reviewBtn);
    box.append(reviewOutput);
    reviewBtn.addEventListener('click', () => {
      const text = editor.value;
      const modules = ['q_proj', 'v_proj', 'k_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj', 'lm_head'].filter((module) => text.includes(module));
      const readNumber = (pattern, fallback) => Number(text.match(pattern)?.[1] || fallback);
      reviewOutput.textContent = reviewLoraPlan({
        rank: readNumber(/\br\s*=\s*(\d+)/, 16),
        alpha: readNumber(/lora_alpha\s*=\s*(\d+)/, 32),
        dropout: Number(text.match(/lora_dropout\s*=\s*([0-9.]+)/)?.[1] || 0.05),
        targetModules: modules.length ? modules : ['q_proj', 'v_proj'],
        quantization: /nf4|4bit|4-bit|QLoRA/i.test(text) ? 'nf4' : 'none',
        doubleQuant: /double/i.test(text),
        batchSize: readNumber(/batch_size["']?\s*[:=]\s*(\d+)/, 4),
        sequenceLength: readNumber(/sequence_length["']?\s*[:=]\s*(\d+)/, 2048),
        learningRate: text.match(/learning_rate["']?\s*[:=]\s*([0-9.e-]+)/)?.[1] || '2e-4',
        validationSplit: /validation|eval/i.test(text) ? 0.1 : 0,
        gradientCheckpointing: /checkpoint/i.test(text)
      });
    });
    solutionBtn?.addEventListener('click', () => {
      if (!solution) return;
      const hidden = solution.hidden;
      solution.hidden = !hidden;
      solutionBtn.textContent = hidden ? 'Скрыть решение' : 'Показать решение';
    });
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(editor.value);
        copyBtn.textContent = 'Скопировано';
        setTimeout(() => { copyBtn.textContent = 'Скопировать код'; }, 1400);
      } catch {
        editor.select();
        document.execCommand('copy');
      }
    });
    clearBtn?.addEventListener('click', () => {
      editor.value = '';
      localStorage.removeItem(key);
      editor.dispatchEvent(new Event('input'));
      editor.focus();
    });
  });
}

function initCodeRunners() {
  initConfigStudio();
}

function renderQuiz() {
  const el = document.getElementById('quiz');
  const dataEl = document.getElementById('quiz-data');
  if (!el || !dataEl) return;
  const qs = JSON.parse(dataEl.textContent);
  window.quizData = qs;
  el.innerHTML = qs.map((q, i) => renderQuestion(q, i)).join('');
  setupDnD();
  el.addEventListener('input', updateProgress);
  el.addEventListener('change', updateProgress);
  document.getElementById('checkQuiz').addEventListener('click', checkQuiz);
  updateProgress();
}

function renderQuestion(q, i) {
  let body = '';
  if (q.type === 'single') {
    body = q.options.map((o, j) => `<label class="option"><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('');
  }
  if (q.type === 'multi') {
    body = q.options.map((o, j) => `<label class="option"><input type="checkbox" name="q${i}" value="${j}"> ${o}</label>`).join('');
  }
  if (q.type === 'text') {
    body = `<input class="text-answer" name="q${i}" placeholder="Введите ответ">`;
  }
  if (q.type === 'match') {
    const vals = shuffle(Object.values(q.pairs));
    body = Object.keys(q.pairs).map((k) => (
      `<div class="match-row"><strong>${k}</strong><select name="q${i}"><option value="">Выберите</option>${vals.map((v) => `<option>${v}</option>`).join('')}</select></div>`
    )).join('');
  }
  if (q.type === 'order') {
    body = `<ul class="sortable" data-q="${i}">${shuffle(q.items).map((x) => `<li draggable="true">${x}</li>`).join('')}</ul>`;
  }
  return `<section class="question" id="question-${i}" data-type="${q.type}"><h3>${i + 1}. ${q.prompt}</h3>${body}<div class="feedback" hidden></div></section>`;
}

function setupDnD() {
  document.querySelectorAll('.sortable li').forEach((li) => {
    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      li.closest('.sortable').dataset.touched = 'true';
      updateProgress();
    });
  });
  document.querySelectorAll('.sortable').forEach((list) => list.addEventListener('dragover', (event) => {
    event.preventDefault();
    const dragging = document.querySelector('.dragging');
    const after = [...list.querySelectorAll('li:not(.dragging)')]
      .find((item) => event.clientY <= item.getBoundingClientRect().top + item.offsetHeight / 2);
    if (dragging) list.insertBefore(dragging, after || null);
  }));
}

function answered(q, i) {
  if (q.type === 'single') return !!document.querySelector(`input[name=q${i}]:checked`);
  if (q.type === 'multi') return document.querySelectorAll(`input[name=q${i}]:checked`).length > 0;
  if (q.type === 'text') return document.querySelector(`[name=q${i}]`).value.trim().length > 0;
  if (q.type === 'match') return [...document.querySelectorAll(`select[name=q${i}]`)].every((s) => s.value);
  if (q.type === 'order') return document.querySelector(`#question-${i} .sortable`)?.dataset.touched === 'true';
  return false;
}

function updateProgress() {
  if (!window.quizData) return;
  const n = window.quizData.filter((q, i) => answered(q, i)).length;
  document.getElementById('progressText').textContent = `${n} из ${window.quizData.length}`;
  document.getElementById('progressBar').style.width = `${100 * n / window.quizData.length}%`;
}

function checkQuiz() {
  const qs = window.quizData;
  let score = 0;
  const mistakes = [];
  qs.forEach((q, i) => {
    const box = document.getElementById(`question-${i}`);
    box.classList.remove('correct', 'wrong');
    let ok = false;
    let right = '';
    if (q.type === 'single') {
      const v = document.querySelector(`input[name=q${i}]:checked`)?.value;
      ok = Number(v) === q.answer;
      right = q.options[q.answer];
    }
    if (q.type === 'multi') {
      const vals = [...document.querySelectorAll(`input[name=q${i}]:checked`)].map((x) => Number(x.value)).sort().join(',');
      ok = vals === q.answer.slice().sort().join(',');
      right = q.answer.map((j) => q.options[j]).join('; ');
    }
    if (q.type === 'text') {
      const v = document.querySelector(`[name=q${i}]`).value.toLowerCase();
      ok = q.answer.some((k) => v.includes(k.toLowerCase()));
      right = q.answer.join(' / ');
    }
    if (q.type === 'match') {
      const keys = Object.keys(q.pairs);
      const vals = [...document.querySelectorAll(`select[name=q${i}]`)];
      ok = keys.every((k, j) => vals[j].value === q.pairs[k]);
      right = keys.map((k) => `${k} — ${q.pairs[k]}`).join('; ');
    }
    if (q.type === 'order') {
      const vals = [...document.querySelectorAll(`#question-${i} .sortable li`)].map((x) => x.textContent.trim());
      ok = vals.join('|') === q.items.join('|');
      right = q.items.join(' → ');
    }
    if (ok) {
      score += 1;
      box.classList.add('correct');
    } else {
      box.classList.add('wrong');
      mistakes.push(`<li><strong>${i + 1}.</strong> ${q.prompt}<br><em>Правильный ответ:</em> ${right}</li>`);
    }
    const fb = box.querySelector('.feedback');
    fb.hidden = false;
    fb.innerHTML = ok ? 'Верно.' : `Неверно. Правильный ответ: ${right}`;
  });
  const pct = Math.round(score * 100 / qs.length);
  document.getElementById('result').hidden = false;
  document.getElementById('result').innerHTML = `<h2>Результат: ${score} из ${qs.length} (${pct}%)</h2>${mistakes.length ? `<h3>Ошибки</h3><ol>${mistakes.join('')}</ol>` : '<p>Все ответы верны.</p>'}`;
  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLibs();
  initReveal();
  initPointerGlow();
  initHomeTabs();
  initLoraCalculator();
  initAdapterLab();
  initAchievements();
  initCommandPalette();
  initLoraQuestGame();
  initCourseProgress();
  initMiniTests();
  initInlineChecks();
  initCodePractice();
  initCodeRunners();
  renderQuiz();
});
