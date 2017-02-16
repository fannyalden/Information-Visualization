function map() {


var map = d3.geomap()
    .geofile('topojson/countries/USA.json');

d3.select('#map')
    .call(map.draw, map);

}