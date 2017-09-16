/* =========== Helper Data  & Variables =========== */

var map;
var infowindow;
var initLocations = [
        {title: 'عبد القادر المراغي', location: {lat: 29.848723, lng: 31.336856}},
        {title: 'مترو أنفاق القاهرة', location: {lat: 29.848982, lng: 31.334231}},
        {title: 'الحديقة اليابانية (حلوان)',location: { lat: 29.848811, lng: 31.340337}},
        {title: 'المحكمة الدستورية العليا (مصر)', location: {lat: 29.849315, lng: 31.339065}},
        {title: 'المركز الطبي بحلوان', location: {lat: 29.851187, lng: 31.336489}},
        {title: 'مجموعة ألفا', location: {lat: 29.8512145, lng: 31.3349293}},
        {title: 'البنك الأهلي المصري', location: {lat: 29.8490806, lng: 31.3388262}},
        {title: 'كلية الهندسة (جامعة حلوان)', location: {lat: 29.846755, lng: 31.335369}}];

/* =========== Helper Jquery >> 'toggle menu list' =========== */

$(".do").click(function(){$(".myMenu").toggle();});

/* =========== Helper Functions =========== */

// When map error
function googleError() {
    alert("Error during load map");
}
// Let Marker Animate
function animateMarker() {
        var self = this;
        self.setAnimation(google.maps.Animation.BOUNCE);
        infoWindowMsg(self);
        setTimeout(function () {self.setAnimation(null);self.setIcon(null);}, 2000);
    }
// Show info window associated with marker .. And Make some Magic With Ajax
function infoWindowMsg(marker) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        var wikiUrl = 'https://ar.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
                  '&format=json&callback=wikicallback';
        var wikiRequestTimeout = setTimeout(function(){
            infowindow.setContent('failed to get wikipedia resources');
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            // jsonp: "callback",
            success: function(response) {
                // That will return array so articleList is now array
                var articleList = response[1];
                var articleQuotes =response[2];
                for(var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    articleSnippet = articleQuotes[i];
                    infowindow.setContent('<h3>' + articleStr + '</h3>' + '<p>' + articleSnippet + '</p>')
                }
                clearTimeout(wikiRequestTimeout);
            }
            
        });
        infowindow.setOptions({maxWidth:200});
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function(){
            infowindow.setMarker(null);
        });
    }
}

/* =========== Our Map =========== */

function initMap() {
    infowindow = new google.maps.InfoWindow();
    // Fit to make sense just remem .. down extend it for every marker
    var bounds = new google.maps.LatLngBounds();
    var labels = '12345678';
    var labelIndex = 0;
    // Create Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 29.847095,
            lng: 31.337254
        },
        zoom: 13
    });
    // See Me the transit to Metro
    var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);
    // Let's Do some fun
    var image = {
        url: 'http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png',
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(40, 40)
        };
    // Making array of markers objects.
    initLocations.forEach(function(currentValue, i){
        var position = currentValue.location;
        var title = currentValue.title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            label: labels[labelIndex++ % labels.length],
            id: i,
            icon: image
        });
        viewObj.markers.push(marker);
        bounds.extend(marker.position);
        // When marker clicke >> Do some magic!
        marker.addListener('click', animateMarker);
    });   
    // Apply above bounds to our map
    map.fitBounds(bounds);
    google.maps.event.addDomListener(window, 'resize', function () {
        map.fitBounds(bounds);
    });
    viewObj.insert("");
}

/* =========== Our View =========== */

function ViewModel() {
    // in any anonymous fn use self
    var self = this;

    this.markers = ko.observableArray([]);
    this.menuList = ko.observableArray([]);
    this.insert = ko.observable();
    
    // This like Change in Jquery >> Used to list Search
    this.insert.subscribe(function () {
        self.menuList([]);
        self.markers().forEach(function(c, i){
        if (self.markers()[i].title.toLowerCase().includes(self.insert().toLowerCase())) {
                self.menuList.push(self.markers()[i]);
                self.markers()[i].setMap(map);
            } 
            else {self.markers()[i].setMap(null);}
    });
    });
    
    // When click searcherKey 'list item' >> Fire animation
    this.animateSearchMarker = function (searcherKey = self.markers()[station.id]) {
        searcherKey.setAnimation(google.maps.Animation.BOUNCE);
        infoWindowMsg(searcherKey);
        setTimeout(function () {searcherKey.setAnimation(null);searcherKey.setIcon(null)}, 2000);
    };   
    
}
// Apply Binding
var viewObj = new ViewModel();
ko.applyBindings(viewObj);
