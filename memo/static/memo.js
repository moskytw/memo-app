(function () {

var Memo = window.Memo = function (obj) {

    // init model

    this._model = {};

    // init view

    this.$view = $(Memo.template);
    this.$delete = this.$view.children('.delete');
    this.$content = this.$view.children('.content');
    this.$loader = this.$view.children('.loader');

    // init controller

    var _this = this;

    this.$content.on('input', _.throttle(function () {
        _this.controller('content-inputed');
    }, 100, {leading: false}));

    this.$delete.on('click', function () {
        _this.controller('delete-clicked');
    });

    // apply defaults

    this.model(obj || {});
};

Memo.template = (
    '<article class="memo">'+
        '<a class="delete">x</a>'+
        '<div class="content" contenteditable>'+
        '</div>'+
        '<img class="loader" src="/static/loader.gif">'+
    '</article>'
);

Memo.prototype.model = function (model_changes) {

    var _this = this;
    $.each(model_changes, function (key, value) {
        _this._model[key] = value;
    });

    if (model_changes.content !== undefined) {
        if (this._model.memo_id === undefined) {
            this.remote('create');
        } else {
            this.remote('update');
        }
    }

    if (model_changes.destroyed === true) {
        this.remote('delete');
    }

    this.view(model_changes);
};

Memo.prototype.remote = function (action) {
    this.$view.addClass('saving');
    var _this = this;
    return $.post('/api/memo/'+action, this._model)
    .done(function (model_changed, textStatus, jqXHR) {
        _this.model(model_changed);
    }).always(function () {
        _this.$view.removeClass('saving');
    });
};

Memo.prototype.view = function (view_changes) {

    this.$view.toggleClass('saved', this._model.memo_id !== undefined);

    if (view_changes.content !== undefined) {
        this.$content.html(view_changes.content);
    }

    if (this._model.destroyed === true) {
        this.$view.remove();
    }
};

Memo.prototype.controller = function (event_name) {

    switch (event_name) {

        case 'content-inputed':
            var content_now = this.$content.text();
            if (content_now === this._model.content) break;
            this.model({content: content_now});
            break;

        case 'delete-clicked':
            this.model({destroyed: true});
            break;
    }
};

var MemoContainer = window.MemoContainer = function (memo_models) {

    var $view = this.$view = $('<section class="memo-container"></section>');
    $.each(memo_models, function (memo_id, memo_model) {
        var memo = new Memo(memo_model);
        $view.append(memo.$view);
    });

    function append_empty_memo() {
        var memo = new Memo();
        $view.append(memo.$view.one('input', function () {
            append_empty_memo();
        }));
    }
    append_empty_memo();
};

})();
