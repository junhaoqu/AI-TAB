document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyButton = document.getElementById('save-key');
    const quickGroupButton = document.getElementById('quick-group');
    const aiGroupButton = document.getElementById('ai-group');
    const ungroupButton = document.getElementById('ungroup-tabs');
    const openSettingsButton = document.getElementById('open-settings');
    const apiKeyHelpLink = document.getElementById('api-key-doc');
    const apiKeySection = document.getElementById('api-key-section'); // 新增：API Key 部分
    const statusMessage = document.getElementById('status-message');

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
    });

    openSettingsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage(() => {
            if (chrome.runtime.lastError) {
                console.error('Failed to open settings page:', chrome.runtime.lastError.message);
                showStatus('Unable to open settings page.', 'error');
            }
        });
    });

    // 保存 API Key
    saveKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ apiKey: apiKey }, () => {
                currentApiKey = apiKey; // 更新内存中的 Key
                showStatus('API Key saved successfully!', 'success');
                apiKeySection.classList.add('hidden');
                apiKeyHelpLink.classList.add('hidden');
            });
        } else {
            showStatus('Please enter a valid API Key.', 'error');
        }
    });

    // --- 快速分组按钮 ---
    quickGroupButton.addEventListener('click', () => {
        showStatus('Organizing tabs quickly...', 'info');
        disableButtons(true);
        apiKeySection.classList.add('hidden');
        apiKeyHelpLink.classList.add('hidden');
        chrome.runtime.sendMessage({ action: "quickGroup" }, (response) => {
            handleResponse(response);
        });
    });

    // --- AI 分组按钮 ---
    aiGroupButton.addEventListener('click', () => {
        // AI 分组前，检查内存中是否有 API Key
        if (currentApiKey) {
            // 如果有 Key，直接发送 "aiGroup" 指令
            showStatus('Initiating AI smart organization...', 'info');
            disableButtons(true);
            apiKeySection.classList.add('hidden');
            apiKeyHelpLink.classList.add('hidden');
            chrome.runtime.sendMessage({ action: "aiGroup" }, (response) => {
                handleResponse(response);
            });
        } else {
            // 如果没有 Key，显示 API Key 输入框
            showStatus('Please enter your Gemini API Key for AI grouping.', 'info');
            apiKeySection.classList.remove('hidden'); // 显示 API Key 部分
            apiKeyInput.focus();
            apiKeyHelpLink.classList.remove('hidden');
        }
    });

    // --- Ungroup Tabs 按钮 ---
    ungroupButton.addEventListener('click', () => {
        showStatus('Removing groups from current window...', 'info');
        disableButtons(true);
        apiKeySection.classList.add('hidden');
        apiKeyHelpLink.classList.add('hidden');
        chrome.runtime.sendMessage({ action: "ungroupTabs" }, (response) => {
            handleResponse(response);
        });
    });

    // 统一处理来自后台的响应
    function handleResponse(response) {
        if (chrome.runtime.lastError) {
            showStatus('An error occurred, please try again.', 'error');
            console.error(chrome.runtime.lastError.message);
        } else if (response && response.status) {
            showStatus(response.status, response.type || 'info');
        } else {
             showStatus('Unknown response from background script.', 'error');
        }
        disableButtons(false); // 任务结束后恢复按钮
    }

    // 辅助函数：禁用/启用按钮
    function disableButtons(disabled) {
        quickGroupButton.disabled = disabled;
        aiGroupButton.disabled = disabled;
        ungroupButton.disabled = disabled;
        openSettingsButton.disabled = disabled;
        saveKeyButton.disabled = disabled;
        apiKeyInput.disabled = disabled;
    }

    // 辅助函数：显示状态消息
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`; // 'success', 'error', 'info'
    }

    function syncActionIcon(isDarkMode) {
        chrome.runtime.sendMessage({ action: "setThemeIcon", isDark: isDarkMode }, () => {
            if (chrome.runtime.lastError) {
                console.warn('Failed to sync icon theme:', chrome.runtime.lastError.message);
            }
        });
    }
});
