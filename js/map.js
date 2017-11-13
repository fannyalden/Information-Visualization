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


    //Assings the svg canvas to the map div
    var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

    var size = d3.scale.pow().exponent(1)
      .domain([1,100])
      .range([8,24]);
        var nominal_base_node_size = 8;

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



    //creates an array with number of flights
    var air = createAir(data2);                 //SEND THIS TO menu.js!!!!!!!!!!!

    //Formats the data in a feature collection trougth geoFormat()
    var geoData = {type: "FeatureCollection", features: geoFormat(data1)};
    //geoTrav baseras på march_2016 (dvs turer) och innehåller arrayer med namn och coordinater för origin och destination
    var geoTrav = {type: "TravelCollection", features: geoTravel(data2, data1)};    //har nu alltså ett object med namn och long/lat baserat på om det är origin eller dest
    console.log(geoTrav)

    var nrFlightOr = nrFlightsOrigin(data2);//nr of flights origin from aiports
    console.log(nrFlightOr)

    //airports includes the name, coords and number of flights departuring for all aiports in the data.
    var airPorts = geoAirports(data2, nrFlightOr);

    //create lines
    var lines = geoLine(geoTrav);

    var info = d3.select("#info").append("div");
   // var percent = calcPercent(geoTrav);


    //Loads geo data
    d3.json("data/world-topo.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;

        draw(countries,lines, air, nrFlightOr);
    });



    //creates an array with number of flights going from the different origins in order to set size of dots in map according to that.
    function nrFlightsOrigin(data){
        nrFlights = {}

        data.forEach(function(obj) {
            var key = JSON.stringify(obj.ORIGIN)
            nrFlights[key] = (nrFlights[key] || 0) + 1
        })

        return nrFlights;
    }


    function geoAirports(data, nrFlights){
        var array = [];
        var flightCount = d3.nest()         //group unique airports, value is the number of flights departuring from that airport
            .key(function(d){ return d.ORIGIN })
            .rollup(function(v){ return v.length})
            .entries(data);

        data.forEach(function(d){
            for(var k = 0; k < flightCount.length; k++){
                if(flightCount[k].key == d.ORIGIN)
                {
                     array.push({
                        type: "airport",
                        geometry:{
                            type:"Point",
                            name: d.ORIGIN,
                            coords: [d.long, d.lat]
                        },
                        nrflight: flightCount[k].values
                    })
                }
            }

        })
       
        return array;
    }

//skapar en array med antal flyg och antal försenade flyg per flygplats
    function createAir(data){
        console.log(data)
    }


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

