var Drawing = {

  shape: null,
  info: null,
  previous_selected_obj:null,
  overall_percent_before:0,
  overall_percent_after:0,

  parseShapeToGeoJson: function ( shape ) {
    
    var geojson;

    if ( shape.search("POLYGON") == 0){
          
      geojson = {"type":"Polygon", "coordinates":[[]]};
      var str = shape.substring("POLYGON((".length, shape.length-2);
      str = str.replace("(", "");  
      var coord_list = str.split(",");
      
      for (var i = 0; i < coord_list.length; i++) {
        var coord = coord_list[i].split(" ");
        if (coord.length > 2) { coord.splice(0, 1); }
        geojson.coordinates[0].push([parseFloat(coord[0]), parseFloat(coord[1])]);
      };

    } else if ( shape.search("MULTIPOLYGON") == 0) {

      // If is a multipolygon, we only take the biggest poly
      // to make sure the center is touching lands, 
      // otherwise the center of countrys with multiple islands
      // could lies over water surfaces

      var str = shape.substring("MULTIPOLYGON(((".length, shape.length-3);
      polygon_list = str.split("))");
      geojson = {"type":"Polygon", "coordinates":[]};

      for (var i = 0; i < polygon_list.length; i++) {
        geojson.coordinates[i] = [];
        var parenthese_pos = polygon_list[i].search("\\(");
        var polygon_str = polygon_list[i].substring(parenthese_pos+1, polygon_list[i].length);
        polygon_str = polygon_str.replace("(", "");        
        var coord_list = polygon_str.split(",");

        for (var x = 0; x < coord_list.length; x++) {
          
          // Remove spaces from sides
          var coord_str = coord_list[x].trim();
          var pos = coord_str.search("\\(") + 1;
          coord_str = coord_list[x].substring( pos, coord_list[x].length);
          coord = coord_list[x].split(" ")

          if (coord.length > 2) coord.splice(0, 1);
          geojson.coordinates[i].push([parseFloat(coord[0]), parseFloat(coord[1])]);
          
        };
      };
    }

    return geojson;
      
  },


  drawSvgMarker: function ( props ) {
    
    
    if ( props.anchor && typeof props.anchor === "string" ){
      
      props.anchor = props.anchor.split(" ");
      var dimentions = [props.size.width,props.size.height];   
      if (props.anchor.length == 1) props.anchor.push(props.anchor[0])
      
      for (var i = 0; i < props.anchor.length; i++) {
        if (props.anchor[i] == "left") props.anchor[i] = 0;
        else if (props.anchor[i] == "right") props.anchor[i] = dimentions[i];
        else if (props.anchor[i] == "top") props.anchor[i] = 0;
        else if (props.anchor[i] == "bottom") props.anchor[i] = dimentions[i];
        else if (props.anchor[i] == "center") props.anchor[i] = dimentions[i] * 0.5;
      };

      props.anchor = { x:props.anchor[0], y:props.anchor[1] };
    } 

    props.anchor = { x:props.anchor.x * window.devicePixelRatio, y:props.anchor.y * window.devicePixelRatio };

    var tmp_icon = new H.map.Icon( props.icon, { 
      size: new H.math.Size( props.size.width * AppCore.ppi, props.size.height * AppCore.ppi ),
      anchor: props.anchor? props.anchor : null, 
      asCanvas:true
    }); 
    
    return new H.map.Marker( props.coordinates,{ icon: tmp_icon });

  },

  createTiledMarkers: function ( provider, svg, props ) {

      var min = props.size.min? props.size.min : 20;
      var max = props.size.max? props.size.max : 30;
      var eps = props.cluster.eps? props.cluster.eps : 30;
      var minWeight = props.cluster.minWeight? props.cluster.minWeight : 2;

      var layer = new H.datalens.ObjectLayer( provider, {

      clustering: {

        rowToDataPoint: function(row) {
          return new H.clustering.DataPoint(row[props.columns.lat], row[props.columns.lng], 1);
        },
        options: function(zoom) {
          return {
              strategy: H.clustering.Provider.Strategy.FASTGRID,
              eps: eps,
              minWeight: zoom < 11? minWeight : Infinity
          };
        }
      },

       //accepts data row and returns map object
        rowToMapObject: function(cluster) {
          
          var marker = new H.map.Marker(cluster.getPosition());
          
          if (cluster.isCluster()){
            var wt = cluster.getWeight();
            marker.addEventListener('tap', function (e) {
              $('.info-bubble').text( wt + " crap in here" )
            })
          } else {
            marker.addEventListener('tap', function (e) {
              $('.info-bubble').text( "I am a crap place it here" )
              console.log(e.target.getData())
            })
          }
          return marker;
        },
        rowToStyle: function(cluster, zoom) {
            var weight = cluster.getWeight() + 2;
            var scale = MathUtilities.mapValues( weight, 1, 10, min, max, true )
            var size = {w:scale,h:scale};
            var anchor = { x:size.w / 2, y:size.h / 2 };
            icon = new H.map.Icon( svg, { size: size, anchor: anchor, asCanvas:false });
            return {icon: icon};
        }
    }
  );

  return layer;

  },

  greatCircle: function ( origin, destination, styles, resolution, data ) {

    var tmp_loc = [];
    
    for ( var x = 0; x <= styles.resolution; x++ ) {
      var f = x / styles.resolution;
      tmp_loc.push( MathUtilities.interpolate( origin, destination, f ));
    }

    var strip = new H.geo.Strip();
    for (var c = 0; c < tmp_loc.length; c++) {
      strip.pushLatLngAlt( tmp_loc[c].lat, tmp_loc[c].lng );
    };

    this.polyline = new H.map.Polyline( strip, { style: styles.normal, arrows:{ color:"#FFFFFF", width:4, length:4, frequency:8}});
    this.polyline.styles = styles;
    this.polyline.data = data;

    var mouseEnter = function ( evt ) {            
      evt.target.setStyle( evt.target.styles.hover );
    };

    var mouseOut = function ( evt ) {
      evt.target.setStyle( evt.target.styles.normal );
    };

    this.polyline.addEventListener('pointerenter', mouseEnter );
    this.polyline.addEventListener('pointerleave', mouseOut );
    return this.polyline;
  },

  drawBezier: function ( origin, destination, styles, resolution, map ) {

      var strip = new H.geo.Strip();
      var arrow_strip = new H.geo.Strip();
      var tmp_arc = styles.arcAmount? styles.arcAmount : 0.38;
      var group = new H.map.Group;
      var another_styles;
      var offset = styles.normal.lineWidth + styles.doubleStroke.offsetWidth;

      if (styles.doubleStroke) {
        another_styles = {
          normal: {
            strokeColor: 'rgba(0,0,0,0.5)',
            lineWidth:  offset
          }
        }
      }

      for (var i = 0; i < resolution; i++) {
          var p = map.geoToScreen(origin);
          var p2 = map.geoToScreen(destination );
          var arcAmount = MathUtilities.distance(p2, p) * tmp_arc;
          var current = i/resolution;
          var curve = new Bezier(p.x, p.y, p.x, p.y - arcAmount, p2.x, p2.y - arcAmount, p2.x, p2.y);
          var partialCurve = curve.split(0, current.toFixed(2));
          var coord = map.screenToGeo(partialCurve.points[3].x, partialCurve.points[3].y );
          strip.pushLatLngAlt( coord.lat, coord.lng );
      };

      this.polyline = new H.map.Polyline(strip, { style: styles.normal, 
                                                  arrows:{ color:"#FFFFFF", width:2, length:3, frequency:30} 
                                                });
      this.polyline.styles = styles;
      this.polyline.name = "polyline"
      this.polyline.data = styles.data;
      
      this.stroke_polyline = new H.map.Polyline(strip, { style: another_styles.normal } );
      this.polyline.name = "stroke_polyline";
      
      // if (styles.doubleStroke){
        this.stroke_polyline.styles = another_styles.normal;
        // group.addObject(this.stroke_polyline);
      // }
      group.addObject(this.polyline);
      // group.addObject( new H.map.Polygon( arrow_strip, { style: { fillColor: '#FFFFCC', strokeColor: '#829', lineWidth: 1 }}) )


      var mouseEnter = function ( evt ) {

        // console.log( evt.originalEvent.clientX, evt.originalEvent.clientY )
        $('.info-bubble').html("<strong>"+evt.target.data[4]+"</strong> refugees traveled from <strong>"+evt.target.data[2]+"</strong> to <strong>"+evt.target.data[3]+"</strong>")
        $('.info-bubble').css({
          left: evt.originalEvent.clientX + 20,
          top: evt.originalEvent.clientY - 20,
          opacity: 1
        })

        //   Stroke color
        var obj_styles = evt.target.styles;
        var strokeColor = chroma( obj_styles.normal.strokeColor )._rgb;
        var strokeColorHover = chroma( obj_styles.hover.strokeColor )._rgb;
        
        //   Stroke weight
        var strokeWeight = obj_styles.normal.lineWidth;
        var strokeWeightHover = obj_styles.hover.lineWidth; 

        var animProps = { 
          sr: strokeColor[0], sg:strokeColor[1], sb:strokeColor[2], sa:strokeColor[3],
          lineWidth: strokeWeight
        };
        
        $( animProps ).animate({ 
            sr:strokeColorHover[0], sg:strokeColorHover[1],sb:strokeColorHover[2],sa:strokeColorHover[3],
            lineWidth:strokeWeightHover
          }, { 

          duration: obj_styles.duration? obj_styles.duration : 500,
          easing: 'swing',
          step:function (now, fx) {
            
              // get the color of the selected shape
              var nsc = evt.target.styles.hover;

              nsc.strokeColor = 'rgba(' + Math.round(animProps.sr) + 
                ',' + Math.round(animProps.sg) + 
                ',' + Math.round(animProps.sb) + 
                ',' + animProps.sa + ')';

              nsc.lineWidth = animProps.lineWidth;
              evt.target.setStyle( nsc );
          }
        });
      };

      var mouseOut = function ( evt ) {

        $('.info-bubble').css({
          left: 0,
          top: 0,
          opacity: 0
        })

        //   Stroke color
        var obj_styles = evt.target.styles;
        var strokeColor = chroma(obj_styles.normal.strokeColor)._rgb;
        var strokeColorHover = chroma(obj_styles.hover.strokeColor)._rgb;
        
        //   Stroke weight
        var strokeWeight = obj_styles.normal.lineWidth;
        var strokeWeightHover = obj_styles.hover.lineWidth; 

        // If not, animate
        var animProps = {
          sr:strokeColorHover[0], sg:strokeColorHover[1],sb:strokeColorHover[2],sa:strokeColorHover[3],
          lineWidth:strokeWeightHover
        };

        $( animProps ).animate({ 
          sr:strokeColor[0], sg:strokeColor[1],sb:strokeColor[2],sa:strokeColor[3],
          lineWidth:strokeWeight
        }, { 

          duration: obj_styles.duration? obj_styles.duration : 500,
          easing: 'swing',

          step: function (now, fx) {

            var nsc = obj_styles.normal;

            nsc.lineWidth = animProps.lineWidth;
            nsc.strokeColor = 'rgba(' + Math.round(animProps.sr) 
              + ',' + Math.round(animProps.sg) 
              + ',' + Math.round(animProps.sb) 
              + ',' + animProps.sa 
              + ')';
        
            evt.target.setStyle( nsc );
          }
        });
      };

      this.polyline.addEventListener('pointerenter', mouseEnter );
      this.polyline.addEventListener('pointerleave', mouseOut );

      // map.addObject(group);
      return group;
  },

  // Create a SVG marker
  createSVGMarkers: function ( props ) {
    var tmp_icon = new H.map.Icon( props.svg, { size: new H.math.Size( props.size.width * AppCore.ppi, props.size.height * AppCore.ppi) }); 
    return new H.map.Marker( {lat: props.latitude, lng: props.longitude },{ icon: tmp_icon });
  },

  // Draw a polygon over a map
	drawPolygon: function ( shape ) {

    var main_group = new H.map.Group(); 
    var group_shape = new H.map.Group();
    var strips = shape;

    for (var x = 0; x < strips.length; x++) {

      var randomColor = "rgba(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + "0.4)";
      var style = { lineWidth: 0, strokeColor: 'blue', fillColor: randomColor }
      var strip = new H.geo.Strip( strips[x],'values lat lng alt');
      var shape = new H.map.Polygon( strip );
      shape.setStyle( style );
      group_shape.addObject(shape);
    
    }

    main_group.addObject(group_shape);
    return main_group;
  },


  // Draw a polygon over a map
  drawPolygonTool: function ( shape, map ) {

    var main_group = new H.map.Group(); 
    var group_shape = new H.map.Group();
    var group_ui = new H.map.Group();

    var strips = this.parsePolyStrings( shape );

    var json = { country: "japan", shape: [] }
    
    for (var x = 0; x < strips.length; x++) {

      var randomColor = "rgba(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + "0.8)";
      var style = { lineWidth: 0, strokeColor: 'blue', fillColor: randomColor }
      var strip = strips[x].strip;
      
      
      var previous_lat = null;
      var previous_lng = null;
      var previous_alt = null;
      var indexes = [];
      var counter = 0;

      var before = strip.getPointCount();
      
      // Simplifying the shape
      strip.eachLatLngAlt( function ( lat, lng, alt ) {

        if (previous_lat == null) {
          
          previous_lat = lat;
          previous_lng = lng;

        } else {

          var distance = MathUtilities.distanceBetweenCoordinates({ latitude:lat, longitude:lng }, { latitude:previous_lat, longitude:previous_lng });
          // var angle = MathUtilities.radiansToDegrees( MathUtilities.angleBetweenCoords( { lat:previous_lat, lng:previous_lng }, { lat:lat, lng:lng }));
          
          if ( Math.abs(distance) < 0.8 || distance > 5000 ) {
            indexes.push(counter)
          }
          
          previous_lat = lat;
          previous_lng = lng;
          counter ++;
        }
      })

      // Removing the unneed unwanted points
      for ( var u = indexes.length - 1; u >= 0; u--) {
        strip.removePoint(indexes[u]) 
      };

      var after = strip.getPointCount();

      // We dont draw the smaller shapes
      if ( strip.getPointCount() < 400 ) {
        continue;
      }

      this.overall_percent_before += before;
      this.overall_percent_after += after;

      var shape = new H.map.Polygon( strip );
      shape.style = style;
      shape.setStyle( style );
      
      var group_markers = new H.map.Group();
      var strip_arr = strip.getLatLngAltArray ();
      json.shape.push(strip_arr)

      for (var i = 0; i < strip_arr.length; i+=3) {
        
        var props = {svg:svg_circle, size:{width:10, height:10}, latitude:strip_arr[i], longitude:strip_arr[i + 1] };
        var tmp_icon = new H.map.Icon( props.svg, { size: new H.math.Size( props.size.width * AppCore.ppi, props.size.height * AppCore.ppi), anchor:{x:5, y:5} }); 
        
        var m = new H.map.Marker( {lat: props.latitude, lng: props.longitude },{ icon: tmp_icon });
        m.draggable = true;
        m.coords = {lat: props.latitude, lng: props.longitude };
        m.index = i / 3;
        m.parentPolygon = shape;

        m.addEventListener('drag', function(evt) {
          
          var target = evt.target,
              pointer = evt.currentPointer;
          if (target instanceof mapsjs.map.Marker) {

            // Updating the marker position
            var geo = map.screenToGeo(pointer.viewportX, pointer.viewportY);
            target.setPosition( map.screenToGeo(pointer.viewportX, pointer.viewportY) );
            target.coords = geo;
          
            // updating the
            var geo = map.screenToGeo(pointer.viewportX, pointer.viewportY)
            var poly = evt.target.parentPolygon;
            var tmp_strip = poly.getStrip();
            var parent_group = evt.target.getParentGroup();
            var all_markers = parent_group.getObjects();
            
            tmp_strip.removePoint (evt.target.index);
            tmp_strip.insertPoint (evt.target.index,geo);

            all_markers = parent_group.getObjects();
            poly.setStrip(tmp_strip);


            // update indexes
            var tmp_strip_arr = tmp_strip.getLatLngAltArray ();
            for (var x = 0; x < tmp_strip_arr.length; x+=3) {
              all_markers[x/3].index = x/3;
              all_markers[x/3].parentPolygon = poly;
            }
          }
        }, false);


        m.addEventListener('tap', function ( evt ) {
          
          var poly = evt.target.parentPolygon;
          var tmp_strip = poly.getStrip();
          var parent_group = evt.target.getParentGroup();
          var all_markers = parent_group.getObjects();
          
    
          tmp_strip.removePoint (evt.target.index);
          parent_group.removeObject(evt.target);
          all_markers = parent_group.getObjects();
          poly.setStrip(tmp_strip);

          // update indexes
          var tmp_strip_arr = tmp_strip.getLatLngAltArray ();
          for (var x = 0; x < tmp_strip_arr.length; x+=3) {
            all_markers[x/3].index = x/3;
            all_markers[x/3].parentPolygon = poly;
          }
        });
        
        group_markers.addObject(m);

      };
      
      group_shape.addObject(shape);
      group_ui.addObject(group_markers);
      
    }

    // console.log( JSON.stringify(json) )

    main_group.addEventListener('tap', function ( evt ) {

      main_group.selected = !main_group.selected;
      if (main_group.selected)
        main_group.addObject(group_ui);
      else {
        main_group.removeObject(group_ui);
      }
    })

    main_group.selected = false;
    main_group.addObject(group_shape);
    return main_group;
  },

  array_to_print: [],

  // Draw a polygon over a map
  drawPolygonToolByClicking: function ( shape, map, name, min, max, click ) {

    var main_group = new H.map.Group(); 
    var strips = this.parsePolyStrings( shape );
    
    for (var x = 0; x < strips.length; x++) {

      var randomColor = "rgba(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + "0.4)";
      var style = { lineWidth: 0, strokeColor: 'blue', fillColor: randomColor }
      var strip = strips[x].strip;
      var before = strip.getPointCount();
      var min = min;
      var max = max;
      
      var before = strip.getPointCount();

      // We dont draw the smaller shapes

      // Simplifying the shape
      var simplify = this.simplifyStrip( strip, min, max );

      if ( strip.getPointCount() < 20 ) {
        continue;
      }

      var strip_arr = simplify.getLatLngAltArray ();

      var shape = new H.map.Polygon( simplify );
      shape.style = style;
      shape.metadata = name;
      shape.setStyle( style );
      shape.selected = false;
      shape.points = { before: before, after: simplify.getPointCount(), percent: MathUtilities.mapValues( simplify.getPointCount(), 0, before, 0, 100 ).toFixed(1) + "%" };

      shape.addEventListener('tap', function ( evt ) {
        click(evt)
      })

      main_group.addObject(shape);
      
    }

    return main_group;
  },

  // Draw a polygon over a map
  drawArrayPolygon: function ( shape, styles, metadata, click, hover, out ) {

    var funcClick = click;
    var funcHover = hover;
    var funcOut = out;

    var mouseEnterStyle = function ( evt ) {
      
      // console.log(evt.target)

      if (evt.target.onhover) evt.target.onhover( evt, evt.target.metadata );

      // is the shape is selected, them do nothing
      if ( evt.target.isSelected ) return;

      // Get the parent group
      var tmp_group = evt.target.getParentGroup();
      tmp_group.setZIndex(200);

      //  Get all the shapes on this group
      var tmp_objects = tmp_group.getObjects();

      // Assign the color to all the objects
      for (var x = 0; x < tmp_objects.length; x++) 
        if (!tmp_objects[x].isSelected)
          tmp_objects[x].setStyle( evt.target.styles.hover );
    };
    

    var mouseOutStyle = function ( evt ) {

      // is the shape is selected, them do nothing
      if ( evt.target.isSelected ) return;
      if (evt.target.onout) evt.target.onout()

      // Get the parent group
      var group = evt.target.getParentGroup();
      group.setZIndex(0);

      //  Get all the shapes on this group
      var objects = group.getObjects();

      // Assign the color to all the objects
      for (var x = 0; x < objects.length; x++) 
        if ( !objects[x].isSelected )
          objects[x].setStyle( evt.target.styles.normal );
    };

    var mouseClick = function ( evt ) {
      
      // evt.target.onclick( evt )
      funcClick(evt)
      
      // Get the parent group
      var tmp_group = evt.target.getParentGroup();
      tmp_group.setZIndex(300);

      // get the group and check if a previous object was selected bfore
      var root = tmp_group.getParentGroup();
      
      if ( root.previousSelection != null) {
        var tmp_group_objects = root.previousSelection.getObjects();
        for (var x = 0; x < tmp_group_objects.length; x++) {
          tmp_group_objects[x].isSelected = false;
          tmp_group_objects[x].setStyle(tmp_group_objects[x].styles.normal); 
        }
      }

      // Store on the main group, the selection
      root.previousSelection = tmp_group;

      //  Get all the shapes on this group
      var tmp_group_objects = tmp_group.getObjects();
      for (var x = 0; x < tmp_group_objects.length; x++)  {
        tmp_group_objects[x].isSelected = !tmp_group_objects[x].isSelected;
        tmp_group_objects[x].setStyle(tmp_group_objects[x].styles.normal);
      }

      // get the color of the selected shape
      for (var x = 0; x < tmp_group_objects.length; x++) {
        tmp_group_objects[x].setStyle( evt.target.styles.selected );
      }

    };




    var main_group = new H.map.Group(); 
    var strips = shape;

    for (var x = 0; x < strips.length; x++) {

      var strip = new H.geo.Strip( strips[x],'values lat lng alt');
      var tmp_shape = new H.map.Polygon( strip );
      
      // Adding custom properties
      tmp_shape.metadata = metadata;
      tmp_shape.isSelected = false;
      tmp_shape.styles = styles;
      tmp_shape.setStyle( styles.normal );
      tmp_shape.onclick = funcClick;
      tmp_shape.onhover = funcHover;
      tmp_shape.onout = funcOut;

      tmp_shape.addEventListener('pointerenter', mouseEnterStyle );
      tmp_shape.addEventListener('pointerleave', mouseOutStyle );
      tmp_shape.addEventListener('tap', mouseClick );      
    
      main_group.addObject(tmp_shape);
      // main_group.addObject(group_ui);
    }

    return main_group;
  },

  // Draw a polygon over a map
  drawPolygonToolByClickingFromArray: function ( shape, map, name, min, max ) {

    var main_group = new H.map.Group(); 
    var group_shape = new H.map.Group();
    var group_ui = new H.map.Group();

    var strips = this.parsePolyStrings( shape );

    var json = { country: name, shape: [] }
    
    for (var x = 0; x < strips.length; x++) {

      var randomColor = "rgba(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + "0.4)";
      var style = { lineWidth: 0, strokeColor: 'blue', fillColor: randomColor }
      var strip = strips[x].strip;
      var before = strip.getPointCount();
      var min = min;
      var max = max;
      
      var before = strip.getPointCount();

      // We dont draw the smaller shapes

      // Simplifying the shape
      var simplify = this.simplifyStrip( strip, min, max );

      if ( strip.getPointCount() < 80 ) {
        continue;
      }

      var strip_arr = simplify.getLatLngAltArray ();
      json.shape.push(strip_arr)

      var shape = new H.map.Polygon( simplify );
      shape.style = style;
      shape.setStyle( style );
      shape.selected = false;
      shape.points = { before: before, after: simplify.getPointCount(), percent: MathUtilities.mapValues( simplify.getPointCount(), 0, before, 0, 100 ).toFixed(1) + "%" };

      shape.addEventListener('tap', function ( evt ) {

        console.log( evt.target.points )
        // return;

        evt.target.selected = !evt.target.selected;
        
        if (evt.target.selected) {
          
          var poly = evt.target;
          var strip = poly.getStrip();
          
          var group_markers = new H.map.Group();
          var strip_arr = strip.getLatLngAltArray ();

          for (var i = 0; i < strip_arr.length; i+=3) {
            
            var props = {svg:svg_circle, size:{width:10, height:10}, latitude:strip_arr[i], longitude:strip_arr[i + 1] };
            var tmp_icon = new H.map.Icon( props.svg, { size: new H.math.Size( props.size.width * AppCore.ppi, props.size.height * AppCore.ppi), anchor:{x:5, y:5} }); 
            
            var m = new H.map.Marker( {lat: props.latitude, lng: props.longitude },{ icon: tmp_icon });
            m.draggable = true;
            m.coords = {lat: props.latitude, lng: props.longitude };
            m.index = i / 3;
            m.parentPolygon = poly;

            m.addEventListener('drag', function(evt) {
              
              var target = evt.target,

                  pointer = evt.currentPointer;
              if (target instanceof mapsjs.map.Marker) {

                // Updating the marker position
                var geo = map.screenToGeo(pointer.viewportX, pointer.viewportY);
                target.setPosition( map.screenToGeo(pointer.viewportX, pointer.viewportY) );
                target.coords = geo;
              
                // updating the
                var geo = map.screenToGeo(pointer.viewportX, pointer.viewportY)
                var poly = evt.target.parentPolygon;
                var tmp_strip = poly.getStrip();
                var parent_group = evt.target.getParentGroup();
                var all_markers = parent_group.getObjects();
                
                tmp_strip.removePoint (evt.target.index);
                tmp_strip.insertPoint (evt.target.index,geo);

                all_markers = parent_group.getObjects();
                poly.setStrip(tmp_strip);


                // update indexes
                var tmp_strip_arr = tmp_strip.getLatLngAltArray ();
                for (var x = 0; x < tmp_strip_arr.length; x+=3) {
                  all_markers[x/3].index = x/3;
                  all_markers[x/3].parentPolygon = poly;
                }
              }
            }, false);


            m.addEventListener('tap', function ( evt ) {
              
              var poly = evt.target.parentPolygon;
              var tmp_strip = poly.getStrip();
              var parent_group = evt.target.getParentGroup();
              var all_markers = parent_group.getObjects();
        
              tmp_strip.removePoint (evt.target.index);
              parent_group.removeObject(evt.target);
              all_markers = parent_group.getObjects();
              poly.setStrip(tmp_strip);

              // update indexes
              var tmp_strip_arr = tmp_strip.getLatLngAltArray ();
              for (var x = 0; x < tmp_strip_arr.length; x+=3) {
                all_markers[x/3].index = x/3;
                all_markers[x/3].parentPolygon = poly;
              }
            });
            
            group_markers.addObject(m);

          };
          
          group_ui.addObject(group_markers);  
        }
        
        else {
          group_ui.removeAll();
        }
      })

      group_shape.addObject(shape);
      
    }

    // console.log( JSON.stringify( json ))
    this.array_to_print.push( JSON.stringify( json ) )

    main_group.addObject(group_ui);
    main_group.addObject(group_shape);
    return main_group;
  },


  simplifyStrip: function ( strip, min, max ) {
    // Simplifying the strip

    var previous_lat = null;
    var previous_lng = null;
    var previous_alt = null;
    var indexes = [];
    var counter = 0;
    var tmp_strip = strip;

    tmp_strip.eachLatLngAlt( function ( lat, lng, alt ) {

      if (previous_lat == null) {
        
        previous_lat = lat;
        previous_lng = lng;

      } else {

        var distance = MathUtilities.distanceBetweenCoordinates({ latitude:lat, longitude:lng }, { latitude:previous_lat, longitude:previous_lng });
        // var angle = MathUtilities.radiansToDegrees( MathUtilities.angleBetweenCoords( { lat:previous_lat, lng:previous_lng }, { lat:lat, lng:lng }));
        
        if ( Math.abs(distance) < min || distance > max ) {
          indexes.push(counter)
        }
        
        previous_lat = lat;
        previous_lng = lng;
        counter ++;
      }
    })

    // Removing the unneed unwanted points
    for ( var u = indexes.length - 1; u >= 0; u--) {
      tmp_strip.removePoint(indexes[u]) 
    };
    return tmp_strip;
  },

  isPolyHole: function(allWkt, polyWkt) {
    var previousChar = allWkt[allWkt.indexOf(polyWkt) - 1];
    return previousChar === "," || previousChar === " ";
  },


  parsePolyStrings: function( ps ) {

    var i, j, lat, lng, tmp, strip, strips = [],
    // Match '(' and ')' plus contents between them which 
    // contain anything other than '(' or ')'.
    m = ps.match(/\([^\(\)]+\)/g);
    if (m !== null) {
      for (i = 0; i < m.length; i++) {
        //match all numeric strings
        tmp = m[i].match(/-?\d+\.?\d*/g);
        if (tmp !== null) {
          // Convert all the coordinate sets in tmp from strings to Numbers
          // And add them to the current strip.
          for (j = 0, strip = new H.geo.Strip(); j < tmp.length; j += 2) {
            lng = Number(tmp[j]);
            lat = Number(tmp[j + 1]);
            strip.pushLatLngAlt(lat, lng, 0);
          }
          strips.push({
            strip: strip,
            isHole: this.isPolyHole(ps, m[i])
          });
        }
      }
    }
    // Returns array of strips or empty array.
    return strips;
  },


  // Still need to refactor and librarize this function
  initAntennasEvenSpaced: function ( context, location, styles ) {

    context.lineCap = "round";

    var coords = map.geoToScreen( new H.geo.Point( location.latitude, location.longitude ));
    coords.x *= AppCore.ppi;
    coords.y *= AppCore.ppi;

    // Circle
    var color = styles.fillColor;
    var strokeColor = styles.strokeColor;
    var arrowLenght = syles.lenght;
    
    arrowLenght *= AppCore.ppi; // check if is retina

    // Stroke 
    context.beginPath();
    context.strokeStyle = strokeColor;
    context.lineWidth = 5 * AppCore.ppi;
    lineAtAngle(coords.x, coords.y, arrowLenght, rows[i][2], 8 );
    context.stroke();

    // Drawing stroke of the arrow head
    context.beginPath();
    context.fillStyle = color;
    context.strokeStyle = "#343e4e";
    context.lineWidth = 4 * AppCore.ppi;
    drawArrowhead(coords.x + arrowLenght * Math.cos(rows[i][2]) , coords.y + arrowLenght * Math.sin(rows[i][2]) , rows[i][2] + Math.radians(90)  );

    // drawing the colored line
    context.beginPath();
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 3 * AppCore.ppi;
    lineAtAngle(coords.x , coords.y , arrowLenght, rows[i][2], 8 * AppCore.ppi  );
    context.stroke();
    
    // Drawing the colored arrow head
    context.beginPath();
    context.fillStyle = color;
    context.lineWidth = 2 * AppCore.ppi;
    drawArrowhead(coords.x + arrowLenght * Math.cos(rows[i][2]) , coords.y + arrowLenght * Math.sin(rows[i][2]) , rows[i][2] + Math.radians(90)  );
    
    // Drawing the circle
    context.beginPath();
    context.fillStyle = "#dde5e9";
    context.strokeStyle = strokeColor;
    context.lineWidth = 1 * AppCore.ppi;
    context.arc(coords.x, coords.y, circle * AppCore.ppi, 0, 2 * Math.PI );
    context.fill();
    context.stroke();
  
  }
}


