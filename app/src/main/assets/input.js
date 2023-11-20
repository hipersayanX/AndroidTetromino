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

var TetrominoInputEvent = {
    NoEvent    : 0x0 ,
    Advance    : 0x1 ,
    MoveLeft   : 0x2 ,
    MoveRight  : 0x4 ,
    RotateLeft : 0x8 ,
    RotateRight: 0x10
};

function TetrominoEventQueue(maxEvents) {
    this.queue = [];
    this.maxEvents = maxEvents;
}

TetrominoEventQueue.prototype.enqueue = function(event) {
    if (this.queue.length >= this.maxEvents)
        this.queue.splice(0, 1);

    this.queue.push(event);
}

TetrominoEventQueue.prototype.dequeue = function() {
    if (this.queue.length < 1)
        return TetrominoInputEvent.NoEvent;

    var event = this.queue[0];
    this.queue.splice(0, 1);

    return event;
}

TetrominoEventQueue.prototype.clear = function() {
    this.queue = [];
}

function TetrominoInputEvents() {
    this.events = TetrominoInputEvent.NoEvent;
    this.eventTriggered = function(event) {};
    this.touchMoveThreshold = 24;
    this.lastX = 0;
    this.lastY = 0;

    // Listen to keyboard events.
    document.addEventListener("keydown",
                              (event) => {
                                  const keyName = event.key;
                                  var ok = true;

                                  // Set event associated with the key.
                                  if (keyName === 'ArrowDown')
                                      this.events |= TetrominoInputEvent.Advance;
                                  else if (keyName === 'ArrowLeft')
                                      this.events |= TetrominoInputEvent.MoveLeft;
                                  else if (keyName === 'ArrowRight')
                                      this.events |= TetrominoInputEvent.MoveRight;
                                  else if (keyName === 'a')
                                      this.events |= TetrominoInputEvent.RotateLeft;
                                  else if (keyName === 's'
                                           || keyName === 'ArrowUp')
                                      this.events |= TetrominoInputEvent.RotateRight;
                                  else
                                      ok = false;

                                  if (ok)
                                      this.eventTriggered(this.events);
                              },
                              false);
    document.addEventListener("keyup",
                              (event) => {
                                  const keyName = event.key;
                                  var ok = true;

                                  // Clear event of the given key.
                                  if (keyName === 'ArrowDown')
                                      this.events &= ~TetrominoInputEvent.Advance
                                  else if (keyName === 'ArrowLeft')
                                      this.events &= ~TetrominoInputEvent.MoveLeft
                                  else if (keyName === 'ArrowRight')
                                      this.events &= ~TetrominoInputEvent.MoveRight
                                  else if (keyName === 'a')
                                      this.events &= ~TetrominoInputEvent.RotateLeft
                                  else if (keyName === 's'
                                           || keyName === 'ArrowUp')
                                      this.events &= ~TetrominoInputEvent.RotateRight
                                  else
                                      ok = false;

                                  if (ok)
                                      this.eventTriggered(this.events)
                              },
                              false);

    // Listen to touch events.
    document.addEventListener("touchstart",
                              (event) => {
                                  if (event.touches.length < 1)
                                      return;

                                  // Register current pointer position for
                                  // comparing with the 'touchmove' event.
                                  var touch = event.touches[0];
                                  this.lastX = touch.clientX;
                                  this.lastY = touch.clientY;

                                  // Rotation related event will be registered
                                  // but not triggered until the touch is
                                  // released.
                                  switch (event.touches.length) {
                                  case 1:
                                      this.events =
                                          TetrominoInputEvent.RotateLeft;

                                      break;
                                  case 2:
                                      this.events =
                                          TetrominoInputEvent.RotateRight;

                                      break;

                                  default:
                                      break;
                                  }
                              },
                              false);
    document.addEventListener("touchmove",
                              (event) => {
                                  if (event.touches.length < 1)
                                      return;

                                  // Get current ointer position.
                                  var touch = event.touches[0];
                                  var diffX = touch.clientX - this.lastX;
                                  var diffY = touch.clientY - this.lastY;

                                  // Ignore pointer move bellow the threshold
                                  if (Math.abs(diffX) < this.touchMoveThreshold
                                      && Math.abs(diffY) < this.touchMoveThreshold)
                                      return;

                                  this.lastX = touch.clientX;
                                  this.lastY = touch.clientY;

                                  // Only take the dominant move.
                                  if (Math.abs(diffX) >= Math.abs(diffY))
                                      diffY = 0;
                                  else
                                      diffX = 0;

                                  var ok = false;

                                  // On a touch device, only one event is valid.
                                  if (diffX < 0) {
                                      this.events = TetrominoInputEvent.MoveLeft;
                                      ok = true;
                                  } else if (diffX > 0) {
                                      this.events = TetrominoInputEvent.MoveRight;
                                      ok = true;
                                  } else if (diffY > 0) {
                                      this.events = TetrominoInputEvent.Advance;
                                      ok = true;
                                  }

                                  if (ok)
                                      this.eventTriggered(this.events);
                              },
                              false);
    document.addEventListener("touchend",
                              (event) => {
                                  // Trigger rotation related events
                                  if (this.events & TetrominoInputEvent.RotateLeft
                                      || this.events & TetrominoInputEvent.RotateRight) {
                                      this.eventTriggered(this.events);
                                      this.events = TetrominoInputEvent.NoEvent;
                                  }
                              },
                              false);
    document.addEventListener("touchcancel",
                              (event) => {
                                  if (this.events & TetrominoInputEvent.RotateLeft
                                      || this.events & TetrominoInputEvent.RotateRight) {
                                      this.eventTriggered(this.events);
                                      this.events = TetrominoInputEvent.NoEvent;
                                  }
                              },
                              false);
 }

TetrominoInputEvents.prototype.setEventTriggeredCallback = function(callback) {
    this.eventTriggered = callback;
}
