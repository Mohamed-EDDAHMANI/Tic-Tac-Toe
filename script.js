let gameState = {
    board: [],
    currentPlayer: 'X',
    player1: {
        symbol: 'X',
        name: 'Player 1',
        score: 0,
        gamesPlayed: 0
    },
    player2: {
        symbol: 'O',
        name: 'Player 2',
        score: 0,
        gamesPlayed: 0
    },
    gridSize: 3,
    winCondition: 3,
    gameOver: false,
    winner: null,
    winningCells: [],
    gameHistory: [],
    gameMode: 'pvp', // 'pvp' or 'pvc'
    aiDifficulty: 'medium',
    isAiThinking: false
};

const elements = {
    gameBoard: document.getElementById('gameBoard'),
    currentPlayer: document.getElementById('currentPlayer'),
    gridInfo: document.getElementById('gridInfo'),
    winInfo: document.getElementById('winInfo'),

    // Player 1 elements
    player1Name: document.getElementById('player1Name'),
    player1Symbol: document.getElementById('player1Symbol'),
    player1Score: document.getElementById('player1Score'),
    player1Games: document.getElementById('player1Games'),
    player1Status: document.getElementById('player1Status'),
    player1Card: document.getElementById('player1Card'),
    player1Avatar: document.getElementById('player1Avatar'),

    // Player 2 elements
    player2Name: document.getElementById('player2Name'),
    player2Symbol: document.getElementById('player2Symbol'),
    player2Score: document.getElementById('player2Score'),
    player2Games: document.getElementById('player2Games'),
    player2Status: document.getElementById('player2Status'),
    player2Card: document.getElementById('player2Card'),
    player2Avatar: document.getElementById('player2Avatar'),

    // Control buttons
    newGameBtn: document.getElementById('newGameBtn'),
    resetScoresBtn: document.getElementById('resetScoresBtn'),
    settingsBtn: document.getElementById('settingsBtn'),

    // Mode toggle
    modeButtons: document.querySelectorAll('.mode-btn'),

    // Settings modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    applySettingsBtn: document.getElementById('applySettingsBtn'),
    gridSize: document.getElementById('gridSize'),
    winCondition: document.getElementById('winCondition'),
    player1SymbolSelect: document.getElementById('player1SymbolSelect'),
    player2SymbolSelect: document.getElementById('player2SymbolSelect'),
    aiDifficultySelect: document.getElementById('aiDifficultySelect'),
    aiDifficultyGroup: document.getElementById('aiDifficultyGroup'),

    // Game end modal
    gameEndModal: document.getElementById('gameEndModal'),
    gameEndIcon: document.getElementById('gameEndIcon'),
    gameEndTitle: document.getElementById('gameEndTitle'),
    gameEndMessage: document.getElementById('gameEndMessage'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    closeGameEndBtn: document.getElementById('closeGameEndBtn'),

    // AI elements
    aiDifficulty: document.getElementById('aiDifficulty'),
    difficultyValue: document.getElementById('difficultyValue'),

    // Victory effects
    victoryParticles: document.getElementById('victoryParticles')
};

class AIEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }

    makeMove(board, symbol, opponentSymbol, gridSize, winCondition) {
        switch (this.difficulty) {
            case 'easy':
                return this.makeRandomMove(board, gridSize);
            case 'medium':
                return this.makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition);
            case 'hard':
                return this.makeHardMove(board, symbol, opponentSymbol, gridSize, winCondition);
            default:
                return this.makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition);
        }
    }

    makeRandomMove(board, gridSize) {
        const availableMoves = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === '') {
                    availableMoves.push([row, col]);
                }
            }
        }

        if (availableMoves.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition) {
        // 1. Check if AI can win
        const winMove = this.findWinningMove(board, symbol, gridSize, winCondition);
        if (winMove) return winMove;

        // 2. Check if AI needs to block opponent
        const blockMove = this.findWinningMove(board, opponentSymbol, gridSize, winCondition);
        if (blockMove) return blockMove;

        // 3. Take center if available (for 3x3)
        if (gridSize === 3 && board[1][1] === '') {
            return [1, 1];
        }

        // 4. Take corners
        const corners = [[0, 0], [0, gridSize - 1], [gridSize - 1, 0], [gridSize - 1, gridSize - 1]];
        const availableCorners = corners.filter(([row, col]) => board[row][col] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // 5. Take any available move
        return this.makeRandomMove(board, gridSize);
    }

    makeHardMove(board, symbol, opponentSymbol, gridSize, winCondition) {
        // Use minimax algorithm for hard difficulty
        const bestMove = this.minimax(board, symbol, opponentSymbol, gridSize, winCondition, 0, true, -Infinity, Infinity);
        return bestMove.move;
    }

    findWinningMove(board, symbol, gridSize, winCondition) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === '') {
                    // Try this move
                    board[row][col] = symbol;

                    // Check if it creates a win
                    if (this.checkWinFromPosition(board, row, col, symbol, gridSize, winCondition)) {
                        board[row][col] = ''; // Undo move
                        return [row, col];
                    }

                    board[row][col] = ''; // Undo move
                }
            }
        }
        return null;
    }

    checkWinFromPosition(board, row, col, symbol, gridSize, winCondition) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (let [dx, dy] of directions) {
            let count = 1; // Count the current position

            // Check positive direction
            let r = row + dx;
            let c = col + dy;
            while (r >= 0 && r < gridSize && c >= 0 && c < gridSize && board[r][c] === symbol) {
                count++;
                r += dx;
                c += dy;
            }

            // Check negative direction
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < gridSize && c >= 0 && c < gridSize && board[r][c] === symbol) {
                count++;
                r -= dx;
                c -= dy;
            }

            if (count >= winCondition) {
                return true;
            }
        }

        return false;
    }

    minimax(board, aiSymbol, humanSymbol, gridSize, winCondition, depth, isMaximizing, alpha, beta) {
        const winner = this.evaluateBoard(board, aiSymbol, humanSymbol, gridSize, winCondition);

        if (winner === aiSymbol) return { score: 10 - depth, move: null };
        if (winner === humanSymbol) return { score: depth - 10, move: null };
        if (this.isBoardFull(board, gridSize)) return { score: 0, move: null };

        // Limit depth for performance
        if (depth >= 6) return { score: 0, move: null };

        let bestMove = null;
        let bestScore = isMaximizing ? -Infinity : Infinity;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === '') {
                    board[row][col] = isMaximizing ? aiSymbol : humanSymbol;

                    const result = this.minimax(board, aiSymbol, humanSymbol, gridSize, winCondition, depth + 1, !isMaximizing, alpha, beta);

                    board[row][col] = '';

                    if (isMaximizing) {
                        if (result.score > bestScore) {
                            bestScore = result.score;
                            bestMove = [row, col];
                        }
                        alpha = Math.max(alpha, result.score);
                    } else {
                        if (result.score < bestScore) {
                            bestScore = result.score;
                            bestMove = [row, col];
                        }
                        beta = Math.min(beta, result.score);
                    }

                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            if (beta <= alpha) break;
        }

        return { score: bestScore, move: bestMove };
    }

    evaluateBoard(board, aiSymbol, humanSymbol, gridSize, winCondition) {
        // Check all possible winning combinations
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] !== '') {
                    if (this.checkWinFromPosition(board, row, col, board[row][col], gridSize, winCondition)) {
                        return board[row][col];
                    }
                }
            }
        }
        return null;
    }

    isBoardFull(board, gridSize) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === '') {
                    return false;
                }
            }
        }
        return true;
    }
}

