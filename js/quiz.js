/* 
    Avenir de Thiawlene - Quiz Logic (Supabase Version)
    Handles: Dynamic themes, Questions, and Results saving
*/

let currentThemeId = null;
let currentThemeName = "";
let currentLevel = null;
let currentQuestionIndex = 0;
let score = 0;
let currentQuestionsList = [];
let timerInterval = null;
let timeLeft = 30;

// DOM Elements
const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const timerEl = document.getElementById('timer');
const themeGrid = document.getElementById('theme-grid');
const levelSelection = document.getElementById('level-selection');
const idSelection = document.getElementById('id-selection');
const startBtn = document.getElementById('start-quiz-btn');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const scoreDisplay = document.getElementById('score-display');
const scoreDetails = document.getElementById('score-details');

// Initial Load: Fetch Themes
document.addEventListener('DOMContentLoaded', async () => {
    await fetchThemes();
});

async function fetchThemes() {
    const { data, error } = await supabaseClient
        .from('quiz_themes')
        .select('*')
        .order('name');

    if (error) {
        themeGrid.innerHTML = `<p style="color:red;">Erreur de chargement des thèmes. Vérifiez votre base de données.</p>`;
        return;
    }

    if (data.length === 0) {
        themeGrid.innerHTML = `<p style="opacity:0.7;">Aucun thème disponible. Ajoutez-en via le dashboard admin.</p>`;
        return;
    }

    themeGrid.innerHTML = '';
    data.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'quiz-option-card';
        card.dataset.id = theme.id;
        card.dataset.name = theme.name;
        card.innerHTML = `
            <i class="${theme.icon || 'fas fa-question-circle'}" style="color: var(--primary);"></i>
            <span>${theme.name}</span>
        `;
        card.onclick = () => selectTheme(card);
        themeGrid.appendChild(card);
    });
}

function selectTheme(card) {
    document.querySelectorAll('#theme-grid .quiz-option-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    currentThemeId = card.dataset.id;
    currentThemeName = card.dataset.name;
    
    levelSelection.style.display = 'block';
    levelSelection.scrollIntoView({ behavior: 'smooth' });
}

// Level Selection
document.querySelectorAll('.level-grid .quiz-option-card').forEach(card => {
    card.onclick = () => {
        document.querySelectorAll('.level-grid .quiz-option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentLevel = card.dataset.level;
        
        idSelection.style.display = 'block';
        startBtn.style.display = 'block';
        idSelection.scrollIntoView({ behavior: 'smooth' });
    };
});

// Start Quiz
startBtn.onclick = async () => {
    const playerName = document.getElementById('player-name').value.trim();
    const playerPhone = document.getElementById('player-phone').value.trim();

    if (!playerName || !playerPhone) {
        alert("S'il te plaît, remplis ton nom et ton numéro WhatsApp pour participer !");
        return;
    }

    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Préparation...';

    // Fetch questions from Supabase
    const { data, error } = await supabaseClient
        .from('quiz_questions')
        .select('*')
        .eq('theme_id', currentThemeId)
        .eq('level', currentLevel);

    if (error || !data || data.length === 0) {
        alert("Désolé, il n'y a pas encore de questions pour ce thème et ce niveau.");
        startBtn.disabled = false;
        startBtn.innerHTML = 'Commencer le Quiz <i class="fas fa-play"></i>';
        return;
    }

    currentQuestionsList = data;
    selectionScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    showQuestion();
};

function showQuestion() {
    const question = currentQuestionsList[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsList.innerHTML = '';
    
    resetTimer();
    startTimer();

    const progress = (currentQuestionIndex / currentQuestionsList.length) * 100;
    progressBar.style.width = `${progress}%`;

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `<span>${option}</span><i class="fas fa-chevron-right" style="opacity: 0.3;"></i>`;
        btn.onclick = () => handleAnswer(index, btn);
        optionsList.appendChild(btn);
    });
}

function handleAnswer(selectedIndex, btn) {
    stopTimer();
    const question = currentQuestionsList[currentQuestionIndex];
    const allBtns = optionsList.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.inert = true);

    if (selectedIndex === question.correct_index) {
        btn.classList.add('correct');
        btn.querySelector('i').className = 'fas fa-check-circle';
        btn.querySelector('i').style.opacity = '1';
        score++;
    } else {
        btn.classList.add('wrong');
        btn.querySelector('i').className = 'fas fa-times-circle';
        btn.querySelector('i').style.opacity = '1';
        allBtns[question.correct_index].classList.add('correct');
        allBtns[question.correct_index].querySelector('i').className = 'fas fa-check-circle';
        allBtns[question.correct_index].querySelector('i').style.opacity = '1';
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestionsList.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

async function showResults() {
    stopTimer();
    progressBar.style.width = '100%';
    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    
    const percentage = Math.round((score / currentQuestionsList.length) * 100);
    scoreDisplay.textContent = `${percentage}%`;
    scoreDetails.textContent = `${score} bonnes réponses sur ${currentQuestionsList.length}`;
    
    const resultMsg = document.getElementById('result-message');
    if (percentage === 100) {
        resultMsg.innerHTML = `<span style="color:var(--primary); font-size:1.5rem; display:block; margin-bottom:1rem;">🏆 SCORE PARFAIT ! 🏆</span> Félicitations ! Tu as gagné un CADEAU. Le club va te contacter prochainement sur WhatsApp !`;
    } else if (percentage >= 70) {
        resultMsg.textContent = "Excellent travail ! Tu connais vraiment ton sujet.";
    } else {
        resultMsg.textContent = "Continue d'apprendre, l'important c'est de progresser !";
    }

    // Save Result to Supabase
    saveResult();
}

async function saveResult() {
    const playerName = document.getElementById('player-name').value;
    const playerPhone = document.getElementById('player-phone').value;

    await supabaseClient.from('quiz_results').insert([{
        user_name: playerName,
        user_phone: playerPhone,
        theme_name: currentThemeName,
        difficulty: currentLevel,
        score: score,
        total_questions: currentQuestionsList.length
    }]);
}

// Timer Utilities
function startTimer() {
    timeLeft = 30;
    timerEl.textContent = timeLeft;
    timerEl.classList.remove('warning');
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 10) timerEl.classList.add('warning');
        if (timeLeft <= 0) {
            stopTimer();
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }
function resetTimer() { stopTimer(); if (timerEl) { timerEl.classList.remove('warning'); timerEl.textContent = "30"; } }

function handleTimeout() {
    const question = currentQuestionsList[currentQuestionIndex];
    const allBtns = optionsList.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.inert = true);
    allBtns[question.correct_index].classList.add('correct');
    allBtns[question.correct_index].querySelector('i').className = 'fas fa-check-circle';
    allBtns[question.correct_index].querySelector('i').style.opacity = '1';

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestionsList.length) showQuestion();
        else showResults();
    }, 1500);
}
