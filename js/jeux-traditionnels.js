/*
    Avenir de Thiawlene - Jeux Traditionnels
    Quiz culturel sur les jeux wolof et sénégalais, chronométré pour
    récompenser la rapidité.
    Contenu tiré du mémoire de DEA d'Iba Fall, "La dimension éducative à
    travers les mythes, superstitions et jeux dans la société traditionnelle
    africaine : le cas du Sénégal", UCAD, 2009-2010.
*/

const TRADITIONAL_GAMES = [
    {
        name: 'Le jeu du bâton des bergers',
        clue: "Chez les bergers, ce jeu consistait à planter un bâton dans le sol pour en faire une cible, puis à la viser à distance de trois façons différentes : à la verticale, sur le côté, ou avec le bout du bâton. Quel est ce jeu ?",
        funFact: "Ce jeu entraînait les bergers à manier leur bâton pour diriger le troupeau ou décrocher de la nourriture dans les arbres. Le bâton est ensuite devenu un objet sacré : chez les vieillards, en garder toujours un avec soi est un signe de sagesse."
    },
    {
        name: 'Le jeu de cache-cache des paysans',
        clue: "Dans ce jeu, on bandait les yeux d'un joueur qui devait ensuite retrouver les autres membres du groupe en écoutant uniquement les sons autour de lui. Quel est ce jeu ?",
        funFact: "Ce jeu aiguisait l'ouïe : il apprenait aux paysans à reconnaître les cris des serpents et des animaux venimeux, une compétence vitale dans les champs, et même à prédire les saisons à partir d'un simple coup de vent."
    },
    {
        name: 'Le Thioubalo (jeu de la flûte)',
        clue: "Ce jeu de musique, pratiqué par les Peuls, est réputé si puissant que, selon la tradition, ses meilleurs joueurs pouvaient mystiquement faire sortir les crocodiles de l'eau. Quel est ce jeu ?",
        funFact: "Le thioubalo dépassait le simple divertissement : il ne pouvait être joué par n'importe qui, tant son pouvoir symbolique était grand."
    },
    {
        name: 'Le Simb (faux-lion)',
        clue: "Dans ce jeu-spectacle sénégalais, le joueur porte un masque et écoute des formules incantatoires d'ouverture qui, selon la tradition, le font cesser d'être lui-même. Quel est ce jeu ?",
        funFact: "Le Simb, ou « faux-lion », est toujours pratiqué aujourd'hui au Sénégal : le porteur du masque incarne un lion devant les spectateurs."
    },
    {
        name: 'Le Këm-Këm',
        clue: "Ce jeu du Jàmbur (région de Louga) se joue avec des coquillages, et sa forme même — une spirale rectangulaire — est considérée comme sacrée, son point limitrophe symbolisant le salut. Quel est ce jeu ?",
        funFact: "Sa forme en spirale rappelle la marelle occidentale, qui aurait elle aussi une origine ancienne en forme d'escargot, selon le chercheur Charles Béart."
    }
];

const DISTRACTOR_NAMES = ['Le Zigala', 'Le Langa Buri', 'Le Yooté', "L'Awélé"];

const TIME_PER_QUESTION = 12;
const BASE_POINTS = 50;
const MAX_BONUS = 50;

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
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const funFactBox = document.getElementById('fun-fact-box');
const funFactText = document.getElementById('fun-fact-text');
const scoreDisplay = document.getElementById('score-display');
const scoreDetails = document.getElementById('score-details');
const pointsDetails = document.getElementById('points-details');
const pointsLive = document.getElementById('points-live');
const resultTitle = document.getElementById('result-title');
const resultMsg = document.getElementById('result-message');
const timerEl = document.getElementById('timer');

document.addEventListener('DOMContentLoaded', () => {
    startBtn.onclick = () => {
        playerName = document.getElementById('player-name').value.trim();
        roundQuestions = shuffle(TRADITIONAL_GAMES);
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
    questionText.textContent = question.clue;
    optionsList.innerHTML = '';
    funFactBox.style.display = 'none';

    const progress = (currentIndex / roundQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    const otherNames = TRADITIONAL_GAMES.filter(g => g.name !== question.name).map(g => g.name);
    const distractorPool = shuffle([...otherNames, ...DISTRACTOR_NAMES]);
    const options = shuffle([question.name, ...distractorPool.slice(0, 3)]);

    options.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.dataset.index = i + 1;
        btn.innerHTML = `<span>${name}</span><i class="fas fa-chevron-right" style="opacity: 0.3;"></i>`;
        btn.onclick = () => handleAnswer(name, question, btn);
        optionsList.appendChild(btn);
    });

    startTimer(question);
}

function startTimer(question) {
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
            handleAnswer(null, question, null);
        }
    }, 1000);
}

function handleAnswer(selected, question, btn) {
    clearInterval(timerInterval);
    const allBtns = optionsList.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.inert = true);

    const isCorrect = selected === question.name;

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
            if (b.textContent.trim().startsWith(question.name)) {
                b.classList.add('correct');
                b.querySelector('i').className = 'fas fa-check-circle';
                b.querySelector('i').style.opacity = '1';
            }
        });
    }

    funFactText.textContent = question.funFact;
    funFactBox.style.display = 'flex';

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < roundQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 2600);
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
        resultMsg.textContent = "Score parfait ! Tu connais vraiment bien les jeux d'antan.";
    } else if (percentage >= 60) {
        resultMsg.textContent = "Bien joué ! Tu commences à bien connaître ce riche héritage.";
    } else {
        resultMsg.textContent = "Continue à explorer ces jeux traditionnels, il y a encore beaucoup à découvrir !";
    }
}
