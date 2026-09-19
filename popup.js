document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('toggle-cull');
  const domainText = document.getElementById('domain-text');

  // Get current active tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  try {
    const url = new URL(tab.url);
    const hostname = url.hostname;
    domainText.textContent = hostname;

    // Load blocked sites from storage
    chrome.storage.local.get({ blockedSites: [] }, (data) => {
      const isBlocked = data.blockedSites.includes(hostname);
      toggle.checked = !isBlocked; // Checked means culling is active
    });

    // Handle toggle change
    toggle.addEventListener('change', () => {
      chrome.storage.local.get({ blockedSites: [] }, (data) => {
        let blockedSites = data.blockedSites;

        if (!toggle.checked) {
          // Add to blacklist
          if (!blockedSites.includes(hostname)) {
            blockedSites.push(hostname);
          }
        } else {
          // Remove from blacklist
          blockedSites = blockedSites.filter(site => site !== hostname);
        }

        chrome.storage.local.set({ blockedSites }, () => {
          // Reload tab to apply or remove culling immediately
          chrome.tabs.reload(tab.id);
        });
      });
    });
  } catch (e) {
    domainText.textContent = "Extension page";
    toggle.disabled = true;
  }
});
