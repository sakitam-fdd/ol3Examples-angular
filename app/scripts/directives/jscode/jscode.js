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
        scope: {
          obj:'='
        },
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
            console.log($scope.obj);
            ngDialog.close();
            var tableName = "GIS_City";
            var where = "CODE" + "='" + $scope.obj.id.toString() + "'";
            jscodeService.loadGeometryData(tableName,where).then(function (data) {
              config.hdmap.addCode(data['features'][0],{
                layerName: "区划"
              },true);
            });
          }
          function quxiaoFunc() {
            ngDialog.close();
          }
        },
        link: function ($scope) {

        }
      }
    }]);
  });