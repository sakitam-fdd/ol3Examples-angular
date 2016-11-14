/**
 * Created by FDD on 2016/7/5.
 */
'use strict';
define(['ol', 'truf', 'proj4', 'mappopup', 'util', 'echarts', 'config'],
  function (ol, truf, proj4, MapPopup, util, echarts, appConfig) {
    //弄清楚需要哪些依赖？
    window.ol = ol;
    var app = {};
    var drawSketchObj;
    /*app.Drag = function () {//地图手势交互
     ol.interaction.Pointer.call(this, {
     handleDownEvent: app.Drag.prototype.handleDownEvent,
     handleDragEvent: app.Drag.prototype.handleDragEvent,
     handleMoveEvent: app.Drag.prototype.handleMoveEvent,
     handleUpEvent: app.Drag.prototype.handleUpEvent
     });
     this.customType = "appDrag";
     /!**
     * @type {ol.Pixel}
     * @private
     *!/
     this.coordinate_ = null;

     /!**
     * @type {string|undefined}
     * @private
     *!/
     this.cursor_ = 'pointer';

     /!**
     * @type {ol.Feature}
     * @private
     *!/
     this.feature_ = null;

     /!**
     * @type {string|undefined}
     * @private
     *!/
     this.previousCursor_ = undefined;

     };
     ol.inherits(app.Drag, ol.interaction.Pointer);//继承的原型方法构造函数（child,parent）

     /!**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     *!/
     app.Drag.prototype.handleDownEvent = function (evt) {
     if (evt.originalEvent.button === 0/!*鼠标左键*!/) {
     var map = evt.map;
     var feature = map.forEachFeatureAtPixel(evt.pixel,
     function (feature) {
     return feature;
     });
     if (feature && feature.get("params") && feature.get("params").moveable) {
     this.coordinate_ = evt.coordinate;
     this.feature_ = feature;
     }
     return !!feature;
     }
     };

     /!**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     *!/
     app.Drag.prototype.handleDragEvent = function (evt) {
     if (!this.coordinate_) {
     return;
     }
     var deltaX = evt.coordinate[0] - this.coordinate_[0];
     var deltaY = evt.coordinate[1] - this.coordinate_[1];
     var geometry = /!** @type {ol.geom.SimpleGeometry} *!/
     (this.feature_.getGeometry());
     geometry.translate(deltaX, deltaY);
     this.coordinate_[0] = evt.coordinate[0];
     this.coordinate_[1] = evt.coordinate[1];
     this.feature_.dispatchEvent("featureMove");
     };

     /!**
     * @param {ol.MapBrowserEvent} evt Event.
     *!/
     app.Drag.prototype.handleMoveEvent = function (evt) {
     if (this.cursor_) {
     var map = evt.map;
     var feature = null;
     if (this.feature_) {
     feature = this.feature_;
     } else {
     feature = map.forEachFeatureAtPixel(evt.pixel,
     function (feature) {
     return feature;
     });
     }

     var element = evt.map.getTargetElement();
     if (feature) {
     if (element.style.cursor != this.cursor_) {
     this.previousCursor_ = element.style.cursor;
     element.style.cursor = this.cursor_;
     }
     } else if (this.previousCursor_ !== undefined) {
     element.style.cursor = this.previousCursor_;
     this.previousCursor_ = undefined;
     }
     }
     };

     /!**
     * @return {boolean} `false` to stop the drag sequence(拖拽顺序).
     *!/
     app.Drag.prototype.handleUpEvent = function (evt) {
     window.testdrag = false;
     this.coordinate_ = null;
     this.feature_ = null;
     return false;
     };*/
    /*
     * 定义一个地图对象
     * */
    var HDMap = function () {
      proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs");
      ol.proj.setProj4(proj4);
      this.dragMap = true;
      this.queryparams = null;
      this.polygonLayers = [];//面图层集合
      this.lineLayers = [];//线图层集合
      this.pointLayers = [];//点图层集合
      this.plotDraw = null;//标绘工具
      this.plotEdit = null;
      this.layerparams = null;//地图叠加路线时，把路线的qdzh、zdzh、lxdm、sxxfx组织起来，供图层列表叠加使用，形如{qdzh:0,zdzh:12,sxxfx:1,lxdm:'G104'}
      window.ObservableObj = new ol.Object();
      this.map = null;
      this.tempVectorLayer = null;
      this.tempAddline = [];//线段临时绘制图层
      this.wgs84Sphere = new ol.Sphere(6378137);
      this.popupOverlay = null;
      this.drawPointermove = null;
      /**
       * 当前绘制的要素.
       * @type {ol.Feature}
       */
      this.drawSketch = null;
      this.listener = null;
      /**
       * Overlay to show the help messages.
       * @type {ol.Overlay}
       */
      this.measureHelpTooltip = null;
      this.selectInteraction = null;
      this.draw = null;
      this.tempVectorLayer = null;
      this.mapTools = {
        drawPlot: false, drawSquare: false, drawArraw: false,
        drawLine: false, drawCircle: false, drawPolygon: false,
        drawRect: false, addPoint: false,
        addTitle: false, addTextArea: false, zoomIn: false,
        zoomOut: false, iQuery: false, zhQuery: false, measureLength: false,
        measureArea: false, showLayers: false, drawBox: false, ljQuery: false,
        toolsType: {
          drawPlot: "drawPlot", drawSquare: "drawSquare",
          drawArraw: "drawArraw", drawLine: "drawLine",
          drawCircle: "drawCircle", drawPolygon: "drawPolygon",
          drawRect: "drawRect", drawBox: "drawBox", addPoint: "addPoint",
          addTitle: "addTitle", addTextArea: "addTextArea",
          zoomIn: "zoomIn", zoomOut: "zoomOut",
          iQuery: "iQuery", zhQuery: "zhQuery", measureLength: "measureLength",
          measureArea: "measureArea", showLayers: "showLayers", ljQuery: "ljQuery"
        }
      };

      /*
       *   初始化地图
       * */
      this.initHDMap = function (mapDiv) {//此函数在mainCtrl里调用
        proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs");//GIS坐标转换库
        var tileUrl;
        var self = this;
        var len = appConfig.layerConfig.baseLayers.length;
        for (var i = 0; i < len; i++) {
          var layerConfig = appConfig.layerConfig.baseLayers[i];
          if (layerConfig.isDefault) {
            tileUrl = layerConfig.layerUrl;
            break;
          }
        }
        $.ajax({
          url: tileUrl + "?f=pjson",
          type: "GET",
          dataType: 'jsonp',
          jsonp: 'callback',
          success: function (data) {
            if (data && data.error) {
              window.hdsxRootScope.$broadcast(broadcastNameEnum.alertWindowShow, {
                flag: true,
                data: {
                  title: "提示",
                  content: "加载地图失败，请联系地图服务提供商！"
                }
              });
              return;
            }
            appConfig.mapinfo = data;
            var fullExtent = [data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax];
            var projection = ol.proj.get("EPSG:" + data.spatialReference.wkid);
            projection.setExtent(fullExtent);
            var resolutions = [];
            var origin = [data.tileInfo.origin.x, data.tileInfo.origin.y];
            var len = data.tileInfo.lods.length;

            for (var i = 0; i < len; i++) {
              resolutions.push(data.tileInfo.lods[i].resolution);
            }
            var tileGrid = new ol.tilegrid.TileGrid({
              tileSize: data.tileInfo.cols,
              origin: origin,
              extent: fullExtent,
              resolutions: resolutions
            });
            var urlTemplate = tileUrl + "/tile/{z}/{y}/{x}";
            var tileArcGISXYZ = new ol.source.XYZ({//XYZ 格式的切片数据，继承自 ol.source.TileImage
              wrapX: false,//是否包含世界地图，默认true
              tileGrid: tileGrid,//瓦片网格
              projection: projection,//地图投影映射
              tileUrlFunction: function (tileCoord) {//获得给定一个瓦片地图URL坐标和投影
                var url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
                  .replace('{x}', tileCoord[1].toString())
                  .replace('{y}', (-tileCoord[2] - 1).toString());
                return url;
              }
            });
            var baseLayer = new ol.layer.Tile({//基本图层：二维，影像，DOM
              isBaseLayer: true,//通用基本图层
              isCurrentBaseLayer: true,//当前通用基本图层
              layerName: appConfig.layerConfig.baseLayers[0].layerName,
              source: tileArcGISXYZ,
              extent: fullExtent,
              wrapX: false
            });
            /*
             *   创建一个地图图层
             * */
            self.map = new ol.Map({
              target: mapDiv,
              interactions: ol.interaction.defaults({doubleClickZoom: false}).extend([]),
              controls: [new ol.control.ScaleLine({//Controls initially added to the map. If not specified, ol.control.defaults() is used.
                target: "hdscalebar"
              }), new ol.control.Loading()],
              layers: [baseLayer],    //必须定义
              view: new ol.View({
                center: ol.proj.fromLonLat(appConfig.mapConfig.center, projection),//从经度/纬度坐标转换到一个不同的投影,pro:目标投射
                zoom: appConfig.mapConfig.zoom,//目标缩放
                projection: projection,
                extent: fullExtent,
                maxResolution: resolutions[0],
                minResolution: resolutions[len - 1]
              })
            });
            var elelment = self.map.getTargetElement();
            self.cursor_ = "url(images/cur/openhand.cur), auto";
            elelment.style.cursor = self.cursor_;
            /**
             * 添加鼠标小手
             * */
            $("#map").on('mousedown', function () {
              if (self.dragMap) {
                self.cursor_ = "url(images/cur/closedhand.cur), auto";
                elelment.style.cursor = self.cursor_;
              }
            });
            $("#map").on('mouseup', function () {
              if (self.dragMap) {
                self.cursor_ = "url(images/cur/openhand.cur), auto";
                elelment.style.cursor = self.cursor_;
              }
            });
            window.ObservableObj.dispatchEvent("MapInitialized");
            self._addImageBaseLayer();
            self._addGlobeBaseLayer();
            //添加鼠标移动交互
            self.moveInteraction = new ol.interaction.Select({
              condition: ol.events.condition.pointerMove,
              style: function (fea, resolution) {
                var styles = [];
                var style = new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: '#D97363',
                    width: 10
                  })
                });
                styles.push(style);
                return styles
              },
              layers: function (layer) {
                return layer.get("selectable");
              },
              filter: function (feat, layer) {
                if (feat.get('features')) {
                  return feat.get('features').length <= 1;
                }
                return true;
              },
              wrapX: false
            });
            self.moveInteraction.on('select', function (evt) {
              var ret = evt.selected;
              if (ret.length == 0) {
                var deselected = evt.deselected;
                if (deselected.length > 0) {
                  var feat = deselected[0];
                  var layer = feat.get("belongLayer");
                  if (layer && (layer.getSource() instanceof ol.source.Cluster)) {
                    feat.setStyle(layer.getStyle());
                  } else if (feat.get("features")) {
                    var feats = feat.get("features");
                    if (feats[0]) {
                      var _layer = feats[0].get("belongLayer");
                      if (feats[0].get("belongLayer")) {
                        feat.setStyle(_layer.getStyle());
                      }
                    }
                  } else {//恢复鼠标滑过之前的样式
                    var _style = feat.get("unSelectStyle");
                    if (_style) {
                      feat.setStyle(_style);
                    }
                  }
                }
                return;
              }
              var feat = ret[0];
              var layer = self.moveInteraction.getLayer(feat);
              var _style = feat.get("selectStyle") || layer.get("selectedStyle");
              if (_style) {
                feat.setStyle(_style);
              }
              if (feat.get('features')) {
                feat = feat.get('features')[0];
              }
              feat.set("belongLayer", layer);
              window.ObservableObj.set("mouseOnFeature", feat);
            });
            self.map.addInteraction(self.moveInteraction);
            var len = appConfig.layerConfig.baseLayers.length;
            var layerUrl = appConfig.layerConfig.baseLayers[0].url;
            for (var i = 0; i < len; i++) {
              var layerConfig = appConfig.layerConfig.baseLayers[i];
              if (layerConfig.isDefault) {
                layerUrl = layerConfig.layerUrl;
                break;
              }
            }
            self.tempVectorLayer = self.getTempVectorLayer(appConfig.layerConfig.tempLayer.tempVectorLayer, {create: true});
            self.map.on("pointerdrag", function () {
              if (self.popup) {
                self.popup.hide();
              }
            });
            var mapView = document.querySelector(".ol-viewport .ol-unselectable");
            self.map.on('singleclick', function (evt) {
              var feature = self.map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                  return feature;
                });
              if (feature) {
                var coordinate = evt.coordinate;
                var layer = feature.get("belongLayer");
                feature.set("belongLayer", layer);
                window.ObservableObj.set("clickFeature", feature);
                window.ObservableObj.dispatchEvent("clickFeatureEvt");
              }
            });

            self.map.on("click", function (evt) {
              var feature = self.map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                  return feature;
                });
              var eventCoordinate = evt.coordinate;
              if (self.popup) {
                self.popup.hide();
              }
              if (self.mapTools.zhQuery) {
                if (self.queryparams != null && self.queryparams.drawend != null) {
                  if (!feature) {
                    self.mapTools.iQuery = true;
                    self.queryparams.drawend(evt);
                    var elelment = self.map.getTargetElement();
                    self.cursor_ = "url(images/cur/zhuangh.cur), auto";
                    elelment.style.cursor = self.cursor_;
                  }
                }
                return;
              }
              if (self.mapTools.iQuery) {
                if (self.queryparams != null && self.queryparams.drawend != null) {
                  if (!feature) {
                    self.mapTools.iQuery = true;
                    self.queryparams.drawend(evt);
                    switch (self.queryparams.flag) {
                      case 'point':
                        self.cursor_ = "url(images/cur/dia.cur), auto";
                        break;
                      case 'luxian':
                        self.cursor_ = "url(images/cur/lux.cur), auto";
                        break;
                      case 'luduan':
                        self.cursor_ = "url(images/cur/xiand.cur), auto";
                        break;
                    }
                    var elelment = self.map.getTargetElement();
                    elelment.style.cursor = self.cursor_;
                  }
                }
                return;
              } else if (self.mapTools.addTextArea) {
                self._addTextPopup(eventCoordinate);
                return;
              }
              var overlays = self.map.getOverlays();
              overlays.forEach(function (item, index) {
                if (item.get("isEditorContainer") && item.getElement().editor) {
                  item.getElement().editor.destroy();
                  item.getElement().editor.isDestroy = true;
                }
              });
            }, self);
            appConfig.hdmap = self;
            $(window).resizeend({
              delay: 50
            }, function () {
              self.updateSize();//当页面变化刷新地图
            });
            return self.map;
          },
          error: function (err) {
            console.error(err);
          }
        });
      };
      /*在初始化(影像)地图的时候调用，其他情况不允许调用*/
      this._addImageBaseLayer = function () {
        var self = this;
        var layerConfig = this.getLayerConfigByName('影像地图');
        if (!layerConfig || !layerConfig['layerName']) {
          return null;
        }
        $.ajax({
          url: layerConfig.layerUrl + "?f=pjson",
          type: "GET",
          dataType: 'jsonp',
          jsonp: 'callback',
          success: function (data) {
            if (data && data.error) {
              window.hdsxRootScope.$broadcast(broadcastNameEnum.alertWindowShow, {
                flag: true,
                data: {
                  title: "提示",
                  content: "加载地图失败，请联系地图服务提供商！"
                }
              });
              return;
            }
            var fullExtent = [data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax];
            var projection = ol.proj.get("EPSG:" + data.spatialReference.wkid);
            projection.setExtent(fullExtent);
            var resolutions = [];
            var origin = [data.tileInfo.origin.x, data.tileInfo.origin.y];
            var len = data.tileInfo.lods.length;
            for (var i = 0; i < len; i++) {
              resolutions.push(data.tileInfo.lods[i].resolution);
            }
            var tileGrid = new ol.tilegrid.TileGrid({
              tileSize: data.tileInfo.cols,
              origin: origin,
              extent: fullExtent,
              resolutions: resolutions
            });
            var urlTemplate = layerConfig.layerUrl + "/tile/{z}/{y}/{x}";
            var tileArcGISXYZ = new ol.source.XYZ({//XYZ 格式的切片数据，继承自 ol.source.TileImage
              wrapX: false,//是否包含世界地图，默认true
              tileGrid: tileGrid,//瓦片网格
              projection: projection,//地图投影映射
              tileUrlFunction: function (tileCoord) {//获得给定一个瓦片地图URL坐标和投影
                var url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
                  .replace('{x}', tileCoord[1].toString())
                  .replace('{y}', (-tileCoord[2] - 1).toString());
                return url;
              }
            });
            var baseLayer = new ol.layer.Tile({//基本图层：二维，影像，DOM
              isBaseLayer: true,//通用基本图层
              isCurrentBaseLayer: false,//当前通用基本图层
              layerName: layerConfig.layerName,
              source: tileArcGISXYZ,
              extent: fullExtent,
              wrapX: false
            });
            baseLayer.setVisible(false);
            self.map.addLayer(baseLayer);
          },
          error: function (err) {
            console.error(err);
          }
        });
      };
      /*在初始化（全国）地图的时候调用，其他情况不允许调用*/
      this._addGlobeBaseLayer = function () {
        var self = this;
        var layerConfig = this.getLayerConfigByName('全国地图');
        if (!layerConfig || !layerConfig['layerName']) {
          return null;
        }
        $.ajax({
          url: layerConfig.layerUrl + "?f=pjson",
          type: "GET",
          dataType: 'jsonp',
          jsonp: 'callback',
          success: function (data) {
            if (data && data.error) {
              window.hdsxRootScope.$broadcast(broadcastNameEnum.alertWindowShow, {
                flag: true,
                data: {
                  title: "提示",
                  content: "加载地图失败，请联系地图服务提供商！"
                }
              });
              return;
            }
            var fullExtent = [data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax];
            var projection = ol.proj.get("EPSG:" + data.spatialReference.wkid);
            projection.setExtent(fullExtent);
            var resolutions = [];
            var origin = [data.tileInfo.origin.x, data.tileInfo.origin.y];
            var len = data.tileInfo.lods.length;
            for (var i = 0; i < len; i++) {
              resolutions.push(data.tileInfo.lods[i].resolution);
            }
            var tileGrid = new ol.tilegrid.TileGrid({
              tileSize: data.tileInfo.cols,
              origin: origin,
              extent: fullExtent,
              resolutions: resolutions
            });
            var urlTemplate = layerConfig.layerUrl + "/tile/{z}/{y}/{x}";
            var tileArcGISXYZ = new ol.source.XYZ({//XYZ 格式的切片数据，继承自 ol.source.TileImage
              wrapX: false,//是否包含世界地图，默认true
              tileGrid: tileGrid,//瓦片网格
              projection: projection,//地图投影映射
              tileUrlFunction: function (tileCoord) {//获得给定一个瓦片地图URL坐标和投影
                var url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
                  .replace('{x}', tileCoord[1].toString())
                  .replace('{y}', (-tileCoord[2] - 1).toString());
                return url;
              }
            });
            var baseLayer = new ol.layer.Tile({//基本图层：二维，影像，DOM
              isBaseLayer: true,//通用基本图层
              isCurrentBaseLayer: false,//当前通用基本图层
              layerName: layerConfig.layerName,
              source: tileArcGISXYZ,
              extent: fullExtent,
              wrapX: false
            });
            baseLayer.setVisible(false);
            self.map.addLayer(baseLayer);
          },
          error: function (err) {
            console.error(err);
          }
        });
      };
      /*
       * 功能：当页面窗口变化时刷新地图
       * */
      this.updateSize = function () {
        this.map.updateSize();
      };

      /**
       * 判断点是否在视图内，如果不在地图将自动平移
       */
      this.MovePointToView = function (coord) {
        var extent = this.getMapCurrentExtent();
        if (!(ol.extent.containsXY(extent, coord[0], coord[1]))) {
          this.map.getView().setCenter([coord[0], coord[1]]);
        }
      };
      this.removeLayerByName = function (layerName) {
        var layer = this.getlayerByName(layerName);
        if (layer) {
          this.map.removeLayer(layer);
        }
      };
      /*
       * 功能：基本底图切换
       * */
      this.changeBaseLayer = function (layerName) {
        this.map.getLayers().forEach(function (layer) {
          if (layer.get("isBaseLayer")) {
            layer.set("isCurrentBaseLayer", false);
            layer.setVisible(false);
          }
        });
        var baseLayer = this.getlayerByName(layerName);
        if (baseLayer) {
          baseLayer.setVisible(true);
          baseLayer.set("isCurrentBaseLayer", true);
          switch (layerName) {
            case "全国地图":
              var view = this.map.getView();
              view.setCenter(appConfig.mapConfig.center);
              break;
            case "影像地图":
              var view = this.map.getView();
              view.setCenter(appConfig.mapConfig.center);
              break;
          }
        }
      };
      /*
       *  功能：获取基础地图
       *
       * */
      this.getBaseLayer = function () {
        var baseLayer = null;
        this.map.getLayers().forEach(function (layer) {
          if (layer.get("isBaseLayer") && layer.get("isCurrentBaseLayer")) {
            baseLayer = layer;
          }
        });
        if (!baseLayer) {
          console.error("获取基础底图出错!");
        }
        return baseLayer;
      };
      /*
       * 功能：获取基础配置
       * */
      this.getLayerConfigByName = function (layerName) {
        var baseLayerConfig = appConfig.layerConfig.baseLayers;
        var featureLayers = appConfig.layerConfig.featureLayers;
        var layers = baseLayerConfig.concat(featureLayers);
        var layer = null;
        for (var length = layers.length, i = 0; i < length; i++) {
          layer = layers[i];
          if (layerName === layer.layerName) {
            break;
          }
        }
        return layer;
      };
      /*
       * 功能：获取临时图层
       * */
      this.getTempTileLayer = function (layerName, params) {
        var vectorLayer = null;
        if (this.map) {
          var layers = this.map.getLayers();
          layers.forEach(function (layer) {
            var layerNameTemp = layer.get("layerName");
            if (layer instanceof ol.layer.Tile && layerNameTemp === layerName) {
              vectorLayer = layer;
              return vectorLayer;
            }
          }, this);
        }
        if (vectorLayer) {
          return vectorLayer;
        }
        if (params && params.create) {
          var urlTemplate = params["urlTemplate"];
          var tileArcGISXYZ = new ol.source.XYZ({
            tileGrid: params.tileGrid,
            projection: params.projection,
            wrapX: true,
            tileUrlFunction: function (tileCoord) {
              var url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
                .replace('{x}', tileCoord[1].toString())
                .replace('{y}', (-tileCoord[2] - 1).toString());
              return url;
            }
          });
          vectorLayer = new ol.layer.Tile({
            source: tileArcGISXYZ,
            wrapX: false
          });
        }
        return vectorLayer;
      };
      /*
       * 功能：创建临时图层，用来放绘制的要素
       * 如果该临时图层存在，则直接返回，如果不存在，则重新创建
       * */
      this.getTempVectorLayer = function (layerName, params) {
        var vectorLayer = this.getlayerByName(layerName);
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
            if (layerName == "routestlayer") {//创建标点的开始和结束point
              vectorSource.on("addfeature", function (event) {
                var type = event.feature.get("params").featureType;
                var imgURL = appConfig.markConfig.getMarkConfig(type).imgURL;
                var iconStyle = new ol.style.Style({
                  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 25],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: imgURL
                  }))
                });
                event.feature.setStyle(iconStyle);
                var features = vectorSource.getFeatures();
                var tempFeatures = [];
                if (features.length >= 2) {
                  for (var i = 0; i < features.length; i++) {
                    var fea = features[i];
                    var feaType = fea.get("featureType");
                    if (type === "startPoint") {
                      if (feaType === type) {
                        tempFeatures.push(fea);
                      }
                    } else if (type === "endPoint") {
                      if (feaType === type) {
                        tempFeatures.push(fea);
                      }
                    }
                  }
                  for (var m = 0; m < tempFeatures.length - 1; m++) {
                    vectorSource.removeFeature(tempFeatures[m]);
                  }
                }
              }, this);
            }
          }
        }
        if (vectorLayer && (layerName == appConfig.layerConfig.tempLayer.plotDrawLayer || layerName == appConfig.layerConfig.tempLayer.perimeterSerach)) {
          ol.Observable.unByKey(vectorLayer.addFeatureHandler);
          vectorLayer.addFeatureHandler = vectorLayer.getSource().on("addfeature", function (event) {
            var params = event.feature.get("params");
            if (!params) {
              params = event.feature.getGeometry().get("params");
            }
            var config;
            if (params && params.featureType) {
              config = appConfig.markConfig.getMarkConfig(params.featureType);
            } else if (params && params.layerName) {
              config = appConfig.markConfig.getMarkConfigByetype(params.layerName);
            }

            if (config) {
              var imgURL = config.imgURL;
              if (imgURL) {
                var iconStyle = new ol.style.Style({
                  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 25],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: imgURL
                  }))
                });
                event.feature.setStyle(iconStyle);
              }
            }

          }, this);
        }

        if (this.map && vectorLayer) {
          if (!this.getlayerByName(layerName)) {
            this.map.addLayer(vectorLayer);
          }
        }
        return vectorLayer;
      };

      /**
       * 判断地图上是否已加载图层
       */
      this.getlayerByName = function (layername) {
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

      /*
       * 工具：激活工具
       * */
      this.activeTool = function (toolType, params) {
        this.deactiveAll();//使所有工具处于非激活状态
        var self = this;
        if (this.mapTools.hasOwnProperty(toolType)) {
          this.mapTools[toolType] = true;
          this.dragMap = false;
          if (toolType === this.mapTools.toolsType.measureLength) {
            /*设置鼠标光标样式*/
            var elelment = this.map.getTargetElement();
            this.cursor_ = "url(images/cur/ruler.cur), auto";
            elelment.style.cursor = this.cursor_;
            self.measureLengthClick = self.map.on("singleclick", function (event) {
              self.measureLengthClick.clickCount += 1;
              if (self.mapTools.measureLength) {
                if (self.measureLengthClick.clickCount == 1) {
                  self.drawSketch.length = "起点";
                }
                self._addMeasureOverLay(event.coordinate, self.drawSketch.length);
              }
            });
            self.measureLengthClick.clickCount = 0;
            this.addDrawInteraction("LineString", {
              featureType: "长度"
            });
            /*测距时候禁止鼠标鼠标其他交互*/
            this._activePointInteraction(false);
            /*当鼠标移动时的一些处理*/
            this.beforeMeasurePointerMoveHandler = this.map.on('pointermove', this._beforeDrawPointMoveHandler, this);
          } else if (toolType === this.mapTools.toolsType.measureArea) {
            /*设置鼠标光标样式*/
            var elelment = this.map.getTargetElement();
            this.cursor_ = "url(images/cur/ruler.cur), auto";
            elelment.style.cursor = this.cursor_;
            this.createMeasureAreaTooltip();
            self.measureAreaClick = self.map.on("singleclick", function (event) {
              self.measureAreaClick.clickCount += 1;
            });
            self.measureAreaClick.clickCount = 0;
            this.addDrawInteraction("Polygon", {
              featureType: "面积"
            });
            /*测距时候禁止鼠标鼠标其他交互*/
            this._activePointInteraction(false);
          }
          else if (toolType === this.mapTools.toolsType.drawLine) {
            this.addDrawInteraction("LineString");
          } else if (toolType === this.mapTools.toolsType.drawPolygon) {
            this.addDrawInteraction("Polygon", params);
          } else if (toolType === this.mapTools.toolsType.zoomIn) {
            this.zoomIn();
          } else if (toolType === this.mapTools.toolsType.zoomOut) {
            this.zoomOut();
          } else if (toolType === this.mapTools.toolsType.addPoint) {
            this.queryparams = params;
            self.addPointHandlerClick = self.map.on("singleclick", function (event) {
              self.addPoint({
                geometry: event.coordinate
              }, params);
            });
          } else if (toolType === this.mapTools.toolsType.iQuery) {
            this.queryparams = params;
            switch (params.flag) {
              case 'point':
                this.cursor_ = "url(images/cur/dia.cur), auto";
                break;
              case 'luxian':
                this.cursor_ = "url(images/cur/lux.cur), auto";
                break;
              case 'luduan':
                this.cursor_ = "url(images/cur/xiand.cur), auto";
                break;
            }
            var elelment = this.map.getTargetElement();
            elelment.style.cursor = this.cursor_;
          } else if (toolType === this.mapTools.toolsType.addTitle) {
          } else if (toolType === this.mapTools.toolsType.addTextArea) {
            this.mapTools.addTextArea = true;
          } else if (toolType === this.mapTools.toolsType.drawSquare) {
            this.addDrawInteraction("Square", params);
          } else if (toolType === this.mapTools.toolsType.drawBox) {
            this.addDrawInteraction("drawBox", params);
          } else if (toolType === this.mapTools.toolsType.zhQuery) {
            this.queryparams = params;
            var elelment = this.map.getTargetElement();
            this.cursor_ = "url(images/cur/zhuangh.cur), auto";
            elelment.style.cursor = this.cursor_;
          } else if (toolType === this.mapTools.toolsType.ljQuery) {
            this.queryparams = params;
            ol.Observable.unByKey(self.addPointHandlerClick);//移除对key的监听
            self.addPointHandlerClick = self.map.on("singleclick", function (event) {
              if (self.mapTools.ljQuery) {
                self.addPoint({
                  geometry: event.coordinate
                }, params);
              }
            });
          }
        }
      };
      /**
       * 使某个工具处于非激活状态
       * @param {HDMap.mapTools.toolsType} toolType 具体的工具
       * */
      this.deactiveTool = function (toolType) {
        if (this.mapTools[toolType]) {
          this.mapTools[toolType] = false;
        } else {
          console.error("没有这种工具");
        }
      };
      /*使所有工具处于非激活状态
       * */
      this.deactiveAll = function () {
        this.dragMap = true;
        for (var key in this.mapTools) {
          if (typeof this.mapTools[key] == 'boolean') {
            this.mapTools[key] = false;
          }

        }
        this.removeDrawInteraion();
        if (this.plotDraw) {
          this.plotDraw.deactivate();
          this.plotEdit.deactivate();
        }
      };
      /*
       * 删除某个要素
       *
       * */
      this.removeFeature = function (featuer) {
        if (featuer instanceof ol.Feature) {
          var tragetLayer = this.getLayerByFeatuer(featuer);
          if (tragetLayer) {
            if (this.plotEdit && this.plotEdit.activePlot && this.plotEdit.activePlot === featuer) {
              this.plotEdit.deactivate();
            }
            var source = tragetLayer.getSource();
            if (source && source.removeFeature) {
              source.removeFeature(featuer);
            }
          }
        } else {
          console.error("传入的不是要素");
        }
      };
      /*
       *  根据feature得到该feature所在的图层
       *
       *  */
      this.getLayerByFeatuer = function (feature) {
        var tragetLayer = null;
        if (feature instanceof ol.Feature) {
          var bin = false, source = null;
          var layers = this.map.getLayers().getArray();
          var length = layers.length;
          for (var i = 0; i < length; i++) {
            if (!tragetLayer) {
              var source = layers[i].getSource();
              if (source.getFeatures) {
                var features = source.getFeatures();
                var feaLength = features.length;
                for (var j = 0; j < feaLength; j++) {
                  var fea = features[j];
                  if (fea == feature) {
                    tragetLayer = layers[i];
                    break;
                  }
                }
              }
            } else {
              break;
            }
          }
        } else {
          console.error("传入的不是要素");
        }
        return tragetLayer;
      };
      /*
       *  调整地图范围
       * */
      this.adjustExtent = function (extent) {
        var width = ol.extent.getWidth(extent);
        var height = ol.extent.getHeight(extent);
        var adjust = 0.2;
        if (width < 0.05) {
          var bleft = ol.extent.getBottomLeft(extent);//获取xmin,ymin
          var tright = ol.extent.getTopRight(extent);//获取xmax,ymax
          var xmin = bleft[0] - adjust;
          var ymin = bleft[1] - adjust;
          var xmax = tright[0] + adjust;
          var ymax = tright[1] + adjust;
          extent = ol.extent.buffer(extent, adjust);
        }
        return extent;
      };
      /*
       * 添加交互工具：测距、测面
       * */
      this.addDrawInteraction = function (drawType, params) {
        var self = this;
        self.removeDrawInteraion();
        self.draw = self._createDraw(drawType, params);
        self.drawPoint = self._drawPoint("Point", params);
        self.map.addInteraction(self.draw);//添加交互
        if (drawType !== "Point") {
          self._getDragPanInteraction().setActive(false);
        }
        self.draw.on('drawstart', function (evt) {
          var elelment = self.map.getTargetElement();
          self.cursor_ = "url(images/cur/ruler.cur), auto";
          elelment.style.cursor = self.cursor_;
          self.drawSketch = evt.feature;
          var idevt = evt.feature;
          appConfig.variables.flag = appConfig.variables.flag + 1;
          self.drawSketch.set("uuid", appConfig.variables.flag);
          drawSketchObj = self.drawSketch;
          /** @type {ol.Coordinate|undefined} */
          var tooltipCoord = evt.coordinate;
          if (self.mapTools.measureLength) {
            ol.Observable.unByKey(self.beforeMeasurePointerMoveHandler);
            self.listener = self.drawSketch.getGeometry().on('change', function (evt) {
              var geom = evt.target;
              if (self.drawSketch.length) {
                self.drawSketch.prevLength = self.drawSketch.length;
              } else {
                self.drawSketch.prevLength = "起点";
              }
              if (geom instanceof ol.geom.LineString) {
                var output = self.formatLength(/** @type {ol.geom.LineString} */ (geom.getCoordinates()));
                self.drawSketch.length = output;
                self.measureHelpTooltip.getElement().firstElementChild.firstElementChild.innerHTML = output;
              }
            }, self);

            self.drawPointermove = self.map.on("pointermove", self._drawPointerMoveHandler, self);

          } else if (self.mapTools.measureArea) {
            self.listener = self.drawSketch.getGeometry().on('change', function (evt) {
              var elelment = self.map.getTargetElement();
              self.cursor_ = "url(images/cur/ruler.cur), auto";
              elelment.style.cursor = self.cursor_;
              var coordinates = self.drawSketch.getGeometry().getCoordinates()[0];
              var area = Math.abs(self.wgs84Sphere.geodesicArea(coordinates));
              area = self.formatArea(area);
              if (self.measureAreaTooltip) {
                var poly = {
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                    "type": "Polygon",
                    "coordinates": [coordinates]
                  }
                };
                self.measureAreaTooltipElement.innerHTML = "面积:" + area;
                self.measureAreaTooltip.setPosition(truf.centroid(poly).geometry.coordinates);
                self.measureAreaTooltip.set('groupId', drawSketchObj.get('uuid'));
              }
            }, self);
          }
        }, self);

        self.draw.on("drawend", function (evt) {
          evt.feature.set("params", params);
          self._getDragPanInteraction().setActive(true);
          self._activePointInteraction(true);
          var elelment = self.map.getTargetElement();
          self.cursor_ = "url(images/cur/openhand.cur), auto";
          elelment.style.cursor = self.cursor_;
          self.map.removeOverlay(self.measureHelpTooltip);
          self.measureHelpTooltip = null;
          if (self.mapTools.measureLength) {
            self._addMeasureOverLay(evt.feature.getGeometry().getLastCoordinate(), self.drawSketch.length, "止点");
            self.mapTools.measureLength = false;
            ol.Observable.unByKey(self.listener);
            ol.Observable.unByKey(self.drawPointermove);
            ol.Observable.unByKey(self.measureLengthClick);
          } else if (self.mapTools.measureArea) {
            var coordinate = evt.feature.getGeometry().getLastCoordinate();
            self.addMeasureRemoveBtn(coordinate);
            ol.Observable.unByKey(self.listener);
          }
          if (params && params.drawend) {
            params.drawend(evt);
          }
          self.drawSketch = null;
          self.removeDrawInteraion();
        });
      };
      /*
       * 移除测距交互工具
       * */
      this.removeDrawInteraion = function () {
        if (this.draw) {
          this.map.removeInteraction(this.draw);
        }
        this.draw = null;
      };
      /*
       *  测量工具
       *
       *  */
      this._drawPoint = function (drawType, params) {
        var draw = new ol.interaction.Draw({
          source: this.getTempVectorLayer(params.layerName, {create: true}).getSource(),
          type: /** @type {ol.geom.GeometryType} */ ("Point"),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'//设置
            }),
            stroke: new ol.style.Stroke({//所画线的路径样式
              color: 'rgba(252, 129, 129, 1)',
              /*lineDash: [100, 100],*///设置所画线样式，虚线间隔
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 4,
              stroke: new ol.style.Stroke({
                color: 'rgba(255, 0, 0, 0.7)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              })
            })
          })
        });
        return draw;
      };
      this._createDraw = function (drawType, params) {
        if (!params) {
          params = {};
        }
        var fill = {color: 'rgba(254, 164, 164, 1)'};
        var stroke = {color: 'rgba(252, 129, 129, 1)', width: 2};
        var image = {
          radius: 3,
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        };
        if (!params.layerName) {
          params.layerName = appConfig.layerConfig.tempLayer.tempVectorLayer;
        }
        if (!params.fill) {
          params.fill = fill;
        }
        if (!params.stroke) {
          params.stroke = stroke;
        }
        if (!params.image) {
          params.image = image;
        }
        var draw = new ol.interaction.Draw({
          source: this.getTempVectorLayer(params.layerName, {create: true}).getSource(),
          type: drawType,
          style: new ol.style.Style({
            fill: new ol.style.Fill(params.fill),
            stroke: new ol.style.Stroke(params.stroke),
            image: new ol.style.Circle(params.image)
          })
        });
        return draw;
      };

      this._drawPointerMoveHandler = function (event) {
        if (this.mapTools.measureLength) {
          if (event.dragging) {
            return;
          }
          var elelment = this.map.getTargetElement();
          this.cursor_ = "url(images/cur/ruler.cur), auto";
          elelment.style.cursor = this.cursor_;
          var helpTooltipElement = this.measureHelpTooltip.getElement();
          helpTooltipElement.className = " BMapLabel BMap_disLabel";
          helpTooltipElement.style.position = "absolute";
          helpTooltipElement.style.display = "inline";
          helpTooltipElement.style.cursor = "inherit";
          helpTooltipElement.style.border = "1px solid rgb(255, 1, 3)";
          helpTooltipElement.style.padding = "3px 5px";
          helpTooltipElement.style.whiteSpace = "nowrap";
          helpTooltipElement.style.fontVariant = "normal";
          helpTooltipElement.style.fontWeight = "normal";
          helpTooltipElement.style.fontStretch = "normal";
          helpTooltipElement.style.fontSize = "12px";
          helpTooltipElement.style.lineHeight = "normal";
          helpTooltipElement.style.fontFamily = "arial,simsun";
          helpTooltipElement.style.color = "rgb(51, 51, 51)";
          helpTooltipElement.style.backgroundColor = "rgb(255, 255, 255)";
          helpTooltipElement.style.webkitUserSelect = "none";
          helpTooltipElement.innerHTML = "<span>总长:<span class='BMap_disBoxDis'></span></span><br><span style='color: #7a7a7a;'>单击确定地点,双击结束</span>";
          this.measureHelpTooltip.setPosition(event.coordinate);
        }
      };

      this._beforeDrawPointMoveHandler = function (event) {
        if (!this.measureHelpTooltip) {
          var helpTooltipElement = document.createElement('label');
          helpTooltipElement.className = "BMapLabel";
          helpTooltipElement.style.position = "absolute";
          helpTooltipElement.style.display = "inline";
          helpTooltipElement.style.cursor = "inherit";
          helpTooltipElement.style.border = "none";
          helpTooltipElement.style.padding = "0";
          helpTooltipElement.style.whiteSpace = "nowrap";
          helpTooltipElement.style.fontVariant = "normal";
          helpTooltipElement.style.fontWeight = "normal";
          helpTooltipElement.style.fontStretch = "normal";
          helpTooltipElement.style.fontSize = "12px";
          helpTooltipElement.style.lineHeight = "normal";
          helpTooltipElement.style.fontFamily = "arial,simsun";
          helpTooltipElement.style.color = "rgb(51, 51, 51)";
          helpTooltipElement.style.webkitUserSelect = "none";
          helpTooltipElement.innerHTML = "<span class='BMap_diso'><span class='BMap_disi'>单击确定起点</span></span>";
          this.measureHelpTooltip = new ol.Overlay({
            element: helpTooltipElement,
            offset: [55, 20],
            positioning: 'center-center'
          });
          this.map.addOverlay(this.measureHelpTooltip);
        }
        this.measureHelpTooltip.setPosition(event.coordinate);
      };
      /*
       * 测量时禁止鼠标其他交互事件
       * */
      this._activePointInteraction = function (b) {
        var interactions = this.map.getInteractions();
        interactions.forEach(function (interaction) {
          if (interaction.customType && interaction.customType == "appDrag") {
            interaction.setActive(b);
          }
        });

      };

      /**
       * 对距离的显示进行格式化
       * @param {ol.geom.LineString} line
       * @private
       * @return {string}
       */
      this.formatLength = function (coordinates) {
        var length = 0;
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
          length += this.wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1]);
        }
        var output;
        if (length > 100) {
          output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + '公里';
        } else {
          output = (Math.round(length * 100) / 100) +
            ' ' + '米';
        }
        return output;
      };
      /*
       * 获取拖拽工具
       * */
      this._getDragPanInteraction = function () {
        if (!this.dragPanInteraction) {
          var items = this.map.getInteractions().getArray();
          for (var i = 0; i < items.length; i++) {
            var interaction = items[i];
            if (interaction instanceof ol.interaction.DragPan) {
              this.dragPanInteraction = interaction;
              break;
            }
          }
        }
        return this.dragPanInteraction;
      };
      /*
       * 添加测量提示信息图层
       * */
      this._addMeasureOverLay = function (coordinate, length, type) {
        var helpTooltipElement = document.createElement('label');
        helpTooltipElement.style.position = "absolute";
        helpTooltipElement.style.display = "inline";
        helpTooltipElement.style.cursor = "inherit";
        helpTooltipElement.style.border = "none";
        helpTooltipElement.style.padding = "0";
        helpTooltipElement.style.whiteSpace = "nowrap";
        helpTooltipElement.style.fontVariant = "normal";
        helpTooltipElement.style.fontWeight = "normal";
        helpTooltipElement.style.fontStretch = "normal";
        helpTooltipElement.style.fontSize = "12px";
        helpTooltipElement.style.lineHeight = "normal";
        helpTooltipElement.style.fontFamily = "arial,simsun";
        helpTooltipElement.style.color = "rgb(51, 51, 51)";
        helpTooltipElement.style.webkitUserSelect = "none";
        if (type == "止点") {
          helpTooltipElement.style.border = "1px solid rgb(255, 1, 3)";
          helpTooltipElement.style.padding = "3px 5px";
          helpTooltipElement.className = " BMapLabel BMap_disLabel";
          helpTooltipElement.innerHTML = "总长<span class='BMap_disBoxDis'>" + length + "</span>";
          this.addMeasureRemoveBtn(coordinate);
        } else {
          helpTooltipElement.className = "BMapLabel";
          helpTooltipElement.innerHTML = "<span class='BMap_diso'><span class='BMap_disi'>" + length + "</span></span>";
        }
        var tempMeasureTooltip = new ol.Overlay({
          element: helpTooltipElement,
          offset: [0, -5],
          // id:drawSketchObj.get("uuid"),
          positioning: 'bottom-center'
        });
        tempMeasureTooltip.set('groupId', drawSketchObj.get("uuid"));
        tempMeasureTooltip.setPosition(coordinate);
        this.map.addOverlay(tempMeasureTooltip);
      };

      /**
       * 对面积的显示进行格式化
       * @param {ol.geom.Polygon} area
       * @private
       * @return {string}
       */
      this.formatArea = function (area) {
        var output;
        if (area > 100000000000) {
          output = (Math.round(area / (1000 * 1000 * 10000) * 100) / 100) +
            ' ' + '万平方公里';
        }
        if (area > 10000000) {
          output = (Math.round(area / (1000 * 1000) * 100) / 100) +
            ' ' + '平方公里';
        } else {
          output = (Math.round(area * 100) / 100) +
            ' ' + '平方米';
        }
        return output;
      };
      /*
       * 测量面积
       * */
      this.createMeasureAreaTooltip = function () {
        this.measureAreaTooltipElement = document.createElement('div');
        this.measureAreaTooltipElement.style.marginLeft = "-6.25em";
        this.measureAreaTooltipElement.className = 'measureTooltip hidden';
        this.measureAreaTooltip = new ol.Overlay({
          element: this.measureAreaTooltipElement,
          offset: [15, 0],
          positioning: 'center-left'
        });
        this.map.addOverlay(this.measureAreaTooltip);
      };
      /*
       * 添加工具移除按钮
       * */
      this.addMeasureRemoveBtn = function (coordinate) {
        var self = this;
        //添加移除按钮
        var tempLayer = self.getTempVectorLayer(appConfig.layerConfig.tempLayer.tempVectorLayer);
        var pos = [coordinate[0] - 5 * this.map.getView().getResolution(), coordinate[1]];
        var btnImg = document.createElement('img');
        btnImg.src = "images/map/map_range_end.png";
        btnImg.style.cursor = "pointer";
        btnImg.title = "清除测量结果";
        btnImg.groupId = self.drawSketch.get("uuid");
        btnImg.pos = coordinate;
        btnImg.onclick = function (evt) {
          var imgSelf = this;
          var groupId = btnImg.groupId;
          var overlays = self.map.getOverlays().getArray();
          $(overlays).each(function (i, overlay) {
            if (overlay.get("groupId") == groupId) {
              self.map.removeOverlay(overlay);
            }
          });
          if (tempLayer) {
            var source = tempLayer.getSource();
            var features = source.getFeatures();
            $(features).each(function (i, feat) {
              var lastCoord = feat.getGeometry().getLastCoordinate();
              if (lastCoord[0] == imgSelf.pos[0] && lastCoord[1] == imgSelf.pos[1]) {
                source.removeFeature(feat);
              }
            });
          }
        };
        var closeBtn = new ol.Overlay({
          element: btnImg,
          offset: [0, -5],
          positioning: 'bottom-center'
        });
        closeBtn.setPosition(pos);
        closeBtn.set("groupId", self.drawSketch.get("uuid"));
        this.map.addOverlay(closeBtn);
      };
      /**
       * 清除地图上的东西
       */
      this.clearGraphics = function () {
        this.removeDrawInteraion();
        this.deactiveAll();
        this.map.getOverlays().clear();
        /*销毁文字标记中的编辑器*/
        if (this.editor) {
          this.editor.destroy();
          delete this.editor;
        }
        this.circleSerachFea = null;
        this.cleartempgraphiclayers();
        //清除叠加的专题图
        thematicService.removeOverLayer();
        window.ObservableObj.dispatchEvent("clearGraphics");
        var elelment = this.map.getTargetElement();
        if (elelment) {
          this.cursor_ = "url(images/cur/openhand.cur), auto";
          elelment.style.cursor = this.cursor_;
        }
      };
      /*
       * i查询时清空上一次查询结果
       * */
      this.cleariQueryGraphics = function () {
        this.removeDrawInteraion();
        this.cleartempgraphiclayers();
        this.map.getOverlays().clear();
        /*销毁文字标记中的编辑器*/
        if (this.editor) {
          this.editor.destroy();
          delete this.editor;
        }
        this.circleSerachFea = null;
        //清除叠加的专题图
        thematicService.removeOverLayer();
        window.ObservableObj.dispatchEvent("clearGraphics");
      };
      /*
       * 清除地图上的覆盖物
       * */
      this.clearOverlayGraphics = function () {
        this.map.getOverlays().clear();
      };
      /**
       * 根据names集合清除地图上的overlayer图层
       * @params{array} names 图层集合
       */
      this.clearOverlayerGraphicsByLayerName = function (names) {
        var overlays = this.map.getOverlays().getArray();
        var self = this;
        $(overlays).each(function (i, overlay) {
          if (overlay.get('layerName') && overlay.get('layerName') == names) {
            self.map.removeOverlay(overlay);
          }
        });
      }
      /**
       * 根据names集合清除地图上的临时绘制图层
       * @params{array} names 图层集合
       * @params{boolean} overlayclear 是否清除临时叠加图层
       * @params{array} saveNames 除了图层
       */
      this.clearGraphicsByLayerNames = function (names, overlayclear, saveNames) {
        if (names == undefined || names == null || names.length == 0 || names[0] == undefined) {
          return;
        }
        for (var i = 0; i < names.length; i++) {
          if (saveNames != undefined && saveNames != null) {
            if (saveNames.indexOf(names[i]) >= 0)
              continue;
          }
          var layer = this.getlayerByName(names[i]);
          if (layer != null) {
            layer.getSource().clear();
          }
        }
        if (overlayclear) {
          this.map.getOverlays().clear();
        }
      };
      /**
       * 清除除地图上的临时绘制要素
       * @params{Array} Ids 要素id集合
       * @params{boolean} isclear 是否清除，若为true,则根据ids清除，若为false，则是除ids集合其它全部清除
       */
      this.ClearGraphicsByIds = function (Ids, isclear) {
        if (isclear) {//根据ids清除overlay popup
          var tempIds = [];
          for (var i = 0; i < Ids.length; i++) {
            var id = Ids[i];
            var overlay = this.map.getOverlayById(id);
            if (overlay == null)
              tempIds.push(id);
            else {
              this.map.removeOverlay(overlay);
            }
          }

          //清除临时要素
          for (var j = 0; j < tempIds.length; j++) {
            var id = tempIds[j];
            var layers = appConfig.hdmap.map.getLayers();
            layers.forEach(function (layer) {
              if (layer instanceof ol.layer.Vector) {
                var targetFeature = layer.getSource().getFeatureById(id);
                if (targetFeature != null)
                  layer.getSource().removeFeature(targetFeature);
              }
            }, this);
          }

        } else {//保留ids其它全部清除
          var tempIds = [];
          var overlays = this.map.getOverlays;
          for (var i = 0; i < overlays.length; i++) {
            var overlay = overlays[i];
            if (Ids.indexOf(overlay.getId()) >= 0) {
              tempIds.push(overlay.getId());
              continue;
            }
            this.map.removeOverlay(overlay);
          }
          //临时要素
          var layers = appConfig.hdmap.map.getLayers();
          layers.forEach(function (layer) {
            var idss = [];
            var features = [];
            for (var k = 0; k < Ids.length; k++) {
              if (tempIds.indexOf(Ids[k]) < 0)
                idss.push(Ids[k]);
            }
            Ids = idss;
            if (Ids.length > 0) {
              if (layer instanceof ol.layer.Vector) {
                for (var nn = 0; nn < Ids.length; nn++) {
                  var id = Ids[nn];
                  var targetFeature = layer.getSource().getFeatureById(id);
                  if (targetFeature != null) {
                    features.push(targetFeature);
                    tempIds.push(id);
                  }
                }

              }
            }
            layer.getSource().clear;
            if (features.length > 0)
              layer.getSource().addFeatures(features);
          }, this);
        }

      };

      /**
       * 根据featureid进行清除
       */
      this.clearGraphicsByFeaturesIds = function (layerName, ids) {
        layerName = layerName.toUpperCase();
        if (ids == null || ids.length == 0)
          return;
        var layer = this.getlayerByName(layerName);
        if (layer != null) {
          var source = layer.getSource();
          for (var i = 0; i < ids.length; i++) {
            var feature = layer.getSource().getFeatureById(ids[i]);
            if (feature == null)
              continue;
            layer.getSource().removeFeature(feature);
          }
        }
      };

      /**
       * 清除临时绘制图层
       */
      this.cleartempgraphiclayers = function () {
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
        this.tempAddline = [];
      };

      /*
       *@param{ol.Extent} extent缩放到的范围
       *@param{bool} isanimation是否使用动画
       *@param{number} duration可选的动画时常
       * */
      this.zoomToExtent = function (extent, isanimation, duration) {
        var view = this.map.getView();
        var size = this.map.getSize();
        /**
         *  @type {ol.Coordinate} center The center of the view.
         */
        var center = ol.extent.getCenter(extent);
        if (!isanimation) {
          view.fit(extent, size, {
            padding: [0,0,0,0],
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
              padding: [0,0,0,0],
              nearest: false
            });
          }
        }
      };

      /*
       * 功能：地图添加单个点（标点）
       * @param attr:包含点空间信息坐标
       * @param params:包含点类型信息
       * */
      this.addPoint = function (point, params) {
        var geometry = null;
        if (!params) {
          params = {};
        }
        //获取geometry的三种方式
        if (point instanceof ol.geom.Geometry) {
          geometry = point;
        } else if ($.isArray(point.geometry)) {//如果指定的参数是数组，则返回true，否则返回false
          geometry = new ol.geom.Point(point.geometry);
        } else {
          geometry = new ol.format.WKT().readGeometry(point.geometry);
        }
        var iconFeature = new ol.Feature({
          geometry: geometry,
          params: params
        });
        //集合空间类型:所标绘点的样式
        var featureType = params.featureType;
        if (featureType) {
          var iconStyle;
          var imgURL = appConfig.markConfig.getMarkConfig(featureType).imgURL;
          if (params.hasOwnProperty("text") && params.text != null) {
            iconStyle = new ol.style.Style({
              image: new ol.style.Icon({
                anchor: [0.5, 25],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: imgURL
              }),
              text: new ol.style.Text({
                font: "20px serif",
                fill: new ol.style.Fill({
                  color: "#E50000"
                }),
                text: params.text,
                offsetX: 0.5,
                offsetY: -35,
              })
            });
          } else {
            iconStyle = new ol.style.Style({
              image: new ol.style.Icon({
                anchor: [0.5, 25],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: imgURL
              })
            });
          }
          iconFeature.setStyle(iconStyle);
        }
        if (point["attributes"]) {
          iconFeature.setProperties(point["attributes"], false);
        }
        if (params.layerName) {
          params["create"] = true;
          var layer = this.getTempVectorLayer(params.layerName, params);
          layer.getSource().addFeature(iconFeature);
        } else {
          this.tempVectorLayer.getSource().addFeature(iconFeature);
        }
        if (params.drawend && typeof(params.drawend) == "function") {
          params.drawend({
            feature: iconFeature
          });
        }
        this.mapTools.addPoint = false;
        if (this.addPointHandlerClick) {
          ol.Observable.unByKey(this.addPointHandlerClick);//移除对key的监听
        }
        this.OrderLayerZindex();
        return iconFeature;
      };
      /**
       * 添加多个点
       * @param {Array.<object>} points:多点传入数组对象，
       *
       * @return {Array.<ol.geom.Point>} addedPoints
       *
       * featureType:必须
       */
      this.addPoints = function (points, params) {
        if (points == null || points == undefined) {
          return;
        }
        var multiPoint = new ol.geom.MultiPoint([]);
        var addedPoints = [];
        for (var i = 0; i < points.length; i++) {
          if (!points[i]) {
            continue;
          }
          if (!params["layerName"]) {
            params["layerName"] = points[i]['layerName'];
          }
          var point = points[i].attributes ? points[i].attributes : points[i];
          if (!point) {
            throw new Error("传入的数据结构不正确!");
          } else {
            var id = point.id || point.ID;
            if (!id) {
              throw new Error("传入的数据缺少id!");
            }
            if (!points[i].geometry) {
              continue;
            }
          }
          var WKT = new ol.format.WKT();
          var geom = WKT.readGeometry(points[i].geometry);
          var feature = new ol.Feature({
            geometry: geom
          });
          multiPoint.appendPoint(geom);
          feature.setId(point.id || point.ID);
          if (points[i]["attributes"]) {
            feature.setProperties(points[i]["attributes"], false);
          }
          var color = points[i].color;//颜色变量可以自定义
          var iconclass = "";
          var coordinate = geom.getCoordinates();
          var id = point.id || point.ID;
          this.addMarker(color, feature, iconclass, i, coordinate, id, params);
        }
        if (multiPoint.getPoints().length > 0) {
          var extent = multiPoint.getExtent();
          var bExtent = true;
          for (var m = 0; m < 4; m++) {
            if (extent[m] == Infinity || extent[m] == NaN) {
              bExtent = false;
              break;
            }
          }
          if (bExtent) {
            this.zoomToExtent(extent, true);
          }
        }
        this.OrderLayerZindex();
        return addedPoints;
      };
      /*
       * 添加点的字体图标方案
       * @params color,feature,iconclass, i,coordinate,id
       * */
      this.addMarker = function (color, feature, iconclass, i, coordinate, id, params) {
        var marker = document.createElement('div');
        marker.className = "cssmarker-pin iconfont";
        if (color == undefined || color == null) {
          color = "#EB4F38";
        }
        marker.style.color = color;
        var icon = document.createElement('span');
        var m = i + 1;
        icon.innerHTML = "<i class='" + iconclass + "'>" + m + "</i>";
        marker.appendChild(icon);
        marker.onclick = function () {
          window.ObservableObj.set("clickFeature", feature);
          window.ObservableObj.dispatchEvent("clickFeatureEvt");
        };
        var iconOverlay = new ol.Overlay({
          element: marker,
          positioning: 'center-center',
          id: id,
          offset: [0, -10],
          stopEvent: true
        });

        iconOverlay.set('feature', feature);
        iconOverlay.set('layerName', params["layerName"]);
        this.map.addOverlay(iconOverlay);
        iconOverlay.setPosition(coordinate);
      };
      this.getTempVectorLayer = function (layerName, params) {
        var vectorLayer = this.getlayerByName(layerName);
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
          if (!this.getlayerByName(layerName)) {
            this.map.addLayer(vectorLayer);
          }
        }
        this.OrderLayerZindex();
        return vectorLayer;
      };
      this.addPolyline = function (layerName, feature, style) {
        var layer = this.getlayerByName(layerName);
        if (layer == null) {
          layer = this.getTempVectorLayer(layerName, {create: true});
          layer.set("selectable", true);
          this.lineLayers.push(layerName);
        }
        var lineStyle = null;
        if (!style) {//如果没有定义样式，使用默认
          style = {width: 6, color: '#0000EE'};
        }
        lineStyle = new ol.style.Style({
          stroke: new ol.style.Stroke(style)
        });
        var linefeature;
        var _feat = feature;
        if (_feat.geometry == undefined || _feat.geometry == null) {
          /*continue;*/
        }
        if (_feat.geometry.hasOwnProperty('paths')) {
          var feat = {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': _feat.geometry.paths[0]
            }
          };
          this.tempAddline.push(_feat.geometry.paths[0]);
          linefeature = (new ol.format.GeoJSON()).readFeature(feat);
        } else {
          linefeature = new ol.Feature({
            geometry: new ol.format.WKT().readGeometry(_feat.geometry)
          });
          var extent = linefeature.getGeometry().getExtent();
          this.zoomToExtent(extent, true);
        }
        _feat.attributes['layername'] = layerName;
        _feat.attributes['style'] = lineStyle;
        linefeature.setProperties(_feat.attributes);
        if (lineStyle != null) {
          linefeature.setStyle(lineStyle);//设置线段样式
        }
        layer.getSource().addFeature(linefeature);
        this.OrderLayerZindex();
        return linefeature;
      };
      /**
       * 添加路线集合
       * @param layerName 图层名称
       * @param features 图层集合
       */
      this.addPolylines = function (layerName, features, isclear, style) {
        if (isclear == undefined) {
          isclear = true;
        }
        if (isclear) {
          this.clearGraphics();
        }
        var tempLine = new ol.geom.MultiLineString([]);
        if (features != null && features.length > 0) {
          for (var i = 0; i < features.length; i++) {
            var geo;
            if (features[i].geometry.hasOwnProperty('paths')) {
              var feat = {
                'type': 'Feature',
                'geometry': {
                  'type': 'LineString',
                  'coordinates': features[i].geometry.paths[0]
                }
              };
              geo = (new ol.format.GeoJSON()).readFeature(feat).getGeometry();
            } else {
              geo = new ol.format.WKT().readGeometry(features[i].geometry);
            }
            tempLine.appendLineString(geo);
            this.addPolyline(layerName, features[i], style);
          }
          if (tempLine.getLineStrings().length > 0) {
            var extent = tempLine.getExtent();
            var bExtent = true;
            for (var m = 0; m < 4; m++) {
              if (extent[m] == Infinity || extent[m] == NaN) {
                bExtent = false;
                break;
              }
            }
            if (bExtent) {
              this.zoomToExtent(extent, true);
            }
          }
        }
      };
      /**
       * 添加面
       * */
      this.addPolygon = function (feature, params, isclear) {
        if (isclear) {
          this.clearGraphics();
        }
        if (!feature) {
          return;
        }
        var layer = null;
        if (params.layerName) {
          params["create"] = true;
          layer = this.getTempVectorLayer(params.layerName, params);
        } else {
          var layer = this.tempVectorLayer;
        }
        var Polygonstyle = new ol.style.Style({
          text: new ol.style.Text({
            font: "30px serif",
            fill: new ol.style.Fill({
              color: "#E50000"
            }),
            text: params.text,
            offsetX: 0.5,
            offsetY: -15,
          }),
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
       * 根据线要素进行定位
       */
      this.zoomByLineFeature = function (feature) {
        var linefeature = null;
        if (feature.geometry.hasOwnProperty('paths')) {
          var feat = {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': feature.geometry.paths[0]
            }
          };
          linefeature = (new ol.format.GeoJSON()).readFeature(feat);
        } else {
          linefeature = new ol.Feature({
            geometry: new ol.format.WKT().readGeometry(feature.geometry)
          });
        }
        if (linefeature != null) {
          var extent = linefeature.getGeometry().getExtent();
          this.zoomToExtent(extent, false);
        }

      };
      /**
       * 添加列表多条线
       * 特殊：1.列表一条数据对应多个路段
       *      2.在跟据id对应要素时需要找到当前id对应的多个要素
       *      3.按图例颜色标绘时同一个id对应的多条数据可能会有不同类型。
       * */
      this.addListviewLine = function (layerName, features, list, isclear) {
        //标绘时是否清空上次数据
        if (isclear == undefined) {
          isclear = true;
        }
        if (isclear) {
          this.clearGraphics();
        }
        var tempLine = new ol.geom.MultiLineString([]);
        if (features != null && features.length > 0) {
          for (var i = 0; i < features.length; i++) {
            var geo = new ol.format.WKT().readGeometry(features[i].geometry);
            tempLine.appendLineString(geo);
            var layer = this.getlayerByName(layerName);
            if (layer == null) {
              layer = this.getTempVectorLayer(layerName, {create: true});
              layer.set("selectable", true);
              this.lineLayers.push(layerName);
            }
            var lineStyle = null;
            var style = features[i].geoStyle;
            if (!style) {//如果没有定义样式，使用默认
              style = {width: 6, color: '#0000EE'};
            }
            lineStyle = new ol.style.Style({
              stroke: new ol.style.Stroke(style)
            });
            var linefeature;
            var _feat = features[i];
            linefeature = new ol.Feature({
              geometry: new ol.format.WKT().readGeometry(_feat.geometry)
            });
            _feat.attributes['layername'] = layerName;
            _feat.attributes['style'] = lineStyle;
            linefeature.setProperties(_feat.attributes);
            if (lineStyle != null) {
              linefeature.setStyle(lineStyle);//设置线段样式
            }
            layer.getSource().addFeature(linefeature);
            this.OrderLayerZindex();
          }
          //对要素进行缩放
          if (tempLine.getLineStrings().length > 0) {
            var extent = tempLine.getExtent();
            var bExtent = true;
            for (var m = 0; m < 4; m++) {
              if (extent[m] == Infinity || extent[m] == NaN) {
                bExtent = false;
                break;
              }
            }
            if (bExtent) {
              this.zoomToExtent(extent, true);
            }
          }
        }
      };
      /**
       * 绘制圆
       * @param x
       * @param y
       * @param radius 半径 米
       * @param layerName 图层 可以为null
       * @param islayerclear 是否清除当前绘制图层的临时绘制
       * @param isclear 是否清除地图上所有绘制图层
       */
      this.drawCircle = function (x, y, radius, layerName, islayerclear, isclear) {
        if (layerName == null) {
          layerName = 'bufferlayer';
        }
        radius = parseFloat((radius / 111000).toFixed(4));
        var layer = this.getlayerByName(layerName);
        if (layer == null) {
          layer = this.getTempVectorLayer(layerName, {create: true});
          this.polygonLayers.push(layerName);
        }
        layer.setZIndex(1);
        if (islayerclear) {
          layer.getSource().clear();
        }
        if (isclear) {//绘制前是否需要清除地图上的所有临时绘制图层
          this.clearGraphics();
        }
        var style = new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(65,105,225, 0.5)'
          })
        });

        var feature = new ol.Feature({
          geometry: new ol.geom.Circle([x, y], radius)
        });
        feature.setStyle(style);
        layer.getSource().addFeature(feature);
        this.OrderLayerZindex();
      };


      /**
       * 调整图层的顺序，保证点压线，线压面
       */
      this.OrderLayerZindex = function () {
        var self = this;
        if (this.map) {
          var layerindex = 5;
          var layers = this.map.getLayers();
          //调整面图层
          layers.forEach(function (layer) {
            var layerNameTemp = layer.get("layerName");
            if (self.polygonLayers.indexOf(layerNameTemp) >= 0) {
              layer.setZIndex(layerindex++);
            }
          }, this);
          //调整线图层
          layers.forEach(function (layer) {
            var layerNameTemp = layer.get("layerName");
            if (self.lineLayers.indexOf(layerNameTemp) >= 0) {
              layer.setZIndex(layerindex++);
            }
          }, this);
          //调整点图层
          layers.forEach(function (layer) {
            var layerNameTemp = layer.get("layerName");
            if (self.pointLayers.indexOf(layerNameTemp) >= 0) {
              layer.setZIndex(layerindex++);
            }
          }, this);
        }
      };
      /**
       * 打印地图
       */
      this.printMap = function () {
        var explorer = navigator.userAgent;
        var broz = "";
        if (explorer.indexOf("MSIE") >= 0) {
          broz = "MSIE";
        }
        else if (explorer.indexOf("Firefox") >= 0) {
          broz = "Firefox";
        }
        else if (explorer.indexOf("Chrome") >= 0) {
          broz = "Chrome";
        }
        else if (explorer.indexOf("Opera") >= 0) {
          broz = "Opera";
        }
        else if (explorer.indexOf("Safari") >= 0) {
          broz = "Safari";
        }
        else if (explorer.indexOf("Netscape") >= 0) {
          broz = "Netscape";
        }
        var printWindow = window.open("");
        var strInnerHTML = document.getElementsByClassName("ol-viewport")[0].cloneNode(true);

        var strHeader = "<!DOCTYPE html><html><head><META HTTP-EQUIV='pragma' CONTENT='no-cache'><META HTTP-EQUIV='Cache-Control' CONTENT='no-cache, must-revalidate'><META HTTP-EQUIV='expires' CONTENT='Wed, 26 Feb 1997 08:21:57 GMT'><meta http-equiv='Content-Type' content='text/html; charset=utf-8' /><meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' /><meta name='apple-mobile-web-app-capable' content='yes' /><title>地图打印</title>";

        var strScript = "<script type = 'text/javascript'>" + "\n" + "function printDiv(){window.print();}<\/script>";
        var strBody = "</head><body><div id='printheader' class='print-header'><div>" + "</div><div id='superft'><div class='printClose'>" + "<span class='newuiPrint' onclick = 'printDiv()'></span></div></div></div></body></html>";
        var strStyle = "<style type='text/css'>.ol-scale-line-inner {border: 1px solid #eeeeee;border-top: none;color: #eeeeee;font-size: 10px;text-align: center;margin: 1px;will-change: contents, width;} .ol-scale-line {background: #438EB9;border-radius: 4px;bottom: 60px;left: 40px;padding: 2px;position: absolute;} .ol-zoomslider .ol-unselectable div {display: none;} .ol-control {display: none;} .print-header {margin: auto;height: 42px;top: 50;}#superft {content: '.';display: block;overflow: hidden;clear: both;padding-top: 1px;}.printClose {margin-bottom: 20;float: right;}  .printClose span {background-position: 0 0;cursor: pointer;margin-right: 0;margin-top: 5px;display: inline-block;width:69px;height: 29px;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAdCAYAAAD8UKGzAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAGmSURBVHja7Ji/coJAEMY/Mz4UDY1VGhBeBkYpmC2Q8WlEbGwSChvHl7o02Qz/Dhe8OJjc192xt3P749s7dFFV1QeAFaxYn0sAK9d1LYpvXS6X1ZvF0JWFYqHItAQApZQlYZ0icIpUWZZpnyVJ8j+hAECapp05IkKWZZPAeJ4HADidTg8Xw7kezWfsTEnTFESE7XY7aT3vwff9wbiyLBvjvviyLBuAhtYbcYpORAQA2O12k8G0N80FSwrRxfD8PdjGodRbiuHcU3uT9bEEwstdyZJ8x+MRALBerxvjvvWSfLqYKblETsnzfJQTOH6z2Tzt7TLcp9w+eZ733jjSc0YKpl5U3TVStdc8AkncPuyQsYB0uYMg6MwVRfE67TMFxlgxkJf8eDMNoc8xU2Qqz+jbR3rd1l0lzT0Up3sWhmFn7nA4NJ4ppRpxRttHeqYQEYjo19uNAXDBDEMXZ7R94jgWO6QNJ47jwZi+Nz00b6JgiRZVVSnHcUTB+/1eFHcPxpx1vV7HnSlRFBn7op2z7J9MFoqFMq9fydYpf9Qp59vt9m5R/Oj8NQCb09wiGVf7OgAAAABJRU5ErkJggg==);}#mapContainer {margin: auto;width: 936px;height: 522px;position: relative;}.ol-zoomslider .ol-unselectable div {display: none;}.ol-control {display: none;}</style>";
        var Css1 = "<link type='text/css' rel='stylesheet' href= " + appConfig.utils.getRootPath() + "jxgis-web/src/main/webapp/dist/css/min/main.min.css>";
        var olcss = "<link type='text/css' rel='stylesheet' href= " + appConfig.utils.getRootPath() + "/public/map/ol.css>"
        var strHTML = Css1 + olcss + strHeader + strStyle + strScript + strBody;
        printWindow.document.write(strHTML);
        printWindow.document.close();
        var addHTMLdom = setInterval(function () {
          var targetElement = printWindow.document.getElementById("printheader");
          if (targetElement) {
            window.clearInterval(addHTMLdom);
            $(strInnerHTML).insertAfter(targetElement);
            if (broz.toLowerCase() == 'firefox') {
              printWindow.onload = onloadHTML;
            } else if (broz.toLowerCase() == 'safari' || broz.toLowerCase() == 'chrome' || broz.toLowerCase() == 'msie') {
              window.setTimeout(onloadHTML, 100);
            }
          }
        }, 300);


        function onloadHTML() {
          var olzoomslider = printWindow.document.getElementsByClassName("ol-zoomslider ol-unselectable")[0];
          if (olzoomslider) {
            olzoomslider.parentNode.removeChild(olzoomslider);
          }
          var overView = printWindow.document.getElementsByClassName("ol-overviewmap ol-custom-overviewmap ol-unselectable ol-control ol-collapsed")[0];
          if (overView) {
            overView.parentNode.removeChild(overView);
          }


          var canvasPrint = printWindow.document.getElementsByTagName("canvas");
          var canvasMap = document.getElementsByTagName("canvas");
          for (var i = 0, length = canvasPrint.length; i < length; i++) {
            pasteCanvas(canvasMap[i], canvasPrint[i]);
          }
        }

        var pasteCanvas = function (canvasSource, canvasTarget) {
          var destCtx = canvasTarget.getContext('2d');
          destCtx.drawImage(canvasSource, 0, 0);
        };
      };

      /**
       * 将地图保存为图片
       */
      this.saveMapToImage = function () {
        var canvas = document.getElementById('map');
        var exportPNGElement = canvas.getElementsByTagName('canvas')[0];
        console.log(exportPNGElement);
        this.map.once('postcompose', function (event) {
          var image = exportPNGElement.toDataURL("image/png");
          var w = window.open('about:blank', 'image from canvas');
          w.document.write("<img src='" + image + "' alt='from canvas'/>");
        });
        this.map.renderSync();
      };

      /**
       * 全图
       */
      this.zoomMaxExtent = function () {
        this.map.getView().setCenter(this.appConfig.mapConfig.center);
        this.map.getView().setZoom(this.appConfig.mapConfig.zoom);
      };
      /*
       * 地图放大缩小工具
       * */
      this.zoomIn = function () {
        var zoom = this.map.getView().getZoom();
        this.map.getView().setZoom(zoom + 1);
      };

      this.zoomOut = function () {
        var zoom = this.map.getView().getZoom();
        this.map.getView().setZoom(zoom - 1);
      };
      /*
       * 功能：气泡弹窗popup
       * */
      this.showPopup = function (obj, offset) {
        if (this.popupOverlay) {
          this.popupOverlay.hide();
          this.map.removeOverlay(this.popupOverlay);
          this.popupOverlay = null;
        }
        if (offset) {
          offset = offset;
        } else {
          offset = [1, -13];
        }
        var m = {
          positioning: 'center-center',
          offset: offset
        };
        obj = $.extend(obj, m);
        this.popupOverlay = new ol.Overlay.Popup(obj);
        this.map.addOverlay(this.popupOverlay);
        this.popupOverlay.show(obj.coordinate, obj.content);
        /*                this.mapTools.iQuery = false;*/
      };


      /*
       * 功能：气泡弹窗popup
       * */
      this.showVideoPopup = function (obj, offset) {
        if (!this.videoPopupOverlay) {
          if (offset) {
            offset = offset;
          } else {
            offset = [1, -13];
          }
          var m = {
            positioning: 'center-center',
            offset: offset
          };
          obj = $.extend(obj, m);
          this.videoPopupOverlay = new ol.Overlay.Popup(obj);
          this.map.addOverlay(this.videoPopupOverlay);
        }
        this.videoPopupOverlay.show(obj.coordinate, obj.content);
        this.mapTools.iQuery = false;
      };
      /*
       * 关闭popup
       * */
      this.closePopup = function () {
        window.ObservableObj.set("selectFeature", null);
        window.ObservableObj.set("mouseOnFeature", null);
        if (this.popupOverlay) {
          this.popupOverlay.hide();
          this.map.removeOverlay(this.popupOverlay);
          this.popupOverlay = null;
        }
        return false;
      };

      /*
       * 关闭视频popup
       * */
      this.closeVideoPopup = function () {
        window.ObservableObj.set("selectFeature", null);
        window.ObservableObj.set("mouseOnFeature", null);
        if (this.videoPopupOverlay) {
          this.videoPopupOverlay.hide();
        }
        return true;
      };


      /**
       * add by zhangfk 20160709
       * @param layerName
       * @desc 清除叠加图层
       */
      this.removeTileLayer = function (layerName) {
        var self = this;
        if (this.map) {
          var layers = this.map.getLayers();
          layers.forEach(function (layer) {
            var titleTemp = layer.get("title");
            if (titleTemp === layerName) {
              self.map.removeLayer(layer);
            }
          }, this);
        }
      };
      this.clearGraphics_ = function () {
        this.removeDrawInteraion();
        this.deactiveAll();
        this.map.getOverlays().clear();
        this.cleartempgraphiclayers();
        var elelment = this.map.getTargetElement();
        if (elelment) {
          this.cursor_ = "url(images/cur/openhand.cur), auto";
          elelment.style.cursor = this.cursor_;
        }
      };
      /**
       * 添加行政区划
       * @param feature
       * @param params
       * @param isclear
       */
      this.addCode = function (feature, params, isclear) {
        if (isclear) {
          this.clearGraphics_();
        }
        if (!feature) {
          return;
        }
        var layer = null;
        if (params.layerName) {
          params["create"] = true;
          layer = this.getTempVectorLayer(params.layerName, params);
        } else {
          var layer = this.tempVectorLayer;
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
        this.zoomToExtent_(extent, true);
      };
      /*
       *@param{ol.Extent} extent缩放到的范围
       *@param{bool} isanimation是否使用动画
       *@param{number} duration可选的动画时常
       * */
      this.zoomToExtent_ = function (extent, isanimation, duration) {
        var view = this.map.getView();
        var size = this.map.getSize();
        /**
         *  @type {ol.Coordinate} center The center of the view.
         */
        var center = ol.extent.getCenter(extent);
        if (!isanimation) {
          view.fit(extent, size, {
            padding: [0,0,0,0],
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
              padding: [0,0,0,0],
              nearest: false
            });
            console.log();
            view.on("change:resolution",function (ev) {
              console.log(view.getZoom());
            });
            var timer = setTimeout(function () {
              view.set('minZoom',view.getZoom());
              clearTimeout(timer);
            },500)
          }
        }
      };
    };
    return {
      HDMap: HDMap
    };
  });