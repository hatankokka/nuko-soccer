const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const difficultyButtons = document.querySelector("#difficultyButtons");
const languageLabel = document.querySelector("#languageLabel");
const languageSelect = document.querySelector("#languageSelect");
const startButton = document.querySelector("#startButton");
const scoreLabel = document.querySelector("#scoreLabel");
const timeLabel = document.querySelector("#timeLabel");
const levelLabel = document.querySelector("#levelLabel");
const bestLabel = document.querySelector("#bestLabel");
const progressBar = document.querySelector("#progressBar");

const playerSprite = new Image();
let playerSpriteReady = false;
playerSprite.addEventListener("load", () => {
  playerSpriteReady = true;
});
playerSprite.src = "assets/zukkoke-nuko.png?v=nuko-player-2";

const enemySprite = new Image();
let enemySpriteReady = false;
enemySprite.addEventListener("load", () => {
  enemySpriteReady = true;
});
enemySprite.src = "assets/enemy-cat-sheet.png?v=enemy-cat-1";

const whistleSound = new Audio("assets/whistle.mp3?v=whistle-1");
whistleSound.preload = "auto";
whistleSound.volume = 0.78;

const bgmSound = new Audio("assets/8-bit-aggressive1.mp3?v=bgm-1");
bgmSound.preload = "auto";
bgmSound.loop = false;
bgmSound.volume = 0.42;
const BGM_START_OFFSET = 2;

const W = canvas.width;
const H = canvas.height;
const FIELD_TOP = 104;
const FIELD_BOTTOM = 578;
const GOAL_X = 4300;
const GOAL_MOUTH_X = GOAL_X + 176;
const GOAL_MOUTH_TOP = 270;
const GOAL_MOUTH_BOTTOM = 424;
const GOAL_MISS_X = GOAL_X + 220;
const END_CAMERA_X = GOAL_X - 760;
const AUTO_SCROLL_SPEED = 82;
const ENEMY_FRAME_W = 72;
const ENEMY_FRAME_H = 88;
const ENEMY_FRAME_COUNT = 12;
const CHASER_SPEED_RATIO_BASE = 0.42;
const CHASER_CATCHUP_RATIO = 0.68;
const CHASER_CATCHUP_DISTANCE = 260;
const CHASER_IDLE_ACCEL_DISTANCE = 230;
const CHASER_IDLE_ACCEL_RATE = 0.48;
const CHASER_IDLE_DECAY_RATE = 1.2;
const CHASER_IDLE_MAX_RATIO = 1.12;
const BALL_COLLISION_R = 12;
const GRAZE_DISTANCE = 74;
const SHOT_BONUS_START = 1000;
const SHOT_BONUS_DECAY = 30;
const GRAZE_SCORE_RATE = 8;
const GRAZE_CLOSE_MULTIPLIER = 2;
const DISTANCE_SCORE_MAX = 240;
const TIME_SCORE_RATE = 0.7;
const BONUS_COUNTUP_RATE = 280;

const DIFFICULTIES = {
  easy: {
    id: "easy",
    label: "にゃんたん",
    level: 1,
    scoreMultiplier: 1,
    defenderCount: 12,
    chaserCount: 1,
    enemySpeedMultiplier: 0.98,
    keeperSpeed: 1.8,
    scrollSpeedBonus: 6,
    playerSpeedBonus: 0,
  },
  normal: {
    id: "normal",
    label: "ふつにゃん",
    level: 2,
    scoreMultiplier: 1.5,
    defenderCount: 14,
    chaserCount: 1,
    enemySpeedMultiplier: 1,
    keeperSpeed: 2.05,
    scrollSpeedBonus: 10,
    playerSpeedBonus: 8,
  },
  hard: {
    id: "hard",
    label: "むずにゃしい",
    level: 3,
    scoreMultiplier: 2,
    defenderCount: 18,
    chaserCount: 2,
    enemySpeedMultiplier: 1.12,
    keeperSpeed: 2.45,
    scrollSpeedBonus: 20,
    playerSpeedBonus: 16,
  },
};

const LANGUAGE_OPTIONS = [
  ["ja", "日本語"],
  ["en", "English"],
  ["zh-Hans", "简体中文"],
  ["zh-Hant", "繁體中文"],
  ["ko", "한국어"],
  ["fr", "Français"],
  ["es", "Español"],
  ["pt", "Português"],
  ["th", "ไทย"],
  ["id", "Indonesia"],
  ["vi", "Tiếng Việt"],
];

