/* ====================================================================
   admin.js — منطق داشبورد مدیریت مسابقات
   ==================================================================== */

/* --------------------------------------------------------------
   ۱) تنظیمات
   -------------------------------------------------------------- */
const CONFIG = {
  GITHUB_USERNAME: 'hosseintalav',
  GITHUB_REPO: 'Footino',
  GITHUB_BRANCH: 'main',
  FILE_PATH: 'matches.json',

  /* ⚠️ اگر فایل‌های داشبورد را داخل پوشه‌ای قرار دادید،
     مسیر نسبی از آن پوشه تا ریشه پروژه را اینجا بنویسید.
     مثال:
       - ریشه پروژه:        DASHBOARD_BASE = ''
       - پوشه dashboard:    DASHBOARD_BASE = '../'
       - پوشه a/b:          DASHBOARD_BASE = '../../'
     این مقدار فقط برای *نمایش* لوگوها در داشبورد استفاده می‌شود؛
     مسیر ذخیره‌شده در matches.json همیشه نسبت به ریشه پروژه است. */
  DASHBOARD_BASE: '../',

  /* ⚠️ توکن Fine-grained با دسترسی Contents: Read and write */
  GITHUB_TOKEN: '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'
};

const NO_IMAGE = 'assets/logo/no-image.png';
const API_BASE = 'https://api.github.com';

/* کلیدهای localStorage برای حفظ تغییرات ذخیره‌نشده */
const LS_KEY = 'footino_admin_matches_v1';
const LS_DIRTY = 'footino_admin_dirty_v1';

/* --------------------------------------------------------------
   ۲) آیکن‌های SVG
   -------------------------------------------------------------- */
const ICONS = {
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  flag: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  alert: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
};

/* --------------------------------------------------------------
   ۳) داده‌های تیم‌ها
   مسیرهای image همیشه نسبت به ریشه پروژه هستند (برای ذخیره در JSON).
   -------------------------------------------------------------- */
