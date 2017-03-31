var Promise = require('promise');
var config = require('../config/config');
var dataConfig = require('../config/dataConfig');
var Article = require('../models/Article');
var Page = require('../models/Page');

var pageService = {};

pageService.getTitle = function () {
    return config.siteName;
};

pageService.setHeader = function (extraTitle) {
    var title = config.siteName;
    if(extraTitle) {
        title += ' - ' + extraTitle; 
    }
    return {
        content: {
            title: title
        }
    };
};

pageService.setList = function (title, categoryId, list) {
    list = list.map(function (value) {
        return {
            title: value.title,
            link: 'article/' + value._id,
            date: value.publish_date.toLocaleDateString()
        };
    });
    return {
        content: {
            header: {
                title: title,
                link: 'category/' + categoryId,
                moreText: 'more >>',
                morePosition: 'bottom'
            },
            main: list
        }
    };
};

pageService.setListThumbImage = function (title, categoryId, list) {
    list = list.map(function (value) {
        return {
            title: value.title,
            link: 'article/' + value._id,
            date: value.publish_date.toLocaleDateString(),
            img: value.imageUrl
        };
    });
    return {
        content: {
            header: {
                title: title,
                link: 'category/' + categoryId,
                moreText: 'more >>',
                morePosition: 'bottom'
            },
            main: list
        }
    };
};

pageService.setListImage = function (title, categoryId, list) {};

pageService.setIndexPage = function (doc) {
    var categories = dataConfig.categories;
    var page = Page('index');
    var self = this;
    page.title = self.getTitle();
    page.header = self.setHeader();
    categories.forEach(function (value, index) {
        if(value.categoryId === 120) {
            var list = doc[value.categoryId];
            page.listCan =
                self.setList(value.category, value.categoryId, list);
        }
        else if(value.categoryId === 122) {
            var list = doc[value.categoryId];
            page.listFun =
                self.setListThumbImage(value.category, value.categoryId, list);
        }
        else if(value.categoryId === 335) {
            var list = doc[value.categoryId];
            page.listEnt =
                self.setListImage(value.category, value.categoryId, list);
        }
    });
    return page;
};

pageService.setCategoryPage = function (categoryId, list) {
    var self = this;
    var page = Page('index');
    var categories = dataConfig.categories;
    page.title = self.getTitle();
    categories.forEach(function (value) {
        if(value.categoryId === categoryId) {
            page.header = self.setHeader(value.category);
        }
    });
    page.list = self.setList(null, categoryId, list);
    return page;
};

module.exports = pageService;