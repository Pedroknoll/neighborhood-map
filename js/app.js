'use strict';

var map, marker;

// create an empty array to store the markers
var markers = [];



// initizalize the map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -23.582944, lng: -46.674069},
    zoom: 12,
    styles: mapStyles,
    mapTypeControl: false
	});
}


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
      // get position from locations
      var position = locations[i].location;
      var title = locations[i].name;
      // create a marker per location
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // push the marker to the marker array
      markers.push(marker);
      // create an event to open the infowindow
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      // extends the boundaries of the map for each marker
      bounds.extend(marker.position);
      // set marker icons event listeners for mouseover and for mouseout
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
      // when clicked, the marker bounces
      marker.addListener('click', toggleBounce);

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
  function toggleBounce(){
    marker = this;
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
      infowindow.setContent('<div>' + marker.title + '</div>');
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
- when click the marker
--- bounce whith timeout
--- open infowindow

marker.addListener('click', CALLBACK);

function CALLBACK(){
  if (marker.getAnimation() !== null){
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
      marker.setAnimation(null);
    }, 900);
  };
}

- info window for markers with third part apis
- list of locations
- filter field
- error event handlers
*/
