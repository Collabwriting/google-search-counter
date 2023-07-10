
function onPageHeightChange() {
  // if we are not on google.com return
  if (!window.location.href.includes('google.com')) return;

  // on page height change
  var height = document.body.scrollHeight;
  setInterval(function () {
    if (height != document.body.scrollHeight) {
      height = document.body.scrollHeight;
      toggleCounter();
    }
  }, 1000);
}

function toggleCounter() {
  chrome.storage.local.get('countingEnabled', (result) => {
    const countingEnabled = result.countingEnabled;

    if (countingEnabled) {
      var counter = 1;
      if (document.getElementById('google-search-counter')) {
        // remove elements with id google-search-counter
        Array.from(document.querySelectorAll('#google-search-counter')).forEach(
          (el) => el.remove()
        );
      }
      var counter = 1;
      Array.from(document.querySelectorAll(`
      h3[class]:not(table h3):not(ul h3):not(li h3):not(title-with-lhs-icon h3):not(div.related-question-pair h3)`)).forEach((el) => {
        const spanElement = document.createElement('span');
        spanElement.id = 'google-search-counter';
        spanElement.textContent = counter + '. ';

        el.innerHTML = spanElement.outerHTML + el.innerHTML;
        counter++;
      });
    }
  });
}

// on load of the page
window.addEventListener('load', () => {
  // get countingEnabled from local storage
  chrome.storage.local.get('countingEnabled', (result) => {
    const countingEnabled = result.countingEnabled;
    console.log(result)
    // if countingEnabled is true, toggle the counter
    if (countingEnabled) {
      toggleCounter();
      onPageHeightChange();
    }
  });

  chrome.storage.local.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === 'countingEnabled') {
        if (newValue) {
          toggleCounter();
          onPageHeightChange();
        } else {
          Array.from(document.querySelectorAll('#google-search-counter')).forEach(
            (el) => el.remove()
          );
        }
      }
    }
  });
});

