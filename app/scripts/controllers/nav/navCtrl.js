/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','broadcastNameEnum','navService'],
  function (index,broadcastNameEnum) {
    index.controller('navCtrl', ['$scope', '$rootScope', '$state', '$location','navService',
      function ($scope, $rootScope, $state, $location,navService) {
        $scope.init = function () {
          navService.loadModelNav().then(function (data) {
            $scope.data = data;
          })
          $rootScope.navSelect = 'sample';
        };
        /**
         * 导航点击事件
         * @param model
         */
        $scope.changeNav = function (nav) {
          $rootScope.navSelect = nav.alias;
          $rootScope.$broadcast(broadcastNameEnum.navListen,$scope.navSelect);
        }
      }]);
  }
);
