var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 3
};

var map = new kakao.maps.Map(container, options);
var ps = new kakao.maps.services.Places();
var infowindow = new kakao.maps.InfoWindow({zIndex: 1});
var markers = [];

// Handle search input and call searchPlaces when Enter is pressed
document.getElementById('search-bar').addEventListener('keypress', handleSearch);

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
        removeMarker();
        displayPlaces(data);

        // Adjust the map bounds to show all markers
        for (var i = 0; i < data.length; i++) {
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }
        map.setBounds(bounds);

        // Display pagination
        displayPagination(pagination);
    } 
}

// Display a list of places and markers on the map
function displayPlaces(places) {
    var listEl = document.getElementById('placesList'), 
        fragment = document.createDocumentFragment();

    // Remove previous search results
    removeAllChildNods(listEl);

    for (var i = 0; i < places.length; i++) {
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i, places[i]),
            itemEl = getListItem(i, places[i]); // Create search result item

        // Add click event on the list item
        (function(marker, place) {
            itemEl.onclick = function() {
                displayInfowindow(marker, place);
            };
        })(marker, places[i]);

        fragment.appendChild(itemEl);
    }
    listEl.appendChild(fragment);
}

// Display a marker for a place
function addMarker(position, idx, place) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // Marker image URL
        imageSize = new kakao.maps.Size(36, 37),  // Marker image size
        imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691), // Sprite image size
            spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10), // Sprite image origin
            offset: new kakao.maps.Point(13, 37) // Marker position offset
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    // Add click event to display infowindow
    kakao.maps.event.addListener(marker, 'click', function() {
        displayInfowindow(marker, place);
    });

    marker.setMap(map);
    markers.push(marker);
    return marker;
}

// Remove all markers from the map
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// Display an infowindow on a marker
function displayInfowindow(marker, place) {
    var content = '<div style="padding:5px;font-size:12px;">' +
                  '<strong>' + place.place_name + '</strong><br>' +
                  (place.road_address_name ? place.road_address_name + '<br>' : '') +
                  place.address_name + '<br>' +
                  (place.phone ? 'Tel: ' + place.phone + '<br>' : '') +
                  '</div>';

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// Get a list item element for a place
function getListItem(index, place) {
    var el = document.createElement('li'),
        itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
                  '<div class="info">' +
                  '<h5>' + place.place_name + '</h5>';

    if (place.road_address_name) {
        itemStr += '<span>' + place.road_address_name + '</span>' +
                   '<span class="jibun gray">' + place.address_name + '</span>';
    } else {
        itemStr += '<span>' + place.address_name + '</span>';
    }

    itemStr += '<span class="tel">' + place.phone + '</span>' +
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
