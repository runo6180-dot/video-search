let allMatches = []; 
let currentDisplayType = 'youtube_normal';

document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  
  // ★修正ポイント：クラス名を付与してアニメーションを有効化
  resultArea.innerHTML = `<div class="loading-msg">検索中…</div>`;

  const apiURL = "https://script.google.com/macros/s/AKfycbxhXbZALDuljvuXMf_bmr9DA13PPJ2okiVREPGTYkOSb9a-5ogRGsr0PBMJ5GTz1dVT_A/exec";

  fetchJSONP(apiURL, url, (data) => {
    if (!data.matches || data.matches.length === 0) {
      resultArea.innerHTML = "<p style='padding:10px;'>該当データが見つかりませんでした。</p>";
      return;
    }
    
    allMatches = data.matches;
    const firstType = allMatches[0].type;

    if (firstType === 'nico') {
      currentDisplayType = 'nico';
    } else {
      const checkedRadio = document.querySelector('input[name="videoType"]:checked');
      currentDisplayType = checkedRadio ? checkedRadio.value : 'youtube_normal';
    }

    renderResult();
  });
});

function renderResult() {
  const resultArea = document.getElementById("resultArea");
  let displayData = allMatches.filter(m => m.type === currentDisplayType);

  if (displayData.length === 0) {
    resultArea.innerHTML = "<p style='padding:10px;'>このカテゴリの動画は見つかりませんでした。</p>";
    return;
  }

  const sortSelect = document.getElementById("sortSelect");
  const sortVal = sortSelect ? sortSelect.value : 'furigana_asc';
  sortData(displayData, sortVal);

  const channelName = displayData[0].channelName || "(不明)";
  const isNico = (allMatches[0].type === 'nico');

  let html = `
    <div class="channel-name-box">
      <span class="channel-label">チャンネル</span>
      <p class="channel-name">${channelName}</p>
    </div>
    <div id="controlsContainer" style="margin-bottom: 15px; padding: 0 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div id="videoTypeContainer" class="video-type-box" style="display: ${isNico ? 'none' : 'flex'};">
          <label><input type="radio" name="videoType" value="youtube_normal" ${currentDisplayType==='youtube_normal'?'checked':''}><span>横動画</span></label>
          <label><input type="radio" name="videoType" value="youtube_shorts" ${currentDisplayType==='youtube_shorts'?'checked':''}><span>ショート</span></label>
        </div>
        <div id="sortContainer" style="margin-left: auto;">
          <select id="sortSelect">
            <option value="furigana_asc" ${sortVal==='furigana_asc'?'selected':''}>曲名順</option>
            <option value="date_desc" ${sortVal==='date_desc'?'selected':''}>新しい順</option>
            <option value="date_asc" ${sortVal==='date_asc'?'selected':''}>古い順</option>
            <option value="key_asc" ${sortVal==='key_asc'?'selected':''}>キー順</option>
          </select>
        </div>
      </div>
    </div>
    <div class="card-block" style="margin-top: 0;">
      <div class="table-head">
        <div class="table-col col-main">曲名</div>
        <div class="table-col col-sub">キー</div>
      </div>
  `;

  displayData.forEach(item => {
    let keyDisplay = item.E || "-";
    if (item.F) keyDisplay += `<br><span class="octave-text">(${item.F})</span>`;
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

  document.querySelectorAll('input[name="videoType"]').forEach(r => {
    r.addEventListener('change', e => { 
      currentDisplayType = e.target.value; 
      renderResult(); 
    });
  });
  document.getElementById("sortSelect").addEventListener('change', renderResult);
}

function sortData(data, sortVal) {
  const [key, order] = sortVal.split('_');
  const keyOrder = ["±0", "-1", "-2", "-3", "-4", "-5", "-6", "+1", "+2", "+3", "+4", "+5", "+6"];
  data.sort((a, b) => {
    let res = 0;
    if (key === 'furigana') {
      res = (a.furigana || "").localeCompare(b.furigana || "", 'ja');
    } else if (key === 'date') {
      // ★修正：日付文字列をパースして安定させる
      const dateA = a.date ? new Date(a.date.replace(/\//g, '-')) : new Date(0);
      const dateB = b.date ? new Date(b.date.replace(/\//g, '-')) : new Date(0);
      res = dateA - dateB;
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
