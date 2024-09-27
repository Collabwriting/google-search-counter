
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
  if (!window.location.href.includes('google.com')) return;

  chrome.storage.local.get('countingEnabled', (result) => {
    const countingEnabled = result.countingEnabled;

    if (countingEnabled) {

      // get saved data from local storage
      chrome.storage.local.get('data', (dataResult) => {

        const data = dataResult.data ?? [];

        if (document.getElementById('google-search-counter')) {

          // remove elements with id google-search-counter
          Array.from(document.querySelectorAll('#google-search-counter')).forEach(
            (el) => el.remove()
          );
        }

        // get start url param
        const urlParams = new URLSearchParams(window.location.search);
        const start = Number(urlParams.get('start') ?? 0);
        const page = Math.floor(start / 10) + 1;
        const searchQuery = urlParams.get('q');

        // sometimes google does not show 10 results on every page, so we need to keep track of how many requests were skipped
        // we go through pages for particular query from data and sum all resultsCount then add 10 for each skipped page
        var counter = 1;
        data.forEach((d) => {
          if (d.query === searchQuery) {

            let nonSkippedPages = 0;

            // add all resultsCount from previous pages
            d.pages.forEach((p) => {
              if (p.page < page) {
                counter += p.resultsCount;
                nonSkippedPages++;
              }
            });

            // we skipped some pages add 10 for each skipped page
            if (nonSkippedPages < page) {
              counter += 10 * (page - nonSkippedPages - 1);
            }
          }
        });

        var results = document.querySelectorAll(`h3[class]:not(table h3):not(ul h3):not(li h3):not(title-with-lhs-icon h3):not(div.related-question-pair h3):not(g-section-with-header h3):not([data-attrid="description"] h3)`); 

        var query = {
          query: searchQuery,
          results: []
        };

        Array.from(results).forEach((el) => {

          // get href from the parent a element
          const parentA = el.closest('a');
          const href = parentA?.href ?? '';

          // get result title
          const title = el.textContent;

          // add result to searchResults array
          query.results.push({ title, href, page });

          // create span element with the result counter
          const spanElement = document.createElement('span');
          spanElement.id = 'google-search-counter';
          spanElement.textContent = counter + '. ';
          el.innerHTML = spanElement.outerHTML + el.innerHTML;

          counter++;
        });

        // get data for query if it exists
        const queryData = data.find((d) => d.query === searchQuery);

        // if queryData exists, update it
        if (queryData) {
          const pageData = queryData.pages.find((p) => p.page === page);

          // if pageData exists, update it
          if (pageData) {
            pageData.resultsCount = query.results.length;
          } else {
            queryData.pages.push({ page, resultsCount: query.results.length });
          }
        } else {
          data.push({ query: searchQuery, pages: [{ page, resultsCount: query.results.length }] });
        }

        // save data to local storage
        chrome.storage.local.set({ data }, () => {
        });

      });
      
    }
  });
}

// on load of the page
window.addEventListener('load', () => {
  // get countingEnabled from local storage
  chrome.storage.local.get('countingEnabled', (result) => {
    const countingEnabled = result.countingEnabled;

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

