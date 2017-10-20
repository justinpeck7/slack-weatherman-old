const parseXML = require('xml2js').parseString;
const request = require('request');
const secrets = require('../config/secrets.json');
const services = require('../services/services');

let sendMessage = (message) => {
    return new Promise((resolve, reject) => {
        request.post({
            url: services.botlibre(),
            headers: { 'Content-Type': 'application/xml' },
            body: `<chat application="${secrets.botlibre_application}"
                    instance="${secrets.botlibre_instance}"
                    user="${secrets.botlibre_user}"
                    password="${secrets.botlibre_password}"
                    conversation="${secrets.botlibre_conversation}">
            <message>
            ${message}
            </message>
            </chat>`
        }, function (err, httpResponse, body) {
            if (err) {
                return reject(err);
            }
            parseXML(body, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.response.message[0]);
            });
        });
    });
};

module.exports = {
    sendMessage
};