var pageService = require('../services/pageService');

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

module.exports = function (type) {
    type = type || 'index';
    var instance = {};
    if(Page[type]) {
        instance = Object.assign(Page[type]);
    }
    return instance;
};