let aiEngine = new AIEngine(gameState.aiDifficulty);

// Enhanced Player Name Management
class PlayerNameManager {
    constructor() {
        this.setupNameInputs();
    }

    setupNameInputs() {
        elements.player1Name.addEventListener('focus', () => this.handleNameFocus(elements.player1Name, 1));
        elements.player1Name.addEventListener('blur', () => this.handleNameBlur(elements.player1Name, 1));
        elements.player1Name.addEventListener('input', () => this.handleNameInput(elements.player1Name, 1));
        elements.player1Name.addEventListener('keypress', (e) => this.handleNameKeypress(e, 1));

        elements.player2Name.addEventListener('focus', () => this.handleNameFocus(elements.player2Name, 2));
        elements.player2Name.addEventListener('blur', () => this.handleNameBlur(elements.player2Name, 2));
        elements.player2Name.addEventListener('input', () => this.handleNameInput(elements.player2Name, 2));
        elements.player2Name.addEventListener('keypress', (e) => this.handleNameKeypress(e, 2));
    }

    handleNameFocus(input, playerNum) {
        input.classList.add('editing');
        input.select();
        this.addGlowEffect(playerNum);
    }

    handleNameBlur(input, playerNum) {
        input.classList.remove('editing');
        this.validateAndUpdateName(input, playerNum);
        this.removeGlowEffect(playerNum);
    }

