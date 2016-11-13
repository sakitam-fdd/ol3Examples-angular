/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','panelService','ngDialog'],
  function (index,panelService,ngDialog) {
    index.directive('panel', ['panelService','ngDialog',function (panelService,ngDialog) {
      return {
        restrict: 'EA',
        replace: true,
        transclude: false,
        scope: false,
        templateUrl: 'tpl/panel.html',
        controller: function ($scope,$state, $rootScope) {
          $scope.init = function () {
            var type = "c";
            panelService.loadPanelData(type).then(function (data) {
              $scope.data = data;
            })
          };
          /**
           * 显示代码面板
           * @param item
           */
          $scope.showCode = function (item) {
            ngDialog.open({
              template: 'views/showCode/showCode.html',
              className: 'ngdialog-theme-plain',
              scope: $scope,
              cache: false,
              resolve: {
                delay: function ($q) {
                  var delay = $q.defer();
                  require(['showCodeCtrl'], function () {
                    delay.resolve();
                  });
                  return delay.promise;
                }
              }
            });
          }
        },
        link: function ($scope) {

        }
      }
    }]);
  });