const I18N = {
  ja: {
    htmlLang: "ja",
    title: "ずっこけぬこサッカー",
    languageLabel: "表示言語",
    menuPrompt: "好きなレベルを選んでスタート",
    score: "スコア",
    time: "タイム",
    best: "ベスト",
    level: "レベル",
    start: "スタート",
    goal: "ゴール",
    startReady: "スタート！",
    shoot: "シュート！",
    shootHint: "スマホ: ダブルタップ\nPC: ダブルクリックでシュート！",
    shotBonus: "シュートボーナス",
    adding: "加算中",
    resultScore: "あなたのスコア：{score}点",
    scoreMultiplier: "スコア x{mult}",
    grazePopup: "かすり +{rate}/秒",
    failTitle: "GAME Oニャー",
    savedText: "にゃんてこった...キーパー猫に止められたニャ",
    missText: "にゃんてこった...シュートが外れたニャ",
    tackledText: "にゃんてこった...ボールを取られたニャ",
    goalTitle: "ゴール！",
    goalText: "やったニャ！シュートボーナス +{bonus}",
    difficulty: { easy: "にゃんたん", normal: "ふつにゃん", hard: "むずにゃしい" },
  },
  en: {
    htmlLang: "en",
    title: "Zukkoke Nuko Soccer",
    languageLabel: "Language",
    menuPrompt: "Pick a level and kick off",
    score: "Score",
    time: "Time",
    best: "Best",
    level: "Level",
    start: "Start",
    goal: "Goal",
    startReady: "Kickoff!",
    shoot: "Shoot!",
    shootHint: "Mobile: double-tap\nPC: double-click to shoot!",
    shotBonus: "Shot bonus",
    adding: "Adding",
    resultScore: "Your score: {score} pts",
    scoreMultiplier: "Score x{mult}",
    grazePopup: "Whisker +{rate}/sec",
    failTitle: "GAME MEOW-VER",
    savedText: "Paw no... the goalie cat blocked it!",
    missText: "Paw no... the shot went wide!",
    tackledText: "Paw no... the ball got swiped!",
    goalTitle: "Goal!",
    goalText: "Purrfect! Shot bonus +{bonus}",
    difficulty: { easy: "Easy Paws", normal: "Normal Nuko", hard: "Claw Hard" },
  },
  "zh-Hans": {
    htmlLang: "zh-Hans",
    title: "摔跤猫猫足球",
    languageLabel: "显示语言",
    menuPrompt: "选择难度，开喵！",
    score: "得分",
    time: "时间",
    best: "最佳",
    level: "难度",
    start: "起点",
    goal: "球门",
    startReady: "开喵！",
    shoot: "射门！",
    shootHint: "手机：双击屏幕\n电脑：双击鼠标射门！",
    shotBonus: "射门奖励",
    adding: "加分中",
    resultScore: "你的得分：{score}分",
    scoreMultiplier: "得分 x{mult}",
    grazePopup: "擦身 +{rate}/秒",
    failTitle: "游戏结束喵",
    savedText: "喵了个糟...被守门猫扑住了喵",
    missText: "喵了个糟...射偏了喵",
    tackledText: "喵了个糟...球被抢走了喵",
    goalTitle: "进球！",
    goalText: "喵得漂亮！射门奖励 +{bonus}",
    difficulty: { easy: "喵简单", normal: "普通喵", hard: "喵困难" },
  },
  "zh-Hant": {
    htmlLang: "zh-Hant",
    title: "跌倒貓貓足球",
    languageLabel: "顯示語言",
    menuPrompt: "選擇難度，開喵！",
    score: "分數",
    time: "時間",
    best: "最佳",
    level: "難度",
    start: "起點",
    goal: "球門",
    startReady: "開喵！",
    shoot: "射門！",
    shootHint: "手機：雙點螢幕\nPC：雙擊滑鼠射門！",
    shotBonus: "射門獎勵",
    adding: "加分中",
    resultScore: "你的分數：{score}分",
    scoreMultiplier: "分數 x{mult}",
    grazePopup: "擦身 +{rate}/秒",
    failTitle: "遊戲結束喵",
    savedText: "喵了個糟...被守門貓擋住了喵",
    missText: "喵了個糟...射偏了喵",
    tackledText: "喵了個糟...球被搶走了喵",
    goalTitle: "進球！",
    goalText: "喵得漂亮！射門獎勵 +{bonus}",
    difficulty: { easy: "喵簡單", normal: "普通喵", hard: "喵困難" },
  },
  ko: {
    htmlLang: "ko",
    title: "넘어지는 냥이 축구",
    languageLabel: "표시 언어",
    menuPrompt: "난이도를 고르고 시작하라냥",
    score: "점수",
    time: "시간",
    best: "최고",
    level: "난이도",
    start: "시작",
    goal: "골",
    startReady: "시작한다냥!",
    shoot: "슛!",
    shootHint: "모바일: 더블탭\nPC: 더블클릭으로 슛!",
    shotBonus: "슛 보너스",
    adding: "가산 중",
    resultScore: "당신의 점수: {score}점",
    scoreMultiplier: "점수 x{mult}",
    grazePopup: "스침 +{rate}/초",
    failTitle: "게임 오냥",
    savedText: "아이고냥... 골키퍼 고양이에게 막혔다냥",
    missText: "아이고냥... 슛이 빗나갔다냥",
    tackledText: "아이고냥... 공을 빼앗겼다냥",
    goalTitle: "골!",
    goalText: "잘했다냥! 슛 보너스 +{bonus}",
    difficulty: { easy: "냥쉬움", normal: "보통냥", hard: "어렵냥" },
  },
  fr: {
    htmlLang: "fr",
    title: "Football Zukkoke Nuko",
    languageLabel: "Langue",
    menuPrompt: "Choisis un niveau et miaou, c'est parti",
    score: "Score",
    time: "Temps",
    best: "Record",
    level: "Niveau",
    start: "Départ",
    goal: "But",
    startReady: "Départ !",
    shoot: "Tir !",
    shootHint: "Mobile : double-tap\nPC : double-clic pour tirer !",
    shotBonus: "Bonus de tir",
    adding: "Ajout",
    resultScore: "Ton score : {score} pts",
    scoreMultiplier: "Score x{mult}",
    grazePopup: "Frôlé +{rate}/s",
    failTitle: "GAME MIAOU-VER",
    savedText: "Miaoups... le chat gardien l'a arrêté",
    missText: "Miaoups... le tir est passé à côté",
    tackledText: "Miaoups... on t'a chipé le ballon",
    goalTitle: "But !",
    goalText: "Miaourveilleux ! Bonus de tir +{bonus}",
    difficulty: { easy: "Miaou facile", normal: "Normal miaou", hard: "Miaou dur" },
  },
  es: {
    htmlLang: "es",
    title: "Fútbol Zukkoke Nuko",
    languageLabel: "Idioma",
    menuPrompt: "Elige nivel y empieza a maullar",
    score: "Puntos",
    time: "Tiempo",
    best: "Récord",
    level: "Nivel",
    start: "Inicio",
    goal: "Meta",
    startReady: "¡Empieza!",
    shoot: "¡Tira!",
    shootHint: "Móvil: doble toque\nPC: doble clic para tirar",
    shotBonus: "Bono de tiro",
    adding: "Sumando",
    resultScore: "Tu puntuación: {score} pts",
    scoreMultiplier: "Puntos x{mult}",
    grazePopup: "Roce +{rate}/s",
    failTitle: "GAME MIAU-VER",
    savedText: "¡Miau-dición!... el gato portero la paró",
    missText: "¡Miau-dición!... el tiro se fue fuera",
    tackledText: "¡Miau-dición!... te quitaron el balón",
    goalTitle: "¡Gol!",
    goalText: "¡Miau-nífico! Bono de tiro +{bonus}",
    difficulty: { easy: "Miau fácil", normal: "Normal miau", hard: "Miau difícil" },
  },
  pt: {
    htmlLang: "pt",
    title: "Futebol Zukkoke Nuko",
    languageLabel: "Idioma",
    menuPrompt: "Escolha o nível e miaurque a saída",
    score: "Pontos",
    time: "Tempo",
    best: "Recorde",
    level: "Nível",
    start: "Início",
    goal: "Gol",
    startReady: "Começou!",
    shoot: "Chute!",
    shootHint: "Celular: toque duplo\nPC: duplo clique para chutar",
    shotBonus: "Bônus de chute",
    adding: "Somando",
    resultScore: "Sua pontuação: {score} pts",
    scoreMultiplier: "Pontos x{mult}",
    grazePopup: "Raspou +{rate}/s",
    failTitle: "GAME MIAU-VER",
    savedText: "Miau céus... o goleiro gato defendeu",
    missText: "Miau céus... o chute foi para fora",
    tackledText: "Miau céus... roubaram a bola",
    goalTitle: "Gol!",
    goalText: "Miauavilha! Bônus de chute +{bonus}",
    difficulty: { easy: "Miau fácil", normal: "Normal miau", hard: "Miau difícil" },
  },
  th: {
    htmlLang: "th",
    title: "ฟุตบอลแมวล้มลุก",
    languageLabel: "ภาษา",
    menuPrompt: "เลือกระดับแล้วเริ่มเหมียว",
    score: "คะแนน",
    time: "เวลา",
    best: "ดีที่สุด",
    level: "ระดับ",
    start: "เริ่ม",
    goal: "ประตู",
    startReady: "เริ่มเหมียว!",
    shoot: "ยิง!",
    shootHint: "มือถือ: แตะสองครั้ง\nPC: ดับเบิลคลิกเพื่อยิง!",
    shotBonus: "โบนัสยิง",
    adding: "กำลังบวก",
    resultScore: "คะแนนของคุณ: {score}",
    scoreMultiplier: "คะแนน x{mult}",
    grazePopup: "เฉียด +{rate}/วิ",
    failTitle: "เกมโอเหมียว",
    savedText: "เหมียวแย่แล้ว...โดนแมวโกล์เซฟไว้",
    missText: "เหมียวแย่แล้ว...ยิงออกไปแล้ว",
    tackledText: "เหมียวแย่แล้ว...โดนแย่งบอลแล้ว",
    goalTitle: "โกล!",
    goalText: "เหมียวสุดยอด! โบนัสยิง +{bonus}",
    difficulty: { easy: "เหมียวง่าย", normal: "เหมียวกลาง", hard: "เหมียวยาก" },
  },
  id: {
    htmlLang: "id",
    title: "Sepak Bola Kucing Tersandung",
    languageLabel: "Bahasa",
    menuPrompt: "Pilih level lalu mulai meong",
    score: "Skor",
    time: "Waktu",
    best: "Terbaik",
    level: "Level",
    start: "Mulai",
    goal: "Gawang",
    startReady: "Mulai!",
    shoot: "Tembak!",
    shootHint: "HP: ketuk dua kali\nPC: klik ganda untuk menembak!",
    shotBonus: "Bonus tembakan",
    adding: "Menambah",
    resultScore: "Skor kamu: {score} poin",
    scoreMultiplier: "Skor x{mult}",
    grazePopup: "Nyaris +{rate}/dtk",
    failTitle: "GAME MEONG-VER",
    savedText: "Aduh meong... ditepis kucing kiper",
    missText: "Aduh meong... tembakannya meleset",
    tackledText: "Aduh meong... bolanya direbut",
    goalTitle: "Gol!",
    goalText: "Meong mantap! Bonus tembakan +{bonus}",
    difficulty: { easy: "Meong mudah", normal: "Meong biasa", hard: "Meong sulit" },
  },
  vi: {
    htmlLang: "vi",
    title: "Bóng đá Zukkoke Nuko",
    languageLabel: "Ngôn ngữ",
    menuPrompt: "Chọn độ khó rồi bắt đầu meo",
    score: "Điểm",
    time: "Thời gian",
    best: "Kỷ lục",
    level: "Độ khó",
    start: "Bắt đầu",
    goal: "Khung thành",
    startReady: "Bắt đầu!",
    shoot: "Sút!",
    shootHint: "Điện thoại: chạm đúp\nPC: nhấp đúp để sút!",
    shotBonus: "Thưởng sút",
    adding: "Đang cộng",
    resultScore: "Điểm của bạn: {score}",
    scoreMultiplier: "Điểm x{mult}",
    grazePopup: "Lướt sát +{rate}/giây",
    failTitle: "GAME MÈO-VER",
    savedText: "Ôi mèo ơi... mèo thủ môn đã cản phá",
    missText: "Ôi mèo ơi... cú sút đi chệch rồi",
    tackledText: "Ôi mèo ơi... bị cướp bóng rồi",
    goalTitle: "Vào!",
    goalText: "Mèo tuyệt! Thưởng sút +{bonus}",
    difficulty: { easy: "Dễ mèo", normal: "Thường mèo", hard: "Khó mèo" },
  },
};

