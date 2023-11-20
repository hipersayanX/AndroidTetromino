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

function main()
{
    var boardWidth = 10;
    var boardHeight = 20;
    var playing = false;
    var paused = false;
    let board =
        new TetrominoBoard(boardWidth,
                        boardHeight,
                        30,    // 30 lines for level-up
                        100,   // Game loop update of 100 frames per second
                        1000,  // Level 0 will start with the piece falling
                               // at 1 block per second
                        0.15); // Speed will increase 15% each level
    let nextPieceSize = board.nextPieceSize();
    let render =
        new TetrominoRender("tetrominoCanvas",
                         "nextPiece",
                         boardWidth,
                         boardHeight,
                         nextPieceSize.width,
                         nextPieceSize.height,
                         "rgb(0, 0, 0)");

    render.setResizedCallback(() => board.triggerRender());
    board.setRenderCallback((width, height, board) => render.render(width, height, board));
    board.setNextPieceUpdatedCallback((width, height, form, color) => render.renderNextPiece(width, height, form, color));

    let inputEvents =
        new TetrominoInputEvents();
    inputEvents.setEventTriggeredCallback((event) => board.setInputEvent(event));

    board.triggerRender()
    var startButton = document.getElementById("startButton");

    if (startButton)
        startButton.onclick = function () {
            if (playing) {
                if (paused) {
                    startButton.innerHTML = "Pause";
                    paused = false
                } else {
                    startButton.innerHTML = "Continue";
                    paused = true
                }

                board.setPaused(paused)
            } else {
                startButton.innerHTML = "Pause";
                playing = true;
                board.start();
                document.getElementById("tetrominoCanvas").focus();
            }
        }

    board.setGameOverCallback(() => {
        playing = false;
        var startButton = document.getElementById("startButton");

        if (startButton) {
            playing = false;
            startButton.innerHTML = "Start";
            startButton.focus();
        }
    });

    // Scoring callbacks
    board.setLinesChangedCallback((lines) => {
        var element = document.getElementById("lines");

        if (element)
            element.innerHTML = lines;
    });
    board.setLevelChangedCallback((level) => {
        var element = document.getElementById("level");

        if (element)
            element.innerHTML = level;
    });
    board.setScoreChangedCallback((score) => {
        var element = document.getElementById("score");

        if (element)
            element.innerHTML = score;
    });
}
