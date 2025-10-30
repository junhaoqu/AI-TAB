// background.js - AI Tab Manager Core Logic

// *** 扩展后的 URL 规则表 (Expanded URL Rules) ***
const URL_RULES = {
    // 编程 & 技术 (Programming & Tech)
    'github.com': 'Programming',
    'stackoverflow.com': 'Programming',
    'gitlab.com': 'Programming',
    'codepen.io': 'Programming',
    'jsfiddle.net': 'Programming',
    'dev.to': 'Tech Articles',
    'juejin.cn': 'Tech Articles',
    'segmentfault.com': 'Tech Articles',
    'leetcode.com': 'Coding Challenges',
    'hackerrank.com': 'Coding Challenges',
    'freecodecamp.org': 'Learning',
    
    // AI 工具 (AI Tools)
    'chatgpt.com': 'AI Tools',
    'gemini.google.com': 'AI Tools',
    'poe.com': 'AI Tools',
    'huggingface.co': 'AI Tools',
    'claude.ai': 'AI Tools',

    // 效率 & 协作 (Productivity & Collaboration)
    'notion.so': 'Productivity',
    'trello.com': 'Project Management',
    'asana.com': 'Project Management',
    'jira.atlassian.com': 'Project Management',
    'slack.com': 'Collaboration',
    'miro.com': 'Collaboration',
    'figma.com': 'Design',
    'canva.com': 'Design',

    // 文档 & 存储 (Documents & Storage)
    'docs.google.com': 'Documents',
    'sheets.google.com': 'Documents',
    'slides.google.com': 'Documents',
    'drive.google.com': 'Cloud Storage',
    'dropbox.com': 'Cloud Storage',
    'onedrive.live.com': 'Cloud Storage',
    'feishu.cn': 'Collaboration', // 飞书
    'yuque.com': 'Documents', // 语雀

    // 云服务 (Cloud Services)
    'aws.amazon.com': 'Cloud Services',
    'cloud.google.com': 'Cloud Services',
    'azure.microsoft.com': 'Cloud Services',
    'aliyun.com': 'Cloud Services',
    'cloud.tencent.com': 'Cloud Services',

    // 视频 & 娱乐 (Videos & Entertainment)
    'bilibili.com': 'Videos',
    'youtube.com': 'Videos',
    'v.qq.com': 'Videos',
    'youku.com': 'Videos',
    'iqiyi.com': 'Videos',
    'netflix.com': 'Videos',
    'twitch.tv': 'Streaming',
    'douyin.com': 'Videos',
    
    // 社交 & 新闻 (Social & News)
    'twitter.com': 'Social Media',
    'facebook.com': 'Social Media',
    'instagram.com': 'Social Media',
    'linkedin.com': 'Professional Network',
    'reddit.com': 'Social Media',
    'weibo.com': 'Social Media',
    'zhihu.com': 'Q&A Community',
    'quora.com': 'Q&A Community',
    'news.ycombinator.com': 'Tech News',
    'techcrunch.com': 'Tech News',
    'theverge.com': 'Tech News',

    // 购物 (Shopping)
    'taobao.com': 'Shopping',
    'jd.com': 'Shopping',
    'tmall.com': 'Shopping',
    'amazon.com': 'Shopping',
    'ebay.com': 'Shopping',
    'aliexpress.com': 'Shopping',

    // 学习 (Learning)
    'coursera.org': 'Learning',
    'udemy.com': 'Learning',
    'edx.org': 'Learning',
    'khanacademy.org': 'Learning'
};

const TAB_GROUP_ID_NONE = (chrome.tabGroups && typeof chrome.tabGroups.TAB_GROUP_ID_NONE === 'number')
    ? chrome.tabGroups.TAB_GROUP_ID_NONE
    : -1;

const COMMON_TLDS = new Set([
    'com', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'ai', 'info', 'biz', 'xyz', 'app', 'dev',
    'cn', 'us', 'uk', 'jp', 'de', 'fr', 'it', 'es', 'ru', 'br', 'au', 'ca', 'in', 'sg', 'hk',
    'tw', 'pt', 'pl', 'kr', 'se', 'no', 'dk', 'fi', 'be', 'nl', 'ch', 'cz', 'at', 'mx', 'za',
    'tr', 'il', 'ar', 'cl', 'id', 'th', 'my', 'ph', 'vn', 'nz', 'ie', 'gr', 'hu', 'ro', 'bg',
    'sk', 'si', 'lt', 'lv', 'ee', 'ua', 'pe'
]);

const SKIPPED_CATEGORIES = [
    "Chrome Internal",
    "Uncategorized",
    "AI No Category",
    "Local File"
];

