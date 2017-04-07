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

    hbs.registerPartial('moreBtn', '<div class="btn-wrapper">{{#if show}}<a class="am-btn am-btn-default" href="{{url}}">more >> </a>{{/if}}</div>');

    hbs.registerPartial('backBtn', '<div class="btn-wrapper">{{#if backCat}}<a class="am-btn am-btn-default" href="{{backCat}}">Back to Category</a>{{/if}}{{#if backCat}}<a class="am-btn am-btn-default" href="{{backHome}}">Home</a>{{/if}}</div>');

    return hbs;
};