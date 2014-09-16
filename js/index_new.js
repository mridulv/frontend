//var serverAddress = "http://172.16.137.125:8080/";
//var serverAddress = "http://localhost:8080/";
var serverAddress = "http://172.16.137.125:8080/";
//v      ar serverAddress = "http://192.168.1.5:8080/";
var date_in;
var date_out;
var entity_val;
var gender_val;
var country_val;
var analysis_val;
var compare_tags;
var comparison_val;
var isCompare;
var pie_store;

$(function () {

    $('#date_picker_start').datepicker({format: 'yyyy-mm-dd'});
    $('#date_picker_end').datepicker({format: 'yyyy-mm-dd'});
    $(".tm-input").tagsManager();
    var config = {
        '.chosen-select'           : {},
        '.chosen-select-deselect'  : {allow_single_deselect:true},
        '.chosen-select-no-single' : {disable_search_threshold:10},
        '.chosen-select-no-results': {no_results_text:'Oops, nothing found!'},
        '.chosen-select-width'     : {width:"95%"}
    }
    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }
});

$(document.body).on('click', '.dropdown-menu li', function (event) {
    var $target = $(event.currentTarget);
    var label = $target.closest('.btn-group')
        .find('[data-bind="label"]');
    label.text($target.text())
        .end()
        .children('.dropdown-toggle').dropdown('toggle');
    label.trigger('change');
    return false;
});

$(document.body).on('change',"#analysis", function (){
    analysis_val = $("#analysis").text();
    analysis_val = getAnalysisVal(analysis_val);
    var group = $("#graph_buttons");
    $('button', group).each(function () {
        var button = $(this);
        if (button.hasClass('active')) {
            button.click();
        }
    });
})

$(document.body).on('change',"#pie_filter", function (){
    analysis_val = $("#pie_filter").text();
    preComputePie(analysis_val);
})

function inactiveGraphButtons() {
    var group = $("#graph_buttons")
    console.log(group);
    $('button', group).each(function () {
        var button = $(this);
        button.removeClass('active')
    });
}

