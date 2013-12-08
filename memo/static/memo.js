(function() {

var Memo = window.Memo = function (obj) {
    this.obj = {
        memo_id: null,
        content: null
    };
    $.extend(this.obj, obj);
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
        data: JSON.stringify(_this.obj),
        contentType: 'application/json'
    }).done(function(remote_obj, textStatus, jqXHR) {
        _this.obj = remote_obj;
    });

};

Memo.prototype.controller = function() {

    var $memo = $(Memo.template(this.obj));

    var $delete = $memo.children('.delete');
    var $content = $memo.children('.content');

    if (this.obj.memo_id === null) {
        $delete.hide();
    }

    var _this = this;
    $memo.on('input', function() {
        _this.obj.content = $content.html();
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
