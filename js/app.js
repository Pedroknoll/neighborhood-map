'use strict';

// declaring global variables
var map;
var infoWindow;
var bounds;


// CLIENT_ID and CLIENT_SECRET params to retrieve info from foursquare
var CLIENT_ID = 'GHOKJ5MS1RUMWAY4GZHCOCDYOBTTSEE2E3PDGJ2RORGPDJWF';
var CLIENT_SECRET = 'FKVS2BG2CXDXQSDK4OZ4J13DRIF5ZZAK1JGQBBRJRI2H3M1V';

/**
 * @function Google Map API Callback
 * @description Map initialization
 */
function initMap() {
	// setup the map constructor passing the mapOptions literal object
	var mapOptions = {
		center: {lat: -23.582944, lng: -46.674069},
    zoom: 12,
    styles: mapStyles,
    mapTypeControl: false,
		fullscreenControl: false
	};
	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	infoWindow = new google.maps.InfoWindow();
	bounds = new google.maps.LatLngBounds();
	ko.applyBindings(new ViewModel());

	// go to initial position when click on the right mouse button
	google.maps.event.addListener(map, 'rightclick', function(){
		map.fitBounds(bounds);
	});
};


/**
 * @constructor Venue
 * @description Represents an adventure sports venue
 *
 */
var Venue = function(data){
	var self = this;

	this.name = data.name;
	this.description = data.description;
	this.category = data.category;
	this.location = data.location;
	this.formattedAddress = '';
	this.rating = '';
	this.photoUrl = '';

	this.visible = ko.observable(true);


	var foursquareSearchEndpoint = 'https://api.foursquare.com/v2/venues/search' +
												'?limit=1' +
												'&ll='+ this.location.lat +','+ this.location.lng +
												'&client_id='+ CLIENT_ID +
												'&client_secret='+ CLIENT_SECRET +
												'&v=20140806';


	$.getJSON(foursquareSearchEndpoint, function(){
	})
		.done(function(responseData){

			var foursquareVenueId = responseData.response.venues[0].id;

			getVenueDetails(foursquareVenueId);

		})
		.fail(function() {
			alert('Something went wrong with foursquare');
  	});


	/**
	* @function getVenueDetail
	* @description Used as callback for the search request to foursquare
	* @param {object} Foursquare data
 	**/
	function getVenueDetails(id){
		var foursquareDetailsEndpoint = 'https://api.foursquare.com/v2/venues/' +
													id +
													'?&client_id='+ CLIENT_ID +
													'&client_secret='+ CLIENT_SECRET +
													'&v=20140806';
		$.getJSON(foursquareDetailsEndpoint, function(){
		})
			.done(function(responseData){
				var results = responseData.response.venue;
				self.formattedAddress = results.location.formattedAddress;
				self.rating = results.rating;

				var venuePhoto = results.bestPhoto
				self.photoUrl = venuePhoto.prefix + '600x150' + venuePhoto.suffix;
			})
			.fail(function() {
				alert('Something went wrong with foursquare');
			});
	};

	// create custom marker icons symbols
	var defaultIcon = createMarkerIcon('#1f2fda', '#ffffff');
	var highlightedIcon = createMarkerIcon('#ffffff','#1f2fda');

	this.marker = new google.maps.Marker({
		position: this.location,
		title: this.name,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP
	});

	// show markers according to filter selected options on dropdown at UI
	self.filteredMarkers = ko.computed(function(){
		if(self.visible() === true){
			self.marker.setMap(map);
		} else {
			self.marker.setMap(null);
		}
	});

	this.marker.setMap(map);

	// extends the boundaries of the map for each marker
	bounds.extend(this.marker.position);

	// set marker icons event listeners for mouseover and for mouseout
	this.marker.addListener('mouseover', function() {
		this.setIcon(highlightedIcon);
	});
	this.marker.addListener('mouseout', function() {
		this.setIcon(defaultIcon);
	});

	// add click event handlers to the marker
	this.marker.addListener('click', function(){
		// create an event to open the infowindow
		// create the contentString for the basic infowindow
		var contentString = '<div class="infowindow-image" style="background-image: url(' + self.photoUrl +');"></div>' +
												'<h4 class="infowindow-title">' + self.name + '</h4>' +
												'<div class="infowindow-header d-flex align-items-start flex-wrap">' +
													'<span class="infowindow__badge align-self-center">' + self.category + '</span>' +
													'<div class="align-self-center d-flex flex-wrap mt-1">' +
														'<span class="align-self-center mr-1"> Foursquare Rating: </span>' +
														'<span class="infowindow__badge infowindow-rating  align-self-center">' + self.rating + '</span>' +
													'</div>' +
												'</div>' +
												'<p class="infowindow-description">' + self.description + '</p>' +
												'<p class="infowindow-description"> Endereço:  ' + self.formattedAddress + '</p>' +
												'<span class="infowindow-attribuition"><img src="./img/powered-by-foursquare-blue.svg"></span>';

		populateInfoWindow(this, infoWindow, contentString);
		// when clicked, the marker bounces
		bounceMarker(this);
		// when clicked, pan to the marker position
		map.panTo(this.getPosition());
	});

	map.fitBounds(bounds);

	// function to show the infowindows as click the venue on list sidebar
	this.showInfo = function(venue){
		google.maps.event.trigger(self.marker, 'click');
	};

};