const TEAM_GROUPS = {
  'premier-league': [
    ['arsenal.png', 'آرسنال'], ['aston-villa.png', 'استون ویلا'], ['bournemouth.png', 'بورنموث'],
    ['brentford.png', 'برنتفورد'], ['brighton-&-hove-albion.png', 'برایتون'], ['chelsea.png', 'چلسی'],
    ['coventry-city.png', 'کاونتری سیتی'], ['crystal-palace.png', 'کریستال پالاس'], ['everton.png', 'اورتون'],
    ['fulham.png', 'فولام'], ['hull-city.png', 'هال سیتی'], ['ipswich-town.png', 'ایپسویچ تاون'],
    ['leeds-united.png', 'لیدز یونایتد'], ['liverpool.png', 'لیورپول'], ['manchester-city.png', 'منچستر سیتی'],
    ['manchester-united.png', 'منچستر یونایتد'], ['newcastle-united.png', 'نیوکاسل'], ['nottingham-forest.png', 'ناتینگهام فارست'],
    ['sunderland.png', 'ساندرلند'], ['tottenham-hotspur.png', 'تاتنهام']
  ],
  'laliga': [
    ['alaves.png', 'آلاوس'], ['athletic-bilbao.png', 'اتلتیک بیلبائو'], ['atletico-madrid.png', 'اتلتیکو مادرید'],
    ['barcelona.png', 'بارسلونا'], ['celta-vigo.png', 'سلتاویگو'], ['deportivo-a-coruna.png', 'دپورتیوو لاکرونیا'],
    ['elche.png', 'الچه'], ['espanyol.png', 'اسپانیول'], ['getafe.png', 'ختافه'],
    ['levante.png', 'لوانته'], ['malaga.png', 'مالاگا'], ['osasuna.png', 'اوساسونا'],
    ['racing-santander.png', 'راسینگ سانتاندر'], ['rayo-vallecano.png', 'رایو وایکانو'], ['real-betis.png', 'رئال بتیس'],
    ['real-madrid.png', 'رئال مادرید'], ['real-sociedad.png', 'رئال سوسیداد'], ['sevilla.png', 'سویا'],
    ['valencia.png', 'والنسیا'], ['villarreal.png', 'ویارئال']
  ],
  'serie-a': [
    ['atalanta.png', 'آتالانتا'], ['bologna.png', 'بولونیا'], ['cagliari.png', 'کالیاری'], ['como.png', 'کومو'],
    ['fiorentina.png', 'فیورنتینا'], ['frosinone.png', 'فروزینونه'], ['genoa.png', 'جنوا'], ['inter.png', 'اینتر میلان'],
    ['juventus.png', 'یوونتوس'], ['lazio.png', 'لاتزیو'], ['lecce.png', 'لچه'], ['milan.png', 'میلان'],
    ['monza.png', 'مونتزا'], ['napoli.png', 'ناپولی'], ['parma.png', 'پارما'], ['roma.png', 'رم'],
    ['sassuolo.png', 'ساسولو'], ['torino.png', 'تورینو'], ['udinese.png', 'اودینزه'], ['venezia.png', 'ونتزیا']
  ],
  'bundesliga': [
    ['augsburg.png', 'آگزبورگ'], ['bayern-munich.png', 'بایرن مونیخ'], ['dortmund.png', 'دورتموند'],
    ['eintracht-frankfurt.png', 'آینتراخت فرانکفورت'], ['elversberg.png', 'الفرسبرگ'], ['freiburg.png', 'فرایبورگ'],
    ['hamburger-sv.png', 'هامبورگ'], ['hoffenheim.png', 'هوفنهایم'], ['koln.png', 'کلن'],
    ['leverkusen.png', 'بایر لورکوزن'], ['mainz-05.png', 'ماینتس'], ['monchengladbach.png', 'مونشن گلادباخ'],
    ['paderborn.png', 'پادربورن'], ['rb-leipzig.png', 'آر بی لایپزیگ'], ['schalke-04.png', 'شالکه'],
    ['stuttgart.png', 'اشتوتگارت'], ['union-berlin.png', 'یونیون برلین'], ['werder-bremen.png', 'وردر برمن']
  ],
  'ligue-1': [
    ['angers.png', 'آنژه'], ['auxerre.png', 'اکسر'], ['brest.png', 'برست'], ['le-havre.png', 'لو اور'],
    ['le-mans.png', 'لو مان'], ['lens.png', 'لانس'], ['lille.png', 'لیل'], ['lorient.png', 'لوریان'],
    ['lyon.png', 'لیون'], ['marseille.png', 'مارسی'], ['monaco.png', 'موناکو'], ['nice.png', 'نیس'],
    ['paris-fc.png', 'پاریس اف‌سی'], ['psg.png', 'پاریس سن ژرمن'], ['rennes.png', 'رن'],
    ['strasbourg.png', 'استراسبورگ'], ['toulouse.png', 'تولوز'], ['troyes.png', 'تروا']
  ],
  'saudi-pro-league': [
    ['abha.png', 'ابها'], ['al-ahli.png', 'الاهلی عربستان'], ['al-diriyah.png', 'الدریه'], ['al-ettifaq.png', 'الاتفاق'],
    ['al-faisaly.png', 'الفیصلی'], ['al-fateh.png', 'الفتح'], ['al-fayha.png', 'الفیحا'], ['al-hazem.png', 'الحزم'],
    ['al-hilal.png', 'الهلال'], ['al-ittihad.png', 'الاتحاد عربستان'], ['al-khaleej.png', 'الخلیج'], ['al-kholood.png', 'الخلود'],
    ['al-nassr.png', 'النصر'], ['al-qadsiah.png', 'القادسیه'], ['al-riyadh.png', 'الریاض'], ['al-shabab.png', 'الشباب'],
    ['al-taawoun.png', 'التعاون'], ['neom.png', 'نیوم']
  ],
  'mls': [
    ['atlanta-united.png', 'آتلانتا یونایتد'], ['austins-fc.png', 'آستین اف‌سی'], ['cf-montreal.png', 'سی‌اف مونترال'],
    ['charlotte-fc.png', 'شارلوت اف‌سی'], ['chicago-fire-fc.png', 'شیکاگو فایر'], ['colorado-rapids.png', 'کلرادو رپیدز'],
    ['columbus-crew.png', 'کلمبوس کرو'], ['dc-united.png', 'دی‌سی یونایتد'], ['fc-cincinnati.png', 'اف‌سی سینسیناتی'],
    ['fc-dallas.png', 'اف‌سی دالاس'], ['houston-dynamo.png', 'هیوستون دینامو'], ['inter-miami-cf.png', 'اینتر میامی'],
    ['la-galaxy.png', 'ال‌ای گلکسی'], ['los-angeles-fc.png', 'لس آنجلس اف‌سی'], ['minnesota-united-fc.png', 'مینسوتا یونایتد'],
    ['nashville-sc.png', 'نشویل اس‌سی'], ['new-england-revolution.png', 'نیوانگلند رولوشن'], ['new-york-city-fc.png', 'نیویورک سیتی اف‌سی'],
    ['new-york-red-bulls.png', 'نیویورک رد بولز'], ['orlando-city.png', 'اورلاندو سیتی'], ['philadelphia-union.png', 'فیلادلفیا یونیون'],
    ['portland-timbers.png', 'پورتلند تیمبرز'], ['real-salt-lake.png', 'رئال سالت لیک'], ['san-diego-fc.png', 'سن دیگو اف‌سی'],
    ['san-jose-earthquakes.png', 'سن خوزه ارت‌کویکز'], ['seattle-sounders-fc.png', 'سیاتل ساندرز'], ['sporting-kansas-city.png', 'اسپورتینگ کانزاس سیتی'],
    ['st-louis-city-sc.png', 'سنت لوئیس سیتی'], ['toronto-fc.png', 'تورنتو اف‌سی'], ['vancouver-whitecaps-fc.png', 'ونکوور وایت‌کپس']
  ],
  'other': [
    ['galatasaray.png', 'گالاتاسرای'], ['fenerbahce.png', 'فنرباغچه'], ['besiktas.png', 'بشیکتاش'],
    ['celtic.png', 'سلتیک'], ['benfica.png', 'بنفیکا'], ['sporting-lisbon.png', 'اسپورتینگ لیسبون'],
    ['porto.png', 'پورتو'], ['ajax.png', 'آژاکس']
  ]
};

