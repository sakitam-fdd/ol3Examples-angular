Sui = function () {
    this.projectName = location.pathname.replace(/\/[^/]*$/, '');
    this.Tools;
    this.ui;
    this.data;
};

sui = new Sui();

Sui.prototype.ui = {
    setLayout: function (id) {
        $('#' + id).layout().attr('fit', 'true');
    },
    getLayout: function (id) {
        return $('#' + id);
    },
    getPanel: function (id, name) {
        var c = sui.ui.getLayout(id);
        return c.layout('panel', name);
    },
    setPanel: function (id, name, href) {
        var p = sui.ui.getPanel(id, name);
        p.panel('refresh', sui.projectName + href);
    },
    setTab: function (id) {
        $('#' + id).tabs({
            border: false,
            fit: true
        });
    },
    addTab: function (id, tabName, url) {
        if (!sui.ui.tabExists(id, tabName)) {
            $('#' + id).tabs('add', {
                title: tabName,
                href: sui.projectName + url,
                closable: true,
                cache: true,
                fit: true
            });
        } else {
            sui.ui.selectTab(id, tabName);
        }
    },
    tabExists: function (id, tabName) {
        return $('#' + id).tabs('exists', tabName);
    },
    selectTab: function (id, tabName) {
        return $('#' + id).tabs('select', tabName);
    },
    show: function (msg) {
        $.messager.show({
            msg: msg,
            timeout: 3000
        });
    },
    tree: function (data) {
        $('#tt').tree({
            data: data,
            onClick: function (node) {
                if (node.id == 1) return;
                var href = node.attributes.url;
                var text = node.text;
                sui.ui.setPanel('cc', 'center', href);
            }
        });
    },
    table: function (options) {

        var defaults = {
            url: '',
            columns: {},
            toolbar: []
        };

        var opt = $.extend(defaults, options);

        var columns = opt.columns;
        var column = [[{field: 'ck', checkbox: true}]];
        for (var key in columns) {
            var title = columns[key];
            var field = key;
            column[0].push({field: field, title: title, align: 'left', halign: 'center'});
        }
        $('#table').datagrid({
            url: opt.url,
            fit: true,
            border: false,
            loadMsg: '正在加载数据，请稍候...',
            rownumbers: true,
            autoRowHeight: true,
            striped: true,
            pagination: true,
            pageSize: 15,
            pageList: [15, 30, 60, 120],
            columns: column,
            toolbar: opt.toolbar
        });
        $('#div_toolbar').appendTo('.datagrid-toolbar');

    },
    accordion: function (id) {
        $('#' + id).accordion({
            animate: true,
            border: false,
            fit: true
        });
    },
    //上移
    MoveUp: function (id) {
        var row = $("#" + id).datagrid('getSelected');
        var index = $("#" + id).datagrid('getRowIndex', row);
        mysort(index, 'up', id);

    },
    MoveDown: function (id) {
        var row = $("#" + id).datagrid('getSelected');
        var index = $("#" + id).datagrid('getRowIndex', row);
        this.mysort(index, 'down', id);
    },
    mysort: function (index, type, gridname) {
        if ("up" == type) {
            if (index != 0) {
                var toup = $('#' + gridname).datagrid('getData').rows[index];
                var todown = $('#' + gridname).datagrid('getData').rows[index - 1];
                $('#' + gridname).datagrid('getData').rows[index] = todown;
                $('#' + gridname).datagrid('getData').rows[index - 1] = toup;
                $('#' + gridname).datagrid('refreshRow', index);
                $('#' + gridname).datagrid('refreshRow', index - 1);
                $('#' + gridname).datagrid('selectRow', index - 1);
            }
        } else if ("down" == type) {
            var rows = $('#' + gridname).datagrid('getRows').length;
            if (index != rows - 1) {
                var todown = $('#' + gridname).datagrid('getData').rows[index];
                var toup = $('#' + gridname).datagrid('getData').rows[index + 1];
                $('#' + gridname).datagrid('getData').rows[index + 1] = todown;
                $('#' + gridname).datagrid('getData').rows[index] = toup;
                $('#' + gridname).datagrid('refreshRow', index);
                $('#' + gridname).datagrid('refreshRow', index + 1);
                $('#' + gridname).datagrid('selectRow', index + 1);
            }
        }
    }
};
Sui.prototype.alert = function (_logo, _content, _interval) {
    var _t = null;
    var _tipsid = randomDiv(_logo, _content);

    function _closeTip() {
        $("#" + _tipsid).fadeOut('slow', function () {
            $("#" + _tipsid).remove();
        });
        clearInterval(_t);
    }

    $("#" + _tipsid).fadeIn('slow');
    _t = setInterval(_closeTip, _interval);
    function randomDiv(_logo, _content) {
        var _t = $('<div></div>');
        var _div = '<div class="prompt-img prompt-' + _logo + '"></div>' + '<div class="prompt-content">' + _content + '</span>';
        var _id = "winDiv" + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds() + new Date().getMilliseconds();
        _t.attr("id", _id);
        _t.append(_div);
        _t.addClass("prompt-box");
        _t.appendTo('body');
        return _id;
    }
};

Sui.prototype.alertOne = function(title,_content){
    randomDiv();

    function _closeTip() {
        $("#alert_id").fadeOut('slow', function () {
            $("#alert_id").remove();
        });
    }

    //$("#" + _tipsid).fadeIn('slow');

    function randomDiv(){
        var _l =$('<div></div>');
        var _div = '<div class="alert-open">\
            <div class="alert-One">\
            <div class="tsxx_input">'+title+'</div>\
            <span class="alertGB iconfont icon-guanbi" onclick="sui.closedAlert()"></span>\
            </div>\
            <div class="alert-Two">\
            <b class="tsy">'+ _content +'</b>\
            <div class="alertAN">\
            <div class="qd"  onclick="sui.closedAlert()">确定</div>\
            <div class="qx" onclick="sui.closedAlert()">取消</div>\
            </div>\
            </div>\
            </div><div class="alertBJ"></div>';
        var _id ='alert_id';
        _l.attr("id", _id);
        _l.append(_div);
        _l.addClass("alert-box");
        _l.appendTo('body');
    }

};
Sui.prototype.closedAlert = function _closeTip() {
    $("#alert_id").fadeOut('slow', function () {
        $("#alert_id").remove();
    });
}


Sui.prototype.ztree = {
    initzTree: function (id, setting, data) {
        if (data != null) {
            $.fn.zTree.init($("#" + id), setting, data);
            var treeObj = $.fn.zTree.getZTreeObj("tree");
            var node = treeObj.getNodeByTId("tree_1");

            while (node.children != null && node.children.length > 0) {
                node = node.children[0];
            }
        }
    }
};