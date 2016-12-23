/**
 * Created by FDD on 2016/12/23.
 */
'use strict';
define(['ol', 'truf', 'proj4', 'mappopup', 'util', 'echarts', 'config'],
  function (ol, truf, proj4, MapPopup, util, echarts, config) {
    var myMap = function () {
    };
    /**
     * 获取参数
     * @param mapDiv
     * @param url
     */
    myMap.prototype.getMapParams = function (mapDiv, url) {
      var that = this;
      $.ajax({
        url: url + '?f=pjson',
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function (data) {
          if (data) {
            var res = {
              projection: data.spatialReference.wkid,
              fullExtent: [data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax],
              origin: [data.tileInfo.origin.x, data.tileInfo.origin.y],
              tileSize: data.tileInfo.cols,
              lods: data.tileInfo.lods,
              tileUrl: url
            };
            that.initMap(mapDiv, res);
          } else {
          }
        }
      });
    };
    /**
     * 初始化地图
     * @param mapDiv
     * @param params
     */
    myMap.prototype.initMap = function (mapDiv, params) {
      var options = params || {};
      var that = this;
      /**
       * 投影
       * @type {ol.proj.Projection}
       */
      this.projection = ol.proj.get('EPSG:' + options.projection);
      /**
       * 显示范围
       */
      this.fullExtent = options.fullExtent;
      this.projection.setExtent(this.fullExtent);
      /**
       * 瓦片原点
       */
      this.origin = options.origin;
      /**
       * 瓦片大小
       */
      this.tileSize = options.tileSize;
      /**
       * 分辨率
       * @type {Array}
       */
      this.resolutions = [];
      var len = options.lods.length;
      for (var i = 0; i < len; i++) {
        this.resolutions.push(options.lods[i].resolution)
      }
      /**
       * 定义渲染参数
       */
      var size = ol.extent.getWidth(this.projection.getExtent()) / 256;
      /**
       * 渲染分辨率
       * @type {Array}
       * @private
       */
      this._resolutions = new Array(19);
      /**
       * 层级
       * @type {Array}
       */
      this.matrixIds = new Array(19);
      for (var z = 0; z < 19; ++z) {
        this._resolutions[z] = size / Math.pow(2, z);
        this.matrixIds[z] = z
      }
      var tileUrl = options.tileUrl;
      var tileGrid = new ol.tilegrid.TileGrid({
        tileSize: that.tileSize,
        origin: that.origin,
        extent: that.fullExtent,
        resolutions: that.resolutions
      });
      var urlTemplate = tileUrl + '/tile/{z}/{y}/{x}';
      var tileArcGISXYZ = new ol.source.XYZ({
        wrapX: false,
        tileGrid: tileGrid,
        projection: that.projection,
        tileUrlFunction: function (tileCoord) {
          var url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
            .replace('{x}', tileCoord[1].toString())
            .replace('{y}', (-tileCoord[2] - 1).toString());
          return url
        }
      });
      var baseLayer = new ol.layer.Tile({
        isBaseLayer: true,
        isCurrentBaseLayer: true,
        layerName: config.layerConfig.baseLayers[0].layerName,
        source: tileArcGISXYZ
      });
      this.map = new ol.Map({
        target: mapDiv,
        interactions: ol.interaction.defaults({
          doubleClickZoom: true,
          keyboard: false
        }).extend([]),
        controls: [new ol.control.ScaleLine({
          target: 'hdscalebar'
        })],
        layers: [baseLayer],
        view: new ol.View({
          center: ol.proj.fromLonLat(config.mapConfig.center, that.projection),
          zoom: config.mapConfig.zoom,
          projection: that.projection,
          extent: that.fullExtent,
          maxResolution: that.resolutions[0],
          minResolution: that.resolutions[that.resolutions.length - 1]
        })
      })
    };
    /**
     * 清空地图
     */
    myMap.prototype.clearMap = function () {
      if (this.map) {
        var layers = this.map.getLayers();
        if (layers) {
          layers.forEach(function (layer) {
            if (layer instanceof ol.layer.Vector) {
              if (layer.getSource() && layer.getSource().clear) {
                layer.getSource().clear();
              }
            }
          }, this);
        }
      }
    };
    /**
     * getlayerByLayerName
     * @param layername
     * @returns {*}
     */
    myMap.prototype.getlayerByLayerName = function (layername) {
      var targetLayer = null;
      if (this.map) {
        var layers = this.map.getLayers();
        layers.forEach(function (layer) {
          var layernameTemp = layer.get("layerName");
          if (layernameTemp === layername) {
            targetLayer = layer;
          }
        }, this);
      }
      return targetLayer;
    };
    /**
     * 创建图层
     * @param layerName
     * @param params
     * @returns {*}
     */
    myMap.prototype.getTempVectorLayer = function (layerName, params) {
      var vectorLayer = this.getlayerByLayerName(layerName);
      if (!(vectorLayer instanceof ol.layer.Vector)) {
        vectorLayer = null;
      }
      if (!vectorLayer) {
        if (params && params.create) {
          var vectorSource = new ol.source.Vector({
            wrapX: false
          });
          vectorLayer = new ol.layer.Vector({
            layerName: layerName,
            source: vectorSource,
            selectable: params["selectable"],
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(67, 110, 238, 0.4)'
              }),
              stroke: new ol.style.Stroke({
                color: '#4781d9',
                width: 2
              }),
              image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                  color: '#ffcc33'
                })
              })
            })
          });
        }
      }
      if (this.map && vectorLayer) {
        if (!this.getlayerByLayerName(layerName)) {
          this.map.addLayer(vectorLayer);
        }
      }
      return vectorLayer;
    };
    /**
     * 添加行政区划
     * @param feature
     * @param params
     * @param isclear
     */
    myMap.prototype.addCode = function (feature, params, isclear) {
      if (isclear) {
        this.clearMap();
      }
      if (!feature) {
        return;
      }
      var layer = null;
      if (params.layerName) {
        params["create"] = true;
        layer = this.getTempVectorLayer(params.layerName, params);
      }
      var Polygonstyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#4781d9',
          width: 2
        })
      });
      var geometry = new ol.format.WKT().readGeometry(feature.geometry);
      var Polygonfeature = new ol.Feature({
        geometry: geometry
      });
      Polygonfeature.setStyle(Polygonstyle);
      layer.getSource().addFeature(Polygonfeature);
      var extent = geometry.getExtent();
      this.zoomToExtent(extent, true);
    };
    /**
     * 缩放到要素范围
     * @param extent
     * @param isanimation
     * @param duration
     * @private
     */
    myMap.prototype.zoomToExtent = function (extent, isanimation, duration) {
      var that = this;
      var view = this.map.getView();
      var size = this.map.getSize();
      /**
       *  @type {ol.Coordinate} center The center of the view.
       */
      var center = ol.extent.getCenter(extent);
      if (!isanimation) {
        view.fit(extent, size, {
          padding: [0, 0, 0, 0],
          nearest: false
        });
        view.setCenter(center);

      } else {
        if (!duration) {
          duration = 1000;
          var start = +new Date();
          var pan = ol.animation.pan({
            duration: duration,
            source: /** @type {ol.Coordinate} */ (view.getCenter()),
            start: start
          });
          var bounce = ol.animation.bounce({
            duration: duration,
            resolution: view.getResolution(),
            start: start
          });
          this.map.beforeRender(pan);
          view.setCenter(center);
          view.fit(extent, size, {
            padding: [0, 0, 0, 0],
            nearest: true
          });
          setTimeout(function () {
            that.setMapView(extent,center);
          },500)
        }
      }
    };

    myMap.prototype.setMapView = function (extent, center) {
      var that = this;
      var maxResolution = this.map.getView().getResolution();
      var maxZoom = this.map.getView().getZoom();
      var view = new ol.View({
        center: ol.proj.fromLonLat(center, that.projection),//从经度/纬度坐标转换到一个不同的投影,pro:目标投射
        zoom: 1,//目标缩放
        projection: that.projection,
        extent: extent,
        maxResolution: maxResolution,
        minResolution: that.resolutions[that.resolutions.length - 1]
      });
      that.map.setView(view);
    }
    return {
      HDMap:myMap
    };
  });