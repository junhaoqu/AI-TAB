const TEXT_MAP = window.I18N?.TEXT_MAP || {};

let currentTranslationMap = {};
let currentLanguageCode = 'en';
let toggleButtonRef = null;
let showingKey = false;

function notifyLanguageChange() {
    try {
        chrome.runtime?.sendMessage?.({ action: 'groupLanguageUpdated' });
    } catch (error) {
        console.warn('Failed to notify popup about language change:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('api-key-input');
    const saveButton = document.getElementById('save-api-key');
    const clearButton = document.getElementById('clear-api-key');
    toggleButtonRef = document.getElementById('toggle-visibility');
    const languageSelect = document.getElementById('group-language');
    const statusEl = document.getElementById('status');

    await initializeLanguage(languageSelect);
    applyOptionsTranslations();
    await loadStoredKey(apiKeyInput, statusEl);

    saveButton.addEventListener('click', async () => {
        const raw = apiKeyInput.value.trim();
        if (!raw) {
            showStatusKey('options.status.enterApiBeforeSaving', 'error');
            return;
        }
        try {
            await chrome.storage.sync.set({ apiKey: raw });
            showStatusKey('options.status.saveSuccess', 'success');
        } catch (error) {
            showStatusKey('options.status.saveFailed', 'error');
            console.error('Failed to save API key:', error);
        }
    });

    clearButton.addEventListener('click', async () => {
        try {
            await chrome.storage.sync.remove('apiKey');
            apiKeyInput.value = '';
            showStatusKey('options.status.clearSuccess', 'success');
        } catch (error) {
            showStatusKey('options.status.clearFailed', 'error');
            console.error('Failed to clear API key:', error);
        }
    });

    if (toggleButtonRef) {
        toggleButtonRef.addEventListener('click', () => {
            showingKey = !showingKey;
            apiKeyInput.type = showingKey ? 'text' : 'password';
            updateToggleButtonLabel();
        });
    }

    if (languageSelect) {
        languageSelect.addEventListener('change', async () => {
            const value = languageSelect.value || 'browser';
            await updateGroupingLanguage(value);
        });
    }
});

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

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    statusEl.textContent = translateText(message);
    statusEl.className = `status ${type}`;
}

function showStatusKey(key, type = 'info', variables = {}) {
    showStatus(formatTextKey(key, variables), type);
}

async function initializeLanguage(languageSelect) {
    try {
        const { groupLanguage } = await chrome.storage.sync.get(['groupLanguage']);
        const stored = groupLanguage || 'browser';
        if (languageSelect) {
            const hasOption = Array.from(languageSelect.options).some(option => option.value === stored);
            languageSelect.value = hasOption ? stored : 'browser';
        }
        currentLanguageCode = resolveLanguageCode(stored);
        currentTranslationMap = window.I18N?.getLanguageText?.(currentLanguageCode) || {};
    } catch (error) {
        console.warn('Failed to load UI translations:', error);
        currentLanguageCode = resolveLanguageCode('browser');
        currentTranslationMap = window.I18N?.getLanguageText?.(currentLanguageCode) || {};
    }
}

async function loadStoredKey(input, statusEl) {
    try {
        const { apiKey } = await chrome.storage.sync.get('apiKey');
        input.value = apiKey || '';
    } catch (error) {
        showStatusKey('options.status.loadKeyFailed', 'error');
        console.error('Failed to load API key:', error);
    }
}

function applyOptionsTranslations() {
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
    const statusEl = document.getElementById('status');
    if (statusEl && statusEl.textContent) {
        statusEl.textContent = translateText(statusEl.textContent);
    }
    updateToggleButtonLabel();
}

function updateToggleButtonLabel() {
    if (!toggleButtonRef) return;
    toggleButtonRef.textContent = showingKey ? t('options.buttons.hide') : t('options.buttons.show');
}

async function updateGroupingLanguage(selectedValue) {
    const resolved = resolveLanguageCode(selectedValue);
    try {
        await chrome.storage.sync.set({ groupLanguage: selectedValue });
    } catch (error) {
        showStatusKey('options.status.languageFailed', 'error');
        console.error('Failed to save grouping language:', error);
        return;
    }

    currentLanguageCode = resolved;
    currentTranslationMap = window.I18N?.getLanguageText?.(resolved) || {};
    applyOptionsTranslations();
    showStatusKey('options.status.languageUpdated', 'success');
    notifyLanguageChange();
}
