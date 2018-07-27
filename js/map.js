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

};