var ViewModel = function(){
  self = this;

	// observable array populate with objects created from data
	this.venuesList = ko.observableArray([]);
	locations.forEach(function(location){
		self.venuesList.push(new Venue(location))
	});

	// Filtering ----------------------------------------------
	// generate a list of venues according the selected options
	this.availableCategories = ko.observableArray([	'Escalada',
																									'Parkour',
																									'Wakeboard']);

	this.selectedCategory = ko.observable('');

	this.filteredList = ko.computed(function() {
		var filter = self.selectedCategory();
		if (filter) {
			filter = self.selectedCategory().toLowerCase(); //
			return ko.utils.arrayFilter(self.venuesList(), function(venue) {
				var str = venue.category.toLowerCase();
				var result = str.includes(filter);
				venue.visible(result);
				return result;
			});
		}
		self.venuesList().forEach(function(venue) {
			venue.visible(true);
		});
		return self.venuesList();
	}, self);

	// initial visibility of sidebar according screen width
	if($(window).width() < 800){
		self.isVisible = ko.observable(false);
	} else {
		self.isVisible = ko.observable(true);
	};
	// show/hide sidebar when the toggle button is clicked
	self.toggleVisibility = function(){
		self.isVisible(!self.isVisible());
	};
};


/**
 * @function createMarkerIcon
 * @description Create a custom symbol with the fill color and border color
 * @param {string} Hex color
 */
function createMarkerIcon(markerFillColor, markerBorderColor){
	return {
		path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,' +
		'-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
		scale: 1.1,
		fillOpacity: 1,
		fillColor: markerFillColor,
		strokeColor: markerBorderColor,
		strokeWeight: 2
	};
};

/**
 * @function bounceMarker
 * @description Bounces the marker two times
 * @param {object} Marker
 */
function bounceMarker(marker){
	if (marker.getAnimation() !== null){
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){
			marker.setAnimation(null);
		}, 1300);
	};
};

/**
 * @function populateInfoWindow
 * @description Set up the infowindow with content and behavior
 * @param {object} Marker
 * @param {object} infowindow
 * @param {object} content
 */
function populateInfoWindow(marker, infowindow, content) {
	// check to make sure that infowindow is not already open on this marker
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		// set the infowindowcontent and call open method
		infowindow.setContent(content);
		infowindow.open(map, marker);
		// make sure that marker property is cleared if infowindow is closed.
		infowindow.addListener('closeclick',function(){
			infowindow.marker = null;
		});
	};
};

/**
 * @function mapErrorHandling
 * @description Handling with map errors
 */
function mapErrorHandling() {
	alert("Google Maps has failed to load. Please try again later.");
}
