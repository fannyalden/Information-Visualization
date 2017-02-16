function map() {


var map = d3.geomap()
    .geofile('topojson/countries/USA.json')
    .projection(d3.geo.albersUsa)
    .scale(800);

d3.select('#map')
    .call(map.draw, map);

}