# AI Tab Organizer

AI Tab Organizer turns every chaotic browsing session into a tidy command center. Instant Quick Organize groups untagged tabs by battle-tested URL heuristics, while Chrome AI Organize harnesses Google’s built-in Prompt API for private, on-device intelligence that never leaves the browser. When you connect your Gemini API key, Online AI Organize upgrades the experience with cloud analysis that understands titles and URLs, reconciles inconsistent labels, and keeps related tabs together. A dedicated Ungroup action resets everything in one click, making it easy to retry different strategies without hunting through Chrome menus.

Localization is first-class: the popup, settings page, and status feedback instantly follow your chosen language, or automatically mirror the browser UI when you prefer the default. Chrome’s Translator API converts finished group titles so every collection stays meaningful to multilingual teams. Category dictionaries cover eight major languages out of the box, giving predictable translations even when offline or before models finish downloading. Theme-aware icons switch between light and dark artwork automatically, keeping the toolbar consistent with your operating system.

Power users will appreciate the streamlined settings panel. From there you manage the Gemini key, review the current Gemini 2.5 flash preview model reference, jump to Google’s documentation for securing keys, and learn how to enable the built-in Chrome AI stack on eligible devices. Because every grouping flow skips tabs you have already arranged, no existing Chrome tab groups are disturbed unless you explicitly hit Ungroup, making experimentation safe during focus-intensive work. Whether you are triaging research, comparing purchase options, prepping lessons, or switching between client projects, the extension keeps context within reach and dramatically cuts the time spent digging through dozens of forgotten tabs. Install AI Tab Organizer today, reclaim your focus, and let your browser feel fast, smart, and effortless again.

---

## How to Use

### Installation (For Developers)

1.  Download or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable **"Developer mode"** using the toggle in the top-right corner.
4.  Click the **"Load unpacked"** button.
5.  Select the `AI_TAB` folder from your local machine (the one containing the `manifest.json` file).
6.  The extension is now installed. Pin the "Tab Organizer" icon to your toolbar for easy access.

### Using the Organizer

1.  **Open the Popup:** Click the **Tab Organizer icon** in your Chrome toolbar to open the main control panel.

2.  **Quick Organize (Fastest):**
    * Click the **🚀 Quick Organize** button.
    * This will instantly group all your open, ungrouped tabs based on their website domain (e.g., all `github.com` tabs together).

3.  **Local AI Organize (Private):**
    * Click the **💻 Local Prompt Organize** button.
    * This uses Google's built-in Chrome AI to analyze your tabs. It is 100% private, and no data leaves your browser. (Requires a compatible device with Chrome AI enabled).

4.  **Online AI Organize (Most Powerful):**
    * **Step A (First time only):** You must add your Google Gemini API key.
        * Click the **⚙️ Settings** button in the popup to open the Options page.
        * Paste your API key into the "Gemini API Key" field and click "Save Key".
    * **Step B (Ready to use):** In the popup, click the **✨ AI Smart Organize** button.
    * This will securely send your tab titles and URLs to the Gemini API for the most intelligent and context-aware grouping.

5.  **Start Over (Ungroup):**
    * Click the **🔄 Ungroup All Tabs** button to remove all tab groups from your current window.
    * This is perfect for when you want to start fresh or try a different organizing strategy.

6.  **Manage Settings:**
    * Click the **⚙️ Settings** button to access the options page.
    * Here you can manage your API key and set your preferred **Grouping language** for the AI-generated group titles.


## Video Linke: https://youtu.be/D2GasDFfuUY
