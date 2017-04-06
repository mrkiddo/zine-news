module.exports = {
    siteName: 'zineNews',
    database: 'mongodb://zn:222222@ds019633.mlab.com:19633/heroku_8b93hwqw',
    crawlerTimeout: 540000,
    requestTimeout: 10000,
    defaultPageSearch: 3,
    scheduleRule: [10, 20, 30, 40, 50, 60],
    siteUrl: 'https://zine-news.herokuapp.com'
};