    handleNameInput(input, playerNum) {
        const value = input.value.trim();

        if (value.length === 0) {
            input.style.borderColor = 'var(--danger)';
        } else if (value.length > 15) {
            input.style.borderColor = 'var(--warning)';
        } else {
            input.style.borderColor = 'var(--success)';
        }

        if (playerNum === 1) {
            gameState.player1.name = value || 'Player 1';
        } else {
            gameState.player2.name = value || 'Player 2';
        }

        updateDisplay();
    }

    handleNameKeypress(e, playerNum) {
        if (e.key === 'Enter') {
            e.target.blur();
            this.animateNameUpdate(playerNum);
        }
    }

    validateAndUpdateName(input, playerNum) {
        let value = input.value.trim();

        if (!value) {
            value = `Player ${playerNum}`;
            input.value = value;
        }

        if (value.length > 20) {
            value = value.substring(0, 20);
            input.value = value;
        }

        value = value.replace(/[<>{}]/g, '');
        input.value = value;

        if (playerNum === 1) {
            gameState.player1.name = value;
        } else {
            gameState.player2.name = value;
        }

        this.savePlayerData();
        input.style.borderColor = '';
        updateDisplay();
    }

    addGlowEffect(playerNum) {
        const card = playerNum === 1 ? elements.player1Card : elements.player2Card;
        card.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4), var(--glass-shadow)';
    }

    removeGlowEffect(playerNum) {
        const card = playerNum === 1 ? elements.player1Card : elements.player2Card;
        card.style.boxShadow = '';
    }

    animateNameUpdate(playerNum) {
        const nameInput = playerNum === 1 ? elements.player1Name : elements.player2Name;
        const avatar = playerNum === 1 ? elements.player1Avatar : elements.player2Avatar;

        nameInput.style.transform = 'scale(1.05)';
        nameInput.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            nameInput.style.transform = 'scale(1)';
        }, 200);

        avatar.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            avatar.style.animation = '';
        }, 600);
    }

    savePlayerData() {
        const playerData = {
            player1: gameState.player1,
            player2: gameState.player2
        };
        try {
            localStorage.setItem('nexusTicTacToePlayerData', JSON.stringify(playerData));
        } catch (error) {
            console.warn('Could not save player data');
        }
    }

    loadPlayerData() {
        try {
            const saved = localStorage.getItem('nexusTicTacToePlayerData');
            if (saved) {
                const playerData = JSON.parse(saved);

                gameState.player1 = { ...gameState.player1, ...playerData.player1 };
                gameState.player2 = { ...gameState.player2, ...playerData.player2 };

                elements.player1Name.value = gameState.player1.name;
                elements.player2Name.value = gameState.player2.name;
                elements.player1Score.textContent = gameState.player1.score;
                elements.player2Score.textContent = gameState.player2.score;
                elements.player1Games.textContent = gameState.player1.gamesPlayed;
                elements.player2Games.textContent = gameState.player2.gamesPlayed;
            }
        } catch (error) {
            console.warn('Could not load player data');
        }
    }

    resetPlayerData() {
        gameState.player1.score = 0;
        gameState.player1.gamesPlayed = 0;
        gameState.player2.score = 0;
        gameState.player2.gamesPlayed = 0;

        this.savePlayerData();
        this.animateStatsReset();
    }

    animateStatsReset() {
        const statsElements = [
            elements.player1Score,
            elements.player1Games,
            elements.player2Score,
            elements.player2Games
        ];

        statsElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.transform = 'scale(1.2)';
                el.style.color = '#ff6b6b';
                el.textContent = '0';

                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.color = '';
                }, 300);
            }, index * 100);
        });
    }
}

