// Variáveis globais que serão preenchidas após o carregamento dos dados
let translations = {};
let names = [];

// Variáveis de estado
let favorites = [];
let currentGenderFilter = 'todos';
let currentCultureFilter = 'All Cultures';
let currentReligionFilter = 'All Religions';

// Seletores de elementos do DOM
const resultContainer = document.getElementById('result-display');
const generateButton = document.getElementById('generate-btn');
const genderButtonsContainer = document.querySelector('.gender-options');
const cultureFilterSelect = document.getElementById('culture-filter');
const religionFilterSelect = document.getElementById('religion-filter');
const trendingContainer = document.getElementById('trending-names-container');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');
const cookieBanner = document.getElementById('cookie-banner');
const cookieAcceptBtn = document.getElementById('cookie-accept');
const cookieDeclineBtn = document.getElementById('cookie-decline');
const shareFavoritesBtn = document.getElementById('share-favorites-btn');
const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
const startQuizCard = document.getElementById('start-quiz-card');
const quizSection = document.getElementById('quiz-section');
const quizContainer = document.getElementById('quiz-container');
const shareListsCard = document.getElementById('share-lists-card');
const themedListsModal = document.getElementById('themed-lists-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');
const toastContainer = document.getElementById('toast-container');

// LÓGICA DO QUIZ
const quizData = {
    questions: [
        { questionKey: "q1_question", options: [{ key: "q1_opt1", scores: { classic: 2, modern: 0, nature: 0, romantic: 1 } }, { key: "q1_opt2", scores: { classic: 0, modern: 2, nature: 1, romantic: 0 } }] },
        { questionKey: "q2_question", options: [{ key: "q2_opt1", scores: { classic: 1, modern: 0, nature: 0, romantic: 2 } }, { key: "q2_opt2", scores: { classic: 0, modern: 2, nature: 1, romantic: 0 } }] },
        { questionKey: "q3_question", options: [{ key: "q3_opt1", scores: { classic: 0, modern: 0, nature: 2, romantic: 1 } }, { key: "q3_opt2", scores: { classic: 2, modern: 1, nature: 0, romantic: 0 } }] },
        { questionKey: "q4_question", options: [{ key: "q4_opt1", scores: { classic: 1, modern: 2, nature: 0, romantic: 0 } }, { key: "q4_opt2", scores: { classic: 2, modern: 0, nature: 0, romantic: 2 } }] },
        { questionKey: "q5_question", options: [{ key: "q5_opt1", scores: { classic: 0, modern: 2, nature: 0, romantic: 0 } }, { key: "q5_opt2", scores: { classic: 0, modern: 0, nature: 2, romantic: 1 } }, { key: "q5_opt3", scores: { classic: 2, modern: 0, nature: 0, romantic: 2 } }] }
    ],
    results: {
        classic: { titleKey: "style_classic_title", descKey: "style_classic_desc" },
        modern: { titleKey: "style_modern_title", descKey: "style_modern_desc" },
        nature: { titleKey: "style_nature_title", descKey: "style_nature_desc" },
        romantic: { titleKey: "style_romantic_title", descKey: "style_romantic_desc" }
    },
    userScores: { classic: 0, modern: 0, nature: 0, romantic: 0 },
    currentQuestionIndex: 0,
    selectedGender: null
};

function startQuiz() {
    quizData.userScores = { classic: 0, modern: 0, nature: 0, romantic: 0 };
    quizData.currentQuestionIndex = 0;
    quizData.selectedGender = null;
    quizSection.style.display = 'block';
    quizSection.scrollIntoView({ behavior: 'smooth' });
    displayGenderSelection();
}

function displayGenderSelection() {
    const currentLang = localStorage.getItem('language') || 'en';
    quizContainer.innerHTML = `
        <h3>${translations[currentLang].quizGenderTitle}</h3>
        <div class="quiz-gender-options">
            <button class="quiz-gender-btn" data-gender="menino">${translations[currentLang].quizGenderBoy}</button>
            <button class="quiz-gender-btn" data-gender="menina">${translations[currentLang].quizGenderGirl}</button>
            <button class="quiz-gender-btn" data-gender="unissex">${translations[currentLang].quizGenderUnisex}</button>
        </div>
    `;
    document.querySelectorAll('.quiz-gender-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            quizData.selectedGender = e.target.dataset.gender;
            displayQuizQuestion();
        });
    });
}

