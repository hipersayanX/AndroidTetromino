/* Tetris-based Android web application example
 * Copyright (C) 2023  Gonzalo Exequiel Pedone
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function TetrominoPiece(boardWidth,
                     boardHeight,
                     form) {
    // Always start with the center of the piece at the middle top.
    // The center is a floating point variable so when rotating the figure,
    // it will keep the figure always in the same position.
    this.cx = boardWidth / 2;
    this.cy = 0;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;

    // Deep copy the piece form.
    this.form = JSON.parse(JSON.stringify(form));
}

TetrominoPiece.prototype.copy = function() {
    var piece = new TetrominoPiece(this.boardWidth,
                                this.boardHeight,
                                this.form);
    piece.cx = this.cx;
    piece.cy = this.cy;

    return piece;
}

TetrominoPiece.prototype.position = function() {
    // Calculate the top-left drawing point of the figure.
    var x = Math.floor(this.cx - this.form.width  / 2);
    var y = Math.floor(this.cy - this.form.height / 2);

    return {x: x, y: y}
}

TetrominoPiece.prototype.visualPosition = function() {
    // Calculate the top-left drawing point of the figure,
    // clampped inside of the board.
    var position = this.position();

    var x = Math.min(Math.max(0, position.x),
                     this.boardWidth  - this.form.width );
    var y = Math.min(Math.max(0, position.y),
                     this.boardHeight - this.form.height);

    return {x: x, y: y}
}

TetrominoPiece.prototype.moveLeft = function() {
    this.cx -= 1;
}

TetrominoPiece.prototype.moveRight = function() {
    this.cx += 1;
}

TetrominoPiece.prototype.advance = function() {
    this.cy += 1;
}

TetrominoPiece.prototype.rotateLeft = function() {
    // Do a simple matrix transpose for rotating the figure.
    var form = Array(this.form.height, this.form.width).fill(0);

    for (var y = 0; y < this.form.height; y++)
        for (var x = 0; x < this.form.width; x++) {
            var rx = y;
            var ry = this.form.width - x - 1;
            form[rx + ry * this.form.height] =
                this.form.form[x + y * this.form.width];
        }

    var width = this.form.height;
    var height = this.form.width;
    this.form.width = width;
    this.form.height = height;
    this.form.form = form;
}

TetrominoPiece.prototype.rotateRight = function() {
    // Do a simple matrix transpose for rotating the figure.
    var form = Array(this.form.height, this.form.width).fill(0);

    for (var y = 0; y < this.form.height; y++)
        for (var x = 0; x < this.form.width; x++) {
            var rx = this.form.height - y - 1;
            var ry = x;
            form[rx + ry * this.form.height] =
                this.form.form[x + y * this.form.width];
        }

    var width = this.form.height;
    var height = this.form.width;
    this.form.width = width;
    this.form.height = height;
    this.form.form = form;
}

function TetrominoBoard(width,
                     height,
                     linesPerLevel,
                     frameRate,
                     initialMoveTime,
                     incrementPerLevel) {
    this.width = width;
    this.height = height;
    this.board = Array(width * height).fill(0);
    this.forms = [
        {color: 0xff0000,
         width: 4,
         height: 1,
         form: [1, 1, 1, 1]},
        {color: 0x0000ff,
         width: 2,
         height: 2,
         form: [1, 1,
                1, 1]},
        {color: 0x00ff00,
         width: 3,
         height: 2,
         form: [0, 1, 1,
                1, 1, 0]},
        {color: 0x00ffff,
         width: 3,
         height: 2,
         form: [1, 1, 0,
                0, 1, 1]},
        {color: 0xff00ff,
         width: 3,
         height: 2,
         form: [1, 1, 1,
                1, 0, 0]},
        {color: 0xff7f00,
         width: 3,
         height: 2,
         form: [1, 1, 1,
                0, 0, 1]},
        {color: 0xffff00,
         width: 3,
         height: 2,
         form: [1, 1, 1,
                0, 1, 0]}
    ];
    this.nextPiece = null;
    this.currentPiece = null;
    this.timer = {};
    this.events = new TetrominoEventQueue(1);
    this.lines = 0;
    this.level = 0;
    this.score = 0;
    this.paused = false;
    this.linesPerLevel = linesPerLevel;
    this.frameRate = frameRate;
    this.updateTime = 1000 / this.frameRate
    this.initialMoveTime = initialMoveTime;
    this.moveTime =  this.initialMoveTime;
    this.incrementPerLevel = incrementPerLevel;
    this.gameStarted = function() {};
    this.pausedChanged = function(paused) {};
    this.gameOver = function() {};
    this.linesChanged = function(lines) {};
    this.levelChanged = function(level) {};
    this.scoreChanged = function(score) {};
    this.render = function(width, height, board) {};
    this.nextPieceUpdated = function(width, height, form, color) {};
}

TetrominoBoard.prototype.setInputEvent = function(event) {
    this.events.enqueue(event);
}

TetrominoBoard.prototype.setGameStartedCallback = function(callback) {
    this.gameStarted = callback;
}

TetrominoBoard.prototype.setPausedCallback = function(callback) {
    this.pausedChanged = callback;
}

TetrominoBoard.prototype.setGameOverCallback = function(callback) {
    this.gameOver = callback;
}

TetrominoBoard.prototype.setLinesChangedCallback = function(callback) {
    this.linesChanged = callback;
}

TetrominoBoard.prototype.setLevelChangedCallback = function(callback) {
    this.levelChanged = callback;
}

TetrominoBoard.prototype.setScoreChangedCallback = function(callback) {
    this.scoreChanged = callback;
}

TetrominoBoard.prototype.setRenderCallback = function(callback) {
    this.render = callback;
}

TetrominoBoard.prototype.setNextPieceUpdatedCallback = function(callback) {
    this.nextPieceUpdated = callback;
}

TetrominoBoard.prototype.isPaused = function() {
    return this.paused;
}

TetrominoBoard.prototype.setPaused = function(paused) {
    if (this.paused === paused)
        return

    this.paused = paused;
    this.pausedChanged(paused);
}

TetrominoBoard.prototype.linesToScore = function(lines) {
    var level = this.level + 1;

    switch (lines) {
        case 0:
            return 0;

        case 1:
            return 100 * level;

        case 2:
            return 300 * level;

        case 3:
            return 500 * level;

        default:
            return 800 * level;
    }

    return 800 * level;
}

TetrominoBoard.prototype.newPiece = function() {
    var form = this.forms[Math.floor(Math.random() * this.forms.length)];

    return new TetrominoPiece(this.width, this.height, form);
}

TetrominoBoard.prototype.nextPieceSize = function() {
    var width = 0;
    var height = 0;

    for (var i in this.forms) {
        width = Math.max(width, this.forms[i].width);
        height = Math.max(height, this.forms[i].height);
    }

    return {width: width, height: height};
}

// Return the board with the current piece drawed on top of it.
TetrominoBoard.prototype.viewBoard = function() {
    var viewBoard = this.board.map(elem => elem);

    if (this.currentPiece) {
        var position = this.currentPiece.visualPosition();

        for (var y = 0; y < this.currentPiece.form.height; y++) {
            var blockLine = y * this.currentPiece.form.width;
            var boardLine = (y + position.y) * this.width;

            for (var x = 0; x < this.currentPiece.form.width; x++) {
                var bockPixel = x + blockLine;
                var boardPixel = x + position.x + boardLine;

                if (this.currentPiece.form.form[bockPixel])
                    viewBoard[boardPixel] = this.currentPiece.form.color;
            }
        }
    }

    return viewBoard;
}

TetrominoBoard.prototype.moveLeft = function() {
    var currentPiece = this.currentPiece.copy();
    currentPiece.moveLeft();
    var ok = this.canSetPiece(currentPiece);

    if (ok)
        this.currentPiece = currentPiece;

    return ok;
}

TetrominoBoard.prototype.moveRight = function() {
    var currentPiece = this.currentPiece.copy();
    currentPiece.moveRight();
    var ok = this.canSetPiece(currentPiece);

    if (ok)
        this.currentPiece = currentPiece;

    return ok;
}

TetrominoBoard.prototype.advance = function() {
    var currentPiece = this.currentPiece.copy();
    currentPiece.advance();
    var ok = this.canSetPiece(currentPiece);

    if (ok)
        this.currentPiece = currentPiece;

    return ok;
}

TetrominoBoard.prototype.rotateLeft = function() {
    var currentPiece = this.currentPiece.copy();
    currentPiece.rotateLeft();
    var ok = this.canSetPiece(currentPiece);

    if (ok)
        this.currentPiece = currentPiece;

    return ok;
}

TetrominoBoard.prototype.rotateRight = function() {
    var currentPiece = this.currentPiece.copy();
    currentPiece.rotateRight();
    var ok = this.canSetPiece(currentPiece);

    if (ok)
        this.currentPiece = currentPiece;

    return ok;
}

// Check if the piece can be drawed in it's current position,
TetrominoBoard.prototype.canSetPiece = function(piece) {
    var position = piece.position();

    if (position.x < 0
        || position.x > this.width - piece.form.width
        || position.y > this.height - piece.form.height)
        return false;

    var x0 = Math.floor(position.x);
    var y0 = Math.floor(position.y);

    for (var y = 0; y < piece.form.height; y++) {
        var blockLine = y * piece.form.width;
        var boardLine = (y + y0) * this.width;

        for (var x = 0; x < piece.form.width; x++) {
            var blockPixel = x + blockLine;
            var boardPixel = x + x0 + boardLine;

            if (piece.form.form[blockPixel]
                && this.board[boardPixel])
                return false;
        }
    }

    return true;
}

// Clear the filled lines in the board and return the cleared lines.
TetrominoBoard.prototype.clearLines = function() {
    var lines = 0;

    for (var y = this.height - 1; y >= 0; y--) {
        var line = y * this.width;
        var lineIsFilled = true;

        for (var x = 0; x < this.width; x++)
            if (this.board[x + line] == 0) {
                lineIsFilled = false;

                break;
            }

        // Copy top lines, one line below.
        if (lineIsFilled) {
            lines++;

            for (var j = y; j > 0; j--) {
                var line = j * this.width;
                var prevLine = (j - 1) * this.width;

                for (var i = 0; i < this.width; i++) {
                    this.board[i + line] = this.board[i + prevLine];
                    this.board[i + prevLine] = 0;
                }
            }

            y++;
        }
    }

    return lines;
}

// Force a board rendering.
TetrominoBoard.prototype.triggerRender = function() {
    if (this.nextPiece && !this.paused)
        this.nextPieceUpdated(this.nextPiece.form.width,
                              this.nextPiece.form.height,
                              this.nextPiece.form.form,
                              this.nextPiece.form.color)
    else
        this.nextPieceUpdated(0, 0, [], 0)

    if (this.render) {
        var board = this.paused?
            Array(this.width * this.height).fill(0):
            this.viewBoard();

        this.render(this.width, this.height, board);
    }
}

TetrominoBoard.prototype.start = function() {
    this.board = Array(this.width * this.height).fill(0);
    this.nextPiece = this.newPiece();
    this.currentPiece = this.newPiece();
    this.events.clear();
    this.timer = setInterval(() => this.gameLoop(), this.updateTime);
    this.lines = 0;
    this.level = 0;
    this.score = 0;
    this.paused = false;
    this.wasPaused = false;
    this.speedIncrement = this.initialMoveTime;
    this.updateStartTime = new Date();

    this.linesChanged(this.lines);
    this.levelChanged(this.level);
    this.scoreChanged(this.score);
    this.nextPieceUpdated(this.nextPiece.form.width,
                          this.nextPiece.form.height,
                          this.nextPiece.form.form,
                          this.nextPiece.form.color)
    this.gameStarted();
}

TetrominoBoard.prototype.gameLoop = function() {
    if (this.paused) {
        if (!this.wasPaused) {
            this.triggerRender()
            this.wasPaused = true
        }

        return
    } else if (this.wasPaused) {
        this.triggerRender()
        this.wasPaused = false
    }

    // Read the available events and update the board according it.
    var events = this.events.dequeue();

    if (events & TetrominoInputEvent.Advance)
        this.advance();

    if (events & TetrominoInputEvent.MoveLeft)
        this.moveLeft();

    if (events & TetrominoInputEvent.MoveRight)
        this.moveRight();

    if (events & TetrominoInputEvent.RotateLeft)
        this.rotateLeft();

    if (events & TetrominoInputEvent.RotateRight)
        this.rotateRight();

    var currentTime = new Date();

    if (currentTime - this.updateStartTime >= this.moveTime) {
        // If the current piece can't be advanced...
        if (!this.advance()) {
            // Update the board drawing the current piece on it.
            this.board = this.viewBoard();

            // check if there are lines to clear.
            var lines = this.clearLines();

            // Update game scoring.
            this.lines += lines;
            this.linesChanged(this.lines);
            this.level = Math.floor(this.lines / this.linesPerLevel);
            this.levelChanged(this.level);
            this.score += this.linesToScore(lines);
            this.scoreChanged(this.score);

            // Speed up the move if level-up.
            this.moveTime =
                Math.max(this.initialMoveTime
                            * (1 - this.incrementPerLevel * this.level),
                            this.updateTime)

            if (this.canSetPiece(this.nextPiece)) {
                // Set the next piece on the board
                this.currentPiece = this.nextPiece;

                // And get a new one.
                this.nextPiece = this.newPiece();
                this.nextPieceUpdated(this.nextPiece.form.width,
                                      this.nextPiece.form.height,
                                      this.nextPiece.form.form,
                                      this.nextPiece.form.color)
            } else {
                // The board is full, stop the game loop
                // and call fora game over action.
                clearInterval(this.timer);
                this.gameOver();
            }
        }

        this.updateStartTime = currentTime;
    }

    if (this.render)
        this.render(this.width, this.height, this.viewBoard());
}
