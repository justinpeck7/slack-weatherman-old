module.exports = {
    slackChannelApi : (token) => `https://slack.com/api/channels.list?token=${token}`,
    slackGroupApi : (token) => `https://slack.com/api/groups.list?token=${token}`,
    weatherDataApi : (zip, appId) => `http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${appId}&units=imperial`,
    forecastDataApi : (zip, appId) => `http://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${appId}&units=imperial`,
    urbanDictApi : (words) => `http://api.urbandictionary.com/v0/define?term=${words}`
};