const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
const AI_REQUEST_DELAY_MS = 250;

// --- 消息监听器，处理来自 popup.js 的不同请求 ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "aiGroup") {
        console.log("Received AI group command...");
        organizeTabsWithAI()
            .then(() => sendResponse({ status: "AI Smart Organize Complete!", type: "success" }))
            .catch(error => {
                console.error("AI Organize failed:", error);
                sendResponse({ status: error.message || "AI Organize failed.", type: "error" });
            });
        return true; // Keep channel open for async response
    
    } else if (request.action === "quickGroup") {
        console.log("Received Quick group command...");
        organizeTabsByUrl()
            .then(() => sendResponse({ status: "Quick Organize Complete!", type: "success" }))
            .catch(error => {
                console.error("Quick Organize failed:", error);
                sendResponse({ status: error.message || "Quick Organize failed.", type: "error" });
            });
        return true; // Keep channel open for async response
    
    } else if (request.action === "ungroupTabs") {
        console.log("Received Ungroup command...");
        ungroupAllTabs()
            .then(message => sendResponse({ status: message, type: "success" }))
            .catch(error => {
                console.error("Ungroup failed:", error);
                sendResponse({ status: error.message || "Ungroup failed.", type: "error" });
            });
        return true;

    } else if (request.action === "setThemeIcon") {
        updateActionIcon(Boolean(request.isDark))
            .then(() => sendResponse({ status: "Icon updated", type: "info" }))
            .catch(error => {
                console.error("Failed to update icon:", error);
                sendResponse({ status: error.message || "Icon update failed.", type: "error" });
            });
        return true;
    }
});

// --- Logic 1: AI Smart Organize (AI-first, URL fallback, Domain fallback) ---
async function organizeTabsWithAI() {
    const data = await chrome.storage.sync.get('apiKey');
    const apiKey = data.apiKey;

    if (!apiKey) {
        console.error("API Key not found in settings.");
        throw new Error("Gemini API Key is required for AI Smart Organize. Please save it in settings.");
    }

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const ungroupedTabs = tabs.filter(tab => tab.groupId === TAB_GROUP_ID_NONE);
    if (ungroupedTabs.length === 0) {
        console.log("No ungrouped tabs to organize.");
        return;
    }

    let classifications = [];
    try {
        classifications = await classifyTabsBatchWithAI(ungroupedTabs, apiKey);
    } catch (error) {
        console.warn("Batch AI classification failed, falling back to sequential strategy:", error.message);
        classifications = await classifyTabsSequential(ungroupedTabs, apiKey);
    }
    const reconciled = reconcileClassifications(classifications);
    await groupTabs(reconciled);
}

async function ungroupAllTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const groupedTabIds = tabs
        .filter(tab => tab.groupId !== TAB_GROUP_ID_NONE)
        .map(tab => tab.id);

    if (groupedTabIds.length === 0) {
        console.log("No grouped tabs to ungroup.");
        return "No grouped tabs found.";
    }

    try {
        await chrome.tabs.ungroup(groupedTabIds);
        return "Tabs have been ungrouped.";
    } catch (error) {
        console.error("Failed to ungroup tabs:", error);
        throw error;
    }
}

async function updateActionIcon(isDarkMode) {
    const iconPath = isDarkMode
        ? { "16": "icons/icon_dark-16.png", "32": "icons/icon_dark-32.png" }
        : { "16": "icons/icon_light-16.png", "32": "icons/icon_light-32.png" };
    try {
        await chrome.action.setIcon({ path: iconPath });
    } catch (error) {
        console.warn(`Could not update action icon to ${iconPath}:`, error.message);
        throw error;
    }
}

// --- Logic 2: URL Quick Organize (URL-first, Domain fallback) ---
async function organizeTabsByUrl() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const ungroupedTabs = tabs.filter(tab => tab.groupId === TAB_GROUP_ID_NONE);
    if (ungroupedTabs.length === 0) {
        console.log("No ungrouped tabs to organize.");
        return;
    }

    // Use classifyTabByUrlOnly (URL-first, Domain fallback)
    const classifications = [];
    for (const tab of ungroupedTabs) {
        const result = await classifyTabByUrlOnly(tab);
        classifications.push(result);
    }
    const reconciled = reconcileClassifications(classifications);
    await groupTabs(reconciled);
}

async function classifyTabsSequential(tabs, apiKey) {
    const results = [];
    for (const tab of tabs) {
        const result = await classifyTab(tab, apiKey);
        results.push(result);
        if (AI_REQUEST_DELAY_MS > 0) {
            await wait(AI_REQUEST_DELAY_MS);
        }
    }
    return results;
}

