const PROMPT_OUTPUT_LANGUAGE = 'en';
const TEXT_MAP = window.I18N?.TEXT_MAP || {};
let currentLanguageCode = 'en';
let currentTranslationMap = window.I18N?.getLanguageText?.('en') || {};

function resolveLanguageCode(value) {
    if (!value || value === 'browser') {
        const browserLang = chrome.i18n?.getUILanguage?.() || navigator.language || 'en';
        return (browserLang || 'en').toLowerCase();
    }
    return value.toLowerCase();
}

function translateText(defaultText) {
    if (!defaultText) return '';
    return currentTranslationMap[defaultText] || defaultText;
}

function t(key) {
    const defaultText = window.I18N?.getDefault?.(key) || key;
    return translateText(defaultText);
}

function formatTextKey(key, variables = {}) {
    let text = t(key);
    Object.entries(variables).forEach(([name, value]) => {
        text = text.replace(`{${name}}`, value);
    });
    return text;
}

async function initializeLanguage() {
    try {
        const { groupLanguage } = await chrome.storage.sync.get(['groupLanguage']);
        currentLanguageCode = resolveLanguageCode(groupLanguage);
        currentTranslationMap = window.I18N?.getLanguageText?.(currentLanguageCode) || {};
    } catch (error) {
        console.warn('Failed to load UI translations for popup:', error);
        currentLanguageCode = resolveLanguageCode('browser');
        currentTranslationMap = window.I18N?.getLanguageText?.(currentLanguageCode) || {};
    }
    applyPopupTranslations();
}

function applyPopupTranslations() {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        const translated = t(key);
        if (translated) {
            el.textContent = translated;
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = t(key);
        if (translated) {
            el.setAttribute('placeholder', translated);
        }
    });
    const statusEl = document.getElementById('status-message');
    if (statusEl && statusEl.textContent) {
        statusEl.textContent = translateText(statusEl.textContent);
    }
}

