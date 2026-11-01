/* Exam Gym แนวสอบเข้า ม.1 — โรงเรียนปิยมิตรวิทยา ฝ่ายมัธยม
   static · no login · no network calls · progress in localStorage only */
(function () {
  'use strict';
  var B = window.BANK, KEY = 'kruom_eg_pcshs_m1_v1', $app = document.getElementById('app'), $timer = document.getElementById('timer');
  var LV = { 1: 'พื้นฐาน', 2: 'กลาง', 3: 'ท้าทาย' }, KK = ['ก', 'ข', 'ค', 'ง'];
  var tick = null;

  /* ---------- storage (เฉพาะในเครื่อง) ---------- */
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); s.res = s.res || {}; s.mock = s.mock || {}; s.hist = s.hist || {}; return s; } catch (e) { return { res: {}, mock: {}, hist: {} }; } }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  /* ---------- bank helpers ---------- */
  var ALL = {};
  Object.keys(B).forEach(function (sj) {
    B[sj].chapters.forEach(function (c) { c.items.forEach(function (q) { q.subj = sj; q.ch = c.no; ALL[q.id] = q; }); });
    B[sj].mock.items.forEach(function (q, i) { q.subj = sj; q.ch = q.c; q.mockNo = i + 1; ALL[q.id] = q; });
  });
  function chap(sj, no) { return B[sj].chapters.filter(function (c) { return c.no === no; })[0]; }
  function allItems(sj) { var a = []; B[sj].chapters.forEach(function (c) { a = a.concat(c.items); }); return a.concat(B[sj].mock.items); }
  function wrongIds(sj) { return allItems(sj).filter(function (q) { return S.res[q.id] === 0; }).map(function (q) { return q.id; }); }
  function stat(items) { var d = 0, ok = 0; items.forEach(function (q) { if (q.id in S.res) { d++; if (S.res[q.id] === 1) ok++; } }); return { n: items.length, d: d, ok: ok }; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(v) { // รับเลขไทย/จุลภาค/ช่องว่าง
    v = String(v || '').trim().replace(/[๐-๙]/g, function (d) { return '๐๑๒๓๔๕๖๗๘๙'.indexOf(d); }).replace(/[,\s]/g, '').replace(/^\+/, '').replace(/[−–]/g, '-');
    return /^-?\d+$/.test(v) ? parseInt(v, 10) : null;
  }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function isOk(q, ans) { return B[q.subj].kind === 'mcq' ? ans === q.a : norm(ans) === q.a; }
  function ansText(q) { return B[q.subj].kind === 'mcq' ? KK[q.a - 1] + '. ' + q.o[q.a - 1] : fmt(q.a); }
  function setSubj(sj) { document.body.className = sj ? 's-' + sj : ''; }
  function stopTimer() { if (tick) { clearInterval(tick); tick = null; } $timer.hidden = true; }

  /* ---------- views ---------- */
  function home() {
    setSubj('');
    var h = '<h1>ฝึกทำโจทย์แนวสอบเข้า ม.1 (จภ.)</h1><p class="lead">โจทย์ชุดเดียวกับคู่มือแนวสอบเข้า ม.1 ของโรงเรียนปิยมิตรวิทยา · ฝึกทีละบทพร้อมเฉลยทันที หรือทำข้อสอบจำลองแบบจับเวลา</p>' +
      '<div class="notice">⚠ เป็น<b>สื่อฝึกซ้อม ไม่ใช่ข้อสอบจริงและไม่ใช่เอกสารทางการ</b> โจทย์แต่งใหม่ทั้งหมด จำนวนข้อ/เวลาในข้อสอบจำลองเป็น <span class="hyp">สมมติฐาน</span> ตรวจประกาศล่าสุดจากหน่วยงานที่จัดสอบทุกครั้ง</div><div class="cards">';
    ['math', 'sci'].forEach(function (sj) {
      var st = stat(allItems(sj)), w = wrongIds(sj).length;
      h += '<a class="card ' + sj + '" href="#/s/' + sj + '" data-subj="' + sj + '"><h3>' + B[sj].name + '</h3><p>' + B[sj].chapters.length + ' บท · ' + st.n + ' ข้อ · ' +
        (B[sj].kind === 'fill' ? 'เติมคำตอบเป็นตัวเลข' : 'ปรนัย 4 ตัวเลือก') + '</p><p>ทำแล้ว ' + st.d + '/' + st.n + ' ข้อ · ถูก ' + st.ok + (w ? ' · ข้อที่ยังผิด ' + w : '') + '</p>' +
        '<div class="bar"><i style="width:' + Math.round(100 * st.d / st.n) + '%"></i></div></a>';
    });
    h += '</div><h2>วันสอบ (ประกาศจริง)</h2><p class="small">อาทิตย์ 8 พฤศจิกายน 2569 · คณิตศาสตร์ 09.00–11.00 น. · วิทยาศาสตร์ 12.30–14.30 น.</p>';
    $app.innerHTML = h;
  }

  function subject(sj) {
    setSubj(sj);
    var X = B[sj], w = wrongIds(sj).length, m = S.mock[sj];
    var h = '<p class="small"><a href="#/">← หน้าแรก</a></p><h1>' + X.name + '</h1><p class="lead">เลือกบทเพื่อฝึกพร้อมเฉลยทันที · ระดับ: พื้นฐาน / กลาง / ท้าทาย</p><div class="list">';
    X.chapters.forEach(function (c) {
      var st = stat(c.items);
      h += '<a class="row" href="#/p/' + sj + '/c' + c.no + '"><span class="n">' + c.no + '</span><span class="t"><b>' + esc(c.title) + '</b><small>' + c.items.length + ' ข้อ · ทำแล้ว ' + st.d + ' · ถูก ' + st.ok + ' · คู่มือหน้า ' + c.page + '</small></span></a>';
    });
    h += '<a class="row mock" href="#/m/' + sj + '"><span class="n">⏱</span><span class="t"><b>ข้อสอบจำลอง ' + X.mock.items.length + ' ข้อ · ' + X.mock.mins + ' นาที</b><small>' +
      (m && m.done ? 'ทำล่าสุดได้ ' + m.score + '/' + X.mock.items.length + ' คะแนน' : m && m.start ? 'กำลังทำอยู่ — แตะเพื่อทำต่อ' : 'จับเวลา ไม่เฉลยจนกว่าจะส่ง') + '</small></span></a>';
    h += '<a class="row wrong" href="#/p/' + sj + '/wrong"><span class="n">↺</span><span class="t"><b>ฝึกข้อที่ยังผิด</b><small>' + (w ? w + ' ข้อ (ตอบถูกแล้วจะหายจากรายการ)' : 'ยังไม่มี — ทำโจทย์ก่อน') + '</small></span></a>';
    h += '<a class="row" href="#/p/' + sj + '/lv3"><span class="n">★</span><span class="t"><b>รวมข้อระดับท้าทาย</b><small>' + allItems(sj).filter(function (q) { return q.l === 3; }).length + ' ข้อ จากทุกบท</small></span></a></div>';
    $app.innerHTML = h;
  }

  function qBody(q, n, N) {
    var h = '<div class="qh"><span class="qn">ข้อ ' + n + '/' + N + '</span><span class="lv lv' + q.l + '">' + LV[q.l] + '</span>';
    if (q.src) h += '<span class="src">' + esc(q.src) + '</span>';
    (q.tag || []).forEach(function (t) { h += '<span class="dtag">' + esc(t) + '</span>'; });
    h += '</div><div class="qt">' + q.t + '</div>';
    if (q.table) h += '<div class="tbl">' + q.table + '</div>';
    if (q.svg) h += '<div class="fig">' + q.svg + '</div>';
    return h;
  }
  function explain(q, ok) {
    var h = '<div class="fb ' + (ok ? 'ok' : 'bad') + '"><div class="v">' + (ok ? '✓ ถูกต้อง' : '✗ ยังไม่ถูก · คำตอบคือ ' + esc(ansText(q))) + '</div>';
    if (q.h) h += '<div class="h">หัวใจของข้อนี้: ' + q.h + '</div>';
    if (q.e) h += '<div>' + q.e + '</div>';
    if (q.calc) h += '<div class="calc">' + q.calc + '</div>';
    h += '<div class="pg">อ่านเพิ่ม: คู่มือ' + B[q.subj].name + ' ฉบับเต็ม ' + (q.mockNo ? 'ข้อสอบจำลอง ข้อ ' + q.mockNo + ' (เริ่มหน้า ' + q.page + ')' : 'บทที่ ' + q.ch + ' (เริ่มหน้า ' + q.page + ')') + '</div></div>';
    return h;
  }
  function answerUI(q, pre, lock) {
    if (B[q.subj].kind === 'mcq') {
      return '<div class="opts">' + q.o.map(function (o, i) {
        var c = pre === i + 1 ? ' sel' : ''; return '<button class="opt' + c + '" data-o="' + (i + 1) + '"' + (lock ? ' disabled' : '') + '><span class="k">' + KK[i] + '</span><span>' + o + '</span></button>';
      }).join('') + '</div>';
    }
    return '<div class="fill"><input id="ans" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" aria-label="คำตอบ (ตัวเลข)" placeholder="พิมพ์คำตอบ" value="' + (pre == null ? '' : esc(pre)) + '"' + (lock ? ' disabled' : '') + '>' +
      (lock === undefined ? '<button class="btn" id="check">ตรวจคำตอบ</button>' : '') + '</div>';
  }

  /* ----- practice: ฝึกทีละข้อ + เฉลยทันที ----- */
  function practice(sj, set, i) {
    stopTimer(); setSubj(sj);
    var items, title;
    if (set === 'wrong') { S.wl = S.wl || {}; if (!i || !S.wl[sj]) { S.wl[sj] = wrongIds(sj); save(); } items = S.wl[sj].map(function (id) { return ALL[id]; }).filter(Boolean); title = 'ข้อที่ยังผิด (ชุดที่เปิดตอนเริ่ม)'; }
    else if (set === 'lv3') { items = allItems(sj).filter(function (q) { return q.l === 3; }); title = 'ระดับท้าทาย'; }
    else { var c = chap(sj, +set.slice(1)); if (!c) return go('#/s/' + sj); items = c.items; title = 'บทที่ ' + c.no + ' ' + c.title; }
    if (!items.length) { $app.innerHTML = '<p class="small"><a href="#/s/' + sj + '">← ' + B[sj].name + '</a></p><div class="empty">ยังไม่มีข้อที่ผิด 🎉 ลองฝึกบทอื่นหรือทำข้อสอบจำลอง</div>'; return; }
    i = Math.max(0, Math.min(items.length - 1, i || 0));
    var q = items[i], done = false;
    var h = '<p class="small"><a href="#/s/' + sj + '">← ' + B[sj].name + '</a></p><div class="progress"><span>' + esc(title) + '</span><span>' + stat(items).ok + ' ถูก / ' + items.length + '</span></div>' +
      '<article class="q" data-id="' + q.id + '">' + qBody(q, i + 1, items.length) + answerUI(q) +
      '<div id="hintbox"></div><div id="fb"></div></article><div class="btns">' +
      '<button class="btn ghost" id="prev"' + (i ? '' : ' disabled') + '>← ข้อก่อน</button>' + (q.h ? '<button class="btn ghost" id="hint">ขอคำใบ้</button>' : '') +
      '<button class="btn" id="next">' + (i < items.length - 1 ? 'ข้อต่อไป →' : 'จบชุดนี้') + '</button></div>';
    $app.innerHTML = h; window.scrollTo(0, 0);
    var base = '#/p/' + sj + '/' + set + '/';
    function mark(ans) {
      if (done) return; var ok = isOk(q, ans); done = true;
      S.res[q.id] = ok ? 1 : 0; S.hist[q.id] = (S.hist[q.id] || 0) + 1; save();
      if (B[sj].kind === 'mcq') {
        [].forEach.call($app.querySelectorAll('.opt'), function (b) { var k = +b.dataset.o; b.disabled = true; if (k === q.a) b.classList.add('ok'); else if (k === ans) b.classList.add('bad'); });
      } else { var inp = document.getElementById('ans'); inp.disabled = true; inp.classList.add(ok ? 'ok' : 'bad'); document.getElementById('check').disabled = true; }
      document.getElementById('fb').innerHTML = explain(q, ok);
    }
    [].forEach.call($app.querySelectorAll('.opt'), function (b) { b.onclick = function () { mark(+b.dataset.o); }; });
    var chk = document.getElementById('check');
    if (chk) {
      var inp = document.getElementById('ans');
      chk.onclick = function () { if (norm(inp.value) === null) { inp.focus(); inp.placeholder = 'ใส่เป็นตัวเลขนะ'; inp.value = ''; return; } mark(inp.value); };
      inp.onkeydown = function (e) { if (e.key === 'Enter') chk.onclick(); };
    }
    var hb = document.getElementById('hint'); if (hb) hb.onclick = function () { document.getElementById('hintbox').innerHTML = '<div class="hint">💡 ' + q.h + '</div>'; hb.disabled = true; };
    document.getElementById('prev').onclick = function () { go(base + (i - 1)); };
    document.getElementById('next').onclick = function () { if (i < items.length - 1) go(base + (i + 1)); else go('#/s/' + sj); };
  }

  /* ----- mock: จับเวลา ไม่เฉลยจนกว่าจะส่ง ----- */
  function remain(m, X) { return m.start + X.mock.mins * 60000 - Date.now(); }
  function mmss(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function submit(sj, auto) {
    var X = B[sj], m = S.mock[sj], sc = 0;
    X.mock.items.forEach(function (q, k) { var a = m.ans[k], ok = a != null && a !== '' && isOk(q, a); if (ok) sc++; S.res[q.id] = ok ? 1 : 0; });
    m.done = true; m.score = sc; m.auto = !!auto; m.used = Math.min(Date.now() - m.start, X.mock.mins * 60000); save(); stopTimer(); go('#/r/' + sj);
  }
  function mock(sj, i) {
    setSubj(sj); var X = B[sj], m = S.mock[sj], N = X.mock.items.length;
    if (!m || (!m.start && !m.done)) {
      stopTimer();
      $app.innerHTML = '<p class="small"><a href="#/s/' + sj + '">← ' + X.name + '</a></p><h1>ข้อสอบจำลอง' + X.name + '</h1><div class="q"><p>• ' + N + ' ข้อ · เวลา ' + X.mock.mins + ' นาที (นับถอยหลัง) <span class="hyp">สมมติฐาน</span></p>' +
        '<p>• ' + (X.kind === 'fill' ? 'เติมคำตอบเป็นจำนวนเต็ม ห้ามใช้เครื่องคิดเลข เตรียมกระดาษทด' : 'ปรนัย 4 ตัวเลือก เลือกคำตอบที่ถูกที่สุด') + '</p><p>• ไม่เฉลยระหว่างทำ กด “ส่งคำตอบ” แล้วจะเห็นคะแนน แยกตามบท พร้อมเฉลยทุกข้อ</p>' +
        '<p>• ปิดหน้าเว็บแล้วกลับมาได้ เวลายังเดินต่อ · หมดเวลาระบบส่งให้อัตโนมัติ</p><p class="small">วันจริง: ' + (sj === 'math' ? 'คณิตศาสตร์ 09.00–11.00 น.' : 'วิทยาศาสตร์ 12.30–14.30 น.') + ' อาทิตย์ 8 พ.ย. 2569 · ลองทำในช่วงเวลาเดียวกันเพื่อซ้อมจังหวะ</p></div>' +
        '<div class="btns"><button class="btn" id="start">เริ่มจับเวลา</button></div>';
      document.getElementById('start').onclick = function () { S.mock[sj] = { start: Date.now(), ans: [] }; save(); go('#/m/' + sj + '/0'); };
      return;
    }
    if (m.done) return go('#/r/' + sj);
    if (remain(m, X) <= 0) return submit(sj, true);
    i = Math.max(0, Math.min(N - 1, i || 0)); var q = X.mock.items[i];
    var h = '<div class="progress"><span>ข้อสอบจำลอง' + X.name + '</span><span id="cnt"></span></div><article class="q" data-id="' + q.id + '">' + qBody(q, i + 1, N) + answerUI(q, m.ans[i], false) + '</article>' +
      '<div class="btns"><button class="btn ghost" id="prev"' + (i ? '' : ' disabled') + '>← ข้อก่อน</button><button class="btn ghost" id="next"' + (i < N - 1 ? '' : ' disabled') + '>ข้อต่อไป →</button></div>' +
      '<div class="nav" aria-label="ไปยังข้อ">' + X.mock.items.map(function (_, k) { var a = m.ans[k]; return '<button data-k="' + k + '" class="' + (a != null && a !== '' ? 'done' : '') + (k === i ? ' cur' : '') + '">' + (k + 1) + '</button>'; }).join('') + '</div>' +
      '<div class="btns"><button class="btn warn" id="submit">ส่งคำตอบ</button></div>';
    $app.innerHTML = h; window.scrollTo(0, 0);
    function cnt() { var d = m.ans.filter(function (a) { return a != null && a !== ''; }).length; document.getElementById('cnt').textContent = 'ตอบแล้ว ' + d + '/' + N; }
    function setA(v) { m.ans[i] = v; save(); var nb = $app.querySelector('.nav button[data-k="' + i + '"]'); nb.classList.toggle('done', v != null && v !== ''); cnt(); }
    cnt();
    [].forEach.call($app.querySelectorAll('.opt'), function (b) { b.onclick = function () { [].forEach.call($app.querySelectorAll('.opt'), function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); setA(+b.dataset.o); }; });
    var inp = document.getElementById('ans'); if (inp) { inp.oninput = function () { setA(inp.value.trim()); }; inp.onkeydown = function (e) { if (e.key === 'Enter' && i < N - 1) go('#/m/' + sj + '/' + (i + 1)); }; }
    document.getElementById('prev').onclick = function () { go('#/m/' + sj + '/' + (i - 1)); };
    document.getElementById('next').onclick = function () { go('#/m/' + sj + '/' + (i + 1)); };
    [].forEach.call($app.querySelectorAll('.nav button'), function (b) { b.onclick = function () { go('#/m/' + sj + '/' + b.dataset.k); }; });
    document.getElementById('submit').onclick = function () {
      var left = N - m.ans.filter(function (a) { return a != null && a !== ''; }).length;
      if (window.confirm((left ? 'ยังไม่ได้ตอบ ' + left + ' ข้อ\n' : '') + 'ยืนยันส่งคำตอบ?')) submit(sj, false);
    };
    $timer.hidden = false;
    function upd() { var r = remain(m, X); $timer.textContent = '⏱ ' + mmss(r); $timer.classList.toggle('low', r < 10 * 60000); if (r <= 0) submit(sj, true); }
    if (tick) clearInterval(tick); tick = setInterval(upd, 1000); upd();
  }
  function result(sj) {
    stopTimer(); setSubj(sj); var X = B[sj], m = S.mock[sj];
    if (!m || !m.done) return go('#/m/' + sj);
    var N = X.mock.items.length, per = {};
    X.mock.items.forEach(function (q, k) { var p = per[q.ch] = per[q.ch] || { n: 0, ok: 0 }; p.n++; if (m.ans[k] != null && m.ans[k] !== '' && isOk(q, m.ans[k])) p.ok++; });
    var h = '<p class="small"><a href="#/s/' + sj + '">← ' + X.name + '</a></p><h1>ผลข้อสอบจำลอง' + X.name + '</h1><div class="score"><div class="big" id="score">' + m.score + '/' + N + '</div><div>' + Math.round(100 * m.score / N) + '% · ใช้เวลา ' + mmss(m.used) + ' นาที' + (m.auto ? ' · <b>หมดเวลา ระบบส่งอัตโนมัติ</b>' : '') + '</div>' +
      '<div class="small">คะแนนนี้ใช้ดูจุดอ่อนเท่านั้น ไม่ใช่การคาดคะแนนสอบจริง</div></div><h2>แยกตามบท</h2><table class="res"><tr><th>บท</th><th>ถูก</th><th>ควรทบทวน</th></tr>';
    Object.keys(per).sort(function (a, b) { return a - b; }).forEach(function (c) {
      var p = per[c], ch = chap(sj, +c); h += '<tr><td>' + c + '. ' + esc(ch.title) + '</td><td>' + p.ok + '/' + p.n + '</td><td>' + (p.ok / p.n < 0.6 ? '<a href="#/p/' + sj + '/c' + c + '">ฝึกบทนี้ (หน้า ' + ch.page + ')</a>' : '✓') + '</td></tr>';
    });
    h += '</table><h2>เฉลยทุกข้อ</h2><div class="nav">' + X.mock.items.map(function (q, k) { var a = m.ans[k], ok = a != null && a !== '' && isOk(q, a); return '<button data-k="' + k + '" class="' + (ok ? 'ok' : 'bad') + '">' + (k + 1) + '</button>'; }).join('') + '</div>';
    X.mock.items.forEach(function (q, k) {
      var a = m.ans[k], has = a != null && a !== '', ok = has && isOk(q, a);
      h += '<details class="rv" id="rv' + k + '"' + (ok ? '' : ' open') + '><summary>' + (ok ? '✓' : '✗') + ' ข้อ ' + (k + 1) + ' · ตอบ: ' + (has ? esc(X.kind === 'mcq' ? KK[a - 1] : a) : '—') + '</summary>' + qBody(q, k + 1, N) + explain(q, ok) + '</details>';
    });
    h += '<div class="btns"><a class="btn ghost" href="#/p/' + sj + '/wrong">ฝึกข้อที่ยังผิด</a><button class="btn" id="again">ทำข้อสอบจำลองใหม่</button></div>';
    $app.innerHTML = h; window.scrollTo(0, 0);
    [].forEach.call($app.querySelectorAll('.nav button'), function (b) { b.onclick = function () { var d = document.getElementById('rv' + b.dataset.k); d.open = true; d.scrollIntoView(); }; });
    document.getElementById('again').onclick = function () { if (window.confirm('เริ่มข้อสอบจำลองใหม่? คะแนนครั้งก่อนจะถูกแทนที่')) { delete S.mock[sj]; save(); go('#/m/' + sj); } };
  }

  function about() {
    stopTimer(); setSubj('');
    $app.innerHTML = '<p class="small"><a href="#/">← หน้าแรก</a></p><h1>ความเป็นส่วนตัวและแหล่งอ้างอิง</h1><div class="q">' +
      '<p><b>ไม่ต้องล็อกอิน ไม่เก็บข้อมูลส่วนบุคคล</b> เว็บนี้ไม่มีเซิร์ฟเวอร์ ไม่มีระบบสถิติ/โฆษณา ไม่ส่งข้อมูลออกจากเครื่อง ความคืบหน้า (ข้อที่ทำ/ถูก/ผิด) เก็บใน localStorage ของเบราว์เซอร์เครื่องนี้เท่านั้น ลบได้ทุกเมื่อ</p>' +
      '<p><b>ที่มาของโจทย์</b> แต่งใหม่ทั้งหมดโดยโรงเรียนปิยมิตรวิทยา ฝ่ายมัธยม ให้ตรงขอบเขตหลักสูตรแกนกลาง ป.4–6 ป้าย “แนว สสวท. …” หมายถึงแนวของเนื้อหา ไม่ใช่ข้อสอบจริง ข้อมูลที่ติดป้าย “ข้อมูลสมมติเพื่อการเรียน” แต่งขึ้นเพื่อฝึกอ่านข้อมูล</p>' +
      '<p><b>ไม่ใช่เอกสารทางการ</b>ของโรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย หรือ สสวท. รูปแบบ จำนวนข้อ และเวลาในข้อสอบจำลองเป็น <span class="hyp">สมมติฐาน</span> ตรวจประกาศล่าสุดจากหน่วยงานที่จัดสอบ</p>' +
      '<p class="small">ชุดโจทย์รุ่น ' + esc(window.BANK_VERSION || '') + ' · ฟอนต์ IBM Plex Sans Thai (SIL Open Font License)</p></div>' +
      '<div class="btns"><button class="btn warn" id="wipe">ล้างความคืบหน้าทั้งหมดในเครื่องนี้</button></div>';
    document.getElementById('wipe').onclick = function () { if (window.confirm('ลบความคืบหน้าทั้งหมด?')) { localStorage.removeItem(KEY); S = load(); go('#/'); } };
  }

  /* ---------- router ---------- */
  function go(h) { if (location.hash === h) route(); else location.hash = h; }
  function route() {
    var p = (location.hash || '#/').slice(2).split('/');
    if (p[0] !== 'm') stopTimer();
    var sj = p[1]; if (p[0] && p[0] !== 'about' && !B[sj]) p = [''];
    switch (p[0]) {
      case 's': return subject(sj);
      case 'p': return practice(sj, p[2] || 'c1', +p[3] || 0);
      case 'm': return mock(sj, +p[2] || 0);
      case 'r': return result(sj);
      case 'about': return about();
      default: return home();
    }
  }
  window.addEventListener('hashchange', route); route();
  window.EG = { norm: norm, KEY: KEY }; // for tests
})();
