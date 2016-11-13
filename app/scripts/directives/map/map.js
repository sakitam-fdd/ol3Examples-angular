/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index','HDMap','config','mapService'],
  function (index,HDMap) {
    index.directive('map', ['mapService',function (mapService) {
      return {
        restrict: 'EA',
        replace: true,
        transclude: false,
        scope: false,
        templateUrl: 'tpl/map.html',
        controller: function ($scope,$state, $rootScope) {
          $scope.init = function(){
            //初始化地图
            var hdmap = new HDMap.HDMap();
            hdmap.initHDMap("map");
            $('#mapBox').css('width', window.innerWidth - 310 + 'px');
            $(window).resizeend({
              delay: 50
            }, function () {
              $('#mapBox').css('width', window.innerWidth - 310 + 'px');
            });
          }
        },
        link: function ($scope) {

        }
      }
    }]);
  });