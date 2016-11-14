/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index'], function(index) {
  index.service('panelService', ['$rootScope','$q', '$http', function ($rootScope,$q, $http) {
    var service = {
      loadPanelData:function(type){
        try {
          var deferred = $q.defer();
          $http({
            url: 'scripts/services/panel/' + type + '.json',
            method: 'GET'
          }).success(function (data, status, headers) {
            if (data.length == 0){
              
            }
            deferred.resolve(data);
          })
            .error(function (data, status, headers) {
              deferred.reject(status + data);
            });
          return deferred.promise;

        } catch (error) {

        }
      },
    };
    return service;
  }]);
});