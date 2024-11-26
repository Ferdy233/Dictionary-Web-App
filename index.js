// Select and store DOM elements for easy access throughout the application
const elements = {
  darkmodeToggle: document.getElementById('darkmode-toggle'),
  body: document.body,
  fontSelect: document.querySelector('.font-select'),
  searchInput: document.getElementById('search-input'),
  searchButton: document.getElementById('search-button'),
  errorText: document.querySelector('.error-text'),
  options: document.querySelectorAll('.option'),
  notFound: document.querySelector('.not-found'),
  audioPlayer: document.getElementById('audio-player'),
  playButton: document.querySelector('.play-button'),
  wordEl: document.querySelector('.phonetic h1'),
  phoneticEl: document.querySelector('.phonetic h2'),
  wordSection: document.querySelector('.word'),
  meaningSection: document.querySelector('.meanings'),
  sourceUrlSection: document.querySelector('.source-urls')
};

// Clear search input on page load
elements.searchInput.value = '';

// Set initial dark mode based on system preference
elements.darkmodeToggle.checked = window.matchMedia(
  '(prefers-color-scheme: dark)'
).matches;

// Apply dark mode if system preference is dark
if (elements.darkmodeToggle.checked) {
  elements.body.classList.add('dark-mode');
}

// Toggle dark mode when switch is clicked
elements.darkmodeToggle.addEventListener('change', () => {
  elements.body.classList.toggle('dark-mode');
});

// Handle font selection options
for (const option of elements.options) {
  option.addEventListener('click', () => {
      // Reset body classes
      elements.body.removeAttribute('class');
      
      // Reapply dark mode if enabled
      if (elements.darkmodeToggle.checked) {
          elements.body.classList.add('dark-mode');
      }
      
      // Set font based on selected option
      const font =
          option.textContent === 'Serif'
              ? 'serif'
              : option.textContent === 'Mono'
              ? 'mono'
              : 'sans';
      
      elements.body.classList.add(font);
      elements.fontSelect.value = option.textContent;
      elements.fontSelect.classList.toggle('open');
  });
}

// Set initial font based on font select value
elements.body.classList.add(
  elements.fontSelect.value === 'Serif'
      ? 'serif'
      : elements.fontSelect.value === 'Mono'
      ? 'mono'
      : 'sans'
);

// Toggle font select dropdown
elements.fontSelect.addEventListener('click', () => {
  elements.fontSelect.classList.toggle('open');
});

// Trigger search when search button is clicked
elements.searchButton.addEventListener('click', () => searchResult());

// Remove error message when user starts typing
elements.searchInput.addEventListener('input', () => {
  removeMessage();
});

// Allow search on Enter key press
elements.searchInput.addEventListener('keypress', (event) => {
  if (
      event.key === 'Enter' &&
      document.activeElement === elements.searchInput
  ) {
      event.preventDefault();
      searchResult();
  }
});

// Remove error message and input styling
const removeMessage = () => {
  if (!elements.errorText.classList.contains('hide')) {
      elements.errorText.classList.add('hide');
      elements.searchInput.removeAttribute('style');
  }
};

// Main search function to fetch and render dictionary data
const searchResult = async () => {
  // Validate input
  if (!elements.searchInput.value) {
      elements.errorText.classList.remove('hide');
      elements.searchInput.style.outline = '1px solid #ff5252';
  } else {
      // Fetch data for the search term
      const data = await fetchData(elements.searchInput.value);
      if (Array.isArray(data)) {
          const { word, phonetic, phonetics, meanings, sourceUrls } = data[0];
          renderData(word, phonetic, phonetics, meanings, sourceUrls);
      }
  }
};

