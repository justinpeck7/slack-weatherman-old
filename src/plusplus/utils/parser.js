'use strict';

const isValidInput = input => input.length === 2 && !!input[1].match(/\+{2}|-{2}/);

const getUserMatch = input => input.match(/(?:<@)(.*?)(?:>)/); 

const getTarget = (input, users) => {
    const userMatch = getUserMatch(input);
    if (!!userMatch) {
        return users[userMatch[1]];
    }
    return input.replace('@', '');
};

const getUserId = input => {
    const userMatch = getUserMatch(input);
    if (!!userMatch) {
        return userMatch[1];
    }
    return null;
};


module.exports = {
    getTarget,
    getUserId,
    isValidInput,
    getUserMatch
};