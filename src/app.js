const express = require('express');
const callController = require('./controllers/callController');

const app = express();
app.use(express.json());

app.get('/call/:number', callController.makeCall);
app.post('/make-call', callController.makeCall);

module.exports = app;