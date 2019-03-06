const http = require('http');
const mongoose = require('mongoose');
const { onRequest } = require('./router.js');

// Just the basics here
const port = process.env.PORT || process.env.NODE_PORT || 3000;
// Mongodb url
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/pick-a-time';
mongoose.connect(dbURL, { useNewUrlParser: true }, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});
mongoose.Promise = global.Promise;

http.createServer(onRequest).listen(port);