const TEAMS = [];
Object.keys(TEAM_GROUPS).forEach(function (dir) {
  TEAM_GROUPS[dir].forEach(function (pair) {
    TEAMS.push({ name: pair[1], image: 'assets/logo/' + dir + '/' + pair[0] });
  });
});

/* --------------------------------------------------------------
   ۴) وضعیت برنامه
   -------------------------------------------------------------- */
let allMatches = [];        // لیست کامل مسابقات (در حافظه)
let editingIndex = null;    // ایندکس مسابقه در حال ویرایش (null = افزودن)
let isDirty = false;        // آیا تغییرات ذخیره‌نشده وجود دارد؟
let picker1 = null;
let picker2 = null;

/* --------------------------------------------------------------
   ۵) ابزارهای کمکی
   -------------------------------------------------------------- */
function $(id) { return document.getElementById(id); }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ★ مسیر لوگو را برای *نمایش* در داشبورد آماده می‌کند.
   - اگر مسیر مطلق (http/https) یا data: باشد، دست‌نخورده برمی‌گردد.
   - اگر مسیر نسبی باشد، DASHBOARD_BASE را جلوی آن می‌گذارد.
   - نکته: مسیر ذخیره‌شده در JSON همیشه بدون این پیشوند است. */
function previewSrc(path) {
  if (!path) return CONFIG.DASHBOARD_BASE + NO_IMAGE;
  const p = String(path);
  if (/^(https?:|data:|\/)/i.test(p)) return p;
  return CONFIG.DASHBOARD_BASE + p;
}

function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(escape(atob(String(str).replace(/\s/g, ''))));
}

function todayStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function toFa(n) {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function matchDateTime(m) {
  if (!m || !m.date) return null;
  const t = (m.time && /^\d{1,2}:\d{2}$/.test(m.time)) ? m.time : '00:00';
  const d = new Date(m.date + 'T' + t + ':00');
  return isNaN(d.getTime()) ? null : d;
}

function isValidTime(t) {
  if (!/^\d{1,2}:\d{2}$/.test(t)) return false;
  const parts = t.split(':');
  const h = Number(parts[0]), min = Number(parts[1]);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

function normalizeTime(t) {
  if (!isValidTime(t)) return t;
  const parts = t.split(':');
  return String(parts[0]).padStart(2, '0') + ':' + parts[1];
}

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  try {
    return d.toLocaleDateString('fa-IR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/* --------------------------------------------------------------
   ۶) Toast و Loading
   -------------------------------------------------------------- */
function showToast(message, type) {
  type = type || 'info';
  const container = $('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;

  const iconMap = { success: ICONS.check, error: ICONS.alert, warning: ICONS.alert, info: ICONS.info };
  el.innerHTML = (iconMap[type] || ICONS.info) + '<span>' + esc(message) + '</span>';

  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 320);
  }, 4000);
}

let loadingCount = 0;
function showLoading(msg) {
  loadingCount++;
  $('loadingText').textContent = msg || 'در حال پردازش...';
  $('loading').classList.add('active');
}
function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) $('loading').classList.remove('active');
}

/* --------------------------------------------------------------
   ۷) GitHub API
   -------------------------------------------------------------- */