async function classifyTabsBatchWithAI(tabs, apiKey) {
    if (!tabs || tabs.length === 0) {
        return [];
    }

    const enumeratedTabs = tabs.map((tab, index) => ({
        index: index + 1,
        tab,
        domain: getDomainFromUrl(tab.url)
    }));

    const aiResults = await getBatchCategoriesFromAI(enumeratedTabs, apiKey);
    const indexToCategory = new Map();
    for (const entry of aiResults) {
        if (!entry) continue;
        const idx = Number(entry.index ?? entry.id ?? entry.tab ?? entry.number);
        const category = sanitizeCategory(entry.category);
        if (Number.isInteger(idx) && idx > 0 && category) {
            indexToCategory.set(idx, category);
        }
    }

    const classifications = [];
    for (const item of enumeratedTabs) {
        const { index, tab, domain } = item;
        let category = indexToCategory.get(index);

        if (!category || SKIPPED_CATEGORIES.includes(category)) {
            category = getCategoryByUrl(tab.url) || domain || "Uncategorized";
        }

        classifications.push({
            tabId: tab.id,
            category,
            domain
        });
    }

    return classifications;
}


// --- Classifier 1: AI-first, URL fallback, Domain fallback ---
async function classifyTab(tab, apiKey) {
    if (!tab.url || tab.url.startsWith('chrome://')) {
        return { tabId: tab.id, category: "Chrome Internal", domain: null };
    }

    const domain = getDomainFromUrl(tab.url);

    // 1. If API Key is provided, try AI classification first
    if (apiKey) {
        try {
            const aiCategory = await getCategoryFromAI(tab.title, tab.url, apiKey);

            if (aiCategory && aiCategory !== "Uncategorized" && aiCategory !== "AI No Category") {
                return { tabId: tab.id, category: aiCategory, domain };
            }
        } catch (error) {
            if (error?.status === 429) {
                console.warn(`AI classification throttled for ${tab.title}, falling back to URL rules.`);
            } else {
                console.warn(`AI classification for ${tab.title} failed:`, error.message);
            }
        }
    }

    // 2. Fallback: Try URL rules
    const urlCategory = getCategoryByUrl(tab.url);
    if (urlCategory) {
        return { tabId: tab.id, category: urlCategory, domain }; // URL rule matched
    }

    // 3. Final fallback: Use domain name
    return { tabId: tab.id, category: domain || "Uncategorized", domain }; // Default to domain
}

// --- Classifier 2: URL Only (URL-first, Domain fallback) ---
async function classifyTabByUrlOnly(tab) {
     if (!tab.url || tab.url.startsWith('chrome://')) {
        return { tabId: tab.id, category: "Chrome Internal", domain: null };
    }
    const domain = getDomainFromUrl(tab.url);
    // 1. Try predefined rules first
    const urlCategory = getCategoryByUrl(tab.url);
    if (urlCategory) {
        return { tabId: tab.id, category: urlCategory, domain };
    }

    // 2. Fallback: Use domain name
    return { tabId: tab.id, category: domain || "Uncategorized", domain }; // Default to domain
}


// --- Helper Functions ---

// *** NEW HELPER FUNCTION ***
function getDomainFromUrl(url) {
    if (!url) return null;
    if (url.startsWith('file://')) {
        return "Local File"; // Explicitly handle file protocol
    }
    try {
        const urlObj = new URL(url);
        // This will be empty for file URLs if not caught above
        if (urlObj.hostname) {
            return stripCommonTld(urlObj.hostname); // e.g., "news.ycombinator"
        }
        return null;
    } catch (e) {
        console.warn(`Could not parse domain from URL: ${url}`, e.message);
        return null;
    }
}

function stripCommonTld(hostname) {
    if (!hostname) return hostname;
    const parts = hostname.split('.').filter(Boolean);
    if (parts.length === 0) return hostname;

    while (parts.length > 1) {
        const last = parts[parts.length - 1].toLowerCase();
        if (COMMON_TLDS.has(last)) {
            parts.pop();
        } else {
            break;
        }
    }

    return parts.join('.');
}

function getCategoryByUrl(url) {
    if (!url) return null;
    try {
        const urlString = url.toLowerCase();
        for (const key in URL_RULES) {
            if (urlString.includes(key)) {
                return URL_RULES[key];
            }
        }
    } catch (e) {
        console.warn(`Error parsing URL: ${url}`, e.message);
    }
    return null;
}

