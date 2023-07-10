document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  // Retrieve the stored value from local storage
  chrome.storage.local.get('countingEnabled', (result) => {
    const countingEnabled = result.countingEnabled;
    toggle.checked = countingEnabled;
  });

  // Update the stored value when the toggle button is clicked
  toggle.addEventListener('change', () => {
    const countingEnabled = toggle.checked;
    chrome.storage.local.set({ countingEnabled });
  });
});
