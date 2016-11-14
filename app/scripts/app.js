/**
 * Created by FDD on 2016/11/13.
 */
require.config({
  paths: {
    'jquery': '../public/jquery',
    'jqueryMousewheel': '../public/jquery.mousewheel.min',
    'jquery.cookie': '../public/jquery.cookie',
    'jquery.scroll':'../public/YuxiSlider.jQuery.min',
    'zTree': '../public/zTree/js/jquery.ztree.all.min',
    'angular': '../public/angular',
    'angular-ui-router': '../public/angular-ui-router',
    'angularAMD': '../public/angularAMD',
    'angularRoute': '../public/angular-route',
    'tooltips': '../public/angular-tooltips/angular-tooltips.min',
    'ngDialog': '../public/ngDialog',
    'echarts': '../public/echarts/dist/echarts.min',
    'autocomplete': '../public/jquery.autocomplete.min',
    'moment': '../public/moment',
    'momentzh': '../public/zh-cn',
    'bootstrap':'../public/bootstarp/js/bootstrap.min',
    'index': 'index',

    //map
    'HDMap': 'map/hdmap',
    'truf': '../public/map/truf',
    'proj4': '../public/map/proj4',
    'p-ol3': '../public/map/p-ol3.min',
    'ol': '../public/map/ol',
    'wangEditor': '../public/map/editor/dist/js/wangEditor',
    'mappopup': 'map/mappopup',
    'popuputil': 'map/popuputil',//气泡弹出框

    //config
    'config':'config/config', //配置文件
    'util':'map/util',
    'broadcastNameEnum': '../broadcastEnum/broadcastEnum',

    // cotrollers
    'indexCtrl':'controllers/indexCtrl',
    'mainCtrl':'controllers/mainCtrl',
    'navCtrl':'controllers/nav/navCtrl',
    'headerCtrl':'controllers/header/headerCtrl',
    'showCodeCtrl':'controllers/showCode/showCodeCtrl',

    //directive

    'mapDire':'directives/map/map',
    'panelDire':'directives/panel/panel',
    'jscode':'directives/jscode/jscode',

    //services
    'navService':'services/nav/navService',   //导航栏服务
    'mapService':'services/map/mapService',   //地图服务
    'panelService':'services/panel/panel',
    'jscodeService':'services/jscode/jscode'
  },
  deps:['index'],
  shim: {
    'bootstrap':['jquery'],
    "angular": {
      deps:['bootstrap'],
      exports: "angular"
    },
    'angularAMD': ['angular'],
    'angularRoute': ['angular'],
    'ngDialog': ['angular'],
    "angular-ui-router": ['angular'],
    'angularUiLayout': ['angular'],
    'angularAnimate': ['angular'],
    'tooltips': ['angular'],
    'zTree': ['jquery'],
    'jqueryMousewheel': ['jquery'],
    'jquery.cookie':['jquery'],
    'jquery.scroll':['jquery'],
    'HDMap': [{
      deps: ['truf', 'proj4'],
      exports: 'HDMap'
    }],
  },
  waitSeconds: 0
})