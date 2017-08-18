var Geocoder = {

  platform:   null,
  geocoder:   null,
  platform:   null,

  setup: function () {

    if ( AppCore.credentials )
      this.platform = AppCore.platform;
    else 
      console.log("Need to set your credentials in AppCore")

    this.geocoder = this.platform.getGeocodingService();

    this.errorHandler = function(e) {
      console.log(e);
    };
  },

  search: function ( address ) {
    var deferred = $.Deferred();
    this.geocoder.search({ 
      searchtext: address,
      jsonattributes: 1
     
     }, function (response) {
      deferred.resolve( response );
    }, this.errorHandler );

    return deferred.promise();
  },

  doesResponseExist: function (result) {
    return result.response.view.length > 0;
  },

  reverseGeocoding: function ( latitude, longitude ) {

    var deferred = $.Deferred();
    this.geocoder.reverseGeocode( { lat: latitude, lon: longitude, mode: "retrieveAddresses" , prox: ("" + latitude + "," + longitude + "," + 1000) }, function (response) {
      deferred.resolve( response );
    }, this.errorHandler );

    return deferred.promise();

  },


  getGeoshapeFrom: function ( searchText, shapeLevel ) {
    //  [country, state, county, city, district, street, houseNumber, postalCode, addressLines, additionalData]
    var deferred = $.Deferred();
    
    this.geocoder.geocode({
      searchText: searchText,
      additionalData: "IncludeShapeLevel," + shapeLevel,
      maxResults: 1,
      jsonattributes: 1,
      requestId: shapeLevel

    }, function (result) {

      var shapeText = result.response.view[0].result[0].location.shape.value;
      var infoObj = result.response.view[0].result[0].location.address;
      var obj = { result: result, shape: shapeText };
      deferred.resolve( obj );

    }, function (e) {
        console.log(searchText, "something went wrong");
      }
    );

    return deferred.promise();

  },

  getResult: function ( result ) {
    return result.response.view[0].result[0];
  },

  getViewBoundingBox: function ( result ) {
    var bottom_right = result.response.view[0].result[0].location.mapView.bottomRight;
    var top_left = result.response.view[0].result[0].location.mapView.topLeft;
    return new H.geo.Rect( top_left.latitude, top_left.longitude, bottom_right.latitude, bottom_right.longitude );
  },

  // Return the latitude-longitude
  getDisplayPosition: function ( result ) {
  	return this.getResult(result).location.displayPosition;
  }, 

  // Return the address
  getAddress: function ( result ) {
  	return this.getResult(result).location.address;
  },

  // Return the 3 letter country code
  getISO3: function ( result ) {
    return this.getResult(result).location.address.country;
  }

}