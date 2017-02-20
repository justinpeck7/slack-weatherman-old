const request = require('request'),
    questionApi = require('../services/services').jeopardyApi(),
    defaultResponse = 'No Current Question',
    months = [
        'January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novemeber', 'December'
    ];

let currentQ;

const getNewQuestion = () => {
    return new Promise((resolve, reject) => {
        request(questionApi, (err, res, body) => {
            if (!err) {
                currentQ = JSON.parse(body)[0];
                resolve(currentQ.question);
            } else {
                reject(err);
            }
        });
    });
};

const getQuestion = () => { 
    if (currentQ !== undefined) {
        const airdate = new Date(currentQ.airdate);
        return {
            question: currentQ.question,
            points: currentQ.value,
            airdate: `${months[airdate.getMonth()]} ${airdate.getFullYear()}`
        };
    }
    return defaultResponse;
};

const getAnswer = () => {
    if (currentQ !== undefined) {
        return currentQ.answer;
    }
    return defaultResponse;
}

module.exports = {
    getNewQuestion,
    getQuestion,
    getAnswer
};