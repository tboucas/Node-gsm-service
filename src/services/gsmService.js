const GSM = require('nodegsm');
const gsm = new GSM('/dev/ttyUSB3');
const timeout = require('../utils/timeout');
const messageService = require('../services/messageService');

const callsQueue = [];
let isCalling = false;

const initialize = async () => {
    console.log('Connecting to serial modem...');
    await gsm.connect();
    console.log('Connected to serial modem');
    await gsm.check();
    console.log('Modem OK\n');

    console.log('Modem Information:');
    console.log(`    Manufacturer: ${await gsm.getManufacturerInformation()}`);
    console.log(`    Model ID: ${await gsm.getModelIdentification()}`);
    console.log(`    Version: ${await gsm.getRevisionIdentification()}`);
    console.log(`    Serial: ${await gsm.getSerialNumber()}`);
    console.log('');

    console.log('Network Information:');
    console.log(`    Carrier: ${await gsm.getCurrentOperator()}`);
    console.log(`    Signal: ${(await gsm.getSignalQuality()).description}`);
    console.log(`    Subscriber ID: ${await gsm.getSubscriberId()}`);
    console.log(`    Phone Number: ${await getPhoneNumber() || 'Unknown'}`);

    handleModemEvents();
};

const handleModemEvents = async () => {
    while (true) {
        await handleUnreadMessages();
        await handleCallQueue();
        await timeout(2000);
    }
};

const handleUnreadMessages = async () => {
    try {
        const unreadMessages = await gsm.readSMS(GSM.MessageStorage.sim, GSM.MessageFilter.unread);
        if (unreadMessages.length > 0) {
            for (let msg of unreadMessages) {
                console.log(`From ${msg.sender} at ${msg.time.toISOString()}:`);
                console.log(`${msg.text}\n\n`);
                await messageController.processReceivedMessage(msg);
            }
            await gsm.deleteAllMessages(GSM.MessageStorage.sim, GSM.MessageDeleteFilter.readSentAndUnsent);
        }
    } catch (err) {
        console.error('Error handling unread messages:', err);
    }
};

const handleCallQueue = async () => {
    if (callsQueue.length > 0 && !isCalling) {
        const number = callsQueue.shift();
        await makeCall(number);
    }
};

const makeCall = async (number) => {
    console.log(`Calling ${number}...`);
    isCalling = true;
    try {
        await gsm.dialVoice(number);
        await timeout(9000); // Wait for the call duration
        await gsm.hangup();
        console.log(`Ended call to ${number}`);
        return;
    } catch (err) {
        throw new Error(err);
    } finally {
        isCalling = false;
    }
};

const addNumberToQueue = (number) => {
    callsQueue.push(number);
};

const getPhoneNumber = async () => {
    try {
        return await gsm.getSubscriberNumber();
    } catch {
        try {
            const result = await gsm.readPhoneBook(GSM.PhoneBookStorage.ownNumber, 1, 1);
            return result[0]?.number;
        } catch (err) {
            console.error('Error getting phone number:', err);
        }
    }
};

const processReceivedMessage = async (msg) => {
    try {
        const response = await messageService.sendMessage(msg);
        console.log('Message received successfully:', response.data);
    } catch (err) {
        console.error('Error processing received message:', err);
    }
};

module.exports = {
    initialize,
    makeCall,
    addNumberToQueue
};