function displayQuizQuestion() {
    const currentLang = localStorage.getItem('language') || 'en';
    if (quizData.currentQuestionIndex >= quizData.questions.length) {
        displayQuizResult();
        return;
    }
    const question = quizData.questions[quizData.currentQuestionIndex];
    const progress = (quizData.currentQuestionIndex / quizData.questions.length) * 100;

    let optionsHTML = '';
    question.options.forEach(option => {
        optionsHTML += `<button class="quiz-option-btn">${translations[currentLang][option.key]}</button>`;
    });

    quizContainer.innerHTML = `
        <div class="quiz-progress-bar-container">
            <div class="quiz-progress-bar" style="width: ${progress}%;"></div>
        </div>
        <h3 class="quiz-question">${translations[currentLang][question.questionKey]}</h3>
        <div class="quiz-options">${optionsHTML}</div>
    `;

    document.querySelectorAll('.quiz-option-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            handleAnswer(index);
        });
    });
}

function handleAnswer(optionIndex) {
    const question = quizData.questions[quizData.currentQuestionIndex];
    const selectedOption = question.options[optionIndex];
    for (const style in selectedOption.scores) {
        quizData.userScores[style] += selectedOption.scores[style];
    }
    quizData.currentQuestionIndex++;
    displayQuizQuestion();
}

function getStyleSuggestions(style, gender) {
    const styleToTagsMap = {
        classic: ['European', 'Christian', 'Jewish', 'Latin American', 'Celtic'],
        modern: ['International', 'Polynesian'],
        nature: ['Spiritual'],
        romantic: ['Spiritual', 'Celtic']
    };
    
    const natureKeywords = ['flor', 'pedra', 'rio', 'lua', 'sol', 'mar', 'céu', 'estrela', 'natureza', 'terra', 'monte', 'flower', 'stone', 'river', 'moon', 'sun', 'sea', 'sky', 'star', 'nature', 'earth', 'mount'];

    let filteredNames = names.filter(name => name.gender === gender);
    
    let styleFiltered = [];
    if (style === 'nature') {
        styleFiltered = filteredNames.filter(name => 
            (name.tags && name.tags.some(tag => styleToTagsMap[style].includes(tag))) ||
            (name.meaning && natureKeywords.some(keyword => name.meaning.toLowerCase().includes(keyword)))
        );
    } else {
        styleFiltered = filteredNames.filter(name => 
            name.tags && name.tags.some(tag => styleToTagsMap[style].includes(tag))
        );
    }
    
    if (styleFiltered.length < 5) {
        styleFiltered = [...styleFiltered, ...filteredNames.filter(n => !styleFiltered.includes(n))];
    }
    
    return styleFiltered.sort(() => 0.5 - Math.random()).slice(0, 5);
}

function displayQuizResult() {
    let finalStyle = 'modern';
    let maxScore = 0;
    for (const style in quizData.userScores) {
        if (quizData.userScores[style] > maxScore) {
            maxScore = quizData.userScores[style];
            finalStyle = style;
        }
    }

    const result = quizData.results[finalStyle];
    const currentLang = localStorage.getItem('language') || 'en';
    const suggestions = getStyleSuggestions(finalStyle, quizData.selectedGender);

    let suggestionsHTML = '';
    if (suggestions.length > 0) {
        suggestions.forEach(name => {
            let nameClass = '';
            if (name.gender === 'menina') nameClass = 'name-girl';
            else if (name.gender === 'menino') nameClass = 'name-boy';
            else if (name.gender === 'unissex') nameClass = 'name-unisex';
            
            suggestionsHTML += `
                <div class="suggestion-card">
                    <div class="name ${nameClass}">${name.name}</div>
                    <div class="meaning">"${name.meaning}"</div>
                </div>
            `;
        });
    }

    quizContainer.innerHTML = `
        <div class="quiz-result">
            <h4>${translations[currentLang].quizResultTitle}</h4>
            <p class="result-style">${translations[currentLang][result.titleKey]}</p>
            <p>${translations[currentLang][result.descKey]}</p>
            <div class="quiz-suggestions-container">
                <h4>${translations[currentLang].quizSuggestionsTitle}</h4>
                ${suggestionsHTML}
            </div>
            <button id="restart-quiz-btn" class="btn btn-primary" style="margin-top: 30px;">
                <i class="fa-solid fa-arrows-rotate"></i> <span>${translations[currentLang].quizRestartButton}</span>
            </button>
        </div>
    `;
    document.getElementById('restart-quiz-btn').addEventListener('click', startQuiz);
}

