const API_URL = "https://script.google.com/macros/s/AKfycbyHe4gC1D8F8REOY1EBLpntB7ISxqT5ttdH83_ZA4l1cwQq0yUt3rBRJWpqcM4NoKTz/exec";

document.getElementById("searchBtn").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!url) {
    resultDiv.innerHTML = "URLを入力してね";
    return;
  }

  resultDiv.innerHTML = "検索中…";

  try {
    const res = await fetch(API_URL + "?url=" + encodeURIComponent(url));
    const data = await res.json();

    if (data.error) {
      resultDiv.innerHTML = "見つかりませんでした";
      return;
    }

  resultDiv.innerHTML = `
    <div class="result-card">
  
      <div class="result-row">
        <span class="result-label">タイトル</span>
        <span class="result-value">${data.title}</span>
      </div>
  
      <div class="result-row">
        <span class="result-label">キー</span>
        <span class="result-value key-value">${data.info}</span>
      </div>
  
    </div>
  `;



  } catch (e) {
    resultDiv.innerHTML = "エラーが発生しました";
  }
});
