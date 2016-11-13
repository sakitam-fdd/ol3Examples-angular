/**
 * Created by FDD on 2016/11/13.
 */
define(['angularAMD', 'config','util','tooltips', 'jquery', 'angular-ui-router', 'ngDialog'],
  function (angularAMD, config, util) {
    // routes
    var registerRoutes = function ($stateProvider, $urlRouterProvider, $httpProvider) {
      // defaultPage
      $urlRouterProvider.otherwise("/app");
      $stateProvider
        .state('app', angularAMD.route({
          url: '/app',
          views: {
            'header': {
              templateUrl: 'views/header/header.html',
              resolve: {
                delay: function ($q) {
                  var delay = $q.defer();
                  require(['headerCtrl'], function () {
                    delay.resolve();
                  });
                  return delay.promise;
                }
              }
            },
            'footer': {
              templateUrl: 'views/footer/footer.html'
            },
            'nav': {
              templateUrl: 'views/nav/nav.html',
              resolve: {
                delay: function ($q) {
                  var delay = $q.defer();
                  require(['navCtrl'], function () {
                    delay.resolve();
                  });
                  return delay.promise;
                }
              }
            },
            'main': {
              templateUrl: 'views/main/main.html',
              resolve: {
                delay: function ($q) {
                  var delay = $q.defer();
                  require(['mainCtrl'], function () {
                    delay.resolve();
                  });
                  return delay.promise;
                }
              }
            }
          }
        }))
        .state('app.main.mapApi', angularAMD.route({
          url: '/mapApi',
          views: {
            'windowLeft@index.app.main': {
              templateUrl: 'views/mapApi/apiTree/apiTree.html',
              resolve: {
                delay: function ($q) {
                  var delay = $q.defer();
                  require(['apiTreeCtrl'], function () {
                    delay.resolve();
                  });
                  return delay.promise;
                }
              }
            },
            'windowRight@index.app.main': {
              templateUrl: 'views/mapApi/apiContent/apiContent.html',
              resolve: {
                delay: function ($q) {
                  var delay = $q.defer();
                  require(['apiContentCtrl'], function () {
                    delay.resolve();
                  });
                  return delay.promise;
                }
              }
            }
          }
        }))
    };

    // module
    var app = angular.module("app", ["ui.router", "ngDialog"]);
    // config
    app.config(["$stateProvider", "$urlRouterProvider", '$httpProvider', registerRoutes]);

    app.run(['$rootScope', '$location', '$state', function ($rootScope,$location,$state) {
      var windowState = [];

      // The change of listening to the router
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

      });
    }]);
    // bootstrap
    return angularAMD.bootstrap(app);
  });