function geoTravel(array, geoData) {
        var data = [];
        var q = 0;

        console.log(array)
        console.log(geoData)
        array.map(function (d, i) {
            
             for(var j = 0; j< geoData.length; j++){
                 //console.log(d.ORIGIN)
                 if(geoData[j].iata == d.ORIGIN){
                    
                     for(var k = 0; k< geoData.length; k++){
                         if( geoData[k].iata == d.DEST){

                             data.push({
                                 type: 'Feature',
                                 origin: {
                                     type: 'Point',
                                     name: d.ORIGIN, 
                                     coordinates: [geoData[j].long, geoData[j].lat]},
                                     //perc: percent,
                                day: parseInt(array[i].DAY_OF_WEEK),
                                delay: d.DEP_DELAY,
                                dest: {
                                    name: d.DEST,
                                    coordinates: [geoData[k].long, geoData[k].lat]},
                             });
                         }
                     }
                 }
             }

            
         });

// array.map(function (d, i) {
//             for(var i = 0; i< air[0].length; i++){
                
//                 for(var j = 0; j < geoData.length; j++){
//                     if(air[0][i] == geoData[j].iata){
                        
//                         for(var k = 0; k < geoData.length; k++){
//                             if( geoData[k].iata == array[i].DEST){

//                                 var percent = calcPercent(air[1][i], air[2][i]);
//                                 var day = dayOfWeek(parseInt(array[i].DAY_OF_WEEK));

//                                // console.log(d)
                                
//                                 data.push({
//                                     type: 'Feature',
//                                     //if iata = origin
//                                     geometry: {
//                                         type: 'Point',
//                                         name: d.ORIGIN,//geoData[j].airport, 
//                                         coordinates: [geoData[j].long, geoData[j].lat]},
//                                     percent: percent,
//                                     weekday: day,
//                                     flightCount: air[1][i],
//                                     // delayCount: air[2][i],
//                                     //if iata = dest
//                                     dest: {name: d.DEST, coordinates: [geoData[k].long, geoData[k].lat]},
//                                     //properties: d,
//                                 });
//                             }
//                         }
//                     }
//                 }
//             }
//              });

        return data;
}

    //creates lines 
    function geoLine(data){
        var lines = [];
        //console.log(data)
            for( var i = 0; i < _.size(data.features); i++){
            
                lines.push({
                    type: 'LineString',
                    airportOrigin: data.features[i].geometry.nameOrigin, //testing for drawing only airports with flights
                    dest: data.features[i].dest.name,
                    coordinates:[ 
                                [data.features[i].geometry.coordinates[0], data.features[i].geometry.coordinates[1]], //lat, long
                                [data.features[i].dest.coordinates[0], data.features[i].dest.coordinates[1]]    //WRONG
                        ]
                });
            }
        
        return lines;
    }

    //Draws the map and the points
    function draw(countries, lines, air, nrFlight)
    {

        console.log(lines)

        //draw map
        var country = g.selectAll(".country")
            .data(countries)
            .enter().insert("path")
            .attr("class", "country")
            .attr("d", path)
            .style('stroke-width', 1)
            .style("fill", "#5e5e5e")
            .style("stroke", "white");


        var route = g.selectAll(".route").data(lines);

        for(var i = 0; i < lines.length; i++){
            //console.log(lines[i])
            route.datum({type: "LineString",  coordinates: [lines[i].coordinates[0], lines[i].coordinates[1]] }) // coordinates for origin and destination
                    .enter().append("path")
                    .style("stroke-width", 2)
                    .style("stroke", "#033028")
                    .style("fill", "none")
                    .attr("d", path)
                    .classed("Route", true)
                    .on("mouseover", function(d) { 
                        d3.select(this)
                        .style("stroke", "#75F5C6")
                        .transition()
                        .duration(500);

                    div.transition()        
                        .duration(500)      
                        .style("opacity", .9);  

                    div.html("Origin: " + d.airport + "<br>" + " Destination: " + d.dest) 
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");     
                    })                  
                    .on("mouseout", function(d) {   
                        d3.select(this).style("stroke", "#033028").transition().duration(500);  
                        div.transition()        
                            .duration(800)      
                            .style("opacity", 0);            
                    }); 
            } 
// want to apply the size of the points in the map to be according to value in nrFlight
       
        //draw point with airports 
        var point = g.selectAll(".point")
            .data(geoTrav.features)
            .enter().append("path")
            .style("fill", "#84AC20")
            .attr("d", path)
            .classed("Point", true)
            .on("mouseover", function(d) { 
                this.dot = d3.select(this).style("fill", "#033028").transition().duration(500);
                div.transition()        
                    .duration(500)      
                    .style("opacity", .9);      
                div.html("Airport: " + d.geometry.name)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
            })                  
            .on("mouseout", function(d) {   
            this.dot = d3.select(this).style("fill", "#84AC20").transition().duration(500);    
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            })
            .on("click", function(d){
                info.transition()        
                    .duration(800)      
                    .style("opacity", 0); 
                menu1.menu(d);
            }); 




    };

    function calcPercent(nrFlights, nrDelay){

        if(nrFlights == 0)
            console.log("nothing")
        else{
            if(nrDelay == 0){
                return 0;
            }
            else return 100*nrDelay/nrFlights;
        }
    }

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
