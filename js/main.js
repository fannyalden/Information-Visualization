var menu1;
var map1;

d3.csv("data/airports.csv", function (data1) {

	d3.csv("data/marchen.csv", function (data2) {

		document.getElementById("checkbox").checked = false;	//uncehck chekbox every update
	    map1 = new map(data1, data2);
	    menu1 = new menu();

	});
});

