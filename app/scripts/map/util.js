/**
 * Created by FDD on 2016/11/13.
 */
define(['config'], function (appConfig) {
  var util = {
    nIndex: 0,
    getuuid: function () {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      var uuid = s.join("");
      return uuid;
    },
    /**
     * 首字母转大写
     * @param str  需要转换的字符串
     * @returns {string}  返回转换后的字符串
     */
    firstLetterToUpper:function(str){
      var firstStr = str.substr(0,1);
      var tempElse = str.substr(1, str.length - 1);
      return (firstStr.toUpperCase() + tempElse);
    },
    setSessionStorage: function (key, obj) {
      var strObj = JSON.stringify(obj);
      window.sessionStorage.setItem(key, strObj);
    },
    getSessionStorage: function (key) {
      var strObj = window.sessionStorage.getItem(key);
      return JSON.parse(strObj);
    },
    removeSessionStorage: function(key){
      window.sessionStorage.removeItem(key);
    },
    /**
     * 获取两数值之间的随机值
     * @param t1
     * @param t2
     * @param t3
     */
    getrandom: function (t1, t2, t3) {//t1为下限，t2为上限，t3为需要保留的小数位
      if (!t1 || isNaN(t1)) {
        t1 = 0;
      }
      if (!t2 || isNaN(t2)) {
        t2 = 1;
      }
      if (!t3 || isNaN(t3)) {
        t3 = 0;
      }
      t3 = t3 > 15 ? 15 : t3; // 小数位不能大于15位
      var ra = Math.random() * (t2 - t1) + t1, du = Math.pow(10, t3);
      ra = Math.round(ra * du) / du;
      return ra;
    },
    /**
     *
     * @returns {{_year: string, _month: string, _day: string, getYear: date.getYear, getMonth: date.getMonth, getDay: date.getDay}}
     */
    timestampFormat: function (str) {
      var date = new Date(str);
      Y = date.getFullYear() + '-';
      M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      D = date.getDate() + ' ';
      h = date.getHours() + ':';
      m = date.getMinutes() + ':';
      s = date.getSeconds();
      return Y + M + D + h + m + s;
    },

    /**
     * 解析路径分析中的路段compresedGeometry
     */
    ExtractPointsFromCompressedGeometry: function (compresedGeometry) {
      this.nIndex = 0;
      var result = [];
      var dMultBy = this.ExtractInt(compresedGeometry);
      var nLastDiffX = 0;
      var nLastDiffY = 0;
      var nLength = compresedGeometry.length; // reduce call stack
      while (this.nIndex != nLength) {
        // extract number
        var nDiffX = this.ExtractInt(compresedGeometry); // exception
        var nDiffY = this.ExtractInt(compresedGeometry); // exception
        // decompress
        var nX = nDiffX + nLastDiffX;
        var nY = nDiffY + nLastDiffY;
        var dX = nX / dMultBy;
        var dY = nY / dMultBy;
        // add result item
        var point = [];
        point.push(dX);
        point.push(dY);
        result.push(point); // memory exception
        // prepare for next calculation
        nLastDiffX = nX;
        nLastDiffY = nY;
      }
      return result;
    },
    ExtractInt: function (src) {
      var bStop = false;
      var result = '';
      var nCurrentPos = this.nIndex;
      while (!bStop) {
        var cCurrent = src[nCurrentPos];
        if (cCurrent == '+' || cCurrent == '-') {
          if (nCurrentPos != this.nIndex) {
            bStop = true;
            continue;
          }
        }
        result += cCurrent; // exception
        nCurrentPos++;
        if (nCurrentPos == src.length) // check overflow
          bStop = true;
      }
      var nResult = Number.MIN_VALUE;
      if (result.length > 0) {
        nResult = this.FromStringRadix32(result);
        this.nIndex = nCurrentPos;
      }
      return nResult;
    },
    FromStringRadix32: function (s) {
      var result = 0;
      for (var i = 1; i < s.length; i++) {
        var cur = s[i];
        if (cur >= '0' && cur <= '9')
          result = (result << 5) + cur.charCodeAt() - ('0').charCodeAt();
        else if (cur >= 'a' && cur <= 'v')
          result = (result << 5) + cur.charCodeAt() - ('a').charCodeAt() + 10;
      }
      if (s[0] == '-')
        result = -result;
      return result;
    },
    getWarnImgurl: function (attri) {
      var grade = attri['GRADE'];
      var featureType = "";
      switch (grade) {
        case "一"://一级响应
          featureType = 'warnPoint';
          break;
        case "二"://二级响应
          featureType = 'warnIIPoint';
          break;
        case "三"://三级响应
          featureType = 'warnIIIPoint';
          break;
        case "四"://四级响应
          featureType = 'warnHoverPoint';
          break;
      }
      return appConfig.markConfig.getMarkConfig(featureType).imgURL;
    },
    IsEmptyObject:function(params){
      for(var t in params){
        return false;
      }
      return true;
    }
  };
  return util;
});