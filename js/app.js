'use strict';

// declaring global variables
var map;
var infoWindow;
var markers = [];


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
		gestureHandling: 'cooperative',
    styles: mapStyles,
    mapTypeControl: false
	};
	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	// assign to variables the map center and zoom when rendered
	var initialCenter = map.getCenter();
	var initialZoom = map.getZoom();
	goToInitialPosition(map, initialCenter, initialZoom);

	infoWindow = new google.maps.InfoWindow();
	ko.applyBindings(new ViewModel());
};


/**
 * @function Map centralization and zooming
 * @description Return to center and start zoom when click on the
 * right mouse button
 */
function goToInitialPosition(map, center, zoom){
	google.maps.event.addListener(map, 'rightclick', function(){
		map.setCenter(center);
		map.setZoom(zoom);
	});
};


// create an object/class to represent the venue with foursquare data
var Venue = function(data){
	self = this;

	this.title = data.name;
	this.description = data.description;
	this.categories = data.categories;
	this.location = data.location;
	this.address = '';
	this.city = '';
	this.state = '';

	// -> INCLUIR ITEMS DE FOTOS APÓS DESCOMENTAR FUNÇÃO GET VENUES DETAILS

	var foursquareSearchEndpoint = 'https://api.foursquare.com/v2/venues/search' +
												'?limit=1' +
												'&ll='+ this.location.lat +','+ this.location.lng +
												'&client_id='+ CLIENT_ID +
												'&client_secret='+ CLIENT_SECRET +
												'&v=20140806';


	$.getJSON(foursquareSearchEndpoint, function(){
		console.log('Success');
	})
		.done(function(responseData){
			var foursquareVenueId = responseData.response.venues[0].id;
			// getVenueDetails(foursquareId); -> ATINGIU QUOTA DIÁRIA -> CONTINUAR SEM ELA

			// PARA CONTINUAR -> DELETAR DEPOIS
			var results = responseData.response.venues[0];
			// console.log(results);
			self.address = results.location.address;
			self.city = results.location.city;
			self.state = results.location.state;

			this.visible = ko.observable(true);

		})
		.fail(function() {
    	console.log( "error" );
  	});

	/* DEIXAR COMENTADO ATÉ QUE USEMOS DADOS DA API DO FOURSQUARE
	/**
	* @function Get venue's details from foursquare
	* @description Used as callback for the search request to foursquare
	* @param {object} Foursquare data

	function getVenueDetails(id){
		var foursquareDetailsEndpoint = 'https://api.foursquare.com/v2/venues/' +
													id +
													'?&client_id='+ CLIENT_ID +
													'&client_secret='+ CLIENT_SECRET +
													'&v=20140806';
		$.getJSON(foursquareDetailsEndpoint, function(){
			console.log('Success');
		})
			.done(function(responseData){
				return responseData;
			})
			.fail(function() {
				console.log( "error" );
			});
	};
	*/

	// create custom marker icons symbols
	var defaultIcon = createMarkerIcon('#1f2fda', '#ffffff');
	var highlightedIcon = createMarkerIcon('#ffffff','#1f2fda');

	this.marker = new google.maps.Marker({
		map: map,
		position: this.location,
		title: this.title,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP
	});

	this.marker.setMap(map);

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
		populateInfoWindow(this, infoWindow);
		// when clicked, the marker bounces
		bounceMarker(this);
		// when clicked, pan to the marker position
		map.panTo(this.getPosition());
	});


}


