'use strict';

const secrets = require('./config/secrets'),
    commands = require('./commands'),
    token = secrets.slack_token,
    botkit = require('botkit'),
    dns = require('dns'),
    logStream = require('fs').createWriteStream(require('path').resolve(__dirname, 'logging/log.txt')),
    controller = botkit.slackbot();
    
let weatherman;

const startBot = function () {
    weatherman = controller.spawn({
        token: token
    }).startRTM();
};

startBot();

controller.on('rtm_close', () => {
    logStream.write(`rtm_close on ${new Date()}\n`)
    const intervalID = setInterval(() => {
        logStream.write('Retrying connection...\n')
        dns.lookupService('8.8.8.8', 80, (error, hostname) => {
            if (!!hostname) {
                logStream.write('Connection found, restarting bot...\n')
                startBot();
                clearInterval(intervalID);
            }
        });
    }, 30000);
});

controller.on('direct_mention', (bot, message) => {
    bot.reply(message, 'Commands:');
    bot.reply(message, '!weather {space separated zipcodes}');
    bot.reply(message, '!forecast {day} {zipcode}');
    bot.reply(message, '!eval {javascript}');
});

controller.hears('!weather', 'ambient,direct_message', commands.weather);
controller.hears('!forecast', 'ambient,direct_message', commands.forecast);
controller.hears('!eval', 'ambient,direct_message', commands.evaluate);
controller.hears('!say', 'direct_message', commands.say);