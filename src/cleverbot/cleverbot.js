const cleverbot = require('cleverbot.io'),
    secrets = require('../config/secrets.json'),
    cbUser = secrets.cleverbot_user,
    cbKey = secrets.cleverbot_key,
    session = 'Bill';

const bot = new cleverbot(cbUser, cbKey);
bot.setNick(session);

bot.create((err, session) => {
    console.log('Cleverbot connected');
});

let ask = (question) => {
    return new Promise((resolve, reject) => {
        bot.ask(question, (err, response) => {
            if (!err) {
                resolve(response);
            }
            else {
                reject(err);
            }
        });
    });
};

module.exports = {
    ask: ask
};