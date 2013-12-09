(function () {

var Memo = window.Memo = function (obj) {

    var obj = $.extend({
        memo_id: undefined,
        content: ''
    }, obj);

    this.$root = $(Memo.template(obj));
    this.$delete = $('<a class="delete">x</a>');
    this.$content = this.$root.children('.content');

    this.obj = {};
    this.model(obj);

    this.$content.on('input', _.throttle(_.bind(this.controller, this, 'content-input'), 1000))
    this.$delete.on('click', _.bind(this.controller, this, 'delete-click'));

};

Memo.template = _.template(
    '<article class="memo">'+
        '<div class="content" contenteditable>'+
            '<%- content %>'+
        '</div>'+
    '</article>'
);

Memo.prototype.view = function (changed_obj) {

    if (changed_obj === null) {
        this.$root.remove();
        return;
    }

    if (changed_obj.memo_id != undefined) {
        this.$root.prepend(this.$delete);
    }

    return this.$root;

};

Memo.prototype.model = function (changed_obj) {

    if (changed_obj === null) {
        this.view(null);
        return;
    }

    var real_changed_obj = {};
    var _this = this;
    $.each(changed_obj, function(key, value) {
        if (_this.obj === value) return true;
        _this.obj[key] = value;
        real_changed_obj[key] = value;
    });

    this.view(real_changed_obj);
};

Memo.prototype.remote = function (action) {
    var _this = this;
    return $.post('/api/memo/'+action, this.obj)
    .done(function (changed_obj, textStatus, jqXHR) {
        _this.model(changed_obj)
    });
};

Memo.prototype.controller = function (event_name) {

    switch (event_name) {

        case 'content-input':

            this.model({content: this.$content.html()});

            if (this.obj.memo_id === undefined) {
                this.remote('create');
            } else {
                this.remote('update');
            }

            break;

        case 'delete-click':

            this.model(null);
            this.remote('delete');

            break;
    }
};

var MemoContainer = window.MemoContainer = function (memo_models) {
    this.memo_models = memo_models;
};

MemoContainer.prototype.controller = function () {

    var $memo_container = $('<section class="memo-container"></section>');
    $.each(this.memo_models, function (memo_id, memo_model) {
        $memo_container.append((new Memo(memo_model)).$root);
    });

    function append_empty_memo() {
        $memo_container.append((new Memo()).$root.one('input', function () {
            append_empty_memo();
        }));
    }
    append_empty_memo();

    return $memo_container;
};

})();
