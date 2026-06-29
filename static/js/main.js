// --- STATE ---
const state = {
  words: [],
  typed: [],
  errors: 0,
  totalChars: 0,
  correctChars: 0,
  startTime: null,
  isRunning: false,
  isFinished: false,
  timeLeft: 15,
  timerInterval: null,
};

let configTime = 15;

// --- DOM ---
const testArea = document.getElementById('testArea');
const resetHint = document.getElementById('resetHint');
const reportBtn = document.getElementById('reportResetBtn');
const timeBtns = document.querySelectorAll('.controls button[data-time]');
const customTimeInput = document.getElementById('customTime');
const report = document.getElementById('report');
const reportWpm = document.getElementById('reportWpm');
const reportAccuracy = document.getElementById('reportAccuracy');
const reportChars = document.getElementById('reportChars');
const reportErrors = document.getElementById('reportErrors');
const reportTime = document.getElementById('reportTime');
const timerDisplay = document.getElementById('timerDisplay');

// --- WORD LIST (Expanded) ---
const WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'was', 'are', 'were', 'been', 'being', 'has', 'had', 'do', 'does',
  'did', 'doing', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'keep', 'let', 'begin', 'seem', 'help', 'talk', 'turn',
  'start', 'show', 'hear', 'play', 'run', 'move', 'like', 'live', 'believe', 'hold',
  'bring', 'write', 'read', 'understand', 'call', 'sit', 'stand', 'find', 'tell', 'ask',
  'work', 'seem', 'feel', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem',
  'help', 'talk', 'turn', 'start', 'show', 'hear', 'play', 'run', 'move', 'like',
  'live', 'believe', 'hold', 'bring', 'write', 'read', 'understand', 'call', 'sit', 'stand',
  'find', 'tell', 'ask', 'work', 'seem', 'feel', 'leave', 'put', 'mean', 'keep',
  'code', 'program', 'python', 'java', 'script', 'web', 'app', 'data', 'api', 'git',
  'linux', 'arch', 'hyprland', 'terminal', 'command', 'bash', 'zsh', 'fish', 'vim', 'neovim',
  'docker', 'cloud', 'server', 'network', 'security', 'privacy', 'open', 'source', 'free', 'software',
  'hardware', 'processor', 'memory', 'storage', 'display', 'keyboard', 'mouse', 'monitor', 'laptop', 'desktop',
  'function', 'variable', 'class', 'object', 'array', 'string', 'integer', 'float', 'boolean', 'method',
  'loop', 'condition', 'statement', 'expression', 'operator', 'syntax', 'error', 'debug', 'test', 'build',
  'extraordinary', 'unbelievable', 'determination', 'environment', 'opportunity', 'responsibility',
  'communication', 'particularly', 'understanding', 'development', 'independent', 'educational',
  'interesting', 'experience', 'knowledge', 'possible', 'important', 'different', 'necessary',
  'beautiful', 'wonderful', 'technology', 'information', 'application', 'performance',
  'programming', 'development', 'javascript', 'framework', 'community', 'documentation',
  'authentication', 'authorization', 'encryption', 'validation', 'optimization',
  'accelerate', 'achieve', 'acquire', 'adapt', 'adjust', 'administer', 'advance', 'analyze', 'apply', 'approach',
  'assemble', 'assess', 'assign', 'assist', 'assume', 'avoid', 'balance', 'become', 'begin', 'build',
  'calculate', 'capture', 'cause', 'change', 'choose', 'complete', 'comply', 'compose', 'compute', 'concentrate',
  'confirm', 'connect', 'consider', 'consist', 'consult', 'continue', 'contribute', 'control', 'convince', 'create'
];

