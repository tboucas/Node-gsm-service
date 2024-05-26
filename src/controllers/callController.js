const gsmService = require('../services/gsmService');

const makeCall = async (req, res) => {
    const number = req.params.number || req.body.number;
    if (!number) {
        return res.status(400).send('Number is required');
    }

    try {
        gsmService.addNumberToQueue(req.body.number);
        res.status(200).send('Success!');
    } catch(err) {
        res.status(500).send(err);
    }
};

module.exports = {
    makeCall
};
