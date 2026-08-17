/*
    Avenir de Thiawlene - Devine le Quartier
    Le joueur regarde une photo et devine dans quel quartier elle a été
    prise, contre la montre pour récompenser la rapidité.
*/

const ROUND_SIZE = 10;
const CHOICES_PER_QUESTION = 4;
const TIME_PER_QUESTION = 8;
const BASE_POINTS = 50;
const MAX_BONUS = 50;

let allQuartiers = [];
let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let totalPoints = 0;
let playerName = '';
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;

const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-game-btn');
const emptyStateMsg = document.getElementById('empty-state-msg');
const progressBar = document.getElementById('progress-bar');
const photoEl = document.getElementById('quartier-photo');
const optionsList = document.getElementById('options-list');
const scoreDisplay = document.getElementById('score-display');
const scoreDetails = document.getElementById('score-details');
const pointsDetails = document.getElementById('points-details');
const pointsLive = document.getElementById('points-live');
const resultTitle = document.getElementById('result-title');
const resultMsg = document.getElementById('result-message');
const timerEl = document.getElementById('timer');

document.addEventListener('DOMContentLoaded', async () => {
    const [quartiersRes, imagesRes] = await Promise.all([
        supabaseClient.from('quartiers').select('id, name'),
        supabaseClient.from('quartier_images').select('id, image_url, quartier_id, quartiers(name)')
    ]);

    if (quartiersRes.error || imagesRes.error) {
        emptyStateMsg.style.display = 'block';
        emptyStateMsg.textContent = "Erreur de chargement. Vérifie la configuration Supabase.";
        startBtn.style.display = 'none';
        return;
    }

    allQuartiers = quartiersRes.data || [];
    const images = imagesRes.data || [];

    if (allQuartiers.length < 2 || images.length === 0) {
        emptyStateMsg.style.display = 'block';
        emptyStateMsg.textContent = "Aucune photo disponible pour le moment. Ajoute des quartiers (table \"quartiers\") et des photos (table \"quartier_images\") dans Supabase pour lancer le jeu.";
        startBtn.style.display = 'none';
        return;
    }

    roundQuestions = shuffle(images).slice(0, ROUND_SIZE);

    startBtn.onclick = () => {
        playerName = document.getElementById('player-name').value.trim();
        selectionScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        currentIndex = 0;
        score = 0;
        totalPoints = 0;
        pointsLive.textContent = '0';
        showQuestion();
    };
});

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function showQuestion() {
    const question = roundQuestions[currentIndex];
    const correctName = question.quartiers ? question.quartiers.name : null;

    photoEl.src = question.image_url;
    optionsList.innerHTML = '';

    const progress = (currentIndex / roundQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    const distractors = shuffle(allQuartiers.filter(q => q.id !== question.quartier_id))
        .slice(0, CHOICES_PER_QUESTION - 1)
        .map(q => q.name);

    const options = shuffle([correctName, ...distractors]);

    options.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.dataset.index = i + 1;
        btn.innerHTML = `<span>${name}</span><i class="fas fa-chevron-right" style="opacity: 0.3;"></i>`;
        btn.onclick = () => handleAnswer(name, correctName, btn);
        optionsList.appendChild(btn);
    });

    startTimer(correctName);
}

function startTimer(correctName) {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    timerEl.textContent = timeLeft;
    timerEl.classList.remove('warning');

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 3) timerEl.classList.add('warning');
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleAnswer(null, correctName, null);
        }
    }, 1000);
}

function handleAnswer(selected, correctName, btn) {
    clearInterval(timerInterval);
    const allBtns = optionsList.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.inert = true);

    const isCorrect = selected === correctName;

    if (isCorrect) {
        btn.classList.add('correct');
        btn.querySelector('i').className = 'fas fa-check-circle';
        btn.querySelector('i').style.opacity = '1';
        score++;
        const bonus = Math.round(MAX_BONUS * (Math.max(timeLeft, 0) / TIME_PER_QUESTION));
        totalPoints += BASE_POINTS + bonus;
        pointsLive.textContent = totalPoints;
    } else if (btn) {
        btn.classList.add('wrong');
        btn.querySelector('i').className = 'fas fa-times-circle';
        btn.querySelector('i').style.opacity = '1';
    }

    if (!isCorrect) {
        allBtns.forEach(b => {
            if (b.textContent.trim().startsWith(correctName)) {
                b.classList.add('correct');
                b.querySelector('i').className = 'fas fa-check-circle';
                b.querySelector('i').style.opacity = '1';
            }
        });
    }

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < roundQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1400);
}

function showResults() {
    progressBar.style.width = '100%';
    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';

    const total = roundQuestions.length;
    const percentage = Math.round((score / total) * 100);

    scoreDisplay.textContent = `${percentage}%`;
    scoreDetails.textContent = `${score} bonnes réponses sur ${total}`;
    pointsDetails.innerHTML = `<i class="fas fa-bolt"></i> ${totalPoints} points de rapidité`;

    const greeting = playerName ? `Bravo ${playerName} !` : 'Bravo !';
    resultTitle.textContent = greeting;

    if (percentage === 100) {
        resultMsg.textContent = "Score parfait ! Tu connais ton quartier comme ta poche.";
    } else if (percentage >= 70) {
        resultMsg.textContent = "Excellent ! Tu commences à bien connaître le coin.";
    } else if (percentage >= 40) {
        resultMsg.textContent = "Pas mal ! Continue à explorer pour progresser.";
    } else {
        resultMsg.textContent = "Il va falloir explorer un peu plus le quartier !";
    }
}
