const http = require('http');
const { onRequest } = require('./router.js');

// Just the basics here
const port = process.env.PORT || process.env.NODE_PORT || 3000;
http.createServer(onRequest).listen(port);
