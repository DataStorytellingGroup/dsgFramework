// Author: Daniel Gonzalez
// Email: daniel.gonzalez@here.com, 
// Website: http://www.datastorytellinggroup.org


// Credentials
var credentials = { 
  app_id: "UythJfir49K0ZHzunhFA", 
  app_code: "z9BEl98pKbJ96IKpeF30BQ" 
};

// Map
var map;
var mapCenter = {lat: -13.3911, lng:52.52422};
var mapZoom = 4;


function setup () {

  // Init app core
  AppCore.setup(credentials);

  // init degaframework
  MapUtilities.setup();
  Geocoder.setup();

  Cover.setup({
    title:"Ask a very interesting question",
    description: 'Answer the question and description the context of where thos story happens',
    credits: 'Here goes the credits to the team',
    cookies: true,
    share: true,
  })

  Cover.contentLoaded();
  
  // Init app
  initMap ();
  initLegendInteractions();
  createStoryline();
}


function initMap () {

  map = MapUtilities.addMap("basemap", {  
                                        tileType:"basetile",
                                        // server:"aerial",
                                        scheme:"reduced.night",
                                        center: mapCenter, 
                                        zoom: mapZoom,
                                        reducedLabels:true,
                                        // labels: true,
                                        // minZoom: 5,
                                        // maxZoom: 20,
                                      });

  map.addEventListener('tap', function (evt) { 
    var coord = map.screenToGeo( evt.currentPointer.viewportX, evt.currentPointer.viewportY);
    console.log(coord); 
  });

  map.addEventListener('mapviewchange', function() {
    var zoom = map.getViewModel().getZoom();
  });

}

function createStoryline () {

  Storyline.addScene({
    name:"show_intro",
    content: 'This is the story of <span class="highlight accent bold">Close Isabel</span>, a girl that has <span class="italic">Anita\'s eyes and Dani\'s lips</span>, a brown hair and brown skin, a girl that have a free soul',
    start: function (){ console.log("first scene starting")}, 
    end: function (){ Storyline.nextCue(); }
  })

  Storyline.addScene({
    name:"show_second_scene",
    content: 'This is the second scene, which might take a while to start',
    start: function (){ console.log("second scene starting")}, 
    end: function (){ Storyline.nextCue(); }
  })

  Storyline.addScene({
    name:"show_third_scene",
    content: 'This is the third scene, which might take a while to start',
    start: function (){ console.log("third scene starting")}, 
    end: function (){ console.log("third scene end")}
  })

}



// **************************************************************************
//  LEGEND INTERACTIONS 
// **************************************************************************
function initLegendInteractions(){

  $('.show-hide-button').click(function () {
    var legend_wrapper = $('.legend-wrapper');
    var tmp_button = $(this);

    if ( legend_wrapper.hasClass('minimize')) {
      legend_wrapper.removeClass('minimize')
      tmp_button.removeClass('minimize')
    } else {
      legend_wrapper.addClass('minimize')
      tmp_button.addClass('minimize')
    }
  }) 
}

// **************************************************************************
//  INIT APP WHEN EVERYTHING IS READY
// **************************************************************************
$(document).ready(function() {
  setup();
});

