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
let timeLeft = 60;
let playerInfo = { name: "", phone: "" };

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

    playerInfo.name = playerName;
    playerInfo.phone = playerPhone;

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
    
    // Start Global Timer (Once)
    startGlobalTimer();

    // Add welcome toast/overlay temporarily
    const welcome = document.createElement('div');
    welcome.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:var(--primary); color:white; padding:2rem; border-radius:20px; z-index:1000; font-size:1.5rem; font-weight:700; box-shadow:0 10px 30px rgba(0,0,0,0.3); text-align:center; animation: fadeInOut 2s forwards;";
    welcome.innerHTML = `<i class="fas fa-bolt" style="display:block; font-size:3rem; margin-bottom:1rem;"></i>Prêt, ${playerName} ?<br>C'est parti !`;
    document.body.appendChild(welcome);
    setTimeout(() => welcome.remove(), 2000);

    showQuestion();
};

function showQuestion() {
    const question = currentQuestionsList[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsList.innerHTML = '';
    
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
    const resultTitle = document.getElementById('result-title');
    const playerName = document.getElementById('player-name').value.trim();
    
    scoreDisplay.textContent = `${percentage}%`;
    scoreDetails.textContent = `${score} bonnes réponses sur ${currentQuestionsList.length}`;
    
    if (percentage === 100) {
        resultTitle.textContent = `Félicitations ${playerName} ! 🏆`;
        resultMsg.innerHTML = `<span style="color:var(--primary); font-size:1.2rem; display:block; margin-bottom:1rem;">SCORE PARFAIT !</span> Tu as gagné un CADEAU. Le club va te contacter prochainement sur WhatsApp !`;
    } else {
        resultTitle.textContent = `Bien joué ${playerName} !`;
        if (percentage >= 70) resultMsg.textContent = "Excellent travail ! Tu connais vraiment ton sujet.";
        else resultMsg.textContent = "Continue d'apprendre, l'important c'est de progresser !";
    }

    // Save Result to Supabase
    await saveResult();
}

async function saveResult() {
    const statusMsg = document.getElementById('save-status-msg');
    const manualBtn = document.getElementById('manual-save-btn');
    
    if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = 'var(--primary)';
        statusMsg.textContent = "Tentative d'enregistrement...";
    }

    try {
        const { error } = await supabaseClient.from('quiz_results').insert([{
            user_name: playerInfo.name || "Anonyme",
            user_phone: playerInfo.phone || "0000",
            theme_name: currentThemeName || "Inconnu",
            difficulty: currentLevel || "facile",
            score: parseInt(score),
            total_questions: parseInt(currentQuestionsList.length)
        }]);

        if (error) {
            console.error("ERREUR SUPABASE:", error);
            if (statusMsg) {
                statusMsg.style.color = '#ef4444';
                statusMsg.textContent = "ERREUR: " + error.message;
            }
            if (manualBtn) manualBtn.style.display = 'block';
            alert("ÉCHEC: " + error.message + "\nCode: " + error.code);
        } else {
            console.log("SUCCÈS !");
            if (statusMsg) {
                statusMsg.style.color = '#10b981';
                statusMsg.textContent = "Score enregistré avec succès !";
            }
            if (manualBtn) manualBtn.style.display = 'none';
        }
    } catch (err) {
        console.error("CRASH JS:", err);
        alert("CRASH SYSTÈME: " + err.message);
    }
}

// Global Timer Logic
function startGlobalTimer() {
    timeLeft = 60; // Je passe à 60s car 10 questions en 30s total c'est très court !
    timerEl.textContent = timeLeft;
    timerEl.classList.remove('warning');

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 10) {
            timerEl.classList.add('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResults(); // Fin immédiate du quiz
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function handleTimeout() {
    // Cette fonction n'est plus utilisée individuellement pour les questions
}