const CATEGORY_TRANSLATIONS = {
    "zh-cn": {
        "Programming": "编程",
        "Tech Articles": "技术文章",
        "Coding Challenges": "编程挑战",
        "Learning": "学习",
        "AI Tools": "人工智能工具",
        "Project Management": "项目管理",
        "Productivity": "效率",
        "Collaboration": "协作",
        "Design": "设计",
        "Documents": "文档",
        "Cloud Storage": "云存储",
        "Cloud Services": "云服务",
        "Videos": "视频",
        "Streaming": "流媒体",
        "Social Media": "社交媒体",
        "Professional Network": "职业社交",
        "Q&A Community": "问答社区",
        "Tech News": "科技新闻",
        "Shopping": "购物",
        "Chrome Internal": "Chrome 内部页面",
        "Local File": "本地文件",
        "Uncategorized": "未分类"
    },
    "zh-tw": {
        "Programming": "程式設計",
        "Tech Articles": "技術文章",
        "Coding Challenges": "程式挑戰",
        "Learning": "學習",
        "AI Tools": "AI 工具",
        "Project Management": "專案管理",
        "Productivity": "效率",
        "Collaboration": "協作",
        "Design": "設計",
        "Documents": "文件",
        "Cloud Storage": "雲端儲存",
        "Cloud Services": "雲端服務",
        "Videos": "影片",
        "Streaming": "串流",
        "Social Media": "社群媒體",
        "Professional Network": "專業人脈",
        "Q&A Community": "問答社群",
        "Tech News": "科技新聞",
        "Shopping": "購物",
        "Chrome Internal": "Chrome 內部頁面",
        "Local File": "本機檔案",
        "Uncategorized": "未分類"
    },
    "ja": {
        "Programming": "プログラミング",
        "Tech Articles": "技術記事",
        "Coding Challenges": "コーディングチャレンジ",
        "Learning": "学習",
        "AI Tools": "AIツール",
        "Project Management": "プロジェクト管理",
        "Productivity": "生産性",
        "Collaboration": "コラボレーション",
        "Design": "デザイン",
        "Documents": "ドキュメント",
        "Cloud Storage": "クラウドストレージ",
        "Cloud Services": "クラウドサービス",
        "Videos": "動画",
        "Streaming": "ストリーミング",
        "Social Media": "ソーシャルメディア",
        "Professional Network": "プロフェッショナルネットワーク",
        "Q&A Community": "Q&Aコミュニティ",
        "Tech News": "テックニュース",
        "Shopping": "ショッピング",
        "Chrome Internal": "Chrome 内部ページ",
        "Local File": "ローカルファイル",
        "Uncategorized": "未分類"
    },
    "ko": {
        "Programming": "프로그래밍",
        "Tech Articles": "기술 기사",
        "Coding Challenges": "코딩 챌린지",
        "Learning": "학습",
        "AI Tools": "AI 도구",
        "Project Management": "프로젝트 관리",
        "Productivity": "생산성",
        "Collaboration": "협업",
        "Design": "디자인",
        "Documents": "문서",
        "Cloud Storage": "클라우드 스토리지",
        "Cloud Services": "클라우드 서비스",
        "Videos": "영상",
        "Streaming": "스트리밍",
        "Social Media": "소셜 미디어",
        "Professional Network": "프로페셔널 네트워크",
        "Q&A Community": "Q&A 커뮤니티",
        "Tech News": "테크 뉴스",
        "Shopping": "쇼핑",
        "Chrome Internal": "Chrome 내부 페이지",
        "Local File": "로컬 파일",
        "Uncategorized": "분류되지 않음"
    },
    "fr": {
        "Programming": "Programmation",
        "Tech Articles": "Articles techniques",
        "Coding Challenges": "Défis de codage",
        "Learning": "Apprentissage",
        "AI Tools": "Outils IA",
        "Project Management": "Gestion de projet",
        "Productivity": "Productivité",
        "Collaboration": "Collaboration",
        "Design": "Conception",
        "Documents": "Documents",
        "Cloud Storage": "Stockage cloud",
        "Cloud Services": "Services cloud",
        "Videos": "Vidéos",
        "Streaming": "Streaming",
        "Social Media": "Réseaux sociaux",
        "Professional Network": "Réseau professionnel",
        "Q&A Community": "Communauté Q&R",
        "Tech News": "Actualités tech",
        "Shopping": "Shopping",
        "Chrome Internal": "Page interne Chrome",
        "Local File": "Fichier local",
        "Uncategorized": "Non classé"
    },
    "de": {
        "Programming": "Programmierung",
        "Tech Articles": "Technische Artikel",
        "Coding Challenges": "Coding-Herausforderungen",
        "Learning": "Lernen",
        "AI Tools": "KI-Tools",
        "Project Management": "Projektmanagement",
        "Productivity": "Produktivität",
        "Collaboration": "Zusammenarbeit",
        "Design": "Design",
        "Documents": "Dokumente",
        "Cloud Storage": "Cloud-Speicher",
        "Cloud Services": "Cloud-Dienste",
        "Videos": "Videos",
        "Streaming": "Streaming",
        "Social Media": "Soziale Medien",
        "Professional Network": "Berufliches Netzwerk",
        "Q&A Community": "Q&A-Community",
        "Tech News": "Tech-News",
        "Shopping": "Shopping",
        "Chrome Internal": "Chrome interne Seite",
        "Local File": "Lokale Datei",
        "Uncategorized": "Nicht kategorisiert"
    },
    "es": {
        "Programming": "Programación",
        "Tech Articles": "Artículos técnicos",
        "Coding Challenges": "Desafíos de código",
        "Learning": "Aprendizaje",
        "AI Tools": "Herramientas IA",
        "Project Management": "Gestión de proyectos",
        "Productivity": "Productividad",
        "Collaboration": "Colaboración",
        "Design": "Diseño",
        "Documents": "Documentos",
        "Cloud Storage": "Almacenamiento en la nube",
        "Cloud Services": "Servicios en la nube",
        "Videos": "Videos",
        "Streaming": "Streaming",
        "Social Media": "Redes sociales",
        "Professional Network": "Red profesional",
        "Q&A Community": "Comunidad de preguntas y respuestas",
        "Tech News": "Noticias tecnológicas",
        "Shopping": "Compras",
        "Chrome Internal": "Página interna de Chrome",
        "Local File": "Archivo local",
        "Uncategorized": "Sin categoría"
    },
    "pt": {
        "Programming": "Programação",
        "Tech Articles": "Artigos técnicos",
        "Coding Challenges": "Desafios de código",
        "Learning": "Aprendizado",
        "AI Tools": "Ferramentas de IA",
        "Project Management": "Gestão de projetos",
        "Productivity": "Produtividade",
        "Collaboration": "Colaboração",
        "Design": "Design",
        "Documents": "Documentos",
        "Cloud Storage": "Armazenamento em nuvem",
        "Cloud Services": "Serviços em nuvem",
        "Videos": "Vídeos",
        "Streaming": "Streaming",
        "Social Media": "Mídias sociais",
        "Professional Network": "Rede profissional",
        "Q&A Community": "Comunidade de perguntas e respostas",
        "Tech News": "Notícias de tecnologia",
        "Shopping": "Compras",
        "Chrome Internal": "Página interna do Chrome",
        "Local File": "Arquivo local",
        "Uncategorized": "Sem categoria"
    }
};

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
    'feishu.cn': 'Collaboration',
    'yuque.com': 'Documents',

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