function reconcileClassifications(classifications) {
    const domainBuckets = new Map();

    for (const item of classifications) {
        if (!item.domain) continue;
        if (!domainBuckets.has(item.domain)) {
            domainBuckets.set(item.domain, []);
        }
        domainBuckets.get(item.domain).push(item);
    }

    for (const [domain, items] of domainBuckets.entries()) {
        if (items.length <= 1) continue;
        const distinctCategories = new Set(items.map(entry => entry.category));
        if (distinctCategories.size <= 1) continue;

        const preferredCategory = pickPreferredCategory(items, domain);
        for (const entry of items) {
            entry.category = preferredCategory;
        }
    }

    return classifications;
}

function pickPreferredCategory(items, fallbackCategory) {
    const counts = new Map();
    for (const { category } of items) {
        if (!category || SKIPPED_CATEGORIES.includes(category)) continue;
        counts.set(category, (counts.get(category) || 0) + 1);
    }

    if (counts.size === 0) {
        return fallbackCategory || "Uncategorized";
    }

    let winner = null;
    let max = -1;
    for (const [category, count] of counts.entries()) {
        if (count > max || (count === max && category < winner)) {
            winner = category;
            max = count;
        }
    }

    return winner || fallbackCategory || "Uncategorized";
}

async function getBatchCategoriesFromAI(enumeratedTabs, apiKey) {
    const listText = enumeratedTabs.map(({ index, tab }) => {
        const safeTitle = (tab.title || "").replace(/\s+/g, " ").trim();
        const safeUrl = tab.url || "";
        return `${index}. Title: "${safeTitle}" | URL: "${safeUrl}"`;
    }).join("\n");

    const prompt = `You are an efficient web tab classification assistant. For each tab listed below, decide the most appropriate category name such as "Programming", "News", "Entertainment", "Social Media", "Learning", "Shopping", or another concise label.

Return JSON array only, using the exact format [{"index":1,"category":"CategoryName"}, ...]. Do not include explanations or additional text.

Tabs to classify:
${listText}`;

    const text = await callGemini(prompt, apiKey);
    const parsed = parseJsonArrayFromText(text);
    return parsed;
}

async function getCategoryFromAI(title, url, apiKey) {
    const prompt = `You are an efficient web tab classification assistant. Classify the browser tab using only its title and URL. Pick the most appropriate category name such as "Programming", "News", "Entertainment", "Social Media", "Learning", "Shopping", or another concise label. Respond with the category name only, no punctuation or explanations.
Title: "${title}"
URL: "${url}"
Category:`;

    const text = await callGemini(prompt, apiKey);
    const category = sanitizeCategory(text);
    return category || "AI No Category";
}

async function groupTabs(classifications) {
    const categoryToGroupId = new Map();
    const existingGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    for (const group of existingGroups) {
        if (group.title) {
            categoryToGroupId.set(group.title, group.id);
        }
    }

    for (const item of classifications) {
        const { tabId, category } = item;
        
        if (!category || SKIPPED_CATEGORIES.includes(category)) {
            continue; 
        }

        try {
            if (categoryToGroupId.has(category)) {
                const groupId = categoryToGroupId.get(category);
                await chrome.tabs.group({ tabIds: [tabId], groupId: groupId });
            } else {
                const newGroupId = await chrome.tabs.group({ tabIds: [tabId] });
                await chrome.tabGroups.update(newGroupId, { title: category });
                categoryToGroupId.set(category, newGroupId);
            }
        } catch(e) {
            console.warn(`Error grouping tabId ${tabId}:`, e.message);
        }
    }
}

function sanitizeCategory(raw) {
    if (!raw || typeof raw !== "string") {
        return "";
    }
    return raw.trim().replace(/['".,]/g, '');
}

async function callGemini(prompt, apiKey) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            const message = response.status === 400
                ? `API Request failed: Invalid API Key or malformed request.`
                : `API Request failed, status code: ${response.status}`;
            const error = new Error(errorText ? `${message} Details: ${errorText}` : message);
            error.status = response.status;
            throw error;
        }

        const result = await response.json();
        return result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (error) {
        console.error("Failed to call Gemini API:", error);
        throw error;
    }
}

function parseJsonArrayFromText(text) {
    if (!text) {
        throw new Error("AI response is empty.");
    }

    const trimmed = text.trim();
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (e) {
        // try to recover below
    }

    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
        const slice = trimmed.slice(start, end + 1);
        try {
            const parsed = JSON.parse(slice);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            const sanitized = slice.replace(/,\s*]/g, "]");
            const parsed = JSON.parse(sanitized);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    }

    throw new Error("AI response is not a valid JSON array.");
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
