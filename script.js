const params = document.getElementById('settingsBtn');
const closeBtn = document.getElementById('close');
const gridSize = document.getElementById('gridSize');
const winCondition = document.getElementById('winCondition');
const applySettings = document.getElementById('applySettings');
const player1Symbol = document.getElementById('player1Symbol');
const player2Symbol = document.getElementById('player2Symbol');
const gameGrid = document.getElementById('gameGrid');
const restartBtn = document.getElementById('restartBtn')

params.addEventListener('click', () => {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'none';
});

restartBtn.addEventListener('click', () => {
    clearGrid();
})

applySettings.addEventListener('click', () => {
    const size = parseInt(gridSize.value);
    const winCond = parseInt(winCondition.value);
    const player1SymbolValue = player1Symbol.value;
    const player2SymbolValue = player2Symbol.value;
    if (size >= 3 && size <= 10 && winCond >= 3 && winCond <= size) {
        // Apply settings logic here
        localStorage.setItem('size', size);
        localStorage.setItem('winCondition', winCond);
        if (player1SymbolValue && player2SymbolValue && player1SymbolValue !== player2SymbolValue) {
            localStorage.setItem('player1Symbol', player1SymbolValue);
            localStorage.setItem('player2Symbol', player2SymbolValue);
            localStorage.setItem('currentPlayerSymbol', player1SymbolValue);
        } else {
            alert('Invalid player symbols. Please ensure they are different and not empty.');
            return;
        }
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'none';
        createGrid();
    }
    else {
        alert('Invalid settings. Please ensure grid size is between 3 and 10, and win condition is between 3 and grid size.');
    }
});

function createGrid() {
    const size = localStorage.getItem('size') || 3;
    const winCond = localStorage.getItem('winCondition') || 3;
    const player1SymbolValue = localStorage.getItem('player1Symbol') || 'X';
    const player2SymbolValue = localStorage.getItem('player2Symbol') || 'O';
    localStorage.setItem('currentPlayerSymbol', player1SymbolValue);

    gridSize.value = size;
    winCondition.value = winCond;
    player1Symbol.value = player1SymbolValue;
    player2Symbol.value = player2SymbolValue;
    gameGrid.innerHTML = '';
    gameGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    // gameGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Initialize game grid
    for (let i = 0; i < size; i++) {
        console.log('here');
        const row = document.createElement('div');
        row.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        row.classList.add('row');
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.margin = '0.25rem 0';
            // cell.classList.add('filled');
            // cell.classList.add('winning');
            cell.dataset.row = i;
            cell.dataset.col = j;
            row.appendChild(cell);
        }
        gameGrid.appendChild(row);
    }
    addEventListener();
}

// the click effect the print the symbol and change the player
function addEventListener() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            const currentPlayerSymbol = localStorage.getItem('currentPlayerSymbol');
            const content = document.createElement('h1');
            content.textContent = currentPlayerSymbol;
            cell.appendChild(content);
            e.target.classList.add('filled');
            checkWin(e.target);
            if (currentPlayerSymbol === localStorage.getItem('player1Symbol')) {
                localStorage.setItem('currentPlayerSymbol', localStorage.getItem('player2Symbol'));
            }else {
                localStorage.setItem('currentPlayerSymbol', localStorage.getItem('player1Symbol'));
            }

            // console.log(`Cell clicked: Row ${e.target.dataset.row}, Col ${e.target.dataset.col}`);
        });
    });

}

function checkWin(elementClicked) {
    const symbol = elementClicked.textContent;
    const row = parseInt(elementClicked.dataset.row);
    const col = parseInt(elementClicked.dataset.col);

    const size = parseInt(localStorage.getItem('size') || 3);
    const winCond = parseInt(localStorage.getItem('winCondition') || 3);

    function countInDirection(dx, dy, collect = false) {
        let count = 0;
        let r = row + dx;
        let c = col + dy;
        let cells = [];

        while (r >= 0 && r < size && c >= 0 && c < size) {
            const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
            if (cell && cell.textContent === symbol) {
                count++;
                if (collect) cells.push(cell);
                r += dx;
                c += dy;
            } else {
                break;
            }
        }
        return { count, cells };
    }

    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal principale
        [1, -1]   // diagonal secondaire
    ];

    for (const [dx, dy] of directions) {
        let total = 1;
        let winningCells = [elementClicked]; // البداية ديما الخانة الحالية

        const forward = countInDirection(dx, dy, true);
        const backward = countInDirection(-dx, -dy, true);

        total += forward.count + backward.count;
        winningCells = winningCells.concat(forward.cells, backward.cells);

        if (total >= winCond) {
            // زيد class "winning" على الخانات
            winningCells.forEach(cell => cell.classList.add('winning'));

            // alert(`🎉 Player "${symbol}" wins!`);
            disableBoard();
            return;
        }
    }

    const allCells = document.querySelectorAll('.cell');
    const isDraw = Array.from(allCells).every(cell => cell.textContent !== "");
    if (isDraw) {
        alert("🤝 Game Over! It's a draw.");
        disableBoard();
    }
}


function disableBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.pointerEvents = "none"; 
    });
}

function clearGrid() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('filled');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createGrid();
});

