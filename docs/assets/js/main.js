const config = {
    "xAxes": [{
        "type": "DurationAxis",
        "baseUnit": "second",
        "durationFormatter": {
            "durationFormat": "hh':'mm':'ss"
        },
    }],
    "yAxes": [{
        "type": "ValueAxis",
    }],
    "series": [{
        "id": "s1",
        "type": "LineSeries",
        "dataFields": {
            "valueY": "value",
            "valueX": "sec"
        },
        "tooltipText": "{valueY}",
        "tooltip": {
            "pointerOrientation": "vertical"
        }
    }],
    "cursor": {
        "type": "XYCursor",
        "snapToSeries": ["s1"]
    },
}

am4core.ready(function() {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end
    
    //var chart = am4core.create("chartdiv", am4charts.XYChart);
    const chart = am4core.createFromConfig(config, "chartdiv", am4charts.XYChart);

    chart.dataSource.url = "assets/data/01.csv";
    chart.dataSource.parser = new am4core.CSVParser();
    chart.dataSource.parser.options.useColumnNames = true;
    
}); // end am4core.ready()