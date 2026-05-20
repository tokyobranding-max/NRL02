const providerRules = [
    { key: "instagram", label: "Instagram", mark: "◎", hosts: ["instagram.com", "www.instagram.com"] },
    { key: "x", label: "X", mark: "𝕏", hosts: ["x.com", "twitter.com"] },
    { key: "tiktok", label: "TikTok", mark: "♪", hosts: ["tiktok.com", "www.tiktok.com"] },
    { key: "youtube", label: "YouTube", mark: "▶", hosts: ["youtube.com", "www.youtube.com", "youtu.be"] },
    { key: "facebook", label: "Facebook", mark: "f", hosts: ["facebook.com", "www.facebook.com"] },
    { key: "threads", label: "Threads", mark: "@", hosts: ["threads.net", "www.threads.net"] },
    { key: "linkedin", label: "LinkedIn", mark: "in", hosts: ["linkedin.com", "www.linkedin.com"] }
];

const initialPanels = [
    {
        url: "https://www.instagram.com/aoiyuzu_pivoine25/",
        handle: "aoiyuzu_pivoine25",
        name: "Paris Lien -輪-",
        followers: "フォロワー118人",
        posts: "投稿14件",
        latestPost: "06:54",
        fetchStatus: "取得完了",
        status: "ready",
        avatar: "輪",
        avatarBg: "#e8f4ff",
        ring: "#ff27b5",
        tiles: [
            { text: "イベント告知", bg: "#dde8f2" },
            { text: "ビジネス案内", bg: "#ffe9d6" },
            { text: "VERT", bg: "#b9b9b9", video: true }
        ]
    },
    {
        url: "https://www.instagram.com/regionlink_minatoku/",
        handle: "regionlink_minatoku",
        name: "",
        followers: "",
        posts: "",
        latestPost: "取得中",
        fetchStatus: "取得中",
        status: "loading",
        avatar: "",
        tiles: []
    },
    {
        url: "https://www.instagram.com/uda0_401/",
        handle: "uda0_401",
        name: "宇陀で挑む。",
        followers: "フォロワー112人",
        posts: "投稿14件",
        latestPost: "06:54",
        fetchStatus: "取得完了",
        status: "ready",
        avatar: "宇",
        avatarBg: "#f2f7df",
        ring: "#63a15a",
        tiles: [
            { text: "MINATO HIVE", bg: "#fff3ad" },
            { text: "事業紹介", bg: "#e4f6d9" },
            { text: "薬草と活用方法", bg: "#fff1b8" }
        ]
    },
    {
        url: "https://www.instagram.com/iida_region003/",
        handle: "iida_region003",
        name: "",
        followers: "",
        posts: "",
        latestPost: "取得中",
        fetchStatus: "取得中",
        status: "loading",
        avatar: "",
        tiles: []
    },
    {
        url: "https://www.instagram.com/rwanda_regionlink/",
        handle: "rwanda_regionlink",
        name: "",
        followers: "",
        posts: "",
        latestPost: "取得中",
        fetchStatus: "取得中",
        status: "loading",
        avatar: "",
        tiles: []
    }
];

let panels = initialPanels.map(createPanelFromData);

function detectProvider(rawUrl) {
    try {
        const url = new URL(rawUrl);
        const host = url.hostname.replace(/^www\./, "");
        return providerRules.find((rule) => rule.hosts.some((item) => item.replace(/^www\./, "") === host)) || null;
    } catch (error) {
        return null;
    }
}

function extractHandle(rawUrl, providerKey) {
    try {
        const url = new URL(rawUrl);
        const path = url.pathname.split("/").filter(Boolean);
        const first = path[0] || "unknown";
        if (providerKey === "tiktok" || providerKey === "threads") return first.replace(/^@/, "");
        if (providerKey === "youtube" && first.startsWith("@")) return first.slice(1);
        if (providerKey === "linkedin" && path[0] === "company") return path[1] || first;
        return first.replace(/^@/, "");
    } catch (error) {
        return "unknown";
    }
}

function createPanelFromData(data) {
    const provider = detectProvider(data.url) || providerRules[0];
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        provider,
        updatedAt: "06:54",
        ...data
    };
}

