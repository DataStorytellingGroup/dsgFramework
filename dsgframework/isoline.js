// Enterprise Routing Isoline wrapper ******************

var IsolineRouting = {

  baseUrl: 'https://route.st.nlp.nokia.com/routing/6.2/calculateisoline.json?',
  credentials: null,
  app_code: null,

  setup: function () {
    this.credentials = AppCore.credentials;
  },

  getIsoline: function ( lat, lon, distance, transportType ) {

    var tmp_params = {
      mode:'fastest;' + transportType,
      start: 'geo!' + lat +','+ lon,
      distance: distance,
      app_id: this.credentials.app_id,
      app_code: this.credentials.app_code
    };

    var tmp_url = this.baseUrl + $.param( tmp_params );

    return $.ajax({
      url : tmp_url,
      dataType: 'JSONP',
      // jsonpCallback: 'output',
      jsonp : 'jsonCallback',
      type: 'GET'
    });
  },

  getIsochrone: function ( lat, lon, hours, minutes, transportType ) {
    var tmp_params = {
      mode:'fastest;' + transportType,
      start: 'geo!' + lat +','+ lon,
      time: 'PT' + hours + 'H' + minutes + 'M',
      app_id: this.credentials.app_id,
      app_code: this.credentials.app_code
    };

    var tmp_url = this.baseUrl + $.param( tmp_params );

    return $.ajax({
      url : tmp_url,
      dataType: 'JSONP',
      // jsonpCallback: 'output',
      jsonp : 'jsonCallback',
      type: 'GET'
    });
  },

  draw: function ( shape, styles, map ) {
    
    var strip = new H.geo.Strip();
    
    var customStyle = {
      strokeColor: styles.strokeColor? styles.strokeColor : "red",
      fillColor: styles.fillColor? styles.fillColor :'blue',
      lineWidth: styles.strokeWidth? styles.strokeWidth : 2,
      lineCap: 'square',
      lineJoin: 'bevel'
    };
    
    shape.forEach(function(point) {
      var parts = point.split(',');
      strip.pushLatLngAlt(parts[0], parts[1]);
    });

    var polygon = new H.map.Polygon(strip, { style: customStyle });

    // On mouse enter
    // polygon.addEventListener('pointerenter', function (evt) {
    //   evt.target.setStyle({
    //     strokeColor: 'rgba(255, 255, 255, 0.3)',
    //     fillColor: 'rgba(0, 0, 0, 0.3)',
    //     lineWidth: 2,
    //     lineCap: 'square',
    //     lineJoin: 'bevel'
    //   });
    // });
    
    // // On mouse leave
    // polygon.addEventListener('pointerleave', function (evt) {
    //   evt.target.setStyle({
    //     strokeColor: 'rgba(0, 0, 0, 0.1)',
    //     fillColor: 'rgba(0, 0, 0, 0.1)',
    //     lineWidth: 1,
    //     lineCap: 'square',
    //     lineJoin: 'bevel'
    //   });
    // });

    map.addObject(polygon);
  }
};