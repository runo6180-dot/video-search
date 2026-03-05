const GAS_URL = "https://script.google.com/macros/s/AKfycbwfZXS6p4qw3qg1gnzFzWxw24jgMRkYvTFVe2JscyTevTsa3KXa10zlEYCTkB2OyIqwgg/exec";

let allMatches = {}; 
let currentDisplayData = []; 
let currentSortKey = 'furigana';
let currentSortOrder = 'asc';
let singerName = "";

document.getElementById("searchBtn").addEventListener("click", () => {
  const url = document.getElementById("urlInput").value.trim();
  if (!url) return;

  document.getElementById("loading").style.display = "block";
  document.getElementById("resultArea").innerHTML = "";

  fetchJSONP(GAS_URL, url, (data) => {
    document.getElementById("loading").style.display = "none";
    if (data.error) {
      alert(data.error);
      return;
    }
    allMatches = data.matches;
    singerName = data.singerName;
    renderAll("normal");
  });
});

function renderAll(mode) {
  currentDisplayData = allMatches[mode];
  renderResult(mode);
}

function changeSort(key, mode) {
  if (currentSortKey === key) {
    currentSortOrder = (currentSortOrder === 'asc') ? 'desc' : 'asc';
  } else {
    currentSortKey = key;
    currentSortOrder = 'asc';
  }
  renderResult(mode);
}

function renderResult(mode) {
  const resultArea = document.getElementById("resultArea");
  sortData();

  let html = `
    <div class="channel-name-box">
      <span class="channel-label">歌い手名</span>
      <p class="channel-name">${singerName}</p>
    </div>

    <div class="video-type-box">
      <label><input type="radio" name="vType" value="normal" ${mode === 'normal' ? 'checked' : ''} onclick="renderAll('normal')"><span>横動画</span></label>
      <label><input type="radio" name="vType" value="shorts" ${mode === 'shorts' ? 'checked' : ''} onclick="renderAll('shorts')"><span>ショート</span></label>
    </div>

    <div class="card-block">
      <div class="table-head">
        <div class="table-col col-main sortable" onclick="changeSort('furigana', '${mode}')">
          曲名 ${currentSortKey === 'furigana' ? (currentSortOrder === 'asc' ? '▲' : '▼') : '↕'}
        </div>
        <div class="table-col col-sub sortable" onclick="changeSort('key', '${mode}')">
          キー ${currentSortKey === 'key' ? (currentSortOrder === 'asc' ? '▲' : '▼') : '↕'}
        </div>
      </div>
  `;

  currentDisplayData.forEach(item => {
    let keyDisp = item.key || "-";
    if (item.note) keyDisp += `<br><span class="octave-text">(${item.note})</span>`;

    html += `
      <div class="table-row">
        <div class="table-col-value col-main">
          <!-- 曲名をリンクに変更 -->
          <div style="font-weight:600;">
            <a href="${item.url}" target="_blank" class="song-link">${item.song}</a>
          </div>
          <div style="font-size:12px; color:#7a7a7a;">${item.channel}</div>
        </div>
        <div class="table-col-value col-sub">
          <div style="font-weight:bold; color: #2c3e50;">${keyDisp}</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  resultArea.innerHTML = html;
}

function sortData() {
  const keyOrder = ["±0", "-1", "-2", "-3", "-4", "-5", "-6", "+1", "+2", "+3", "+4", "+5", "+6"];
  currentDisplayData.sort((a, b) => {
    let res = 0;
    if (currentSortKey === 'furigana') {
      res = a.furigana.localeCompare(b.furigana, 'ja');
    } else {
      const idxA = keyOrder.indexOf(a.key);
      const idxB = keyOrder.indexOf(b.key);
      res = (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    }
    return currentSortOrder === 'asc' ? res : -res;
  });
}

function fetchJSONP(apiURL, url, callback) {
  const cbName = "cb_" + Date.now();
  window[cbName] = (data) => {
    callback(data);
    delete window[cbName];
    document.getElementById(cbName).remove();
  };
  const s = document.createElement("script");
  s.id = cbName;
  s.src = `${apiURL}?callback=${cbName}&url=${encodeURIComponent(url)}`;
  document.body.appendChild(s);
}
