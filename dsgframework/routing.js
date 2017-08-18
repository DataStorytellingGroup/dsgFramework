var Routing = {

  platform:   null,
  params:     null,
  router:     null,
  polyline:   null,

  // INTERNAL
  i_vehicle_type: 'car',
  i_traffic: 'enabled',
  i_tollroad:0,
  i_motorway:0,
  i_boatFerry:0,
  i_railFerry:0,
  i_tunnel:0,
  i_dirtRoad:0,
  i_park:0,
  i_alternative:0,

  setup: function () {

    if ( AppCore.credentials )
      this.platform = AppCore.platform;
    else {
      console.error("Need to set your credentials in AppCore")
      return;
    }

    this.router = this.platform.getRoutingService();
    this.updateParams();

    this.errorHandler = function(e) {
      console.error(e);
    };
  },


  // Option: [car | pedestrian | carHOV | publicTransport | publicTransportTimeTable | truck | bicycle ]
  setVehicleType: function ( vehicleType ) {
    this.i_vehicle_type = vehicleType;
    this.updateParams();
  },

  setTraffic: function ( bool ) {
    this.i_traffic = bool? 'enabled' : 'disabled';
    this.updateParams();
  },

  // -3  strictExclude The routing engine guarantees that the route does not contain strictly excluded features. If the condition cannot be fulfilled no route is returned.
  // 0   normal The routing engine does not alter the ranking of links containing the corresponding feature.
  setTolls: function ( bool ) {
    this.i_tollroad = bool? 0 : -3;
    this.updateParams();
  },

  setMotorways: function ( bool ) {
    this.i_motorway = bool? 0 : -3;
    this.updateParams();
  },

  setFerry: function ( bool ) {
    this.i_boatFerry = bool? 0 : -3;
    this.i_railFerry = bool? 0 : -3;
    this.updateParams();
  },

  setTunnel: function ( bool ) {
    this.i_tunnel = bool? 0 : -3;
    this.updateParams();
  },

  setDirtRoad: function ( bool ) {
    this.i_dirtRoad = bool? 0 : -3;
    this.updateParams();
  },

  setPark: function ( bool ) {
    this.i_park = bool? 0 : -3;
    this.updateParams();
  },

  setAmountOfAlternative: function ( int_alternatives ) {
    this.i_alternative = int_alternatives;
    this.updateParams();
  },

  updateParams: function () {
    var route_mode =  'fastest;' + 
                      this.i_vehicle_type + ';' + 
                      'traffic:' + this.i_traffic + ';' +
                      'tollroad:' + this.i_tollroad + ',' + 
                      'motorway:' + this.i_motorway + ',' +
                      'boatFerry:' + this.i_boatFerry + ',' +
                      'railFerry:' + this.i_railFerry + ',' +
                      'tunnel:' + this.i_tunnel + ',' +
                      'dirtRoad:' + this.i_dirtRoad + ',' +
                      'park:' + this.i_park;

    
    this.params = {
      mode: route_mode,
      representation: 'display',
      routeattributes: 'sc,sm,sh,bb,lg,no,shape',
      legattributes: 'li',
      linkattributes: 'sh,nl,fc',
      alternatives: this.i_alternative
    };
  },

  getBoundingBox: function ( result ) {
    return result.response.route[0].boundingBox;
  },

  getRoute: function ( result ) {
    return result.response.route[0];
  },

  getLinks: function ( result ){
    return this.getRoute(result).leg[0].link;
  },

  getShape: function ( result ) {
    return this.getRoute(result).shape;
  },

  calculate: function ( from, to, callback ) {
    this.router.calculateRoute($.extend({}, this.params, {
      waypoint0: from.lat + ',' + from.lng,
      waypoint1: to.lat   + ',' + to.lng,
      returnelevation: true
    }), callback, this.errorHandler);
  },

  divide: function (route, minutes, start) {

    if (start === undefined) start = moment();
    if (minutes === undefined) minutes = 60;

    var startDate = new Date( moment().toString() )
    var seconds    = minutes * 60;
    var maneuvers  = route.leg[0].maneuver;
    var totalTime  = maneuvers.reduce(function(sum, item){ return sum + item.travelTime; }, 0);

    // var travelTime = (+start.format('mm')) * 60 + (+start.format('s')) - seconds;
    var travelTime = 0;
    var result     = [];

    maneuvers.forEach(function(item, key) {
      
      travelTime += item.travelTime;
      var last = result[result.length - 1]? result[result.length - 1].travelTime : 0;
      var timeDiff = travelTime - last;

      // we divide the total time of the manuver in x minute chunks
      var l = Math.floor( timeDiff / seconds );
      var traffic_notes = [];
      for (var i = 0; i < item.note.length; i++) {
        traffic_notes.push(item.note[i])
      };

      for (var i = 0; i < l; i++ ) {

        var time = last + i * seconds;
        var nextTime = last + (i + 1) * seconds;

        // Date
        var tmpDate = new Date( moment(startDate).add( time, "seconds").toString() )
        
        // And we split the route in this chunks of time
        var parts = route.shape[Math.floor(time * route.shape.length / totalTime)];
        var parts2 = route.shape[Math.ceil(nextTime * route.shape.length / totalTime)];

        if (parts == null || parts2 == null ) break;
        
        var index1 = route.shape.indexOf(parts);
        var index2 = route.shape.indexOf(parts2);
        var tmpShape = route.shape.slice(index1,index2);;
      
        parts = parts.split(",");
        parts2 = parts2.split(",");

        result.push({
          travelTime: time,
          date: tmpDate,
          shape:tmpShape,
          weather: { humidity:0, temperature:0, iconName:"", iconLink:"" },
          position: { lat: +parts[0], lng: +parts[1], alt: +parts[2]},
          trafficMessages:traffic_notes,
          traffic:null
        });
      }
    });
    
    return result;

  }


  // clear: function () {
  //   if (this.polyline) {
  //     map.removeObject(this.polyline);
  //     this.polyline = null;
  //   }
  // },


  // draw: function ( shape, styles ) {
    
  //   var strip = new H.geo.Strip();
      
  //   shape.forEach( function ( point ) {
  //     var parts = point.split(',');
  //     strip.pushLatLngAlt( parts[0], parts[1] );
  //   });

  //   this.polyline = new H.map.Polyline(strip, { style: styles });

  //   // Add the polyline to the map
  //   // map.addObject(this.polyline);

  //   return this.polyline;

  // }
}