function authHeaders() {
  return {
    'Authorization': 'Bearer ' + CONFIG.GITHUB_TOKEN,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function apiUrl(path) {
  return API_BASE + '/repos/' + CONFIG.GITHUB_USERNAME + '/' + CONFIG.GITHUB_REPO + path;
}

async function githubGetFile() {
  const url = apiUrl('/contents/' + CONFIG.FILE_PATH) +
              '?ref=' + encodeURIComponent(CONFIG.GITHUB_BRANCH) +
              '&_=' + Date.now();

  let res;
  try {
    res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
  } catch (e) {
    throw new Error('اتصال به GitHub برقرار نشد. اتصال اینترنت خود را بررسی کنید.');
  }

  if (res.status === 404) return null;

  if (!res.ok) {
    if (res.status === 401) throw new Error('توکن GitHub نامعتبر است (401).');
    if (res.status === 403) throw new Error('دسترسی کافی نیست یا محدودیت نرخ (403).');
    if (res.status === 409) throw new Error('تضاد در فایل — صفحه را رفرش کنید (409).');
    throw new Error('خطا در خواندن از GitHub (کد ' + res.status + ').');
  }

  return res.json();
}

async function githubPutFile(contentStr, sha, message) {
  const url = apiUrl('/contents/' + CONFIG.FILE_PATH);

  const body = {
    message: message || 'به‌روزرسانی matches.json از طریق داشبورد',
    content: b64EncodeUnicode(contentStr),
    branch: CONFIG.GITHUB_BRANCH
  };
  if (sha) body.sha = sha;

  let res;
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify(body)
    });
  } catch (e) {
    throw new Error('اتصال به GitHub برقرار نشد. اتصال اینترنت خود را بررسی کنید.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      if (j && j.message) detail = ' — ' + j.message;
    } catch (e) { /* ignore */ }

    if (res.status === 401) throw new Error('توکن GitHub نامعتبر است (401).');
    if (res.status === 403) throw new Error('دسترسی نوشتن وجود ندارد. مطمئن شوید توکن دسترسی Contents: Read and write دارد (403).' + detail);
    if (res.status === 404) throw new Error('ریپو یا مسیر فایل پیدا نشد (404).' + detail);
    if (res.status === 409) throw new Error('تضاد نسخه — فایل همزمان تغییر کرده است. صفحه را رفرش کنید (409).');
    if (res.status === 422) throw new Error('داده ارسالی نامعتبر است (422).' + detail);
    throw new Error('خطا در ذخیره روی GitHub (کد ' + res.status + ').' + detail);
  }

  return res.json();
}

/* --------------------------------------------------------------
   ۸) نرمال‌سازی + ترتیب کلیدها
   -------------------------------------------------------------- */
function normalizeMatch(m) {
  const out = {
    date: String((m && m.date) || ''),
    time: String((m && m.time) || ''),
    team1: String((m && m.team1) || ''),
    team1Image: String((m && m.team1Image) || NO_IMAGE),
    team2: String((m && m.team2) || ''),
    team2Image: String((m && m.team2Image) || NO_IMAGE),
    league: String((m && m.league) || '')
  };
  if (m && m.isClub === true) out.isClub = true;
  if (m && m.countdown === true) out.countdown = true;
  return out;
}

/* --------------------------------------------------------------
   ۹) localStorage
   -------------------------------------------------------------- */
function saveLocal() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(allMatches));
    localStorage.setItem(LS_DIRTY, isDirty ? '1' : '0');
  } catch (e) { /* ignore quota errors */ }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return {
      matches: data.map(normalizeMatch),
      dirty: localStorage.getItem(LS_DIRTY) === '1'
    };
  } catch (e) {
    return null;
  }
}

/* --------------------------------------------------------------
   ۱۰) وضعیت (Status bar)
   -------------------------------------------------------------- */
function updateStatus(mode) {
  const dot = $('statusDot');
  const text = $('statusText');
  const pushBtn = $('pushBtn');

  if (mode === 'loading') {
    dot.className = 'status-dot loading';
    text.textContent = 'در حال بارگذاری...';
    pushBtn.disabled = true;
    pushBtn.classList.remove('btn-primary');
    pushBtn.classList.add('btn-ghost');
    return;
  }

  if (isDirty) {
    dot.className = 'status-dot dirty';
    text.textContent = 'تغییرات ذخیره‌نشده';
    pushBtn.disabled = false;
    pushBtn.classList.remove('btn-ghost');
    pushBtn.classList.add('btn-primary');
  } else {
    dot.className = 'status-dot saved';
    text.textContent = 'همه چیز ذخیره شده';
    pushBtn.disabled = true;
    pushBtn.classList.remove('btn-primary');
    pushBtn.classList.add('btn-ghost');
  }
}

