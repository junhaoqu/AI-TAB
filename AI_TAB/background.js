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
    'chat.openai.com': 'AI Tools',
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

    // Use classifyTab (AI-first, URL fallback, Domain fallback)
    const classificationPromises = ungroupedTabs.map(tab => classifyTab(tab, apiKey));
    const classifications = await Promise.all(classificationPromises);
    await groupTabs(classifications);
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

// --- Logic 2: URL Quick Organize (URL-first, Domain fallback) ---
async function organizeTabsByUrl() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const ungroupedTabs = tabs.filter(tab => tab.groupId === TAB_GROUP_ID_NONE);
    if (ungroupedTabs.length === 0) {
        console.log("No ungrouped tabs to organize.");
        return;
    }

    // Use classifyTabByUrlOnly (URL-first, Domain fallback)
    const classificationPromises = ungroupedTabs.map(classifyTabByUrlOnly);
    const classifications = await Promise.all(classificationPromises);
    await groupTabs(classifications);
}


// --- Classifier 1: AI-first, URL fallback, Domain fallback ---
async function classifyTab(tab, apiKey) {
    if (!tab.url || tab.url.startsWith('chrome://')) {
        return { tabId: tab.id, category: "Chrome Internal" };
    }

    // 1. If API Key is provided, try AI classification first
    if (apiKey) {
        try {
            const content = await getTabContent(tab.id);
            const aiCategory = await getCategoryFromAI(tab.title, content, apiKey);
            
            if (aiCategory && aiCategory !== "Uncategorized" && aiCategory !== "AI No Category") {
                return { tabId: tab.id, category: aiCategory }; // AI classification successful
            }
        } catch (error) {
            console.warn(`AI classification for ${tab.title} failed:`, error.message);
        }
    }

    // 2. Fallback: Try URL rules
    const urlCategory = getCategoryByUrl(tab.url);
    if (urlCategory) {
        return { tabId: tab.id, category: urlCategory }; // URL rule matched
    }

    // 3. Final fallback: Use domain name
    const domain = getDomainFromUrl(tab.url);
    return { tabId: tab.id, category: domain || "Uncategorized" }; // Default to domain
}

// --- Classifier 2: URL Only (URL-first, Domain fallback) ---
async function classifyTabByUrlOnly(tab) {
     if (!tab.url || tab.url.startsWith('chrome://')) {
        return { tabId: tab.id, category: "Chrome Internal" };
    }
    // 1. Try predefined rules first
    const urlCategory = getCategoryByUrl(tab.url);
    if (urlCategory) {
        return { tabId: tab.id, category: urlCategory };
    }

    // 2. Fallback: Use domain name
    const domain = getDomainFromUrl(tab.url);
    return { tabId: tab.id, category: domain || "Uncategorized" }; // Default to domain
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
            return urlObj.hostname; // e.g., "www.google.com"
        }
        return null;
    } catch (e) {
        console.warn(`Could not parse domain from URL: ${url}`, e.message);
        return null;
    }
}

async function getTabContent(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => document.body.innerText.substring(0, 4000)
        });
        return results[0].result || "";
    } catch (e) {
        console.warn(`Could not read content from tab ${tabId}`, e.message);
        return "";
    }
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

async function getCategoryFromAI(title, content, apiKey) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const prompt = `You are an efficient web tab classification assistant. Based on the following web page title and content summary, provide the most suitable category name. Keep the category name concise, for example: "Programming", "News", "Entertainment", "Social Media", "Learning", "Shopping". Return only the category name, without any extra explanation or punctuation. Web Page Title: "${title}" Content Summary: "${content}" Category Name is:`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            if (response.status === 400) {
                 throw new Error(`API Request failed: Invalid API Key or malformed request.`);
            }
            throw new Error(`API Request failed, status code: ${response.status}`);
        }

        const result = await response.json();
        const category = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return category ? category.replace(/['".,]/g, '') : "AI No Category";
    } catch (error) {
        console.error("Failed to call Gemini API:", error);
        throw error;
    }
}

async function groupTabs(classifications) {
    const categoryToGroupId = new Map();
    const existingGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    for (const group of existingGroups) {
        if (group.title) {
            categoryToGroupId.set(group.title, group.id);
        }
    }

    // *** UPDATED LIST OF CATEGORIES TO SKIP ***
    const SKIPPED_CATEGORIES = [
        "Chrome Internal", 
        "Uncategorized", 
        "AI No Category", 
        "Local File" // Don't group local files unless AI gives them a real category
    ];

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
