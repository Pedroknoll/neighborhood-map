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

  // create the markers according the list of location into data.js
  var createMarkers = function(){
    var bounds = new google.maps.LatLngBounds();

    // creates marker icons
    var defaultIcon = createMarkerIcon('#1f2fda', '#ffffff');
    var highlightedIcon = createMarkerIcon('#ffffff','#1f2fda');

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
      // extends the boundaries of the map for each marker
      bounds.extend(marker.position);
      // set icons for events of mouseover and mouseout
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });

    };
    map.fitBounds(bounds);
  }();

  // function to create a custom symbol with the fill color and border color
  // passing as parameters
  function createMarkerIcon(markerFillColor, markerBorderColor){
    return {
      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
      scale: 1.1,
      fillOpacity: 1,
      fillColor: markerFillColor,
      strokeColor: markerBorderColor,
      strokeWeight: 2
    };
  };

}

// initialize the app
var init = function(){

  initMap();

  ko.applyBindings(new ViewModel());
}