/* --------------------------------------------------------------
   ۱۱) رندر لیست مسابقات (گروه‌بندی بر اساس تاریخ)
   -------------------------------------------------------------- */
function renderMatches() {
  const listEl = $('matchesList');
  const countEl = $('matchCount');
  const now = new Date();

  const future = allMatches
    .map(function (m, i) { return { m: m, i: i }; })
    .filter(function (item) {
      const dt = matchDateTime(item.m);
      return dt && dt.getTime() > now.getTime();
    })
    .sort(function (a, b) {
      return matchDateTime(a.m) - matchDateTime(b.m);
    });

  if (future.length === 0) {
    listEl.innerHTML = '<div class="empty">هیچ مسابقه‌ی آینده‌ای وجود ندارد.</div>';
    countEl.textContent = '۰ مسابقه';
    return;
  }

  countEl.textContent = toFa(future.length) + ' مسابقه';

  const groups = {};
  const order = [];
  future.forEach(function (item) {
    const key = item.m.date || '';
    if (!groups[key]) { groups[key] = []; order.push(key); }
    groups[key].push(item);
  });

  let html = '';
  order.forEach(function (dateKey) {
    html += '<div class="date-group">';
    html += '<div class="date-header">' +
              ICONS.calendar +
              '<span>' + esc(formatDateHeader(dateKey)) + '</span>' +
              '<span class="date-greg">' + esc(dateKey) + '</span>' +
            '</div>';

    groups[dateKey].forEach(function (item) {
      html += renderMatchCard(item.m, item.i);
    });

    html += '</div>';
  });

  listEl.innerHTML = html;
}

function renderMatchCard(m, index) {
  const t1img = previewSrc(m.team1Image || NO_IMAGE);
  const t2img = previewSrc(m.team2Image || NO_IMAGE);
  const fallback = previewSrc(NO_IMAGE);

  const badges = [];
  if (m.countdown === true) {
    badges.push('<span class="badge badge-important">' + ICONS.star + ' بازی مهم</span>');
  }

  return '' +
    '<div class="match-card">' +
      '<div class="match-teams">' +
        '<div class="team">' +
          '<img src="' + esc(t1img) + '" alt="" onerror="this.onerror=null;this.src=\'' + fallback + '\';">' +
          '<span>' + esc(m.team1) + '</span>' +
        '</div>' +
        '<div class="match-center">' +
          '<div class="match-time">' + esc(m.time || '--:--') + '</div>' +
          (m.league ? '<div class="match-league" title="' + esc(m.league) + '">' + esc(m.league) + '</div>' : '') +
        '</div>' +
        '<div class="team">' +
          '<img src="' + esc(t2img) + '" alt="" onerror="this.onerror=null;this.src=\'' + fallback + '\';">' +
          '<span>' + esc(m.team2) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="match-footer">' +
        '<div class="badges">' + (badges.length ? badges.join('') : '') + '</div>' +
        '<div class="match-actions">' +
          '<button type="button" class="icon-btn" data-action="edit" data-index="' + index + '" title="ویرایش">' + ICONS.edit + '</button>' +
          '<button type="button" class="icon-btn danger" data-action="delete" data-index="' + index + '" title="حذف">' + ICONS.trash + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* --------------------------------------------------------------
   ۱۲) بارگذاری از GitHub
   -------------------------------------------------------------- */
async function loadFromGitHub(silent) {
  if (!silent) updateStatus('loading');
  showLoading('در حال بارگذاری مسابقات از GitHub...');

  try {
    const data = await githubGetFile();

    if (!data) {
      allMatches = [];
      isDirty = false;
      saveLocal();
      renderMatches();
      updateStatus();
      if (!silent) showToast('فایل matches.json پیدا نشد؛ با اولین ذخیره ساخته می‌شود.', 'info');
      return;
    }

    let text = '';
    try {
      text = b64DecodeUnicode(data.content || '');
    } catch (e) {
      throw new Error('محتوای فایل matches.json قابل خواندن نیست.');
    }

    let parsed;
    try {
      parsed = text.trim() ? JSON.parse(text) : [];
    } catch (e) {
      throw new Error('فایل matches.json یک JSON معتبر نیست.');
    }

    if (!Array.isArray(parsed)) parsed = [];

    allMatches = parsed.map(normalizeMatch);
    isDirty = false;
    saveLocal();
    renderMatches();
    updateStatus();
    if (!silent) showToast('مسابقات با موفقیت بارگذاری شد.', 'success');

  } catch (err) {
    console.error(err);
    showToast(err.message || 'خطای ناشناخته در بارگذاری.', 'error');
    updateStatus();
  } finally {
    hideLoading();
  }
}

