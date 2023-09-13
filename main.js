(function () {
  const currentQuery = sessionStorage.getItem('query') || '';
  const previousQuriesSession = sessionStorage.getItem('previousQuries') || '';
  const dbHeading = document.getElementById('dbHeading');
  const textArea = document.getElementById('query');
  const selectedDB = sessionStorage.getItem('selectedDB');
  const submitBtn = document.getElementById('Download');

  document.getElementById('query').value = currentQuery;

  submitBtn.addEventListener('click', function () {
    let previousQuries;
    if (previousQuriesSession) {
      previousQuries = JSON.parse(sessionStorage.getItem('previousQuries'));
    } else {
      previousQuries = [];
    }
    previousQuries.push(textArea.value);
    sessionStorage.setItem('previousQuries', JSON.stringify(previousQuries));
    updatePreviousQueries();
  });

  updatePreviousQueries();

  if (!!selectedDB) {
    dbHeading.textContent = `Your current active DB is '${selectedDB}'`;

    document.querySelector(`option[value=${selectedDB}]`).selected = true;

    dynamicForm.action = `/run/${selectedDB}`;
    if (currentQuery && currentQuery.length > 1) {
      document.getElementById('Download').disabled = false;
    }
  }
})();

document.querySelectorAll('#switchQuery').forEach((ele) => {
  ele?.addEventListener('click', (e) => {
    const previousQuriesSession =
      sessionStorage.getItem('previousQuries') || '';
    const textArea = document.getElementById('query');
    const clickedBtnId = e.target.getAttribute('key');

    if (previousQuriesSession) {
      const query = JSON.parse(previousQuriesSession);
      const selectedQuery = query[clickedBtnId];
      textArea.value = selectedQuery;
    }
  });
});

function updatePreviousQueries() {
  const previousQuriesSession = sessionStorage.getItem('previousQuries') || '';
  const currentHtml = document.getElementById('previousQuries');

  if (previousQuriesSession) {
    const previousQuriesFormSession = JSON.parse(previousQuriesSession);
    const htmlArr = previousQuriesFormSession.map((ele, index) => {
      return `<div class="previous_query" id=${index}>
        <i class="bi bi-arrow-left" style="cursor: pointer" id='switchQuery' key=${index}></i>
        <p>
         ${ele}
        </p>
      </div>`;
    });

    let str = '';

    htmlArr.reverse().forEach((ele) => (str = str + ele));

    currentHtml.innerHTML = str;
  }
}

function myFunction() {
  const copyText = document.getElementById('query');
  navigator.clipboard.writeText(copyText.value);
  document.getElementById('copy').classList.add('bi-clipboard-check-fill');
  setTimeout(() => {
    document.getElementById('copy').classList.remove('bi-clipboard-check-fill');
  }, 2000);
}

function handelDbChange(e) {
  const currentQuery = sessionStorage.getItem('query') || '';
  sessionStorage.setItem('selectedDB', e);
  dbHeading.textContent = `your current active DB is '${dbDropdown.value}'`;
  dynamicForm.action = `/run/${e}`;
  if (currentQuery && currentQuery.length > 1) {
    document.getElementById('Download').disabled = false;
  }
}

document.getElementById('query').addEventListener('input', (event) => {
  const updatedValue = event.target.value;
  sessionStorage.setItem('query', updatedValue);
  if (sessionStorage.getItem('selectedDB') && updatedValue.length > 1) {
    document.getElementById('Download').disabled = false;
  } else if (updatedValue.length < 1) {
    document.getElementById('Download').disabled = true;
  }
});

document.querySelector('#pretty').addEventListener('click', function () {
  const options = { preserve_newlines: false };
  const data = js_beautify(document.querySelector('#query').value, options);
  if (data.length) {
    document.querySelector('#query').value = data;
    document.getElementById('prettyPrintPre').classList.remove('d-none');
    document.querySelector('#prettyPrint').innerHTML = data;
    Prism.highlightAll();
  }
});
