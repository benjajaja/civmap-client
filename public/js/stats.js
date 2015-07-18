Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

var xhr = new XMLHttpRequest();
xhr.onload = (function(e) {
  var response = JSON.parse(xhr.response);
  new Highcharts.Chart({
    chart: {
      renderTo: 'container'
    },
    title: {
        text: 'Daily TPS',
        x: -20 //center
    },
    subtitle: {
        text: 'Source: /tps command',
        x: -20
    },
    xAxis: {
      title: {
        text: 'Time of day'
      },
      dateTimeLabelFormats: { // don't display the dummy year
          minute: '%H:%M',
      },
      type: 'datetime',
    },
    yAxis: {
        title: {
            text: 'Ticks per second (TPS)'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    tooltip: {
        valueSuffix: ''
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    },
    series: [{
      name: 'TPS',
      data: response.map(function(p) {
        return [p[0] * 1000, p[1] / 100];
      })
    }]
  });
});
xhr.open("GET", 'http://txapu.com:8080/tps', true);
xhr.send();