const playerNameManager = new PlayerNameManager();

function initGame() {
    loadSettings();
    playerNameManager.loadPlayerData();
    createBoard();
    updateDisplay();
    setupEventListeners();
}

function setupEventListeners() {
    // Game controls
    elements.newGameBtn.addEventListener('click', newGame);
    elements.resetScoresBtn.addEventListener('click', () => {
        playerNameManager.resetPlayerData();
        updateDisplay();
    });
    elements.settingsBtn.addEventListener('click', openSettings);

    // Mode toggle
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            switchGameMode(mode);
        });
    });

    // Modal controls
    elements.closeSettingsBtn.addEventListener('click', closeSettings);
    elements.applySettingsBtn.addEventListener('click', applySettings);
    elements.playAgainBtn.addEventListener('click', newGame);
    elements.closeGameEndBtn.addEventListener('click', hideGameEndModal);

    // Modal overlay clicks
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeSettings();
    });

    elements.gameEndModal.addEventListener('click', (e) => {
        if (e.target === elements.gameEndModal) hideGameEndModal();
    });

    // Settings dependencies
    elements.gridSize.addEventListener('change', updateWinConditionOptions);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function switchGameMode(mode) {
    // Update mode buttons
    elements.modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // Update game state
    gameState.gameMode = mode;

    // Show/hide AI settings
    if (mode === 'pvc') {
        elements.aiDifficultyGroup.style.display = 'block';
        elements.aiDifficulty.style.display = 'block';
        elements.difficultyValue.textContent = gameState.aiDifficulty.charAt(0).toUpperCase() + gameState.aiDifficulty.slice(1);
        elements.player2Name.value = `AI (${gameState.aiDifficulty.charAt(0).toUpperCase() + gameState.aiDifficulty.slice(1)})`;
        elements.player2Name.disabled = true;
        gameState.player2.name = elements.player2Name.value;
    } else {
        elements.aiDifficultyGroup.style.display = 'none';
        elements.aiDifficulty.style.display = 'none';
        elements.player2Name.disabled = false;
        if (elements.player2Name.value.startsWith('AI (')) {
            elements.player2Name.value = 'Player 2';
            gameState.player2.name = 'Player 2';
        }
    }

    // Save settings and start new game
    saveSettings();
    newGame();
}

function handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
        case 'n':
            newGame();
            break;
        case 'r':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                playerNameManager.resetPlayerData();
                updateDisplay();
            }
            break;
        case 's':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                openSettings();
            }
            break;
        case 'escape':
            closeSettings();
            hideGameEndModal();
            break;
        case '1':
            switchGameMode('pvp');
            break;
        case '2':
            switchGameMode('pvc');
            break;
    }
}

function createBoard() {
    gameState.board = Array(gameState.gridSize).fill().map(() => Array(gameState.gridSize).fill(''));

    elements.gameBoard.innerHTML = '';
    elements.gameBoard.setAttribute('data-size', gameState.gridSize);

    const totalCells = gameState.gridSize * gameState.gridSize;

    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener('click', () => handleCellClick(row, col));
            cell.addEventListener('mouseenter', () => showPreview(cell));
            cell.addEventListener('mouseleave', () => hidePreview(cell));

            cell.style.opacity = '0';
            cell.style.transform = 'scale(0.8)';

            elements.gameBoard.appendChild(cell);

            setTimeout(() => {
                cell.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            }, (row * gameState.gridSize + col) * 30);
        }
    }
}

function handleCellClick(row, col) {
    if (gameState.gameOver || gameState.board[row][col] || gameState.isAiThinking) return;

    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    cell.style.transform = 'scale(0)';
    cell.style.transition = 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    setTimeout(() => {
        gameState.board[row][col] = gameState.currentPlayer;
        cell.textContent = gameState.currentPlayer;
        cell.classList.add('filled');
        cell.classList.remove('preview');
        cell.style.transform = 'scale(1)';

        checkGameState(row, col);
    }, 100);
}

