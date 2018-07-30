'use strict';

var map, marker;
// create an empty array to store the markers
var markers = [];



// initizalizes the map
function initMap() {
	// Set up the map constructor, which only requires center and zoom
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -23.582944, lng: -46.674069},
    zoom: 12
	});
}


var ViewModel = function(){
  var self = this;

  // show/hide sidebar when the toggle button is clicked
  self.isVisible = ko.observable(false);
  self.toggleVisibility = function(){
    self.isVisible(!self.isVisible());
  };

  // create the markers accordind the list of location into data.js
  var createMarkers = function(){
    for(var i = 0; i < locations.length; i++){
      // get position of the venue from venueData array
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
      // push the marker to our marker array
      markers.push(marker);
    };
  }();


}

var init = function(){

  initMap();

  ko.applyBindings(new ViewModel());
}
