let allMatches = []; // GASから届いた全データを保持
let currentDisplayType = 'youtube_normal'; // 現在表示中のタイプ

document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "検索中…";

  // 統合されたAPI URL
  const apiURL = "https://script.google.com/macros/s/AKfycbxhXbZALDuljvuXMf_bmr9DA13PPJ2okiVREPGTYkOSb9a-5ogRGsr0PBMJ5GTz1dVT_A/exec";

  fetchJSONP(apiURL, url, (data) => {
    const controls = document.getElementById("controlsContainer");
    const typeBox = document.getElementById("videoTypeContainer");
    const resultArea = document.getElementById("resultArea");
  
    if (!data.matches || data.matches.length === 0) {
      resultArea.innerHTML = "<p>該当データが見つかりませんでした。</p>";
      controls.style.display = "none";
      return;
    }
    
    allMatches = data.matches;
    const firstType = allMatches[0].type;
  
    // 全体の操作コンテナを表示
    controls.style.display = "block";
  
    if (firstType === 'nico') {
      // ニコニコなら切り替えボタンだけ消す（ソートは残る）
      typeBox.style.display = "none";
      currentDisplayType = 'nico';
    } else {
      // YouTubeなら切り替えボタンを出す
      typeBox.style.display = "flex";
      currentDisplayType = document.querySelector('input[name="videoType"]:checked').value;
    }
  
    renderResult();
  });
});

// YouTube用のラジオボタン切り替えイベント
document.querySelectorAll('input[name="videoType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentDisplayType = e.target.value;
    renderResult();
  });
});

// ソートセレクトボックスの変更イベント
document.getElementById("sortSelect").addEventListener('change', renderResult);

function renderResult() {
  const resultArea = document.getElementById("resultArea");
  
  // 現在のタイプ（横/ショート/ニコ）でフィルタリング
  let displayData = allMatches.filter(m => m.type === currentDisplayType);

  if (displayData.length === 0) {
    resultArea.innerHTML = "<p>このカテゴリの動画は見つかりませんでした。</p>";
    return;
  }

  const channelName = displayData[0].channelName || "(不明)";
  
  // ソート実行
  const sortVal = document.getElementById("sortSelect").value;
  sortData(displayData, sortVal);

  let html = `
    <div class="channel-name-box">
      <span class="channel-label">チャンネル</span>
      <p class="channel-name">${channelName}</p>
    </div>
    <div class="card-block">
      <div class="table-head">
        <div class="table-col col-main">曲名</div>
        <div class="table-col col-sub">キー</div>
      </div>
  `;

  displayData.forEach(item => {
    let keyDisplay = item.E || "-";
    if (item.F && item.F.trim() !== "") {
      keyDisplay += `<br><span class="octave-text">(${item.F})</span>`;
    }

    html += `
      <div class="table-row">
        <div class="table-col-value col-main">
          <div class="title-date-container">
            <a href="${item.G}" target="_blank">${item.sheetName}</a>
            <span class="upload-date">${item.date || ""}</span>
          </div>
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

function sortData(data, sortVal) {
  const [key, order] = sortVal.split('_');
  const keyOrder = ["±0", "-1", "-2", "-3", "-4", "-5", "-6", "+1", "+2", "+3", "+4", "+5", "+6"];

  data.sort((a, b) => {
    let res = 0;
    if (key === 'furigana') {
      res = a.furigana.localeCompare(b.furigana, 'ja');
    } else if (key === 'date') {
      // 日付の比較
      res = new Date(a.date || 0) - new Date(b.date || 0);
    } else if (key === 'key') {
      const idxA = keyOrder.indexOf(a.E);
      const idxB = keyOrder.indexOf(b.E);
      res = (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    }
    return order === 'asc' ? res : -res;
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
