let debounceTimeout = null;

function applyDOMCulling() {
  const targets = document.querySelectorAll('section, article, main, [role="main"], .feed-item, .post');
  
  targets.forEach(el => {
    if (el.tagName === 'HEADER' || el.tagName === 'NAV') return;

    const rect = el.getBoundingClientRect();
    if (rect.height > 150 && !el.classList.contains('web-cull-element')) {
      el.classList.add('web-cull-element');
    }
  });
}

// Check if current site is allowed before initializing
const currentHostname = window.location.hostname;

chrome.storage.local.get({ blockedSites: [] }, (data) => {
  if (data.blockedSites.includes(currentHostname)) {
    console.log(`[Web Culler] Disabled on ${currentHostname} by user request.`);
    return; // Exit script, do nothing
  }

  // Initialize culling if site is not blocked
  applyDOMCulling();

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      applyDOMCulling();
    }, 200);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