const COMMON_TLDS = new Set([
    'com', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'ai', 'info', 'biz', 'xyz', 'app', 'dev',
    'cn', 'us', 'uk', 'jp', 'de', 'fr', 'it', 'es', 'ru', 'br', 'au', 'ca', 'in', 'sg', 'hk',
    'tw', 'pt', 'pl', 'kr', 'se', 'no', 'dk', 'fi', 'be', 'nl', 'ch', 'cz', 'at', 'mx', 'za',
    'tr', 'il', 'ar', 'cl', 'id', 'th', 'my', 'ph', 'vn', 'nz', 'ie', 'gr', 'hu', 'ro', 'bg',
    'sk', 'si', 'lt', 'lv', 'ee', 'ua', 'pe'
]);

document.addEventListener('DOMContentLoaded', async () => {
    await initializeLanguage();
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyButton = document.getElementById('save-key');
    const quickGroupButton = document.getElementById('quick-group');
    const aiGroupButton = document.getElementById('ai-group');
    const localPromptButton = document.getElementById('local-prompt-group');
    const ungroupButton = document.getElementById('ungroup-tabs');
    const openSettingsButton = document.getElementById('open-settings');
    const apiKeyHelpLink = document.getElementById('api-key-doc');
    const apiKeySection = document.getElementById('api-key-section'); // 新增：API Key 部分
    const statusMessage = document.getElementById('status-message');
    const groupListContainer = document.getElementById('group-list');
    const TAB_GROUP_ID_NONE = chrome.tabGroups?.TAB_GROUP_ID_NONE ?? -1;

    let currentApiKey = ''; // 用于存储当前加载的 API Key
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    syncActionIcon(colorSchemeQuery.matches);
    colorSchemeQuery.addEventListener('change', (event) => syncActionIcon(event.matches));

    // 弹出窗口打开时，加载已保存的 API Key
    chrome.storage.sync.get('apiKey', (data) => {
        if (data.apiKey) {
            currentApiKey = data.apiKey;
            apiKeyInput.value = data.apiKey;
        } else {
            apiKeyInput.value = '';
        }
        apiKeySection.classList.add('hidden');
        apiKeyHelpLink.classList.add('hidden');
        refreshGroups();
    });

    openSettingsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage(() => {
            if (chrome.runtime.lastError) {
                console.error('Failed to open settings page:', chrome.runtime.lastError.message);
                showStatusKey('status.openSettingsFailed', 'error');
            }
        });
    });

    // 保存 API Key
    saveKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ apiKey: apiKey }, () => {
                currentApiKey = apiKey; // 更新内存中的 Key
                showStatusKey('status.apiSaved', 'success');
                apiKeySection.classList.add('hidden');
                apiKeyHelpLink.classList.add('hidden');
            });
        } else {
            showStatusKey('status.apiInvalid', 'error');
        }
    });

    // --- 快速分组按钮 ---
    quickGroupButton.addEventListener('click', () => {
        showStatusKey('status.quickOrganize');
        disableButtons(true);
        apiKeySection.classList.add('hidden');
        apiKeyHelpLink.classList.add('hidden');
        chrome.runtime.sendMessage({ action: "quickGroup" }, (response) => {
            handleResponse(response);
        });
    });

    if (localPromptButton) {
        localPromptButton.addEventListener('click', async () => {
            showStatusKey('status.chromeOrganize');
            disableButtons(true);
            apiKeySection.classList.add('hidden');
            apiKeyHelpLink.classList.add('hidden');
            try {
                await runLocalPromptGrouping();
            } catch (error) {
                console.error('Chrome AI grouping failed:', error);
                const fallback = error && error.message ? translateText(error.message) : t('status.chromeFallback');
                showStatus(fallback, 'error');
                chrome.runtime.sendMessage({ action: "quickGroup" }, (response) => {
                    handleResponse(response);
                });
                return;
            }
        });
    }

    // --- AI 分组按钮 ---
    aiGroupButton.addEventListener('click', () => {
        // AI 分组前，检查内存中是否有 API Key
        if (currentApiKey) {
            // 如果有 Key，直接发送 "aiGroup" 指令
            showStatusKey('status.onlineOrganize');
            disableButtons(true);
            apiKeySection.classList.add('hidden');
            apiKeyHelpLink.classList.add('hidden');
            chrome.runtime.sendMessage({ action: "aiGroup" }, (response) => {
                handleResponse(response);
            });
        } else {
            // 如果没有 Key，显示 API Key 输入框
            showStatusKey('status.needApiKey');
            apiKeySection.classList.remove('hidden'); // 显示 API Key 部分
            apiKeyInput.focus();
            apiKeyHelpLink.classList.remove('hidden');
        }
    });

    // --- Ungroup Tabs 按钮 ---
    ungroupButton.addEventListener('click', () => {
        showStatusKey('status.removeGroups');
        disableButtons(true);
        apiKeySection.classList.add('hidden');
        apiKeyHelpLink.classList.add('hidden');
        chrome.runtime.sendMessage({ action: "ungroupTabs" }, (response) => {
            handleResponse(response);
        });
    });

    if (groupListContainer) {
        groupListContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target.classList.contains('ungroup-group-button')) {
                const groupId = Number(target.dataset.groupId);
                if (!Number.isInteger(groupId)) {
                    showStatusKey('status.invalidGroup', 'error');
                    return;
                }
                showStatusKey('status.ungroupSelected');
                disableButtons(true);
                chrome.runtime.sendMessage({ action: "ungroupGroup", groupId }, (response) => {
                    handleResponse(response);
                });
            }
        });
    }

    refreshGroups();

    chrome.runtime.onMessage.addListener((request) => {
        if (request?.action === 'groupLanguageUpdated') {
            initializeLanguage()
                .then(() => translateGroupTitles())
                .then(() => refreshGroups())
                .catch(error => {
                    console.warn('Failed to refresh popup language:', error);
                });
        }
    });

    // 统一处理来自后台的响应
    function handleResponse(response) {
        if (chrome.runtime.lastError) {
            showStatusKey('status.genericError', 'error');
            console.error(chrome.runtime.lastError.message);
        } else if (response && response.status) {
            showStatus(response.status, response.type || 'info');
        } else {
             showStatusKey('status.unknownResponse', 'error');
        }
        disableButtons(false); // 任务结束后恢复按钮
        const previousText = statusMessage.textContent;
        const previousClass = statusMessage.className;
        if (!chrome.runtime.lastError && response && response.type !== 'error') {
            translateGroupTitles().finally(() => {
                statusMessage.textContent = previousText;
                statusMessage.className = previousClass;
                refreshGroups();
            }); 
        } else {
            refreshGroups();
        }
    }

    // 辅助函数：禁用/启用按钮
    function disableButtons(disabled) {
        quickGroupButton.disabled = disabled;
        aiGroupButton.disabled = disabled;
        if (localPromptButton) {
            localPromptButton.disabled = disabled;
        }
        ungroupButton.disabled = disabled;
        openSettingsButton.disabled = disabled;
        saveKeyButton.disabled = disabled;
        apiKeyInput.disabled = disabled;
        if (groupListContainer) {
            const buttons = groupListContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = disabled;
            });
        }
    }

    // 辅助函数：显示状态消息
    function showStatus(message, type = 'info') {
        statusMessage.textContent = translateText(message);
        statusMessage.className = `status ${type}`; // 'success', 'error', 'info'
    }

    function showStatusKey(key, type = 'info', variables = {}) {
        showStatus(formatTextKey(key, variables), type);
    }

    function refreshGroups() {
        if (!groupListContainer) return;
        groupListContainer.innerHTML = `<p class="group-placeholder">${t('popup.groups.loading')}</p>`;
        chrome.runtime.sendMessage({ action: "listGroups" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Failed to load groups:', chrome.runtime.lastError.message);
                groupListContainer.innerHTML = `<p class="group-placeholder">${t('popup.groups.unable')}</p>`;
                return;
            }

            if (!response || !Array.isArray(response.groups)) {
                groupListContainer.innerHTML = `<p class="group-placeholder">${t('popup.groups.noinfo')}</p>`;
                return;
            }

            renderGroupList(response.groups);
        });
    }

    function renderGroupList(groups) {
        groupListContainer.innerHTML = '';
        if (!groups.length) {
            groupListContainer.innerHTML = `<p class="group-placeholder">${t('popup.groups.none')}</p>`;
            return;
        }

        for (const group of groups) {
            const item = document.createElement('div');
            item.className = 'group-item';

            const info = document.createElement('div');
            info.className = 'group-info';

            const title = document.createElement('span');
            title.className = 'group-title';
            title.textContent = group.title || formatTextKey('popup.groups.fallbackTitle', { id: group.id });

            const meta = document.createElement('span');
            meta.className = 'group-meta';
            const tabCount = Number(group.tabCount) || 0;
            const countKey = tabCount === 1 ? 'popup.groups.tabCountSingular' : 'popup.groups.tabCountPlural';
            meta.textContent = formatTextKey(countKey, { count: tabCount });

            info.appendChild(title);
            info.appendChild(meta);

            const actionButton = document.createElement('button');
            actionButton.className = 'btn small secondary ungroup-group-button';
            actionButton.dataset.groupId = String(group.id);
            actionButton.textContent = t('popup.buttons.ungroupSingle');

            item.appendChild(info);
            item.appendChild(actionButton);

            groupListContainer.appendChild(item);
        }
    }

    function syncActionIcon(isDarkMode) {
        chrome.runtime.sendMessage({ action: "setThemeIcon", isDark: isDarkMode }, () => {
            if (chrome.runtime.lastError) {
                console.warn('Failed to sync icon theme:', chrome.runtime.lastError.message);
            }
        });
    }

    async function runLocalPromptGrouping() {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const ungroupedTabs = tabs.filter(tab => tab.groupId === TAB_GROUP_ID_NONE);
        if (ungroupedTabs.length === 0) {
            showStatusKey('status.noUngrouped', 'info');
            disableButtons(false);
            refreshGroups();
            return;
        }

        if (!('LanguageModel' in self) || typeof LanguageModel.create !== 'function') {
            throw new Error(TEXT_MAP['status.chromeUnsupported']);
        }

        const availability = await LanguageModel.availability?.({
            model: '1.5-flash',
            output: { language: PROMPT_OUTPUT_LANGUAGE },
            outputLanguage: PROMPT_OUTPUT_LANGUAGE,
            responseLanguage: PROMPT_OUTPUT_LANGUAGE
        }) ?? 'unavailable';
        if (availability === 'unavailable') {
            throw new Error(TEXT_MAP['status.chromeUnavailable']);
        }
        if ((availability === 'downloadable' || availability === 'downloading') && !(navigator.userActivation?.isActive)) {
            throw new Error(TEXT_MAP['status.chromeActivation']);
        }

        const params = await LanguageModel.params?.({
            model: '1.5-flash',
            output: { language: PROMPT_OUTPUT_LANGUAGE },
            outputLanguage: PROMPT_OUTPUT_LANGUAGE,
            responseLanguage: PROMPT_OUTPUT_LANGUAGE
        });
        const sessionOptions = {
            model: '1.5-flash',
            output: { language: PROMPT_OUTPUT_LANGUAGE },
            outputLanguage: PROMPT_OUTPUT_LANGUAGE,
            responseLanguage: PROMPT_OUTPUT_LANGUAGE
        };
        if (params && typeof params.defaultTopK !== 'undefined' && typeof params.defaultTemperature !== 'undefined') {
            sessionOptions.topK = params.defaultTopK;
            sessionOptions.temperature = params.defaultTemperature;
        }
        sessionOptions.monitor = (monitor) => {
            monitor.addEventListener('downloadprogress', (event) => {
                const percent = event.total ? Math.round((event.loaded / event.total) * 100) : Math.round(event.loaded * 100);
                showStatusKey('status.chromeDownloading', 'info', { percent });
            });
        };

        showStatusKey('status.chromePreparing');
        const session = await LanguageModel.create(sessionOptions);

        showStatusKey('status.chromeClassifying');
        const promptText = buildPromptPayload(ungroupedTabs);
        let rawResponse = '';
        try {
            const result = await session.prompt(promptText, {
                output: { language: PROMPT_OUTPUT_LANGUAGE },
                outputLanguage: PROMPT_OUTPUT_LANGUAGE,
                responseLanguage: PROMPT_OUTPUT_LANGUAGE
            });
            rawResponse = extractTextFromPromptResponse(result);
        } finally {
            session.destroy?.();
        }

        const classifications = await buildClassificationsFromPrompt(rawResponse, ungroupedTabs);
        const response = await sendApplyClassifications(classifications);
        handleResponse(response);
    }

    async function translateGroupTitles() {
        const targetLanguage = await getPreferredLanguage();
        if (!targetLanguage || targetLanguage.toLowerCase().startsWith('en')) {
            return;
        }

        const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
        if (!groups.length) return;

        const uniqueTitles = new Map();
        for (const group of groups) {
            if (group.title) {
                uniqueTitles.set(group.title, null);
            }
        }

        let translator = null;
        let translatorReady = false;
        if ('Translator' in self && typeof Translator.create === 'function') {
            try {
                const availability = await Translator.availability({
                    sourceLanguage: 'en',
                    targetLanguage
                });
                if (availability === 'unavailable') {
                    translatorReady = false;
                } else if ((availability === 'downloadable' || availability === 'downloading') && !(navigator.userActivation?.isActive)) {
                    console.warn('User activation required to download translator model.');
                    translatorReady = false;
                } else {
                    translator = await Translator.create({
                        sourceLanguage: 'en',
                        targetLanguage,
                        monitor(monitor) {
                            monitor.addEventListener('downloadprogress', (event) => {
                                const percent = event.total ? Math.round((event.loaded / event.total) * 100) : Math.round(event.loaded * 100);
                                showStatusKey('status.translatorDownloading', 'info', { percent });
                            });
                        }
                    });
                    translatorReady = Boolean(translator);
                }
            } catch (error) {
                console.warn('Translator API session failed:', error);
                translator = null;
                translatorReady = false;
            }
        } 

        const dictionary = getDictionaryForLanguage(targetLanguage);

        for (const title of uniqueTitles.keys()) {
            let translated = null;
            if (translatorReady && translator) {
                try {
                    translated = await translator.translate(title);
                } catch (error) {
                    console.warn(`Translator API failed for "${title}":`, error);
                }
            }
            if (!translated && dictionary) {
                translated = lookupDictionaryTranslation(dictionary, title);
            }
            uniqueTitles.set(title, translated || title);
        }

        translator?.destroy?.();

        const updates = [];
        for (const group of groups) {
            const translated = uniqueTitles.get(group.title);
            if (translated && translated !== group.title) {
                updates.push(
                    chrome.tabGroups.update(group.id, { title: translated }).catch(error => {
                        console.warn(`Failed to update group ${group.id}:`, error);
                    })
                );
            }
        }
        await Promise.all(updates);
    }

    async function buildClassificationsFromPrompt(rawText, tabs) {
        const parsed = extractJsonArray(rawText);
        const mapped = new Map();

        if (Array.isArray(parsed)) {
            for (const entry of parsed) {
                if (!entry) continue;
                const idx = Number(entry.index ?? entry.id ?? entry.tab ?? entry.order);
                const rawCategory = entry.category ?? entry.label ?? entry.result ?? entry.output ?? entry;
                const category = sanitizeCategoryName(typeof rawCategory === 'string' ? rawCategory : '');
                if (Number.isInteger(idx) && idx > 0 && category) {
                    mapped.set(idx - 1, category);
                }
            }
        }

        const results = [];
        tabs.forEach((tab, index) => {
            const fallbackDomain = getDomainFromUrl(tab.url);
            let category = mapped.get(index);
            if (!category) {
                category = getCategoryByUrl(tab.url) || fallbackDomain || 'Uncategorized';
            }
            results.push({
                tabId: tab.id,
                category,
                domain: fallbackDomain
            });
        });
        return results;
    }

    function buildPromptPayload(tabs) {
        const lines = tabs.map((tab, idx) => {
            const title = (tab.title || '').replace(/\s+/g, ' ').trim();
            return `${idx + 1}. Title: "${title}" | URL: ${tab.url || ''}`;
        });
        return `You are an efficient browser tab classification assistant. For each tab listed below, return a concise category name (maximum 3 words). Respond with a JSON array like [{"index":1,"category":"Category"}].\n\nTabs:\n${lines.join('\n')}`;
    }

    function extractTextFromPromptResponse(response) {
        if (!response) return '';
        if (typeof response === 'string') return response;
        if (typeof response === 'object') {
            if (Array.isArray(response)) {
                return response.map(extractTextFromPromptResponse).join('\n');
            }
            return response.output_text || response.outputText || response.text || response.result || response.content || '';
        }
        return String(response);
    }

    function extractJsonArray(text) {
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch (error) {
            // try to extract array
        }
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
            const slice = text.slice(start, end + 1);
            try {
                return JSON.parse(slice);
            } catch (error) {
                try {
                    const sanitized = slice.replace(/,\s*]/g, ']');
                    return JSON.parse(sanitized);
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    async function sendApplyClassifications(classifications) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "applyClassifications", classifications }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                resolve(response);
            });
        });
    }

    async function getPreferredLanguage() {
        const { groupLanguage } = await chrome.storage.sync.get('groupLanguage');
        if (groupLanguage && groupLanguage !== 'browser') {
            return groupLanguage;
        }
        return chrome.i18n?.getUILanguage?.() || navigator.language || 'en';
    }

    function getDictionaryForLanguage(language) {
        if (!language) return null;
        const lower = language.toLowerCase();
        if (CATEGORY_TRANSLATIONS[lower]) return CATEGORY_TRANSLATIONS[lower];
        const base = lower.split('-')[0];
        return CATEGORY_TRANSLATIONS[base] || null;
    }

    function lookupDictionaryTranslation(dictionary, category) {
        if (!dictionary || !category) return null;
        if (dictionary[category]) return dictionary[category];
        const lowered = category.toLowerCase();
        for (const key of Object.keys(dictionary)) {
            if (key.toLowerCase() === lowered) {
                return dictionary[key];
            }
        }
        return null;
    }

    function sanitizeCategoryName(raw) {
        if (!raw || typeof raw !== 'string') return '';
        return raw.trim().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
    }
});
function getDomainFromUrl(url) {
    if (!url) return null;
    if (url.startsWith('file://')) {
        return "Local File";
    }
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname) {
            return stripCommonTld(urlObj.hostname);
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
