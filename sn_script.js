const GAS_URL = "https://script.google.com/macros/s/AKfycbwfZXS6p4qw3qg1gnzFzWxw24jgMRkYvTFVe2JscyTevTsa3KXa10zlEYCTkB2OyIqwgg/exec";

let currentData = null;

document.getElementById('searchBtn').addEventListener('click', searchSinger);

// ラジオボタンの切り替えイベント
document.querySelectorAll('input[name="videoMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (currentData) renderTable(e.target.value);
    });
});

function searchSinger() {
    const input = document.getElementById('urlInput').value.trim();
    if (!input) return;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultArea').style.display = 'none';

    const callbackName = 'cb_' + Date.now();
    window[callbackName] = function(data) {
        handleResponse(data);
        delete window[callbackName];
        document.getElementById(callbackName).remove();
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `${GAS_URL}?url=${encodeURIComponent(input)}&callback=${callbackName}`;
    document.body.appendChild(script);
}

function handleResponse(data) {
    document.getElementById('loading').style.display = 'none';
    if (data.error) {
        alert(data.error);
        return;
    }

    currentData = data;
    
    // チャンネル情報の表示
    document.getElementById('singerNameDisplay').innerText = data.singerName;
    
    // B列(channel)の名前を表示（最初のデータから取得）
    const firstMatch = data.matches.normal[0] || data.matches.shorts[0];
    document.getElementById('channelNameDisplay').innerText = firstMatch ? firstMatch.channel : "---";

    document.getElementById('resultArea').style.display = 'block';
    
    // 現在選択されているモードで表を描画
    const mode = document.querySelector('input[name="videoMode"]:checked').value;
    renderTable(mode);
}

function renderTable(mode) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    
    const list = currentData.matches[mode];

    if (!list || list.length === 0) {
        tbody.innerHTML = '<div class="table-row">該当なし</div>';
        return;
    }

    list.forEach(item => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-col-value col-main">
                <div style="font-weight:600;">${item.song}</div>
                <div style="font-size:12px; color:#7a7a7a;">${item.channel}</div>
                ${item.note ? `<div class="octave-text">${item.note}</div>` : ''}
            </div>
            <div class="table-col-value col-sub">
                <div style="font-weight:bold;">${item.key}</div>
                <div style="margin-top:4px;"><a href="${item.url}" target="_blank" style="text-decoration:none;">📺</a></div>
            </div>
        `;
        tbody.appendChild(row);
    });
}
