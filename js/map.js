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



    //Formats the data in a feature collection trougth geoFormat()
    var geoData = {type: "FeatureCollection", features: geoFormat(data1)};
    //geoTrav baseras på march_2016 (dvs turer) och innehåller arrayer med namn och coordinater för origin och destination
    var geoTrav = {type: "TravelCollection", features: geoTravel(data2, data1)};    //har nu alltså ett object med namn och long/lat baserat på om det är origin eller dest


    var nrFlightOr = nrFlightsOrigin(data2);//nr of flights origin from aiports
 

    //airports includes the name, coords and number of flights departuring for all aiports in the data.
    // var airPorts = geoAirports(data2, nrFlightOr);
    var airPorts = geoAirports(data2, nrFlightOr);//{type:"AirportCollection", features: geoAirports(data2, nrFlightOr)};
 
    //create lines
    var lines = geoLine(geoTrav);

    var info = d3.select("#info").append("div");
   // var percent = calcPercent(geoTrav);


    //Loads geo data
    d3.json("data/world-topo.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;

        draw(countries,lines, airPorts, geoTrav);
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
        .rollup(function(v) { return {
            flights: v.length,
            weekday: {
                monday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 1) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 1) return d.DEP_DELAY })  },
                tuesday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 2) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 2) return d.DEP_DELAY })  },
                wednesday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 3) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 3) return d.DEP_DELAY })  },
                thursday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 4) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 4) return d.DEP_DELAY })  },
                friday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 5) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 5) return d.DEP_DELAY })  },
                saturday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 6) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 6) return d.DEP_DELAY })  },
                sunday: {
                    count: d3.sum(v, function(d) { return (d.DAY_OF_WEEK == 7) }),
                    delay: d3.sum(v, function(d) { if(d.DAY_OF_WEEK == 7) return d.DEP_DELAY })  }
            },
            totDelay: d3.sum(v, function(d) { return d.DEP_DELAY })
            }
        })
        .entries(data);
        console.log(flightCount);
        console.log(flightCount[0].values.weekday.friday.delay);
   // console.log(JSON.stringify(flightCount));

    //geoTrav.features.forEach(function(p){
    data.forEach(function(d){
        for(var k = 0; k < flightCount.length; k++){
            if(flightCount[k].key == d.ORIGIN){
                array.push({
                    type: "Features",
                    geometry:{
                        type:"Point",
                        name: d.ORIGIN,
                        coords: [d.LAT, d.LONG]
                    },
                    nrflight: flightCount[k].values.flights
                })
            }
        }
    })
    return array;
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
            //properties: d,      //behöver vi verkligen ha allt?? extra beräkningstung?
        });
    });
    return data;
}

function geoTravel(array, geoData) {
    var data = [];
    var q = 0;

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
    return data;
}

    //creates lines 
    function geoLine(data){
        var lines = [];
        var hej = [2, 3, 4, 5, 6, 7, 8, 9];//ska egentligen vara data från hur många flighter som går mellan varje flygplats
        console.log(data)
            for( var i = 0; i < _.size(data.features); i++){
            
                lines.push({
                    type: 'LineString',
                    airportOrigin: data.features[i].origin.name, //testing for drawing only airports with flights
                    dest: data.features[i].dest.name,
                    coordinates:[ 
                                [data.features[i].origin.coordinates[0], data.features[i].origin.coordinates[1]], //lat, long
                                [data.features[i].dest.coordinates[0], data.features[i].dest.coordinates[1]]    //WRONG
                        ],
                    nrLines: hej[i]
                });
            }
        
        return lines;
    }
    //funktion för att räkna ut hur många connectande flyg varje flygplats har med varandra. 
    //behöver få strukturen på datan att se ut som följande: A=[origin,dest], B=[origin,dest]
    function connected(origin1, origin2, dest1, dest2){
        var count = 0;
        if(origin1 == dest2 && origin2 == dest1)
            count++;

        return count;
    }
    //Draws the map and the points
    function draw(countries, lines, airports)
    {

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

            route.datum({type: "LineString",  coordinates: [lines[i].coordinates[0], lines[i].coordinates[1]] }) // coordinates for origin and destination
                .enter().append("path")
                .style("stroke-width", function (d){ return d.nrLines;})
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
                    div.html("Origin: " + d.airportOrigin + "<br>" + " Destination: " + d.dest) 
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


          g.selectAll("circle")
            .data(airports).enter()
            .append("circle")
            .attr("cx", function (d,i) { 
                var jaaa = [d.geometry.coords[0], d.geometry.coords[1]]
                return parseFloat(projection(jaaa)[0]); 
            })
            .attr("cy",  function (d,i) { 
                var jaaa = [d.geometry.coords[0], d.geometry.coords[1]]
                return parseFloat(projection(jaaa)[1]); 
            })
            .attr("r", function (d) { return(1.5*(d.nrflight+5)/2);})
            .attr("fill", "orange")
            .on("mouseover", function(d) { 
                d3.select(this)
                    .style("stroke", "#75F5C6")
                    .transition()
                    .duration(500);
                div.transition()        
                        .duration(500)      
                        .style("opacity", .9);  
                div.html("Origin: "  + d.geometry.name+ "<br>" + " Nr of flights origin from here: "+ d.nrflight) 
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");     
            })  
            .on("mouseout", function(d) {   
                d3.select(this)
                    .style("stroke", "orange")
                    .transition()
                    .duration(500);  
                div.transition()        
                    .duration(800)      
                    .style("opacity", 0);            
            }) 
            .on("click", function(d) {   
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

