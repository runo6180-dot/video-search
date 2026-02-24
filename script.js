document.getElementById("searchBtn").addEventListener("click", () => {
  const input = document.getElementById("urlInput").value.trim();

  let apiUrl = "";
  const ytID = extractYouTubeID(input);
  const nicoID = extractNicoID(input);

  // 1. ID判定とURL構築
  if (ytID) {
    // YouTube用API（新しいプロジェクトのURL）
    apiUrl = `https://script.google.com/macros/s/AKfycbzUaE-I312HoCDoQNIww2gDQAEFaZBZY33B2s36iJgTJarc1BLZ-kk5VEnWlQIWoa7C9A/exec?id=${ytID}`;
  } else if (nicoID) {
    // ニコニコ用API
    apiUrl = `https://script.google.com/macros/s/AKfycbxbbtXZKBLiZU6GD4dh2L_RHYU_bPt4tUysEHt8cSOQc-oyCl-w_B0roC3Q4shh14CbUg/exec?id=${nicoID}`;
  } else {
    alert("正しいURL または 動画IDを入力してね");
    return;
  }

  // 2. 検索中表示
  document.getElementById("result").innerHTML = `
    <div class="result-card">
      <p>検索中…</p>
    </div>
  `;

  // 3. データ取得（GAS特有のリダイレクト対策込み）
  fetch(apiUrl, {
    method: "GET",
    mode: "cors", // CORSを明示
    redirect: "follow" // GASのリダイレクトを追いかける設定
  })
    .then(res => {
      if (!res.ok) throw new Error("ネットワークエラーが発生しました");
      return res.json();
    })
    .then(data => {
      if (data.error) {
        document.getElementById("result").innerHTML = `
          <div class="result-card">
            <p>見つかりませんでした</p>
          </div>`;
        return;
      }

      // F列(fValue)がある場合は (オク上) などの形式にする
      const infoWithOct = data.fValue ? `${data.info} (${data.fValue})` : data.info;

      // 4. 結果表示
      document.getElementById("result").innerHTML = `
        <div class="result-card">
          <div class="result-row">
            <div class="result-label">タイトル</div>
            <div class="result-value">${data.title}</div>
          </div>
          <div class="result-row">
            <div class="result-label">キー</div>
            <div class="result-value highlight-key">${infoWithOct}</div>
          </div>
          <div class="result-row">
            <div class="result-label">チャンネル</div>
            <div class="result-value">${data.channel}</div>
          </div>
        </div>
      `;
    })
    .catch(err => {
      console.error("Fetch Error:", err);
      document.getElementById("result").innerHTML = `
        <div class="result-card">
          <p style="color: red;">エラーが発生しました。<br>ブラウザで一度APIを直接開いて承認が必要か確認してください。</p>
        </div>`;
    });
});

/**
 * YouTube ID抽出
 */
function extractYouTubeID(input) {
  if (!input) return null;
  // 11桁のIDそのものだった場合
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  
  const regexList = [
    /v=([a-zA-Z0-9_-]{11})/, 
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, 
    /embed\/([a-zA-Z0-9_-]{11})/, 
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /\/live\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const reg of regexList) {
    const match = input.match(reg);
    if (match) return match[1];
  }
  return null;
}

/**
 * ニコニコ ID抽出
 */
function extractNicoID(input) {
  if (!input) return null;
  // すでにID形式(sm/so123...)の場合
  if (/^(sm|so|nm)?\d+$/.test(input)) return input;
  
  const match = input.match(/(sm|so|nm)?\d+/);
  return match ? match[0] : null;
}
