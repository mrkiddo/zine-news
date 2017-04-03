var config = require('../config/config');

var Page = {};

Page.index = {
    type: 'index',
    title: '',
    header: '',
    listCan: {},
    listFun: {},
    listEnt: {}
};

Page.category = {
    type: 'category',
    title: '',
    header: '',
    list: {}
};

Page.article = {
    type: 'article',
    title: '',
    header: '',
    content: ''
};

module.exports = function (type) {
    type = type || 'index';
    var instance = {};
    if(Page[type]) {
        instance = Object.assign(Page[type]);
        instance.siteUrl = config.siteUrl;
    }
    return instance;
};