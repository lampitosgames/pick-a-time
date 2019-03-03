const qs = require('qs');
const uuidv1 = require('uuid/v1');

// Define a set of user colors. Clone into every event. 
//If we run out, they'll be randomly generated
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

const events = {
  debug: {
    eventID: 'debug',
    name: 'Debug Event',
    desc: 'Debug description. This is just the test data',
    startDate: '2019-03-04',
    endDate: '2019-03-14',
    people: {},
    unusedColors: userColors.map((c) => c)
  },
};

const addEvent = (req, res, body) => {
  const eventID = uuidv1();
  events[eventID] = {
    eventID,
    name: body.name,
    desc: body.desc,
    startDate: body.startDate,
    endDate: body.endDate,
    people: {},
    unusedColors: userColors.map((c) => c)
  };
  res.writeHead(201, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify({
    message: 'Created event successfully',
    id: eventID,
  }));
  res.end();
};

const addPerson = (req, res, body) => {
  const { eventID } = body;
  const newPerson = {
    name: body.person,
    // Random color - https://css-tricks.com/snippets/javascript/random-hex-color/
    color: events[eventID].unusedColors.length > 0 ? events[eventID].unusedColors.pop() : `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    times: [],
  };
  events[eventID].people[newPerson.name] = newPerson;
  res.writeHead(201, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify(newPerson));
  res.end();
};

const deletePerson = (req, res, body) => {
  const { eventID } = body;
  events[eventID].unusedColors.push(events[eventID].people[body.person].color);
  delete events[eventID].people[body.person];
  res.writeHead(204, { 'Content-Type': 'text/json' });
  res.end();
};

const getEvent = (req, res) => {
  const queryVals = qs.parse(req.url.split('?')[1]);
  res.writeHead(200, { 'Content-Type': 'text/json' });
  if (Object.prototype.hasOwnProperty.call(queryVals, 'id') && events[queryVals.id]) {
    res.write(JSON.stringify(events[queryVals.id]));
  } else {
    res.write(JSON.stringify({ message: 'no event with specified ID' }));
  }
  res.end();
};

module.exports = {
  addEvent,
  getEvent,
  addPerson,
  deletePerson,
};