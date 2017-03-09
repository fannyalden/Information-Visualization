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



    //creates an array with number of flights
    var air = createAir(data2);                 //SEND THIS TO menu.js!!!!!!!!!!!

    //Formats the data in a feature collection trougth geoFormat()
    var geoData = {type: "FeatureCollection", features: geoFormat(data1)};
    //geoTrav baseras på march_2016 (dvs turer) och innehåller arrayer med namn och coordinater för origin och destination
    var geoTrav = {type: "TravelCollection", features: geoTravel(data2, data1, air)};    //har nu alltså ett object med namn och long/lat baserat på om det är origin eller dest

    //create lines
    var lines = geoLine(geoTrav);



   // var percent = calcPercent(geoTrav);


    //Loads geo data
    d3.json("data/world-topo.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;

        draw(countries,lines, air);
    });



//skapar en array med antal flyg och antal försenade flyg per flygplats
    function createAir(data){

        var array = [[], [], [], [], [], [], [], [], [], []]; // airpirt, total flights, total delayed flights, delayed flights monday etc.
        var counter = 0;
        var late = 0;
        //var monday = 0, tuesday = 0, wednesday = 0, thursday = 0, friday = 0, saturday = 0, sunday = 0;
              
        for(var i = 1; i < data.length; i++){
            var totFlights = 1;
            var late = 0;
            var monday = 0, tuesday = 0, wednesday = 0, thursday = 0, friday = 0, saturday = 0, sunday = 0;
            

            if(i != data.length){ //check if at the last item of the array
                while((data[i-1].ORIGIN == data[i].ORIGIN) && (i != data.length)){ //check if same airport
                    totFlights++; 
                                   
                    if(data[i-1].DEP_DELAY > 0){

                        switch(parseInt(data[i-1].DAY_OF_WEEK)){
                            case 1: {late++; monday++; break; }
                            case 2: {late++; tuesday++; break; }
                            case 3: {late++; wednesday++; break; }
                            case 4: {late++; thursday++; break; }
                            case 5: {late++; friday++; break; }
                            case 6: {late++; saturday++; break; }
                            case 7: {late++; sunday++; break; }      
                            }
                        }
                    i++; 
                }
                //gör detta om det bara finns ett flyyg
                if( data[i-1].ORIGIN != data[i].ORIGIN){
                    
                    if(data[i-1].DEP_DELAY > 0){

                        switch(parseInt(data[i-1].DAY_OF_WEEK)){
                            case 1: {late++; monday++; break; }
                            case 2: {late++; tuesday++; break; }
                            case 3: {late++; wednesday++; break; }
                            case 4: {late++; thursday++; break; }
                            case 5: {late++; friday++; break; }
                            case 6: {late++; saturday++; break; }
                            case 7: {late++; sunday++; break; }      
                        }
                    }
                } 
            }
           
            else{ //check if the item is the last DOESN'T WORK RIGHT NOW :(     
                if(data[i-1].DEP_DELAY > 0){

                    switch(parseInt(data[i].DAY_OF_WEEK)){
                        case 1: {late++; monday++; break; }
                        case 2: {late++; tuesday++; break; }
                        case 3: {late++; wednesday++; break; }
                        case 4: {late++; thursday++; break; }
                        case 5: {late++; friday++; break; }
                        case 6: {late++; saturday++; break; }
                        case 7: {late++; sunday++; break; }      
                    }
                }
            }
            array[0][counter] = data[i-1].ORIGIN;
            array[1][counter] = totFlights;
            array[2][counter] = late;
            array[3][counter] = monday;
            array[4][counter] = tuesday;
            array[5][counter] = wednesday;
            array[6][counter] = thursday;
            array[7][counter] = friday;
            array[8][counter] = saturday;
            array[9][counter] = sunday;
            counter++; 
        }
        console.log(array)
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
                properties: d,      //behöver vi verkligen ha allt?? extra beräkningstung?

            });

        });
        return data;
    }

