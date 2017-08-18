var Choropleth = {
  
  colors: null,
  scale: null,
  data: null,
  countries: [],
  map: null,

  setup: function ( map ) {
    this.map = map;
    return this;
  },

  draw: function ( data, styles, click, hover, out ) {

    // Drawing shapes
    this.colors = styles.colors? styles.colors : ["#f8dca1", "#FAB800", "#EC610E", "#FA133F" , "#C41C33"];
    this.scale = styles.scale? styles.scale : d3.scaleLinear().domain([0, 1, 2, 3, 4]).range(this.colors);
    this.data = data;

    for (var x = 0; x < this.data.length; x++) {

      var value = this.data[x][0];
      var g = this.scale(value);
      var color = chroma(g).alpha(0.85).css();
      var color_hover = g;

      var styles = {
        normal:{ lineWidth: 1, strokeColor: 'rgba(0,0,0,0.1)', fillColor: color },
        hover:{ lineWidth: 1, strokeColor: 'rgba(0,0,0,0.1)', fillColor: color_hover },
        selected:{ lineWidth: 1, strokeColor: 'rgba(0,0,0,0.1)', fillColor: color_hover },
        nodata:{ lineWidth: 0, strokeColor: 'transparent', fillColor: "transparent" }
      };

      for (var i = 0; i < shapes.length; i++) { 
        if (this.data[x][2] == shapes[i].countryName ) {
          
          var shape = Drawing.drawPolygon( shapes[i].shape, styles, this.data[x], click, hover, out );
          shape.countryName = shapes[i].countryName;
          this.countries.push( shape );
          this.map.addObject( shape );

          break; // if we found it, than we stop looking
        } 
      }
    }
  },

  update: function ( data, styles, click, hover, out ) {

    this.scale = styles.scale? styles.scale : this.scale;
    this.colors = styles.colors? styles.colors : this.colors;
    this.data = data;

    // color the countries
    for (var i = 0; i < this.countries.length; i++) {

      var tmp_group_objects = this.countries[i].getObjects();
      for (var c = 0; c < tmp_group_objects.length; c++)  {
        if (!tmp_group_objects[c].isSelected ) {
          tmp_group_objects[c].styles.normal = tmp_group_objects[c].styles.nodata;
          tmp_group_objects[c].styles.hover = tmp_group_objects[c].styles.nodata;
          tmp_group_objects[c].styles.selected = tmp_group_objects[c].styles.nodata;
          tmp_group_objects[c].setStyle( tmp_group_objects[c].styles.nodata );
        }
      }
    };
    
    // color the origins
    for (var i = 0; i < this.countries.length; i++) {
      
      var tmp_group_objects;

      for (var x = 0; x < this.data.length; x++) {

        var value = this.data[x][0];
        var g = this.scale(value);
        var color = chroma(g).alpha(0.85).css();
        var color_hover = g;

        var styles = {
          normal:{ lineWidth: 1, strokeColor: 'rgba(0,0,0,0.1)', fillColor: color },
          hover:{ lineWidth: 1, strokeColor: 'rgba(0,0,0,0.1)', fillColor: color_hover },
          selected:{ lineWidth: 1, strokeColor: 'rgba(0,0,0,0.1)', fillColor: color_hover },
          nodata:{ lineWidth: 0, strokeColor: 'transparent', fillColor: "transparent" }
        };

        if ( this.data[x][2] == this.countries[i].countryName ) {
          
          tmp_group_objects = this.countries[i].getObjects();

          for (var c = 0; c < tmp_group_objects.length; c++)  {
            
            // styles
            tmp_group_objects[c].styles = styles;

            // data
            tmp_group_objects[c].metadata = this.data[x];

            // Events handling
            tmp_group_objects[c].onclick = click;
            tmp_group_objects[c].onhover = hover;
            tmp_group_objects[c].onout = out;
            
            if ( !tmp_group_objects[c].isSelected ) tmp_group_objects[c].setStyle( styles.normal );
          }

          break;
        } 
      };
    };
  }


}