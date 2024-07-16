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

function handleSearch(event) {
    if (event.key === 'Enter') {
        searchPlaces();
    }
}

function searchPlaces() {
    var keyword = document.getElementById('search-bar').value.trim(); // Trim whitespace

    if (!keyword) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        var bounds = new kakao.maps.LatLngBounds();
        
        removeMarker();
        removeAllChildNodes(document.getElementById('placesList'));

        for (var i = 0; i < data.length; i++) {
            displayMarker(data[i]);    
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        map.setBounds(bounds);

        displayPagination(pagination);
        displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
    } 
}

function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    kakao.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
    kakao.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close();
    });

    markers.push(marker);
}

function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }   
    markers = [];
}

function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i;

    // Remove existing pagination
    removeAllChildNodes(paginationEl);

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
                    scrollToTop();
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

function scrollToTop() {
    var menuWrap = document.getElementById('menu_wrap');
    if (menuWrap) {
        menuWrap.classList.add('scroll-to-top'); 
        menuWrap.scrollTop = 0; 
        setTimeout(function() {
            menuWrap.classList.remove('scroll-to-top');
        }, 500); 
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
}

function displayPlaces(places) {
    var listEl = document.getElementById('placesList');
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < places.length; i++) {
        var itemEl = getListItem(i, places[i]);
        fragment.appendChild(itemEl);
    }

    listEl.appendChild(fragment);
}

function getListItem(index, place) {
    var el = document.createElement('li');
    el.className = 'item';

    var itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
        '<div class="info">' +
        '<h5>' + place.place_name + '</h5>';

    if (place.road_address_name) {
        itemStr += '<div><span>' + place.road_address_name + '</span></div>' +
            '<div><span class="jibun gray">' + place.address_name + '</span></div>';
    } else {
        itemStr += '<div><span>' + place.address_name + '</span></div>';
    }

    itemStr += '<div><span class="tel">' + place.phone + '</span></div>' +
        '</div>';

    el.innerHTML = itemStr;

    el.addEventListener('mouseover', function() {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, markers[index]);
    });

    el.addEventListener('mouseout', function() {
        infowindow.close();
    });

    return el;
}

function removeAllChildNodes(el) {   
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

function toggleSearch() {
    var searchBar = document.getElementById('search-bar');
    searchBar.style.display = (searchBar.style.display === 'none' || searchBar.style.display === '') ? 'inline-block' : 'none';
}

document.getElementById('search-button').addEventListener('click', searchPlaces);
