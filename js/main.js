var menu1;
var map1;

d3.csv("data/airports.csv", function (data1) {

	d3.csv("data/marchen.csv", function (data2) {

		var sortData2 = _.sortBy(data2, 'ORIGIN');

	    map1 = new map(data1, sortData2);
	    menu1 = new menu(data2);

	});
});