function storageGet(key, fallback = "") {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Streamlit iframeなど保存領域が使えない環境では、保存だけスキップする。
  }
}

const savedLanguage = storageGet("zukkokeNukoLanguage");
const defaultLanguage = I18N[savedLanguage] ? savedLanguage : "ja";

const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  shoot: false,
};

const pointerInput = {
  active: false,
  type: "",
  id: null,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  lastTapAt: 0,
  lastTapX: 0,
  lastTapY: 0,
};

const game = {
  state: "ready",
  language: defaultLanguage,
  level: DIFFICULTIES.normal.level,
  difficultyId: "normal",
  scoreMultiplier: DIFFICULTIES.normal.scoreMultiplier,
  best: Number(storageGet("dribbleDashBest", "0") || 0),
  time: 0,
  score: 0,
  distanceScore: 0,
  shotBonus: 0,
  grazeBonus: 0,
  availableShotBonus: 0,
  shotBonusActive: false,
  shotBonusTick: 0,
  awardedShotBonus: 0,
  baseScoreAtGoal: 0,
  bonusAddRemaining: 0,
  resultState: "",
  resultScore: 0,
  goalWhistlePlayed: false,
  messageTimer: 0,
  cameraX: 0,
  player: null,
  ball: null,
  defenders: [],
  particles: [],
  popups: [],
  keeper: null,
  playerInputActive: false,
  lastTs: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function currentDifficulty() {
  return DIFFICULTIES[game.difficultyId] || DIFFICULTIES.normal;
}

function difficultyById(id) {
  return DIFFICULTIES[id] || DIFFICULTIES.normal;
}

function formatMultiplier(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function playWhistle() {
  whistleSound.pause();
  whistleSound.currentTime = 0;
  const playRequest = whistleSound.play();
  if (playRequest && typeof playRequest.catch === "function") {
    playRequest.catch(() => {});
  }
}

function playBgm() {
  if (!bgmSound.paused) return;
  bgmSound.currentTime = BGM_START_OFFSET;
  const playRequest = bgmSound.play();
  if (playRequest && typeof playRequest.catch === "function") {
    playRequest.catch(() => {});
  }
}

function stopBgm() {
  bgmSound.pause();
  bgmSound.currentTime = 0;
}

function restartBgm() {
  stopBgm();
  playBgm();
}

bgmSound.addEventListener("ended", () => {
  playBgm();
});

const UI_FONT_STACK = "'Segoe UI', 'Yu Gothic', Meiryo, Arial, sans-serif";

function setUiFont(size, weight = "bold") {
  ctx.font = `${weight} ${size}px ${UI_FONT_STACK}`;
}

function fitFontSize(text, maxWidth, baseSize, minSize = 10, weight = "bold") {
  let size = baseSize;
  setUiFont(size, weight);
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    setUiFont(size, weight);
  }
  return size;
}

function fillFittedText(text, x, y, maxWidth, baseSize, minSize = 10, weight = "bold") {
  fitFontSize(text, maxWidth, baseSize, minSize, weight);
  ctx.fillText(text, x, y);
}

function strokeAndFillFittedText(text, x, y, maxWidth, baseSize, minSize = 18, weight = "bold") {
  fitFontSize(text, maxWidth, baseSize, minSize, weight);
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function currentText() {
  return I18N[game.language] || I18N.ja;
}

function formatText(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (values[key] ?? ""));
}

function t(key, values = {}) {
  const strings = currentText();
  const template = strings[key] ?? I18N.ja[key] ?? "";
  return formatText(template, values);
}

function difficultyLabel(id = game.difficultyId) {
  const strings = currentText();
  return strings.difficulty?.[id] || I18N.ja.difficulty[id] || id;
}

function updateDifficultyButtons() {
  document.querySelectorAll("[data-difficulty]").forEach((button) => {
    const id = button.dataset.difficulty;
    const difficulty = difficultyById(id);
    const name = button.querySelector(".difficulty-name");
    const score = button.querySelector(".difficulty-score");
    if (name) name.textContent = difficultyLabel(id);
    if (score) score.textContent = t("scoreMultiplier", { mult: formatMultiplier(difficulty.scoreMultiplier) });
  });
}

function applyLanguageToDocument() {
  const strings = currentText();
  document.documentElement.lang = strings.htmlLang;
  document.title = strings.title;
  const panel = document.querySelector(".game-panel");
  if (panel) panel.setAttribute("aria-label", strings.title);
  const title = document.querySelector("h1");
  if (title) title.textContent = strings.title;
  if (languageLabel) languageLabel.textContent = "Language";
  if (languageSelect) languageSelect.setAttribute("aria-label", "Language");
  if (startButton) startButton.textContent = t("start");
  updateDifficultyButtons();
}

function setupLanguageSelect() {
  if (!languageSelect) return;
  languageSelect.innerHTML = "";
  for (const [id, label] of LANGUAGE_OPTIONS) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    languageSelect.append(option);
  }
  languageSelect.value = game.language;
}

function setOverlayMessage(text) {
  overlayText.className = "";
  overlayText.textContent = text;
  overlayText.hidden = !text;
}

function setResultMessage(scoreText, reasonText) {
  overlayText.className = "result-copy";
  overlayText.textContent = "";

  const scoreLine = document.createElement("span");
  scoreLine.className = "result-score-line";
  scoreLine.textContent = scoreText;
  overlayText.append(scoreLine);

  if (reasonText) {
    const reasonLine = document.createElement("span");
    reasonLine.className = "result-reason-line";
    reasonLine.textContent = reasonText;
    overlayText.append(reasonLine);
  }

  overlayText.hidden = false;
}

function showResultOverlay() {
  const state = game.resultState;
  const finalScore = game.resultScore;
  const title = state === "goal" ? t("goalTitle") : t("failTitle");
  const reasonByState = {
    goal: t("goalText", { bonus: game.awardedShotBonus }),
    saved: t("savedText"),
    miss: t("missText"),
    tackled: t("tackledText"),
  };
  const reason = reasonByState[state] || "";
  overlayTitle.textContent = title;
  setResultMessage(t("resultScore", { score: finalScore }), reason);
  startButton.hidden = true;
  if (difficultyButtons) difficultyButtons.hidden = false;
  overlay.hidden = false;
}

function setLanguage(language) {
  if (!I18N[language]) return;
  game.language = language;
  storageSet("zukkokeNukoLanguage", language);
  if (languageSelect) languageSelect.value = language;
  applyLanguageToDocument();
  updateUi();
  if (!overlay.hidden) {
    if (isWaitingState() && game.resultState) showResultOverlay();
    else if (game.state === "ready") showDifficultyOverlay();
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function expandedRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2,
  };
}

function segmentRectOverlap(x1, y1, x2, y2, rect) {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  function clip(p, q) {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  }

  return (
    clip(-dx, x1 - rect.x) &&
    clip(dx, rect.x + rect.w - x1) &&
    clip(-dy, y1 - rect.y) &&
    clip(dy, rect.y + rect.h - y1)
  );
}

