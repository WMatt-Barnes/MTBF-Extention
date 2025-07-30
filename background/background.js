// background.js - Service worker for MTBF Work Order Analyzer

self.addEventListener('install', (event) => {
  console.log('MTBF Analyzer extension installed.');
});

self.addEventListener('activate', (event) => {
  console.log('MTBF Analyzer extension activated.');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectContentScript') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // First check if content script is already injected
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => window.MTBF_ANALYZER_LOADED || false
        }).then((results) => {
          if (results[0] && results[0].result) {
            console.log('Content script already loaded, skipping injection');
            sendResponse({ success: true, alreadyLoaded: true });
          } else {
            // Inject content script
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content/content.js']
            }).then(() => {
              console.log('Content script injected successfully');
              sendResponse({ success: true, alreadyLoaded: false });
            }).catch((error) => {
              console.error('Failed to inject content script:', error);
              sendResponse({ success: false, error: error.message });
            });
          }
        }).catch((error) => {
          console.error('Failed to check content script status:', error);
          sendResponse({ success: false, error: error.message });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep the message channel open for async response
  }
}); 