const setLanguage = (lang) => {
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        const translation = translations[lang]?.[key] || translations['en'][key];
        if (translation !== undefined) {
            const icon = element.querySelector('i');
            const span = element.querySelector('span');
            if (icon && span) { span.textContent = translation; } 
            else { element.textContent = translation; }
        }
    });
    document.title = translations[lang]?.pageTitle || translations['en'].pageTitle;
};

const getWeekNumber = (d) => { d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1)); var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7); return weekNo; }
const stringToSeed = (str) => { let hash = 0; for (let i = 0; i < str.length; i++) { const char = str.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash; } return hash; }
const mulberry32 = (a) => { return function() { var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }

const updateTrendingNames = () => {
    const now = new Date();
    const weekSeedStr = `${now.getFullYear()}-${getWeekNumber(now)}`;
    const seed = stringToSeed(weekSeedStr);
    const random = mulberry32(seed);
    const shuffled = [...names].sort(() => random() - 0.5);
    const trendingNames = shuffled.slice(0, 3);
    const statuses = [ { class: 'rising', icon: 'fa-arrow-trend-up', popKey: "popularityRising" }, { class: 'top-pick', icon: 'fa-star', popKey: "popularityTopPick" }, { class: 'popular', icon: 'fa-fire', popKey: "popularityPopular" } ];
    trendingContainer.innerHTML = '';
    const currentLang = localStorage.getItem('language') || 'en';
    trendingNames.forEach((name, index) => {
        const status = statuses[index];
        const tagKey = `tag${status.class.charAt(0).toUpperCase() + status.class.slice(1).replace('-p', 'P')}`;
        const cardHTML = `<div class="trending-card ${status.class}"> <div class="icon-status"><i class="fa-solid ${status.icon}"></i></div> <h4 class="name">${name.name}</h4> <span class="tag tag-${status.class}" data-i18n-key="${tagKey}">${translations[currentLang][tagKey]}</span> <p class="popularity" data-i18n-key="${status.popKey}">${translations[currentLang][status.popKey]}</p> </div>`;
        trendingContainer.innerHTML += cardHTML;
    });
};

const renderFavorites = () => {
    if (favorites.length === 0) {
        favoritesSection.style.display = 'none';
        return;
    }
    favoritesSection.style.display = 'block';
    favoritesList.innerHTML = '';
    favorites.forEach(favName => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        let nameClass = '';
        if (favName.gender === 'menina') { nameClass = 'name-girl'; } 
        else if (favName.gender === 'menino') { nameClass = 'name-boy'; } 
        else if (favName.gender === 'unissex') { nameClass = 'name-unisex'; }
        card.innerHTML = `<div class="favorite-card-name ${nameClass}">${favName.name}</div><button class="remove-fav-btn" data-name="${favName.name}" title="Remove favorite">&times;</button>`;
        favoritesList.appendChild(card);
    });
};

const saveFavorite = (nameObject) => {
    const isAlreadyFavorite = favorites.some(fav => fav.name === nameObject.name);
    if (!isAlreadyFavorite) {
        favorites.push(nameObject);
        localStorage.setItem('favoriteNames', JSON.stringify(favorites));
        renderFavorites();
    }
};

function showToast(messageKey) {
    const currentLang = localStorage.getItem('language') || 'en';
    const message = translations[currentLang][messageKey];
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const shareSingleName = (nameObject) => {
    const currentLang = localStorage.getItem('language') || 'en';
    let textTemplate = translations[currentLang].shareNameText;
    const textToCopy = textTemplate.replace('%name%', nameObject.name).replace('%meaning%', nameObject.meaning);
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('listCopiedToast');
    }).catch(err => console.error('Failed to copy name: ', err));
};

