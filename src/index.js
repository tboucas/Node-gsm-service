const app = require('./app');
const gsmService = require('./services/gsmService');

const port = 4000;
app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});

gsmService.initialize().then(() => {
    console.log('GSM service initialized');
}).catch(console.error);