function createPanelFromUrl(rawUrl) {
    const trimmed = rawUrl.trim();
    const provider = detectProvider(trimmed) || providerRules[0];
    const handle = extractHandle(trimmed, provider.key);
    const fallbackName = provider.key === "instagram" ? "" : provider.label;
    return createPanelFromData({
        url: trimmed,
        handle,
        name: fallbackName,
        followers: provider.key === "instagram" ? "" : "公開情報を取得中",
        posts: provider.key === "instagram" ? "" : "取得待ち",
        latestPost: provider.key === "instagram" ? "取得中" : "未取得",
        fetchStatus: provider.key === "instagram" ? "取得中" : "一部取得",
        status: provider.key === "instagram" ? "loading" : "ready",
        avatar: handle.slice(0, 1).toUpperCase(),
        avatarBg: "#f1f1f1",
        ring: "#d7ff22",
        tiles: [
            { text: "公開プロフィール", bg: "#e8ecef" },
            { text: "最新投稿", bg: "#f3e6d7" },
            { text: "外部リンク", bg: "#d8e9dd" }
        ]
    });
}

function renderPanels() {
    const grid = document.getElementById("panelGrid");
    grid.innerHTML = panels.map(renderPanel).join("") + renderAddPanel();
    renderSummary();
    renderCompareTable();
}

function renderPanel(panel) {
    const statusLabel = panel.status === "loading" ? "更新" : "更新";
    const body = panel.status === "loading" ? renderLoadingStage() : renderReadyStage(panel);
    return `
        <article class="sns-panel" data-id="${panel.id}">
            <header class="panel-titlebar">
                <div class="provider-icon">${panel.provider.mark}</div>
                <div class="panel-account">
                    <strong>${escapeHtml(panel.handle)}</strong>
                    <span>${panel.provider.label}</span>
                </div>
                <button class="close-button" type="button" data-remove="${panel.id}" aria-label="${escapeHtml(panel.handle)}を閉じる">×</button>
            </header>
            ${body}
            <footer class="panel-footer">
                <span>${panel.updatedAt} ${statusLabel}</span>
                <button type="button" data-refresh="${panel.id}">↻ 更新</button>
            </footer>
        </article>
    `;
}

function renderReadyStage(panel) {
    const tiles = panel.tiles.map((tile) => `
        <div class="feed-tile ${tile.video ? "video" : ""}" style="--tile-bg: ${tile.bg}">
            <span>${escapeHtml(tile.text)}</span>
        </div>
    `).join("");
    return `
        <div class="panel-stage">
            <section class="profile-zone">
                <div class="avatar" style="--avatar-bg: ${panel.avatarBg}; --ring: ${panel.ring};">${escapeHtml(panel.avatar)}</div>
                <div class="profile-copy">
                    <strong>${escapeHtml(panel.handle)}</strong>
                    <p>${escapeHtml(panel.name)}</p>
                    <span>${escapeHtml(panel.followers)}<br>${escapeHtml(panel.posts)}</span>
                </div>
                <div class="provider-corner">◎</div>
            </section>
            ${renderMetricsRow(panel)}
            <section class="feed-strip">${tiles}</section>
        </div>
    `;
}

function renderMetricsRow(panel) {
    return `
        <section class="metrics-row" aria-label="${escapeHtml(panel.handle)}の指標">
            <div><span>フォロワー数</span><strong>${escapeHtml(panel.followers || "取得不可")}</strong></div>
            <div><span>投稿数</span><strong>${escapeHtml(panel.posts || "取得不可")}</strong></div>
            <div><span>最新投稿</span><strong>${escapeHtml(panel.latestPost || panel.updatedAt)}</strong></div>
            <div><span>取得状態</span><strong>${escapeHtml(panel.fetchStatus || panel.status)}</strong></div>
        </section>
    `;
}

function renderLoadingStage() {
    return `
        <div class="loading-stage">
            <div class="instagram-loader">
                <div class="instagram-glyph">◎</div>
                <div class="instagram-word">Instagram</div>
            </div>
        </div>
    `;
}

function renderAddPanel() {
    return `
        <article class="add-panel">
            <button id="addPanelButton" type="button" aria-label="SNSパネルを追加">
                <span class="add-panel-content">
                    <span class="plus-ring">＋</span>
                    <strong>追加する</strong>
                </span>
            </button>
        </article>
    `;
}

