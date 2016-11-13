/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','ngDialog','config','jscodeService'],
  function (index,ngDialog,config) {
    index.directive('jscode', ['ngDialog','jscodeService',function (ngDialog,jscodeService) {
      return {
        restrict: 'EA',
        replace: true,
        transclude: false,
        scope: false,
        templateUrl: 'tpl/jscode.html',
        controller: function ($scope,$state, $rootScope) {
          $scope.code = {
            init:initFunc,
            showEvent:showEventFunc,
            quxiao:quxiaoFunc
          };
          /**
           * 初始化
           */
          function initFunc() {
            $scope.textCode = ''
          }
          function showEventFunc() {
            var item = {
              name:"南昌市",
              xzqhbm:"360100"
            }
            var tableName = "GIS_City";
            var where = "CODE" + "='" + item.xzqhbm.toString() + "'";
            jscodeService.loadGeometryData(tableName,where).then(function (data) {
              config.hdmap.addCode(data['features'][0],{
                layerName: "区划"
              },true);
            });
          }
          function quxiaoFunc() {
            
          }
        },
        link: function ($scope) {

        }
      }
    }]);
  });