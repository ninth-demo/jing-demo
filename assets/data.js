/*!
 * 靚民宿 網站提案示範
 * © 2026 Ninth 九號. All rights reserved. 本程式碼與設計為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 */
/* 示範版把資料存在瀏覽器（localStorage）。正式版把 Store 換成資料庫即可，頁面程式不用改。 */
(function (global) {
  "use strict";

  var KEY = "jing-demo-v1";

  var SEED = {
    info: {
      notice: "",
      checkinFrom: "15:00", checkinTo: "19:00", checkout: "11:00",
      quietFrom: "21:00", quietTo: "08:00",
      license: "花蓮縣民宿 1604 號",
      depositRate: 30
    },
    // count：這個房型有幾間
    rooms: [
      { id: "double", name: "大型雙人房", count: 2, guests: 2, bed: "一張特大雙人床", weekday: 3600, weekend: 4200,
        desc: "一張特大雙人床，房間有自己的小陽台。早上拉開窗簾，外面是田和山。",
        amenities: ["專屬小陽台", "暖氣", "冷氣", "獨立衛浴", "平面電視", "吹風機", "免費 WiFi"], photo: "" },
      { id: "quad", name: "四人房（附陽台）", count: 2, guests: 4, bed: "兩張特大雙人床", weekday: 5200, weekend: 6000,
        desc: "兩張特大雙人床，一家四口或四個朋友都睡得開。陽台比較大，可以坐著看山。",
        amenities: ["陽台", "暖氣", "冷氣", "獨立衛浴", "平面電視", "吹風機", "免費 WiFi"], photo: "" }
    ],
    notices: [
      { id: "a1", date: "2026-09-10", pinned: true, title: "我們沒有在 Agoda 上架",
        body: "靚民宿沒有和 Agoda 簽約。如果你在 Agoda 上訂到我們，我們完全看不到你的資料，也收不到訂房。\n\n請從這個網站或 Booking.com 訂房，訂好後加 LINE 0965136111 告訴我們入住日期。" },
      { id: "a2", date: "2025-01-01", pinned: false, title: "一次性備品請自備",
        body: "配合環境部限塑政策，房間不主動提供牙刷、刮鬍刀這類一次性備品，請自己帶盥洗用品。\n\n（示範內容：實際公告由民宿在後台更新。）" }
    ],
    closed: {},     // { "2026-10-10": { double: 1, quad: 2 } } 表示那晚各房型已經被訂走幾間
    bookings: []
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var Store = {
    load: function () {
      try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
      return clone(SEED);
    },
    save: function (data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      return clone(SEED);
    }
  };

  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];
  function taipeiNow() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var date = o.year + "-" + o.month + "-" + o.day;
    var hour = o.hour === "24" ? 0 : +o.hour;
    return { date: date, hour: hour, time: (hour < 10 ? "0" : "") + hour + ":" + o.minute };
  }
  function addDays(d, n) { var x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
  function dayOf(d) { return new Date(d + "T00:00:00Z").getUTCDay(); }
  function isWeekendNight(d) { var w = dayOf(d); return w === 5 || w === 6; }
  function nightsBetween(a, b) { var out = []; for (var d = a; d < b; d = addDays(d, 1)) out.push(d); return out; }

  // 某晚某房型還剩幾間
  function left(data, room, d) {
    var used = (data.closed[d] && data.closed[d][room.id]) || 0;
    return Math.max(0, room.count - used);
  }
  function quote(data, room, checkin, checkout, qty) {
    qty = qty || 1;
    var nights = nightsBetween(checkin, checkout), total = 0, short = [];
    nights.forEach(function (d) {
      total += (isWeekendNight(d) ? room.weekend : room.weekday) * qty;
      if (left(data, room, d) < qty) short.push(d);
    });
    var rate = data.info.depositRate || 30;
    return { nights: nights, total: total, deposit: Math.round(total * rate / 100), rate: rate, short: short };
  }
  // 預訂或取消時，調整那幾晚被訂走的間數
  function hold(data, roomId, nights, qty) {
    nights.forEach(function (d) {
      var c = data.closed[d] || {};
      c[roomId] = Math.max(0, (c[roomId] || 0) + qty);
      if (!c[roomId]) delete c[roomId];
      if (Object.keys(c).length) data.closed[d] = c; else delete data.closed[d];
    });
  }

  function money(n) { return "NT$" + Number(n).toLocaleString("zh-TW"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function paras(s) { return esc(s).split(/\n{2,}/).map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; }).join(""); }
  function sortedNotices(data) {
    return data.notices.slice().sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
  }
  function fmt(d) { var p = d.split("-"); return +p[1] + "/" + +p[2] + "（" + WEEK[dayOf(d)] + "）"; }

  global.JG = { KEY: KEY, WEEK: WEEK, Store: Store, taipeiNow: taipeiNow, addDays: addDays, dayOf: dayOf,
                isWeekendNight: isWeekendNight, nightsBetween: nightsBetween, left: left, quote: quote, hold: hold,
                money: money, esc: esc, paras: paras, sortedNotices: sortedNotices, fmt: fmt };
})(window);
