const fs = require('fs');
const path = require('path');
const url = require('url');
const {
  addEvent,
  getEvent,
  addPerson,
  deletePerson,
  setPersonSchedule,
} = require('./events');

// Load html files
const indexHTML = fs.readFileSync(`${__dirname}/../client/index.html`);
const eventHTML = fs.readFileSync(`${__dirname}/../client/eventPage.html`);

/**
 * Helper function to respond to HTTP requests with an error
 * @param  {Request}  req         HTTP Request object
 * @param  {Response} res         HTTP Response object
 * @param  {Int}      errorNumber Error code
 * @param  {String} id            Error ID
 * @param  {String} message       Error Message
 */
const sendError = (req, res, errorNumber, id, message) => {
  res.writeHead(errorNumber, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify({ id, message }));
  res.end();
};

/**
 * GET request handler that returns the index html
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 */
const getIndex = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(indexHTML);
  res.end();
};

/**
 * GET request handler that returns the event page html
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 */
const getEventPage = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(eventHTML);
  res.end();
};

/**
 * GET request handler that serves the rest of the static files in the client directory
 * @param {Request}  req       HTTP Request object
 * @param {Response} res       HTTP Response object
 * @param {String}   parsedURL The URL path from the GET request
 */
const sendStaticFile = (req, res, parsedURL) => {
  // Host static files from the client directory
  const stream = fs.createReadStream(path.join(__dirname, '../', parsedURL.pathname));
  // If there is a stream error for any reason, respond with 404
  stream.on('error', () => {
    sendError(req, res, 404, 'notFound', 'Resource not found');
  });
  stream.pipe(res);
};

/**
 * Main router
 * @param {Request}  req       HTTP Request object
 * @param {Response} res       HTTP Response object
 */
const onRequest = (req, res) => {
  // Wrap router in try/catch so the server can fail without crashing
  try {
    // Get data from the request
    const { method } = req;
    const parsedURL = url.parse(req.url);
    let body = [];

    // Put all the body data into the body array
    // When finished, continue with the request
    req.on('data', chunk => body.push(chunk)).on('end', () => {
      // GET or HEAD request
      if (method === 'GET' || method === 'HEAD') {
        // Index
        if (parsedURL.pathname === '/') {
          getIndex(req, res);
          // Event page
        } else if (parsedURL.pathname === '/event') {
          getEventPage(req, res);
          // Event data
        } else if (parsedURL.pathname === '/getEvent') {
          getEvent(req, res);
          // If the path is fetching files from the client folder, serve static files
        } else if (/(\/client\/).+/.test(parsedURL.pathname)) {
          sendStaticFile(req, res, parsedURL);
          // No valid GET request path, send 404
        } else {
          sendError(req, res, 404, 'notFound', 'The page/resource/endpoint you are looking for cannot be found');
        }
        // Post request
      } else if (method === 'POST') {
        // Parse body of request. If the data is bad or the body doesn't exist at all, send a 400
        // error for missing params
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (err) {
          sendError(req, res, 400, 'missingParams', 'No body sent with the post request or it was missing parameters');
          return;
        }
        // At this point we know for a fact the POST request had a body
        // If this is the create event endpoint
        if (parsedURL.pathname === '/newEvent') {
          // Make sure the params all exist
          if (body.titleValue === '' || body.descValue === '' || body.startDate === '' || body.endDate === '') {
            sendError(req, res, 400, 'missingParams', 'Title, description, start, end are all required to create an event.');
            return;
          }
          // Add the event
          addEvent(req, res, body);
          // Add a person to an event
        } else if (parsedURL.pathname === '/addPerson') {
          if (!body.eventID || !body.person) {
            sendError(req, res, 400, 'missingParams', 'Event ID and persons name are both required to add a person');
            return;
          }
          addPerson(req, res, body);
          // Delete a person from an event
        } else if (parsedURL.pathname === '/deletePerson') {
          if (!body.eventID || !body.person) {
            sendError(req, res, 400, 'missingParams', 'Event ID and persons name are both required to delete a person');
            return;
          }
          deletePerson(req, res, body);
          // Update a person's schedule
        } else if (parsedURL.pathname === '/setPersonSchedule') {
          if (!body.eventID || !body.person) {
            sendError(req, res, 400, 'missingParams', 'Event ID and person\'s name are both required to edit their schedule');
            return;
          }
          setPersonSchedule(req, res, body);
          // 404 not found
        } else {
          sendError(req, res, 404, 'notFound', 'POST endpoint not found');
        }
      }
    });
  } catch (err) {
    sendError(req, res, 500, 'serverError', err);
  }
};

module.exports = { onRequest };
