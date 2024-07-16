var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 3
};

var map = new kakao.maps.Map(container, options);
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
var ps = new kakao.maps.services.Places(); 
var infowindow = new kakao.maps.InfoWindow({zIndex:1});
var markers = [];

// Handle search input and call searchPlaces when Enter is pressed
function handleSearch(event) {
    if (event.key === 'Enter') {
        searchPlaces();
    }
}

// Search for places based on the keyword
function searchPlaces() {
    var keyword = document.getElementById('search-bar').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // Use the keyword to search for places
    ps.keywordSearch(keyword, placesSearchCB);
}

// Callback function for the keyword search
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        var bounds = new kakao.maps.LatLngBounds();
        
        // Clear existing markers
        removeMarker();
        
        // Display markers for each place
        for (var i = 0; i < data.length; i++) {
            displayMarker(data[i]);    
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        // Adjust the map bounds to show all markers
        map.setBounds(bounds);

        // Display pagination
        displayPagination(pagination);
        displayPlaces(data);
    } 
}

// Display a marker for a place
function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    // Add click event listener to the marker
    kakao.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });

    markers.push(marker);
}

// Remove all markers from the map
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }   
    markers = [];
}

// Display pagination for the search results
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i;

    // Remove existing pagination
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
    }

    // Create pagination links
    for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i === pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

// Display places list
function displayPlaces(places) {
    var listEl = document.getElementById('placesList');
    var fragment = document.createDocumentFragment();
    var bounds = new kakao.maps.LatLngBounds();
    removeAllChildNodes(listEl);

    for (var i = 0; i < places.length; i++) {
        var itemEl = getListItem(i, places[i]); // get element
        fragment.appendChild(itemEl);
    }

    listEl.appendChild(fragment);
}
// Create a list item for each place
function getListItem(index, place) {
    var el = document.createElement('li');
    var itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                  '<div class="info">' +
                  '   <h5>' + place.place_name + '</h5>';

    if (place.road_address_name) {
        itemStr += '    <span>' + place.road_address_name + '</span>' +
                   '   <span class="jibun gray">' + place.address_name + '</span>';
    } else {
        itemStr += '    <span>' + place.address_name + '</span>';
    }

    itemStr += '  <span class="tel">' + place.phone + '</span>' +
               '</div>';

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
}

// Remove all child nodes of an element
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

// Function to toggle the search bar visibility
function toggleSearch() {
    var searchBar = document.getElementById('search-bar');
    if (searchBar.style.display === 'none' || searchBar.style.display === '') {
        searchBar.style.display = 'inline-block';
        searchBar.focus();
    } else {
        searchBar.style.display = 'none';
    }
}
document.getElementById('search-button').addEventListener('click', searchPlaces);