// --- HELPERS ---
function getWords(count = 40) {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getFullText() { return state.words.join(' '); }
function getAllChars() { return getFullText().split(''); }

function calculateWPM(correctChars, seconds) {
  if (seconds === 0 || correctChars === 0) return 0;
  return Math.round((correctChars / 5) / (seconds / 60));
}

function calculateAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function getElapsedSeconds() {
  if (!state.startTime) return 0;
  return (Date.now() - state.startTime) / 1000;
}

function generateMoreWords(count = 20) {
  state.words = state.words.concat(getWords(count));
}

// --- RENDER ---
function render() {
  const fullText = getFullText();
  const chars = fullText.split('');
  const typed = state.typed;
  const charsLength = chars.length;

  if (charsLength - typed.length < 30 && !state.isFinished) {
    generateMoreWords(20);
  }

  const typedLen = typed.length;
  let currentWordIdx = 0;
  let currentCharIdx = 0;
  let cumulative = 0;
  for (let i = 0; i < state.words.length; i++) {
    const wordLen = state.words[i].length;
    if (typedLen <= cumulative + wordLen) {
      currentWordIdx = i;
      currentCharIdx = typedLen - cumulative;
      break;
    }
    cumulative += wordLen + 1;
    if (typedLen === cumulative) {
      currentWordIdx = i + 1;
      currentCharIdx = 0;
      break;
    }
  }
  if (currentWordIdx >= state.words.length) {
    currentWordIdx = state.words.length - 1;
    currentCharIdx = state.words[currentWordIdx].length;
  }

  let html = '';
  let globalIdx = 0;
  for (let w = 0; w < state.words.length; w++) {
    const word = state.words[w];
    const isActive = (w === currentWordIdx);
    html += `<span class="word${isActive ? ' active' : ''}">`;
    for (let c = 0; c < word.length; c++) {
      const char = word[c];
      const typedChar = typed[globalIdx] || null;
      let cls = 'char';
      if (globalIdx < typed.length) {
        if (typedChar === char) cls += ' correct';
        else cls += ' incorrect';
      }
      if (!state.isFinished && isActive && c === currentCharIdx && globalIdx === typed.length) {
        cls += ' cursor';
      }
      html += `<span class="${cls}">${char}</span>`;
      globalIdx++;
    }
    if (w < state.words.length - 1) {
      const spaceIdx = globalIdx;
      let spaceCls = 'char';
      if (spaceIdx < typed.length) {
        const typedChar = typed[spaceIdx];
        if (typedChar === ' ') spaceCls += ' correct';
        else spaceCls += ' incorrect';
      }
      if (!state.isFinished && isActive && globalIdx === typed.length) {
        spaceCls += ' cursor';
      }
      html += `<span class="${spaceCls}"> </span>`;
      globalIdx++;
    }
  }

  if (typed.length > charsLength) {
    const extra = typed.slice(charsLength);
    extra.forEach((char, i) => {
      const isCursor = (i === 0 && !state.isFinished);
      const cls = `char extra${isCursor ? ' cursor' : ''}`;
      html += `<span class="${cls}">${char}</span>`;
    });
  }

  testArea.innerHTML = html;

  const wrapper = testArea.parentElement;
  const wrapperHeight = wrapper.clientHeight;
  const activeWordElem = testArea.querySelector('.word.active');
  if (activeWordElem && !state.isFinished) {
    const wordTop = activeWordElem.offsetTop;
    const wordHeight = activeWordElem.clientHeight;
    const visibleMid = wrapperHeight / 2;
    const targetOffset = wordTop - visibleMid + wordHeight / 2;
    testArea.style.transform = `translateY(-${Math.max(0, targetOffset)}px)`;
  }
}

// --- TIMER ---
function updateTimer() {
  timerDisplay.textContent = state.timeLeft + 's';
  timerDisplay.classList.toggle('warning', state.timeLeft <= 5);
}

// --- GAME LOGIC ---
function startTest() {
  if (state.isRunning) return;
  state.isRunning = true;
  state.startTime = Date.now();
  state.timeLeft = configTime;
  updateTimer();

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimer();
    if (state.timeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  state.isRunning = false;
  state.isFinished = true;
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  render();
  showReport();
}

function showReport() {
  const elapsed = getElapsedSeconds();
  const wpm = calculateWPM(state.correctChars, elapsed);
  const accuracy = calculateAccuracy(state.correctChars, state.totalChars);

  reportWpm.textContent = wpm;
  reportAccuracy.textContent = accuracy + '%';
  reportChars.textContent = state.totalChars;
  reportErrors.textContent = state.errors;
  reportTime.textContent = Math.round(elapsed) + 's';
  report.classList.add('show');
}

function resetTest() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.words = getWords(40);
  state.typed = [];
  state.errors = 0;
  state.totalChars = 0;
  state.correctChars = 0;
  state.startTime = null;
  state.isRunning = false;
  state.isFinished = false;
  state.timeLeft = configTime;
  timerDisplay.classList.remove('warning');
  updateTimer();
  report.classList.remove('show');
  testArea.style.transform = 'translateY(0)';
  render();
}

function setTime(time) {
  configTime = time;
  state.timeLeft = time;
  timeBtns.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.time) === time));
  updateTimer();
  resetTest();
}

