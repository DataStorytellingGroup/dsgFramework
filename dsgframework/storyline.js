var Storyline = {
  
  cues: {},
  current_cue: -1,
  current_index: -1,
  element: null,

  // **** Create the story as scenes ****
  addScene: function ( props ) {
    this.current_cue++;
    this.cues[props.name] = props;
    this.cues[this.current_cue] = this.cues[props.name];
  },

  getScenes: function (){
    return this.cues;
  },


  // **** Play the story ****
  startCue: function ( cue ) {
    this.showText( cue.content )
  },

  nextCue: function () {
    this.current_index++;
    var tmp_cue = this.cues[this.current_index];
    tmp_cue.start()
    this.startCue(tmp_cue)
    return tmp_cue;
  },

  previousCue: function () {
    this.current_index--;
    var tmp_cue = this.cues[this.current_index];
    tmp_cue.start()
    this.startCue(tmp_cue)
    return tmp_cue;
  },

  showText: function ( text ) {
    var tmp_end_method = this.cues[this.current_index].end;
    $(".storyline").typed({
      strings: [text, ''],
      contentType: 'html',
      typeSpeed: 0,
      backSpeed: 0,
      backDelay: 4000,
      showCursor: false,
      callback: function () { 
        $(".storyline").remove();
        $(".app").append("<div class='storyline'/>")
        tmp_end_method();
      }
    });
  }
}