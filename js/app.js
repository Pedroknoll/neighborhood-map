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

  self.isVisible = ko.observable(false);

  // show/hide sidebar when the toggle button is clicked
  self.toggleVisibility = function(){
    self.isVisible(!self.isVisible());
  };

  // create the markers according the list of location into data.js
  var createMarkers = function(){

    var bounds = new google.maps.LatLngBounds();

    for(var i = 0; i < locations.length; i++){
      // get position from locations
      var position = locations[i].location;
      var title = locations[i].name;
      // create a marker per location
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // push the marker to the marker array
      markers.push(marker);
      // extends the boundaries of the map for each marker
      bounds.extend(marker.position);

    };
    map.fitBounds(bounds);
  }();


}

// initialize the app
var init = function(){

  initMap();

  ko.applyBindings(new ViewModel());
}
