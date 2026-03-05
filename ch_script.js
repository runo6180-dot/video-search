let currentData = []; // GASから届いたデータを保持
let currentSortKey = 'furigana'; // 初期ソートキー
let currentSortOrder = 'asc';

document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  const videoType = document.querySelector('input[name="videoType"]:checked').value;
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "検索中…";

  // 最新のURLに差し替え
  let apiURL = "";
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isNicoNico = url.includes("nicovideo.jp");

  if (videoType === "normal") {
    apiURL = isYouTube 
      ? "https://script.google.com/macros/s/AKfycbxhXbZALDuljvuXMf_bmr9DA13PPJ2okiVREPGTYkOSb9a-5ogRGsr0PBMJ5GTz1dVT_A/exec" 
      : "https://script.google.com/macros/s/AKfycbwDh0XbzdWxqu5fZulndiE-lIQI1EiWjXjxcl4P9eQp1KlyI69YSSwc-0xZ6HXEIU6dfw/exec";
  } else {
    apiURL = "https://script.google.com/macros/s/AKfycbyWiO2g0yEm9_1zsfEgcYnAbsJK_9TSX-okcJgjnkHtfimTUtSZwZhcXLDEDFZ9_5lzCQ/exec";
  }

  fetchJSONP(apiURL, url, (data) => {
    if (!data.matches || data.matches.length === 0) {
      resultArea.innerHTML = "<p>該当データが見つかりませんでした。</p>";
      return;
    }
    
    currentData = data.matches;
    // 初期状態は「名前（ふりがな）順」
    currentSortKey = 'furigana';
    currentSortOrder = 'asc';
    renderResult();
  });
});

// ヘッダーをクリックした時に呼ばれる関数
function changeSort(key) {
  if (currentSortKey === key) {
    // 同じキーなら昇順/降順を反転
    currentSortOrder = (currentSortOrder === 'asc') ? 'desc' : 'asc';
  } else {
    // 新しいキーなら昇順からスタート
    currentSortKey = key;
    currentSortOrder = 'asc';
  }
  renderResult();
}

/* renderResult 関数内のヘッダー部分を以下のように修正 */

function renderResult() {
  const resultArea = document.getElementById("resultArea");
  const channelName = currentData[0].channelName || "(不明)";

  sortData();

  // ★JS側の矢印文字（nameArrow, keyArrow）を削除
  // その代わり、classに currentSortOrder を入れることでCSS側が自動で矢印を出します
  let html = `
    <div class="channel-name-box">
      <span class="channel-label">チャンネル</span>
      <p class="channel-name">${channelName}</p>
    </div>
    <div class="card-block">
      <div class="table-head">
        <div class="table-col col-main sortable ${currentSortKey === 'furigana' ? currentSortOrder : ''}" onclick="changeSort('furigana')">
          曲名
        </div>
        <div class="table-col col-sub sortable ${currentSortKey === 'key' ? currentSortOrder : ''}" onclick="changeSort('key')">
          キー
        </div>
      </div>
  `;

  currentData.forEach(item => {
    let keyDisplay = item.E || "-";
    if (item.F && item.F.trim() !== "") {
      keyDisplay += `<br><span class="octave-text">(${item.F})</span>`;
    }

    html += `
      <div class="table-row">
        <div class="table-col-value col-main">
          <a href="${item.G}" target="_blank">${item.sheetName}</a>
        </div>
        <div class="table-col-value col-sub">
          <div style="font-weight:bold;">${keyDisplay}</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  resultArea.innerHTML = html;
}

function sortData() {
  // キーの並び順指定
  const keyOrder = ["±0", "-1", "-2", "-3", "-4", "-5", "-6", "+1", "+2", "+3", "+4", "+5", "+6"];
  // オク情報の優先度（なし -> オク上 -> オク下）
  const octOrder = { "": 0, "オク上": 1, "オク下": 2 };

  currentData.sort((a, b) => {
    let res = 0;
    if (currentSortKey === 'furigana') {
      // 名前順（ふりがな）
      res = a.furigana.localeCompare(b.furigana, 'ja');
    } else {
      // キー順
      const idxA = keyOrder.indexOf(a.E);
      const idxB = keyOrder.indexOf(b.E);
      
      // 未定義のキーは最後に飛ばす
      const valA = (idxA === -1) ? 99 : idxA;
      const valB = (idxB === -1) ? 99 : idxB;

      if (valA !== valB) {
        res = valA - valB;
      } else {
        // 同じキー（±0など）の中でのオク情報比較
        const octA = octOrder[a.F] || 0;
        const octB = octOrder[b.F] || 0;
        res = octA - octB;
      }
    }
    return currentSortOrder === 'asc' ? res : -res;
  });
}

function fetchJSONP(apiURL, url, callback) {
  const callbackName = "jsonp_cb_" + Math.random().toString(36).substr(2, 9);
  window[callbackName] = function(data) {
    callback(data);
    delete window[callbackName];
    const s = document.getElementById(callbackName);
    if (s) document.body.removeChild(s);
  };
  const script = document.createElement("script");
  script.id = callbackName;
  script.src = `${apiURL}?callback=${callbackName}&url=${encodeURIComponent(url)}`;
  document.body.appendChild(script);
}
