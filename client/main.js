// DOM ELEMENTS
const prettyCodeBtn = document.getElementById('pretty');
const queryTextArea = document.getElementById('query');
const prettyCodeInput = document.getElementById('prettyPrintPre');
const prettyCodeMain = document.getElementById('prettyPrint');
const downloadBtn = document.getElementById('Download');
const copyBtn = document.getElementById('copy');
const previousQueryContainer = document.getElementById('previousQuries');
const dbHeading = document.getElementById('dbHeading');
const loaderParent = document.getElementById('loader_parent');

// SESSION STORAGE
const currentQuery = sessionStorage.getItem('query') || '';
const previousQuriesSession = () =>
  localStorage.getItem('previousQuries') || '';
const selectedDB = sessionStorage.getItem('selectedDB');

// IIFE
(function () {
  queryTextArea.value = currentQuery;
  updatePreviousQueries(
    !!previousQuriesSession() ? JSON.parse(previousQuriesSession()) : [],
  );
  if (!!selectedDB) {
    dbHeading.textContent = `Your current active DB is '${selectedDB}'`;
    document.querySelector(`option[value=${selectedDB}]`).selected = true;
    dynamicForm.action = `/run/${selectedDB}`;
    if (currentQuery && currentQuery.length > 1) {
      downloadBtn.disabled = false;
    }
  }
})();

// FUNCTION TO HANDEL THE CLICK OF DOWNLOAD BTN
function handelDownload() {
  const previousQuries = previousQuriesSession()
    ? JSON.parse(localStorage.getItem('previousQuries'))
    : [];
  previousQuries.push(queryTextArea.value);

  localStorage.setItem(
    'previousQuries',
    JSON.stringify([...new Set(previousQuries)]),
  );
  document.cookie = 'isLoading=true';
  loadingHandler();
  updatePreviousQueries([...new Set(previousQuries)]);
}

// HANDLES THE LOADING STATE OF THE WEBAPP
function loadingHandler() {
  loaderParent.style.display = 'flex';
  const interval = setInterval(() => {
    const cookie = document.cookie;
    if (!cookie) {
      loaderParent.style.display = 'none';
      clearInterval(interval);
    }
  }, 1000);
}

// UPDATES THE PREVIOUS QUERY INNER HTML
function updatePreviousQueries(previousQuery) {
  if (previousQuery.length) {
    // TO ADD PREVIOUS QUERY HTML
    const htmlArr = previousQuery.map((ele, index) => {
      return `<div class="previous_query" id=${index}>
        <i class="bi bi-arrow-left" style="cursor: pointer" id='switchQuery' key=${index}></i>
        <p>
        ${ele}
        </p>
        <i class="bi bi-trash" style="cursor: pointer" id='deleteQuery' key=${index}></i>
      </div>`;
    });

    let str = '';
    htmlArr.reverse().forEach((ele) => (str = str + ele));
    previousQueryContainer.innerHTML = str;

    // TO ADD EVENT LISTENERS TO THE PREVIOUS QUERIES BTN
    document.querySelectorAll('#switchQuery').forEach((ele) => {
      ele?.addEventListener('click', (e) => {
        const clickedBtnId = e.target.getAttribute('key');
        const query = JSON.parse(previousQuriesSession());
        const selectedQuery = query[clickedBtnId];
        queryTextArea.value = selectedQuery;
      });
    });
    document.querySelectorAll('#deleteQuery').forEach((ele) => {
      ele?.addEventListener('click', (e) => {
        const clickedBtnId = e.target.getAttribute('key');
        const currentQuery = JSON.parse(localStorage.getItem('previousQuries'));
        currentQuery.splice(clickedBtnId, 1);
        localStorage.setItem('previousQuries', JSON.stringify(currentQuery));
        updatePreviousQueries(currentQuery);
      });
    });
  }
}

// HANDEL THE COPY BTN CLICK
function copyHandler() {
  navigator.clipboard.writeText(queryTextArea.value);
  copyBtn.classList.add('bi-clipboard-check-fill');
  setTimeout(() => {
    copyBtn.classList.remove('bi-clipboard-check-fill');
  }, 2000);
}

// HANDEL THE DB CHANGE
function handelDbChange(e) {
  const currentQuery = sessionStorage.getItem('query') || '';
  sessionStorage.setItem('selectedDB', e);
  dbHeading.textContent = `your current active DB is '${dbDropdown.value}'`;
  dynamicForm.action = `/run/${e}`;
  if (currentQuery && currentQuery.length > 1) {
    downloadBtn.disabled = false;
  }
}

// UPDATES THE VALUE OF THE CURRENT QUERY IN THE SESSION STORAGE TO PERSIST IT'S VALUE
queryTextArea.addEventListener('input', (event) => {
  const updatedValue = event.target.value;
  sessionStorage.setItem('query', updatedValue);
  if (sessionStorage.getItem('selectedDB') && updatedValue.length > 1) {
    downloadBtn.disabled = false;
  } else if (updatedValue.length < 1) {
    downloadBtn.disabled = true;
  }
});

// EVENT ON THE PRETTY CODE BTN
prettyCodeBtn.addEventListener('click', function () {
  const options = { preserve_newlines: false };
  const data = js_beautify(queryTextArea.value, options);
  if (data.length) {
    queryTextArea.value = data;
    prettyCodeInput.classList.remove('d-none');
    prettyCodeMain.innerHTML = data;
    Prism.highlightAll();
  }
  prettyCodeInput.scrollIntoView();
});
