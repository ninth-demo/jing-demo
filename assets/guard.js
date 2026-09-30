/*!
 * 靚民宿 網站提案示範
 * © 2026 Ninth 九號. All rights reserved. 本程式碼與設計為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 * 示範網站保護：浮水印、防複製、防嵌入、網域鎖
 */
(function () {
  "use strict";

  var OWNER = "Ninth 九號";
  var BLOCK_HTML =
    '<body style="font-family:sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#3D3F42;color:#fff;text-align:center;padding:24px">' +
    '<div><h1 style="font-size:24px">此頁面為 Ninth 九號的網站提案示範</h1>' +
    '<p style="opacity:.8">本網站之設計與程式碼受著作權法保護，未經授權不得轉載、重製或使用。<br>如需製作網站，請洽 ninthlab.com.tw</p></div></body>';

  // 1. 網域鎖：只在 Ninth 的示範網址或本機預覽時顯示
  var h = location.hostname, p = location.pathname;
  var ok = h === "" || h === "localhost" || h === "127.0.0.1" ||
    (h === "ninth-demo.github.io" && p.indexOf("/jing-demo") === 0);
  if (!ok) { document.documentElement.innerHTML = BLOCK_HTML; return; }

  // 2. 防嵌入：不允許被其他網站用 iframe 包起來冒用
  if (window.top !== window.self) {
    try { window.top.location = window.self.location; } catch (e) { document.documentElement.innerHTML = BLOCK_HTML; return; }
  }

  // 3. 浮水印：畫成背景圖蓋在整頁最上層，被刪掉會自動補回
  function makeTile() {
    var c = document.createElement("canvas"), dpr = window.devicePixelRatio || 1, w = 440, h2 = 270;
    c.width = w * dpr; c.height = h2 * dpr;
    var g = c.getContext("2d");
    g.scale(dpr, dpr);
    g.translate(w / 2, h2 / 2);
    g.rotate(-24 * Math.PI / 180);
    g.textAlign = "center";
    g.fillStyle = "rgba(61,63,66,0.10)";
    g.font = "700 22px 'Noto Sans TC', sans-serif";
    g.fillText("DEMO 示範網站", 0, -6);
    g.font = "500 13px 'Noto Sans TC', sans-serif";
    g.fillText(OWNER + "製作｜未經授權禁止使用", 0, 18);
    return c.toDataURL("image/png");
  }
  var tile = "";
  function paint() {
    var el = document.getElementById("wm");
    if (!el) {
      el = document.createElement("div");
      el.id = "wm";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
    }
    var s = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;display:block;opacity:1;visibility:visible;background-repeat:repeat;background-image:url(" + tile + ")";
    if (el.getAttribute("style") !== s) el.setAttribute("style", s);
  }
  function init() { tile = makeTile(); paint(); }
  function start() {
    init();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
    new MutationObserver(function () { if (tile) paint(); })
      .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class", "id"] });
    setInterval(function () { if (tile) paint(); }, 1500);
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);

  // 4. 防複製：擋右鍵、選取、拖曳、存檔、列印、檢視原始碼（表單欄位照常可以輸入）
  function inField(t) { return t && t.closest && t.closest("input,textarea,select,[contenteditable]"); }
  ["contextmenu", "dragstart"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); });
  });
  ["selectstart", "copy", "cut"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (!inField(e.target)) e.preventDefault(); });
  });
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (k === "f12" ||
        (mod && ["s", "u", "p"].indexOf(k) > -1) ||
        (mod && ["c", "a", "x"].indexOf(k) > -1 && !inField(e.target)) ||
        (mod && e.shiftKey && ["i", "j", "c"].indexOf(k) > -1) ||
        (e.metaKey && e.altKey && ["i", "j", "u"].indexOf(k) > -1)) {
      e.preventDefault();
    }
  });
  window.addEventListener("beforeprint", function () { document.body.style.visibility = "hidden"; });
  window.addEventListener("afterprint", function () { document.body.style.visibility = ""; });

  console.log("%c此網站為 " + OWNER + " 製作的提案示範，受著作權法保護，未經授權禁止複製使用。", "font-size:14px;color:#B23A2B;font-weight:bold");
})();
