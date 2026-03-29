/* 
    Avenir de Thiawlene - Quiz Logic
    Author: Antigravity
    Includes: Football, Maths, Français, Coran
*/

const quizData = {
    foot: {
        facile: [
            { q: "Combien de joueurs y a-t-il dans une équipe de football sur le terrain ?", options: ["7", "9", "11", "12"], correct: 2 },
            { q: "Quel pays a remporté la Coupe du Monde 2022 ?", options: ["France", "Brésil", "Argentine", "Maroc"], correct: 2 },
            { q: "Quelle est la durée d'un match de football classique (hors temps additionnel) ?", options: ["80 min", "90 min", "100 min", "45 min"], correct: 1 },
            { q: "Quel joueur est surnommé 'La Pulga' ?", options: ["Cristiano Ronaldo", "Kylian Mbappé", "Lionel Messi", "Neymar"], correct: 2 },
            { q: "Quelle partie du corps un joueur (hors gardien) ne peut-il pas utiliser ?", options: ["La tête", "Les mains", "Le torse", "Les pieds"], correct: 1 }
        ],
        moyen: [
            { q: "Quel club détient le record du nombre de Ligues des Champions remportées ?", options: ["FC Barcelone", "Real Madrid", "AC Milan", "Bayern Munich"], correct: 1 },
            { q: "Dans quelle ville se trouve l'école de football Avenir de Thiawlene ?", options: ["Dakar", "Saint-Louis", "Rufisque", "Thies"], correct: 2 },
            { q: "Qui a remporté le Ballon d'Or 2023 ?", options: ["Erling Haaland", "Lionel Messi", "Kylian Mbappé", "Karim Benzema"], correct: 1 },
            { q: "Quel est le poste de Sadio Mané ?", options: ["Gardien", "Défenseur", "Milieu de terrain", "Attaquant"], correct: 3 },
            { q: "Combien de temps dure une prolongation au football ?", options: ["15 minutes", "20 minutes", "30 minutes", "45 minutes"], correct: 2 }
        ],
        difficile: [
            { q: "Qui est le meilleur buteur de l'histoire de la Coupe du Monde ?", options: ["Pelé", "Miroslav Klose", "Ronaldo (Brésil)", "Just Fontaine"], correct: 1 },
            { q: "En quelle année a été organisée la première Coupe du Monde de football ?", options: ["1920", "1930", "1950", "1954"], correct: 1 },
            { q: "Quel pays a remporté l'Euro 2004 à la surprise générale ?", options: ["Grèce", "Portugal", "Danemark", "République Tchèque"], correct: 0 },
            { q: "Quel est le seul gardien de but à avoir remporté le Ballon d'Or ?", options: ["Gianluigi Buffon", "Lev Yachine", "Manuel Neuer", "Iker Casillas"], correct: 1 },
            { q: "Quel club a réalisé le 'Sextuplé' (6 trophées en un an) en 2009 ?", options: ["Real Madrid", "FC Barcelone", "Bayern Munich", "Manchester City"], correct: 1 }
        ]
    },
    maths: {
        facile: [
            { q: "Combien font 15 + 27 ?", options: ["32", "42", "45", "52"], correct: 1 },
            { q: "Quel est le résultat de 5 x 8 ?", options: ["35", "40", "45", "50"], correct: 1 },
            { q: "Si j'ai 3 pommes et que j'en achète 4, combien en ai-je ?", options: ["6", "7", "8", "9"], correct: 1 },
            { q: "Combien de côtés possède un triangle ?", options: ["3", "4", "5", "6"], correct: 0 },
            { q: "Combien font 100 - 35 ?", options: ["55", "65", "75", "85"], correct: 1 }
        ],
        moyen: [
            { q: "Quel est le résultat de 12 x 12 ?", options: ["124", "134", "144", "154"], correct: 2 },
            { q: "Combien de minutes y a-t-il dans 2 heures et demi ?", options: ["120", "150", "180", "200"], correct: 1 },
            { q: "Quel est le périmètre d'un carré de 5 cm de côté ?", options: ["10 cm", "20 cm", "25 cm", "30 cm"], correct: 1 },
            { q: "Combien font 450 ÷ 9 ?", options: ["40", "45", "50", "60"], correct: 2 },
            { q: "Si un gâteau est coupé en 8 parts et que j'en mange 2, quel pourcentage reste-t-il ?", options: ["25%", "50%", "75%", "80%"], correct: 2 }
        ],
        difficile: [
            { q: "Quelle est la racine carrée de 169 ?", options: ["11", "12", "13", "14"], correct: 2 },
            { q: "Combien font 2 à la puissance 5 (2^5) ?", options: ["10", "16", "32", "64"], correct: 2 },
            { q: "Quel est l'aire d'un triangle avec une base de 10 cm et une hauteur de 6 cm ?", options: ["16 cm²", "30 cm²", "60 cm²", "20 cm²"], correct: 1 },
            { q: "Résous : 3x + 5 = 20. Quelle est la valeur de x ?", options: ["3", "5", "7", "15"], correct: 1 },
            { q: "Quel est le nombre de degrés dans un angle droit ?", options: ["45°", "90°", "180°", "360°"], correct: 1 }
        ]
    },
    francais: {
        facile: [
            { q: "Quel est le pluriel du mot 'cheval' ?", options: ["Chevals", "Chevaux", "Chevales", "Chevaus"], correct: 1 },
            { q: "Comment écrit-on le chiffre 20 en lettres ?", options: ["Vin", "Vint", "Vingt", "Vindt"], correct: 2 },
            { q: "Lequel de ces mots est un verbe ?", options: ["Manger", "Maison", "Beau", "Lentement"], correct: 0 },
            { q: "Quelle est la première lettre de l'alphabet ?", options: ["A", "B", "C", "D"], correct: 0 },
            { q: "Trouve l'intrus : Pomme, Banane, Carotte, Orange.", options: ["Pomme", "Banane", "Carotte", "Orange"], correct: 2 }
        ],
        moyen: [
            { q: "Quel est le synonyme du mot 'content' ?", options: ["Triste", "Heureux", "Fatigué", "Petit"], correct: 1 },
            { q: "Quelle est la terminaison des verbes du 1er groupe à l'imparfait (3ème pers. du pluriel) ?", options: ["-ent", "-aient", "-ont", "-ez"], correct: 1 },
            { q: "Comment s'appelle l'accent sur le 'e' dans le mot 'fête' ?", options: ["Aigu", "Grave", "Circonflexe", "Tréma"], correct: 2 },
            { q: "Quel est le contraire de 'rapide' ?", options: ["Vite", "Lent", "Fort", "Grand"], correct: 1 },
            { q: "Quelle est la fonction du mot souligné : 'Le petit *chat* dort.' ?", options: ["Verbe", "Sujet", "Complément", "Adjectif"], correct: 1 }
        ],
        difficile: [
            { q: "Quelle est la bonne orthographe ?", options: ["Occurence", "Occurrence", "Occurrance", "Occurance"], correct: 1 },
            { q: "Au subjonctif présent, que devient le verbe 'être' à la 1ère pers. du singulier ?", options: ["Que je sois", "Que je suis", "Que je serais", "Que je fusse"], correct: 0 },
            { q: "Lequel de ces mots est un adverbe ?", options: ["Gentil", "Vraiment", "Beauté", "Prendre"], correct: 1 },
            { q: "De quel auteur est le célèbre livre 'Les Misérables' ?", options: ["Émile Zola", "Gustave Flaubert", "Victor Hugo", "Albert Camus"], correct: 2 },
            { q: "Quel est le participe passé du verbe 'moudre' ?", options: ["Moulu", "Moudu", "Moudus", "Mou"], correct: 0 }
        ]
    },
    coran: {
        facile: [
            { q: "Comment s'appelle le dernier Prophète de l'Islam (PSL) ?", options: ["Issa", "Moussa", "Ibrahim", "Mahomet"], correct: 3 },
            { q: "Combien y a-t-il de piliers en Islam ?", options: ["3", "4", "5", "6"], correct: 2 },
            { q: "Quel est le nom du livre sacré de l'Islam ?", options: ["La Bible", "La Torah", "Le Coran", "Les Psaumes"], correct: 2 },
            { q: "Combien de fois par jour un musulman prie-t-il obligatoirement ?", options: ["2", "3", "5", "7"], correct: 2 },
            { q: "Quel est le nom du mois de jeûne en Islam ?", options: ["Ramadan", "Chaouwal", "Chabaane", "Rajab"], correct: 0 }
        ],
        moyen: [
            { q: "Quelle est la plus longue sourate du Coran ?", options: ["Al-Fatiha", "Al-Baqarah", "Yasin", "Al-Ikhlas"], correct: 1 },
            { q: "Dans quelle ville est né le Prophète Mahomet (PSL) ?", options: ["Médine", "La Mecque", "Jérusalem", "Damas"], correct: 1 },
            { q: "Comment s'appelle l'appel à la prière en Islam ?", options: ["Iqamah", "Adhan", "Doua", "Khutba"], correct: 1 },
            { q: "Quel ange a apporté la révélation au Prophète (PSL) ?", options: ["Mikail", "Izrail", "Jibril (Gabriel)", "Israfil"], correct: 2 },
            { q: "Combien de sourates y a-t-il dans le Coran ?", options: ["100", "110", "114", "120"], correct: 2 }
        ],
        difficile: [
            { q: "Quel est le nom du premier Calife de l'Islam après la mort du Prophète (PSL) ?", options: ["Omar", "Othman", "Ali", "Abou Bakr"], correct: 3 },
            { q: "Quel Prophète a construit l'Arche pour échapper au déluge ?", options: ["Noé (Nuh)", "Loth (Lut)", "Yunus (Jonas)", "Salih"], correct: 0 },
            { q: "Pendant combien d'années la révélation du Coran a-t-elle duré ?", options: ["13 ans", "20 ans", "23 ans", "25 ans"], correct: 2 },
            { q: "Quelle sourate est surnommée 'Le Cœur du Coran' ?", options: ["Al-Mulk", "Yasin", "Ar-Rahman", "Al-Kahf"], correct: 1 },
            { q: "Qui a été le premier muezzin de l'Islam ?", options: ["Abou Bakr", "Bilal ibn Rabah", "Omar ibn al-Khattâb", "Ali ibn Abi Talib"], correct: 1 }
        ]
    }
};

