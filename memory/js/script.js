const grid = document.getElementById('game-grid');
const moveDisplay = document.getElementById('move-count');
const globalMoveDisplay = document.getElementById('global-move-count');
const timerDisplay = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty');

const symbolPool = [
    '⭐','🍎','👻','💎','🚀','🌈','🍀','🔥','🍄','🎈','🎸','🍦','⚓','⚡','🦄','🐝',
    '🥑','🍕','🐱','🏀','🌍','🎁','💡','🔔','🦀','🍭','🚁','🚜','👾','🧿','☀️','🌙'
];

const sounds = { // Add sound clips
    flip: new Audio('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/button_tiny.mp3'),
    match: new Audio('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/button_push.mp3'),
    wrong: new Audio('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/snap.mp3'),
    win: new Audio('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/water_droplet_3.mp3')
};

let gameSet = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
// let totalPairs = 0;
let seconds = 0;
let timerInterval;
// let secondsElapsed = 0;
let gameStarted = false;

function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {}); // Catch block prevents errors if user hasn't interacted yet
}
// Sync Global Counter across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'globalTotalMoves') updateGlobalUI();
});

function updateGlobalUI() {
    globalMoveDisplay.innerText = localStorage.getItem('globalTotalMoves') || 0;
}

function saveTabState() {
    const state = { gameSet, moves, seconds, matches, difficulty: difficultySelect.value };
    sessionStorage.setItem('memoryTabState', JSON.stringify(state));
}

function updateTimer() {
    secondsElapsed++;
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

function createBoard() { // Creates game boardbased on selected size/difficulty
    const size = parseInt(difficultySelect.value);
    document.documentElement.style.setProperty('--size', size);
    grid.innerHTML = '';

    const totalPairs = (size * size) / 2;
    let selected = symbolPool.slice(0, totalPairs);
    gameSet = [...selected, ...selected].sort(() => Math.random() - 0.5);
    
    /* // Reset State
    clearInterval(timerInterval);
    grid.innerHTML = '';
    document.documentElement.style.setProperty('--size', size);
    flippedCards = [];
    moves = 0;
    matches = 0;
    secondsElapsed = 0;
    gameStarted = false;
    moveDisplay.innerText = '0';
    timerDisplay.textContent = '00:00';
    document.getElementById('message').innerText = '';

    // Prepare Cards
    let selectedSymbols = symbolPool.slice(0, totalPairs);
    let gameSet = [...selectedSymbols, ...selectedSymbols];
    gameSet.sort(() => Math.random() - 0.5);*/

    gameSet.forEach((symbol, index) => {  // Functional looping from Chapter 11
        const card = document.createElement('div'); // DOM manipulated with JavaScript
        card.className = 'card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-back">?</div>
            <div class="card-front">${symbol}</div>
        `;
        card.addEventListener('click', flipCard); // Added Event Listener 
        grid.appendChild(card);
    });
    updateStyles();
}

function flipCard() {
    if (!gameStarted) {
        gameStarted = true;
        // timerInterval = setInterval(updateTimer, 1000);
        timerInterval = setInterval(() => { seconds++; updateTimerUI(); }, 1000);
    }

    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        playSound(sounds.flip);
        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            moves++;
            moveDisplay.innerText = moves;

            // Update Global Storage
            let global = parseInt(localStorage.getItem('globalTotalMoves') || 0);
            localStorage.setItem('globalTotalMoves', global + 1);
            updateGlobalUI();

            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        matches++;
        playSound(sounds.match);
        flippedCards = [];
        //if (matches === totalPairs) {
        if (matches === (gameSet.length / 2)) {
            clearInterval(timerInterval);
            playSound(sounds.win);
            document.getElementById('message').innerText = `Victory! Final Time: ${timerDisplay.textContent}`; // DOM manipulated with JavaScript
        }
    } else {
        setTimeout(() => { // ES6 Arrow Function
            playSound(sounds.wrong);
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 800);
    }
    saveTabState();
}

function updateTimerUI() {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
}


function updateStyles() {
    const newColor = document.getElementById('theme-color').value;
    const pattern = document.getElementById('card-pattern').value;

    // 1. Update the CSS Variable for the theme color
    document.documentElement.style.setProperty('--primary-color', newColor);
    document.querySelectorAll('.card-back').forEach(b => {
        b.className = `card-back ${pattern}`;
    });
    /*// 2. Update the classes on all card backs
    const cardBacks = document.querySelectorAll('.card-back');
    cardBacks.forEach(back => {
        // Remove old pattern classes
        back.classList.remove('solid', 'dots', 'stripes');
        // Add the new selected pattern
        back.classList.add(pattern);
    });*/
}

function resetGame() {
    clearInterval(timerInterval);
    moves = 0; seconds = 0; matches = 0; gameStarted = false;
    moveDisplay.innerText = '0'; timerDisplay.innerText = '00:00';
    document.getElementById('message').innerText = '';
    createBoard();
    sessionStorage.removeItem('memoryTabState');
}
// Start Up
updateGlobalUI();
createBoard();