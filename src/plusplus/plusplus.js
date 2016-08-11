'use strict';

const jsonfile = require('jsonfile'),
    parser = require('./utils/parser'),
    storageFile = require('path').resolve(__dirname, 'data/rankings.json');

const getRanks = () => {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(storageFile, (err, stored) => {
            if (!err) {
                resolve(stored);
            }
            else {
                reject(err);
            }
        });
    });
}

const updateRanks = obj => {
    return new Promise((resolve, reject) => {
        jsonfile.writeFile(storageFile, obj, err => {
            if (!err) {
                resolve();
            }
            else {
                reject(err);
            }
        });
    });
};

const updateRep = (message, users, add) => {
    const text = message.text.split(' ');

    const target = parser.getTarget(text[0], users),
        sameUser = parser.getUserId(text[0]) === message.user
            || target.toLowerCase() === users[message.user];

    return new Promise((resolve, reject) => {
        getRanks().then(stored => {
            if (stored[target] === undefined) {
                stored[target] = 0;
            }
            if (add && !sameUser) {
                stored[target] = stored[target] + 1;
            }
            else {
                stored[target] = stored[target] - 1;
            }
            updateRanks(stored).then(() => {
                resolve({ user: target, rank: stored[target], sameUser: sameUser });
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err)
        });
    });
};

module.exports = {
    getRanks,
    updateRanks,
    updateRep
};