function generateNewName() {
    if (names.length === 0) { return; }
    const filteredNames = names.filter(name => {
        const genderMatch = (currentGenderFilter === 'todos') || (name.gender === currentGenderFilter);
        const cultureMatch = (currentCultureFilter === 'All Cultures') || (name.tags && name.tags.includes(currentCultureFilter));
        const religionMatch = (currentReligionFilter === 'All Religions') || (name.tags && name.tags.includes(currentReligionFilter));
        return genderMatch && cultureMatch && religionMatch;
    });
    const currentLang = localStorage.getItem('language') || 'en';
    if (filteredNames.length === 0) {
        resultContainer.innerHTML = `<div><p>${translations[currentLang].noNamesFound}</p><p style="font-size:0.9rem; color:#888;">${translations[currentLang].tryDifferent}</p></div>`;
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredNames.length);
    const selectedName = filteredNames[randomIndex];
    let tagsHTML = '';
    if (selectedName.tags) { selectedName.tags.forEach(tag => { tagsHTML += `<span class="tag">${tag}</span>`; }); }
    let nameClass = '';
    if (selectedName.gender === 'menina') { nameClass = 'name-girl'; } 
    else if (selectedName.gender === 'menino') { nameClass = 'name-boy'; } 
    else if (selectedName.gender === 'unissex') { nameClass = 'name-unisex'; }
    
    resultContainer.innerHTML = `
        <div>
            <h3 class="result-name ${nameClass}">${selectedName.name}</h3>
            <div class="result-tags">${tagsHTML}</div>
            <p class="result-meaning">"${selectedName.meaning}"</p>
            <div class="name-actions">
                <button class="action-btn save-favorite">
                    <i class="fa-regular fa-heart"></i>
                    <span data-i18n-key="saveFavorite">${translations[currentLang].saveFavorite}</span>
                </button>
                <button class="action-btn share-name-btn">
                    <i class="fa-solid fa-share-alt"></i>
                    <span data-i18n-key="shareNameButton">${translations[currentLang].shareNameButton}</span>
                </button>
            </div>
        </div>`;
    
    resultContainer.querySelector('.save-favorite').addEventListener('click', () => saveFavorite(selectedName));
    resultContainer.querySelector('.share-name-btn').addEventListener('click', () => shareSingleName(selectedName));
}

const themedLists = [
    { titleKey: 'theme_mythological', filter: (n) => n.tags.includes('Spiritual') && (n.meaning.toLowerCase().includes('deus') || n.meaning.toLowerCase().includes('deusa') || n.meaning.toLowerCase().includes('god') || n.meaning.toLowerCase().includes('goddess')) },
    { titleKey: 'theme_nature', filter: (n) => ['flor', 'pedra', 'rio', 'lua', 'sol', 'mar', 'céu', 'estrela', 'natureza', 'terra', 'monte', 'flower', 'stone', 'river', 'moon', 'sun', 'sea', 'sky', 'star', 'nature', 'earth', 'mount', 'salgueiro', 'prado', 'willow', 'meadow'].some(kw => n.meaning.toLowerCase().includes(kw)) },
    { titleKey: 'theme_strong', filter: (n) => ['forte', 'nobre', 'guerreiro', 'protetor', 'leão', 'força', 'strong', 'noble', 'warrior', 'protector', 'lion', 'strength'].some(kw => n.meaning.toLowerCase().includes(kw)) },
    { titleKey: 'theme_celestial', filter: (n) => ['estrela', 'lua', 'sol', 'céu', 'aurora', 'orion', 'star', 'moon', 'sun', 'sky', 'dawn'].some(kw => n.meaning.toLowerCase().includes(kw)) }
];

function openThemedListsModal() {
    themedListsModal.style.display = 'block';
    modalOverlay.style.display = 'block';
    displayThemeSelection();
}

function closeThemedListsModal() {
    themedListsModal.style.display = 'none';
    modalOverlay.style.display = 'none';
}

function displayThemeSelection() {
    const currentLang = localStorage.getItem('language') || 'en';
    let themesHTML = `<h3>${translations[currentLang].themedListsTitle}</h3>`;
    themedLists.forEach(theme => {
        themesHTML += `<button class="theme-list-item" data-titlekey="${theme.titleKey}">${translations[currentLang][theme.titleKey]}</button>`;
    });
    modalContent.innerHTML = themesHTML;

    document.querySelectorAll('.theme-list-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titleKey = e.target.dataset.titlekey;
            const theme = themedLists.find(t => t.titleKey === titleKey);
            displayNamesForTheme(theme);
        });
    });
}

function displayNamesForTheme(theme) {
    const currentLang = localStorage.getItem('language') || 'en';
    const listNames = names.filter(theme.filter).sort(() => 0.5 - Math.random());
    const themeTitle = translations[currentLang][theme.titleKey];
    
    let namesHTML = '<ul class="themed-name-list">';
    listNames.slice(0, 20).forEach(name => {
        let nameClass = '';
        if (name.gender === 'menina') nameClass = 'name-girl';
        else if (name.gender === 'menino') nameClass = 'name-boy';
        else if (name.gender === 'unissex') nameClass = 'name-unisex';
        namesHTML += `<li class="${nameClass}">${name.name}</li>`;
    });
    namesHTML += '</ul>';

    modalContent.innerHTML = `
        <h3>${themeTitle}</h3>
        ${namesHTML}
        <div class="modal-footer">
            <button id="back-to-themes" class="btn btn-small"><i class="fa-solid fa-arrow-left"></i> <span>${translations[currentLang].backToThemes}</span></button>
            <button id="share-theme-list" class="btn btn-primary"><i class="fa-solid fa-share-alt"></i> <span>${translations[currentLang].shareThisList}</span></button>
        </div>
    `;

    document.getElementById('back-to-themes').addEventListener('click', displayThemeSelection);
    document.getElementById('share-theme-list').addEventListener('click', () => {
        let textToCopy = `${themeTitle}:\n\n`;
        listNames.slice(0, 20).forEach(name => { textToCopy += `- ${name.name}\n`; });
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('listCopiedToast');
        });
    });
}

