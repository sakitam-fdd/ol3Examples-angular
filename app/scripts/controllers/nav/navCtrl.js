/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','navService'],
  function (index) {
    index.controller('navCtrl', ['$scope', '$rootScope', '$state', '$location','navService',
      function ($scope, $rootScope, $state, $location,navService) {
        $scope.init = function () {
          navService.loadModelNav().then(function (data) {
            $scope.data = data;
          })
        };
        /**
         * 导航点击事件
         * @param model
         */
        $scope.changeNav = function (nav) {
          $scope.navSelect = nav.alias;
        }
      }]);
  }
);
