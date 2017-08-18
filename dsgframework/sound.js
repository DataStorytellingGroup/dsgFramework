var Sound = {

  context: null,
  that: null,
  clips: [],
  request: null,
  
  setup: function () {
    this.context = new AudioContext();
    this.request = new XMLHttpRequest();
  }, 

  load: function ( url, name, props ) {

    this.request.open('GET', url, true);
    this.request.responseType = 'arraybuffer';
    var that = this;
    var deferred = $.Deferred();

    this.request.onload = function( evt ) {
      deferred.resolve( evt );
      // that.context.decodeAudioData( that.request.response, function ( buffer ) {
      // that.clips[name] = that.play( buffer, null, props );


      // }, function( error ) {
      //   console.log(error)
      // });
    }

    this.request.send();
    return deferred.promise();
    
  },

  play: function ( buffer, filter, props ) {

    var source = this.context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.loop = props.loop;
    
    var input = this.context.createGain();
    var output = this.context.createGain();
    output.gain.value = props.volumen;

    if (filter) {

      source.connect(filter);
      filter.connect(output);
      output.connect( this.context.destination );       // connect the source to the context's destination (the speakers)
      source.start(0);                           // play the source now
                                                 // note: on older systems, may have to use deprecated noteOn(time);
    } else {

      source.connect(output)
      output.connect( this.context.destination );       // connect the source to the context's destination (the speakers)
      source.start(0);                           // play the source now

    }

    return output;

  }



}