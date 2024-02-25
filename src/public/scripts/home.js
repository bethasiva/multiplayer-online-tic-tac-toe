import WebSocket from "./webSocket.js";

function GameBoard() {
    this.el = $('#game-board-page');
    this.playerSymbol = null;
    this.enemySymbol = null;
    this.win = false;  // TRUE if somebody won the game
    this.turnNum = 0; //Number of the current turn
    this.rowNum = null;  // Will contain "row coordinate"for a specific cell
    this.columnNum = null; // Will contain "column coordinate"for a specific cell
    this.pauseGame = false; // Pause the game to simulate the computer thinking about its move."
    this.winner = null;
    this.winnerEl = this.el.find('.winner');
    this.introScreenEl = this.el.find(".intro-screen");
    this.gameScreenEl = this.el.find(".game-screen");
    this.tableCells = this.el.find(".cell");
    this.restartEl = this.el.find(".restart");
    this.username = this.el.find('#username span').text();
    this.possibleWinners = {
        YOU: 'YOU',
        COMPUTER: 'COMPUTER'
    };
    this.possibleSymbols = {
        X: 'X',
        O: 'O'
    };
    this.possibleWinCombinations = {
        VERTICAL: 'VERTICAL',
        HORIZONTAL: 'HORIZONTAL',
        MAIN_DIAGONAL: 'MAIN_DIAGONAL',
        SECONDARY_DIAGONAL: 'SECONDARY_DIAGONAL'
    };
    this.webSocket = new WebSocket();
    this.activateDOM();
}

GameBoard.prototype.setGameSymbols = function (playerSymbol, enemySymbol) {
    this.playerSymbol = playerSymbol;
    this.enemySymbol = enemySymbol;

}

GameBoard.prototype.activateDOM = function () {
    const self = this;

    this.showUIComponent();
    this.el.on('click', function (event) {
        const target = $(event.target);

        if (target.hasClass('choose-x')) {
            self.setGameSymbols(self.possibleSymbols.X, self.possibleSymbols.O);
            self.startGame();
        }
        else if (target.hasClass('choose-o')) {
            self.setGameSymbols(self.possibleSymbols.O, self.possibleSymbols.X);
            self.startGame();
        }
        else if (target.hasClass('restart')) {
            self.restartGame();
        }
        else if (target.hasClass('cell')) {
            self.gameInitiated(event, self);
        }
    });
}

GameBoard.prototype.showUIComponent = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const pageType = urlParams.get('p');

    if (pageType === 'past_games') {
        this.introScreenEl.fadeOut(300);
        this.el.find('.show-all-games-data').fadeIn(300);
    }
    else {
        this.introScreenEl.fadeIn(300);
    }
}

GameBoard.prototype.gameInitiated = function (event, self) {
    const target = event.target;
    // If nobody has won yet and clicked cell is empty
    if (!self.win && target.innerHTML === "" && !this.pauseGame) {
        if (self.turnNum % 2 === 0) { // Even number = your turn
            this.insertSymbol(target, self.playerSymbol);
        }
        else { // Odd number = computer turn
            this.insertSymbol(target, self.enemySymbol);
        }
    }
}

// Inserts a symbol in the clicked cell
GameBoard.prototype.insertSymbol = function (element, symbol) {
    const self = this;

    element.innerHTML = symbol;
    const isEnemy = symbol === this.enemySymbol;
    if (isEnemy) {
        $("#" + element.id).addClass("player-two");
    }
    $("#" + element.id).addClass("cannotuse");  // Show a "disabled" cursor on already occupied cells

    this.checkWinConditions(element);
    this.turnNum++;
    // Game end - If somebody has won or all cells are filled
    if (this.win || this.turnNum > 8) {
        this.restartEl.addClass("btn-green");  // Highlights "restart" button
        this.tableCells.addClass("cannotuse");  // Tells visually you can't interact anymore with the game grid

        if (this.winner) {
            this.handleWinner(this.winner)
        }
        else {
            this.handleWinner('NONE');
        }
    }
    else if (this.turnNum % 2 !== 0) {
        this.pauseGame = true;
        setTimeout(function () {
            self.pauseGame = false;
            self.computerTurn();
        }, 500);
    }
}

