'use strict';

var map;




var ViewModel = function(){
  var self = this;

  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -23.582944, lng: -46.674069},
    zoom: 12
  });

  // menu toggle visibilty
  self.isVisible = ko.observable(false);
  self.toggleVisibility = function(){
    self.isVisible(!self.isVisible());
  }

}

function initApp(){
  ko.applyBindings(new ViewModel());
}
