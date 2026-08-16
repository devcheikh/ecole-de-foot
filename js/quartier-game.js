/*
    Avenir de Thiawlene - Devine le Quartier
    Le joueur regarde une photo et devine dans quel quartier elle a été prise.
*/

const ROUND_SIZE = 10;
const CHOICES_PER_QUESTION = 4;

let allQuartiers = [];
let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let playerName = '';

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
const resultTitle = document.getElementById('result-title');
const resultMsg = document.getElementById('result-message');

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

    options.forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `<span>${name}</span><i class="fas fa-chevron-right" style="opacity: 0.3;"></i>`;
        btn.onclick = () => handleAnswer(name, correctName, btn);
        optionsList.appendChild(btn);
    });
}

function handleAnswer(selected, correctName, btn) {
    const allBtns = optionsList.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.inert = true);

    if (selected === correctName) {
        btn.classList.add('correct');
        btn.querySelector('i').className = 'fas fa-check-circle';
        btn.querySelector('i').style.opacity = '1';
        score++;
    } else {
        btn.classList.add('wrong');
        btn.querySelector('i').className = 'fas fa-times-circle';
        btn.querySelector('i').style.opacity = '1';
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