function inactiveUserButtons() {
    var group = $("#tweet_user")
    console.log(group);
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


function clearProcessing()
{
    $(".processing").addClass("text-center");
    $(".processing").html("<span class='fa fa-spinner fa-spin fa-3x'></span>");
}


$(document).ready(function () {
    $('#button_go').click(function () {
        date_in = $('#date_picker_start').datepicker({ dateFormat: 'yy-mm-dd' }).val();
        drawdate_in = $('#date_picker_start').datepicker({ dateFormat: 'yy-mm-dd' }).val();
        date_out = $('#date_picker_end').datepicker({ dateFormat: 'yy-mm-dd' }).val();
        entity_val = $("#entity_first").val();
        gender_val = $("#gender").text();
        country_val = $("#country").text();
        analysis_val = $("#analysis").text();
        compare_tags = $("#compare_tags").val();
        analysis_val = getAnalysisVal(analysis_val);
        country_val = getCountryVal(country_val);
        gender_val = getGenderVal(gender_val);
        if(compare_tags==""){
            comparison_val = entity_val;
            isCompare = false;
        }
        else {
            comparison_val = entity_val + ',' + compare_tags;
            isCompare = true;
        }
        clearProcessing();
        drawSidebar();
        drawMainbar();
        var group = $("#graph_buttons");
        $('button', group).each(function () {
            var button = $(this);
            if (button.hasClass('active')) {
                button.click();
            }
        });
    });

    $('#button_go2').click(function () {
        entity_val = $("#entity").val();
        var group = $("#tweet_user");

        console.log(entity_val);
        drawSidebar2();

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
        $("#pie_filter_div").hide();
        isCompare ? drawCompareTimeline():drawTimeline();
    });

    $('#map_button').click(function () {
        console.log("map button");
        inactiveGraphButtons();
        $(this).addClass('active');
        $("#pie_filter_div").hide();
        isCompare ? drawCompareMap() : drawMap();
    });

    $('#pie_geo_button').click(function () {
        console.log("pie button");
        inactiveGraphButtons();
        $(this).addClass('active');
        if(isCompare) {
            $("#pie_filter_div").show();
            drawComparePie(0);
        }else{
            $("#pie_filter_div").hide();
            drawPieChart(0);
        }
    });

    $('#pie_gender_button').click(function () {
        console.log("pie button");
        inactiveGraphButtons();
        $(this).addClass('active');
        if(isCompare) {
            $("#pie_filter_div").show();
            drawComparePie(1);
        }else{
            $("#pie_filter_div").hide();
            drawPieChart(1);
        }
    });

    $('#pie_day_button').click(function () {
        console.log("pie button");
        inactiveGraphButtons();
        $(this).addClass('active');
        if(isCompare) {
            $("#pie_filter_div").show();
            drawComparePie(2);
        }else{
            $("#pie_filter_div").hide();
            drawPieChart(2);
        }
    });

    $('#retweet_count').click(function () {
        entity_val = $("#entity").val();
        console.log("ssssss");
        getRetweetCount();
    });

    $('#day_tweet').click(function () {
        console.log("day button");
        inactiveUserButtons();
        $(this).addClass('active');
        drawDayTweet();
    });

    $('#time_tweet').click(function () {
        console.log("time button");
        inactiveUserButtons();
        $(this).addClass('active');
        drawTimeTweet();
    });

});

function drawCompareTimeline() {
    var date1 = new Date(date_in.toString());
    var date2 = new Date(date_out.toString());
    var requestURL = serverAddress + "compare_timeline";

    entity_val = comparison_val;
    var entities = entity_val.split(",");

    var jsonParams = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),analysis:analysis_val};

    console.log(jsonParams);
    $.get(requestURL, jsonParams).done(function (data) {
        console.log(data);
        var obj = jQuery.parseJSON(data);
        console.log(obj);
        var graph = new Array();
        console.log(obj.length);
        for (var j = 0; j < obj.length; j++) {
            var graph_data = new Array();
            for (var i = 0; i < obj[j].length; i++) {
                graph_data[i] = obj[j][i].val / obj[j].length;
            }
            graph[j] = {
                name: 'Mentions of ' + entities[j],
                pointInterval: (date2.getTime() - date1.getTime()) / obj[j].length,
                pointStart: date1.getTime(),
                data: graph_data
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
                enabled: true
            },
            series: graph
        });
    });
}

function drawCompareMap() {
    var date1 = new Date(date_in.toString());
    var date2 = new Date(date_out.toString());
    var requestURL = serverAddress + "compare_map";

    entity_val = comparison_val;
    var entities = entity_val.split(",");

    var jsonParams = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),analysis:analysis_val};

    console.log(jsonParams);
    $.get(requestURL, jsonParams).done(function (data) {

        var map_data = jQuery.parseJSON(data);
        console.log(map_data);
        var put_data = {};
        var check_data = {};
        var dominate_data = {}
        for (var i = 0; i < map_data.length; i++){
            $.each(map_data[i], function(k, v) {
                if (!(put_data.hasOwnProperty(k))) {
                    check_data[k] = v;
                    put_data[k] = i + 1;
                    dominate_data[k] = entities[i];
                }
                else {
                    if (check_data[k] < v) {
                        put_data[k] = i + 1;
                        check_data[k] = v;
                        dominate_data[k] = entities[i];
                    }
                }
            });
        }
        console.log(map_data);
        $("#graph_container").empty();
        $('#graph_container').vectorMap({
            map: 'world_mill_en',
            series: {
                regions: [
                    {
                        values: put_data,
                        scale: ['#C8EEFF', '#0071A4'],
                        normalizeFunction: 'polynomial'
                    }
                ]
            },
            onRegionLabelShow: function (e, el, code) {
                var str_map = ' (Domination number of Mentions from ' + code + ' are from ' + dominate_data[code];
                str_map = str_map + ')';
                el.html(el.html() + str_map);
            }
        });
    });
}

