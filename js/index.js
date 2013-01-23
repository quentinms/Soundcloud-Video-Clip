/*Initialize Tumblr*/
	var initTumblr = function(tag){
	
	
		$("#illustration").css("background-image", "url(img/loading.gif)"); 
	    $("#illustration").click(function(){});
	
		var num_posts = 50;
		//We get the list of post with the specified tag
		
	 var tumblr_url = "http://api.tumblr.com/v2/blog/soundcloudvideoclip.tumblr.com/posts/photo?api_key=QXmLiokbFl8PFldxAlznGCKPIQ44oTf18NW2UqZzsjAIDWjp5h&tag="+tag;
	 	
	 $.ajax({url: tumblr_url+"&limit="+num_posts+"&jsonp=?", dataType: "jsonp", success: function(data){

		window.tumblr_api_read = data.response || null;
		var total_posts = tumblr_api_read["total_posts"];
		console.log(tag+":"+total_posts);
		
		getTumblrImagesList(window.tumblr_api_read.posts.length, total_posts, num_posts ,tumblr_url);
		
		}});
		
				
		 
   }
   
var getTumblrImagesList = function(counter, total,num_posts , tumblr_url){
		
		if(counter < total){
		console.log("getting more images from Tumblr");
		
		$.ajax({url: tumblr_url+"&limit="+num_posts+"&offset="+counter+"&jsonp=?", dataType: "jsonp", success: function(data){
			window.tumblr_api_read.posts = window.tumblr_api_read.posts.concat(data.response.posts);
			getTumblrImagesList(counter+num_posts, total, num_posts, tumblr_url);
		}
		})
		} else {
			console.log("displaying Tumblr images");
			displayTumblrImages();
		}
		
	
}

var displayTumblrImages = function(){
	//We add those photos to an array
	    if (window.tumblr_api_read != null) {
	            for (var i = 0; i < tumblr_api_read.posts.length; i++) {
	            		//We get the url of the images with a width of 500px
	            		window.tumblrImages[i] = {"url": "#", "img": "#"};
	                    window.tumblrImages[i]["img"]=tumblr_api_read.posts[i]["photos"][0]["alt_sizes"][1]["url"];
	                    window.tumblrImages[i]["url"]=tumblr_api_read.posts[i]["post_url"];
	                    
	                    //We preload the images
	                    var image = $('<img />').attr('src', window.tumblrImages[i]["img"]);
	            }
	            
	    }
	    
	    if(tumblrImages.length!=0){
	    	//Kinda random ordering;
		    tumblrImages.sort(function() {return 0.5 - Math.random();});
	    } else {
	    	window.tumblrImages[0] = {"url": "#", "img": "#"};
		    tumblrImages[0]["img"]="http://lorempixel.com/500/500/abstract/";
		    tumblrImages[0]["url"]="http://lorempixel.com/";
	    }
    
	    //We set the illustration to be the first of the images.
	    $("#illustration").css("background-image", "url("+window.tumblrImages[0]["img"]+")"); 
	    $("#illustration").click(function(){window.open(window.tumblrImages[0]["url"],'mywindow')});
	    
	    

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
	  		if(Math.abs(comments[0].timestamp-stream.position) < 3000){
	  			$("#comment").text(comments[0].body);
	  		}
	   		window.ImgCount=(window.ImgCount+1)%window.tumblrImages.length;
	   		$("#illustration").css("background-image", "url("+window.tumblrImages[ImgCount]["img"]+")");
	   		$("#illustration").click(function(){window.open(window.tumblrImages[ImgCount]["url"],'mywindow')});
	   		
	};
	streamOptions["onfinish"] = function(){
		$("#playButton").attr("src","img/Play.png");
		window.paused = !window.paused;
	} 
	

//We stream the song
  SC.stream(track.uri, streamOptions, function(stream){
  	window.stream = stream;
  	
  	//Hack to display/preload the song*/
    stream.play();
    stream.pause();
    
   
    //Display time indication
    this.iid = setInterval(function() {
	    
	    secP = '0'+parseInt(stream.position / 1000)%60;
	    secP = secP.slice(-2);
	    minP = parseInt(stream.position / 1000 / 60)%60;
	    
	    secD = '0'+parseInt(stream.duration / 1000)%60;
	    secD = secD.slice(-2);
	    minD = parseInt(stream.duration / 1000 / 60)%60;
	    
	       $("#time").text(minP+':'+secP+' / '+minD+':'+secD);
	    }, 500);
  
  });
});

}


var initRaphael = function(){
	// Creates canvas 500x75 in div #cursor
	var paper = Raphael("cursor", 450, 75);
	var set = paper.set();
	
	
	//We redraw the line to follow the mouse position.
	$('#cursor').mousemove(function(e){ 
		  var offset = $('#cursor').offset().left;
		  var pos = (e.clientX-offset);   
	      set.remove()
	      set.push(
	       paper.path("M"+pos+" 0V75").attr("stroke","#fff")
	      );
	      
	    });
	    
	 //Set play position in the song according to the cursor position   
	 $('#cursor').click(function(e){
	   	var duration = window.stream.duration;
	   	var cursor_position = e.clientX-$('#cursor').offset().left;
	   	var requested_song_position = duration * (cursor_position)/450;
	   	
	   	if(requested_song_position < window.stream.position){
	   		window.ImgCount=0;
	   		$("#comment").text("");
	   		window.stream.setPosition(0);
	   	}
	   	
	   	window.stream.setPosition(requested_song_position);
	  });
	  
	  $('#cursor').mouseleave(function(e){
	  		set.remove();
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
	$('#blu').unbind('mouseenter').unbind('mouseleave');
	$('#comment').empty();
	this.iid && clearInterval(this.iid);
	$("#comments_div").show();
	
	if(window.stream != null){
		window.stream.destruct();
	}
	
	
	//We get the new song id, initialize the stream, the waveform and get the images from Tumblr
	SC.get('/resolve', { url: url }, function(track){
		initSoundCloud(track.id);
	})
	
	$("#playButton").attr("src","img/Play.png");
	initTumblr(tag);
	
	
}

/*Utility functions*/

var togglePause = function(){

	window.stream.togglePause(); 
	if(!window.paused){
		$("#playButton").attr("src","img/Play.png");
	} else {
		$("#playButton").attr("src","img/Pause.png");	
	}
	window.paused = !window.paused;
}

var toggleComments = function(){

if(window.commentsShown == true){
	 	$("#comment").hide();
	 	$("#commentButton").attr("src","img/Comment.png");
	 }else{
	 	$("#comment").show();
	 	$("#commentButton").attr("src","img/Nocomment.png");
	 }
	 
	 window.commentsShown = !window.commentsShown;
}

var showForm = function(){
	$("#content").hide();
	$("#comments_div").hide();
	$("#newSongForm").show();
}

var hideForm = function(){
	$("#newSongForm").hide();
	$("#comments_div").show();
	$("#content").show();
}

//Generates the menu based on the list of songs
var generateNav = function(songs){
	
	
	$('nav').append($("<ul></ul>"));
	
	for(var i = 0; i < songs.length; i++){
		
		var item = $("<li><a href='javascript:selectSong(songs["+i+"].url,songs["+i+"].tag);'>"+songs[i].title+"</a></li>");
		$('nav ul').append(item);
		
	}
	
	var item = $("<li> </li>");
	$('nav ul').append(item);
	var item = $("<li><a href='javascript:showForm()'>New Song</a></li>");
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
  
generateNav(songs);

selectSong(songs[0].url,songs[0].tag);

initRaphael();

 });