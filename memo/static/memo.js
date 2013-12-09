(function () {

var Memo = window.Memo = function (obj) {

    var obj = $.extend({
        memo_id: undefined,
        content: ''
    }, obj);

    this.model(obj);
};

Memo.template = _.template(
    '<article class="memo">'+
        '<div class="content" contenteditable>'+
            '<%- content %>'+
        '</div>'+
    '</article>'
);

Memo.prototype.view = function (changed_obj) {

    if (this.$root === undefined) {
        this.$root = $(Memo.template(this.obj));
        this.$delete = $('<a class="delete">x</a>');
        this.$content = this.$root.children('.content');
    }

    if (changed_obj === null) {
        this.$root.remove();
        return;
    }

    if (changed_obj.memo_id != undefined) {
        this.$root.prepend(this.$delete);
    }

};

Memo.prototype.model = function (changed_obj) {

    if (this.obj === undefined) {
        this.obj = {};
    }

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

Memo.prototype.controller = function (obj) {

    if (this.content_input_handler === undefined) {

        // TODO: Maybe we don't need to create below functions for every instance.

        var _this = this;

        this.content_input_handler = function () {

            _this.model({content: _this.$content.html()});

            if (_this.obj.memo_id === undefined) {
                _this.remote('create');
            } else {
                _this.remote('update');
            }

        };
        this.$content.on('input', _.throttle(this.content_input_handler, 1000))

        this.delete_click_handler = function (evt) {
            _this.model(null);
            _this.remote('delete');
        };
        this.$delete.on('click', this.delete_click_handler);

    }

    return this.$root;
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