function circleRectOverlap(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function enemyBallHitbox(d) {
  if (d.type === "slider") return { x: d.x - 25, y: d.y + 16, w: 52, h: 24 };
  if (d.type === "chaser") return { x: d.x - 19, y: d.y + 2, w: 38, h: 48 };
  return { x: d.x - 17, y: d.y + 5, w: 34, h: 43 };
}

function keeperHitbox() {
  const k = game.keeper;
  return {
    x: k.x - 18,
    y: k.y - 2,
    w: 76,
    h: 82,
  };
}

function playerGrazePoint() {
  return {
    x: game.player.x + 34,
    y: game.player.y + 34,
  };
}

function enemyCenter(d) {
  const box = enemyBallHitbox(d);
  return {
    x: box.x + box.w / 2,
    y: box.y + box.h / 2,
  };
}

function makePlayer() {
  return {
    x: 120,
    y: 340,
    w: 72,
    h: 62,
    speed: 235,
    invuln: 0,
    vx: 0,
    vy: 0,
    facing: 1,
  };
}

function makeBall(player) {
  return {
    x: player.x + 72,
    y: player.y + 50,
    r: 10,
    state: "dribble",
    vx: 0,
    vy: 0,
    targetX: GOAL_X + 74,
    targetY: 340,
  };
}

function makeDefenders(level, difficulty = currentDifficulty()) {
  const rand = Math.random;
  const defenders = [];
  const lanes = [152, 214, 276, 338, 400, 462, 524];
  const count = difficulty.defenderCount;
  const startX = 540;
  const endX = GOAL_X - 470;
  const step = (endX - startX) / count;
  const types = ["patrolV", "patrolH", "diagonal", "slider"];
  let previousLane = -1;

  for (let i = 0; i < count; i += 1) {
    const type = types[Math.floor(rand() * types.length)];
    let laneIndex = Math.floor(rand() * lanes.length);
    if (laneIndex === previousLane) laneIndex = (laneIndex + 2 + Math.floor(rand() * 3)) % lanes.length;
    previousLane = laneIndex;

    const baseY = lanes[laneIndex] + (rand() - 0.5) * 18;
    const baseX = startX + i * step + rand() * step * 0.85;
    defenders.push({
      baseX,
      baseY,
      type,
      phase: rand() * Math.PI * 2,
      speed: (0.85 + rand() * 0.8 + level * 0.08) * difficulty.enemySpeedMultiplier,
      ampX: 28 + rand() * 65 + level * 6,
      ampY: 30 + rand() * 58,
      w: type === "slider" ? 48 : 34,
      h: type === "slider" ? 26 : 48,
      frameRate: 7 + rand() * 7,
      visualScale: 0.88 + rand() * 0.24,
      wanderX: 0,
      wanderY: 0,
      wanderTargetX: (rand() - 0.5) * 34,
      wanderTargetY: (rand() - 0.5) * 28,
      wanderTimer: rand() * 1.1,
      wanderInterval: 0.55 + rand() * 1.2,
      wanderAmpX: 20 + rand() * 32,
      wanderAmpY: 16 + rand() * 26,
      wanderSpeed: 2.2 + rand() * 2.4,
      x: baseX,
      y: baseY,
    });
  }

  const chaserCount = difficulty.chaserCount;
  const chaserStart = 880;
  const chaserEnd = GOAL_X - 620;
  const chaserStep = (chaserEnd - chaserStart) / chaserCount;
  for (let i = 0; i < chaserCount; i += 1) {
    const baseX = chaserStart + i * chaserStep + rand() * chaserStep * 0.75;
    const baseY = lanes[Math.floor(rand() * lanes.length)] + (rand() - 0.5) * 24;
    defenders.push({
      baseX,
      baseY,
      type: "chaser",
      phase: rand() * Math.PI * 2,
      speed: CHASER_SPEED_RATIO_BASE,
      ampX: 0,
      ampY: 18,
      w: 38,
      h: 48,
      frameRate: 9 + rand() * 5,
      visualScale: 0.95 + rand() * 0.18,
      x: baseX,
      y: baseY,
      active: true,
      idleChaseBoost: 0,
      grazeCooldown: 0,
    });
  }

  return defenders;
}

function reset(difficultyId = game.difficultyId) {
  const difficulty = difficultyById(difficultyId);
  game.state = "countdown";
  game.difficultyId = difficulty.id;
  game.level = difficulty.level;
  game.scoreMultiplier = difficulty.scoreMultiplier;
  pointerInput.active = false;
  pointerInput.id = null;
  game.time = 0;
  game.score = 0;
  game.distanceScore = 0;
  game.shotBonus = 0;
  game.grazeBonus = 0;
  game.availableShotBonus = 0;
  game.shotBonusActive = false;
  game.shotBonusTick = 0;
  game.awardedShotBonus = 0;
  game.baseScoreAtGoal = 0;
  game.bonusAddRemaining = 0;
  game.resultState = "";
  game.resultScore = 0;
  game.goalWhistlePlayed = false;
  game.playerInputActive = false;
  game.messageTimer = 1.1;
  game.cameraX = 0;
  game.player = makePlayer();
  game.ball = makeBall(game.player);
  game.defenders = makeDefenders(game.level, difficulty);
  game.particles = [];
  game.popups = [];
  game.keeper = {
    x: GOAL_X + 40,
    y: 306,
    w: 38,
    h: 78,
    speed: difficulty.keeperSpeed,
    phase: 0,
  };
  overlay.hidden = true;
  restartBgm();
  playWhistle();
  updateUi();
}

function showOverlay(title, text, buttonText = t("start")) {
  overlayTitle.textContent = title;
  setOverlayMessage(text);
  startButton.textContent = buttonText;
  startButton.hidden = false;
  if (difficultyButtons) difficultyButtons.hidden = true;
  overlay.hidden = false;
}

function showDifficultyOverlay(title = t("title"), text = t("menuPrompt")) {
  overlayTitle.textContent = title;
  setOverlayMessage(text);
  startButton.hidden = true;
  if (difficultyButtons) difficultyButtons.hidden = false;
  overlay.hidden = false;
}

function setFinalState(state) {
  game.state = state;
  pointerInput.active = false;
  pointerInput.id = null;
  if (state !== "goal" || !game.goalWhistlePlayed) {
    playWhistle();
  }
  let finalScore = Math.floor(game.score);
  if (state === "goal") {
    game.best = Math.max(game.best, finalScore);
    storageSet("dribbleDashBest", game.best);
  } else {
    finalScore = 0;
    game.score = 0;
  }
  game.resultState = state;
  game.resultScore = finalScore;
  showResultOverlay();
  updateUi();
}

function nextLevel() {
  reset(game.difficultyId);
}

function isWaitingState() {
  return game.state === "ready" || game.state === "goal" || game.state === "miss" || game.state === "saved" || game.state === "tackled";
}

function shootOrAdvance() {
  if (isWaitingState()) return;
  shoot();
}

function updateUi() {
  if (scoreLabel) scoreLabel.textContent = `${t("score")} ${Math.floor(game.score)}`;
  if (timeLabel) timeLabel.textContent = `${t("time")} ${game.time.toFixed(1)}`;
  if (levelLabel) levelLabel.textContent = `${t("level")} ${difficultyLabel()}`;
  if (bestLabel) bestLabel.textContent = `${t("best")} ${game.best}`;
  const progress = clamp(game.cameraX / END_CAMERA_X, 0, 1);
  if (progressBar) progressBar.style.width = `${progress * 100}%`;
}

function normalizeInput() {
  const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  const keyLen = Math.hypot(dx, dy);
  if (keyLen > 0) return { x: dx / keyLen, y: dy / keyLen };

  if (pointerInput.active && game.player) {
    let px;
    let py;
    if (pointerInput.type === "mouse") {
      px = pointerInput.x - (game.player.x - game.cameraX + game.player.w / 2);
      py = pointerInput.y - (game.player.y + game.player.h / 2);
    } else {
      px = pointerInput.x - pointerInput.startX;
      py = pointerInput.y - pointerInput.startY;
    }
    const pointerLen = Math.hypot(px, py);
    if (pointerLen > 18) return { x: px / pointerLen, y: py / pointerLen };
  }

  return { x: 0, y: 0 };
}

function updatePlayer(dt, scrollDx = 0) {
  const p = game.player;
  const input = normalizeInput();
  game.playerInputActive = Math.hypot(input.x, input.y) > 0.05;
  const baseSpeed = p.speed + currentDifficulty().playerSpeedBonus;
  const minX = game.cameraX + 42;
  const maxX = game.cameraX + W - 150;
  const goalStop = GOAL_X + 10;

  p.vx = input.x * baseSpeed;
  p.vy = input.y * baseSpeed;
  p.x += scrollDx + p.vx * dt;
  p.y += p.vy * dt;
  p.x = clamp(p.x, minX, Math.min(maxX, goalStop));
  p.y = clamp(p.y, FIELD_TOP + 28, FIELD_BOTTOM - 62);
  p.facing = input.x < -0.1 ? -1 : 1;
  p.invuln = Math.max(0, p.invuln - dt);

  if (game.ball.state === "dribble") {
    const ballOffsetX = p.facing < 0 ? -4 : 74;
    game.ball.x = p.x + ballOffsetX;
    game.ball.y = p.y + 50 + Math.sin(game.time * 18) * 2.5;
  }

  if (p.x >= GOAL_X - 330 && game.ball.state === "dribble") {
    if (keys.shoot) shoot();
  }
}

function updateAutoScroll(dt) {
  const speed = AUTO_SCROLL_SPEED + currentDifficulty().scrollSpeedBonus;
  const previousCameraX = game.cameraX;
  game.cameraX = clamp(game.cameraX + speed * dt, 0, END_CAMERA_X);
  return game.cameraX - previousCameraX;
}

function isGoalVisible() {
  return GOAL_X - game.cameraX < W - 60;
}

function updateShotBonus(dt) {
  if (!game.shotBonusActive && isGoalVisible()) {
    game.shotBonusActive = true;
    game.availableShotBonus = SHOT_BONUS_START;
    game.shotBonusTick = 0;
  }

  if (!game.shotBonusActive || game.state !== "playing") return;

  game.shotBonusTick += dt;
  while (game.shotBonusTick >= 1) {
    game.availableShotBonus = Math.max(0, game.availableShotBonus - SHOT_BONUS_DECAY);
    game.shotBonusTick -= 1;
  }
}

function retargetDefenderWander(d) {
  const sliderScale = d.type === "slider" ? 0.62 : 1;
  d.wanderTargetX = (Math.random() - 0.5) * d.wanderAmpX * sliderScale;
  d.wanderTargetY = (Math.random() - 0.5) * d.wanderAmpY;
  d.wanderTimer = d.wanderInterval * (0.65 + Math.random() * 0.7);
}

function updateDefenderWander(d, dt) {
  d.wanderTimer -= dt;
  if (d.wanderTimer <= 0) {
    d.wanderInterval = 0.45 + Math.random() * 1.15;
    retargetDefenderWander(d);
  }

  const follow = 1 - Math.exp(-d.wanderSpeed * dt);
  d.wanderX = lerp(d.wanderX, d.wanderTargetX, follow);
  d.wanderY = lerp(d.wanderY, d.wanderTargetY, follow);
}

function chaserSpeedRatio(d, ball) {
  const behindDistance = ball.x - d.x;
  const catchup = clamp((behindDistance - 42) / CHASER_CATCHUP_DISTANCE, 0, 1);
  const baseRatio = lerp(d.speed, CHASER_CATCHUP_RATIO, catchup);
  return lerp(baseRatio, CHASER_IDLE_MAX_RATIO, d.idleChaseBoost || 0);
}

function updateChaserIdleBoost(d, ball, distance, dt) {
  if (game.state !== "playing") {
    d.idleChaseBoost = 0;
    return;
  }

  if (game.playerInputActive) {
    d.idleChaseBoost = 0;
    return;
  }

  const near = clamp(1 - distance / CHASER_IDLE_ACCEL_DISTANCE, 0, 1);
  if (near <= 0 || ball.x < d.x - 24) {
    d.idleChaseBoost = Math.max(0, (d.idleChaseBoost || 0) - CHASER_IDLE_DECAY_RATE * dt);
    return;
  }

  const accel = CHASER_IDLE_ACCEL_RATE * lerp(0.65, 1.35, near);
  d.idleChaseBoost = clamp((d.idleChaseBoost || 0) + accel * dt, 0, 1);
}

function updateDefenders(dt) {
  for (const d of game.defenders) {
    const t = game.time * d.speed + d.phase;
    d.grazeCooldown = Math.max(0, (d.grazeCooldown || 0) - dt);
    if (d.type === "chaser") {
      const b = game.ball;
      if (game.ball.state === "dribble") {
        const dx = b.x - d.x;
        const dy = b.y - d.y;
        const len = Math.hypot(dx, dy) || 1;
        updateChaserIdleBoost(d, b, len, dt);
        const playerSpeed = game.player.speed + currentDifficulty().playerSpeedBonus;
        const chaseSpeed = playerSpeed * chaserSpeedRatio(d, b);
        const step = Math.min(len, chaseSpeed * dt);
        d.x += (dx / len) * step;
        d.y += (dy / len) * step;
      } else {
        d.y = d.baseY + Math.sin(t * 1.4) * d.ampY;
      }
    } else {
      updateDefenderWander(d, dt);

      if (d.type === "patrolV") {
        d.x = d.baseX;
        d.y = d.baseY + Math.sin(t) * d.ampY;
      } else if (d.type === "patrolH") {
        d.x = d.baseX + Math.sin(t) * d.ampX;
        d.y = d.baseY;
      } else if (d.type === "diagonal") {
        d.x = d.baseX + Math.sin(t) * d.ampX;
        d.y = d.baseY + Math.cos(t * 0.9) * d.ampY;
      } else {
        const sweep = ((t * 0.42) % 1 + 1) % 1;
        const ease = sweep < 0.5 ? sweep * 2 : 2 - sweep * 2;
        d.x = d.baseX + (ease - 0.5) * d.ampX * 2.4;
        d.y = d.baseY + Math.sin(t * 1.7) * 10;
      }

      d.x += d.wanderX;
      d.y += d.wanderY;
    }
    d.y = clamp(d.y, FIELD_TOP + 20, FIELD_BOTTOM - 56);
  }
}

function updateKeeper() {
  const k = game.keeper;
  const t = game.time * k.speed + k.phase;
  k.y = 304 + Math.sin(t) * 116;
  k.y = clamp(k.y, FIELD_TOP + 88, FIELD_BOTTOM - 112);
}

function updateShot(dt) {
  const b = game.ball;
  if (b.state !== "shot") return;

  const prevX = b.x;
  const prevY = b.y;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.vx += 24 * dt;

  const ballCircle = { x: b.x, y: b.y, r: b.r };
  const keeperBox = keeperHitbox();
  const keeperSweepBox = expandedRect(keeperBox, b.r);

  if (circleRectOverlap(ballCircle, keeperBox) || segmentRectOverlap(prevX, prevY, b.x, b.y, keeperSweepBox)) {
    spawnBurst(b.x, b.y, "#54d7ff", 18);
    setFinalState("saved");
    return;
  }

  const crossedGoalLine = b.x - b.r >= GOAL_MOUTH_X;
  const ballInsideGoalHeight = b.y >= GOAL_MOUTH_TOP && b.y <= GOAL_MOUTH_BOTTOM;
  const ballPastGoal = b.x - b.r >= GOAL_MISS_X;
  const ballOutOfField = b.y + b.r < FIELD_TOP || b.y - b.r > FIELD_BOTTOM;

  if (crossedGoalLine && ballInsideGoalHeight) {
    game.awardedShotBonus = Math.floor((game.shotBonusActive ? game.availableShotBonus : SHOT_BONUS_START) * game.scoreMultiplier);
    game.baseScoreAtGoal = calculateGoalBaseScore();
    game.score = game.baseScoreAtGoal;
    game.shotBonus = 0;
    game.bonusAddRemaining = game.awardedShotBonus;
    spawnBurst(GOAL_MOUTH_X + 8, b.y, "#ffce45", 34);
    game.goalWhistlePlayed = true;
    playWhistle();
    game.state = "goalBonus";
  } else if (ballPastGoal || ballOutOfField) {
    setFinalState("miss");
  }
}

function shoot() {
  if (game.ball.state !== "dribble") return;
  if (!game.player || game.player.x < GOAL_X - 430) return;
  const b = game.ball;
  const targetY = b.y;
  const dx = GOAL_X + 104 - b.x;
  const dy = targetY - b.y;
  const duration = 0.52;
  b.state = "shot";
  b.vx = dx / duration;
  b.vy = dy / duration;
  b.targetY = targetY;
  keys.shoot = false;
}

function checkCollisions(dt) {
  if (game.ball.state !== "dribble" || game.player.invuln > 0) return;

  const b = game.ball;
  const ballCircle = { x: b.x, y: b.y, r: BALL_COLLISION_R };
  const playerPoint = playerGrazePoint();
  for (const d of game.defenders) {
    if (Math.abs(d.x - b.x) > 120) continue;
    const box = enemyBallHitbox(d);
    if (circleRectOverlap(ballCircle, box)) {
      spawnBurst(b.x, b.y, "#fb635f", 22);
      setFinalState("tackled");
      return;
    }

    updateGrazeBonus(d, playerPoint, dt);
  }
}

function updateGrazeBonus(defender, playerPoint, dt) {
  const center = enemyCenter(defender);
  const dist = Math.hypot(playerPoint.x - center.x, playerPoint.y - center.y);
  const grazing = dist <= GRAZE_DISTANCE;

  if (!grazing) {
    defender.grazing = false;
    defender.grazePopupTick = 0;
    return;
  }

  if (!defender.grazing) {
    defender.grazing = true;
  }

  const closeness = clamp(1 - dist / GRAZE_DISTANCE, 0, 1);
  const rate = GRAZE_SCORE_RATE * (1 + closeness * GRAZE_CLOSE_MULTIPLIER);
  const add = rate * dt;
  game.grazeBonus += add;

  defender.grazePopupTick = (defender.grazePopupTick || 0) + dt;
  if (defender.grazePopupTick >= 0.35) {
    defender.grazePopupTick = 0;
    showPopup(center.x, center.y - 22, t("grazePopup", { rate: Math.max(1, Math.floor(rate * game.scoreMultiplier)) }), "#ffce45");
  }
}

function showPopup(x, y, text, color = "#ffce45") {
  game.popups.push({
    x,
    y,
    vy: -18,
    life: 0.65,
    text,
    color,
  });
}

function updateDistanceScore() {
  const progress = clamp(game.cameraX / END_CAMERA_X, 0, 1);
  game.distanceScore = Math.floor(progress * DISTANCE_SCORE_MAX + game.time * TIME_SCORE_RATE);
}

function calculateGoalBaseScore() {
  updateDistanceScore();
  return Math.floor((game.distanceScore + game.grazeBonus) * game.scoreMultiplier);
}

function updateScore() {
  if (game.state !== "playing") return;
  updateDistanceScore();
  game.score = calculateGoalBaseScore();
}

function updateBonusCountUp(dt) {
  if (game.state !== "goalBonus") return;

  const add = Math.min(game.bonusAddRemaining, Math.max(1, Math.floor(BONUS_COUNTUP_RATE * dt)));
  game.bonusAddRemaining -= add;
  game.shotBonus += add;
  game.score = game.baseScoreAtGoal + game.shotBonus;

  if (game.bonusAddRemaining <= 0) {
    setFinalState("goal");
  }
}

function spawnBurst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 80 + (i % 5) * 28;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.55 + (i % 4) * 0.08,
      color,
    });
  }
}

