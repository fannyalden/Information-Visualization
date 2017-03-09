//this is the menu containing the bar chart and some sliders, checkboxes

function menu() {
	

	
	

	//Width and height
	var w = 300;
	var h = 400;
	var barPadding = 30;

	//Create SVG element
	var svg = d3.select("#barchart")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	d3.csv("data/marchen.csv", function(error, data) {

		var geoDel = {type: "FeatureCollection", features: geoFormat(data)};


		//get air from map.js here!!!!!!!!!
		draw(geoDel);						//spara över till ett object

	});


//when drawing axis of barchart, call this function by dayOfWeek(geoDel.features.day);
	function dayOfWeek(data){
		var day;

		//for(var i = 0; i < _.size(data.features); i++){
			//dayValue = parseInt(data.features[i].day);
			switch(data){

				case 1: day = "Monday"; break;
				case 2: day = "Tuesday"; break;
				case 3: day = "Wednesday"; break;
				case 4: day = "Thursday"; break;
				case 5: day = "Friday"; break;
				case 6: day = "Saturday"; break;
				case 7: day = "Sunday"; break;
			}
		//}
		
		return day;		//returnera en array, alternativt filtrera här inne
	}

	function geoFormat(array) {
	    var data = [];
	    var dayen;
		

	    array.map(function (d, i) {
	    	dayen = dayOfWeek(parseInt(d.DAY_OF_WEEK));	//array med alla veckodagar som datan i march_2016 har

	        data.push({
	                type: 'Feature',
	                day: dayen,		//string with name of day
	                delay: d.DEP_DELAY,
	                properties: d,      //behöver vi verkligen ha allt?? extra beräkningstung?

	        });

	    });


	    return data;
    }

	function draw(data){


		
		var x_domain = d3.extent(data, function(d,i) { return d.features[i].geometry.name; });
           // y_domain = d3.extent(data, function(d,i) { return 2; });

        //console.log(x_domain)

		var yScale = d3.scale.linear()
	        .domain(["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"])   // make axis end in round number
			.range([h - barPadding, barPadding]); 

		var xScale = d3.scale.ordinal()
	        .domain(data.map(function(d){return d.features.geometry.name}))    // values between for month of january
		    .range([barPadding, w - barPadding]);   // map these sides of the chart, in this case 100 and 600
		    
	

		var xAxis = d3.svg.axis()
		    .scale(xScale)
		    .orient("bottom")
		    .tickSize(1);
		   // .tickFormat(d3.time.format("%Y-%m"));

		var yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")
		    .tickSize(1);
		    //.ticks(10);


        // draw y axis with labels and move in from the size by the amount of padding
        svg.append("g")
        	.attr("class", "axis")
            .attr("transform", "translate("+barPadding+",0)")
            .call(yAxis);

        // draw x axis with labels and move to the bottom of the chart area
        svg.append("g")
            .attr("class", "xaxis axis")  // two classes, one for css formatting, one for selection below
            .attr("transform", "translate(0," + (h - barPadding) + ")")
            .call(xAxis);


        svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
          .attr("transform", function(d) {
             return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
         });
    
        // now add titles to the axes
        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (barPadding/2) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Delay");

        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h-(barPadding/3))+")")  // centre below axis
            .text("Day of Week");

	}
		


	this.test = function(geoTrav){

			
	var x = d3.scale.ordinal().rangeRound([0, w]).barPadding(0.1),
	    y = d3.scaleLinear().rangeRound([h, 0]);

		//kalla på draw(geoTrav)
		drawBars(geoTrav);




		// var ja = document.getElementById("barchart");

		// var content = document.createTextNode("Hej här kan man skriva saker");
		// ja.appendChild(content);

		// console.log("testing")
	}	

	function drawBars(geoTrav){

		//rita ut bars
        svg.selectAll(".bar")
		    .data(geoTrav.features)
		    .enter().append("rect")
		    .attr("class", "bar")
		    .attr("x", function(d) { return x(d.geometry.name); })
		    .attr("y", function(d) { return y(d.percent); })
		    .attr("width", x.bandwidth())
		    .attr("height", function(d) { return h - y(d.percent); });


	}




}