/* --------------------------------------------------------------
   ۱۳) ارسال همه‌ی مسابقات به GitHub
   -------------------------------------------------------------- */
async function pushToGitHub() {
  if (!isDirty) {
    showToast('تغییری برای ذخیره وجود ندارد.', 'info');
    return;
  }

  showLoading('در حال ذخیره روی GitHub...');
  try {
    const fresh = await githubGetFile();
    const sha = fresh ? fresh.sha : null;

    const normalized = allMatches.map(normalizeMatch);
    const content = JSON.stringify(normalized, null, 2);

    await githubPutFile(content, sha, 'به‌روزرسانی برنامه مسابقات از داشبورد');

    allMatches = normalized;
    isDirty = false;
    saveLocal();
    renderMatches();
    updateStatus();

    showToast('همه‌ی مسابقات با موفقیت روی GitHub ذخیره شدند.', 'success');

  } catch (err) {
    console.error(err);
    showToast(err.message || 'خطا در ذخیره‌سازی.', 'error');
  } finally {
    hideLoading();
  }
}

/* --------------------------------------------------------------
   ۱۴) حذف مسابقات تمام‌شده (فقط در حافظه)
   -------------------------------------------------------------- */
function deleteFinishedMatches() {
  const now = new Date();
  const before = allMatches.length;

  const kept = allMatches.filter(function (m) {
    const dt = matchDateTime(m);
    return dt && dt.getTime() > now.getTime();
  });

  const removed = before - kept.length;

  if (removed === 0) {
    showToast('هیچ مسابقه‌ی تمام‌شده‌ای برای حذف وجود ندارد.', 'info');
    return;
  }

  if (!confirm(toFa(removed) + ' مسابقه‌ی تمام‌شده حذف خواهد شد.\n\n' +
               'توجه: این تغییرات فعلاً فقط در داشبورد اعمال می‌شوند. برای اعمال روی GitHub، دکمهٔ «افزودن به برنامه» را بزنید.\n\nادامه می‌دهید؟')) {
    return;
  }

  allMatches = kept;

  if (editingIndex !== null) resetForm();

  isDirty = true;
  saveLocal();
  renderMatches();
  updateStatus();

  showToast(toFa(removed) + ' مسابقه‌ی تمام‌شده حذف شد. برای اعمال روی GitHub، دکمهٔ «افزودن به برنامه» را بزنید.', 'warning');
}

/* --------------------------------------------------------------
   ۱۵) فرم — افزودن / ویرایش
   -------------------------------------------------------------- */
function resetForm() {
  editingIndex = null;
  $('matchForm').reset();
  $('date').value = todayStr();
  $('time').value = '';
  $('league').value = '';
  $('important').checked = false;
  $('national').checked = true;
  picker1.clear();
  picker2.clear();

  $('formTitle').textContent = 'افزودن مسابقه جدید';
  $('submitLabel').textContent = 'افزودن مسابقه';
  $('cancelEditBtn').hidden = true;
}

