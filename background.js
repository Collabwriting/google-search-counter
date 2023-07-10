// get prefrences from local storage
chrome.storage.local.get(['prefrences'], function(result) {
  if (result.prefrences) {
    // if prefrences exist, set the toggleCounting to the prefrences
    toggleCounting = result.prefrences;
  } else {
    // if prefrences don't exist, set the toggleCounting to true
    toggleCounting = true;
  }
}
);

// listen for messages from popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.toggleCounting) {
    // toggleCounting is true, set it to false
    toggleCounting = false;
    // send a message to popup.js to change the button text
    chrome.runtime.sendMessage({ toggleCounting: false });
  } else {
    // toggleCounting is false, set it
    toggleCounting = true;
    // send a message to popup.js to change the button text
    chrome.runtime.sendMessage({ toggleCounting: true });
  }
});