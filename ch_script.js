document.getElementById("ytSearchBtn").addEventListener("click", async () => {
  const url = document.getElementById("ytInput").value.trim();
  if (!url) return;

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "検索中…";

  try {
    // ★ あなたの GAS Web API URL に差し替え
    const apiURL = "https://script.google.com/macros/s/AKfycbyyQNP-QoAyadYMHqSt1R6zJUdcgkAa8Jw54Zqs7ovznRUTUNw1lOwzwxqT0TtJAYX8/exec";

    const res = await fetch(apiURL + "?url=" + encodeURIComponent(url));
    const data = await res.json();

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
          <div class="table-col-value">${item.E || "-"}</div>
          <div class="table-col-value">
            <a href="${item.G}" target="_blank">${item.sheetName}</a>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    resultArea.innerHTML = html;

  } catch (e) {
    resultArea.innerHTML = "<p>エラーが発生しました。</p>";
    console.error(e);
  }
});