function checkGameState(row, col) {
    const winResult = checkWin(row, col);

    if (winResult.win) {
        handleWin(winResult.cells);
        return;
    }

    if (checkDraw()) {
        handleDraw();
        return;
    }

    switchPlayer();
    updateDisplay();

    if (gameState.gameMode === 'pvc' && gameState.currentPlayer === gameState.player2.symbol && !gameState.gameOver) {
        makeAiMove();
    }
}

function makeAiMove() {
    gameState.isAiThinking = true;
    elements.player2Status.textContent = 'Thinking...';
    elements.player2Status.className = 'player-status active';

    const thinkingTime = gameState.aiDifficulty === 'hard' ? 1200 :
        gameState.aiDifficulty === 'medium' ? 800 : 400;

    setTimeout(() => {
        const aiMove = aiEngine.makeMove(
            gameState.board,
            gameState.player2.symbol,
            gameState.player1.symbol,
            gameState.gridSize,
            gameState.winCondition
        );

        if (aiMove) {
            const [row, col] = aiMove;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

            cell.style.transform = 'scale(0)';
            cell.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            cell.style.background = 'rgba(240, 147, 251, 0.2)';

            setTimeout(() => {
                gameState.board[row][col] = gameState.currentPlayer;
                cell.textContent = gameState.currentPlayer;
                cell.classList.add('filled');
                cell.style.transform = 'scale(1)';
                cell.style.background = '';

                gameState.isAiThinking = false;
                checkGameState(row, col);
            }, 200);
        } else {
            gameState.isAiThinking = false;
        }
    }, thinkingTime);
}

function checkWin(row, col) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let [dx, dy] of directions) {
        const cells = getCellsInDirection(row, col, dx, dy);
        if (cells.length >= gameState.winCondition) {
            return { win: true, cells };
        }
    }

    return { win: false, cells: [] };
}

function getCellsInDirection(row, col, dx, dy) {
    const symbol = gameState.currentPlayer;
    const cells = [[row, col]];

    let r = row + dx;
    let c = col + dy;
    while (r >= 0 && r < gameState.gridSize && c >= 0 && c < gameState.gridSize &&
        gameState.board[r][c] === symbol) {
        cells.push([r, c]);
        r += dx;
        c += dy;
    }

    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < gameState.gridSize && c >= 0 && c < gameState.gridSize &&
        gameState.board[r][c] === symbol) {
        cells.push([r, c]);
        r -= dx;
        c -= dy;
    }

    return cells;
}

function checkDraw() {
    return gameState.board.every(row => row.every(cell => cell !== ''));
}

function handleWin(winningCells) {
    gameState.gameOver = true;
    gameState.winner = gameState.currentPlayer;
    gameState.winningCells = winningCells;

    const currentPlayerData = getCurrentPlayerData();
    currentPlayerData.score++;
    currentPlayerData.gamesPlayed++;

    const otherPlayerData = getOtherPlayerData();
    otherPlayerData.gamesPlayed++;

    winningCells.forEach(([row, col], index) => {
        setTimeout(() => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
        }, index * 150);
    });

    updatePlayerCards();
    createVictoryParticles();
    playerNameManager.savePlayerData();

    setTimeout(() => {
        const winnerName = getCurrentPlayerData().name;
        showGameEndModal('🏆', `${winnerName} Wins!`, 'Congratulations on your victory!');
    }, 1500);
}

function handleDraw() {
    gameState.gameOver = true;
    gameState.winner = null;

    gameState.player1.gamesPlayed++;
    gameState.player2.gamesPlayed++;

    updatePlayerCards();
    playerNameManager.savePlayerData();

    setTimeout(() => {
        showGameEndModal('🤝', "It's a Draw!", 'Great game! Both players played well.');
    }, 800);
}

function getCurrentPlayerData() {
    return gameState.currentPlayer === gameState.player1.symbol ?
        gameState.player1 : gameState.player2;
}

