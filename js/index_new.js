//var serverAddress = "http://172.16.137.125:8080/";
var serverAddress = "http://localhost:8080/";
var date_in;
var date_out;
var entity_val;
var gender_val;
var country_val;
var analysis_val;

$(function () {

    $('#date_picker_start').datepicker({format: 'yyyy-mm-dd'});
    $('#date_picker_end').datepicker({format: 'yyyy-mm-dd'});
});

$(document.body).on('click', '.dropdown-menu li', function (event) {
    var $target = $(event.currentTarget);
    $target.closest('.btn-group')
        .find('[data-bind="label"]').text($target.text())
        .end()
        .children('.dropdown-toggle').dropdown('toggle');
    return false;
});

function inactiveGraphButtons() {
    var group = document.getElementById("#graph_buttons")
    $('button', group).each(function () {
        var button = $(this);
        button.removeClass('active')
    });
}

function getGenderVal(gender_val){
    if (gender_val == 'Male')
        return "male";
    else if(gender_val == 'Female')
        return "female";
    else
        return "all";
}

function getAnalysisVal(analysis_val){
    if (analysis_val == 'Mentions')
        return "mention";
    else if(analysis_val == 'Positive Sentiments')
        return "positive";
    else if(analysis_val == 'Negative Sentiments')
        return "negative";
    else
        return "popularity";
}

function getCountryVal(country_val){
    if (country_val == 'World')
        return "world";
    else if(country_val == 'India')
        return "IN";
    else if(country_val == 'USA')
        return "US";
    else
        return "DE";
}

$(document).ready(function () {
    $('#button_go').click(function () {
        date_in = $('#date_picker_start').datepicker({ dateFormat: 'yy-mm-dd' }).val();
        date_out = $('#date_picker_end').datepicker({ dateFormat: 'yy-mm-dd' }).val();
        entity_val = $("#entity_first").val();
        gender_val = $("#gender").text();
        country_val = $("#country").text();
        analysis_val = $("#analysis").text();
        var group = document.getElementById("#graph_buttons");

        analysis_val = getAnalysisVal(analysis_val);
        country_val = getCountryVal(country_val);
        gender_val = getGenderVal(gender_val);

        drawSidebar();

        $('button', group).each(function () {
            var button = $(this);
            if (button.hasClass('active')) {
                button.click();
            }
        });
    });

    $('#timeline_button').click(function () {
        console.log("timeline button");
        inactiveGraphButtons();
        $(this).addClass('active');
        drawTimeline();
    });

    $('#map_button').click(function () {
        console.log("map button");
        inactiveGraphButtons();
        $(this).addClass('active');
        drawMap();
    });

    $('#pie_button').click(function () {
        console.log("pie button");
        inactiveGraphButtons();
        $(this).addClass('active');
        drawPieChart();
    });
});

function drawSidebar() {
    var date1 = new Date(date_in.toString());
    var date2 = new Date(date_out.toString());
    var requestURL = serverAddress + "sidebar";
    var jsonParams = {entity: entity_val.toString()};
    console.log(jsonParams);
    $.get(requestURL, jsonParams).done(function (data) {
        var obj = jQuery.parseJSON(data);

        var entity_information = obj[0];
        var keywords = obj[1];
        var hashtags = obj[2];
        var trends = obj[3];

        console.log(entity_information);
        console.log(keywords);
        console.log(hashtags);
        console.log(trends);

        var entity = entity_val.toString();
        var followers = entity_information[0].followers;
        var img = entity_information[0].image;
        var rank = entity_information[0].rank;

        $("#item").html(entity);
        $("#rank").html("&nbsp;<i class='glyphicon glyphicon-tower'></i>&nbsp;"+rank);
        $("#follow").html("<i class='glyphicon glyphicon-eye-open'></i>&nbsp;"+followers);
        $("#img").html("<img src='"+img+"' class='img-responsive'>");

        for (var i = 0; i < keywords.length; i++) {
            $("#keyword").append("<li>"+keywords[i].key+"</li>");
        }
        for (var i = 0; i < hashtags.length; i++) {
            $("#hashtag").append("<li>"+hashtags[i].key+"</li>");
        }
        for (var i = 0; i < trends.length; i++) {
            $("#trend").append("<li>"+trends[i].key+"</li>");
        }
    });
}

function drawTimeline() {
    var date1 = new Date(date_in.toString());
    var date2 = new Date(date_out.toString());
    var requestURL = serverAddress + "graph";
    var jsonParams = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};

    if ($("input[name=radioGroup]:checked").val() == 'double') {
        requestURL = serverAddress + "graphcompare";
        var entity_val2 = $("#entity_second").val();
        jsonParams = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
    }
    console.log(jsonParams);
    $.get(requestURL, jsonParams).done(function (data) {
        console.log(data);
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

        $('#graph_container').highcharts({
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

function drawMap() {
    var set = 0;
    var str = serverAddress + "map";
    var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};

    if ($("input[name=radioGroup]:checked").val() == 'double') {
        set = 1;
        str = serverAddress + "mapcompare";
        var entity_val2 = $("#entity_second").val();
        jsonObject = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
    }

    $.get(str, jsonObject).done(function (data) {

        var map_data = jQuery.parseJSON(data);
        var map_data1 = map_data[0];
        console.log(map_data1);
        $("#graph_container").empty();
        $('#graph_container').vectorMap({
            map: 'world_mill_en',
            series: {
                regions: [
                    {
                        values: map_data1,
                        scale: ['#C8EEFF', '#0071A4'],
                        normalizeFunction: 'polynomial'
                    }
                ]
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

function drawPieChart() {
    var pie_val = $("input[name=radioGroup3]:checked").val();
    console.log(pie_val);
    pie_val = "0";
    var str = serverAddress + "pie";
    var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(), pie: pie_val.toString()};

    if ($("input[name=radioGroup]:checked").val() == 'double') {
        str = serverAddress + "piecompare";
        var entity_val2 = $("#entity_second").val();
        jsonObject = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
    }

    $.get(str, jsonObject).done(function (data) {

        var map_data = jQuery.parseJSON(data);
        console.log(map_data);

        $("#graph_container").empty();
        $('#graph_container').highcharts({
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
            series: [
                {
                    type: 'pie',
                    name: 'Value',
                    data: map_data
                }
            ]
        });
    });
}