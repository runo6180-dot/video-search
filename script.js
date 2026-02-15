document.getElementById("searchBtn").addEventListener("click", () => {
  const input = document.getElementById("urlInput").value.trim();

  const videoID = extractYouTubeID(input);

  if (!videoID) {
    alert("正しいYouTube URL または 動画IDを入力してね");
    return;
  }

  // ★★★ 検索中を表示（これが消えてた） ★★★
  document.getElementById("result").innerHTML = `
    <div class="result-card">
      <p>検索中…</p>
    </div>
  `;

  const API_URL = `https://script.google.com/macros/s/AKfycbyHe4gC1D8F8REOY1EBLpntB7ISxqT5ttdH83_ZA4l1cwQq0yUt3rBRJWpqcM4NoKTz/exec?id=${videoID}`;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("result").innerHTML = `<p>見つかりませんでした</p>`;
        return;
      }

      document.getElementById("result").innerHTML = `
        <div class="result-card">

          <div class="result-row">
            <div class="result-label">タイトル</div>
            <div class="result-value">${data.title}</div>
          </div>

          <div class="result-row-horizontal">

            <div class="result-item">
              <div class="result-label">キー</div>
              <div class="result-value">${data.info}</div>
            </div>

            <div class="result-item">
              <div class="result-label">チャンネル</div>
              <div class="result-value">${data.channel}</div>
            </div>

          </div>

        </div>
      `;
    })
    .catch(err => {
      console.error(err);
      alert("エラーが発生しました");
    });
});