GameBoard.prototype.handleWinner = function (winner) {
    this.winnerEl.find('.name').text(winner);
    this.winnerEl.fadeIn(300);
    this.webSocket.handleWinner(winner, this.username, this.insertGameData.bind(this));
}

GameBoard.prototype.insertGameData = function (gameData) {

    if (gameData.data) {
        console.log('Game data:', gameData.data);
    }
    else if (gameData.error) {
        console.log(gameData.error);
    }
}

GameBoard.prototype.startGame = function () {
    this.restartGame();
    this.introScreenEl.fadeOut(300);
    this.showGameScreen();
}

GameBoard.prototype.showGameScreen = function () {
    this.gameScreenEl.fadeIn(300);
    this.gameScreenEl.find('.you').text(this.playerSymbol);
    this.gameScreenEl.find('.computer').text(this.enemySymbol);
}

/* Sets everything to its default value */
GameBoard.prototype.restartGame = function () {
    this.webSocket.leaveRoom();
    this.webSocket.joinRoom();
    this.turnNum = 0;
    this.win = false;
    this.winner = null;
    this.tableCells.text("");
    this.tableCells.removeClass("wincell");
    this.tableCells.removeClass("cannotuse");
    this.tableCells.removeClass("player-two");
    this.restartEl.removeClass("btn-green");
    this.winnerEl.fadeOut(300);
}


/* Check if there's a winning combination in the grid (3 equal symbols in a row/column/diagonal) */
GameBoard.prototype.checkWinConditions = function (element) {

    // Retrieve cell coordinates from clicked button id
    this.rowNum = element.id[4];
    this.columnNum = element.id[5];

    if (this.checkWinningCombinationHelper(this.possibleWinCombinations.VERTICAL, element) || // 1) VERTICAL check
        this.checkWinningCombinationHelper(this.possibleWinCombinations.HORIZONTAL, element) || // 2) HORIZONTAL check
        this.checkWinningCombinationHelper(this.possibleWinCombinations.MAIN_DIAGONAL, element) || // 3) MAIN DIAGONAL check
        this.checkWinningCombinationHelper(this.possibleWinCombinations.SECONDARY_DIAGONAL, element)) { // 4) SECONDARY DIAGONAL check
        return
    }
}

/* Check if there's a winning combination */
GameBoard.prototype.checkWinningCombinationHelper = function (combinationType, element) {
    if (!combinationType) {
        return false;
    }

    this.win = true;
    const cells = [];
    for (let i = 0; i < 3; i++) {
        let cellElement = null;
        if (combinationType === this.possibleWinCombinations.VERTICAL) {
            cellElement = this.el.find("#cell" + i + this.columnNum);
        }
        else if (combinationType === this.possibleWinCombinations.HORIZONTAL) {
            cellElement = this.el.find("#cell" + this.rowNum + i);
        }
        else if (combinationType === this.possibleWinCombinations.MAIN_DIAGONAL) {
            cellElement = this.el.find("#cell" + i + i);
        }
        else if (combinationType === this.possibleWinCombinations.SECONDARY_DIAGONAL) {
            cellElement = this.el.find("#cell" + i + (2 - i));
        }

        cells.push(cellElement);
        if (cellElement.text() !== element.innerHTML) {
            this.win = false;
            break; // No need to continue checking if a mismatch is found
        }
    }
    if (this.win) {
        cells.forEach(function (cell) {
            cell.addClass("wincell");
        });
        if (this.turnNum % 2 === 0) {
            this.winner = this.possibleWinners.YOU;
        }
        else {
            this.winner = this.possibleWinners.COMPUTER;
        }

        return true;
    }
    return false;
}

// Simple COMPUTER (clicks a random empty cell)
GameBoard.prototype.computerTurn = function () {
    let cell = null;
    while (true) {
        this.rowNum = Math.floor(Math.random() * 3);
        this.columnNum = Math.floor(Math.random() * 3);
        cell = $("#cell" + this.rowNum + this.columnNum);
        if (cell.text() === "") {
            // We have found it! Stop looking for an empty cell
            break;
        }
    }

    cell.click(); // Emulate a click on the cell
}


new GameBoard();