// State management
let currentTheme = null;
let currentLevel = null;
let currentQuestionIndex = 0;
let score = 0;
let currentQuestionsList = [];

// DOM Elements
const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const themeCards = document.querySelectorAll('.theme-grid .quiz-option-card');
const levelCards = document.querySelectorAll('.level-grid .quiz-option-card');
const startBtn = document.getElementById('start-quiz-btn');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const scoreDisplay = document.getElementById('score-display');
const scoreDetails = document.getElementById('score-details');

// Handle Selection
themeCards.forEach(card => {
    card.addEventListener('click', () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentTheme = card.dataset.theme;
        checkSelection();
    });
});

levelCards.forEach(card => {
    card.addEventListener('click', () => {
        levelCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentLevel = card.dataset.level;
        checkSelection();
    });
});

function checkSelection() {
    if (currentTheme && currentLevel) {
        startBtn.style.display = 'block';
        startBtn.scrollIntoView({ behavior: 'smooth' });
    }
}

// Start Quiz
startBtn.addEventListener('click', () => {
    currentQuestionsList = quizData[currentTheme][currentLevel];
    selectionScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    showQuestion();
});

function showQuestion() {
    const question = currentQuestionsList[currentQuestionIndex];
    questionText.textContent = question.q;
    optionsList.innerHTML = '';
    
    // Update progress bar
    const progress = (currentQuestionIndex / currentQuestionsList.length) * 100;
    progressBar.style.width = `${progress}%`;

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `
            <span>${option}</span>
            <i class="fas fa-chevron-right" style="opacity: 0.3;"></i>
        `;
        btn.onclick = () => handleAnswer(index, btn);
        optionsList.appendChild(btn);
    });
}

