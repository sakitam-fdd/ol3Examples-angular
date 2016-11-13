/**
 * author: Kimbo
 */
'use strict';
define(['config','ol'], function (appConfig,ol) {
    var MapPopup = function () {
        this.popupContent = $("<DIV>").appendTo(document.body);
        this.popup = new ol.Overlay({
            element: this.popupContent.get(0)
        });
        appConfig.hdmap.map.addOverlay(this.popup);
        /*$(this.popupContent).tooltip({
         position: 'top',
         content: '<span style="color:#fff">This is the tooltip message.</span>'
         });*/

        this.setContent = function (html) {
            /*$(this.popupContent).tooltip('update',html);
             console.info(this.popupContent);*/
            this.popupContent.tooltip({
                position: 'top',
                content: html,
                onShow: function () {
                }
            });
        };
        this.show = function () {
            $(this.popupContent).tooltip('show');
        };
        this.hide = function () {
            $(this.popupContent).tooltip('hide');
        };
        this.setPosition = function (coordinate) {
            this.popup.setPosition(coordinate);
        }
    };
    return MapPopup;
});
