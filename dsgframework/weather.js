var Weather = {
  
  credentials: null,
  weatherTypes: ["Sunny","Clear","Mostly Sunny","Mostly Clear","Hazy Sunshine","Haze","Passing Clouds","More Sun than Clouds","Scattered Clouds","Partly Cloudy","A Mixture of Sun and Clouds","High Level Clouds","More Clouds than Sun","Partly Sunny","Broken Clouds","Mostly Cloudy","Cloudy","Overcast","Low Clouds","Light Fog","Fog","Dense Fog","Ice Fog","Sandstorm","Duststorm","Increasing Cloudiness","Decreasing Cloudiness","Clearing Skies","Breaks of Sun Later","Early Fog Followed by Sunny Skies","Afternoon Clouds","Morning Clouds","Smoke","Low Level Haze"],
  dangerousWeatherTypes: ["Haze", "Fog","Dense Fog","Ice Fog","Sandstorm","Duststorm","Increasing Cloudiness"],
  precipitations:["Drizzle","Sprinkles","Scattered Showers","A Few Showers","Light Showers","Passing Showers","Light Rain","Rain Showers","Rain","Numerous Showers","Showery","Heavy Rain","Lots of Rain","Tons of Rain","Flash Floods","Widely Scattered TStorms","Isolated TStorms","A Few TStorms","Thundershowers","Thunderstorms","Strong Thunderstorms","Severe Thunderstorms","Hail","Tornado","Tropical Storm","Hurricane","Light Freezing Rain","Light Mixture of Precip","Sleet","Icy Mix","Freezing Rain","Mixture of Precip","Heavy Mixture of Precip","Snow Changing to Rain","Snow Changing to an Icy Mix","An Icy Mix Changing to Snow","An Icy Mix Changing to Rain","Rain Changing to Snow","Rain Changing to an Icy Mix","Scattered Flurries","Snow Flurries","Light Snow Showers","Snow Showers","Light Snow","Snow","Moderate Snow","Heavy Snow","Snowstorm","Blizzard","Sprinkles Early","Showers Early","Light Rain Early","Rain Early","Heavy Rain Early","TStorms Early","Flurries Early","Snow Showers Early","Light Snow Early","Snow Early","Heavy Snow Early","Light Icy Mix Early","Icy Mix Early","Sprinkles Late","Showers Late","Light Rain Late","Rain Late","Heavy Rain Late","Isolated TStorms Late","Scattered TStorms Late","TStorms Late","Flurries Late","Snow Showers Late","Light Snow Late","Snow Late","Heavy Snow Late","Light Icy Mix Late","Icy Mix Late"],

  iconNames: ["sunny","clear","mostly_sunny","mostly_clear","passing_clounds","more_sun_than_clouds","scattered_clouds","partly_cloudy","a_mixture_of_sun_and_clouds","increasing_cloudiness","breaks_of_sun_late","afternoon_clouds","morning_clouds","partly_sunny","high_level_clouds","decreasing_cloudiness","clearing_skies","high_clouds","rain_early","heavy_rain_early","strong_thunderstorms","severe_thunderstorms","thundershowers","thunderstorms","tstorms_early","isolated_tstorms_late","scattered_tstorms_late","tstorms_late","tstorms","ice_fog","more_clouds_than_sun","broken_clouds","scattered_showers","a_few_showers","light_showers","passing_showers","rain_showers","showers","widely_scattered_tstorms","isolated_tstorms","a_few_tstorms","scattered_tstorms","hazy_sunshine","haze","smoke","low_level_haze","early_fog_followed_by_sunny_skies","early_fog","light_fog","fog","dense_fog","night_haze","night_smoke","night_low_level_haze","night_widely_scattered_tstorms","night_isolated_tstorms","night_a_few_tstorms","night_scattered_tstorms","night_tstorms","night_clear","mostly_cloudy","cloudy","overcast","low_clouds","hail","sleet","light_mixture_of_precip","icy_mix","mixture_of_precip","heavy_mixture_of_precip","snow_changing_to_rain","snow_changing_to_an_icy_mix","an_icy_mix_changing_to_snow","an_icy_mix_changing_to_rain","rain_changing_to_snow","rain_changing_to_an_icy_mix","light_icy_mix_early","icy_mix_early","light_icy_mix_late","icy_mix_late","snow_rain_mix","scattered_flurries","snow_flurries","light_snow_showers","snow_showers","light_snow","flurries_early","snow_showers_early","light_snow_early","flurries_late","snow_showers_late","light_snow_late","night_decreasing_cloudiness","night_clearing_skies","night_high_level_clouds","night_high_clouds","night_scattered_showers","night_a_few_showers","night_light_showers","night_passing_showers","night_rain_showers","night_sprinkles","night_showers","night_mostly_clear","night_passing_clouds","night_scattered_clouds","night_partly_cloudy","increasing_cloudiness","night_afternoon_clouds","night_morning_clouds","night_broken_clouds","night_mostly_cloudy","light_freezing_rain","freezing_rain","heavy_rain","lots_of_rain","tons_of_rain","heavy_rain_early","heavy_rain_late","flash_floods","flood","drizzle","sprinkles","light_rain","sprinkles_early","light_rain_early","sprinkles_late","light_rain_late","rain","numerous_showers","showery","showers_early","rain_early","showers_late","rain_late","snow","moderate_snow","snow_early","snow_late","heavy_snow","heavy_snow_early","heavy_snow_late","tornado","tropical_storm","hurricane","sandstorm","duststorm","snowstorm","blizzard","cw_no_report_icon"],
  warningIconNames: ["rain_early","heavy_rain_early","strong_thunderstorms","severe_thunderstorms","thundershowers","thunderstorms","tstorms_early","isolated_tstorms_late","scattered_tstorms_late","tstorms_late","tstorms","ice_fog","scattered_showers","a_few_showers","light_showers","passing_showers","rain_showers","showers","widely_scattered_tstorms","isolated_tstorms","a_few_tstorms","scattered_tstorms","hazy_sunshine","haze","smoke","low_level_haze","fog","dense_fog","night_haze","night_smoke","night_low_level_haze","night_widely_scattered_tstorms","night_isolated_tstorms","night_a_few_tstorms","night_scattered_tstorms","night_tstorms","hail","sleet","light_mixture_of_precip","icy_mix","mixture_of_precip","heavy_mixture_of_precip","snow_changing_to_rain","snow_changing_to_an_icy_mix","an_icy_mix_changing_to_snow","an_icy_mix_changing_to_rain","rain_changing_to_snow","rain_changing_to_an_icy_mix","light_icy_mix_early","icy_mix_early","light_icy_mix_late","icy_mix_late","snow_rain_mix","scattered_flurries","snow_flurries","light_snow_showers","snow_showers","light_snow","flurries_early","snow_showers_early","light_snow_early","flurries_late","snow_showers_late","light_snow_late","night_scattered_showers","night_a_few_showers","night_light_showers","night_passing_showers","night_rain_showers","night_sprinkles","night_showers","increasing_cloudiness","light_freezing_rain","freezing_rain","heavy_rain","lots_of_rain","tons_of_rain","heavy_rain_early","heavy_rain_late","flash_floods","flood","drizzle","sprinkles","light_rain","sprinkles_early","light_rain_early","sprinkles_late","light_rain_late","rain","numerous_showers","showery","showers_early","rain_early","showers_late","rain_late","snow","moderate_snow","snow_early","snow_late","heavy_snow","heavy_snow_early","heavy_snow_late","tornado","tropical_storm","hurricane","sandstorm","duststorm","snowstorm","blizzard"],

  setup: function () {
    if ( AppCore.credentials )
      this.credentials = AppCore.credentials;
    else 
      console.log("Need to set your credentials in AppCore")
    
  },

  getPrecipitationList: function () {
    return this.precipitations;
  },

  isItOnPrecipitationList: function ( iconName ) {
    var bool;
    for (var i = 0; i < this.warningIconNames.length; i++) {
      bool = this.warningIconNames[i] == iconName;
      if (bool) break;
    };
    return bool;
  },

  getWeatherConditionFromCity: function ( cityName ) {

    var deferred = $.Deferred();

    $.ajax({
      url: 'https://weather.cit.api.here.com/weather/1.0/report.json',
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'jsonpcallback',
      data: {
        product: 'observation',
        name: cityName,
        app_id: this.credentials.app_id,
        app_code: this.credentials.app_code
      },
      success: function ( response ) {
        deferred.resolve( response );
      }
    });

    return deferred.promise();

  },

  getWeatherConditionFromLocation: function ( location, index ) {

    var deferred = $.Deferred();

    $.ajax({
      url: 'https://weather.cit.api.here.com/weather/1.0/report.json',
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'jsonpcallback',
      data: {
        product: 'observation',
        latitude: location.lat,
        longitude: location.lng,
        app_id: this.credentials.app_id,
        app_code: this.credentials.app_code
      },
      success: function ( response ) {
        deferred.resolve( response, index );
      }
    });

    return deferred.promise();
  }
}