function renderSummary() {
    const ready = panels.filter((panel) => panel.status === "ready").length;
    const loading = panels.filter((panel) => panel.status === "loading").length;
    document.getElementById("statusSummary").innerHTML = `
        <span><i class="status-dot"></i>${ready}件 表示中</span>
        <span><i class="status-dot warn"></i>${loading}件 取得中</span>
    `;
}

function renderCompareTable() {
    const rows = document.getElementById("compareRows");
    if (!rows) return;
    rows.innerHTML = panels.map((panel) => `
        <tr>
            <td>${escapeHtml(panel.provider.label)}</td>
            <td>${escapeHtml(panel.handle)}</td>
            <td>${escapeHtml(panel.followers || "取得不可")}</td>
            <td>${escapeHtml(panel.posts || "取得不可")}</td>
            <td>${escapeHtml(panel.latestPost || panel.updatedAt)}</td>
            <td>${escapeHtml(panel.fetchStatus || panel.status)}</td>
            <td>${escapeHtml(panel.url)}</td>
        </tr>
    `).join("");
}

function openDialog() {
    const dialog = document.getElementById("addDialog");
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        dialog.setAttribute("open", "open");
    }
}

function addUrls() {
    const input = document.getElementById("urlInput");
    const urls = input.value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    if (!urls.length) {
        document.getElementById("inputNotice").textContent = "追加するURLを入力してください。";
        return;
    }
    panels = panels.concat(urls.map(createPanelFromUrl));
    document.getElementById("missionName").textContent = document.getElementById("missionInput").value || "ミッション";
    document.getElementById("inputNotice").textContent = `${urls.length}件のパネルを追加しました。`;
    input.value = "";
    renderPanels();
}

function refreshPanel(id) {
    panels = panels.map((panel) => {
        if (panel.id !== id) return panel;
        if (panel.status === "ready") return { ...panel, updatedAt: "06:55" };
        return {
            ...panel,
            status: "ready",
            updatedAt: "06:55",
            name: panel.name || "公開プロフィール",
            followers: panel.followers || "フォロワー取得不可",
            posts: panel.posts || "投稿取得中",
            latestPost: "06:55",
            fetchStatus: "取得完了",
            avatar: panel.avatar || panel.handle.slice(0, 1).toUpperCase(),
            avatarBg: panel.avatarBg || "#f4f4f4",
            ring: panel.ring || "#ff2ea6",
            tiles: panel.tiles.length ? panel.tiles : [
                { text: "プロフィール", bg: "#efefef" },
                { text: "投稿プレビュー", bg: "#e8e1d6" },
                { text: "取得制限", bg: "#d9d9d9" }
            ]
        };
    });
    renderPanels();
}

function exportCsv() {
    const header = ["SNS", "アカウント", "URL", "フォロワー数", "投稿数", "最新投稿", "取得状態"];
    const body = panels.map((panel) => [
        panel.provider.label,
        panel.handle,
        panel.url,
        panel.followers || "取得不可",
        panel.posts || "取得不可",
        panel.latestPost || panel.updatedAt,
        panel.fetchStatus || panel.status
    ]);
    const csv = [header, ...body]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sideview-sns-preview.csv";
    link.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.getElementById("openAddPanel").addEventListener("click", openDialog);
document.getElementById("addUrls").addEventListener("click", addUrls);
document.getElementById("exportCsv").addEventListener("click", exportCsv);
document.getElementById("toggleCompare").addEventListener("click", () => {
    document.getElementById("comparePanel").hidden = false;
    document.getElementById("comparePanel").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("closeCompare").addEventListener("click", () => {
    document.getElementById("comparePanel").hidden = true;
});
document.getElementById("clearUrls").addEventListener("click", () => {
    document.getElementById("urlInput").value = "";
    document.getElementById("inputNotice").textContent = "入力をクリアしました。";
});

document.addEventListener("click", (event) => {
    if (event.target.closest("#addPanelButton")) {
        openDialog();
        return;
    }
    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
        panels = panels.filter((panel) => panel.id !== removeButton.dataset.remove);
        renderPanels();
        return;
    }
    const refreshButton = event.target.closest("[data-refresh]");
    if (refreshButton) {
        refreshPanel(refreshButton.dataset.refresh);
    }
});

renderPanels();
