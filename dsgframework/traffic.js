var Traffic = {
  
  baseURL: "https://traffic.cit.api.here.com/traffic/6.0/incidents.json?",
  credentials: null,
  app_code: null,
  map: null,

  setup: function ( credentials ) {
    this.credentials = credentials;
  },

  getTrafficIncidents: function ( rect, criticality ) {

    var deferred = $.Deferred();
    var topLeft = rect.getTopLeft();
    var bottomRight = rect.getBottomRight();

    var tmp_params = {
      bbox: '' + topLeft.lat +','+ topLeft.lng + ';' + bottomRight.lat + ',' + bottomRight.lng,
      criticality: criticality,
      app_id: this.credentials.app_id,
      app_code: this.credentials.app_code
    };
    
    var tmp_url = this.baseURL + $.param( tmp_params );

    $.ajax({
      url : tmp_url,
      dataType: 'JSONP',
      jsonp : 'jsonCallback',
      type: 'GET',
      complete: function (response) {
        deferred.resolve( response );
      }
    });

    return deferred.promise();

  },

  getTrafficOnCorridor: function () {

    // https://traffic.cit.api.here.com/traffic/6.0/incidents.json?
    // corridor=51.5072%2C-0.1275%3B51.50781%2C-0.13112%3B51.51006%2C-0.1346%3B1000
    // &app_id=UythJfir49K0ZHzunhFA
    // &app_code=z9BEl98pKbJ96IKpeF30BQ

    // var parseRoute = "";
    // for (var i = 0; i < route.length; i++) {
    //   var parts = route[i].split(',');
    //   parseRoute += parts[0] + "," + parts[1] + ";";
    // };
    var parseRoute = "48.242691808806434,11.640549249690736;48.04430190346719,11.505966730159486;1000";

    var deferred = $.Deferred();

    $.ajax({
      url: 'https://traffic.cit.api.here.com/traffic/6.0/incidents.json',
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'jsonpcallback',
      data: {
        corridor: parseRoute,
        app_id: this.credentials.app_id,
        app_code: this.credentials.app_code
      },
      success: function ( response ) {
        deferred.resolve( response );
      }
    });

    return deferred.promise();
  },

  getTrafficFlowOnCorridor: function () {

    var parseRoute = "48.242691808806434,11.640549249690736;48.04430190346719,11.505966730159486;1000";
    var deferred = $.Deferred();

    $.ajax({
      url: 'https://traffic.cit.api.here.com/traffic/6.1/flow.json',
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'jsonpcallback',
      data: {
        corridor: '51.5072,-0.1275;51.50781,-0.13112;51.51006,-0.1346;1000',
        app_id: this.credentials.app_id,
        app_code: this.credentials.app_code
      },
      success: function ( data ) {
        deferred.resolve( data );
      }
    });

    return deferred.promise();
  }

}