// --- INPUT ---
function handleChar(char) {
  if (state.isFinished) return;
  if (!state.isRunning) startTest();

  const chars = getAllChars();
  const expected = chars[state.typed.length] || null;

  state.totalChars++;
  state.typed.push(char);

  if (expected !== null && char === expected) {
    state.correctChars++;
  } else {
    state.errors++;
  }

  if (state.typed.length >= chars.length - 20 && !state.isFinished) {
    generateMoreWords(20);
  }

  render();
}

function handleBackspace() {
  if (state.isFinished || state.typed.length === 0) return;

  const lastChar = state.typed.pop();
  const chars = getAllChars();
  const expected = chars[state.typed.length] || null;

  if (lastChar === expected && expected !== null) {
    state.correctChars--;
  } else if (lastChar !== expected && state.typed.length < chars.length) {
    state.errors--;
  }

  state.totalChars--;
  render();
}

// --- KEYBOARD ---
let tabPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;

  const key = e.key;

  if (key === 'Tab') {
    e.preventDefault();
    tabPressed = true;
    return;
  }

  // Ctrl+Backspace: delete whole word
  if (key === 'Backspace' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    const typed = state.typed;
    if (typed.length === 0) return;
    
    let lastSpaceIndex = -1;
    for (let i = typed.length - 1; i >= 0; i--) {
      if (typed[i] === ' ') {
        lastSpaceIndex = i;
        break;
      }
    }
    
    const charsToRemove = typed.length - (lastSpaceIndex + 1);
    for (let i = 0; i < charsToRemove; i++) {
      handleBackspace();
    }
    render();
    return;
  }

  // Enter only works if Tab was pressed first
  if (key === 'Enter' && tabPressed) {
    e.preventDefault();
    tabPressed = false;
    resetTest();
    return;
  }

  // Prevent Enter alone from resetting
  if (key === 'Enter') {
    e.preventDefault();
    return;
  }

  if (key === 'Backspace') {
    e.preventDefault();
    handleBackspace();
    return;
  }

  if (key.length === 1) {
    if (key === ' ') {
      e.preventDefault();
      handleChar(' ');
      return;
    }
    if (key.match(/[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/)) {
      e.preventDefault();
      handleChar(key);
      return;
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Tab') tabPressed = false;
});

// --- MOBILE SUPPORT ---
const hiddenInput = document.getElementById('hiddenInput');

if (hiddenInput) {
  testArea.addEventListener('touchstart', (e) => {
    e.preventDefault();
    hiddenInput.focus();
    hiddenInput.click();
  });

  testArea.addEventListener('click', () => {
    hiddenInput.focus();
  });

  hiddenInput.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.length > 0) {
      const char = value[value.length - 1];
      if (char === ' ') {
        handleChar(' ');
      } else if (char.match(/[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/)) {
        handleChar(char);
      }
      e.target.value = '';
    }
  });

  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    }
  });

  hiddenInput.addEventListener('focus', () => {
    hiddenInput.setSelectionRange(0, 0);
  });

  testArea.addEventListener('touchstart', () => {
    document.body.focus();
    setTimeout(() => {
      hiddenInput.focus();
    }, 100);
  });
}

// --- EVENTS ---
resetHint.addEventListener('click', resetTest);
reportBtn.addEventListener('click', resetTest);

timeBtns.forEach(btn => {
  btn.addEventListener('click', () => setTime(parseInt(btn.dataset.time)));
});

customTimeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = parseInt(customTimeInput.value);
    if (val > 0 && val <= 3600) {
      setTime(val);
      customTimeInput.value = '';
    }
  }
});

customTimeInput.addEventListener('blur', () => {
  const val = parseInt(customTimeInput.value);
  if (val > 0 && val <= 3600) {
    setTime(val);
    customTimeInput.value = '';
  }
});

testArea.addEventListener('click', () => document.body.focus());

// --- INIT ---
function init() {
  const activeBtn = document.querySelector('.controls button.active');
  if (activeBtn) {
    configTime = parseInt(activeBtn.dataset.time);
    state.timeLeft = configTime;
  }
  
  state.words = getWords(40);
  updateTimer();
  render();
  document.body.setAttribute('tabindex', '0');
  document.body.focus();
}

init();
console.log('⌨️ Keylocity loaded. Start typing!');