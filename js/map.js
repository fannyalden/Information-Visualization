function map(data1, data2) {

    var zoom = d3.behavior.zoom()
            .scaleExtent([0.5, 8])
            .on("zoom", move);

    var mapDiv = $("#map");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = mapDiv.width() - margin.right - margin.left,
            height = mapDiv.height() - margin.top - margin.bottom;

    var curr_mag = 4;

    // var format = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");

    // var timeExt = d3.extent(data.map(function (d) {
    //     return format.parse(d.time);
    // }));

   // var filterdData = data1;

    //Sets the colormap
    var colors = colorbrewer.Set3[10];

    //Assings the svg canvas to the map div
    var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

    var g = svg.append("g");

    // Define the div for the tooltip
    var div = d3.select("#map").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    //Sets the map projection
    var projection = d3.geo.mercator()      //bara translate så får man kartan i helbild, men med för stora punkter
   // .translate([width/2, height/2]);
            .scale(900)
            .translate([1.5*width, 1.5*height]);

    //Creates a new geographic path generator and assing the projection        
    var path = d3.geo.path().projection(projection);

    //Formats the data in a feature collection trougth geoFormat()
    var geoData = {type: "FeatureCollection", features: geoFormat(data1)};
    //geoTrav baseras på march_2016 (dvs turer) och innehåller arrayer med namn och coordinater för origin och destination
    var geoTrav = {type: "TravelCollection", features: geoTravel(data2, data1)};    //har nu alltså ett object med namn och long/lat baserat på om det är origin eller dest

    // console.log("geoDATTTA" + geoData);
    // console.log("geoTRAVELSAKEN" + geoTrav);

    //create lines
    var lines = geoLine(geoTrav);

    //Loads geo data
    d3.json("data/world-topo.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;
        draw(countries);
    });


    //Formats the data in a feature collection
    function geoFormat(array) {
        var data = [];
        array.map(function (d, i) {
            data.push({
                type: 'Feature',
                geometry: { 
                    type:'Point',
                    coordinates: [d.long, d.lat]
                },
                properties: d,      //behöver vi verkligen ha allt?? extra beräkningstung?

            });

        });
        return data;
    }

    // //Calls the filtering function 
    // d3.select("#slider").on("input", function () {
    //     filterMag(this.value, data);
    // });

    function geoTravel(array, geoData) {
        var data = [];
        array.map(function (d, i) {

            for(var j = 0; j< geoData.length; j++){
                //console.log(d.ORIGIN)
                if(geoData[j].iata == d.ORIGIN){

                    for(var k = 0; k< geoData.length; k++){
                        if( geoData[k].iata == d.DEST){

                            data.push({
                                type: 'Route',

                                //if iata = origin
                                origin: {name: d.ORIGIN, coordinates: [geoData[j].long, geoData[j].lat]},
                                //if iata = dest
                                dest: {name: d.DEST, coordinates: [geoData[k].long, geoData[k].lat]},
                                properties: d,
                            });
                        }
                    }
                }
            }
        });

        return data;
    }


    //creates lines 
    function geoLine(data){
        var lines = [];

            for( var i = 0; i < _.size(data); i++){
            
                lines.push({
                    type: 'LineString',
                    coordinates:[ 
                                [data.features[i].origin.coordinates[0], data.features[i].origin.coordinates[1]], //lat, long
                                [data.features[i].dest.coordinates[0], data.features[i].dest.coordinates[1]]    //WRONG
                        ]
                });
            }
        //console.log(lines)
        return lines;
    }

    //Draws the map and the points
    function draw(countries)
    {
        //draw map
        var country = g.selectAll(".country").data(countries);


        country.enter().insert("path")
                .attr("class", "country")
                .attr("d", path)
                .style('stroke-width', 1)
                .style("fill", "lightgray")
                .style("stroke", "white");


                // console.log(geoData)
                // console.log(geoTrav)
                // console.log(geoTrav.features[1])

        //draw point with airports 
        var point = g.selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr("d", path)
            .classed("Point", true)
            .on("mouseover", function(d) { 
                //this.
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Airport: " + d.properties.airport)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
            })                  
            .on("mouseout", function(d) {       
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            })
            .on("click", function(d){
                // färga alla trajectories som 
            }); 

        var route = g.selectAll("path")
            //.append("path")
            .data(lines)
            .datum({type: "LineString", coordinates: [lines[0].coordinates, lines[1].coordinates] })
            .enter().append("path")
            .style("stroke", "black")
            .attr("class", "route")
            .attr("d", path);
        
    };



    //Zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
    }

    //Prints features attributes
    function printInfo(value) {
        var elem = document.getElementById('info');
        elem.innerHTML = "Place: " + value["place"] + " / Depth: " + value["depth"] + " / Magnitude: " + value["mag"] + "&nbsp;";
    }


}
