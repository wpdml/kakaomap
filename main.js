var markers = [];
var mapContainer = document.getElementById('map'),
    mapOption = { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 3 };
var map = new kakao.maps.Map(mapContainer, mapOption); 
var ps = new kakao.maps.services.Places();  
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

document.getElementById('keyword').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') searchPlaces();
});
document.getElementById('search-btn').addEventListener('click', searchPlaces);

function searchPlaces() {
    var keyword = document.getElementById('keyword').value.trim();
    if (!keyword) {
        alert('Please enter a keyword!');
        return;
    }
    ps.keywordSearch(keyword, function(data, status) {
        if (status === kakao.maps.services.Status.OK) {
            displayPlaces(data);
        } else {
            alert('No search results found.');
        }
    }); 
}

function displayPlaces(places) {
    var bounds = new kakao.maps.LatLngBounds();
    removeMarkers();
    places.forEach(function(place) {
        var position = new kakao.maps.LatLng(place.y, place.x);
        var marker = new kakao.maps.Marker({ position: position });
        marker.setMap(map);
        markers.push(marker);
        bounds.extend(position);
        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent('<div style="padding:5px;">' + place.place_name + '</div>');
            infowindow.open(map, marker);
        });
    });
    map.setBounds(bounds);
}

function removeMarkers() {
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];
}
