/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','ngDialog'],
  function (index) {
    index.controller('headerCtrl', ['$scope', '$rootScope',
      function ($scope, $rootScope) {
        $scope.init = function () {
          $scope._Title = "地图API展示系统";
        };
      }]);
  }
);
