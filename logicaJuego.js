let playerText = document.getElementById('playerText');
let restartBtn = document.getElementById('restartBtn');
let boxes = Array.from(document.getElementsByClassName('box'));
let winnerIndicator = getComputedStyle(document.body).getPropertyValue('--winning-blocks');

const O_TEXT = "O";
const X_TEXT = "X";
let currentPlayer = X_TEXT;
let spaces = Array(9).fill(null);
let startTime;
let intervalId; 

const startGame = () => {
    startTime = new Date().getTime();
    intervalId = setInterval(updateTimer, 1000); 
    boxes.forEach(box => box.addEventListener('click', boxClicked));
};

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000); 
    const minutes = Math.floor(elapsedTimeInSeconds / 60); 
    const seconds = elapsedTimeInSeconds % 60; 

    let formattedMinutes;
    let formattedSeconds;
    
    formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    document.querySelector('h3').innerText = `${formattedMinutes}:${formattedSeconds}`;
}


function boxClicked(e) {
    const id = e.target.id;

    if (!spaces[id]) {
        spaces[id] = currentPlayer;
        e.target.innerText = currentPlayer;
        
        if (playerHasWon() !== false) {
            endTime = new Date().getTime();
            clearInterval(intervalId);
            const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
            const minutes = Math.floor(elapsedTimeInSeconds / 60);
            const seconds = elapsedTimeInSeconds % 60;
            const formattedTime = formatTime(minutes, seconds);
            const nombreUsuario = localStorage.getItem('nombreUsuario');
            playerText.innerHTML = nombreUsuario ? `${nombreUsuario} ha ganado!` : "Computadora ha ganado!";
            let winning_blocks = playerHasWon();
            highlightWinningBlocks(winning_blocks);
            disableBoard();
            updatePlayerList();
            return;
        }

        if (isBoardFull()) {
            endTime = new Date().getTime();
            clearInterval(intervalId);
            const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
            const minutes = Math.floor(elapsedTimeInSeconds / 60);
            const seconds = elapsedTimeInSeconds % 60;
            const formattedTime = formatTime(minutes, seconds);
            playerText.innerHTML = "Es un empate!";
            disableBoard();
            return;
        }

        currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;

        if (currentPlayer === O_TEXT) {
            computerMove();
        }
    }
}

function disableBoard() {
    boxes.forEach(box => {
        box.removeEventListener('click', boxClicked); 
    });
}

function formatTime(minutes, seconds) {
    let formattedMinutes;
    let formattedSeconds;
    
    formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
}

function computerMove() {
    const emptyIndexes = spaces.reduce((acc, val, index) => {
        if (val === null) acc.push(index);
        return acc;
    }, []);

    const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

    spaces[randomIndex] = currentPlayer;
    boxes[randomIndex].innerText = currentPlayer;

    if (playerHasWon() !== false) {
        endTime = new Date().getTime();
        clearInterval(intervalId);
        const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
        const minutes = Math.floor(elapsedTimeInSeconds / 60);
        const seconds = elapsedTimeInSeconds % 60;
        const formattedTime = formatTime(minutes, seconds);
        //
        playerText.innerHTML = "Computadora ha ganado!";
        let winning_blocks = playerHasWon();
        highlightWinningBlocks(winning_blocks);
        disableBoard();
        updatePlayerList();
        return; 
    }

    if (isBoardFull()) {
        playerText.innerHTML = "Es un empate!";
        return;
    }

    currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
}

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function playerHasWon() {
    for (const condition of winningCombos) {
        let [a, b, c] = condition;

        if (spaces[a] && (spaces[a] === spaces[b] && spaces[a] === spaces[c])) {
            return [a, b, c];
        }
    }
    return false;
}

function isBoardFull() {
    return spaces.every(space => space !== null);
}

function highlightWinningBlocks(winning_blocks) {
    winning_blocks.map(box => boxes[box].style.backgroundColor = winnerIndicator);
}

function updatePlayerList() {
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    if (nombreUsuario) {
        const playerList = document.getElementById('playerList');

        const winner = playerHasWon();
        if (winner) {
            const winningPlayer = spaces[winner[0]]; 
            const tiempoTranscurrido = getTiempoTranscurrido(); 

            const newListItem = document.createElement('li');
            newListItem.textContent = `${winningPlayer === X_TEXT ? nombreUsuario : 'Computadora'} - ${tiempoTranscurrido}`;

            let listItems = JSON.parse(localStorage.getItem('bestTimes')) || [];

            listItems.push(newListItem.textContent); 
            listItems.sort((a, b) => {
                const tiempoA = a.match(/\d+:\d+/);
                const tiempoB = b.match(/\d+:\d+/);
                if (tiempoA && tiempoB) {
                    return tiempoA[0].localeCompare(tiempoB[0]); 
                }
                return 0;
            });

            listItems = listItems.slice(0, 10);

            localStorage.setItem('bestTimes', JSON.stringify(listItems));

            playerList.innerHTML = '';

            listItems.forEach(itemText => {
                const listItem = document.createElement('li');
                listItem.textContent = itemText;
                playerList.appendChild(listItem);
            });
        }
    }
}

function getTiempoTranscurrido() {
    const endTime = new Date().getTime(); 
    const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000); 
    const minutes = Math.floor(elapsedTimeInSeconds / 60); 
    const seconds = elapsedTimeInSeconds % 60; 

    let finalTime = formatTime(minutes, seconds);
    return finalTime;
}

restartBtn.addEventListener('click', restart);

function restart() {
    spaces.fill(null);

    boxes.forEach(box => {
        box.innerText = '';
        box.style.backgroundColor = '';
    });

    clearInterval(intervalId); 
    document.getElementById('nombreInput').value = '';
    document.querySelector('h3').innerText = '00:00'; 
    document.querySelector('h1').innerText = 'Tic Tac Toe';

    currentPlayer = X_TEXT;

    disableBoard();
    document.getElementById('nombreInput').disabled = false;
    alert("Tendrá unos segundos para ingresar el nombre del jugador y después iniciará el juego");
    setTimeout(function() {
        document.getElementById('nombreInput').focus(); 
        setTimeout(function() {
            const nombreUsuario = document.getElementById('nombreInput').value.trim();
            if (nombreUsuario !== "") {
                localStorage.setItem('nombreUsuario', nombreUsuario);
                startGame(); 
            }
        }, 5000); 
    }, 2000); 
}

startGame();