// Fetch dictionary data from API
const fetchData = async (text) => {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`;

  // Prepare UI for fetching
  preFetchingActions();
  try {
      const response = await fetch(url);
      if (response.status !== 200) {
          throw new Error('No Data Found');
      } else {
          // Update UI on successful fetch
          fetchSuccessActions();
          return await response.json();
      }
  } catch (err) {
      // Show not found message on error
      elements.notFound.classList.remove('hide');
      console.error(err);
  }
};

// Hide sections before fetching new data
const preFetchingActions = () => {
  !elements.notFound.classList.contains('hide') &&
      elements.notFound.classList.add('hide');
  !elements.wordSection.classList.contains('hide') &&
      elements.wordSection.classList.add('hide');
  !elements.meaningSection.classList.contains('hide') &&
      elements.meaningSection.classList.add('hide');
  !elements.sourceUrlSection.classList.contains('hide') &&
      elements.sourceUrlSection.classList.add('hide');
};

// Show sections and remove error messages after successful fetch
const fetchSuccessActions = () => {
  removeMessage();
  !elements.notFound.classList.contains('hide') &&
      elements.notFound.classList.add('hide');
  elements.wordSection.classList.remove('hide');
  elements.meaningSection.classList.remove('hide');
  elements.sourceUrlSection.classList.remove('hide');
};

// Render fetched dictionary data
const renderData = (word, phonetic, phonetics, meanings, sourceUrls) => {
  // Render word phonetics
  renderPhonetics(word, phonetic, phonetics);
  
  // Clear previous meanings
  while (elements.meaningSection.firstChild) {
      elements.meaningSection.removeChild(elements.meaningSection.firstChild);
  }
  
  // Render word meanings
  renderMeanings(meanings);
  
  // Render source URLs with cleanup callback
  renderSourceUrls(sourceUrls, () => {
      const el = document.querySelectorAll('.source-urls ul');
      if (el.length > 1) {
          elements.sourceUrlSection.removeChild(el[0]);
      }
  });
};

// Render word phonetics and audio
const renderPhonetics = (word, phonetic = '', phonetics) => {
  // Set word
  elements.wordEl.innerHTML = word;

  // Find best phonetic text and audio
  const { text, audio } = phonetics.reduce((initial, data) => {
      const { text, audio } = data;

      if (text && audio && Object.keys(initial).length === 1) {
          initial = { ...initial, text, audio };
      } else {
          initial = { ...initial, text, audio };
      }

      return initial;
  }, {});

  // Set phonetic text
  elements.phoneticEl.innerHTML = text ?? phonetic;

  // Handle audio playback
  if (audio) {
      elements.audioPlayer.setAttribute('src', audio);
      elements.playButton.classList.remove('hide');
  } else {
      !elements.playButton.classList.contains('hide') &&
          elements.playButton.classList.add('hide');
      elements.audioPlayer.removeAttribute('src');
      elements.audioPlayer.setAttribute('muted', true);
  }
};

// Play phonetic audio
elements.playButton.addEventListener('click', () => {
  elements.audioPlayer.controls = true;
  elements.audioPlayer.play();
});

// Render word meanings, synonyms, and antonyms
const renderMeanings = (meanings) => {
  for (const meaning of meanings) {
      const containerDiv = document.createElement('div');

      // Part of speech
      const h2Meaning = document.createElement('h2');
      h2Meaning.textContent = meaning.partOfSpeech;
      containerDiv.appendChild(h2Meaning);

      // Meaning header
      const h3Meaning = document.createElement('h3');
      h3Meaning.textContent = 'Meaning';
      containerDiv.appendChild(h3Meaning);

      // Definitions list
      const ulMeanings = document.createElement('ul');
      for (const definition of meaning.definitions) {
          const li = document.createElement('li');
          const h4 = document.createElement('h4');
          h4.textContent = definition.definition;
          li.appendChild(h4);
          
          // Add example if available
          if (definition.example) {
              const p = document.createElement('p');
              p.textContent = `"${definition.example}"`;
              definition.example && li.appendChild(p);
          }
          ulMeanings.appendChild(li);
      }
      containerDiv.appendChild(ulMeanings);

      // Render synonyms if available
      const divSynonyms = document.createElement('div');
      divSynonyms.classList.add('synonyms');

      const h3Synonyms = document.createElement('h3');
      h3Synonyms.textContent = 'Synonyms';

      if (meaning.synonyms.length !== 0) {
          const ulSynonyms = document.createElement('ul');
          for (const synonym of meaning.synonyms) {
              const liSynonym = document.createElement('li');
              const aSynonym = document.createElement('a');
              aSynonym.href = 'javascript:void(0);';
              aSynonym.textContent = synonym;
              liSynonym.appendChild(aSynonym);
              ulSynonyms.appendChild(liSynonym);
          }

          divSynonyms.appendChild(h3Synonyms);
          divSynonyms.appendChild(ulSynonyms);

          containerDiv.appendChild(divSynonyms);
      }

      // Render antonyms if available
      if (meaning.antonyms.length !== 0) {
          const divAntonyms = document.createElement('div');
          divAntonyms.classList.add('antonyms');

          const h3Antonyms = document.createElement('h3');
          h3Antonyms.textContent = 'Antonyms';

          const ulAntonyms = document.createElement('ul');
          for (const antonym of meaning.antonyms) {
              const liAntonyms = document.createElement('li');
              const aAntonyms = document.createElement('a');
              aAntonyms.href = 'javascript:void(0);';
              aAntonyms.textContent = antonym;
              liAntonyms.appendChild(aAntonyms);
              ulAntonyms.appendChild(liAntonyms);
          }

          divAntonyms.appendChild(h3Antonyms);
          divAntonyms.appendChild(ulAntonyms);

          containerDiv.appendChild(divAntonyms);
      }

      elements.meaningSection.appendChild(containerDiv);
  }
};

// Render source URLs
const renderSourceUrls = (sourceUrls, callback) => {
  const ul = document.createElement('ul');

  for (const sourceUrl of sourceUrls) {
      const li = document.createElement('li');

      const a = document.createElement('a');
      a.href = sourceUrl;
      a.target = '_blank';

      const anchorText = document.createTextNode(sourceUrl);
      const img = document.createElement('img');
      img.src = './assets/images/icon-new-window.svg';
      img.setAttribute('aria-hidden', 'true');

      a.appendChild(anchorText);
      a.appendChild(img);

      li.appendChild(a);

      ul.appendChild(li);
  }

  elements.sourceUrlSection.appendChild(ul);

  // Optional callback for additional processing
  callback();
};