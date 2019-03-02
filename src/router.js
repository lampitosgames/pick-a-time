const fs = require('fs');
const path = require('path');
const url = require('url');
const {
  addEvent, getEvent, addPerson, deletePerson,
} = require('./events');

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

const eventHTML = fs.readFileSync(`${__dirname}/../client/eventPage.html`);
const getEventPage = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(eventHTML);
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
  let body = [];

  req.on('data', chunk => body.push(chunk)).on('end', () => {
    // GET or HEAD request
    if (method === 'GET' || method === 'HEAD') {
      // Index
      if (parsedURL.pathname === '/') {
        getIndex(req, res);
      } else if (parsedURL.pathname === '/event') {
        getEventPage(req, res);
      } else if (parsedURL.pathname === '/getEvent') {
        getEvent(req, res);
        // If the path is fetching files from the client folder, serve static files
      } else if (/(\/client\/).+/.test(parsedURL.pathname)) {
        sendStaticFile(req, res, parsedURL);
      } else {
        sendError(req, res, 404, 'notFound', 'The page/resource/endpoint you are looking for cannot be found');
      }
      // Post request
    } else if (method === 'POST') {
      // Parse body of request
      body = JSON.parse(Buffer.concat(body).toString());
      if (parsedURL.pathname === '/newEvent') {
        if (body.titleValue === '' || body.descValue === '' || body.startDate === '' || body.endDate === '') {
          sendError(req, res, 400, 'missingParams', 'Title, description, start, end are all required to create an event.');
          return;
        }
        addEvent(req, res, body);
      } else if (parsedURL.pathname === '/addPerson') {
        if (body.eventID === '' || body.person === '') {
          sendError(req, res, 400, 'missingParams', 'Event ID and persons name are both required to add a person');
          return;
        }
        addPerson(req, res, body);
      } else if (parsedURL.pathname === '/deletePerson') {
        if (body.eventID === '' || body.person === '') {
          sendError(req, res, 400, 'missingParams', 'Event ID and persons name are both required to delete a person');
          return;
        }
        deletePerson(req, res, body);
      } else {
        sendError(req, res, 500, 'serverError', 'POST not implemented yet');
      }
    }
  });
};

module.exports = { onRequest };
