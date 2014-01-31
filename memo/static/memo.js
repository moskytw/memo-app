(function () {

var Memo = window.Memo = function (obj) {

    var obj = $.extend({
        memo_id: undefined,
        content: undefined
    }, obj);

    // init view

    this._$view = $(Memo.template(obj));
    this._$delete = this._$view.children('.delete');
    this._$content = this._$view.children('.content');
    this._$loader = this._$view.children('.loader');

    // init model

    this._model = {};
    this.model(obj);

    // init controller

    this._$content.on('input', _.throttle(
        _.bind(this.controller, this, 'content-input'),
    100, {leading: false}));

    this._$delete.on('click',
        _.bind(this.controller, this, 'delete-click')
    );

};

Memo.template = _.template(
    '<article class="memo">'+
        '<a class="delete">x</a>'+
        '<div class="content" contenteditable>'+
            '<%- content %>'+
        '</div>'+
        '<img class="loader" src="/static/loader.gif">'+
    '</article>'
);

Memo.create = function (obj) {
    // NOTE: It uses closure to keep reference. Does it cause memory leak?
    return (new Memo(obj))._$view;
};

Memo.prototype.view = function (model_changed) {

    this._$view.toggleClass('saved', this._model.memo_id !== undefined);

    if (this._model.destroyed === true) {
        this._$view.remove();
    }
};

Memo.prototype.remote = function (action) {
    this._$view.addClass('saving');
    var _this = this;
    return $.post('/api/memo/'+action, this._model)
    .done(function (model_changed, textStatus, jqXHR) {
        _this.model(model_changed);
    }).always(function () {
        _this._$view.removeClass('saving');
    });
};

Memo.prototype.model = function (model_changed) {

    var _this = this;
    $.each(model_changed, function (key, value) {
        _this._model[key] = value;
    });

    if (model_changed.content !== undefined) {
        if (this._model.memo_id === undefined) {
            this.remote('create');
        } else {
            this.remote('update');
        }
    }

    if (model_changed.destroyed === true) {
        this.remote('delete');
    }

    this.view(model_changed);
};

Memo.prototype.controller = function (event_name) {

    switch (event_name) {

        case 'content-input':
            var content_now = this._$content.text();
            if (content_now === this._model.content) break;
            this.model({content: content_now});
            break;

        case 'delete-click':
            this.model({destroyed: true});
            break;
    }
};

var MemoContainer = window.MemoContainer = function (memo_models) {

    var $view = this._$view = $('<section class="memo-container"></section>');
    $.each(memo_models, function (memo_id, memo_model) {
        $view.append(Memo.create(memo_model));
    });

    function append_empty_memo() {
        $view.append(Memo.create().one('input', function () {
            append_empty_memo();
        }));
    }
    append_empty_memo();
};

})();