function handleAnswer(selectedIndex, btn) {
    const question = currentQuestionsList[currentQuestionIndex];
    const allBtns = optionsList.querySelectorAll('.answer-btn');
    
    // Disable all buttons after click
    allBtns.forEach(b => b.inert = true);

    if (selectedIndex === question.correct) {
        btn.classList.add('correct');
        btn.querySelector('i').className = 'fas fa-check-circle';
        btn.querySelector('i').style.opacity = '1';
        score++;
    } else {
        btn.classList.add('wrong');
        btn.querySelector('i').className = 'fas fa-times-circle';
        btn.querySelector('i').style.opacity = '1';
        // Show correct answer
        allBtns[question.correct].classList.add('correct');
        allBtns[question.correct].querySelector('i').className = 'fas fa-check-circle';
        allBtns[question.correct].querySelector('i').style.opacity = '1';
    }

    // Move to next question after a delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestionsList.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

function showResults() {
    progressBar.style.width = '100%';
    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    
    const percentage = Math.round((score / currentQuestionsList.length) * 100);
    scoreDisplay.textContent = `${percentage}%`;
    scoreDetails.textContent = `${score} bonnes réponses sur ${currentQuestionsList.length}`;
    
    // Custom messages
    const resultMsg = document.getElementById('result-message');
    if (percentage === 100) resultMsg.textContent = "Expert Absolu ! C'est un sans-faute !";
    else if (percentage >= 70) resultMsg.textContent = "Excellent travail ! Tu connais vraiment ton sujet.";
    else if (percentage >= 50) resultMsg.textContent = "Pas mal ! Mais tu peux faire encore mieux.";
    else resultMsg.textContent = "Continue d'apprendre, l'important c'est de progresser !";
}
