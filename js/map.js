function initMap(){

  var mapCenterPoint = {
    lat: -23.581346,
    lng: -46.684708
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenterPoint,
    zoom: 15
  });

};
