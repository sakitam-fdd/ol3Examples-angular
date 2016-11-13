/**
 * Created by FDD on 2016/11/13.
 */
'use strict';
define(['index'], function(index) {
  index.service('jscodeService', ['$rootScope','$q', '$http', function ($rootScope,$q, $http) {
    var service = {
      loadGeometryData:function(layerName, where, geo, page, rows){
        try {
          var deferred = $q.defer();
          var params = {};
          params['layerName'] = layerName;
          params['filter'] = where;
          if (geo != null && geo != "") {
            params['spatialFilter'] = geo;
          }
          params['pager'] = {};
          if (page != null && page != undefined) {
            params['pager']['page'] = page;
            params['pager']['rows'] = rows;
          }
          params = JSON.stringify(params)
          console.info(params)
          $http({
            method: 'POST',
            url: 'http://171.34.40.68:50024/geoserver-sde/rest/action/search',
            params: {params:params},  // pass in data as strings
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}

          }).success(function (data) {
            deferred.resolve(data.data);
          }).error(function(data){
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