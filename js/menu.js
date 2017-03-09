//this is the menu containing the bar chart and some sliders, checkboxes

//this is the menu containing the bar chart and some sliders, checkboxes
function menu(){

	this.menu = function(geoTrav) {
		
		

		//Width and height
		var w = document.getElementById("menu").offsetWidth; //byt till proent
		var h = document.getElementById("menu").offsetHeight-100;
		var barPadding = 30;
		var padd = 43;

				//Create SVG element
		var svg = d3.select("#barchart")
					.append("svg")
					.attr("width", w)
					.attr("height", h);

		var g = svg.append("g")
			.attr("transform", "translate(" + (barPadding+20) + "," + (barPadding-70) + ")" );

		var div = d3.select("#barchart").append("div")   
	        .attr("class", "tooltip")               
	        .style("opacity", 0);


		var x = d3.scale.ordinal()
				.range([0, padd, padd*2, padd*3, padd*4, padd*5, padd*6]);

		var y = d3.scale.linear()
				.range([(h-barPadding), barPadding]);


		var week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
			x.domain(week);
		  	y.domain([0,100]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .tickSize(1);
			   // .tickFormat(d3.time.format("%Y-%m"));

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .tickSize(1);
			    //.ticks(10);




		d3.csv("data/marchen.csv", function(error, data) {

			var geoDel = {type: "FeatureCollection", features: geoFormat(data)};
			draw(geoDel);

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
		                origin: d.ORIGIN,
		                dest: d.DEST,
		                delay: d.DEP_DELAY,
		                properties: d,      //behöver vi verkligen ha allt?? extra beräkningstung?

		        });

		    });


		    return data;
	    }

		function draw(data){

			console.log(geoTrav.weekday)
			//console.log(data.features[1].origin)

			if(data.features[1].origin == geoTrav.geometry.name){
				console.log("hej")
				var bla = geoTrav.geometry.weekday;
			}


	        // draw y axis with labels and move in from the size by the amount of padding
	        g.append("g")
	        	.attr("class", "axis")
	            .attr("transform", "translate(0," + (barPadding) +")")
	            .call(yAxis);

	        // draw x axis with labels and move to the bottom of the chart area
	        g.append("g")
	            .attr("class", "xaxis axis")  // two classes, one for css formatting, one for selection below
	            .attr("transform", "translate(0," + (h) + ")")
	            .call(xAxis);


	        g.selectAll(".xaxis text")  // select all the text elements for the xaxis
	          .attr("transform", function(d) {
	             return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
	        });
	    
	        // now add titles to the axes
	        g.append("text")
	            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	            .attr("transform", "translate("+ (barPadding/2) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
	            .text("Minutes of delay");

	        // g.append("text")
	        //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	        //     //.attr("transform", "translate("+ (w/2) +","+(h-(barPadding/3))+")")  // centre below axis
	        //     .text("Day of Week");

			// console.log(data.features[2].day)
			// console.log(x(data.features[2].day))
			// console.log(data.features[2].delay)
			// console.log(y(data.features[2].delay))

	        g.selectAll(".bar")
			    .data(data.features)
				.enter().append("rect")
			    .attr("class", "bar")
			    .style("fill", "green")
			    .attr("x", function(d) { return x(d.day); })
			    .attr("y", function(d) { if(d.delay>0){return y(d.delay);} })
			    .attr("width", 20)
			    .attr("height", function(d) { return h - y(d.delay); })
			    .on("mouseover", function(d) { 
	               this.dot = d3.select(this).style("fill", "black").transition().duration(500);
	                div.transition()        
	                    .duration(500)      
	                    .style("opacity", .9);      
	                div.html("Day: " + d.day )  
	                    .style("left", (d3.event.pageX) + "px")     
	                    .style("top", (d3.event.pageY - 28) + "px");    
	            })                  
	            .on("mouseout", function(d) {   
	            this.dot = d3.select(this).style("fill", "green").transition().duration(500);    
	                div.transition()        
	                    .duration(500)      
	                    .style("opacity", 0);   
	            });

		}

				

	}
}

