'use strict';

const secrets = require('./config/secrets'),
    commands = require('./commands/commands'),
    token = secrets.slack_token,
    botkit = require('botkit'),
    dns = require('dns'),
    logStream = require('fs').createWriteStream(require('path').resolve(__dirname, 'logging/log.txt')),
    controller = botkit.slackbot();

let weatherman;

const startBot = () => {
    logStream.write('Starting\n');
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
                logStream.write('Connection found, restarting bot...\n');
                startBot();
                clearInterval(intervalID);
            }
        });
    }, 30000);
});

controller.hears('!commands', 'ambient,direct_message', (bot, message) => {
    const cmds = `How to order me around:
    !weather [zipcodes]
    !forecast [day] [zipcode]
    !define [word]
    !leaderboard
    !eval [javascript]
    [name] ++|--

    Trivia:
    !trebek -- get new question
    !question -- show current question
    !answer -- show answer to current question`;

    bot.reply(message, cmds);
});

controller.on('direct_mention', commands.sendMessage);
controller.hears('!weather', 'ambient,direct_message', commands.weather);
controller.hears('!forecast', 'ambient,direct_message', commands.forecast);
controller.hears('!eval', 'ambient,direct_message', commands.evaluate);
controller.hears('!define', 'ambient,direct_message', commands.define);
controller.hears('!say', 'direct_message', commands.say);
controller.hears('!leaderboard', 'ambient,direct_message', commands.showLeaderboard);
controller.hears('\\+\\+', 'ambient,direct_message', commands.addRep);
controller.hears('--', 'ambient,direct_message', commands.subtractRep);
controller.hears('!trebek', 'ambient,direct_message', commands.getNewQuestion);
controller.hears('!question', 'ambient,direct_message', commands.getQuestion);
controller.hears('!answer', 'ambient,direct_message', commands.getAnswer);