function updateParticles(dt) {
  for (const p of game.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 90 * dt;
    p.life -= dt;
  }
  game.particles = game.particles.filter((p) => p.life > 0);
}

function updatePopups(dt) {
  for (const popup of game.popups) {
    popup.y += popup.vy * dt;
    popup.life -= dt;
  }
  game.popups = game.popups.filter((popup) => popup.life > 0);
}

function update(dt) {
  const active = game.state === "countdown" || game.state === "playing";
  if (active) {
    game.time += dt;
    updateDefenders(dt);
    updateKeeper();
  }
  updateParticles(dt);
  updatePopups(dt);

  if (game.state === "countdown") {
    game.messageTimer -= dt;
    if (game.messageTimer <= 0) game.state = "playing";
  }

  if (game.state === "playing") {
    const scrollDx = updateAutoScroll(dt);
    updateShotBonus(dt);
    updatePlayer(dt, scrollDx);
    updateShot(dt);
    checkCollisions(dt);
    updateScore();
  }

  updateBonusCountUp(dt);

  updateUi();
}

function drawField() {
  const cam = game.cameraX;
  ctx.fillStyle = "#02070d";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#07131f";
  ctx.fillRect(10, 10, W - 20, H - 20);
  ctx.strokeStyle = "#55d7ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.strokeStyle = "#0b4e86";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  ctx.fillStyle = "#6faa42";
  ctx.fillRect(24, 24, W - 48, FIELD_TOP - 24);
  ctx.fillStyle = "#8fc957";
  ctx.fillRect(24, 36, W - 48, 22);
  ctx.fillStyle = "#bcd969";
  ctx.fillRect(24, FIELD_TOP - 18, W - 48, 8);
  ctx.fillStyle = "rgba(35, 89, 39, 0.18)";
  for (let x = 24 - ((cam * 0.16) % 88); x < W - 24; x += 88) {
    ctx.fillRect(x, 31, 22, 3);
    ctx.fillRect(x + 34, 70, 24, 2);
  }

  ctx.fillStyle = "rgba(255, 206, 69, 0.34)";
  ctx.strokeStyle = "rgba(84, 215, 255, 0.32)";
  ctx.lineWidth = 2;
  const markerStart = Math.floor((cam - 140) / 360) * 360;
  for (let worldX = markerStart; worldX < cam + W + 360; worldX += 360) {
    const sx = Math.round(worldX - cam);
    if (sx < 30 || sx > W - 70) continue;
    ctx.fillRect(sx, FIELD_TOP - 18, 42, 8);
    ctx.beginPath();
    ctx.moveTo(sx + 8, FIELD_TOP - 8);
    ctx.lineTo(sx + 8, FIELD_TOP + 34);
    ctx.stroke();
  }

  ctx.fillStyle = "#cf985f";
  ctx.fillRect(24, FIELD_TOP, W - 48, FIELD_BOTTOM - FIELD_TOP);

  ctx.save();
  ctx.beginPath();
  ctx.rect(24, FIELD_TOP, W - 48, FIELD_BOTTOM - FIELD_TOP);
  ctx.clip();

  const groundStart = Math.floor((cam - 520) / 520) * 520;
  ctx.fillStyle = "rgba(177, 113, 67, 0.2)";
  for (let worldX = groundStart; worldX < cam + W + 520; worldX += 520) {
    const sx = Math.round(worldX - cam);
    ctx.fillRect(sx + 74, FIELD_TOP + 34, 136, 42);
    ctx.fillRect(sx + 336, FIELD_TOP + 154, 178, 48);
    ctx.fillRect(sx + 104, FIELD_TOP + 286, 220, 44);
  }

  ctx.fillStyle = "rgba(236, 190, 122, 0.13)";
  for (let worldX = groundStart + 180; worldX < cam + W + 520; worldX += 520) {
    const sx = Math.round(worldX - cam);
    ctx.fillRect(sx + 72, FIELD_TOP + 76, 126, 28);
    ctx.fillRect(sx + 318, FIELD_TOP + 236, 154, 36);
    ctx.fillRect(sx - 36, FIELD_TOP + 356, 152, 34);
  }

  ctx.fillStyle = "rgba(126, 77, 47, 0.22)";
  const scratchStart = Math.floor((cam - 180) / 180) * 180;
  for (let worldX = scratchStart; worldX < cam + W + 180; worldX += 180) {
    const sx = Math.round(worldX - cam);
    const y = FIELD_TOP + 52 + ((Math.floor(worldX / 180) * 73) % 382);
    ctx.fillRect(sx + 24, y, 14, 3);
    ctx.fillRect(sx + 92, y + 38, 10, 2);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 5;
  const goalScreenX = GOAL_X - cam;
  if (goalScreenX < W + 260) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(24, FIELD_TOP, W - 48, FIELD_BOTTOM - FIELD_TOP);
    ctx.clip();

    ctx.beginPath();
    ctx.arc(goalScreenX + 82, 347, 128, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeRect(goalScreenX + 72, 232, 150, 230);
    ctx.strokeRect(goalScreenX + 142, 270, 58, 154);
    ctx.fillStyle = "#d5d8cc";
    ctx.fillRect(goalScreenX + 176, 238, 26, 218);
    ctx.fillStyle = "#9aa39b";
    for (let y = 248; y < 452; y += 22) ctx.fillRect(goalScreenX + 178, y, 22, 2);
    ctx.restore();
  }

  ctx.fillStyle = "#02070d";
  ctx.fillRect(18, FIELD_BOTTOM, W - 36, H - FIELD_BOTTOM - 18);
  ctx.fillStyle = "rgba(84, 215, 255, 0.2)";
  for (let worldX = markerStart; worldX < cam + W + 360; worldX += 360) {
    const sx = Math.round(worldX - cam);
    if (sx < 34 || sx > W - 58) continue;
    ctx.fillRect(sx, FIELD_BOTTOM + 18, 32, 5);
  }
  ctx.strokeStyle = "#0b4e86";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, FIELD_TOP, W - 48, FIELD_BOTTOM - FIELD_TOP);
}

