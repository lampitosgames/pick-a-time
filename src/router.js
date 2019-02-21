const fs = require('fs');
const path = require('path');
const url = require('url');

const sendError = (req, res, errorNumber, id, message) => {
  res.writeHead(errorNumber, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify({ id, message }));
  res.end();
};

const indexHTML = fs.readFileSync(`${__dirname}/../client/index.html`);
const getIndex = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(indexHTML);
  res.end();
};

const sendStaticFile = (req, res, parsedURL) => {
  // Host static files from the client directory
  const stream = fs.createReadStream(path.join(__dirname, '../', parsedURL.pathname));
  stream.on('error', () => {
    sendError(req, res, 404, 'notFound', 'Resource not found');
  });
  stream.pipe(res);
};

const onRequest = (req, res) => {
  const { method } = req;
  const parsedURL = url.parse(req.url);
  const body = [];

  req.on('data', chunk => body.push(chunk)).on('end', () => {
    // GET or HEAD request
    if (method === 'GET' || method === 'HEAD') {
      // Index
      if (parsedURL.pathname === '/') {
        getIndex(req, res);
        // If the path is fetching files from the client folder, serve static files
      } else if (/(\/client\/).+/.test(parsedURL.pathname)) {
        sendStaticFile(req, res, parsedURL);
      } else {
        sendError(req, res, 404, 'notFound', 'The page/resource/endpoint you are looking for cannot be found');
      }
      // Post request
    } else if (method === 'POST') {
      // Parse body of request
      // IMPORT PARSE FROM QUERYSTRING: body = parse(Buffer.concat(body).toString());
      sendError(req, res, 500, 'serverError', 'POST not implemented yet');
    }
  });
};

module.exports = { onRequest };
