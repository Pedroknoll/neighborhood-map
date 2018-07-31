'use strict';

var map;
// create an empty array to store the markers
var markers = [];


// Set up the map for initialization.
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

	// function to return to center when click on the right mouse button
	function goToInitialPosition(map, center, zoom){
		google.maps.event.addListener(map, 'rightclick', function(){
			map.setCenter(center);
			map.setZoom(zoom);
		});
	};
};


var ViewModel = function(){
  var self = this;

  self.isVisible = ko.observable(true);
  // show/hide sidebar when the toggle button is clicked
  self.toggleVisibility = function(){
    self.isVisible(!self.isVisible());
  };

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
				toggleBounce(this);
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
  function toggleBounce(marker){
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

			infowindow.setContent(contentString);

      infowindow.open(map, marker);

      // make sure that marker property is ccleared if infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });
    }
  };

}

// initialize the app
var init = function(){

  initMap();

  ko.applyBindings(new ViewModel());
}



/* TO DO
- config infowindow
--- add description
--- add category
--- add third part api (foursquare)

- config filter
- confirg list
- error event handlers
*/