function drawHudInCanvas() {
  ctx.fillStyle = "rgba(3, 8, 8, 0.92)";
  ctx.fillRect(330, 16, 300, 35);
  ctx.strokeStyle = "#f1d34b";
  ctx.lineWidth = 2;
  ctx.strokeRect(330, 16, 300, 35);
  ctx.fillStyle = "#ffce45";
  ctx.textAlign = "center";
  fillFittedText(`${t("score")} ${String(Math.floor(game.score)).padStart(5, "0")}`, W / 2, 41, 276, 21, 13);

  ctx.fillStyle = "#f5f0d2";
  ctx.textAlign = "right";
  const difficulty = currentDifficulty();
  fillFittedText(`${difficultyLabel()} x${formatMultiplier(difficulty.scoreMultiplier)}`, W - 34, 30, 260, 13, 9);

  const barX = 82;
  const barY = H - 40;
  const barW = W - 174;
  const progress = clamp(game.cameraX / END_CAMERA_X, 0, 1);
  ctx.fillStyle = "#ffce45";
  ctx.textAlign = "right";
  fillFittedText(t("start"), barX - 12, barY + 13, barX - 18, 15, 8);
  ctx.textAlign = "left";
  fillFittedText(t("goal"), barX + barW + 12, barY + 13, W - (barX + barW + 22), 15, 8);
  ctx.fillStyle = "#04110b";
  ctx.fillRect(barX, barY, barW, 15);
  ctx.strokeStyle = "#6bd585";
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barW, 15);
  ctx.fillStyle = "#13c85a";
  ctx.fillRect(barX + 3, barY + 3, Math.max(0, (barW - 6) * progress), 9);
  ctx.fillStyle = "#ffce45";
  const markerX = barX + 3 + (barW - 6) * progress;
  ctx.beginPath();
  ctx.moveTo(markerX, barY - 5);
  ctx.lineTo(markerX - 8, barY + 5);
  ctx.lineTo(markerX + 8, barY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.textAlign = "left";
}

