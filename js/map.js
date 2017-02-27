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

    var filterdData = data1;

    //Sets the colormap
    var colors = colorbrewer.Set3[10];

    //Assings the svg canvas to the map div
    var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

    var g = svg.append("g");

    //Sets the map projection
    var projection = d3.geo.mercator()      //bara translate så får man kartan i helbild, men med för stora punkter
   // .translate([width/2, height/2]);
            .scale(1200)
            .translate([2.2*width, 2.2*height]);

    //Creates a new geographic path generator and assing the projection        
    var path = d3.geo.path().projection(projection);

    //Formats the data in a feature collection trougth geoFormat()
    var geoData = {type: "FeatureCollection", features: geoFormat(data1)};
    //geoTrav baseras på march_2016 (dvs turer) och innehåller arrayer med namn och coordinater för origin och destination
    var geoTrav = {type: "TravelCollection", features: geoTravel(data2)};

    console.log("geoDATTTA" + geoData);
    console.log("geoTRAVELSAKEN" + geoTrav);

    //Loads geo data
    d3.json("data/world-topo.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;
        draw(countries);
    });

   
    //console.log(data[1]);

    // //Calls the filtering function 
    // d3.select("#slider").on("input", function () {
    //     filterMag(this.value, data);
    // });

/*************************   HÄR JOBBAR VI MASSOR   ************************/

//hämta iata från (airports)
//läs in origin och dest från march_2016
//jämför origin och dest med iata
//hämta coord för stället




// for( var i = 0; i < data2.length-1; i++){
//     data.push({
//         type: 'Linestring',
//         coordinates: [d[i].long, d.lat],
//                      [d[i+1].long, d.lat]
//     });


// }


    //console.log(data2[1]);
   

    //Lägger in origin och destination i en array-----tror vi
    function geoTravel(array) {
        var data = [];
        array.map(function (d, i) {
            //Complete the code...
            data.push({
                type: 'Travel',
                origin: {name: d.ORIGIN, lon: [], lat: []},
                dest: {name: d.DEST, lon: [], lat: []}
                //names: [d.origin, d.dest]

            });

        });
//SUCCEED HIT



//DET HÄR BORDE FUNKA. VI KOMMER ÅT GEODATA I FOREACHEN NEDAN. MEN FUNKAR INTE ALLTID ATT SKRIVA I KONSOLEN PÅ FIREFOX, MAN HITTAR OM MAN LETAR I AVLUSAREN.
    //loopa genom geoTrav
    data.forEach(function (d){
        //console.log(" geodata" + geoData);
        for( var i = 0; i < geoData.length; i++){
            if(d.features.origin.name == geoData.properties.iata[i]){
                //get coordinates
                d.features.origin.lon.push(111); //geoData.features[1].geometry.coordinates[0]
                d.features.origin.lat.push(geoData.features[1].geometry.coordinates[1]);
            }
            else if(d.dest.name == geoData.properties.iata[i]){
                //get coordinates
                d.features.dest.lon.push(geoData.features[1].geometry.coordinates[0]);
                d.features.dest.lat.push(geoData.features[1].geometry.coordinates[1]);
            }
    
        }
         
    });


        return data;
    }

/*************************   HÄR JOBBAR VI MASSOR OVANFÖR   ************************/
     


    //Formats the data in a feature collection
    function geoFormat(array) {
        var data = [];
        array.map(function (d, i) {
            //Complete the code...
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

       // console.log(geoData.features("Point", [1]));

        //draw point with airports 
        var point = g.selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr("d", path)
            .classed("Point", true); 

        // var route = g.selectAll("path")
        //     .data(geoTrav.features)
        //     .attr("class", "route")
        //     .attr("d", path);



        
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
