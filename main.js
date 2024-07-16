//검색 목록 띄우기
//줌인 줌아웃 가능하게 만들기(완료)
//줌인 줌아웃 지도 영역에 따라서 위치 표시
//페이지네이션
//마커 누르면 내용 불러오기
//이 지역 검색

var map;
var markers = [];
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
var ps = new kakao.maps.services.Places();

function initMap() {
    var container = document.getElementById("map");
    var options = {
        center: new kakao.maps.LatLng(37.541, 126.986),
        level: 3,
    };
    map = new kakao.maps.Map(container, options);
    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

function handleSearch(event) {
    if (event.key === "Enter") {
        searchPlaces();
    }
}

function searchPlaces() {
    var keyword = document.getElementById("search-bar").value.trim();

    if (!keyword) {
        alert("검색어를 입력해주세요!");
        return false;
    }

    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 존재하지 않습니다.");
    } else {
        alert("검색 결과 중 오류가 발생했습니다.");
    }
}

function displayPlaces(places) {
    var listEl = document.getElementById("placesList");
    var menuEl = document.getElementById("menu_wrap");
    var bounds = new kakao.maps.LatLngBounds();
    removeAllChildNods(listEl);
    removeMarker();

    for (var i = 0; i < places.length; i++) {
        var marker = addMarker(new kakao.maps.LatLng(places[i].y, places[i].x), i, places[i].place_name);
        bounds.extend(marker.getPosition());
        var itemEl = getListItem(i, places[i]);
        bindInfoWindow(marker, places[i], itemEl);
        listEl.appendChild(itemEl);
    }

    map.setBounds(bounds);
}

function addMarker(position, idx, title) {
    var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png";
    var imageSize = new kakao.maps.Size(36, 37);
    var imgOptions = {
        spriteSize: new kakao.maps.Size(36, 691),
        spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10),
        offset: new kakao.maps.Point(13, 37),
    };
    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);

    var marker = new kakao.maps.Marker({
        position: position,
        image: markerImage,
    });

    marker.setMap(map);
    markers.push(marker);

    return marker;
}

function bindInfoWindow(marker, place, itemEl) {
    kakao.maps.event.addListener(marker, "click", function () {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>");
        infowindow.open(map, marker);
    });

    itemEl.addEventListener("mouseover", function () {
        displayInfowindow(marker, place.place_name);
    });

    itemEl.addEventListener("mouseout", function () {
        infowindow.close();
    });
}

function displayPagination(pagination) {
    var paginationEl = document.getElementById("pagination");
    removeAllChildNods(paginationEl);

    for (var i = 1; i <= pagination.last; i++) {
        var el = document.createElement("a");
        el.href = "#";
        el.innerHTML = i;

        if (i === pagination.current) {
            el.className = "on";
        } else {
            el.onclick = (function (i) {
                return function () {
                    pagination.gotoPage(i);
                };
            })(i);
        }

        paginationEl.appendChild(el);
    }
}

function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

function toggleSearch() {
    var searchBar = document.getElementById("search-bar");
    searchBar.style.display = searchBar.style.display === "none" || searchBar.style.display === "" ? "inline-block" : "none";
    if (searchBar.style.display !== "none") {
        searchBar.focus();
    }
}

