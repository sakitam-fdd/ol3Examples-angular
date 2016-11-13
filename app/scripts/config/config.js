/**
 * Created by FDD on 2016/11/13.
 */
define([], function () {
  var appconfig = {
    geoserver: 'http://36.2.11.56:7001/geoserver-sde/rest/action',//空间服务访问地址
    webrest: 'http://36.2.11.56:7005/jxgis-web-rest/',
    netWorkService: 'http://36.2.11.1:6080/arcgis/rest/services/jiangxi/jxnetwork/NAServer',
    mapserver: 'http://36.2.11.56:7001/mapserver',
    geocodeService: 'http://36.2.11.56:7001/geocode',
    thematicServer: 'http://36.2.11.1:6080/arcgis/rest/services/',
    isOverViewMapVisible: false,
    isScaleLineVisible: true,
    projection: "EPSG:4326",
    mapConfig: {
      isOverViewMapVisible: true,
      isScaleLineVisible: true,
      projection: "EPSG:4326",
      extent: [109.72859368643232, 24.010266905347684, 121.13105988819079, 30.76693489432357],
      center: [115.92466595234826, 27.428038204473552],//江西省
      zoom: 1
    },
    layerConfig: {
      baseLayers: [
        {
          layerName: "二维地图",
          isDefault: true,
          layerType: "TileArcGISRest",
          layerUrl: "http://36.2.11.1:6080/arcgis/rest/services/JXMAP_2016_2/MapServer"//省
        },
        {
          layerName: "全国地图",
          layerType: "TileArcGISRest",
          layerUrl: "http://211.101.37.251:6080/arcgis/rest/services/jxgxptmap_2015ncyw/MapServer"
        },
        {
          layerName: "影像地图",
          layerType: "TileArcGISRest",
          layerUrl: "http://36.2.11.1:6080/arcgis/rest/services/JXWX20150425/MapServer"
        }
      ],
      featureLayers: [
        {
          layerName: "隧道",
          layerUrl: "http://211.101.37.251:6080/arcgis/rest/services/LH/jiangsu/MapServer/0"
        },
        {
          layerName: "国省特大桥",
          layerUrl: "http://211.101.37.251:6080/arcgis/rest/services/LH/jiangsu/MapServer/1"
        },
        {
          layerName: "高速",
          layerUrl: "http://211.101.37.251:6080/arcgis/rest/services/LH/jiangsu/MapServer/2"
        }
      ],
      tempLayer: {
        tempVectorLayer: "tempVectorLayer",
        perimeterSerach: "perimeterSerachLayer",
        plotDrawLayer: "plotDrawLayer"
      }
    },
    markConfig: {
      defaultImgURL: "./images/map/marker.png",
      getDefaultMrakConfig: function () {
        return {
          imgURL: this.defaultImgURL,
          actionCode: ""
        }
      },

      getMarkConfig: function (type) {
        var length = this.configs.length;
        var returnConfig = null;
        for (var i = 0; i < length; i++) {
          if (this.configs[i].type == type) {
            returnConfig = this.configs[i];
            break;
          }
        }
        if (!returnConfig) {
          returnConfig = this.getDefaultMrakConfig();
        }
        return returnConfig;
      },


      getMarkConfigByetype: function (etype) {
        var length = this.configs.length;
        var returnConfig = null;
        for (var i = 0; i < length; i++) {
          if (this.configs[i].eType == etype) {
            returnConfig = this.configs[i];
            break;
          }
        }
        if (!returnConfig) {
          returnConfig = this.getDefaultMrakConfig();
        }
        return returnConfig;
      },


      getHightImgURL: function (type) {
        return {
          imgURL: "./images/map/plot/" + type + "-dj.png",
          actionCode: ""
        }
      },
      getImgURL: function (type) {
        return {
          imgUrl: "./images/map/plot/" + type + ".png",
          actionCode: ""
        }
      },

      getNumberImagesPath: function (type) {
        return {
          imgURL: "./view/module/main/images/map",
          actionCode: ""
        };
      },

      /*根据actionCode得到要素的类型，图片等配置信息*/
      getPlotConfigByActionCode: function (actionCode) {
        var length = this.configs.length;
        var returnConfig = null;
        for (var i = 0; i < length; i++) {
          if (this.configs[i].actionCode == actionCode) {
            returnConfig = this.configs[i];
            break;
          }
        }
        return returnConfig;
      },
      configs: [{type: "startPoint", imgURL: "./images/map/map_marker_qidian.png", actionCode: ""},
        {type: "endPoint", imgURL: "./images/map/map_marker_zhong.png", actionCode: ""},
        {type: "densityPoint", imgURL: "./images/marks/img_map_dot.png", actionCode: ""},
        {type: "guibiPoint", imgURL: "./images/map/map_marker_guibi.png", actionCode: ""},
        {type: "jingguoPoint", imgURL: "./images/map/map_marker_jingguo.png", actionCode: ""},
        {type: "disorderPoint", imgURL: "./images/map/disorder.png"},
        {type: "zh", imgURL: "./images/map/zh.png"}
      ]
    },
    /*
     * 全局变量类:用于保存饼图切换时需要的数据
     * */
    variables: {
      pointData: "",//点类型的数据
      lineData: "",//除公路数据路线外的线类型的数据
      lxlineData: "",//公路数据的路线数据
      iQuerylx: "",//i查询的路线数据
      model: "",//点击切换的此模块的标识信息
      tjObj: "",//统计数据
      colors: "",//颜色数据
      flag: 0//用于标识测量工具添加的要素集合
    },
    /*工具类*/
    utils: {
      getRootPath: function () {
        //获取当前网址，如： http://localhost:8083/tnms/share/meun.jsp
        var curWwwPath = window.document.location.href;
        //获取主机地址之后的目录，如： tnms/share/meun.jsp
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        //获取主机地址，如： http://localhost:8083
        var localhostPaht = curWwwPath.substring(0, pos);
        //获取带"/"的项目名，如：/tnms
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        return (localhostPaht + projectName);
      },
      dataFormater: function (date, fmt) {
        if (!date) {
          date = new Date();
        }
        var o = {
          "M+": date.getMonth() + 1, //月份
          "d+": date.getDate(), //日
          "h+": date.getHours(), //小时
          "m+": date.getMinutes(), //分
          "s+": date.getSeconds(), //秒
          "q+": Math.floor((date.getMonth() + 3) / 3), //季度
          "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      },

      generateGUID: function () {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      }
    }
  }
  if (window.location.hostname == "171.34.40.68" || window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") {
    appconfig.geoserver = 'http://171.34.40.68:50024/geoserver-sde/rest/action';
    // appconfig.geoserver = 'http://192.168.0.87:7007/geoserver-sde/rest/action';
    // appconfig.webrest = 'http://192.168.0.87:7008/jxgis-web-rest/';
    // appconfig.webrest = 'http://localhost:8086/jxgis-web-rest/';
    appconfig.webrest = 'http://171.34.40.68:50026/jxgis-web-rest/';
    appconfig.mapserver = 'http://171.34.40.68:50024/mapserver';
    appconfig.geocodeService = 'http://171.34.40.68:50024/geocode';
    appconfig.netWorkService = 'http://171.34.40.68:6080/arcgis/rest/services/jiangxi/jxnetwork/NAServer';
    appconfig.thematicServer = 'http://171.34.40.68:6080/arcgis/rest/services/';
    appconfig.layerConfig.baseLayers[0].layerUrl = 'http://171.34.40.68:6080/arcgis/rest/services/JXMAP_2016_2/MapServer';
    appconfig.layerConfig.baseLayers[1].layerUrl = 'http://211.101.37.251:6080/arcgis/rest/services/jxgxptmap_2015ncyw/MapServer';
    appconfig.layerConfig.baseLayers[2].layerUrl = 'http://171.34.40.68:6080/arcgis/rest/services/JXWX20150425/MapServer';
  }
  return appconfig;
});