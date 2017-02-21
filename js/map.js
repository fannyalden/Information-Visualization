function map() {


var margin = {top: 80, right: 20, bottom: 30, left: 20},
    width  = parseInt(d3.select('#map').style('width')),
    widht = widht - margin.left -margin.right,
    mapRatio = 0.5,
    height = (width * mapRatio) + margin.top;     


var map = d3.geomap()
    .geofile('topojson/countries/USA.json')
    .projection(d3.geo.albersUsa)
    .scale(width)
    .translate([width /2, height / 2]);

d3.select('#map')
    .call(map.draw, map);



}