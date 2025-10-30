document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key-input');
    const saveButton = document.getElementById('save-api-key');
    const clearButton = document.getElementById('clear-api-key');
    const toggleButton = document.getElementById('toggle-visibility');
    const languageSelect = document.getElementById('group-language');
    const status = document.getElementById('status');

    let showingText = false;

    loadStoredKey();
    loadGroupLanguage();

    saveButton.addEventListener('click', async () => {
        const raw = apiKeyInput.value.trim();
        if (!raw) {
            showStatus('Please enter a valid API key before saving.', 'error');
            return;
        }
        try {
            await chrome.storage.sync.set({ apiKey: raw });
            showStatus('API key saved successfully.', 'success');
        } catch (error) {
            showStatus('Failed to save API key. Please try again.', 'error');
            console.error('Failed to save API key:', error);
        }
    });

    clearButton.addEventListener('click', async () => {
        try {
            await chrome.storage.sync.remove('apiKey');
            apiKeyInput.value = '';
            showStatus('API key cleared.', 'success');
        } catch (error) {
            showStatus('Failed to clear API key. Please try again.', 'error');
            console.error('Failed to clear API key:', error);
        }
    });

    toggleButton.addEventListener('click', () => {
        showingText = !showingText;
        apiKeyInput.type = showingText ? 'text' : 'password';
        toggleButton.textContent = showingText ? 'Hide' : 'Show';
    });

    if (languageSelect) {
        languageSelect.addEventListener('change', async () => {
            const value = languageSelect.value || 'browser';
            try {
                await chrome.storage.sync.set({ groupLanguage: value });
                showStatus('Grouping language updated.', 'success');
            } catch (error) {
                showStatus('Failed to update language preference.', 'error');
                console.error('Failed to save grouping language:', error);
            }
        });
    }

    function loadStoredKey() {
        chrome.storage.sync.get('apiKey', (data) => {
            if (chrome.runtime.lastError) {
                showStatus('Unable to load existing API key.', 'error');
                console.error('Failed to load API key:', chrome.runtime.lastError);
                return;
            }
            apiKeyInput.value = data.apiKey || '';
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
    }

    function loadGroupLanguage() {
        if (!languageSelect) return;
        chrome.storage.sync.get('groupLanguage', (data) => {
            if (chrome.runtime.lastError) {
                console.error('Failed to load grouping language:', chrome.runtime.lastError);
                return;
            }
            const stored = data.groupLanguage || 'browser';
            const hasOption = Array.from(languageSelect.options).some(option => option.value === stored);
            languageSelect.value = hasOption ? stored : 'browser';
        });
    }
});
