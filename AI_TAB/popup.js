document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyButton = document.getElementById('save-key');
    const quickGroupButton = document.getElementById('quick-group');
    const aiGroupButton = document.getElementById('ai-group');
    const ungroupButton = document.getElementById('ungroup-tabs');
    const apiKeySection = document.getElementById('api-key-section'); // 新增：API Key 部分
    const statusMessage = document.getElementById('status-message');

    let currentApiKey = ''; // 用于存储当前加载的 API Key

    // 弹出窗口打开时，加载已保存的 API Key
    chrome.storage.sync.get('apiKey', (data) => {
        if (data.apiKey) {
            currentApiKey = data.apiKey;
            apiKeyInput.value = data.apiKey; // 仍然填充输入框，但它是隐藏的
        }
    });

    // 保存 API Key
    saveKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ apiKey: apiKey }, () => {
                currentApiKey = apiKey; // 更新内存中的 Key
                showStatus('API Key saved successfully!', 'success');
                apiKeySection.classList.add('hidden'); // 成功保存后隐藏输入框
            });
        } else {
            showStatus('Please enter a valid API Key.', 'error');
        }
    });

    // --- 快速分组按钮 ---
    quickGroupButton.addEventListener('click', () => {
        showStatus('Organizing tabs quickly...', 'info');
        disableButtons(true);
        apiKeySection.classList.add('hidden'); // 隐藏 API Key 部分

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
            apiKeySection.classList.add('hidden'); // 隐藏 API Key 部分

            chrome.runtime.sendMessage({ action: "aiGroup" }, (response) => {
                handleResponse(response);
            });
        } else {
            // 如果没有 Key，显示 API Key 输入框
            showStatus('Please enter your Gemini API Key for AI grouping.', 'info');
            apiKeySection.classList.remove('hidden'); // 显示 API Key 部分
            apiKeyInput.focus();
        }
    });

    // --- Ungroup Tabs 按钮 ---
    ungroupButton.addEventListener('click', () => {
        showStatus('Removing groups from current window...', 'info');
        disableButtons(true);
        apiKeySection.classList.add('hidden');

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
        saveKeyButton.disabled = disabled && !apiKeySection.classList.contains('hidden'); // 只有在 API Key 输入框显示时才禁用保存按钮
        apiKeyInput.disabled = disabled && !apiKeySection.classList.contains('hidden');
    }

    // 辅助函数：显示状态消息
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`; // 'success', 'error', 'info'
    }
});
