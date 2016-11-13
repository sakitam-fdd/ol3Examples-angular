/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','truf','config','mapDire','panelDire'],
  function (index,truf,config,mapDire,panelDire) {
    index.controller('mainCtrl', ['$scope', '$rootScope', '$compile', '$state', '$location',
      function ($scope, $rootScope, $compile, $state, $location) {
        $scope.init = function () {
          $('#main').css('width', window.innerWidth - 80 + 'px');
          $(window).resizeend({
            delay: 50
          }, function () {
            $('#main').css('width', window.innerWidth - 80 + 'px');
          });
        }
      }]);
  }
);