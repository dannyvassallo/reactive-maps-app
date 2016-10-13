import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

function initializeMapAndMarkers(){
  GoogleMaps.ready('map', function(map) {
    google.maps.event.addListener(map.instance, 'click', function(event) {
      Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });

    var markers = {};

    if (navigator.geolocation) {
      console.log("Saw navigator pulling location...")
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
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

    Markers.find().observe({
      added: function(document) {
        // Create a marker for this document
        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(document.lat, document.lng),
          map: map.instance,
          // We store the document _id on the marker in order
          // to update the document within the 'dragend' event below.
          id: document._id
        });

        // This listener lets us drag markers on the map and update their corresponding document.
        google.maps.event.addListener(marker, 'dragend', function(event) {
          Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
        });

        // Store this marker instance within the markers object.
        markers[document._id] = marker;
      },
      changed: function(newDocument, oldDocument) {
        markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
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

Template.map.onCreated(function() {
  $('.map-container').css('opacity', 0);
  initializeMapAndMarkers();
});

Template.map.rendered = function(){
  $('.map-container').css('opacity', 0);
  initializeMapAndMarkers();
}

Template.map.onRendered(function() {
  $('.map-container').css('opacity', 0);
  initializeMapAndMarkers();
});

Meteor.startup(function() {
  GoogleMaps.load();
});

Template.map.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(64.200841, -149.493673),
        zoom: 8
      };
    }
  }
});