function startEdit(index) {
  const m = allMatches[index];
  if (!m) return;

  editingIndex = index;
  $('date').value = m.date || '';
  $('time').value = m.time || '';
  $('league').value = m.league || '';
  $('important').checked = (m.countdown === true);
  $('national').checked = (m.isClub === true);

  picker1.set(m.team1, m.team1Image);
  picker2.set(m.team2, m.team2Image);

  $('formTitle').textContent = 'ویرایش مسابقه';
  $('submitLabel').textContent = 'ذخیره تغییرات';
  $('cancelEditBtn').hidden = false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleSubmit(e) {
  e.preventDefault();

  const date = $('date').value.trim();
  const rawTime = $('time').value.trim();
  const league = $('league').value.trim();
  const important = $('important').checked;
  const national = $('national').checked;
  const t1 = picker1.get();
  const t2 = picker2.get();

  if (!date) { showToast('لطفاً تاریخ مسابقه را وارد کنید.', 'error'); $('date').focus(); return; }

  if (!rawTime) { showToast('لطفاً ساعت مسابقه را وارد کنید (مثلاً 19:30).', 'error'); $('time').focus(); return; }
  if (!isValidTime(rawTime)) {
    showToast('ساعت باید به فرمت 24 ساعته و به شکل HH:MM باشد (مثلاً 19:30).', 'error');
    $('time').focus();
    return;
  }
  const time = normalizeTime(rawTime);

  if (!t1.name) { showToast('لطفاً نام تیم اول را وارد کنید.', 'error'); $('team1').focus(); return; }
  if (!t2.name) { showToast('لطفاً نام تیم دوم را وارد کنید.', 'error'); $('team2').focus(); return; }
  if (!league) { showToast('لطفاً نام لیگ را وارد کنید.', 'error'); $('league').focus(); return; }
  if (t1.name === t2.name) { showToast('تیم اول و دوم نمی‌توانند یکسان باشند.', 'error'); return; }

  const match = {
    date: date,
    time: time,
    team1: t1.name,
    team1Image: t1.image || NO_IMAGE,
    team2: t2.name,
    team2Image: t2.image || NO_IMAGE,
    league: league
  };

  if (national) match.isClub = true;
  if (important) match.countdown = true;

  const isEdit = (editingIndex !== null);

  if (isEdit) {
    const copy = allMatches.slice();
    copy[editingIndex] = match;
    allMatches = copy;
  } else {
    allMatches = allMatches.concat([match]);
  }

  isDirty = true;
  saveLocal();
  renderMatches();
  updateStatus();
  resetForm();

  showToast(
    isEdit
      ? 'مسابقه ویرایش شد. برای ذخیره روی GitHub، دکمهٔ «افزودن به برنامه» را بزنید.'
      : 'مسابقه به داشبورد اضافه شد. برای ذخیره روی GitHub، دکمهٔ «افزودن به برنامه» را بزنید.',
    'info'
  );
}

/* --------------------------------------------------------------
   ۱۶) Autocomplete تیم‌ها
   -------------------------------------------------------------- */
function createTeamPicker(key) {
  const input = $(key);
  const hidden = $(key + 'Image');
  const preview = $(key + 'Preview');
  const box = $(key + 'Suggestions');

  function refreshPreview() {
    const fallback = previewSrc(NO_IMAGE);
    preview.onerror = function () { this.onerror = null; this.src = fallback; };
    preview.src = previewSrc(hidden.value || NO_IMAGE);
  }

  function closeBox() { box.classList.remove('open'); box.innerHTML = ''; }

  function openBox(query) {
    const q = String(query || '').trim();
    let results;

    if (!q) {
      results = TEAMS.slice(0, 40);
    } else {
      results = TEAMS.filter(function (t) { return t.name.indexOf(q) !== -1; });
      if (results.length === 0) {
        const words = q.split(/\s+/).filter(Boolean);
        results = TEAMS.filter(function (t) {
          return words.every(function (w) { return t.name.indexOf(w) !== -1; });
        });
      }
    }

    if (results.length === 0) {
      box.innerHTML = '<div class="suggestion-empty">تیمی پیدا نشد — می‌توانید نام را آزادانه تایپ کنید (لوگو: بدون لوگو)</div>';
      box.classList.add('open');
      return;
    }

    const fallback = previewSrc(NO_IMAGE);
    box.innerHTML = results.slice(0, 50).map(function (t) {
      return '<div class="suggestion-item" data-name="' + esc(t.name) + '" data-image="' + esc(t.image) + '">' +
               '<img src="' + esc(previewSrc(t.image)) + '" alt="" onerror="this.onerror=null;this.src=\'' + fallback + '\';">' +
               '<span>' + esc(t.name) + '</span>' +
             '</div>';
    }).join('');
    box.classList.add('open');
  }

  input.addEventListener('input', function () {
    const val = input.value.trim();
    const exact = TEAMS.find(function (t) { return t.name === val; });
    hidden.value = exact ? exact.image : NO_IMAGE;
    refreshPreview();
    openBox(input.value);
  });

  input.addEventListener('focus', function () { openBox(input.value); });

  box.addEventListener('mousedown', function (e) {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;
    e.preventDefault();
    input.value = item.dataset.name;
    hidden.value = item.dataset.image;
    refreshPreview();
    closeBox();
  });

  input.addEventListener('blur', function () { setTimeout(closeBox, 160); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBox(); });

  refreshPreview();

  return {
    set: function (name, image) {
      input.value = name || '';
      hidden.value = image || NO_IMAGE;
      refreshPreview();
    },
    clear: function () {
      input.value = '';
      hidden.value = NO_IMAGE;
      refreshPreview();
    },
    get: function () {
      const name = input.value.trim();
      let image = hidden.value || NO_IMAGE;
      const exact = TEAMS.find(function (t) { return t.name === name; });
      if (exact) image = exact.image;
      else if (!name) image = NO_IMAGE;
      return { name: name, image: image };
    }
  };
}

/* --------------------------------------------------------------
   ۱۷) فرمت خودکار ساعت
   -------------------------------------------------------------- */
function setupTimeInput() {
  const timeEl = $('time');
  if (!timeEl) return;

  timeEl.addEventListener('input', function (e) {
    const raw = this.value;
    const inputType = (e.inputType || '');
    const isDeleting = inputType.indexOf('delete') !== -1;

    let digits = raw.replace(/\D/g, '');
    if (digits.length > 4) digits = digits.slice(0, 4);

    let formatted = '';
    if (digits.length === 0) {
      formatted = '';
    } else if (digits.length === 1) {
      formatted = digits;
    } else if (digits.length === 2) {
      if (raw.indexOf(':') !== -1 || !isDeleting) {
        formatted = digits + ':';
      } else {
        formatted = digits;
      }
    } else if (digits.length === 3) {
      formatted = digits.slice(0, 2) + ':' + digits.slice(2);
    } else {
      formatted = digits.slice(0, 2) + ':' + digits.slice(2, 4);
    }

    this.value = formatted;
  });

  timeEl.addEventListener('keypress', function (e) {
    const ch = e.key;
    if (ch.length === 1 && !/\d/.test(ch) && ch !== ':') {
      e.preventDefault();
    }
  });
}

/* --------------------------------------------------------------
   ۱۸) رویدادها
   -------------------------------------------------------------- */
function bindEvents() {
  $('matchForm').addEventListener('submit', handleSubmit);
  $('cancelEditBtn').addEventListener('click', function () {
    resetForm();
    showToast('ویرایش لغو شد.', 'info');
  });

  $('reloadBtn').addEventListener('click', function () {
    if (isDirty) {
      if (!confirm('تغییرات ذخیره‌نشده از بین خواهند رفت.\n\nادامه می‌دهید؟')) return;
      isDirty = false;
    }
    resetForm();
    loadFromGitHub(false);
  });

  $('deleteFinishedBtn').addEventListener('click', deleteFinishedMatches);
  $('pushBtn').addEventListener('click', pushToGitHub);

  $('matchesList').addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const index = Number(btn.dataset.index);
    const m = allMatches[index];
    if (!m) return;

    if (btn.dataset.action === 'edit') {
      startEdit(index);
      return;
    }

    if (btn.dataset.action === 'delete') {
      const label = (m.team1 || '') + ' - ' + (m.team2 || '');
      if (!confirm('آیا از حذف مسابقهٔ «' + label + '» مطمئن هستید؟')) return;

      allMatches = allMatches.filter(function (_, i) { return i !== index; });

      if (editingIndex === index) resetForm();
      else if (editingIndex !== null && editingIndex > index) editingIndex--;

      isDirty = true;
      saveLocal();
      renderMatches();
      updateStatus();

      showToast('مسابقه حذف شد. برای اعمال روی GitHub، دکمهٔ «افزودن به برنامه» را بزنید.', 'info');
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });
}

