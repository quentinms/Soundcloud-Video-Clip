/* 
	Quentin Mazars-Simon
	@quentinms	
*/


/*Initialize Tumblr*/
	var initTumblr = function(tag){

		//We get the list of post with the specified tag
		
	 $.ajax({url: "http://api.tumblr.com/v2/blog/soundcloudvideoclip.tumblr.com/posts/photo?api_key=QXmLiokbFl8PFldxAlznGCKPIQ44oTf18NW2UqZzsjAIDWjp5h&tag="+tag+"&jsonp=?", dataType: "jsonp", success: function(data){

		var tumblr_api_read = data.response || null;
    
    	//We add those photos to an array
	    if (tumblr_api_read != null) {
	            for (var i = 0; i < tumblr_api_read.posts.length; i++) {
	            		//We get the url of the images with a width of 500px
	                    window.tumblrImages[i]=tumblr_api_read.posts[i]["photos"][0]["alt_sizes"][1]["url"];
	                    
	                    //We preload the images
	                    var image = $('<img />').attr('src', window.tumblrImages[i]);
	            }
	            
	    }
	    
	    if(tumblrImages.length!=0){
	    	//Kinda random ordering;
		    tumblrImages.sort(function() {return 0.5 - Math.random();});
	    } else {
		    tumblrImages[0]="http://lorempixel.com/500/500/abstract/";
	    }
    
	    //We set the illustration to be the first of the images.
	    $("#illustration").css("background-image", "url("+window.tumblrImages[0]+")"); }});
	 	 
   }


/*Initialize SoundCloud*/

var initSoundCloud = function(trackId){ 

//We get the track and initialize the waveform (see http://waveformjs.org)
	SC.get("/tracks/"+trackId, function(track){
  		var waveform = new Waveform({
	  	container: document.getElementById("waveform")
	});
	waveform.dataFromSoundCloudTrack(track);
  
	/* We set the proper options for the stream*/
	var streamOptions = waveform.optionsForSyncedStream();
	streamOptions["ontimedcomments"] = function(comments){
	  		/* Each time there is a comment, it will show the next image */
	   		window.ImgCount=(window.ImgCount+1)%window.tumblrImages.length;
	   		$("#illustration").css("background-image", "url("+window.tumblrImages[ImgCount]+")"); 
	};

//We stream the song
  SC.stream(track.uri, streamOptions, function(stream){
  	window.stream = stream;
  	
  	//Hack to display prelaod the song*/
    stream.play();
    stream.pause();
    
    // Play/Pause each time the user clicks somewhere in the #content <div> (image + waveform).
   $("#content").bind('click',function(){stream.togglePause(); togglePause();})
    
    //Display time indication when the user hovers the waveform
   $('#waveform').bind('mouseenter', function() {
	    this.iid = setInterval(function() {
	    
	    secP = '0'+parseInt(stream.position / 1000)%60;
	    secP = secP.slice(-2);
	    minP = parseInt(stream.position / 1000 / 60)%60;
	    
	    secD = '0'+parseInt(stream.duration / 1000)%60;
	    secD = secD.slice(-2);
	    minD = parseInt(stream.duration / 1000 / 60)%60;
	    
	       $("#time").text(minP+':'+secP+' / '+minD+':'+secD);
	    }, 500);
	 }).bind('mouseleave', function(){
		    $("#time").text("");
		    this.iid && clearInterval(this.iid);
	}); 
    
    
    
    
  });
});

}


var selectSong = function(url, tag){

	//Reset a bunch of stuff

	window.ImgCount = 0;
	window.tumblrImages = [];
	window.paused = true;
	$("#playImage").attr('src','img/play.png');
	$("#newSongForm").hide();
	$("#content").show();	
	$('#waveform').empty();
	$('#waveform').unbind('mouseenter').unbind('mouseleave');
	$("#content").unbind('click');
	
	if(window.stream != null){
		window.stream.destruct();
	}
	
	
	//We get the new song id, initialize the stream, the waveform and get the images from Tumblr
	SC.get('/resolve', { url: url }, function(track){
		initSoundCloud(track.id);
	})
	
	initTumblr(tag);
	
}

/*Utility functions*/

var togglePause = function(){
	 
	if(window.paused){
		$("#playImage").attr('src','img/pause.png');
	} else {
		$("#playImage").attr('src','img/play.png');	
	}
	window.paused = ! window.paused;
}

var showForm = function(){
	$("#content").hide();
	$("#newSongForm").show();
}

var hideForm = function(){
	$("#newSongForm").hide();
	$("#content").show();
}

//Generates the menu based on the list of songs
var generateNav = function(songs){
	
	
	$('nav').append($("<ul></ul>"));
	
	for(var i = 0; i < songs.length; i++){
		
		var item = $("<li><a href='javascript:selectSong(songs["+i+"].url,songs["+i+"].tag);'>"+songs[i].title+"</a></li>");
		$('nav ul').append(item);
		
	}
	
	var item = $("<li><a href='javascript:showForm()'>New Song...</a></li>");
	$('nav ul').append(item);
	
}

/*Main*/

var songs = [ {
      "title": "Color Theory",
      "artist": "Tea Leigh",
      "url": "https://soundcloud.com/tea-leigh/color-theory-1",
      "tag": "Color Theory"
    },
    
    {
      "title": "Clouds",
      "artist": "Marekhemmann",
      "url": "https://soundcloud.com/marekhemmann/clouds",
      "tag": "Clouds"
    } ,
    {
      "title": "Yonkers",
      "artist": "Tyler The Creator",
      "url": "https://soundcloud.com/diamondmedia360/tyler-the-creator-yonkers-prod",
      "tag": "Yonkers"
    } ,
    {
      "title": "L.O.V.E",
      "artist": "Onra",
      "url": "https://soundcloud.com/onra/l-o-v-e",
      "tag": "Love"
    } ,
    {
      "title": "Icarus",
      "artist": "Madeon",
      "url": "https://soundcloud.com/madeon/madeon-icarus",
      "tag": "Icarus"
    } ,
    {
      "title": "Hours",
      "artist": "Tycho",
      "url": "https://soundcloud.com/tycho/tycho-hours",
      "tag": "Hours"
    } ,
    {
      "title": "New Theory",
      "artist": "RAC",
      "url": "https://soundcloud.com/rac/washed-out-new-theory-rac-mix",
      "tag": "New Theory"
    } ,
    {
      "title": "Too Insistent",
      "artist": "Inertiamusic",
      "url": "https://soundcloud.com/inertiamusic/the-do-too-insistent",
      "tag": "Too Insistent"
    } ,
    {
      "title": "If U Got It",
      "artist": "Chris Malinchak",
      "url": "https://soundcloud.com/chrismalinchak/if-u-got-it",
      "tag": "If U Got It"
    } ,
    {
      "title": "Pharao Black Magic",
      "artist": "Future Classic",
      "url": "https://soundcloud.com/futureclassic/pharao-black-magic-hermes",
      "tag": "Pharao Black Magic"
    } 
    
     ];


$(document).ready(function() {
   	
  //Authenticate with SoundCloud
 SC.initialize({
    client_id: "16be599a525a2df3fc4b5a20da9927c4"
  }); 
  
  var ImgCount = 0;
  var tumblrImages = [];
  var paused = true;

$("#illustration").mouseenter(function(){$("#playImage").show();})
$("#illustration").mouseleave(function(){$("#playImage").hide();})


generateNav(songs);

selectSong(songs[0].url,songs[0].tag);

 });