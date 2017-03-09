//this is the menu containing the bar chart and some sliders, checkboxes

function menu() {
	

	
	

	//Width and height
	var w = 300 ; //byt till proent
	var h = 500;
	var barPadding = 30;

	//Create SVG element
	var svg = d3.select("#barchart")
				.append("svg")
				.attr("width", w)
				.attr("height", h);


	var x = d3.scale.ordinal()
			.range([barPadding, w-barPadding]);

	var y = d3.scale.linear()
			.range([0.8*(h-barPadding), barPadding]);

	var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .tickSize(1);

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

		x.domain([1,7]);
  		y.domain([0,100]);

  		svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(" + barPadding +"," + 0.8*(h-barPadding) + ")")
	      .call(xAxis);
	      
	      svg.append("text")
		      .attr("text-anchor", "middle")
		      .attr("transform", "transform", "translate(" + (barPadding) +"," + 0.8*(h-barPadding)/2 + ")rotate(-90)")
		      .text("day of week");


  		svg.append("g")
	      .attr("class", "y axis")
	      .attr("transform", "translate("+ barPadding +","+ barPadding +")")
	      .call(yAxis);
console.log(x(geoTrav.features.weekday))
		svg.selectAll("#barchart")
	      .data(geoTrav)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) {console.log("HEJ"); return x(d.features.weekday); })
	      .attr("y", function(d) { return y(d.features.flightCount); })
	      .attr("height", function(d) {console.log(d.features.flightCount); return h - y(d.features.flightCount); })
	      .attr("width", 15);

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