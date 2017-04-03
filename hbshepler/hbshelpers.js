module.exports = function (hbs) {

    var blocks = {};

    hbs.registerHelper('extend', function(name, context) {
        var block = blocks[name];
        if (!block) {
            block = blocks[name] = [];
        }

        block.push(context.fn(this));
    });

    hbs.registerHelper('block', function(name) {
        var val = (blocks[name] || []).join('\n');

        blocks[name] = [];
        return val;
    });

    hbs.registerPartial('moreBtn', '<div class="btn-wrapper">' + '<a class="am-btn am-btn-default" href="{{this}}">more ...</a>' + '</div>');

    return hbs;
};