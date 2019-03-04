/**
 * The keys module.  Lets any other module bind functions to 1 or more key
 * events at a time.  Also handles easy scroll event detection Written by
 * Daniel Timko - 2018
 * (This was not written for Project 1. It is a common module I use in all my
 * client-side js projects)
 */
app.keys = (() => {
  // Object containing key states
  const keys = {};
  const scrollCallbacks = [];

  /**
   * Initialize the keys module and bind keydown and keyup events.
   * Bind mouse events
   */
  function init() {
    // Add an event listener for keydown
    window.addEventListener('keydown', (e) => {
      // If this key isn't in the object, create data for it
      if (typeof (keys[e.keyCode]) === 'undefined') {
        keys[e.keyCode] = {
          pressed: true,
          keyDown: [],
          keyUp: [],
        };
      } else {
        // Set the key to pressed
        keys[e.keyCode].pressed = true;
        // Loop and call all bound functions
        for (let i = 0; i < keys[e.keyCode].keyDown.length; i++) {
          keys[e.keyCode].keyDown[i]();
        }
      }
    });

    // Add an event listener for keyup
    window.addEventListener('keyup', (e) => {
      // If this key isn't in the object, create data for it
      if (typeof (keys[e.keyCode]) === 'undefined') {
        keys[e.keyCode] = {
          pressed: false,
          keyDown: [],
          keyUp: [],
        };
      } else {
        // Set the key to not pressed
        keys[e.keyCode].pressed = false;
        // Loop and call all bound functions
        for (let i = 0; i < keys[e.keyCode].keyUp.length; i++) {
          keys[e.keyCode].keyUp[i]();
        }
      }
    });
    // Add an event listener for mouse wheel events
    window.addEventListener('wheel', (e) => {
      // Cross-browser compatible scroll delta
      const delta = e.wheelDelta !== undefined
        ? e.wheelDelta
        : -1 * e.deltaY;
      // Loop through all callbacks
      for (let i = 0; i < scrollCallbacks.length; i++) {
        // if down
        if (delta < 0) {
          scrollCallbacks[i](-1);
          // if up
        } else if (delta > 0) {
          scrollCallbacks[i](1);
        }
      }
    });
  }

  /**
   * Returns the numerical keycode given a string
   * Does nothing if an integer is passed
   * This only covers the most common keys.  More can be added easily by adding
   * their string to the switch statement
   */
  function getKeyCode(key) {
    let keyCode = key;
    if (typeof key === 'string') {
      // This is probably inefficient
      switch (key) {
        case '=':
          keyCode = 187;
          break;
        case '+':
          keyCode = 187;
          break;
        case '-':
          keyCode = 189;
          break;
        case 'up':
          keyCode = 38;
          break;
        case 'down':
          keyCode = 40;
          break;
        case 'left':
          keyCode = 37;
          break;
        case 'right':
          keyCode = 39;
          break;
        case 'space':
          keyCode = 32;
          break;
        case 'shift':
          keyCode = 16;
          break;
        case 'ctrl':
          keyCode = 17;
          break;
        case 'alt':
          keyCode = 18;
          break;
        case 'tab':
          keyCode = 9;
          break;
        case 'enter':
          keyCode = 13;
          break;
        case 'backspace':
          keyCode = 8;
          break;
        case 'esc':
          keyCode = 27;
          break;
        case 'del':
          keyCode = 46;
          break;
        case 'ins':
          keyCode = 45;
          break;
        case 'windows':
          keyCode = 91;
          break;
        default:
          keyCode = key.toUpperCase().charCodeAt(0);
          break;
      }
    }
    return keyCode;
  }

  /**
   * Bind a function to one or more keys to be called when the key(s) is/are pressed.
   * Accepts char code or a string representing the key(s)
   * The first n arguments are keys to bind to
   * The last argument is the callback function
   */
  function keyDown(...args) {
    // Loop through every argument and add the callback to it
    for (let i = 0; i < args.length - 1; i++) {
      // Get the key code
      const keyCode = getKeyCode(args[i]);
      // If data does not exist for this key, create it
      if (typeof (keys[keyCode]) === 'undefined') {
        keys[keyCode] = {
          pressed: false,
          keyDown: [],
          keyUp: [],
        };
      }
      // Push the callback function to the array
      keys[keyCode].keyDown.push(args[args.length - 1]);
    }
  }

  /**
   * Bind a function to one or more keys to be called when the key(s) is/are released.
   * Accepts char code or a string representing the key(s)
   * The first n arguments are keys to bind to
   * The last argument is the callback function
   */
  function keyUp(...args) {
    // Loop through every argument and add the callback to it
    for (let i = 0; i < args.length - 1; i++) {
      // Get the key code
      const keyCode = getKeyCode(args[i]);
      // If data does not exist for this key, create it
      if (typeof (keys[keyCode]) === 'undefined') {
        keys[keyCode] = {
          pressed: false,
          keyDown: [],
          keyUp: [],
        };
      }
      // Push the callback function to the array
      keys[keyCode].keyUp.push(args[args.length - 1]);
    }
  }

  /**
   * Bind a function to a specific DOM element's key down event
   */
  function keyDownBound(element, key, callback) {
    element.addEventListener('keydown', (e) => {
      if (e.keyCode === getKeyCode(key)) {
        callback();
      }
    });
  }

  /**
   * Bind a function to a specific DOM element's key up event
   */
  function keyUpBound(element, key, callback) {
    element.addEventListener('keyup', (e) => {
      if (e.keyCode === getKeyCode(key)) {
        callback();
      }
    });
  }

  /**
   * Return whether a key is pressed
   * Accepts the char code or a string
   */
  function pressed(key) {
    // Get the key code
    const keyCode = getKeyCode(key);
    // If data does not exist for this key, create it
    if (typeof (keys[keyCode]) === 'undefined') {
      keys[keyCode] = {
        pressed: false,
        keyDown: [],
        keyUp: [],
      };
    }
    // Return whether or not the key is pressed
    return keys[keyCode].pressed;
  }

  /**
   * Binds a function to the mouse scrolling
   * an integer will be passed in to the function to determine direction
   */
  function scroll(callback) {
    scrollCallbacks.push(callback);
  }

  // Export everything
  return {
    init,
    keyUp,
    keyDown,
    keyUpBound,
    keyDownBound,
    pressed,
    scroll,
  };
})();
