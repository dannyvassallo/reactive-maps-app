function initializeMapAndMarkers(){
  GoogleMaps.ready('map', function(map) {
    console.log('init');
    // create markers object
    var markers = {};
    // check for navigator to set center
    if (navigator.geolocation) {
      console.log("Saw navigator pulling location...")
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        Session.set("position", pos);
        console.log("Set center.");
        map.instance.setCenter(pos);
        setTimeout(function(){
          $('.map-container').css('opacity', 1);
        }, 500)
      });
    } else {
      setTimeout(function(){
        $('.map-container').css('opacity', 1);
      }, 500)
      alert("Could not get your location.");
    }

    // Create markers on map from DB
    Markers.find().observe({
      added: function(document) {
        // create an image for this marker
        var image = {
          url: document.image,
          // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(20, 32),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(0, 32)
        };
        // Create a marker for this document
        var marker = new google.maps.Marker({
          // draggable: true,
          animation: google.maps.Animation.DROP,
          icon: image,
          position: new google.maps.LatLng(document.lat, document.lng),
          map: map.instance,
          id: document._id
        });

        // Open modal on image click
        google.maps.event.addListener(marker, 'click', function(event) {
          var clickedMarker = Markers.findOne(marker.id);
          $('#imageModal').openModal();
          $('#modalImage').attr('src', clickedMarker.image);
        });

        // Store this marker instance within the markers object.
        markers[document._id] = marker;
      },
      removed: function(oldDocument) {
        // Remove the marker from the map
        markers[oldDocument._id].setMap(null);

        // Clear the event listener
        google.maps.event.clearInstanceListeners(
          markers[oldDocument._id]);

        // Remove the reference to this marker instance
        delete markers[oldDocument._id];
      }
    });

  });
}

Template.mapView.onCreated(function() {
  $('.map-container').css('opacity', 0);
  initializeMapAndMarkers();
});

Template.mapView.rendered = function(){
  $('.map-container').css('opacity', 0);
  initializeMapAndMarkers();
}

Template.mapView.onRendered(function() {
  $('.map-container').css('opacity', 0);
  initializeMapAndMarkers();
});

Template.mapView.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(64.200841, -149.493673),
        zoom: 8
      };
    }
  }
});
