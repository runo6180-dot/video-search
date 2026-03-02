let currentData = []; // ソート用にデータを保持
let currentSortKey = 'furigana'; // デフォルトは曲名（ふりがな）順
let currentSortOrder = 'asc'; // 昇順

document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  const videoType = document.querySelector('input[name="videoType"]:checked').value;
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "検索中…";

  let apiURL = "";
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isNicoNico = url.includes("nicovideo.jp");

  if (videoType === "normal") {
    if (isYouTube) {
      apiURL = "https://script.google.com/macros/s/AKfycbxhXbZALDuljvuXMf_bmr9DA13PPJ2okiVREPGTYkOSb9a-5ogRGsr0PBMJ5GTz1dVT_A/exec";
    } else if (isNicoNico) {
      apiURL = "https://script.google.com/macros/s/AKfycbwDh0XbzdWxqu5fZulndiE-lIQI1EiWjXjxcl4P9eQp1KlyI69YSSwc-0xZ6HXEIU6dfw/exec";
    }
  } else if (videoType === "shorts") {
    if (isYouTube) {
      apiURL = "https://script.google.com/macros/s/AKfycbyWiO2g0yEm9_1zsfEgcYnAbsJK_9TSX-okcJgjnkHtfimTUtSZwZhcXLDEDFZ9_5lzCQ/exec";
    } else if (isNicoNico) {
      resultArea.innerHTML = "<p style='color: #e74c3c; font-weight: bold;'>ショート選択時はYouTubeのリンクを入力してください。</p>";
      return;
    }
  }

  fetchJSONP(apiURL, url, (data) => {
    if (!data.matches || data.matches.length === 0) {
      resultArea.innerHTML = "<p>該当データが見つかりませんでした。</p>";
      return;
    }
    
    currentData = data.matches;
    currentSortKey = 'furigana'; // 検索時はデフォルト曲名順
    renderResult();
  });
});

// 表示用関数
function renderResult() {
  const resultArea = document.getElementById("resultArea");
  const channelName = currentData[0].channelName || "(不明)";

  // データのソート
  sortData(currentData, currentSortKey, currentSortOrder);

  let html = `
    <div class="channel-name-box">
      <span class="channel-label">チャンネル</span>
      <p class="channel-name">${channelName}</p>
    </div>
    <div class="card-block">
      <div class="table-head">
        <div class="table-col col-main sortable ${currentSortKey === 'furigana' ? currentSortOrder : ''}" onclick="changeSort('furigana')">曲名</div>
        <div class="table-col col-sub sortable ${currentSortKey === 'key' ? currentSortOrder : ''}" onclick="changeSort('key')">キー</div>
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
          ${keyDisplay}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  resultArea.innerHTML = html;
}

// ソート切り替え
function changeSort(key) {
  if (currentSortKey === key) {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortKey = key;
    currentSortOrder = 'asc';
  }
  renderResult();
}

// ソートロジック
function sortData(data, key, order) {
  const keyOrder = ["±0", "-1", "-2", "-3", "-4", "-5", "-6", "+1", "+2", "+3", "+4", "+5", "+6"];
  const octOrder = { "": 0, "オク上": 1, "オク下": 2 };

  data.sort((a, b) => {
    let comparison = 0;
    if (key === 'furigana') {
      comparison = a.furigana.localeCompare(b.furigana, 'ja');
    } else if (key === 'key') {
      // キー番号のインデックス比較
      const indexA = keyOrder.indexOf(a.E);
      const indexB = keyOrder.indexOf(b.E);
      
      if (indexA !== indexB) {
        comparison = (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      } else {
        // 同じキーの中でのオク情報比較
        const octA = octOrder[a.F] !== undefined ? octOrder[a.F] : 0;
        const octB = octOrder[b.F] !== undefined ? octOrder[b.F] : 0;
        comparison = octA - octB;
      }
    }
    return order === 'asc' ? comparison : -comparison;
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
