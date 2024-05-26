const axios = require('axios');
const url = 'http://localhost:3000/message/action';

const sendMessage = async (msg) => {
    try {
        return await axios.post(url, {
            phone_number: msg?.sender ?? '',
            message: msg?.text ?? '',
            time: msg.time.toISOString() ?? ''
        });
    } catch (err) {
        console.error('Error sending message:', err);
        throw err;
    }
};

module.exports = {
    sendMessage
};