// 確定したGASのURL
const apiURL = "https://script.google.com/macros/s/AKfycbwfZXS6p4qw3qg1gnzFzWxw24jgMRkYvTFVe2JscyTevTsa3KXa10zlEYCTkB2OyIqwgg/exec";

let allMatches = { normal: [], shorts: [] };
let currentDisplayType = 'normal'; 
let singerName = "";

document.getElementById("ytSearchBtn").addEventListener("click", () => {
  const url = document.getElementById("ytInput").value.trim();
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  // 検索中表示（左寄せ）
  resultArea.innerHTML = `<div class="loading-msg">検索中…</div>`;

  fetchJSONP(apiURL, url, (data) => {
    if (data.error || (!data.matches.normal.length && !data.matches.shorts.length)) {
      resultArea.innerHTML = `<p style="padding:10px;">${data.error || "該当する歌い手または動画が見つかりませんでした。"}</p>`;
      return;
    }
    
    allMatches = data.matches;
    singerName = data.singerName;

    // 初期表示カテゴリの決定（動画がある方を優先）
    currentDisplayType = allMatches.normal.length > 0 ? 'normal' : 'shorts';

    renderResult();
  });
});

/**
 * 結果描画メイン関数
 */
function renderResult() {
  const resultArea = document.getElementById("resultArea");
  const sortSelect = document.getElementById("sortSelect");
  const sortVal = sortSelect ? sortSelect.value : 'furigana_asc';

  let displayData = (currentDisplayType === 'normal') ? allMatches.normal : allMatches.shorts;

  // 1. 名前ボックスの作成
  let html = `
    <div class="channel-name-box">
      <span class="channel-label">歌い手</span>
      <p class="channel-name">${singerName}</p>
    </div>
  `;

  // 2. 操作エリア（切り替えボタンとソート）
  html += `
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div class="video-type-box">
          <label><input type="radio" name="videoType" value="normal" ${currentDisplayType==='normal'?'checked':''}><span>横動画</span></label>
          <label><input type="radio" name="videoType" value="shorts" ${currentDisplayType==='shorts'?'checked':''}><span>ショート</span></label>
        </div>
        <div>
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

  if (displayData.length === 0) {
    html += `<p style="padding:20px; color:#7a7a7a;">このカテゴリの動画はありません。</p>`;
    resultArea.innerHTML = html;
    bindEvents();
    return;
  }

  // 並び替え実行
  sortData(displayData, sortVal);

  // 3. テーブル描画
  html += `
    <div class="card-block">
      <div class="table-head">
        <div class="table-col col-main">曲名</div>
        <div class="table-col col-sub">キー</div>
      </div>
  `;

  displayData.forEach(item => {
    let keyDisplay = item.key || "-";
    if (item.note) {
      keyDisplay += `<br><span class="octave-text">(${item.note})</span>`;
    }
    
    // 「日付 / チャンネル名」の形式を作成
    const detailText = [item.date, item.channel].filter(Boolean).join(" / ");
    
    html += `
      <div class="table-row">
        <div class="table-col-value col-main">
          <div class="title-info-container">
            <a href="${item.url}" target="_blank">${item.song}</a>
            <div class="sub-details">${detailText}</div>
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

  bindEvents();
}

/**
 * イベント再バインド
 */
function bindEvents() {
  document.querySelectorAll('input[name="videoType"]').forEach(r => {
    r.addEventListener('change', e => { 
      currentDisplayType = e.target.value; 
      renderResult(); 
    });
  });
  const ss = document.getElementById("sortSelect");
  if (ss) ss.addEventListener('change', renderResult);
}

/**
 * ソートロジック
 */
function sortData(data, sortVal) {
  const [key, order] = sortVal.split('_');
  const keyOrder = ["±0", "-1", "-2", "-3", "-4", "-5", "-6", "+1", "+2", "+3", "+4", "+5", "+6"];
  
  data.sort((a, b) => {
    let res = 0;
    if (key === 'furigana') {
      res = a.furigana.localeCompare(b.furigana, 'ja');
    } else if (key === 'date') {
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

/**
 * JSONP通信用
 */
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