/* --------------------------------------------------------------
   ۱۹) راه‌اندازی اولیه
   -------------------------------------------------------------- */
function init() {
  picker1 = createTeamPicker('team1');
  picker2 = createTeamPicker('team2');

  setupTimeInput();
  $('date').value = todayStr();
  bindEvents();

  if (!CONFIG.GITHUB_TOKEN || CONFIG.GITHUB_TOKEN.indexOf('PASTE_YOUR') !== -1 || CONFIG.GITHUB_TOKEN.trim() === '') {
    showToast('توکن GitHub تنظیم نشده است. مقدار GITHUB_TOKEN را در ابتدای فایل وارد کنید.', 'error');
    $('matchesList').innerHTML = '<div class="empty">برای شروع، توکن GitHub را در متغیر <code>CONFIG.GITHUB_TOKEN</code> قرار دهید.</div>';
    updateStatus();
    return;
  }

  const local = loadLocal();
  if (local && local.dirty) {
    allMatches = local.matches;
    isDirty = true;
    renderMatches();
    updateStatus();
    showToast('تغییرات ذخیره‌نشده از آخرین بازدید بازیابی شد. برای ذخیره روی GitHub، دکمهٔ «افزودن به برنامه» را بزنید.', 'warning');
    return;
  }

  loadFromGitHub(false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
