// Init global app object
const app = {};

// When all scripts load, initialize the app
$(document).ready(() => {
  // Initialize all modules
  app.keys.init();
  app.pagescript.init();
});
