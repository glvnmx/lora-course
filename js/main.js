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
  lab: 'LoRA Lab: адаптер готов к оценке',
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
    ['LoRA Lab', `${root}game.html`],
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

function initPeterFarmGame() {
  const game = document.getElementById('peterFarmGame');
  if (!game) return;
  const matrix = game.querySelector('.farm-field');
  const log = game.querySelector('.game-log');
  const stats = { quality: 38, memory: 30, forgetting: 18, readiness: 24, turn: 0 };
  const actions = [
    { name: 'Очистить датасет', type: 'good', q: 13, ready: 12, m: 3, f: -5, text: 'Удалены дубли, роли сообщений и chat template проверены.' },
    { name: 'Увеличить rank', type: 'rank', q: 11, ready: 8, m: 12, f: 5, text: 'Адаптер получил больше ёмкости, но вырос расход памяти.' },
    { name: 'Включить QLoRA NF4', type: 'quant', q: 5, ready: 7, m: -16, f: 1, text: '4-битная база снизила GPU memory и сохранила обучаемый адаптер.' },
    { name: 'Слишком высокий alpha', type: 'risk', q: 4, ready: -5, m: 5, f: 16, text: 'Вклад адаптера стал слишком сильным: forgetting score растёт.' },
    { name: 'Validation review', type: 'eval', q: 8, ready: 10, m: 1, f: -10, text: 'Baseline и адаптер сравнены на контрольных prompts.' },
    { name: 'Шумный train split', type: 'bad', q: -10, ready: -12, m: 1, f: 10, text: 'В данных найдены противоречивые ответы и утечка validation.' }
  ];
  const meters = {
    quality: game.querySelector('[data-game-meter="quality"] i'),
    memory: game.querySelector('[data-game-meter="memory"] i'),
    forgetting: game.querySelector('[data-game-meter="forgetting"] i'),
    readiness: game.querySelector('[data-game-meter="readiness"] i')
  };
  const values = {
    quality: game.querySelector('[data-game-value="quality"]'),
    memory: game.querySelector('[data-game-value="memory"]'),
    forgetting: game.querySelector('[data-game-value="forgetting"]'),
    readiness: game.querySelector('[data-game-value="readiness"]')
  };
  const clamp = (value) => Math.max(0, Math.min(100, value));
  const renderStats = () => {
    Object.keys(meters).forEach((key) => {
      if (!meters[key] || !values[key]) return;
      meters[key].style.width = stats[key] + '%';
      values[key].textContent = stats[key] + '%';
    });
  };
  const addLog = (text) => {
    log.innerHTML = '<p>' + text + '</p>' + log.innerHTML;
  };
  const renderMatrix = () => {
    matrix.innerHTML = '';
    const active = Math.max(4, Math.round(stats.readiness / 7));
    for (let idx = 0; idx < 16; idx += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = idx < active ? 'plot grown' : 'plot';
      cell.textContent = idx < active ? 'BA' : 'W0';
      matrix.append(cell);
    }
  };
  const deal = () => {
    const tray = game.querySelector('.game-actions');
    const roundActions = shuffle(actions).slice(0, 3);
    tray.innerHTML = roundActions.map((action, index) => (
      '<button type="button" class="action-card ' + action.type + '" data-action="' + index + '">' +
      '<strong>' + action.name + '</strong><span>' + action.text + '</span></button>'
    )).join('');
    tray.querySelectorAll('.action-card').forEach((button, index) => {
      button.addEventListener('click', () => applyAction(roundActions[index]));
    });
  };
  const applyAction = (action) => {
    stats.turn += 1;
    stats.quality = clamp(stats.quality + action.q);
    stats.memory = clamp(stats.memory + action.m);
    stats.forgetting = clamp(stats.forgetting + action.f);
    stats.readiness = clamp(stats.readiness + action.ready + Math.round(stats.quality / 18) - Math.round(stats.forgetting / 22));
    renderStats();
    renderMatrix();
    addLog('Ход ' + stats.turn + ': ' + action.text);
    if (stats.memory >= 92) addLog('GPU memory почти исчерпана: уменьшите batch/rank или включите QLoRA.');
    if (stats.forgetting >= 82) addLog('Forgetting score слишком высок: нужен eval, dropout или меньший alpha.');
    if (stats.readiness >= 86 && stats.quality >= 76 && stats.memory < 90 && stats.forgetting < 70) {
      addLog('Победа: адаптер готов к финальной оценке и сохранению.');
      unlockAchievement('lab');
    }
    deal();
  };
  game.querySelector('[data-game-reset]').addEventListener('click', () => {
    Object.assign(stats, { quality: 38, memory: 30, forgetting: 18, readiness: 24, turn: 0 });
    log.innerHTML = '';
    addLog('Запуск LoRA Lab: настройте адаптер без перерасхода памяти и переобучения.');
    renderStats();
    renderMatrix();
    deal();
  });
  game.querySelector('[data-game-reset]').click();
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

function pseudoCheckPython(code) {
  const linesCount = code.split('\n').length;
  const signals = [
    ['LoraConfig', /LoraConfig/.test(code)],
    ['rank/r', /\br\s*=|rank/.test(code)],
    ['target_modules', /target_modules/.test(code)],
    ['Python-синтаксис', /def |from |import |print\(/.test(code)]
  ];
  const found = signals.filter(([, ok]) => ok).map(([name]) => name);
  const missing = signals.filter(([, ok]) => !ok).map(([name]) => name);
  return [
    'Учебная проверка Python-кода выполнена в браузере без backend.',
    'Строк: ' + linesCount + '. Найдено: ' + (found.length ? found.join(', ') : 'нет ключевых элементов') + '.',
    missing.length ? 'Что можно добавить: ' + missing.join(', ') + '.' : 'Структура похожа на LoRA/PEFT-фрагмент.',
    'Для реального обучения запустите код в Python-окружении с transformers, peft и torch.'
  ].join('\n');
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
    const key = `loraCourseCode:${id}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) editor.value = saved;
    enhanceCodeEditor(editor);
    editor.addEventListener('input', () => localStorage.setItem(key, editor.value));
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
  document.querySelectorAll('.code-runner').forEach((runner, index) => {
    const id = runner.dataset.runnerId || `runner-${index}`;
    const editor = runner.querySelector('.code-runner__editor');
    const output = runner.querySelector('.code-runner__output');
    const solution = runner.querySelector('.code-runner__solution');
    const runBtn = runner.querySelector('.code-runner__run');
    const clearBtn = runner.querySelector('.code-runner__clear');
    const solutionBtn = runner.querySelector('.code-runner__solution-btn');
    const copyBtn = runner.querySelector('.code-runner__copy');
    if (!editor || !output) return;
    const key = `loraCourseRunner:${id}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) editor.value = saved;
    enhanceCodeEditor(editor);
    editor.addEventListener('input', () => localStorage.setItem(key, editor.value));
    const runCode = () => {
      output.textContent = pseudoCheckPython(editor.value);
    };
    runBtn?.addEventListener('click', runCode);
    clearBtn?.addEventListener('click', () => {
      editor.value = '';
      output.textContent = 'Вывод появится здесь.';
      localStorage.removeItem(key);
      editor.dispatchEvent(new Event('input'));
      editor.focus();
    });
    solutionBtn?.addEventListener('click', () => {
      if (!solution) return;
      const hidden = solution.hidden;
      solution.hidden = !hidden;
      solutionBtn.textContent = hidden ? 'Скрыть решение' : 'Показать решение';
    });
    copyBtn?.addEventListener('click', async () => {
      const code = solution?.innerText.trim() || '';
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.textContent = 'Скопировано';
        setTimeout(() => { copyBtn.textContent = 'Скопировать решение'; }, 1400);
      } catch {
        const area = document.createElement('textarea');
        area.value = code;
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
    });
  });
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
  initPeterFarmGame();
  initCourseProgress();
  initMiniTests();
  initInlineChecks();
  initCodePractice();
  initCodeRunners();
  renderQuiz();
});
