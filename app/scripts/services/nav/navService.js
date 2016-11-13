/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index'], function(index) {
  index.service('navService', ['$rootScope','$q', '$http', function ($rootScope,$q, $http) {
    var service = {
      loadModelNav:function(){
        try {
          var deferred = $q.defer();
          $http({
            url: 'scripts/services/nav/nav.json',
            method: 'GET'
          }).success(function (data, status, headers) {
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