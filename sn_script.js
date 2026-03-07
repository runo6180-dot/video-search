let allMatches = { normal: [], shorts: [] };
let currentDisplayType = 'normal'; // 'normal' または 'shorts'
let singerName = "";

document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  // 検索中表示（sn_style.cssで左寄せに設定済み）
  resultArea.innerHTML = `<div class="loading-msg">検索中…</div>`;

  // デプロイしたGASのURL
  const apiURL = "https://script.google.com/macros/s/AKfycbxiYCmg78ZGN-URe-LkyTFxGGLt2kr889VnfWIPGE99/exec";

  fetchJSONP(apiURL, url, (data) => {
    if (data.error || (!data.matches.normal.length && !data.matches.shorts.length)) {
      resultArea.innerHTML = `<p>${data.error || "データが見つかりませんでした。"}</p>`;
      return;
    }
    
    allMatches = data.matches;
    singerName = data.singerName;

    // データがある方を初期表示にする
    currentDisplayType = allMatches.normal.length > 0 ? 'normal' : 'shorts';

    renderResult();
  });
});

function renderResult() {
  const resultArea = document.getElementById("resultArea");
  let displayData = (currentDisplayType === 'normal') ? allMatches.normal : allMatches.shorts;

  if (displayData.length === 0) {
    resultArea.innerHTML = `
      <div class="channel-name-box">
        <span class="channel-label">歌い手</span>
        <p class="channel-name">${singerName}</p>
      </div>
      <p>このカテゴリの動画は見つかりませんでした。</p>
    `;
    return;
  }

  // 並び替え実行
  const sortSelect = document.getElementById("sortSelect");
  const sortVal = sortSelect ? sortSelect.value : 'furigana_asc';
  sortData(displayData, sortVal);

  // --- HTML組み立て ---
  // ① 名前ボックス
  let html = `
    <div class="channel-name-box">
      <span class="channel-label">歌い手</span>
      <p class="channel-name">${singerName}</p>
    </div>
  `;

  // ② 操作エリア（切り替えとソート）
  html += `
    <div id="controlsContainer" style="margin-bottom: 15px; padding: 0 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        
        <div id="videoTypeContainer" class="video-type-box">
          <label><input type="radio" name="videoType" value="normal" ${currentDisplayType==='normal'?'checked':''}><span>横動画</span></label>
          <label><input type="radio" name="videoType" value="shorts" ${currentDisplayType==='shorts'?'checked':''}><span>ショート</span></label>
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
  `;

  // ③ 表本体
  html += `
    <div class="card-block" style="margin-top: 0;">
      <div class="table-head">
        <div class="table-col col-main">曲名</div>
        <div class="table-col col-sub">キー</div>
      </div>
  `;

  displayData.forEach(item => {
    let keyDisplay = item.key || "-";
    if (item.note) keyDisplay += `<br><span class="octave-text">(${item.note})</span>`;
    
    html += `
      <div class="table-row">
        <div class="table-col-value col-main">
          <div class="title-date-container">
            <a href="${item.url}" target="_blank">${item.song}</a>
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

  // イベント再バインド
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
      res = a.furigana.localeCompare(b.furigana, 'ja');
    } else if (key === 'date') {
      // 日付文字列を比較
      const dateA = a.date ? a.date.replace(/\//g, '-') : "0000-00-00";
      const dateB = b.date ? b.date.replace(/\//g, '-') : "0000-00-00";
      res = new Date(dateA) - new Date(dateB);
    } else if (key === 'key') {
      const idxA = keyOrder.indexOf(a.key);
      const idxB = keyOrder.indexOf(b.key);
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