/**
 * @function Marker icon styling
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
 * @function Marker bounces
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

// Populate info InfoWindow
function populateInfoWindow(marker, infowindow) {
	// check to make sure that infowindow is not already open on this marker
	if (infowindow.marker != marker) {
		infowindow.marker = marker;

		// create the contentString for the basic infowindow
		var contentString = '<h4 class="infowindow-title">Teste MOTHAFUCKER</h4>'

		infowindow.setContent(contentString);

		// make sure that marker property is ccleared if infowindow is closed.
		infowindow.addListener('closeclick',function(){
			infowindow.marker = null;
		});
		infowindow.open(map, marker);
	};
};



var ViewModel = function(){
  var self = this;

	this.listOfVenues = ko.observableArray([]);

	locations.forEach(function(each){
		self.listOfVenues.push(new Venue(each))
	});

	console.log(self.listOfVenues());



	self.isVisible = ko.observable(true);
	// show/hide sidebar when the toggle button is clicked
	self.toggleVisibility = function(){
		self.isVisible(!self.isVisible());
	};

/*
  // set up the markers render into the map
  var createMarkers = function(){
    var bounds = new google.maps.LatLngBounds();
    var largeInfowindow = new google.maps.InfoWindow();

    // create custom marker icons symbols
    var defaultIcon = createMarkerIcon('#1f2fda', '#ffffff');
    var highlightedIcon = createMarkerIcon('#ffffff','#1f2fda');

    // iterate through the locations list from data.js
    for(var i = 0; i < locations.length; i++){

      // get position, title, description and category from locations
      var position = locations[i].location;
      var title = locations[i].name;
			var description = locations[i].description;
			var categories = locations[i].categories;

      // create a marker per location
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
				description: description,
				categories: categories,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // push the marker to the marker array
      markers.push(marker);
      // extends the boundaries of the map for each marker
      bounds.extend(marker.position);
      // set marker icons event listeners for mouseover and for mouseout
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
			// add click event handlers to the marker
			marker.addListener('click', function(){
				// when clicked, the marker bounces
				bounceMarker(this);
				// create an event to open the infowindow
				populateInfoWindow(this, largeInfowindow);
			});
    };
    map.fitBounds(bounds);
  }();

  // function to create a custom symbol with the fill color and border color
  // passing as parameters
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

  // Bounces a marker three times
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

  // Populate info InfoWindow
  function populateInfoWindow(marker, infowindow) {
    // check to make sure that infowindow is not already open on this marker
    if (infowindow.marker != marker) {
      infowindow.marker = marker;

			// create the contentString for the basic infowindow
			var contentString = '<h4 class="infowindow-title">' + marker.title + '</h4>'
			for(var i = 0; i < marker.categories.length; i++){
				contentString += '<span class="infowindow__badge">' + marker.categories[i] + '</span>';
			}
			contentString += '<p class="infowindow-description">' + marker.description + '</p>';

			// GET FORSQUARE INFOS
			getFoursquareData(marker);

			infowindow.setContent(contentString);
      infowindow.open(map, marker);

      // make sure that marker property is ccleared if infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });
    }
  };

	// get the id of a venue according to latitude and longitude
	function getFoursquareData(marker){
		// transform the marker position object to literal
		var position = marker.position.toJSON();
		$.ajax({
			url: 'https://api.foursquare.com/v2/venues/search',
			dataType: 'json',
			data: 'limit=1' +
								'&ll='+ position.lat +','+ position.lng +
								'&client_id='+ 'GHOKJ5MS1RUMWAY4GZHCOCDYOBTTSEE2E3PDGJ2RORGPDJWF' +
								'&client_secret='+ 'FKVS2BG2CXDXQSDK4OZ4J13DRIF5ZZAK1JGQBBRJRI2H3M1V' +
								'&v=20140806',
				async: true,
			success: function (data) {
				getTeste(data);
			},
			error: function() {
				console.log('Error to get venue ID');
			}
		});
	};



function getTeste(data){
	var b = data.response.venues[0].id;
	$.ajax({
		url: 'https://api.foursquare.com/v2/venues/',
		dataType: 'json',
		data: b + 'photos' +
						'?&client_id='+ 'GHOKJ5MS1RUMWAY4GZHCOCDYOBTTSEE2E3PDGJ2RORGPDJWF' +
						'&client_secret='+ 'FKVS2BG2CXDXQSDK4OZ4J13DRIF5ZZAK1JGQBBRJRI2H3M1V' +
						'&v=20140806',
			async: true,
		success: function(data){
			console.log(data.response.venue);
		},
		error: function(){
			console.log('Error to get venue data');
		}
	});
}








	// get venue Data
	function getFoursquareVenueData(venueId){
		$.ajax({
			url: 'https://api.foursquare.com/v2/venues/',
			dataType: 'json',
			data: venueId +
							'?&client_id='+ 'GHOKJ5MS1RUMWAY4GZHCOCDYOBTTSEE2E3PDGJ2RORGPDJWF' +
							'&client_secret='+ 'FKVS2BG2CXDXQSDK4OZ4J13DRIF5ZZAK1JGQBBRJRI2H3M1V' +
							'&v=20140806',
				async: true,
			success: function(data){
				console.log(data.response.venue);
			},
			error: function(){
				console.log('Error to get venue data');
			}
		});
	};


*/
}




/* TO DO
- config infowindow
--- add third part api (foursquare)

- config filter
- confirg list
- error event handlers
*/
