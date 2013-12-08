(function () {

var Memo = window.Memo = function (model) {
    this.model = $.extend({
        memo_id: null,
        content: null
    }, model);
};

Memo.template = _.template(
    '<article class="memo">'+
        '<a class="delete">x</a>'+
        '<div class="content" contenteditable>'+
            '<%- content %>'+
        '</div>'+
    '</article>'
);

Memo.prototype.remote = function (action) {
    var _this = this;
    return $.ajax('/api/memo/'+action, {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(_this.model)
    }).done(function (model, textStatus, jqXHR) {
        _this.model = model;
    });
};

Memo.prototype.controller = function () {

    var $memo = $(Memo.template(this.model));
    var $delete = $memo.children('.delete');
    var $content = $memo.children('.content');

    if (this.model.memo_id === null) {
        $delete.remove();
    }

    var _this = this;
    return $memo.on('input', _.throttle(function () {
        _this.model.content = $content.html();
        var jqXHR = _this.remote('sync');
        if (_this.model.memo_id === null) {
            jqXHR.done(function () {
                $memo.prepend($delete);
            });
        }
    }, 1000)).on('click', '.delete', function (evt) {
        _this.remote('delete');
        $memo.remove();
    });
};

var MemoContainer = window.MemoContainer = function (memo_models) {
    this.memo_models = memo_models;
};

MemoContainer.prototype.controller = function () {

    var $memo_container = $('<section class="memo-container"></section>');
    $.each(this.memo_models, function (memo_id, memo_model) {
        $memo_container.append((new Memo(memo_model)).controller());
    });

    function append_empty_memo() {
        $memo_container.append((new Memo()).controller().one('input', function () {
            append_empty_memo();
        }));
    }
    append_empty_memo();

    return $memo_container;
};

})();
