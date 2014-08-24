$(function () {

    $( "#datepicker_1" ).datepicker({ dateFormat: 'yy-mm-dd' });
    $( "#datepicker_2" ).datepicker({ dateFormat: 'yy-mm-dd' });
	$('select').selectToAutocomplete();

    $('input[name="radioGroup"]').click(function(){
        var selected = $("input[name=radioGroup]:checked").val();
        console.log(selected);
        if (selected == 'single'){
            $("#entity2").hide("slow");
        }
        else {
            $("#entity2").show("slow");
        }
    });

  	$('#click').click(function(){
  		var date_in = $('#datepicker_1').datepicker({ dateFormat: 'yy-mm-dd' }).val();
  		var date_out = $('#datepicker_2').datepicker({ dateFormat: 'yy-mm-dd' }).val();
		var entity_val = $("#entity1").val();
		var gender_val = $("#gender :selected").text();
		var country_val = $("#country :selected").text();

		var date1 = new Date(date_in.toString());
		var date2 = new Date(date_out.toString());

  		console.log(date_in);
  		console.log(date_out);

        var str = "http://localhost:8080/graph";
        var jsonObject = {entity:entity_val.toString(),start:date_in.toString(),end:date_out.toString(),gender:gender_val.toString(),geo:country_val.toString()};

        if ($("input[name=radioGroup]:checked").val() == 'double'){
            str = "http://localhost:8080/graphcompare";
            var entity_val2 = $("#entity2").val();
            jsonObject = {entity:entity_val.toString(),entity2:entity_val2.toString(),start:date_in.toString(),end:date_out.toString(),gender:gender_val.toString(),geo:country_val.toString()};
        }

	    $.get( str ,jsonObject).done( function( data ) {
	  		console.log(data);

			console.log($("#country :selected").text());
			console.log($("#gender :selected").text());
			console.log($("#entity1").val());

	  		var obj = jQuery.parseJSON(data);
	  		var graph_data = new Array();

            var graph = new Array();

	  		for (var i=0;i< obj[0].length ;i++){
	  				graph_data[i] = obj[0][i].val/obj[0].length;
	  		}

            graph[0] = {
                type: 'area',
                name: 'Mentions of ' + entity_val,
                pointInterval: (date2.getTime() - date1.getTime())/obj.length,
                pointStart: date1.getTime(),
                data : graph_data
            };

            if ($("input[name=radioGroup]:checked").val() == 'double'){
                var graph_data_2 = new Array();
                for (var i=0;i< obj[1].length ;i++){
                    graph_data_2[i] = obj[1][i].val/obj[1].length;
                }

                graph[1] = {
                    type: 'area',
                    name: 'Mentions of ' + entity_val2,
                    pointInterval: (date2.getTime() - date1.getTime())/obj.length,
                    pointStart: date1.getTime(),
                    data : graph_data_2
                };
            }

	  		console.log(graph);

	  		$('#container').highcharts({
	        chart: {
	            zoomType: 'x'
	        },
	        title: {
	            text: 'Mention of the Twitter Handle : "' + entity_val +' " '
	        },
	        subtitle: {
	            text: document.ontouchstart === undefined ?
	                'Click and drag in the plot area to zoom in' :
	                'Pinch the chart to zoom in'
	        },
	        xAxis: {
	            type: 'datetime',
	            minRange: 14  // fourteen days
	        },
	        yAxis: {
	            title: {
	                text: 'Mentions '
	            }
	        },
	        legend: {
	            enabled: false
	        },
	        plotOptions: {
	            area: {
	                fillColor: {
	                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
	                    stops: [
	                        [0, Highcharts.getOptions().colors[0]],
	                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
	                    ]
	                },
	                marker: {
	                    radius: 2
	                },
	                lineWidth: 1,
	                states: {
	                    hover: {
	                        lineWidth: 1
	                    }
	                },
	                threshold: null
	            }
	        },

	        series: graph
	    });
		});


	});
	
	$('#map').click(function(){
			var map = new Datamap({
					element: document.getElementById('container12'),
					fills: {
						HIGH: '#afafaf',
						LOW: '#123456',
						MEDIUM: 'blue',
						UNKNOWN: 'rgb(0,0,0)',
						defaultFill: 'green'
					},
					data: {
						IRL: {
							fillKey: 'LOW',
							numberOfThings: 2002
						},
						USA: {
							fillKey: 'MEDIUM',
							numberOfThings: 10381
						}
					},
					geographyConfig: {
						popupTemplate: function(geo, data) {
							return ['<div class="hoverinfo"><strong>',
									'Number of things in ' + geo.properties.name,
									': ' + data.numberOfThings,
									'</strong></div>'].join('');
						}
					},
					done: function(datamap) {
						datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
							alert(geography.properties.name);
						});
					}
			});
	});
	
/* 	var country = new Array("USA","RUS","CAN","BRA","ARG","COL","AUS","ZAF","MAD");
	var usa = "USA";
	var jsonob = {};
	
	jsonob[country[0]] = {"fillKey": 'lt50' };
	jsonob[country[1]] = {"fillKey": 'lt50' };
	jsonob[country[2]] = {"fillKey": 'lt50' };
	jsonob[country[3]] = {"fillKey": 'lt50' };
	jsonob[country[4]] = {"fillKey": 'lt50' };
	jsonob[country[5]] = {"fillKey": 'lt50' };
	jsonob[country[6]] = {"fillKey": 'lt50' };
	jsonob[country[7]] = {"fillKey": 'lt50' };
	jsonob[country[8]] = {"fillKey": 'lt50' };
	
	$('#map').click(function(){
		var map = new Datamap({
        scope: 'world',
        element: document.getElementById('container12'),
        projection: 'mercator',
        
        fills: {
          defaultFill: '#f0af0a',
          lt50: 'rgba(0,244,244,0.9)',
          gt50: 'red',
		  lt10: 'rgba(210,24,244,0.9)'
        },
        
        data: jsonob,
      });
	}); */
    
});