function geoTravel(array, geoData, air) {
        var data = [];

            for(var i = 0; i< air[0].length; i++){
                
                for(var j = 0; j < geoData.length; j++){
                    if(air[0][i] == geoData[j].iata){
                        
                        for(var k = 0; k < geoData.length; k++){
                            if( geoData[k].iata == array[i].DEST){
                                var percent = calcPercent(air[1][i], air[2][i]);
                                var day = dayOfWeek(parseInt(array[i].DAY_OF_WEEK));
                                
                                data.push({
                                    type: 'Feature',
                                    //if iata = origin
                                    geometry: {
                                        type: 'Point',
                                        name: geoData[j].airport, 
                                        coordinates: [geoData[j].long, geoData[j].lat]},
                                    percent: percent,
                                    weekday: day,
                                    flightCount: air[1][i],
                                    // delayCount: air[2][i],
                                    //if iata = dest
                                    dest: {name: geoData[k].airport, coordinates: [geoData[k].long, geoData[k].lat]},
                                    //properties: d,
                                });
                            }
                        }
                    }
                }
            }
        return data;
}

    //creates lines 
    function geoLine(data){
        var lines = [];
            for( var i = 0; i < _.size(data.features); i++){
            
                lines.push({
                    type: 'LineString',
                    //airport: data.features[i].origin.name, //testing for drawing only airports with flights
                    coordinates:[ 
                                [data.features[i].geometry.coordinates[0], data.features[i].geometry.coordinates[1]], //lat, long
                                [data.features[i].dest.coordinates[0], data.features[i].dest.coordinates[1]]    //WRONG
                        ]
                });
            }
        
        return lines;
    }

    //Draws the map and the points
    function draw(countries, lines, air)
    {

        //if only draw delayed flights
        if(document.getElementById("checkbox").checked == true){
            //draw only flights with delay
        }

        //draw map
        var country = g.selectAll(".country")
            .data(countries)
            .enter().insert("path")
            .attr("class", "country")
            .attr("d", path)
            .style('stroke-width', 1)
            .style("fill", "lightgray")
            .style("stroke", "white");

       
        //draw point with airports 
        var point = g.selectAll(".point")
            .data(geoTrav.features)
            .enter().append("path")
            .style("fill", "orange")
            .attr("d", path)
            .classed("Point", true)
            .on("mouseover", function(d) { 
                this.dot = d3.select(this).style("fill", "black").transition().duration(500);
                div.transition()        
                    .duration(500)      
                    .style("opacity", .9);      
                div.html("Airport: " + d.geometry.name)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
            })                  
            .on("mouseout", function(d) {   
            this.dot = d3.select(this).style("fill", "orange").transition().duration(500);    
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            })
            .on("click", function(d){
                //call calcPercent(d);
              //  var percent = calcPercent(d);
                menu1.test(geoTrav);//, percent);
            }); 
  
        var route = g.selectAll(".route").data(lines);

        for(var i = 0; i < lines.length; i++){
            //console.log(lines[i])
            route.datum({type: "LineString",  coordinates: [lines[i].coordinates[0], lines[i].coordinates[1]] }) // coordinates for origin and destination
                    .enter().append("path")
                    .style("stroke-width", 2)
                    .style("stroke", "black")
                    .style("fill", "none")
                    .attr("d", path)
                    .classed("Route", true)
                    .on("mouseover", function(d) { 
                        d3.select(this)
                        .style("stroke", "red")
                        .transition()
                        .duration(500);      
                    })                  
                    .on("mouseout", function(d) {   
                        d3.select(this).style("stroke", "black").transition().duration(500);           
                    }); 
            }     
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

    //when drawing axis of barchart, call this function by dayOfWeek(geoDel.features.day);
    function dayOfWeek(data){
        var day;

            switch(data){
                case 1: day = "Monday"; break;
                case 2: day = "Tuesday"; break;
                case 3: day = "Wednesday"; break;
                case 4: day = "Thursday"; break;
                case 5: day = "Friday"; break;
                case 6: day = "Saturday"; break;
                case 7: day = "Sunday"; break;
            }
        return day;     //returnera en array, alternativt filtrera här inne
    }


}