function getOtherPlayerData() {
    return gameState.currentPlayer === gameState.player1.symbol ?
        gameState.player2 : gameState.player1;
}

function updatePlayerCards() {
    elements.player1Card.classList.remove('active', 'winner');
    elements.player2Card.classList.remove('active', 'winner');
    elements.player1Status.className = 'player-status';
    elements.player2Status.className = 'player-status';

    if (gameState.gameOver) {
        if (gameState.winner) {
            const isPlayer1Winner = gameState.winner === gameState.player1.symbol;

            if (isPlayer1Winner) {
                elements.player1Card.classList.add('winner');
                elements.player1Status.textContent = '🏆 Winner!';
                elements.player1Status.className = 'player-status winner';
                elements.player2Status.textContent = 'Good game!';
            } else {
                elements.player2Card.classList.add('winner');
                elements.player2Status.textContent = '🏆 Winner!';
                elements.player2Status.className = 'player-status winner';
                elements.player1Status.textContent = 'Good game!';
            }
        } else {
            elements.player1Status.textContent = "It's a draw!";
            elements.player2Status.textContent = "It's a draw!";
        }
    } else {
        const isPlayer1Turn = gameState.currentPlayer === gameState.player1.symbol;

        if (isPlayer1Turn) {
            elements.player1Card.classList.add('active');
            elements.player1Status.textContent = 'Your Turn';
            elements.player1Status.className = 'player-status active';
            elements.player2Status.textContent = 'Waiting...';
        } else {
            elements.player2Card.classList.add('active');
            if (gameState.gameMode === 'pvc' && !gameState.isAiThinking) {
                elements.player2Status.textContent = 'AI Turn';
            } else if (gameState.isAiThinking) {
                elements.player2Status.textContent = 'Thinking...';
            } else {
                elements.player2Status.textContent = 'Your Turn';
            }
            elements.player2Status.className = 'player-status active';
            elements.player1Status.textContent = 'Waiting...';
        }
    }

    elements.player1Score.textContent = gameState.player1.score;
    elements.player1Games.textContent = gameState.player1.gamesPlayed;
    elements.player2Score.textContent = gameState.player2.score;
    elements.player2Games.textContent = gameState.player2.gamesPlayed;
}

function showPreview(cell) {
    if (!gameState.gameOver && !cell.classList.contains('filled') && !gameState.isAiThinking) {
        cell.textContent = gameState.currentPlayer;
        cell.classList.add('preview');
        cell.style.transform = 'scale(0.9)';
    }
}

function hidePreview(cell) {
    if (cell.classList.contains('preview')) {
        cell.textContent = '';
        cell.classList.remove('preview');
        cell.style.transform = 'scale(1)';
    }
}

function createVictoryParticles() {
    const colors = ['#4facfe', '#f093fb', '#43e97b', '#fa709a', '#667eea'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (2 + Math.random() * 2) + 's';

            elements.victoryParticles.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 4000);
        }, i * 30);
    }
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === gameState.player1.symbol ?
        gameState.player2.symbol : gameState.player1.symbol;
}

function updateDisplay() {
    const currentPlayerData = getCurrentPlayerData();
    elements.currentPlayer.textContent = currentPlayerData.name;

    elements.gridInfo.textContent = `${gameState.gridSize}×${gameState.gridSize}`;
    elements.winInfo.textContent = gameState.winCondition;

    elements.player1Symbol.textContent = gameState.player1.symbol;
    elements.player2Symbol.textContent = gameState.player2.symbol;

    if (gameState.gameMode === 'pvc') {
        elements.aiDifficulty.style.display = 'block';
        elements.difficultyValue.textContent = gameState.aiDifficulty.charAt(0).toUpperCase() + gameState.aiDifficulty.slice(1);
    } else {
        elements.aiDifficulty.style.display = 'none';
    }

    updatePlayerCards();
}

function newGame() {
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.winningCells = [];
    gameState.currentPlayer = gameState.player1.symbol;
    gameState.isAiThinking = false;

    elements.victoryParticles.innerHTML = '';

    createBoard();
    hideGameEndModal();
    updateDisplay();
}

