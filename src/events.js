const qs = require('qs');
const uuidv1 = require('uuid/v1');

const events = {};

const addEvent = (req, res, body) => {
  const eventID = uuidv1();
  events[eventID] = {
    eventID,
    name: body.name,
    desc: body.desc,
    startDate: body.startDate,
    endDate: body.endDate,
    people: {},
  };
  res.writeHead(201, { 'Content-Type': 'text/json' });
  res.write(JSON.stringify({
    message: 'Created event successfully',
    id: eventID,
  }));
  res.end();
};

const getEvent = (req, res) => {
  const queryVals = qs.parse(req.url.split('?')[1]);
  res.writeHead(200, { 'Content-Type': 'text/json' });
  if (Object.prototype.hasOwnProperty.call(queryVals, 'id') && events[queryVals.id]) {
    res.write(JSON.stringify(events[queryVals.id]));
  } else {
    res.write(JSON.stringify({ message: 'invalid params' }));
  }
  res.end();
};

module.exports = {
  addEvent,
  getEvent,
};
