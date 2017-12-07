//this is the menu containing the bar chart and some sliders, checkboxes

//this is the menu containing the bar chart and some sliders, checkboxes
function menu(){
		


		//Width and height
		var w = document.getElementById("menu").offsetWidth; //byt till proent
		var h = document.getElementById("menu").offsetHeight-100;
		var barPadding = 30;
		var padd = 43;
		var maxDelay = 20;

		//Create SVG element
		var svg = d3.select("#barchart")
					.append("svg")
					.attr("width", w)
					.attr("height", h);


		var g = svg.append("g")		//mooving the whole g
			.attr("transform", "translate(" + (barPadding+20) + "," + (barPadding-70) + ")" );

		var div = d3.select("body").append("div")   
	        .attr("class", "tooltip")               
	        .style("opacity", 0);

		var x = d3.scale.ordinal()
				.range([0, padd, padd*2, padd*3, padd*4, padd*5, padd*6]);	//mooving axis and text

		var y = d3.scale.linear()
				.range([(h-barPadding), barPadding]);




	this.menu = function(geoTrav) {
		svg.selectAll(".bar").remove();
		svg.selectAll(".axis").remove();
		svg.selectAll(".axis text").remove();


		var week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
			x.domain(week);
		  	y.domain([0,maxDelay]);

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
			draw(geoDel, geoTrav);
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
		    var weekday;
			
		    array.map(function (d, i) {
		    	weekday = dayOfWeek(parseInt(d.DAY_OF_WEEK));	//array med alla veckodagar som datan i march_2016 har

		        data.push({
		                type: 'Feature',
		                day: weekday,		//string with name of day
		                origin: d.ORIGIN,
		                dest: d.DEST,
		                delay: d.DEP_DELAY,
		        });
		    });
		
		    return data;
	    }

		function draw(data,data2){



			if(data.features[1].origin == geoTrav.geometry.name){
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
	            .attr("transform", "translate(0," + (h) + ")")	//mooving axis and text
	            .call(xAxis);


	        g.selectAll(".xaxis text")  // select all the text elements for the xaxis
	          .attr("transform", function(d) {
	             return "translate(" + this.getBBox().height*+0.1 + "," + this.getBBox().height + ")rotate(-45)";
	        });
	    

	        // now add titles to the axes
	        g.append("text")
	            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	            .attr("transform", "translate("+ (barPadding/2) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
	            .text("Minutes of delay");



			//svg.selectAll("*").remove();
	            console.log(data2.delay)
	           	var datan = [400, 80, 150, 160, 230, 420];
	           	//console.log(parseInt(data2.delay.weekday));
	            //var datan = parseInt(data2.delay.tuesday.delay);

	            // for( i var i = 0; i < 10; i++){
	            // 	maxDelay = Math.max(data2.delay.weekday[i]);

	            // }
	 	
	 		information();

		        g.selectAll(".bar")
				    .data(data2.delay.weekday)
					.enter().append("rect")
				    .attr("class", "bar")
				    .style("fill", "#033028")
				    .attr("x", function(d) { return x(d); })
				    .attr("y", function(d) { return y(d); })
				    .attr("width", 10)
				    .attr("height", function(d) {  
				    	console.log(d3.sum(data2.delay.weekday));
				    	if( d3.sum(data2.delay.weekday) == 0){
				         	message();

				        } 
				        else return h - y(d); })
				    .on("mouseover", function(d) { 
		                this.dot = d3.select(this).style("fill", "#480f05").transition().duration(500);
		                div.transition()        
		                    .duration(500)      
		                    .style("opacity", .9);      
		                div.html("Delay:" + d + "<br>" + "Origin: " + d.origin)  
		                    .style("left", (d3.event.pageX) + "px")     
	                        .style("top", (d3.event.pageY) + "px");    
		            })                  
		            .on("mouseout", function(d) {   
		            this.dot = d3.select(this).style("fill", "#033028").transition().duration(500);    
		                div.transition()        
		                    .duration(500)      
		                    .style("opacity", 0);   
		            });
	        
		}
	}

	function message(){

		d3.select("body").append("message")
	        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	        .attr("transform", "translate("+ (barPadding*4) +","+(h/2)+")")  // text is drawn off the screen top left, move down and out and rotate
	        .text("No delayed flights!");
	}
	function information(){
		d3.select("body").append("div")
			.attr("class", "div")
			div.html("Delay:"  + "<br>" + "Origin: " )  
		                    ;
	}

}

