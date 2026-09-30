/*!
 * 靚民宿 網站提案示範：民宿後台
 * © 2026 Ninth 九號. All rights reserved. 本程式碼為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var data = JG.Store.load(), today = JG.taipeiNow().date;
  var PANES = ["bookings", "avail", "rooms", "notices", "info"];
  var LOGO = '<svg viewBox="0 0 40 44" width="40" height="44" aria-hidden="true"><polygon points="20,1 38,11.5 38,32.5 20,43 2,32.5 2,11.5" fill="#3D3F42"/><polygon points="20,7 33,14.5 33,29.5 20,37 7,29.5 7,14.5" fill="none" stroke="#D9C3A0" stroke-width="1.5"/><text x="20" y="28.5" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Noto Serif TC, serif">靚</text></svg>';
  $("#login-logo").innerHTML = LOGO; $("#top-logo").innerHTML = LOGO;

  function flash(m) { var s = $("#saved"); s.textContent = m; s.classList.add("show"); clearTimeout(flash.t); flash.t = setTimeout(function () { s.classList.remove("show"); }, 2400); }
  function commit(m) {
    if (!JG.Store.save(data)) { flash("儲存空間不夠，請刪掉幾張照片再試"); data = JG.Store.load(); renderAll(); return; }
    renderAll(); if (m) flash(m);
  }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function armed(btn, label) {
    if (btn.dataset.armed) return true;
    btn.dataset.armed = "1"; var old = btn.textContent; btn.textContent = label || "確定刪除？";
    setTimeout(function () { delete btn.dataset.armed; btn.textContent = old; }, 3000);
    return false;
  }

  // ---------- 登入與分頁 ----------
  function authed() { try { return sessionStorage.getItem("jg-admin") === "1"; } catch (e) { return false; } }
  function showApp() { $("#login").style.display = "none"; $("#app").classList.add("on"); route(); }
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("#u").value.trim() === "demo" && $("#pw").value === "1234") { try { sessionStorage.setItem("jg-admin", "1"); } catch (x) {} showApp(); }
    else $("#login-err").textContent = "帳號或密碼不對。示範帳號是 demo，密碼是 1234。";
  });
  $("#logout").addEventListener("click", function () { try { sessionStorage.removeItem("jg-admin"); } catch (x) {} location.hash = ""; location.reload(); });
  function route() {
    var p = (location.hash || "#bookings").slice(1); if (PANES.indexOf(p) < 0) p = "bookings";
    document.querySelectorAll(".pane").forEach(function (el) { el.classList.toggle("on", el.id === "p-" + p); });
    document.querySelectorAll(".tabs a").forEach(function (a) { a.classList.toggle("on", a.dataset.p === p); });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // ---------- 訂房 ----------
  var STATUS = ["待確認", "已確認", "已入住", "已取消"];
  var HOLDS = { "已確認": 1, "已入住": 1 };
  function renderBookings() {
    var list = data.bookings.slice().sort(function (a, b) { return a.checkin < b.checkin ? -1 : 1; });
    var pending = list.filter(function (b) { return b.status === "待確認"; }).length;
    $("#badge").textContent = pending || ""; $("#badge").style.display = pending ? "" : "none";
    $("#bk-list").innerHTML = list.length ? list.map(function (b) {
      return '<article class="bk"><div class="hd"><span class="when">' + JG.fmt(b.checkin) + '</span><span class="st s-' + b.status + '">' + b.status + "</span></div>" +
        '<p class="ln"><b>' + JG.esc(b.roomName) + "</b>・" + b.nights + " 晚・" + b.guests + " 位・退房 " + JG.fmt(b.checkout) + "</p>" +
        '<p class="ln"><b>' + JG.esc(b.name) + '</b>　<a href="tel:' + b.phone + '">' + b.phone + "</a>" + (b.email ? "　" + JG.esc(b.email) : "") + "</p>" +
        '<p class="ln">合計 <b>' + JG.money(b.total) + "</b>・定金 <b>" + JG.money(b.deposit) + "</b>・抵達 " + JG.esc(b.arrive) + "</p>" +
        (b.memo ? '<p class="ln">備註：' + JG.esc(b.memo) + "</p>" : "") +
        '<div class="acts"><select data-st="' + b.id + '" aria-label="訂房狀態">' + STATUS.map(function (s) { return "<option" + (s === b.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select><button class="link-btn" type="button" data-del="' + b.id + '">刪除</button></div></article>';
    }).join("") : '<div class="empty">還沒有訂房。可以到網站的「訂房」頁送一筆測試訂房，再回來這裡看。</div>';
  }
  $("#bk-list").addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-st"); if (!id) return;
    var b = byId(data.bookings, id), was = b.status, next = e.target.value, nights = JG.nightsBetween(b.checkin, b.checkout), room = byId(data.rooms, b.room);
    var before = HOLDS[was] || 0, after = HOLDS[next] || 0;
    if (after > before) {
      if (room && JG.quote(data, room, b.checkin, b.checkout).short.length) { flash("這幾晚這個房型已經客滿，請先確認房況"); e.target.value = was; return; }
      JG.hold(data, b.room, nights, 1);
    }
    if (after < before) JG.hold(data, b.room, nights, -1);
    b.status = next;
    commit(after > before ? "已確認，那幾晚已自動扣掉一間" : after < before ? "已取消，那幾晚已放回一間" : "狀態改為「" + next + "」");
  });
  $("#bk-list").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-del");
    if (id && armed(e.target)) {
      var b = byId(data.bookings, id);
      if (HOLDS[b.status]) JG.hold(data, b.room, JG.nightsBetween(b.checkin, b.checkout), -1);
      data.bookings = data.bookings.filter(function (x) { return x.id !== id; }); commit("訂房已刪除");
    }
  });

  // ---------- 房況 ----------
  var month = today.slice(0, 7);
  function shift(m, n) { var y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1 + n; y += Math.floor(mo / 12); mo = ((mo % 12) + 12) % 12; return y + "-" + (mo < 9 ? "0" : "") + (mo + 1); }
  function renderAvail() {
    var sel = $("#av-room"), cur = sel.value;
    sel.innerHTML = data.rooms.map(function (r) { return '<option value="' + r.id + '">' + JG.esc(r.name) + "（共 " + r.count + " 間）</option>"; }).join("");
    if (cur && byId(data.rooms, cur)) sel.value = cur;
    var room = byId(data.rooms, sel.value); if (!room) { $("#av-cal").innerHTML = ""; return; }
    var first = month + "-01", html = JG.WEEK.map(function (w) { return '<span class="dow">' + w + "</span>"; }).join(""), used = [];
    $("#av-month").textContent = +month.slice(0, 4) + " 年 " + +month.slice(5, 7) + " 月";
    $("#av-prev").disabled = month <= today.slice(0, 7);
    for (var i = 0; i < JG.dayOf(first); i++) html += "<span></span>";
    for (var d = first; d.slice(0, 7) === month; d = JG.addDays(d, 1)) {
      var l = JG.left(data, room, d), past = d < today;
      if (l < room.count) used.push([d, room.count - l]);
      html += '<button type="button" class="d' + (l === 0 ? " full" : l < room.count ? " some" : "") + '" data-d="' + d + '"' + (past ? " disabled" : "") + ">" + +d.slice(8) + "<small>" + (past ? "" : l === 0 ? "客滿" : "剩 " + l + " 間") + "</small></button>";
    }
    $("#av-cal").innerHTML = html;
    $("#av-list").innerHTML = used.length ? used.map(function (u) {
      var who = data.bookings.filter(function (b) { return b.room === room.id && HOLDS[b.status] && u[0] >= b.checkin && u[0] < b.checkout; }).map(function (b) { return b.name; });
      return '<div class="it"><time>' + JG.fmt(u[0]) + "</time><span>訂走 " + u[1] + " 間" + (who.length ? "（網站訂房：" + who.map(JG.esc).join("、") + "）" : "（手動設定）") + "</span><span></span></div>";
    }).join("") : '<div class="it"><span></span><span class="muted">這個月都還有空房。</span><span></span></div>';
  }
  $("#av-room").addEventListener("change", renderAvail);
  $("#av-prev").addEventListener("click", function () { month = shift(month, -1); renderAvail(); });
  $("#av-next").addEventListener("click", function () { month = shift(month, 1); renderAvail(); });
  $("#av-cal").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
    var room = byId(data.rooms, $("#av-room").value), d = b.dataset.d, usedNow = room.count - JG.left(data, room, d);
    var next = usedNow >= room.count ? 0 : usedNow + 1;
    JG.hold(data, room.id, [d], next - usedNow);
    commit(JG.fmt(d) + "：" + (next === room.count ? "客滿" : "剩 " + (room.count - next) + " 間"));
  });

  // ---------- 房型與房價 ----------
  function num(v) { return Number(String(v).replace(/[^\d]/g, "")) || 0; }
  function renderRooms() {
    $("#room-editor").innerHTML = data.rooms.map(function (r) {
      var visual = r.photo ? '<img src="' + r.photo + '" alt="">' : window.ART_ROOM ? window.ART_ROOM(r) : '<div style="display:grid;place-items:center;height:100%;color:#fff;font-size:14px">還沒有照片</div>';
      return '<div class="room-edit" data-id="' + r.id + '"><div><div class="frame">' + visual + '</div><label class="upload">上傳照片<input type="file" accept="image/*" data-up="' + r.id + '"></label>' +
        (r.photo ? ' <button class="link-btn" type="button" data-rm="' + r.id + '">移除照片</button>' : "") + "</div>" +
        '<div class="form" style="gap:14px"><div class="row2"><div class="field"><label>房型名稱</label><input data-f="name" value="' + JG.esc(r.name) + '"></div><div class="field"><label>床</label><input data-f="bed" value="' + JG.esc(r.bed) + '"></div></div>' +
        '<div class="grid4"><div class="field"><label>間數</label><input data-f="count" inputmode="numeric" value="' + r.count + '"></div><div class="field"><label>人數</label><input data-f="guests" inputmode="numeric" value="' + r.guests + '"></div><div class="field"><label>平日房價</label><input data-f="weekday" inputmode="numeric" value="' + r.weekday + '"></div><div class="field"><label>假日房價</label><input data-f="weekend" inputmode="numeric" value="' + r.weekend + '"></div></div>' +
        '<div class="field"><label>房間介紹</label><textarea data-f="desc" rows="3">' + JG.esc(r.desc) + "</textarea></div>" +
        '<div class="field"><label>房內設備（用逗號分開）</label><input data-f="amenities" value="' + JG.esc(r.amenities.join("，")) + '"></div>' +
        '<div><button class="btn btn-dark btn-small" type="button" data-save="' + r.id + '">儲存</button></div></div></div>';
    }).join("");
  }
  $("#room-editor").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-save"), rm = e.target.getAttribute("data-rm");
    if (id) {
      var box = e.target.closest(".room-edit"), r = byId(data.rooms, id), v = function (k) { return box.querySelector('[data-f="' + k + '"]').value.trim(); };
      if (!v("name") || !num(v("count")) || !num(v("guests")) || !num(v("weekday")) || !num(v("weekend"))) { flash("名稱、間數、人數、平日和假日房價都要填"); return; }
      r.name = v("name"); r.bed = v("bed"); r.count = num(v("count")); r.guests = num(v("guests")); r.weekday = num(v("weekday")); r.weekend = num(v("weekend"));
      r.desc = v("desc"); r.amenities = v("amenities").split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
      commit("「" + r.name + "」已儲存，網站已更新");
    }
    if (rm) { byId(data.rooms, rm).photo = ""; commit("照片已移除"); }
  });
  $("#room-editor").addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-up"), f = e.target.files && e.target.files[0]; if (!id || !f) return;
    if (!/^image\//.test(f.type)) { flash("請選擇圖片檔"); return; }
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var s = Math.min(1, 1200 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); byId(data.rooms, id).photo = c.toDataURL("image/jpeg", 0.78); commit("照片已上傳，網站已更新");
    };
    img.onerror = function () { flash("這張圖片讀不出來，換一張試試"); };
    img.src = url;
  });

  // ---------- 公告 ----------
  function resetNt() { $("#nt-form").reset(); $("#nt-id").value = ""; $("#nt-d").value = today; $("#nt-submit").textContent = "發布公告"; $("#nt-cancel").style.display = "none"; $("#nt-err").textContent = ""; }
  function renderNotices() {
    $("#nt-list").innerHTML = JG.sortedNotices(data).map(function (n) {
      return '<div class="it"><time>' + n.date.replace(/-/g, ".") + "</time><span>" + (n.pinned ? '<span class="pin" style="background:var(--oak);font-size:12px;padding:1px 8px;margin-right:8px">置頂</span>' : "") + JG.esc(n.title) + '</span><span style="white-space:nowrap"><a class="link-btn edit" href="../notices.html#' + n.id + '" target="_blank" rel="noopener">看</a><button class="link-btn edit" type="button" data-edit="' + n.id + '">編輯</button><button class="link-btn" type="button" data-del="' + n.id + '">刪除</button></span></div>';
    }).join("") || '<div class="it"><span></span><span class="muted">還沒有公告。</span><span></span></div>';
  }
  $("#nt-list").addEventListener("click", function (e) {
    var ed = e.target.getAttribute("data-edit"), del = e.target.getAttribute("data-del");
    if (ed) { var n = byId(data.notices, ed); $("#nt-id").value = n.id; $("#nt-t").value = n.title; $("#nt-d").value = n.date; $("#nt-b").value = n.body; $("#nt-pin").checked = !!n.pinned; $("#nt-submit").textContent = "儲存修改"; $("#nt-cancel").style.display = ""; $("#nt-t").focus(); }
    if (del && armed(e.target)) { data.notices = data.notices.filter(function (x) { return x.id !== del; }); resetNt(); commit("公告已刪除"); }
  });
  $("#nt-cancel").addEventListener("click", resetNt);
  $("#nt-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var it = { title: $("#nt-t").value.trim(), date: $("#nt-d").value, body: $("#nt-b").value.trim(), pinned: $("#nt-pin").checked };
    if (!it.title || !it.date || !it.body) { $("#nt-err").textContent = "標題、日期、內容都要填。"; return; }
    var id = $("#nt-id").value;
    if (id) { Object.assign(byId(data.notices, id), it); resetNt(); commit("公告已更新"); }
    else { it.id = "a" + Date.now(); data.notices.push(it); resetNt(); commit("公告已發布"); }
  });

  // ---------- 民宿資訊 ----------
  function renderInfo() {
    var i = data.info;
    $("#i-notice").value = i.notice || ""; $("#i-cf").value = i.checkinFrom; $("#i-ct").value = i.checkinTo; $("#i-co").value = i.checkout;
    $("#i-qf").value = i.quietFrom; $("#i-qt").value = i.quietTo; $("#i-lic").value = i.license; $("#i-dr").value = i.depositRate;
  }
  $("#info-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var dr = num($("#i-dr").value);
    if (!$("#i-lic").value.trim()) { $("#i-err").textContent = "民宿登記證不能留空，網路住宿廣告依法要寫出編號。"; return; }
    if (dr < 0 || dr > 30) { $("#i-err").textContent = "定金比例請填 0 到 30 之間。連續假日要收到 50%，請在確認訂房時另外告知旅客。"; return; }
    $("#i-err").textContent = "";
    var i = data.info;
    i.notice = $("#i-notice").value.trim(); i.checkinFrom = $("#i-cf").value; i.checkinTo = $("#i-ct").value; i.checkout = $("#i-co").value;
    i.quietFrom = $("#i-qf").value; i.quietTo = $("#i-qt").value; i.license = $("#i-lic").value.trim(); i.depositRate = dr;
    commit("民宿資訊已儲存");
  });

  $("#reset").addEventListener("click", function (e) { if (!armed(e.target, "再按一次確定還原")) return; data = JG.Store.reset(); resetNt(); renderAll(); flash("已還原成示範資料"); });
  window.addEventListener("storage", function (e) { if (e.key === JG.KEY) { data = JG.Store.load(); renderAll(); } });

  function renderAll() { renderBookings(); renderAvail(); renderRooms(); renderNotices(); renderInfo(); }
  resetNt(); renderAll();
  if (authed()) showApp();
})();
