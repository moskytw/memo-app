(function () {

var Memo = window.Memo = function (obj) {

    var obj = $.extend({
        memo_id: undefined,
        content: ''
    }, obj);

    // init view
    this.$view = $(Memo.template(obj));
    this.$delete = $('<a class="delete">x</a>');
    this.$content = this.$view.children('.content');

    // init model
    this._model = {};
    this.model(obj);

    // init controller
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

Memo.prototype.view = function (model_changed) {

    if (model_changed === null) {
        this.$view.remove();
        return;
    }

    if (model_changed.memo_id != undefined) {
        this.$view.prepend(this.$delete);
    }

};

Memo.prototype.model = function (model_changed) {

    if (model_changed === null) {
        this.view(null);
        return;
    }

    var real_model_changed = {};
    var _this = this;
    $.each(model_changed, function(key, value) {
        if (_this._model === value) return true;
        _this._model[key] = value;
        real_model_changed[key] = value;
    });

    this.view(real_model_changed);
};

Memo.prototype.remote = function (action) {
    var _this = this;
    return $.post('/api/memo/'+action, this._model)
    .done(function (model_changed, textStatus, jqXHR) {
        _this.model(model_changed)
    });
};

Memo.prototype.controller = function (event_name) {

    switch (event_name) {

        case 'content-input':

            this.model({content: this.$content.html()});

            if (this._model.memo_id === undefined) {
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
        $memo_container.append((new Memo(memo_model)).$view);
    });

    function append_empty_memo() {
        $memo_container.append((new Memo()).$view.one('input', function () {
            append_empty_memo();
        }));
    }
    append_empty_memo();

    return $memo_container;
};

})();
