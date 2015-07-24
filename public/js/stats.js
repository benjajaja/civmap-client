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
      renderTo: 'tps',
      zoomType: 'xy',
      alignTicks: false
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
      crosshair: true
    },
    yAxis: [{
      title: {
          text: 'Players'
      },
      gridLineWidth: 0,
      min: 0
      
    }, {

      title: {
          text: 'Ticks per second (TPS)'
      },
      min: 10,
      // max: 20,
      opposite: true,
      labels: {
          align: 'right',
          x: -3,
          y: 16,
          // format: '{value:.,0f}'
      }
    }],
    tooltip: {
        shared: true,
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    },
    series: [{
      name: 'TPS',
      type: 'area',
      yAxis: 1,
      data: response.map(function(p) {
        return [p[0] * 1000, p[1] / 100];
      })
    }, {
      name: 'Players',
      type: 'line',
      yAxis: 0,
      data: response.map(function(p) {
        return [p[0] * 1000, p[2]];
      })
    }]
  });
});
xhr.open("GET", 'http://txapu.com:8080/tps', true);
xhr.send();

// (function() {
//   var xhr = new XMLHttpRequest();
//   xhr.onload = (function(e) {
//     var response = JSON.parse(xhr.response);

//     var players = response/*.filter(function(row) {
//       return row.tps.some(function(tps) {
//         return tps < 1800;
//       });
//     })*/.map(function(row) {
//       var floorTps = row.tps.map(function(tps) {
//         return Math.floor(tps / 100);
//       }).filter(function(roundTps) {
//         return roundTps > 0 && roundTps < 19; // catch bad tps and discard zero-TPS (probably error)
//       });
//       var data = new Array(20);
//       for (var i = 0; i < 21; i++) {
//         var count = floorTps.filter(function(tps) {
//           return tps === i;
//         }).length;

//         data[i] = count;
//       }
//       var total = _.sum(data);
//       if (row.name === 'Kain_Highwynd') {
//         console.log(data, total);
//       }

//       data = data.map(function(point) {
//         return point === 0 ? 0 : point / total * 100;
//       });

//       if ((_.sum(data) < 99 || _.sum(data) > 101) && _.sum(data) !== 0) {
//         throw new Error('Not 100%: ' + data);
//       }

//       if (data.length !== 21) throw 'poop';

//       return {
//         name: row.name,
//         data: data.reverse()
//       };
//     }).filter(function(p) {
//       return p.name === 'GipsyKing';
//     });

//     var series = _.range(0, 21).map(function(tps, index) {
//       return {
//         data: players.map(function(player) {
//           return player.data[tps];
//         })
//       }
//     });

//     var playerNames = players.map(function(player) {
//       return player.name;
//     });
    

//     document.getElementById('players').style.height = 200 + (20 * players.length) + 'px'    

//     console.log(playerNames, series);
//     new Highcharts.Chart({
//       chart: {
//         type: 'bar',
//         renderTo: 'players'
//       },
//       // title: {
//       //     text: 'Players',
//       //     x: -20 //center
//       // },
//       // subtitle: {
//       //     text: 'Source: /tps command and player list',
//       //     x: -20
//       // },
//       xAxis: {
//         categories: playerNames
//       },
//       yAxis: {
//         min: 0,
//         max: 100,
//         // tickInterval: 1,
//         title: {
//           text: 'Ticks per second (TPS)'
//         }
//       },
//       tooltip: {
//           valueSuffix: ''
//       },
//       legend: {
//           reversed: true,
//           layout: 'vertical',
//           align: 'right',
//           verticalAlign: 'middle',
//           borderWidth: 0
//       },
//       colors: ["#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#E81900", "#BB4C00", "#8E7F00", "#61B200", "#34E500", "#1EFF00"],
//       plotOptions: {
//             series: {
//                 stacking: 'percent'
//             }
//         },
//       series: series
//     });
//   });
//   xhr.open("GET", 'http://txapu.com:8080/players', true);
//   xhr.send();
// })();