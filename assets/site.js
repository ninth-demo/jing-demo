/*!
 * 靚民宿 網站提案示範
 * © 2026 Ninth 九號. All rights reserved. 本程式碼與插畫為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 */
(function () {
  "use strict";

  var SHOP = {
    tel: "0965-136-111", telHref: "tel:0965136111",
    lineId: "0965136111", line: "https://line.me/ti/p/~0965136111",
    address: "花蓮縣吉安鄉稻香村廣賢路一段 111 號",
    fb: "https://www.facebook.com/linagbnb/",
    map: "https://www.google.com/maps/search/?api=1&query=%E8%8A%B1%E8%93%AE%E7%B8%A3%E5%90%89%E5%AE%89%E9%84%89%E5%BB%A3%E8%B3%A2%E8%B7%AF%E4%B8%80%E6%AE%B5111%E8%99%9F"
  };
  window.SHOP = SHOP;
  var LINE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6C21.4 14.2 22 12.7 22 11c0-4.4-4.5-8-10-8z"/></svg>';
  window.LINE_ICON = LINE_ICON;

  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  var ART = {
    // 六角磚牆：灰、白、炭黑交錯，跟民宿床頭牆一樣
    hexWall: function (w, h, seed) {
      var r = 26, dx = r * 1.5, dy = r * Math.sqrt(3), rand = rng(seed || 7), s = "";
      var greys = ["#F2F2F0", "#E4E5E4", "#D3D5D5", "#BFC2C3", "#A4A7A9", "#8A8D90", "#5E6164"];
      var weights = [4, 5, 5, 4, 3, 2, 1], pool = [];
      greys.forEach(function (g, i) { for (var k = 0; k < weights[i]; k++) pool.push(g); });
      for (var c = -1; c * dx < w + r; c++) {
        for (var row = -1; row * dy < h + r; row++) {
          var cx = c * dx, cy = row * dy + (c % 2 ? dy / 2 : 0), pts = [];
          for (var a = 0; a < 6; a++) { var t = Math.PI / 3 * a; pts.push((cx + (r - 1.2) * Math.cos(t)).toFixed(1) + "," + (cy + (r - 1.2) * Math.sin(t)).toFixed(1)); }
          s += '<polygon points="' + pts.join(" ") + '" fill="' + pool[Math.floor(rand() * pool.length)] + '"/>';
        }
      }
      return '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><rect width="' + w + '" height="' + h + '" fill="#FAFAF8"/>' + s + "</svg>";
    },
    // 窗外：天空、中央山脈、吉安的稻田
    view: function (x0, w) {
      var s = '<svg viewBox="' + x0 + " 0 " + w + ' 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs><linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FC7DD"/><stop offset=".6" stop-color="#D6E8EF"/><stop offset="1" stop-color="#F3F7F4"/></linearGradient>' +
        '<radialGradient id="vsun"><stop offset="0" stop-color="#FFF7DA"/><stop offset=".35" stop-color="#FFF1C4" stop-opacity=".8"/><stop offset="1" stop-color="#FFF1C4" stop-opacity="0"/></radialGradient></defs>' +
        '<rect x="0" width="1010" height="700" fill="url(#vsky)"/>' +
        '<g class="sun"><circle cx="820" cy="150" r="130" fill="url(#vsun)"/><circle cx="820" cy="150" r="30" fill="#FFFBEA"/></g>' +
        '<path d="M0 330 L70 300 L130 312 L210 250 L280 280 L350 215 L420 260 L500 230 L570 268 L650 240 L730 290 L810 272 L890 312 L1010 296 L1010 470 L0 470Z" fill="#8FA9A8" opacity=".75"/>' +
        '<path d="M0 380 C120 330 220 350 320 340 C420 300 520 330 620 350 C720 330 840 360 1010 350 L1010 480 L0 480Z" fill="#5E8467"/>' +
        '<path d="M0 440 C200 420 400 430 600 438 C800 428 900 432 1010 426 L1010 480 L0 480Z" fill="#46705A"/>';
      // 一排防風林
      var rand = rng(3);
      for (var tx = 0; tx < 1010; tx += 14 + rand() * 10) {
        var th = 16 + rand() * 18;
        s += '<ellipse cx="' + tx.toFixed(0) + '" cy="' + (470 - th / 2).toFixed(0) + '" rx="' + (8 + rand() * 6).toFixed(0) + '" ry="' + (th / 2).toFixed(0) + '" fill="#3E6A4F"/>';
      }
      // 稻田：一格一格往遠處收
      s += '<rect x="0" y="470" width="1010" height="230" fill="#8DB86A"/>';
      var bands = [["#9CC476", 470, 500], ["#86B35F", 500, 540], ["#A4C97F", 540, 590], ["#7FAE58", 590, 650], ["#97C170", 650, 700]];
      bands.forEach(function (b) { s += '<rect x="0" y="' + b[1] + '" width="1010" height="' + (b[2] - b[1]) + '" fill="' + b[0] + '"/>'; });
      for (var i = -10; i <= 30; i++) {
        var bx = 505 + i * 28;
        s += '<line x1="' + (505 + i * 4) + '" y1="470" x2="' + (505 + (bx - 505) * 5) + '" y2="700" stroke="#6F9E4E" stroke-width="1.4" opacity=".55"/>';
      }
      s += '<path d="M470 700 L500 470 L512 470 L560 700Z" fill="#D9D2C0" opacity=".85"/>';
      s += "</svg>";
      return s;
    },
    // 房間示意：白牆、六角磚、原木床頭、白色床、黑框窗
    room: function (room) {
      var four = room.guests >= 4, s = '<svg viewBox="0 0 480 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<rect width="480" height="400" fill="#F7F7F5"/>' +
        '<path d="M0 0 H480 V38 C360 70 180 20 0 52Z" fill="#FFFFFF"/><path d="M0 52 C180 20 360 70 480 38" stroke="#FFE3A1" stroke-width="2" fill="none" opacity=".8"/>';
      s += '<g transform="translate(40 80)"><clipPath id="rc' + room.id + '"><rect width="250" height="190"/></clipPath><g clip-path="url(#rc' + room.id + ')">' + ART.hexWall(250, 190, room.id === "quad" ? 11 : 5).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") + "</g></g>";
      s += '<rect x="310" y="92" width="130" height="180" fill="#232528"/><rect x="318" y="100" width="54" height="164" fill="#CFE3EC"/><rect x="378" y="100" width="54" height="164" fill="#CFE3EC"/>' +
           '<rect x="318" y="190" width="114" height="74" fill="#86B35F"/><path d="M318 190 L350 170 L380 184 L410 166 L432 180 L432 190Z" fill="#5E8467"/>';
      s += '<rect x="30" y="226" width="' + (four ? 270 : 230) + '" height="58" fill="#D9C3A0"/>';
      function bed(x, w) {
        return '<rect x="' + x + '" y="268" width="' + w + '" height="56" fill="#FFFFFF" stroke="#C9CBCB" stroke-width="2"/>' +
               '<rect x="' + (x + 10) + '" y="250" width="' + (w / 2 - 14) + '" height="26" rx="6" fill="#FFFFFF" stroke="#C9CBCB" stroke-width="2"/>' +
               '<rect x="' + (x + w / 2 + 4) + '" y="250" width="' + (w / 2 - 14) + '" height="26" rx="6" fill="#FFFFFF" stroke="#C9CBCB" stroke-width="2"/>' +
               '<rect x="' + (x + w / 2 - 14) + '" y="256" width="28" height="22" rx="4" fill="#8A8D90"/>';
      }
      s += four ? bed(34, 124) + bed(172, 124) : bed(50, 190);
      s += '<rect x="0" y="336" width="480" height="64" fill="#D9C3A0"/><path d="M0 336 H480" stroke="#EDE3D2" stroke-width="4"/>';
      for (var p = 80; p < 480; p += 80) s += '<line x1="' + p + '" y1="340" x2="' + (p - 30) + '" y2="400" stroke="#CDB58E" stroke-width="2"/>';
      return s + "</svg>";
    },
    logo: '<svg viewBox="0 0 40 44" aria-hidden="true"><polygon points="20,1 38,11.5 38,32.5 20,43 2,32.5 2,11.5" fill="#3D3F42"/><polygon points="20,7 33,14.5 33,29.5 20,37 7,29.5 7,14.5" fill="none" stroke="#D9C3A0" stroke-width="1.5"/><text x="20" y="28.5" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Noto Serif TC, serif">靚</text></svg>'
  };
  window.ART = ART;

  window.roomVisual = function (room, note) {
    if (room.photo) return '<img src="' + room.photo + '" alt="' + JG.esc(room.name) + '" draggable="false">';
    return ART.room(room) + (note === false ? "" : '<span class="ph-note">民宿上傳照片後會顯示在這裡</span>');
  };

  var NAV = [["index.html", "首頁"], ["rooms.html", "房間"], ["around.html", "周邊"], ["notices.html", "公告"], ["stay.html", "住宿須知"]];
  var page = document.body.getAttribute("data-page");
  var data = JG.Store.load();

  var head = document.getElementById("site-head");
  if (head) {
    head.className = "site-head";
    head.innerHTML = '<div class="wrap">' +
      '<a class="logo" href="index.html">' + ART.logo + '<span><b>靚民宿</b><small>JING B&amp;B · HUALIEN</small></span></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav">選單</button>' +
      '<nav class="nav" id="main-nav" aria-label="主選單">' +
        NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === page ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") +
        '<a class="cta" href="booking.html"' + (page === "booking.html" ? ' aria-current="page"' : "") + ">訂房</a>" +
      "</nav></div>";
    var btn = head.querySelector(".menu-btn"), nav = head.querySelector(".nav");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "關閉" : "選單";
    });
    var nb = document.createElement("p");
    nb.className = "notice-bar";
    nb.textContent = data.info.notice || "";
    head.parentNode.insertBefore(nb, head);
  }

  var bar = document.createElement("div");
  bar.className = "demo-bar"; bar.setAttribute("role", "note");
  bar.innerHTML = '這是 <strong>Ninth 九號</strong> 為靚民宿製作的網站提案示範，並非民宿官方網站，不接受真實訂房。　<a href="admin/index.html">試用民宿後台</a>';
  document.body.insertBefore(bar, document.body.firstChild);

  var foot = document.getElementById("site-foot");
  if (foot) {
    var info = data.info;
    foot.className = "site-foot";
    foot.innerHTML = '<div class="wrap"><div class="foot-grid">' +
      '<div><p class="fname">靚民宿</p><p style="margin-top:14px">花蓮吉安的田中間，四間採光很好的房間。</p><span class="license">合法民宿　' + JG.esc(info.license) + "</span></div>" +
      "<div><h3>聯絡</h3><ul>" +
        '<li><a href="' + SHOP.telHref + '">' + SHOP.tel + "</a></li>" +
        '<li><a href="' + SHOP.line + '" target="_blank" rel="noopener">LINE ID ' + SHOP.lineId + "</a></li>" +
        "<li>" + SHOP.address + "</li>" +
        '<li><a href="' + SHOP.fb + '" target="_blank" rel="noopener">Facebook 粉絲專頁</a></li></ul></div>' +
      "<div><h3>入住</h3><ul>" +
        "<li>入住 " + JG.esc(info.checkinFrom) + "～" + JG.esc(info.checkinTo) + "</li>" +
        "<li>退房 " + JG.esc(info.checkout) + " 以前</li>" +
        "<li>每房都有專屬車位</li><li>只收現金</li>" +
        '<li><a href="legal.html">網站聲明</a></li></ul></div>' +
      "</div>" +
      '<div class="foot-legal"><span>房價與部分文字為示範內容，實際以民宿公告為準。</span>' +
      '<span>網站提案示範，© 2026 <a href="https://ninthlab.com.tw/" target="_blank" rel="noopener">Ninth 九號</a> 設計製作，未經授權請勿轉載使用。</span></div></div>';
  }

  var dock = document.createElement("div");
  dock.className = "dock";
  dock.innerHTML = '<a class="btn btn-line" href="' + SHOP.line + '" target="_blank" rel="noopener">' + LINE_ICON + 'LINE</a><a class="btn btn-dark" href="booking.html">訂房</a>';
  document.body.appendChild(dock);
})();
