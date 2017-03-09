var menu1;
var map1;

d3.csv("data/airports.csv", function (data1) {

	d3.csv("data/fannysmarchen.csv", function (data2) {

		var sortData2 = _.sortBy(data2, 'ORIGIN');
		document.getElementById("checkbox").checked = false;	//uncehck chekbox every update


	    map1 = new map(data1, sortData2);
	    menu1 = new menu();

	});
});


// d3.csv("data/datan.csv", function (data){
	
// 	//data.sort(dynamicSort(data.airport));


// 	var sorted = _.sortBy(data, 'airport');

// 	console.log(sorted);
// })
