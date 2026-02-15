document.getElementById("searchBtn").addEventListener("click", () => {
  const input = document.getElementById("urlInput").value.trim();

  // YouTube ID を抽出
  const videoID = extractYouTubeID(input);

  if (!videoID) {
    alert("正しいYouTube URL または 動画IDを入力してね");
    return;
  }

  const API_URL = `https://script.google.com/macros/s/AKfycbyHe4gC1D8F8REOY1EBLpntB7ISxqT5ttdH83_ZA4l1cwQq0yUt3rBRJWpqcM4NoKTz/exec?id=${videoID}`;

  console.log("送信するID:", videoID);
  console.log("アクセスURL:", API_URL);

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("result").innerHTML = `<p>見つかりませんでした</p>`;
        return;
      }

      document.getElementById("result").innerHTML = `
        <div class="result-card">

          <!-- タイトル（縦） -->
          <div class="result-row">
            <div class="result-label">タイトル</div>
            <div class="result-value">${data.title}</div>
          </div>

          <!-- キー & チャンネル（横並び） -->
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
    })  // ← これが抜けてた
    .catch(err => {
      console.error(err);
      alert("エラーが発生しました");
    });
});

function extractYouTubeID(input) {
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  const regexList = [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const reg of regexList) {
    const match = input.match(reg);
    if (match) return match[1];
  }

  return null;
}