function setupEventListeners() {
    favoritesList.addEventListener('click', (event) => { if (event.target.classList.contains('remove-fav-btn')) { const nameToRemove = event.target.getAttribute('data-name'); favorites = favorites.filter(fav => fav.name !== nameToRemove); localStorage.setItem('favoriteNames', JSON.stringify(favorites)); renderFavorites(); } });
    clearFavoritesBtn.addEventListener('click', () => { const currentLang = localStorage.getItem('language') || 'en'; const confirmationText = translations[currentLang].clearConfirm; if (confirm(confirmationText)) { favorites = []; localStorage.removeItem('favoriteNames'); renderFavorites(); } });
    shareFavoritesBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('language') || 'en';
        if (favorites.length === 0) return;
        let textToCopy = translations[currentLang].favoritesListTitle + '\n\n';
        favorites.forEach(fav => { textToCopy += `${fav.name} - "${fav.meaning}"\n`; });
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('listCopiedToast');
        }).catch(err => console.error('Failed to copy text: ', err));
    });
    cookieAcceptBtn.addEventListener('click', () => { localStorage.setItem('cookieConsent', 'accepted'); cookieBanner.style.display = 'none'; });
    cookieDeclineBtn.addEventListener('click', () => { localStorage.setItem('cookieConsent', 'declined'); cookieBanner.style.display = 'none'; });
    genderButtonsContainer.addEventListener('click', (event) => { if (event.target.tagName === 'BUTTON') { genderButtonsContainer.querySelector('.active').classList.remove('active'); event.target.classList.add('active'); const filterKey = event.target.getAttribute('data-i18n-key'); if (filterKey === 'genderBoy') { currentGenderFilter = 'menino'; } else if (filterKey === 'genderGirl') { currentGenderFilter = 'menina'; } else if (filterKey === 'genderUnisex') { currentGenderFilter = 'unissex'; } else { currentGenderFilter = 'todos'; } generateNewName(); } });
    cultureFilterSelect.addEventListener('change', (event) => { currentCultureFilter = event.target.value; generateNewName(); });
    religionFilterSelect.addEventListener('change', (event) => { currentReligionFilter = event.target.value; generateNewName(); });
    generateButton.addEventListener('click', generateNewName);
    startQuizCard.addEventListener('click', startQuiz);
    shareListsCard.addEventListener('click', openThemedListsModal);
    modalCloseBtn.addEventListener('click', closeThemedListsModal);
    modalOverlay.addEventListener('click', closeThemedListsModal);
}

async function initializeApp() {
    try {
        const [namesResponse, translationsResponse] = await Promise.all([
            fetch('names.json'),
            fetch('translations.json')
        ]);
        if (!namesResponse.ok) throw new Error('Failed to load names.json');
        if (!translationsResponse.ok) throw new Error('Failed to load translations.json');
        names = await namesResponse.json();
        translations = await translationsResponse.json();
        
        const supportedLangs = ['pt', 'en', 'es', 'fr', 'it'];
        const browserLang = navigator.language.split('-')[0];
        const langToSet = supportedLangs.includes(browserLang) ? browserLang : 'en';
        setLanguage(langToSet);

        const savedFavorites = JSON.parse(localStorage.getItem('favoriteNames'));
        if (savedFavorites) {
            favorites = savedFavorites;
            renderFavorites();
        }
        const handleCookieBanner = () => { if (!localStorage.getItem('cookieConsent')) { cookieBanner.style.display = 'flex'; } };
        handleCookieBanner();
        
        updateTrendingNames();
        generateNewName();
        setupEventListeners();
        
        generateButton.disabled = false;
    } catch (error) {
        console.error("Could not initialize the application:", error);
        resultContainer.innerHTML = `<p style="color: red;">Error: Could not load essential data for the application.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);