function drawPlayer(p) {
  const x = Math.round(p.x - game.cameraX);
  const y = Math.round(p.y);
  const blink = p.invuln > 0 && Math.floor(game.time * 14) % 2 === 0;
  if (blink) return;

  if (playerSpriteReady) {
    const bob = Math.sin(game.time * 10) * 2;
    const drawW = 92;
    const drawH = 79;
    const drawX = x - 22;
    const drawY = y - 17 + bob;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(x + 34, y + 55, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    if (p.facing < 0) {
      ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(playerSprite, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.drawImage(playerSprite, drawX, drawY, drawW, drawH);
    }
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#1b2737";
  ctx.fillRect(x + 8, y + 4, 18, 14);
  ctx.fillStyle = "#f4f1d7";
  ctx.fillRect(x + 7, y + 18, 22, 20);
  ctx.fillStyle = "#4b5870";
  ctx.fillRect(x + 5, y + 36, 9, 13);
  ctx.fillRect(x + 22, y + 36, 9, 13);
  ctx.fillStyle = "#f2b16d";
  ctx.fillRect(x + 10, y, 14, 8);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 14, y + 7, 13, 4);
  ctx.fillStyle = "#202020";
  ctx.fillRect(x + 3, y + 49, 12, 5);
  ctx.fillRect(x + 21, y + 49, 12, 5);
}

function drawBall(b) {
  const x = Math.round(b.x - game.cameraX);
  const y = Math.round(b.y);
  const r = b.r + 3;
  const spin = game.ball.state === "shot" ? game.time * 18 : game.time * 10;
  const wobble = Math.sin(spin) * 1.2;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + r + 4, r * 0.9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y + wobble, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const grad = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, r + 2);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.58, "#f2f0e6");
  grad.addColorStop(1, "#b8b4a8");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y + wobble, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = 2;
  const offset = Math.sin(spin) * 3;
  const panelPoints = [
    [x + offset, y - 3 + wobble],
    [x - 8 + offset * 0.35, y - 8 + wobble],
    [x + 8 + offset * 0.25, y - 8 + wobble],
    [x - 10 - offset * 0.25, y + 4 + wobble],
    [x + 9 - offset * 0.25, y + 5 + wobble],
    [x + offset * 0.2, y + 10 + wobble],
  ];

  ctx.fillStyle = "#161616";
  drawPentagon(panelPoints[0][0], panelPoints[0][1], 4.6, spin * 0.4);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(panelPoints[0][0] - 3, panelPoints[0][1] - 2);
  ctx.lineTo(panelPoints[1][0], panelPoints[1][1]);
  ctx.lineTo(panelPoints[3][0], panelPoints[3][1]);
  ctx.moveTo(panelPoints[0][0] + 3, panelPoints[0][1] - 2);
  ctx.lineTo(panelPoints[2][0], panelPoints[2][1]);
  ctx.lineTo(panelPoints[4][0], panelPoints[4][1]);
  ctx.moveTo(panelPoints[0][0], panelPoints[0][1] + 4);
  ctx.lineTo(panelPoints[5][0], panelPoints[5][1]);
  ctx.stroke();

  ctx.fillStyle = "#202020";
  drawPentagon(panelPoints[1][0], panelPoints[1][1], 3.8, spin * 0.25);
  ctx.fill();
  drawPentagon(panelPoints[2][0], panelPoints[2][1], 3.6, -spin * 0.2);
  ctx.fill();
  drawPentagon(panelPoints[3][0], panelPoints[3][1], 3.7, spin * 0.3);
  ctx.fill();
  drawPentagon(panelPoints[4][0], panelPoints[4][1], 3.7, -spin * 0.3);
  ctx.fill();

  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + wobble, r - 1, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawPentagon(cx, cy, radius, rotation) {
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const angle = rotation - Math.PI / 2 + (Math.PI * 2 * i) / 5;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawDefender(d) {
  const x = Math.round(d.x - game.cameraX);
  const y = Math.round(d.y);
  if (x < -80 || x > W + 80) return;

  if (enemySpriteReady) {
    const frame = Math.floor((game.time * (d.frameRate ?? 10) + d.phase) % ENEMY_FRAME_COUNT);
    const sx = frame * ENEMY_FRAME_W;
    const scale = d.visualScale ?? 1;
    const drawW = (d.type === "slider" ? 58 : d.type === "chaser" ? 56 : 50) * scale;
    const drawH = (d.type === "slider" ? 70 : d.type === "chaser" ? 70 : 62) * scale;
    const drawX = x - drawW / 2;
    const drawY = y - 14;

    ctx.save();
    ctx.fillStyle = d.type === "chaser" ? "rgba(80, 8, 8, 0.28)" : "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(x, y + drawH - 8, drawW * 0.34, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (d.type === "slider") {
      ctx.translate(x, y + 26);
      ctx.rotate(-0.18);
      ctx.drawImage(enemySprite, sx, 0, ENEMY_FRAME_W, ENEMY_FRAME_H, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.drawImage(enemySprite, sx, 0, ENEMY_FRAME_W, ENEMY_FRAME_H, drawX, drawY, drawW, drawH);
    }
    ctx.restore();
    return;
  }

  if (d.type === "slider") {
    ctx.fillStyle = "#071326";
    ctx.fillRect(x - 22, y + 18, 46, 12);
    ctx.fillStyle = "#253a67";
    ctx.fillRect(x - 10, y + 8, 24, 15);
    ctx.fillStyle = "#171717";
    ctx.fillRect(x - 14, y + 4, 14, 10);
    ctx.fillStyle = "#e7ad6a";
    ctx.fillRect(x - 11, y, 12, 8);
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 28, y + 27, 20, 5);
    ctx.fillRect(x + 18, y + 27, 20, 5);
    return;
  }

  ctx.fillStyle = "#071326";
  ctx.fillRect(x + 8, y + 5, 18, 14);
  ctx.fillStyle = "#23385f";
  ctx.fillRect(x + 6, y + 19, 23, 20);
  ctx.fillStyle = "#10151f";
  ctx.fillRect(x + 4, y + 38, 10, 12);
  ctx.fillRect(x + 21, y + 38, 10, 12);
  ctx.fillStyle = "#dda46b";
  ctx.fillRect(x + 10, y, 14, 8);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 8, y + 50, 11, 5);
  ctx.fillRect(x + 22, y + 50, 11, 5);
}

