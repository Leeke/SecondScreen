/**
 * Second Screen 
 *
 * @author Naoufal Medouri
 * Created: 05-04-2012
 *
 */

var news_timeline = new Timeline(); // this has to move from here!
var webContents = new Array();

// ------------------- Objects ----------------------------------------
// The Timeline Event object
function TimelineEvent(typeStr, eventTime, associatedContents) {

}

// The Timeline object
function Timeline() {
	// Properties
	this.topics = new Array();

	// Methods
	this.addTopic = addTopic;
}

// The Topic object
function Topic(id, thumbnailURL, title_str, subtitle_str, start_time, end_time, webContentIDs) {
	/* Properties:
	 *
	 * id:				The id must be a unique integer within a timeline.
	 *
	 * thumbnailURL:	The URL of the associated thumbnail if it exist.
	 *
	 * title_str:		The title of the topic.
	 *
	 * subtitle_str:	The subtitle of the topic.
	 *
	 * start_time:		The time when the topic is scheduled to start in seconds. It is relative
	 * 					to the start of the timeline.
	 *
	 * end_time:		The time when the topic is scheduled to end in seconds. It is relative
	 * 					to the start of the timeline.
	 *
	 * webContentIDs:	An array of WebContent object ids.
	 */
	this.id = id;

	this.title_str = title_str;
	this.subtitle_str = subtitle_str;
	this.start_time = start_time;
	this.end_time = end_time;
	this.thumbnailURL = thumbnailURL;

	this.webContentIDs = webContentIDs;

}

// Adds a topic at the end of the Timeline object.
function addTopic(topic) {
	this.topics.push(topic);
}

// The webContent object
function WebContent(id, type, length, availabilityTime, thumbnailURL, url, alternativeURL, topicID) {
	/*
	* Properties:
	* id: 					A unique identifire for the Web Content within the timeline.
	*
	* type:  				The type of the media. It can be "img", "video", "audio" or "text". The type
	* 						property will be used to show the content in the moste convinient way.
	*
	* length: 				Expressed in seconds. Represents the length of the Web Content. Setting the
	* 						property is optional (default is 0) since it does not applay to all content types.
	*
	* availabilityTime: 	The time when the Web Content object become available. It value is in
	* 						milliseconds and is relative to the start of the timeline.
	*
	* thumbnailURL: 		The URL of the associated thumbnail if it exist. If it doesn't (value ""),
	* 						one may be created or a deafult place holder thumbnail may be used.
	*
	* url: 				The main URL of the Web Content. This property is mandatory.
	*
	* alternativeURL: 		An alternative URL for the Web Content. This property is optional (default "").
	*
	* topicID:				Stores the id of the topic, the Web Content is associated to.
	*/

	// TODO: Set defaults and check for mandatory parameters.
	this.id = id;
	this.type = type;
	this.length = length;
	this.availabilityTime = availabilityTime;
	this.thumbnailURL = thumbnailURL;
	this.url = url;
	this.alternativeURL = alternativeURL;
	this.topicID = topicID;
}

// ------------------------ Functions ----------------------------------------------

// Loads a timeline from a json file.
function loadTimeline() {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', 'timeline.json', true);
	xobj.onreadystatechange = function() {
		if(xobj.readyState == 4) {
			var jsonTimeline = xobj.responseText;
			//var jsonTimeline = JSON.parse(xobj.responseText);
			extractTimeline(jsonTimeline);
			updateView();
		}
	}
	xobj.send(null);
}

function extractTimeline(jsonTimeline) {
	var jsonObj = eval("(" + jsonTimeline + ")");
	var i;
	for( i = 0; i < jsonObj.topics.length; i++) {
		news_timeline.addTopic(jsonObj.topics[i]);
	}

	for( i = 0; i < jsonObj.webContents.length; i++) {
		webContents.push(jsonObj.webContents[i]);
		sortWebContentsByTime();
	}

}

/* Sorts the global array webContents of WebContent objects by availabilityTime.
 */