function drawComparePie(pie_val) {
    var date1 = new Date(date_in.toString());
    var date2 = new Date(date_out.toString());
    var requestURL = serverAddress + "compare_pie";


    entity_val = comparison_val;
    var entities = entity_val.split(",");

    var jsonParams = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(), pie: pie_val.toString(),analysis:analysis_val};

    console.log(jsonParams);
    $("#graph_container").empty();
    $("#pie_filter_options").empty();
    $("#pie_filter").empty();
    $.get(requestURL, jsonParams).done(function (data) {

        var pie_data = jQuery.parseJSON(data);
        console.log(pie_data);


        var a = {};
        pie_store = pie_data;
        for (var i=0;i<pie_store.length;i++){
            for (var j=0;j< pie_store[i].length ; j++){
                var key = pie_store[i][j].name;
                if (!(key in a)) {
                    $("#pie_filter").html(key);
                    $("#pie_filter_options").append("<li><a href='#'>"+key+"</a></li>");
                    a[key] = 1;
                }
            }
        }
        console.log(a);
        preComputePie(key);
    });
}

function preComputePie(str){
    var pie_chart = [];
    entity_val = comparison_val;
    var entities = entity_val.split(",");
    var sum = 0;
    for (var i=0;i<pie_store.length;i++){
        for (var j=0;j< pie_store[i].length ; j++){
            if (pie_store[i][j].name == str){
                var pie_insert = {};
                pie_insert.name = entities[i];
                pie_insert.y = pie_store[i][j].y;
                sum = sum + pie_store[i][j].y;
                pie_chart.push(pie_insert);
            }
        }
    }

    for (var i = 0;i < pie_chart.length ; i++){
        pie_chart[i].y = (pie_chart[i].y)/sum;
    }

    console.log(pie_chart);
    drawComparePieDesc(pie_chart);
}

function drawComparePieDesc(pie_chart){
    $('#graph_container').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false
        },
        title: {
            text: '---- Distribution of --- of Entity '
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
                data: pie_chart
            }
        ]
    });
}

function drawDayTweet(){
    var val = 1;
    drawUserPie(val);
}

function drawTimeTweet(){
    var val = 0;
    drawUserPie(val);
}

function getRetweetCount(){
    var tweet_val = $("#tweet").html();
    var requestURL = serverAddress + "tweetrating";
    var jsonParams = {entity: entity_val.toString(),tweet: tweet_val.toString()};
    $.get(requestURL, jsonParams).done(function (data) {
        var data = jQuery.parseJSON(data);
        console.log(data);
        alertify.custom = alertify.extend("custom");
        alertify.custom("Predicted Retweet Count is : "  + data);
    });
}

function drawUserPie(val){
    var requestURL = serverAddress + "usertweet";
    var jsonParams = {entity: entity_val.toString(),value: val};
    console.log(jsonParams);
    $.get(requestURL, jsonParams).done(function (data) {
        var pie_data = jQuery.parseJSON(data);
        console.log(data);

        $("#user_graph").empty();
        $('#user_graph').highcharts({
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
                    data: pie_data
                }
            ]
        });

    });
}


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


        $("#keyword").empty();
        $("#keyword").removeClass("text-center");
        $("#keyword").addClass("custom-margin-left");
        for (var i = 0; i < keywords.length; i++) {
            $("#keyword").append("<li>"+keywords[i].key+"</li>");
        }

        $("#hashtag").empty();
        $("#hashtag").removeClass("text-center");
        $("#hashtag").addClass("custom-margin-left");
        for (var i = 0; i < hashtags.length; i++) {
            $("#hashtag").append("<li>"+hashtags[i].key+"</li>");
        }
        $("#trend").empty();
        $("#trend").removeClass("text-center");
        $("#trend").addClass("custom-margin-left");
        for (var i = 0; i < trends.length; i++) {
            $("#trend").append("<li><i class='fa fa-tags fa-0.5x'></i>&nbsp;&nbsp;"+trends[i].key+"</li>");
        }
    });
}

