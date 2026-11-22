// Midnight Vault — keyboard and mouse input in one small module.
// WASD or arrows to sneak, click to walk to a point, E to interact
// (crack the vault, cut a camera feed), Enter to start, R to retry.

export function createInput(canvas, toWorld) {
  const input = {
    keys: new Set(),
    clickTarget: null,
    interactHeld: false,
    pressed: new Set(),
    toWorld,
  };

  const KEY_ALIASES = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
  };

  function onKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    input.keys.add(event.code);
    input.pressed.add(event.code);
    if (event.code === 'KeyE') input.interactHeld = true;
    const alias = KEY_ALIASES[event.code];
    if (alias) input.keys.add(alias);
  }

  function onKeyUp(event) {
    input.keys.delete(event.code);
    if (event.code === 'KeyE') input.interactHeld = false;
    const alias = KEY_ALIASES[event.code];
    if (alias) input.keys.delete(alias);
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    input.clickTarget = input.toWorld(px, py);
  }

  function onBlur() {
    input.keys.clear();
    input.interactHeld = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('mousedown', onMouseDown);

  input.moveVector = function moveVector() {
    let x = 0;
    let y = 0;
    if (input.keys.has('left')) x -= 1;
    if (input.keys.has('right')) x += 1;
    if (input.keys.has('up')) y -= 1;
    if (input.keys.has('down')) y += 1;
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  };

  input.hasMovementKeys = function hasMovementKeys() {
    return input.keys.has('left') || input.keys.has('right') || input.keys.has('up') || input.keys.has('down');
  };

  input.wasPressed = function wasPressed(code) {
    return input.pressed.has(code);
  };

  input.clearPressed = function clearPressed() {
    input.pressed.clear();
  };

  input.setClickTarget = function setClickTarget(point) {
    input.clickTarget = point;
  };

  return input;
}