function drawKeeper() {
  const k = game.keeper;
  const x = Math.round(k.x - game.cameraX);
  const y = Math.round(k.y);
  if (x < -80 || x > W + 110) return;

  if (enemySpriteReady) {
    const frame = Math.floor((game.time * 11 + 3) % ENEMY_FRAME_COUNT);
    const sx = frame * ENEMY_FRAME_W;
    const drawW = 66;
    const drawH = 82;
    const drawX = x - 14;
    const drawY = y - 4;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(x + 20, y + drawH - 2, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(enemySprite, sx, 0, ENEMY_FRAME_W, ENEMY_FRAME_H, drawX, drawY, drawW, drawH);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#0b3b22";
  ctx.fillRect(x + 5, y + 16, k.w, k.h - 20);
  ctx.fillStyle = "#1fb96c";
  ctx.fillRect(x + 1, y + 25, 8, 42);
  ctx.fillRect(x + k.w, y + 25, 8, 42);
  ctx.fillStyle = "#e7a45e";
  ctx.fillRect(x + 14, y + 4, 18, 14);
  ctx.fillStyle = "#121212";
  ctx.fillRect(x + 9, y, 28, 8);
  ctx.fillStyle = "#122017";
  ctx.fillRect(x + 8, y + k.h - 4, 13, 9);
  ctx.fillRect(x + 26, y + k.h - 4, 13, 9);
}

function drawParticles() {
  for (const p of game.particles) {
    ctx.globalAlpha = clamp(p.life * 1.8, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - game.cameraX), Math.round(p.y), 6, 6);
  }
  ctx.globalAlpha = 1;
}

function drawPopups() {
  ctx.save();
  ctx.textAlign = "center";
  for (const popup of game.popups) {
    const alpha = clamp(popup.life * 1.6, 0, 1);
    const x = clamp(Math.round(popup.x - game.cameraX), 96, W - 96);
    const y = Math.round(popup.y);
    ctx.globalAlpha = alpha;
    fitFontSize(popup.text, 188, 18, 10);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#2a1600";
    ctx.strokeText(popup.text, x, y);
    ctx.fillStyle = popup.color || "#ffce45";
    ctx.fillText(popup.text, x, y);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

function drawCountdown() {
  if (game.state !== "countdown") return;
  ctx.fillStyle = "rgba(4, 8, 6, 0.32)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#54d7ff";
  ctx.strokeStyle = "#0b2330";
  ctx.lineWidth = 8;
  ctx.textAlign = "center";
  strokeAndFillFittedText(t("startReady"), W / 2, H / 2 + 20, W - 120, 92, 28);
  ctx.textAlign = "left";
}

function drawShootHint() {
  if (game.state !== "playing" || game.ball.state !== "dribble" || game.player.x < GOAL_X - 420) return;

  const lines = t("shootHint").split("\n");
  setUiFont(17);
  const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const boxW = clamp(maxLineWidth + 44, 250, Math.min(520, W - 64));
  const lineHeight = 20;
  const boxH = 22 + lines.length * lineHeight;
  const x = W - boxW - 32;
  const y = 62;

  ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
  ctx.fillRect(x, y, boxW, boxH);
  ctx.strokeStyle = "rgba(255, 206, 69, 0.56)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, boxW, boxH);
  ctx.fillStyle = "#ffce45";
  ctx.textAlign = "center";
  lines.forEach((line, index) => {
    fillFittedText(line, x + boxW / 2, y + 25 + index * lineHeight, boxW - 24, 17, 9);
  });
  ctx.textAlign = "left";
}

function drawShotBonus() {
  if (!game.shotBonusActive && game.state !== "goalBonus") return;

  const goalScreenX = GOAL_X - game.cameraX;
  const y = 178;
  const label = game.state === "goalBonus"
    ? `${t("adding")} +${game.awardedShotBonus - game.bonusAddRemaining}`
    : `${t("shotBonus")} +${Math.floor(game.availableShotBonus * game.scoreMultiplier)}`;
  setUiFont(18);
  const maxBoxW = Math.min(440, W - 64);
  const boxW = clamp(ctx.measureText(label).width + 48, 250, maxBoxW);
  const x = clamp(goalScreenX - boxW - 12, 32, W - boxW - 32);

  ctx.fillStyle = "rgba(4, 8, 6, 0.78)";
  ctx.fillRect(x, y, boxW, 36);
  ctx.strokeStyle = "rgba(255, 206, 69, 0.65)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, boxW, 36);
  ctx.fillStyle = "#ffce45";
  ctx.textAlign = "center";
  fillFittedText(label, x + boxW / 2, y + 24, boxW - 24, 18, 10);
  ctx.textAlign = "left";
}

function render() {
  drawField();
  ctx.save();
  ctx.beginPath();
  ctx.rect(24, FIELD_TOP, W - 48, FIELD_BOTTOM - FIELD_TOP);
  ctx.clip();
  for (const d of game.defenders) drawDefender(d);
  drawKeeper();
  drawPlayer(game.player);
  drawBall(game.ball);
  drawParticles();
  drawPopups();
  ctx.restore();
  drawHudInCanvas();
  drawShotBonus();
  drawShootHint();
  drawCountdown();
}

function frame(ts) {
  if (!game.lastTs) game.lastTs = ts;
  const dt = Math.min(0.033, (ts - game.lastTs) / 1000);
  game.lastTs = ts;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

function keyName(event) {
  const k = event.key.toLowerCase();
  if (k === "arrowleft" || k === "a") return "left";
  if (k === "arrowright" || k === "d") return "right";
  if (k === "arrowup" || k === "w") return "up";
  if (k === "arrowdown" || k === "s") return "down";
  if (k === " " || k === "enter" || k === "j") return "shoot";
  return "";
}

window.addEventListener("keydown", (event) => {
  const name = keyName(event);
  if (!name) return;
  event.preventDefault();
  if (isWaitingState()) {
    return;
  }
  keys[name] = true;
  if (name === "shoot") shoot();
});

window.addEventListener("keyup", (event) => {
  const name = keyName(event);
  if (name) keys[name] = false;
});

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H,
  };
}

function maybeDoubleTap(point) {
  const now = performance.now();
  const dist = Math.hypot(point.x - pointerInput.lastTapX, point.y - pointerInput.lastTapY);
  const isDouble = now - pointerInput.lastTapAt < 330 && dist < 46;
  pointerInput.lastTapAt = isDouble ? 0 : now;
  pointerInput.lastTapX = point.x;
  pointerInput.lastTapY = point.y;
  if (isDouble) shootOrAdvance();
}

canvas.addEventListener("pointerdown", (event) => {
  const point = canvasPoint(event);
  pointerInput.active = true;
  pointerInput.type = event.pointerType || "mouse";
  pointerInput.id = event.pointerId;
  pointerInput.startX = point.x;
  pointerInput.startY = point.y;
  pointerInput.x = point.x;
  pointerInput.y = point.y;
  if (event.pointerType !== "mouse") {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    maybeDoubleTap(point);
  }
});

canvas.addEventListener("pointermove", (event) => {
  const point = canvasPoint(event);
  if (event.pointerType === "mouse") {
    pointerInput.active = true;
    pointerInput.type = "mouse";
    pointerInput.x = point.x;
    pointerInput.y = point.y;
    return;
  }
  if (pointerInput.id !== event.pointerId) return;
  event.preventDefault();
  pointerInput.x = point.x;
  pointerInput.y = point.y;
});

canvas.addEventListener("pointerup", (event) => {
  if (event.pointerType === "mouse") return;
  if (pointerInput.id !== event.pointerId) return;
  pointerInput.active = false;
  pointerInput.id = null;
});

canvas.addEventListener("pointercancel", (event) => {
  if (pointerInput.id !== event.pointerId) return;
  pointerInput.active = false;
  pointerInput.id = null;
});

canvas.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") pointerInput.active = false;
});

canvas.addEventListener("dblclick", (event) => {
  event.preventDefault();
  shootOrAdvance();
});

canvas.addEventListener("contextmenu", (event) => event.preventDefault());

startButton.addEventListener("click", nextLevel);

if (languageSelect) {
  languageSelect.addEventListener("change", () => setLanguage(languageSelect.value));
}

document.querySelectorAll("[data-difficulty]").forEach((button) => {
  button.addEventListener("click", () => reset(button.dataset.difficulty));
});

setupLanguageSelect();
applyLanguageToDocument();
game.player = makePlayer();
game.ball = makeBall(game.player);
game.defenders = makeDefenders(game.level);
game.keeper = { x: GOAL_X + 40, y: 306, w: 38, h: 78, speed: currentDifficulty().keeperSpeed, phase: 0 };
showDifficultyOverlay();
updateUi();
requestAnimationFrame(frame);
