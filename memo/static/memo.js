(function() {

var Memo = window.Memo = function (model) {
    this.model = {
        memo_id: null,
        content: null
    };
    $.extend(this.model, model);
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
    }).done(function(model, textStatus, jqXHR) {
        _this.model = model;
    });

};

Memo.prototype.controller = function() {

    var $memo = $(Memo.template(this.model));

    var $delete = $memo.children('.delete');
    var $content = $memo.children('.content');

    if (this.model.memo_id === null) {
        $delete.hide();
    }

    var _this = this;
    $memo.on('input', function() {
        _this.model.content = $content.html();
        _this.remote('sync').done(function () {
            $delete.show();
        });
    }).on('click', '.delete', function(evt) {
        _this.remote('delete');
        $memo.remove();
    });

    return $memo;

};

})();
