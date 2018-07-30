
function initMap(){

  var mapCenterPoint = {
    lat: -23.582944,
    lng: -46.674069
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenterPoint,
    zoom: 15
  });

  var marker = new google.maps.Marker({
    position: mapCenterPoint,
    map: map
  });

  var infoWindow = new google.maps.InfoWindow({
    content: 'testando essa paradinhaaa'
  });

  marker.addListener('click', function(){
    infoWindow.open(map, marker);
  });

};




var ViewModel = function(){
  var self = this;

  // menu toggle visibilty
  self.isVisible = ko.observable(false);
  self.toggleVisibility = function(){
    self.isVisible(!self.isVisible());
  }



}

ko.applyBindings(new ViewModel());
