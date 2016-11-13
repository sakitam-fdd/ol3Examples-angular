/**
 * 地图点击弹出气泡组织
 * @author zhangfk
 */
define(['appConfig', 'util'], function (appConfig, util) {
    var popuputil = {
        lastid: null,
        showPopupWin: function (coords, id, layerName, isCenter) {
            appConfig.hdmap.closePopup();
            angular.element('#project_detail').remove();
            if (!coords)
                return;
            var layer = null;
            if (layerName) {
                layer = appConfig.hdmap.getlayerByName(layerName);
            }
            if (!layer) {
                layer = appConfig.hdmap.tempVectorLayer;
            }
            if (coords[0] == 0 || coords[1] == 0) {
                var feature;
                // var feature = layer.getSource().getFeatureById(id);
                var overlays = appConfig.hdmap.map.getOverlays().getArray();
                $(overlays).each(function (i, overlay) {
                    if (overlay.getId() == id) {
                        feature = overlay.get('feature');
                        return feature;
                    }
                });
                if (feature == null || feature == undefined) {
                    showPopAlert();
                    return;
                }
                coords = feature.getGeometry().getCoordinates();
            }
            function showPopAlert() {
                var popFlag = util.getSessionStorage('popTemplate');
                var arr = ['project-detail','content-list-view','video-detail'],i;
                if(popFlag && popFlag.hasOwnProperty('flag') && popFlag.flag){
                    if(layerName == '情报板'){
                        i = 1;
                    }
                } else {
                    i = 0;
                }
                angular.element('#project_detail').remove();
                angular.element('body').append('<div id="project_detail"><'+arr[i]+'></' + arr[i] + '></div>');
                var template = angular.element('#project_detail');
                window.hdsxCompile(template)(window.hdsxscope);
            }

            require(['popupDetailListCtrl'], function () {

                var obj = {content: '<div id="popupwin" style="width:602px;height:345px;position: relative"><div ng-controller="xqListCtrl" ><xq-list-view></xq-list-view></div></div>'};

                var temp = util.getSessionStorage('popTemplate').template;
                if (temp == 'qbb') {
                    obj.content = '<div id="popupwin" style="width:602px;height:345px;position: relative"><div ng-controller="xqListCtrl" ><content-list-view></content-list-view></div></div>';
                } else if (temp == 'video') {
                    window.$rootScope.showVideoDetail = true;
                    obj.content = '<div id="popupwin" style="width:602px;height:345px;position: relative"><div ng-controller="xqListCtrl"><video-detail ng-if="showVideoDetail"></video-detail></div></div>';
                } else if(temp == 'wqgz') {
                    obj.content = '<div id="popupwin" style="width:602px;height:345px;position: relative"><div ng-controller="xqListCtrl" ><project-detail></project-detail></div></div>';
                } else if(temp == 'ncwq') {
                    obj.content = '<div id="popupwin" style="width:602px;height:345px;position: relative"><div ng-controller="xqListCtrl" ><project-detail></project-detail></div></div>';
                } else if(temp == 'ql') {
                    obj.content = '<div id="popupwin" style="width:510px;height:414px;position: relative"><div ng-controller="xqListCtrl"><ql-card></ql-card></div></div>';
                }
                obj['coordinate'] = coords;
                if(temp == 'video'){
                    appConfig.hdmap.showVideoPopup(obj);
                }else {
                    appConfig.hdmap.showPopup(obj);
                }
                var template = angular.element(document.querySelector('#popupwin'));
                window.hdsxCompile(template)(window.hdsxscope);
                if (isCenter != false) {
                    var coords_a = [];
                    coords_a[0] = coords[0];
                    coords_a[1] = coords[1] + 0.2;
                    appConfig.hdmap.map.getView().setCenter(coords_a);
                    appConfig.hdmap.map.getView().setZoom(3);
                }
            });
        }
    };
    return popuputil;
});
