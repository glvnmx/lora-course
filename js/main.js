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
  const items = document.querySelectorAll('.home section, .content, .lora-stage, .card, .tab-shell, .game-panel');
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
  document.querySelectorAll('.card, .button, .tab-shell, .game-panel').forEach((node) => {
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
    if (rank === 1703) unlockAchievement('peter');
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
  balanced: 'Собран сбалансированный адаптер',
  peter: 'Петр одобряет rank 1703',
  harvest: 'Собран царский урожай LoRA',
  test: 'Тестовая дисциплина включена'
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
    ['Карта курса', `${root}index.html#course-map`],
    ['Визуализации', `${root}index.html#visual-lab`],
    ['Мини-игра', `${root}game.html`],
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

function initStudyJokes() {
  const jokes = [
    'LoRA вошла в слой тихо: база даже не проснулась.',
    'Ранг 1 тоже ранг. Просто очень скромный.',
    'Если loss падает слишком красиво, проверьте, не учит ли модель ответы из валидации.',
    'QLoRA: когда видеокарта сказала «я маленькая, но гордая».',
    'SVD разложило матрицу, но не вашу мотивацию.',
    'Катастрофическое забывание: модель помнит всё, кроме того, зачем ее донастраивали.',
    'Alpha высокий, самооценка адаптера тоже.',
    'Поставили r=256. Теперь это почти full fine-tuning с чувством вины.',
    'PEFT экономит память, но не экономит необходимость читать логи.',
    'Если target_modules пустой, адаптер обучается силой намерения.',
    'Double quantization: квантуем квантизацию, потому что можем.',
    'SFT любит чистые данные. Грязные данные любят SFT еще сильнее.',
    'DPO спросил: какой ответ лучше? Датасет пожал плечами.',
    'Merge-and-unload: момент, когда адаптер съезжается с базой.',
    'vLLM батчит запросы быстрее, чем мы выбираем гиперпараметры.',
    'LoRA для Stable Diffusion: маленький файл, большие ожидания.',
    'Переобучение начинается там, где заканчивается валидация.',
    'Если eval loss молчит, посмотрите генерации. Они обычно разговорчивее.',
    'Ранг низкий, ставки высокие.',
    'Tokenizer не виноват. Хотя иногда виноват.',
    'Chat template - это не украшение, а договор с моделью.',
    'Gradient checkpointing: платим временем, покупаем память.',
    'NF4 звучит как номер трассы, но спасает GPU-память.',
    'AdaLoRA распределяет ранги так, как бюджет на конференции.',
    'DoRA разделила величину и направление. Осталось разделить дедлайн и реальность.',
    'Warmup нужен не только оптимизатору.',
    'Если модель стала отвечать идеально одинаково, поздравляем: стиль победил смысл.',
    'LoRA маленькая, но в production спрашивают с нее как со взрослой.',
    'Сначала данные, потом гиперпараметры. Да, опять данные.',
    'Матрица BA скромная, пока не умножишь на количество слоев.',
    'TensorBoard показывает графики. Интерпретацию все еще придется делать людям.',
    'ORPO пришел без reference model и попросил не драматизировать.',
    'rsLoRA делит на корень, потому что ранг тоже хочет стабильности.',
    'Adapter zoo звучит весело, пока не нужно версионировать 200 файлов.',
    'Если ответы стали короче после DPO, это не всегда мудрость. Иногда это страх.',
    'Слитая модель быстрее, но адаптер уже не вытащить без воспоминаний.',
    'Главная метрика курса: меньше магии, больше проверяемых решений.',
    'LoRA не чинит плохой датасет. Она просто быстрее показывает, что он плохой.',
    'Случайная шутка прошла inference без батчинга.',
    'Если вы это читаете, таймер работает.'
  ];
  let pool = shuffle(jokes);
  let count = 0;
  let timer;
  const nextDelay = () => 60000 + Math.floor(Math.random() * 60000);
  const show = () => {
    if (document.hidden) {
      timer = setTimeout(show, nextDelay());
      return;
    }
    if (!pool.length) pool = shuffle(jokes);
    const note = document.createElement('aside');
    note.className = `study-joke variant-${1 + Math.floor(Math.random() * 3)}`;
    note.style.left = `${8 + Math.random() * 72}vw`;
    note.style.top = `${14 + Math.random() * 64}vh`;
    count += 1;
    note.innerHTML = `<button type="button" aria-label="Закрыть">×</button><strong>PEFT-пауза #${count}</strong><span>${pool.pop()}</span>`;
    document.body.append(note);
    const close = () => note.classList.add('leaving');
    note.querySelector('button').addEventListener('click', close);
    note.addEventListener('animationend', () => {
      if (note.classList.contains('leaving')) note.remove();
    });
    setTimeout(close, 14000);
    timer = setTimeout(show, nextDelay());
  };
  timer = setTimeout(show, nextDelay());
  window.addEventListener('pagehide', () => clearTimeout(timer));
}

function initPeterFarmGame() {
  const game = document.getElementById('peterFarmGame');
  if (!game) return;
  const field = game.querySelector('.farm-field');
  const log = game.querySelector('.game-log');
  const stats = { quality: 38, memory: 26, forgetting: 18, harvest: 22, turn: 0 };
  const actions = [
    { name: 'Чистые данные', type: 'good', q: 13, h: 12, m: 3, f: -4, text: 'Петр велел переписать датасет без дублей.' },
    { name: 'rank +8', type: 'rank', q: 12, h: 8, m: 12, f: 4, text: 'Ранг вырос, грядки стали умнее.' },
    { name: 'NF4 квантизация', type: 'quant', q: 5, h: 6, m: -14, f: 1, text: 'Казна GPU вздохнула свободнее.' },
    { name: 'Слишком большой alpha', type: 'risk', q: 6, h: -4, m: 6, f: 15, text: 'Адаптер кричит громче базовой модели.' },
    { name: 'Валидация', type: 'eval', q: 7, h: 8, m: 1, f: -9, text: 'Ошибки найдены до царского смотра.' },
    { name: 'Грязный CSV', type: 'bad', q: -10, h: -12, m: 1, f: 9, text: 'В датасете смешались рожь, ячмень и HTML.' }
  ];
  const meters = {
    quality: game.querySelector('[data-game-meter="quality"] i'),
    memory: game.querySelector('[data-game-meter="memory"] i'),
    forgetting: game.querySelector('[data-game-meter="forgetting"] i'),
    harvest: game.querySelector('[data-game-meter="harvest"] i')
  };
  const values = {
    quality: game.querySelector('[data-game-value="quality"]'),
    memory: game.querySelector('[data-game-value="memory"]'),
    forgetting: game.querySelector('[data-game-value="forgetting"]'),
    harvest: game.querySelector('[data-game-value="harvest"]')
  };
  const clamp = (value) => Math.max(0, Math.min(100, value));
  const renderStats = () => {
    Object.keys(meters).forEach((key) => {
      meters[key].style.width = `${stats[key]}%`;
      values[key].textContent = `${stats[key]}%`;
    });
  };
  const addLog = (text) => {
    log.innerHTML = `<p>${text}</p>${log.innerHTML}`;
  };
  const plant = () => {
    field.innerHTML = '';
    const count = Math.max(6, Math.round(stats.harvest / 8));
    for (let i = 0; i < 16; i += 1) {
      const plot = document.createElement('button');
      plot.type = 'button';
      plot.className = i < count ? 'plot grown' : 'plot';
      plot.textContent = i < count ? 'BA' : 'W₀';
      field.append(plot);
    }
  };
  const deal = () => {
    const tray = game.querySelector('.game-actions');
    const roundActions = shuffle(actions).slice(0, 3);
    tray.innerHTML = roundActions.map((action, index) => (
      `<button type="button" class="action-card ${action.type}" data-action="${index}">
        <strong>${action.name}</strong><span>${action.text}</span>
      </button>`
    )).join('');
    tray.querySelectorAll('.action-card').forEach((button, index) => {
      const action = roundActions[index];
      button.addEventListener('click', () => applyAction(action));
    });
  };
  const applyAction = (action) => {
    stats.turn += 1;
    stats.quality = clamp(stats.quality + action.q);
    stats.memory = clamp(stats.memory + action.m);
    stats.forgetting = clamp(stats.forgetting + action.f);
    stats.harvest = clamp(stats.harvest + action.h + Math.round(stats.quality / 18) - Math.round(stats.forgetting / 22));
    renderStats();
    plant();
    addLog(`Ход ${stats.turn}: ${action.text}`);
    if (stats.memory >= 92) addLog('GPU-казна почти пуста. Петр требует QLoRA.');
    if (stats.forgetting >= 82) addLog('База забывает агрономию. Нужна валидация.');
    if (stats.harvest >= 86 && stats.quality >= 76 && stats.memory < 90 && stats.forgetting < 70) {
      addLog('Победа: адаптер обучен, урожай принят, база не сломана.');
      unlockAchievement('harvest');
    }
    deal();
  };
  game.querySelector('[data-game-reset]').addEventListener('click', () => {
    Object.assign(stats, { quality: 38, memory: 26, forgetting: 18, harvest: 22, turn: 0 });
    log.innerHTML = '';
    addLog('Петр I открыл сезон донастройки. Соберите урожай без переобучения.');
    renderStats();
    plant();
    deal();
  });
  game.querySelector('[data-game-reset]').click();
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
  initStudyJokes();
  initPeterFarmGame();
  renderQuiz();
});
