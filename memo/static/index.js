(function () {

var Index = window.Index = function ($container) {
    this.$container = $container;
};

Index.prototype.render_memos = function (objs) {
    var _this = this;
    $.each(objs, function (memo_id, obj) {
        var memo = new Memo(obj);
        _this.$container.append(memo.controller());
    });
    this.new_memo();

};

Index.prototype.new_memo = function () {
    var memo = new Memo();
    var _this = this;
    var $memo = memo.controller().one('click', function () {
        _this.new_memo();
    });
    this.$container.append($memo);
};

})();
