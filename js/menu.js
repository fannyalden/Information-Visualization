//this is the menu containing the bar chart and some sliders, checkboxes

function menu() {
	

	
	

	//Width and height

	var w = document.getElementById("menu").offsetWidth - 50; //byt till proent
	var h = document.getElementById("menu").offsetHeight - 100;

	var barPadding = 30;
	var padd = 43;

	//Create SVG element
	var svg = d3.select("#barchart")
				.append("svg")
				.attr("width", w+20)
				.attr("height", h);


	var x = d3.scale.ordinal()
			.range([4, padd, padd*2, padd*3, padd*4, padd*5, padd*6]);

	var y = d3.scale.linear()
			.range([0.8*(h-barPadding), barPadding]);


	var week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	x.domain(week);
  	y.domain([0,100]);

	var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .tickSize(1);

		    //.tickValues(week);

	var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .tickSize(1);


	this.test = function(geoTrav){
		
		//kalla på draw(geoTrav)
		drawBars(geoTrav);

		// var ja = document.getElementById("barchart");

		// var content = document.createTextNode("Hej här kan man skriva saker");
		// ja.appendChild(content);

		// console.log("testing")
	}

	function drawBars(geoTrav){

	

  		svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(" + barPadding +"," + 0.8*(h) + ")")
	      .call(xAxis)
	      .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });
	      
	      // svg.append("text")
		     //  .attr("text-anchor", "middle")
		     //  .attr("transform", "transform", "translate(" + (barPadding) +"," + 0.8*(h-barPadding)/2 + ")rotate(-90)")
		     //  .text("day of week");


  		svg.append("g")
	      .attr("class", "y axis")
	      .attr("transform", "translate("+ barPadding +","+ barPadding +")")
	      .call(yAxis);




		console.log(geoTrav.weekday)
		console.log(x(geoTrav.weekday))	//denna är alltid noll
		console.log(geoTrav.flightCount)
		console.log(y(geoTrav.flightCount))

		var bar = svg.selectAll(".bar")
	      	.data(geoTrav)
	    	.enter().append("g");

	    bar.append("rect")  
	      .attr("y", function(d) { return y(d.flightCount); })
	      .attr("height", function(d) { return h - y(d.flightCount); })
	      .attr("width", 25);

	      	      bar.append("text")
	      	  .attr("x", 6 / 2)
		      .attr("y", function(d) { return y(d.value) + 3; })
		      .attr("dy", ".75em")
		      .text(function(d) { return d.value; });

	/*	//rita ut bars
        svg.selectAll(".bar")
		    .data(geoTrav.features)
		    .enter().append("rect")
		    .attr("class", "bar")
		    .attr("x", function(d) { return x(d.geometry.name); })
		    .attr("y", function(d) { return y(d.percent); })
		    .attr("width", 20)
		    .attr("height", function(d) { return h - y(d.percent); });
*/

	}




}