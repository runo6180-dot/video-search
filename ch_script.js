document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "検索中…";

  // ★ GAS Web アプリ URL
  const apiURL = "https://script.google.com/macros/s/AKfycbyyQNP-QoAyadYMHqSt1R6zJUdcgkAa8Jw54Zqs7ovznRUTUNw1lOwzwxqT0TtJAYX8/exec";

  // ★ JSONP で GAS を呼ぶ
  fetchJSONP(apiURL, url, (data) => {
    if (!data.matches || data.matches.length === 0) {
      resultArea.innerHTML = "<p>該当データが見つかりませんでした。</p>";
      return;
    }

    // 表の生成
    let html = `
      <div class="card-block">
        <div class="table-head">
          <div class="table-col">曲名</div>
          <div class="table-col">キー</div>
        </div>
    `;

  data.matches.forEach(item => {
    html += `
      <div class="table-row">
  
        <!-- 曲名（シート名を表示し、G列URLにリンクする） -->
        <div class="table-col-value">
          <a href="${item.G}" target="_blank">${item.sheetName}</a>
        </div>
  
        <!-- キー（E列の値） -->
        <div class="table-col-value">
          ${item.E || "-"}
        </div>
  
      </div>
    `;
  });


    html += `</div>`;
    resultArea.innerHTML = html;
  });
});


// ------------------------------------------------------
// ★ JSONP 呼び出し関数（CORS 完全回避）
// ------------------------------------------------------
function fetchJSONP(apiURL, url, callback) {
  const callbackName = "jsonp_cb_" + Math.random().toString(36).substr(2, 9);

  window[callbackName] = function(data) {
    callback(data);
    delete window[callbackName];
    document.body.removeChild(script);
  };

  const script = document.createElement("script");
  script.src = `${apiURL}?callback=${callbackName}&url=${encodeURIComponent(url)}`;
  document.body.appendChild(script);
}