function sortWebContentsByTime() {

	var i;
	var j;

	var wcId;
	if(webContents.length > 0) {
		for( i = 0; i < webContents.length; i++) {
			for( j = i; j < webContents.length; j++) {
				if(webContents[j].availabilityTime < webContents[i].availabilityTime) {
					swapWebContent(i, j);
				}
			}
		}
	}
}

// Swaps two WebContent objects in the global array weContents.
function swapWebContent(i, j) {
	var tempObj = new Object();
	tempObj = webContents[i];
	webContents[i] = webContents[j];
	webContents[j] = tempObj;
}

// ------------------------ View Reladed Functions ----------------------------------------------

function updateView() {
	var tl_items_arr = new Array();

	for( i = 0; i < news_timeline.topics.length; i++) {

		var id = news_timeline.topics[i].id;
		var title = news_timeline.topics[i].title_str;
		var subtitle = news_timeline.topics[i].subtitle_str;
		var thumb = news_timeline.topics[i].thumbnailURL;
		var duration = news_timeline.topics[i].end_time - news_timeline.topics[i].start_time;
		var tl_item = $('<a class="tl_item" id="' + id + '" href="#"><div ><image src="' + thumb + '" /><p class="timeline_label" >' + title + '</p></div></a>');
		tl_item.appendTo('#tl_scroll_area');
		tl_items_arr.push(tl_item);
	}

	var item_w = $('.tl_item').width() + 20;

	$('#tl_scroll_area').width(tl_items_arr.length * item_w);
	for( i = 0; i < tl_items_arr.length; i++) {
		tl_items_arr[i].hide().slideDown(1000);

	}

	var timelineScroll = new iScroll('timeline');

	//Add event handler to Timeline items
	$('.tl_item').click(function(e) {
		
		// clear containers
		$('#sync_content_nav').empty();
		$('#sync_content_header').empty();

		var targetId = jQuery(this).attr("id");
		var startContent = true;
		var startContentID;

		for( i = 0; i < webContents.length; i++) {
			if(webContents[i].topicID == targetId) {

				if(startContent) {
					startContent = false;
					startContentID = webContents[i].id;
				}
				//var webcontentbtn = $('<li><a href="#" class="sync_content_nav_btn" id="' + webContents[i].id + '" data-role="button" data-theme="a">' + webContents[i].type + '</a><li>');
				//webcontentbtn.appendTo('#sync_content_nav');
				$("#sync_content_nav").append('<a data-role="button" class="webcontentbtn" id="' + webContents[i].id + '">' + webContents[i].type + '</a>');
				$("#sync_content_nav").find("a[data-role='button']").button();
			}
		}

		// Set Headline
		var headline_str = getTopicHeadline(startContentID);
		var topicHeadline = $('<h1 >' + headline_str + '</h1>');
		topicHeadline.appendTo('#sync_content_header');
		
		setWebContent(startContentID);
		
		// Add event handler to webconten navigation
		$('.webcontentbtn').click(function(e) {
			var targetId = jQuery(this).attr("id");
			setWebContent(targetId);
			return false;	
		});
		return false;
	});
}


//Helper clases
function getTopicHeadline(contentID) {
	var headline;
	var topicID;
	
	for( i = 0; i < webContents.length; i++) {
		if(webContents[i].id == contentID) {
			topicID = webContents[i].topicID;
			break;
		}
	}
	
	for( i = 0; i < news_timeline.topics.length; i++) {
		if(news_timeline.topics[i].id == topicID) {
			headline = news_timeline.topics[i].title_str;
			break;
		}
	}
	return headline;
}

function setWebContent(contentID) {
	$('#sync_content_stage').empty();

	for( i = 0; i < webContents.length; i++) {
		if(webContents[i].id == contentID) {
			var type = webContents[i].type;
			var contentURL = webContents[i].url;
		}
	}

	var content_item;

	switch(type) {
		case 'image':
			content_item = $('<div ><image src="' + contentURL + '" /></div>');
			content_item.appendTo('#sync_content_stage');
			break;
		case 'video':
			content_item = $('<div ><video width="560" height="340" controls><source src="' + contentURL + '" type="video/mp4" /></video></div>');
			content_item.appendTo('#sync_content_stage');
			break;
		case 'text':
			$('#sync_content_stage').load(contentURL);
			break;
	}
	
}
