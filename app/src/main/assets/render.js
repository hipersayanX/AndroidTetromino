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

function TetrominoRender(tetrominoCanvasId,
                      nextPieceCanvasId,
                      boardWidth,
                      boardHeight,
                      nextPieceWidth,
                      nextPieceHeight,
                      backgroundColor) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.nextPieceWidth = nextPieceWidth;
    this.nextPieceHeight = nextPieceHeight;
    this.backgroundColor = backgroundColor;
    this.resized = function() {};

    // Configure the Tetromino canvas.
    this.tetrominoCanvas = document.getElementById(tetrominoCanvasId);
    this.tetrominoContext = null;

    if (this.tetrominoCanvas.getContext)
        this.tetrominoContext = this.tetrominoCanvas.getContext("2d");

    // Configure the next piece canvas.
    this.nextPieceCanvas = document.getElementById(nextPieceCanvasId);
    this.nextPieceContext = null;

    if (this.nextPieceCanvas.getContext)
        this.nextPieceContext = this.nextPieceCanvas.getContext("2d");

    // Listen to the window resize event.
    window.addEventListener('resize', () => this.onResize(), false);
    this.onResize();
}

TetrominoRender.prototype.setResizedCallback = function(callback) {
    this.resized = callback;
}

TetrominoRender.prototype.onResize = function() {
    this.resized();
}

// Draw the board in the Tetromino canvas.
TetrominoRender.prototype.render = function(width, height, board) {
    var blockWidth = this.tetrominoCanvas.width / width;
    var blockHeight = this.tetrominoCanvas.height / height;

    for (var y = 0; y < height; y++) {
        var line = y * width;

        for (var x = 0; x < width; x++) {
            this.tetrominoContext.fillStyle =
                '#' + board[x + line].toString(16).padStart(6, '0');
            this.tetrominoContext.fillRect(x * blockWidth,
                                        y * blockHeight,
                                        blockWidth,
                                        blockHeight);
        }
    }
}

// Draw the next piece on it's canvas.
TetrominoRender.prototype.renderNextPiece = function(width, height, form, color) {
    this.nextPieceContext.fillStyle = this.backgroundColor;
    this.nextPieceContext.fillRect(0,
                                   0,
                                   this.nextPieceCanvas.width,
                                   this.nextPieceCanvas.height);

    var blockWidth =
            Math.max(this.nextPieceCanvas.width, this.nextPieceCanvas.height)
            / Math.max(this.nextPieceWidth, this.nextPieceHeight);
    var blockHeight = blockWidth;
    var blockSize = blockWidth;

    var x0 = (this.nextPieceCanvas.width - width * blockSize) / 2;
    var y0 = (this.nextPieceCanvas.height - height * blockSize) / 2;

    for (var y = 0; y < height; y++) {
        var line = y * width;

        for (var x = 0; x < width; x++)
            if (form[x + line]) {
                this.nextPieceContext.fillStyle =
                    '#' + color.toString(16).padStart(6, '0');
                this.nextPieceContext.fillRect(x0 + x * blockWidth,
                                               y0 + y * blockHeight,
                                               blockWidth,
                                               blockHeight);
            }
    }
}
