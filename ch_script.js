document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  const videoType = document.querySelector('input[name="videoType"]:checked').value;
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "検索中…";

  // --- APIの切り替えロジック ---
  let apiURL = "";
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isNicoNico = url.includes("nicovideo.jp");

  if (videoType === "normal") {
    // 横動画選択時
    if (isYouTube) {
      apiURL = "https://script.google.com/macros/s/AKfycbyyQNP-QoAyadYMHqSt1R6zJUdcgkAa8Jw54Zqs7ovznRUTUNw1lOwzwxqT0TtJAYX8/exec";
    } else if (isNicoNico) {
      apiURL = "https://script.google.com/macros/s/AKfycbzDrq3obNWV6Y9RWBVg76wELiB4ZymCgL_2zEVt57ORHlqS3sx69NvPDCSSizzkjpzFjA/exec";
    }
  } else if (videoType === "shorts") {
    // ショート選択時
    if (isYouTube) {
      apiURL = "https://script.google.com/macros/s/AKfycbzvGKM5qObFHi_6znB_FL87rJrC6H-6akDjQ4sYRrwz3fMSSxYeJjYXqbfkAVmWOCz4/exec";
    } else if (isNicoNico) {
      // ショート選択でニコニコURLの場合
      resultArea.innerHTML = "<p style='color: #e74c3c; font-weight: bold;'>ショート選択時はYouTubeのリンクを入力してください。</p>";
      return;
    }
  }

  if (!apiURL) {
    resultArea.innerHTML = "<p>有効なURLを入力してください。</p>";
    return;
  }

  fetchJSONP(apiURL, url, (data) => {
    if (!data.matches || data.matches.length === 0) {
      resultArea.innerHTML = "<p>該当データが見つかりませんでした。</p>";
      return;
    }
    
    const channelName = data.matches[0].channelName || "(不明)";
    
    // タイトル表示の変更（チャンネルを小さく、名前をメインに）
    let html = `
      <div class="channel-name-box">
        <span class="channel-label">チャンネル</span>
        <p class="channel-name">${channelName}</p>
      </div>
    `;
    
    html += `
      <div class="card-block">
        <div class="table-head">
          <div class="table-col col-main">曲名</div>
          <div class="table-col col-sub">キー</div>
        </div>
    `;

    data.matches.forEach(item => {
      // F列（オク情報）がある場合はカッコを付けてキーと合体
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
  });
});

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