function openSettings() {
    elements.settingsModal.classList.add('show');

    elements.gridSize.value = gameState.gridSize;
    elements.winCondition.value = gameState.winCondition;
    elements.player1SymbolSelect.value = gameState.player1.symbol;
    elements.player2SymbolSelect.value = gameState.player2.symbol;
    elements.aiDifficultySelect.value = gameState.aiDifficulty;

    if (gameState.gameMode === 'pvc') {
        elements.aiDifficultyGroup.style.display = 'block';
    } else {
        elements.aiDifficultyGroup.style.display = 'none';
    }

    updateWinConditionOptions();
}

function closeSettings() {
    elements.settingsModal.classList.remove('show');
}

function updateWinConditionOptions() {
    const gridSize = parseInt(elements.gridSize.value);
    const winConditionSelect = elements.winCondition;
    const currentValue = winConditionSelect.value;

    winConditionSelect.innerHTML = '';

    for (let i = 3; i <= gridSize; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} in a row`;
        winConditionSelect.appendChild(option);
    }

    if (currentValue <= gridSize && currentValue >= 3) {
        winConditionSelect.value = currentValue;
    } else {
        winConditionSelect.value = Math.min(3, gridSize);
    }
}

function applySettings() {
    const newGridSize = parseInt(elements.gridSize.value);
    const newWinCondition = parseInt(elements.winCondition.value);
    const newPlayer1Symbol = elements.player1SymbolSelect.value;
    const newPlayer2Symbol = elements.player2SymbolSelect.value;
    const newAiDifficulty = elements.aiDifficultySelect.value;

    if (newPlayer1Symbol === newPlayer2Symbol) {
        showGameEndModal('⚠️', 'Invalid Settings', 'Players must have different symbols!');
        return;
    }

    gameState.gridSize = newGridSize;
    gameState.winCondition = newWinCondition;
    gameState.player1.symbol = newPlayer1Symbol;
    gameState.player2.symbol = newPlayer2Symbol;
    gameState.currentPlayer = gameState.player1.symbol;
    gameState.aiDifficulty = newAiDifficulty;
    aiEngine = new AIEngine(gameState.aiDifficulty);

    if (gameState.gameMode === 'pvc') {
        gameState.player2.name = `AI (${gameState.aiDifficulty.charAt(0).toUpperCase() + gameState.aiDifficulty.slice(1)})`;
        elements.player2Name.value = gameState.player2.name;
    }

    saveSettings();
    newGame();
    closeSettings();
}

function saveSettings() {
    const settings = {
        gridSize: gameState.gridSize,
        winCondition: gameState.winCondition,
        player1Symbol: gameState.player1.symbol,
        player2Symbol: gameState.player2.symbol,
        aiDifficulty: gameState.aiDifficulty,
        gameMode: gameState.gameMode
    };
    try {
        localStorage.setItem('nexusTicTacToeSettings', JSON.stringify(settings));
    } catch (error) {
        console.warn('Could not save settings');
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('nexusTicTacToeSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            gameState.gridSize = settings.gridSize || 3;
            gameState.winCondition = settings.winCondition || 3;
            gameState.player1.symbol = settings.player1Symbol || 'X';
            gameState.player2.symbol = settings.player2Symbol || 'O';
            gameState.currentPlayer = gameState.player1.symbol;
            gameState.aiDifficulty = settings.aiDifficulty || 'medium';
            gameState.gameMode = settings.gameMode || 'pvp';
            aiEngine = new AIEngine(gameState.aiDifficulty);

            // Update mode buttons
            elements.modeButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === gameState.gameMode) {
                    btn.classList.add('active');
                }
            });
        }
    } catch (error) {
        console.warn('Could not load settings');
    }
}

function showGameEndModal(icon, title, message) {
    elements.gameEndIcon.textContent = icon;
    elements.gameEndTitle.textContent = title;
    elements.gameEndMessage.textContent = message;
    elements.gameEndModal.classList.add('show');
}

function hideGameEndModal() {
    elements.gameEndModal.classList.remove('show');
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initGame();
    }, 100);
});
