$(function () {

    $( "#datepicker_1" ).datepicker({ dateFormat: 'yy-mm-dd' });
    $( "#datepicker_2" ).datepicker({ dateFormat: 'yy-mm-dd' });

    $('.accordion').accordion({defaultOpen: 'section1'});

    $('.vticker').easyTicker({
        visible: 1,
        interval: 7000
    });

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

    $('input[name="radioGroup2"]').click(function(){
        var selected = $("input[name=radioGroup2]:checked").val();
        console.log(selected);
        if (selected != 'pie'){
            $("#prop").hide("slow");
        }
        else {
            $("#prop").show("slow");
        }
    });

  	$('#click').click(function(){
  		var date_in = $('#datepicker_1').datepicker({ dateFormat: 'yy-mm-dd' }).val();
  		var date_out = $('#datepicker_2').datepicker({ dateFormat: 'yy-mm-dd' }).val();
		var entity_val = $("#entity1").val();
		var gender_val = $("#gender :selected").val();
		var country_val = $("#country :selected").val();
        var analysis_val = $("#analysis :selected").val();
        var graph_val = $("#graph :selected").val();

		var date1 = new Date(date_in.toString());
		var date2 = new Date(date_out.toString());

  		console.log(date_in);
  		console.log(date_out);
        console.log(gender_val);
        console.log(country_val);
        console.log(analysis_val);
        console.log(graph_val);

        $(".vticker ul").empty();

        setInterval(function(){
            var str = "http://localhost:8080/ticker";
            var jsonObject = {entity: entity_val.toString()};
            $.get(str,jsonObject).done(function(data) {
                console.log(data);
                if (data != 'empty') {
                    $(".vticker ul").append('<li>it is now ' + data + '</li>');
                }
                else
                    console.log("empty");
            });
        }, 1000);


        if (graph_val == 'timeline') {

            var str = "http://localhost:8080/graph";
            var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};

            if ($("input[name=radioGroup]:checked").val() == 'double') {
                str = "http://localhost:8080/graphcompare";
                var entity_val2 = $("#entity2").val();
                jsonObject = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
            }

            $.get(str, jsonObject).done(function (data) {
                console.log(data);

                console.log($("#country :selected").text());
                console.log($("#gender :selected").text());
                console.log($("#entity1").val());

                var obj = jQuery.parseJSON(data);
                var graph_data = new Array();

                var graph = new Array();

                for (var i = 0; i < obj[0].length; i++) {
                    graph_data[i] = obj[0][i].val / obj[0].length;
                }

                graph[0] = {
                    type: 'area',
                    name: 'Mentions of ' + entity_val,
                    pointInterval: (date2.getTime() - date1.getTime()) / obj[0].length,
                    pointStart: date1.getTime(),
                    data: graph_data
                };

                if ($("input[name=radioGroup]:checked").val() == 'double') {
                    var graph_data_2 = new Array();
                    for (var i = 0; i < obj[1].length; i++) {
                        graph_data_2[i] = obj[1][i].val / obj[1].length;
                    }

                    graph[1] = {
                        type: 'area',
                        name: 'Mentions of ' + entity_val2,
                        pointInterval: (date2.getTime() - date1.getTime()) / obj[1].length,
                        pointStart: date1.getTime(),
                        data: graph_data_2
                    };
                }

                console.log(graph);

                $('#container').highcharts({
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: 'Mention of the Twitter Handle : "' + entity_val + ' " '
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

        }

        if (graph_val == 'map'){

            var set = 0;
            var str = "http://localhost:8080/map";
            var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};

            if ($("input[name=radioGroup]:checked").val() == 'double') {
                set = 1;
                str = "http://localhost:8080/mapcompare";
                var entity_val2 = $("#entity2").val();
                jsonObject = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
            }

            $.get(str, jsonObject).done(function (data) {

                var map_data = jQuery.parseJSON(data);
                var map_data1 = map_data[0];

                console.log(map_data1);
                var gdpData = {
                    "AF": 16.63,
                    "AL": 11.58,
                    "DZ": 158.97
                };
                $("#container").empty();
                $('#container').vectorMap({
                    map: 'world_mill_en',
                    series: {
                        regions: [{
                            values: map_data1,
                            scale: ['#C8EEFF', '#0071A4'],
                            normalizeFunction: 'polynomial'
                        }]
                    },
                    onRegionLabelShow: function (e, el, code) {
                        var str_map = ' (Number of Mentions from ' + code + ' are - ' + map_data1[code];
                        if (set == 1) {
                            var map_data2 = map_data[1];
                            str_map = str_map + ' and Number of Mentions from ' + code + ' are - ' + map_data2[code] + ')';
                        }
                        str_map = str_map + ')';
                        el.html(el.html() + str_map);
                    }
                });
            });
        }

        if (graph_val == 'pie'){


            var pie_val = $("input[name=radioGroup3]:checked").val();
            console.log(pie_val);
            var str = "http://localhost:8080/pie";
            var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),pie:pie_val.toString()};

            if ($("input[name=radioGroup]:checked").val() == 'double') {
                str = "http://localhost:8080/piecompare";
                var entity_val2 = $("#entity2").val();
                jsonObject = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
            }

            $.get(str, jsonObject).done(function (data) {

                var map_data = jQuery.parseJSON(data);
                console.log(map_data);

                $("#container").empty();
                $('#container').highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: 1,//null,
                        plotShadow: false
                    },
                    title: {
                        text: 'Browser market shares at a specific website, 2014'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Value',
                        data: map_data
                    }]
                });
            });
        }
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