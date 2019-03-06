const qs = require('qs');
const uuidv1 = require('uuid/v1');
const { eventModel } = require('./models/event-model');

// Define a set of user colors. Clone into every event.
// If we run out, they'll be randomly generated
const userColors = [
  '#811b87',
  '#c6a772',
  '#cd6c8e',
  '#642cfc',
  '#5a675e',
  '#1F2041',
  '#60393f',
  '#c40d61',
  '#F55536',
  '#2E6171',
  '#D1900E',
  '#1880e1',
];

// Server state to store individual events
// TODO: Replace with Mongo integration
const events = {};

/**
 * POST request helper for adding an event
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 * @param {Object}   body Params for event construction
 */
const addEvent = (req, res, body) => {
  // Generate a unique ID for the event
  const eventID = uuidv1();
  let newEvent = new eventModel({
    eventID,
    name: body.name,
    desc: body.desc,
    startDate: body.startDate,
    endDate: body.endDate,
    unusedColors: userColors.map(c => c),
    people: {},
  });
  newEvent.save((err) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/json' });
      res.end();
    } else {
      console.dir("created");
      // Return success with the event ID in the body
      res.writeHead(201, { 'Content-Type': 'text/json' });
      res.write(JSON.stringify({
        message: 'Created event successfully',
        id: eventID,
      }));
      res.end();
    }
  });
};

/**
 * POST request handler for adding a person to an event
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 * @param {Object}   body Params for event construction
 */
const addPerson = (req, res, body) => {
  // Pull out body params
  const { eventID, person } = body;
  // Construct a new person object from the body
  const newPerson = {
    name: person,
    // Random color - https://css-tricks.com/snippets/javascript/random-hex-color/
    color: events[eventID].unusedColors.length > 0 ? events[eventID].unusedColors.pop() : `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    times: [],
  };
  // Add the person to the proper event
  events[eventID].people[newPerson.name] = newPerson;
  // Return the person's object so it can easily be added to the client
  res.writeHead(201, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify(newPerson));
  res.end();
};

/**
 * POST request handler for deleting a person from an event
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 * @param {Object}   body Params for event construction
 */
const deletePerson = (req, res, body) => {
  // Pull out body params
  const { eventID, person } = body;
  // Replace the color the person had claimed
  events[eventID].unusedColors.push(events[eventID].people[person].color);
  // Delete the person from the event
  delete events[eventID].people[person];
  // Return success with no body
  res.writeHead(204, { 'Content-Type': 'text/json' });
  res.end();
};

/**
 * POST request handler for updating a person's schedule
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 * @param {Object}   body Params for event construction
 */
const setPersonSchedule = (req, res, body) => {
  // Pull out body params
  const { eventID, person, times } = body;
  // Store the new times array
  events[eventID].people[person].times = times;
  // Respond with the updated person object
  res.writeHead(201, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify(events[eventID].people[person]));
  res.end();
};

/**
 * GET request handler that responds with the specified event data
 * @param {Request}  req  HTTP Request object
 * @param {Response} res  HTTP Response object
 */
const getEvent = (req, res) => {
  // Parse the query parameters (should only be the event ID)
  const queryVals = qs.parse(req.url.split('?')[1]);
  // Ensure the request has the event ID
  if (Object.prototype.hasOwnProperty.call(queryVals, 'id')) {
    // Respond with event data
    eventModel.find({ eventID: queryVals.id }, 'name desc startDate endDate unusedColors people', (err, thisEvent) => {
      if (err) {
        // Else, respond with a 400 error
        res.writeHead(400, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ id: 'missingParams', message: 'no event with specified ID' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(thisEvent._doc));
        console.dir(thisEvent);
      }
      res.end();
    });
  }
};

module.exports = {
  addEvent,
  getEvent,
  addPerson,
  deletePerson,
  setPersonSchedule,
};