function drawSidebar2() {
    var requestURL = serverAddress + "usersidebar";
    var jsonParams = {entity: entity_val.toString()};
    console.log(jsonParams);
    $.get(requestURL, jsonParams).done(function (data) {
        var obj = jQuery.parseJSON(data);

        $("#user_name").html("<b>"+entity_val+"</b>");
        $("#followers_user").html("<i class='glyphicon glyphicon-eye-open'></i>&nbsp;"+obj[0].followers);
        $("#img2").html("<img src='"+obj[0].image+"' class='img-responsive'>");

        $("#details_rating").empty();
        $("#details_rating").removeClass("text-center");
        $("#details_rating").addClass("custom-margin-left-little");
        $("#details_rating").append("<li>Average Retweet : "+obj[0].rating+"</li>");
        $("#details_rating").append("<li>Maximum Retweet : "+obj[0].retweet+"</li>");

        $("#details_tweet").empty();
        $("#details_tweet").append(obj[0].tweet);
    });
}


function drawMainbar() {
    var requestURL = serverAddress + "mainbar";
    var jsonParams = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString()};
    $.get(requestURL, jsonParams).done(function (data) {
        var obj = jQuery.parseJSON(data);

        var keywords_main = obj[0];
        var hashTag_main = obj[1];
        var influential = obj[2];
        var correlated = obj[3];


        $("#hash_main").empty();
        $("#hash_main").removeClass("text-center");
        for (var i = 0; i < hashTag_main.length; i++) {
            $("#hash_main").append("<li><i class='fa fa-tags fa-0.5x'></i>&nbsp;&nbsp;"+hashTag_main[i].key+"</li>");
        }
        $("#keyword_main").empty();
        $("#keyword_main").removeClass("text-center");
        for (var i = 0; i < keywords_main.length; i++) {
            $("#keyword_main").append("<li><i class='fa fa-quote-left fa-0.5x'></i>&nbsp;&nbsp;"+keywords_main[i].key+"</li>");
        }
        $("#influential").empty();
        $("#influential").removeClass("text-center");
        for (var i = 0; i < influential.length; i++) {
            $("#influential").append("<li><i class='fa fa-user fa-0.5x'></i>&nbsp;&nbsp;"+influential[i].user+"</li>");
        }
        $("#correlated").empty();
        $("#correlated").removeClass("text-center");
        for (var i = 0; i < correlated.length; i++) {
            $("#correlated").append("<li><i class='fa fa-users fa-0.5x'></i>&nbsp;&nbsp;"+correlated[i].user+"</li>");
        }
    });
}

function drawTimeline() {
    var date1 = new Date(date_in.toString());
    var date2 = new Date(date_out.toString());
    var requestURL = serverAddress + "graph";
    var jsonParams = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),analysis:analysis_val};

    if ($("input[name=radioGroup]:checked").val() == 'double') {
        requestURL = serverAddress + "graphcompare";
        var entity_val2 = $("#entity_second").val();
        jsonParams = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),analysis:analysis_val};
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
                enabled: true
            },
            series: graph
        });
    });
}

function drawMap() {
    var set = 0;
    var str = serverAddress + "map";
    var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),analysis:analysis_val};

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
                        scale: {'1' : '#C8EEFF', 2 : '#0071A4'},
                        normalizeFunction: 'polynomial'
                    }
                ]
            },
            onRegionLabelShow: function (e, el, code) {
                var str_map = ' (Number of Mentions from ' + code + ' are - ' + map_data1[code];
                str_map = str_map + ')';
                el.html(el.html() + str_map);
            }
        });
    });
}

function drawPieChart(pie_val) {
    console.log(pie_val);
    var str = serverAddress + "pie";
    var jsonObject = {entity: entity_val.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(), pie: pie_val.toString(),analysis:analysis_val};

    if ($("input[name=radioGroup]:checked").val() == 'double') {
        str = serverAddress + "piecompare";
        var entity_val2 = $("#entity_second").val();
        jsonObject = {entity: entity_val.toString(), entity2: entity_val2.toString(), start: date_in.toString(), end: date_out.toString(), gender: gender_val.toString(), geo: country_val.toString(),analysis:analysis_val};
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
