function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getFillColor(r2o_total) {

  switch (round(Number(r2o_total) * 2, 1) / 2) {
    case 1:     return 'rgba(195, 150, 150, 1)';
    case .95:   return 'rgba(210, 150, 150, 1)';
    case .9:    return 'rgba(225, 150, 150, 1)';
    case .85:   return 'rgba(240, 150, 150, 1)';
    case .8:    return 'rgba(255, 150, 150, 1)';
    case .75:   return 'rgba(255, 165, 150, 1)';
    case .7:    return 'rgba(255, 180, 150, 1)';
    case .65:   return 'rgba(255, 195, 150, 1)';
    case .6:    return 'rgba(255, 210, 150, 1)';
    case .55:   return 'rgba(255, 225, 150, 1)';
    case .5:    return 'rgba(255, 240, 150, 1)';
    case .45:   return 'rgba(255, 255, 165, 1)';
    case .4:    return 'rgba(255, 255, 195, 1)';
    case .35:   return 'rgba(255, 255, 225, 1)';
    case .3:    return 'rgba(255, 255, 255, 1)';
    case .25:   return 'rgba(240, 240, 255, 1)';
    case .2:    return 'rgba(225, 225, 255, 1)';
    case .15:   return 'rgba(210, 210, 255, 1)';
    case .1:    return 'rgba(195, 195, 255, 1)';
    case .05:   return 'rgba(180, 180, 255, 1)';
    case .0:    return 'rgba(165, 165, 255, 1)';
  }

  return '200, 200, 200';
}

var heatColor = {
  "1280" : "#ffffff",
  "1270" : "#ffffcc",
  "1260" : "#ffff88",
  "1250" : "#ffff22",
  "1240" : "#ffdd00",
  "1235" : "#ffbb00",
  "1230" : "#ff9900",
  "1225" : "#ff7700"
};

var margin = { top: 20, right: 20, bottom: 30, left: 30 };
var width = 800 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;

var svg = d3.select("#stull-chart-d3").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var clip = svg.append("defs").append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", width )
  .attr("height", height )
  .attr("x", 0)
  .attr("y", 0);

d3.json("api_output.json", function(error, data) {
  /*************************************
   * LOAD & PARSE JSON DATA
   * ***********************************/
  // Actual data is in the "data" array
  data = data.data;

  // Check JSON data for any recipes lacking information
  // Map Si/Al to x/y
  var index = data.length - 1;
  while (index >= 0) {
    if (isNaN(parseFloat(data[index].analysis.umf_analysis.SiO2))
      || isNaN(parseFloat(data[index].analysis.umf_analysis.Al2O3))) {
      console.log("JSON: No Si:Al for ID = " + data[index].id);
      data.splice(index, 1);
    }
    else {
      data[index].x = data[index].analysis.umf_analysis.SiO2;
      data[index].y = data[index].analysis.umf_analysis.Al2O3;
      data[index].pointcolor = getFillColor(data[index].analysis.umf_analysis.R2O_total);
    }
    index -= 1;
  }

  /*************************************
   * Button & Zoom Setup
   * ***********************************/
  d3.select("button")
    .on("click", resetted);

  var zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

  svg.call(zoom);

  /*************************************
   * Chart Scale & Axes
   * ***********************************/
  var x = d3.scaleLinear().range([0, width]).nice();
  var y = d3.scaleLinear().range([height, 0]);

  var xExtent = d3.extent(data, function (d) { return d.x; });
  var yExtent = d3.extent(data, function (d) { return d.y; });
  x.domain(d3.extent(data, function (d) { return d.x; })).nice();
  y.domain(d3.extent(data, function (d) { return d.y; })).nice();

  var scatter = svg.append("g")
    .attr("id", "scatterplot")
    .attr("clip-path", "url(#clip)");

  /*************************************
   * X Axis
   * ***********************************/
  var xAxis = d3.axisBottom(x)
    .tickSize(-height)
    .ticks(20);

  var gX = svg.append("g")
    .attr("class", "x axis")
    .attr('id', "axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("text")
    .style("text-anchor", "end")
    .attr("class", "axis-names")
    .attr("dx", "-.5em")
    .attr("x", width)
    .attr("y", height - 8)
    .text("SiO₂");

  /*************************************
   * Y Axis
   * ***********************************/
  var yAxis = d3.axisLeft(y)
    .tickSize(-width)
    .ticks(20 * height / width);

  var gY = svg.append("g")
    .attr("class", "y axis")
    .attr('id', "axis--y")
    .call(yAxis);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("class", "axis-names")
    .attr("dy", "1em")
    .attr("dx", "-.5em")
    .style("text-anchor", "end")
    .text("Al₂O₃");

  /*************************************
   * Heat map contours
   * ***********************************/

  var c1280 = d3.path();
  c1280.moveTo(x(1.8), y(.4));
  c1280.lineTo(x(1.8), y(.85));
  c1280.lineTo(x(6.6), y(.85));
  c1280.lineTo(x(6.6), y(.4));

  var c1270 = d3.path();
  c1270.moveTo(x(1.8), y(.68));
  c1270.lineTo(x(2), y(.69));
  c1270.lineTo(x(2.05), y(.8));
  c1270.lineTo(x(2.12), y(.85));
  c1270.lineTo(x(6.6), y(.85));
  c1270.lineTo(x(6.6), y(.455));
  c1270.lineTo(x(6.35), y(.43));
  c1270.lineTo(x(5.8), y(.4));
  c1270.lineTo(x(1.8), y(.4));

  var c1260 = d3.path();
  c1260.moveTo(x(1.8), y(.642));
  c1260.lineTo(x(2.05), y(.66));
  c1260.lineTo(x(2.18), y(.8));
  c1260.lineTo(x(2.28), y(.85));
  c1260.lineTo(x(5.55), y(.85));
  c1260.lineTo(x(6.1), y(.83));
  c1260.lineTo(x(6.6), y(.83));
  c1260.lineTo(x(6.6), y(.483));
  c1260.lineTo(x(6.2), y(.46));
  c1260.lineTo(x(5.75), y(.45));
  c1260.lineTo(x(5.4), y(.422));
  c1260.lineTo(x(5.05), y(.4));
  c1260.lineTo(x(1.8), y(.4));

  var c1250 = d3.path();
  c1250.moveTo(x(1.8), y(.63));
  c1250.lineTo(x(2.25), y(.66));
  c1250.lineTo(x(2.4), y(.76));
  c1250.lineTo(x(2.35), y(.81));
  c1250.lineTo(x(2.43), y(.85));
  c1250.lineTo(x(4.3), y(.85));
  c1250.lineTo(x(4.6), y(.84));
  c1250.lineTo(x(5.0), y(.86));
  c1250.lineTo(x(5.55), y(.82));
  c1250.lineTo(x(6.1), y(.8));
  c1250.lineTo(x(6.6), y(.79));
  c1250.lineTo(x(6.6), y(.58));
  c1250.lineTo(x(6.2), y(.55));
  c1250.lineTo(x(5.65), y(.49));
  c1250.lineTo(x(5.4), y(.48));
  c1250.lineTo(x(5.05), y(.47));
  c1250.lineTo(x(4.35), y(.4));
  c1250.lineTo(x(1.8), y(.4));

  var c1240 = d3.path();
  c1240.moveTo(x(2.7), y(.85));
  c1240.lineTo(x(2.65), y(.8));
  c1240.lineTo(x(2.71), y(.765));
  c1240.lineTo(x(2.6), y(.72));
  c1240.lineTo(x(2.45), y(.655));
  c1240.lineTo(x(2), y(.618));
  c1240.lineTo(x(1.8), y(.58));
  c1240.lineTo(x(1.8), y(.5799));
  c1240.lineTo(x(1.8), y(.4));
  c1240.lineTo(x(2), y(.4));
  c1240.lineTo(x(2.5), y(.4));
  c1240.lineTo(x(3), y(.4));
  c1240.lineTo(x(3.55), y(.424));
  c1240.lineTo(x(4.2), y(.438));
  c1240.lineTo(x(4.6), y(.475));
  c1240.lineTo(x(4.9), y(.505));
  c1240.lineTo(x(4.96), y(.545));
  c1240.lineTo(x(5.4), y(.572));
  c1240.lineTo(x(6.0), y(.62));
  c1240.lineTo(x(6.2), y(.67));
  c1240.lineTo(x(6.1), y(.72));
  c1240.lineTo(x(5.55), y(.77));
  c1240.lineTo(x(5.38), y(.776));
  c1240.lineTo(x(5.05), y(.77));
  c1240.lineTo(x(4.8), y(.79));
  c1240.lineTo(x(4.42), y(.821));
  c1240.lineTo(x(4.1), y(.84));
  c1240.lineTo(x(3.9), y(.85));
  c1240.lineTo(x(2.7), y(.85));

   scatter.selectAll("contour")
   .data([c1280])
   .enter().append("path")
   .attr("opacity", 1)
   .attr("d", c1280.toString())
   .style("fill", heatColor["1280"]);

   scatter.selectAll("contour")
   .data([c1270])
   .enter().append("path")
   .attr("opacity", 1)
   .attr("d", c1270.toString())
   .style("fill", heatColor["1270"]);

   scatter.selectAll("contour")
   .data([c1260])
   .enter().append("path")
   .attr("opacity", 1)
   .attr("d", c1260.toString())
   .style("fill", heatColor["1260"]);

   scatter.selectAll("contour")
   .data([c1250])
   .enter().append("path")
   .attr("opacity", 1)
   .attr("d", c1250.toString())
   .style("fill", heatColor["1250"]);

   scatter.selectAll("contour")
   .data([c1240])
   .enter().append("path")
   .attr("opacity", 1)
   .attr("d", c1240.toString())
   .style("fill", heatColor["1240"]);


   /*
   scatter.selectAll("contour")
   .data([c1240])
   .enter().append("path")
   .attr("opacity", 1)
   .attr("d", c1240.toString())
   .style("fill", heatColor["1240"]);

   scatter.selectAll("contour")
   .data([c1235])
   .enter().append("path")
   .attr("d", contourClosedLineFunction(c1235))
   .attr("opacity", 1)
   .style("fill", heatColor["1235"])

   scatter.selectAll("contour")
   .data([c1230])
   .enter().append("path")
   .attr("d", contourClosedLineFunction(c1230))
   .attr("opacity", 1)
   .style("fill", heatColor["1230"])

   scatter.selectAll("contour")
   .data([c1225])
   .enter().append("path")
   .attr("d", contourClosedLineFunction(c1225))
   .attr("opacity", 1)
   .style("fill", heatColor["1225"])

  */
/*
  var c1280 = [
    {"x": 1.8, "y": .4},
    {"x": 1.8, "y": .85},
    {"x": 6.6, "y": .85},
    {"x": 6.6, "y": .4}
  ];

  var c1270 = [
    {"x": 1.8, "y": .68},
    {"x": 2, "y": .69},
    {"x": 2.05, "y": .8},
    {"x": 2.12, "y": .85},
    {"x": 6.6, "y": .85},
    {"x": 6.6, "y": .455},
    {"x": 6.35, "y": .43},
    {"x": 5.8, "y": .4},
    {"x": 1.8, "y": .4}
  ]

  var c1260 = [
    {"x": 1.8, "y": .642},
    {"x": 2.05, "y": .66},
    {"x": 2.18, "y": .8},
    {"x": 2.28, "y": .85},
    {"x": 5.55, "y": .85},
    {"x": 6.1, "y": .83},
    {"x": 6.6, "y": .83},
    {"x": 6.6, "y": .483},
    {"x": 6.2, "y": .46},
    {"x": 5.75, "y": .45},
    {"x": 5.4, "y": .422},
    {"x": 5.05, "y": .4},
    {"x": 1.8, "y": .4}
  ]

  var c1250 = [
    {"x": 1.8, "y": .63},
    {"x": 2.25, "y": .66},
    {"x": 2.4, "y": .76},
    {"x": 2.35, "y": .81},
    {"x": 2.43, "y": .85},
    {"x": 4.3, "y": .85},
    {"x": 4.6, "y": .84},
    {"x": 5.0, "y": .86},
    {"x": 5.55, "y": .82},
    {"x": 6.1, "y": .8},
    {"x": 6.6, "y": .79},
    {"x": 6.6, "y": .58},
    {"x": 6.2, "y": .55},
    {"x": 5.65, "y": .49},
    {"x": 5.4, "y": .48},
    {"x": 5.05, "y": .47},
    {"x": 4.35, "y": .4},
    {"x": 1.8, "y": .4}
  ]

  var c1240 = [
    {"x": 2.7, "y": .85},
    {"x": 2.65, "y": .8},
    {"x": 2.71, "y": .765},
    {"x": 2.6, "y": .72},
    {"x": 2.45, "y": .655},
    {"x": 2, "y": .618},
    {"x": 1.8, "y": .58},
    {"x": 1.8, "y": .5799},
    {"x": 1.8, "y": .4},
    {"x": 2, "y": .4},
    {"x": 2.5, "y": .4},
    {"x": 3, "y": .4},
    {"x": 3.55, "y": .424},
    {"x": 4.2, "y": .438},
    {"x": 4.6, "y": .475},
    {"x": 4.9, "y": .505},
    {"x": 4.96, "y": .545},
    {"x": 5.4, "y": .572},
    {"x": 6.0, "y": .62},
    {"x": 6.2, "y": .67},
    {"x": 6.1, "y": .72},
    {"x": 5.55, "y": .77},
    {"x": 5.38, "y": .776},
    {"x": 5.05, "y": .77},
    {"x": 4.8, "y": .79},
    {"x": 4.42, "y": .821},
    {"x": 4.1, "y": .84},
    {"x": 3.9, "y": .85},
    {"x": 2.7, "y": .85}
  ]
*/
  var c1235 = [
    {"x": 2.9, "y": .85},
    {"x": 2.75, "y": .81},
    {"x": 2.88, "y": .765},
    {"x": 2.7, "y": .7},
    {"x": 2.55, "y": .65},
    {"x": 2.1, "y": .61},
    {"x": 1.81, "y": .55},
    {"x": 2, "y": .465},
    {"x": 1.85, "y": .405},
    {"x": 2.1, "y": .365},
    {"x": 2.65, "y": .4},
    {"x": 2.9, "y": .419},
    {"x": 3.2, "y": .426},
    {"x": 3.6, "y": .445},
    {"x": 4.5, "y": .48},
    {"x": 4.7, "y": .5},
    {"x": 4.8, "y": .56},
    {"x": 5.4, "y": .59},
    {"x": 5.95, "y": .64},
    {"x": 6, "y": .7},
    {"x": 5.45, "y": .668},
    {"x": 5.32, "y": .685},
    {"x": 5.24, "y": .7},
    {"x": 5.5, "y": .743},
    {"x": 4.95, "y": .752},
    {"x": 4.4, "y": .8},
    {"x": 3.95, "y": .78},
    {"x": 3.49, "y": .85},
    {"x": 3.18, "y": .87}
  ];

  var c1230 = [
    {"x": 3.48, "y": .76},
    {"x": 3.45, "y": .748},
    {"x": 3.1, "y": .731},
    {"x": 2.95, "y": .72},
    {"x": 2.85, "y": .655},
    {"x": 2.3, "y": .605},
    {"x": 2, "y": .555},
    {"x": 2.18, "y": .518},
    {"x": 2.45, "y": .455},
    {"x": 2.95, "y": .448},
    {"x": 3.7, "y": .491},
    {"x": 3.9, "y": .49},
    {"x": 4.38, "y": .498},
    {"x": 4.56, "y": .575},
    {"x": 5.1, "y": .635},
    {"x": 4.4, "y": .692},
    {"x": 3.9, "y": .687},
    {"x": 3.8, "y": .7},
    {"x": 4.04, "y": .74},
    {"x": 3.5, "y": .8},
    {"x": 3.1, "y": .847},
    {"x": 2.95, "y": .81},
    {"x": 3.17, "y": .77},
    {"x": 3.48, "y": .76}
  ];

  var c1225 = [
    {"x": 3.6, "y": .65},
    {"x": 3.0, "y": .642},
    {"x": 2.82, "y": .63},
    {"x": 2.5, "y": .60},
    {"x": 2.46, "y": .58},
    {"x": 2.48, "y": .554},
    {"x": 2.6, "y": .548},
    {"x": 2.8, "y": .55},
    {"x": 3.0, "y": .5},
    {"x": 3.45, "y": .566},
    {"x": 3.7, "y": .562},
    {"x": 4.2, "y": .575},
    {"x": 4.45, "y": .60},
    {"x": 4.5, "y": .645},
    {"x": 4.0, "y": .655}
  ];

  var contourLineFunction = d3.line()
    .x(function (d) {
      return x(d.x);
    })
    .y(function (d) {
      return y(d.y);
    })
    .curve(d3.curveCardinal);

  var contourClosedLineFunction = d3.line()
    .x(function (d) {
      return x(d.x);
    })
    .y(function (d) {
      return y(d.y);
    })
    .curve(d3.curveCardinalClosed);
/*
  scatter.selectAll("contour")
    .data([c1280])
    .enter().append("polygon")
      .attr("points", function (d) {
        return d.map(function (d) {
          return [x(d.x), y(d.y)].join(",");
        }).join(" ");
      })
    .attr("opacity", 1)
    .style("fill", heatColor["1280"]);

  scatter.selectAll("contour")
    .data([c1270])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1270"]);

  scatter.selectAll("contour")
    .data([c1260])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1260"]);

  scatter.selectAll("contour")
    .data([c1250])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1250"]);

  scatter.selectAll("contour")
    .data([c1240])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1240"]);
*/

  scatter.selectAll("contour")
    .data([c1235])
    .enter().append("path")
    .attr("d", contourClosedLineFunction(c1235))
    .attr("opacity", 1)
    .style("fill", heatColor["1235"])

  scatter.selectAll("contour")
    .data([c1230])
    .enter().append("path")
    .attr("d", contourClosedLineFunction(c1230))
    .attr("opacity", 1)
    .style("fill", heatColor["1230"])

  scatter.selectAll("contour")
    .data([c1225])
    .enter().append("path")
    .attr("d", contourClosedLineFunction(c1225))
    .attr("opacity", 1)
    .style("fill", heatColor["1225"])
/*
  scatter.selectAll("contour")
    .data([c1235])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1235"]);

  scatter.selectAll("contour")
    .data([c1230])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1230"]);

  scatter.selectAll("contour")
    .data([c1225])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 1)
    .style("fill", heatColor["1225"]);
*/
  scatter.append("text")
    .attr("x", function(d) { return x(3.4); })
    .attr("y", function(d) { return y(.6); })
    .attr("class", "stull-temp-names")
    .attr("opacity", 0.6)
    .text("1225°");

  scatter.append("text")
    .attr("x", function(d) { return x(4.0); })
    .attr("y", function(d) { return y(.66); })
    .attr("class", "stull-temp-names")
    .attr("opacity", 0.6)
    .text("1230°");

  scatter.append("text")
    .attr("x", function(d) { return x(4.5); })
    .attr("y", function(d) { return y(.72); })
    .attr("class", "stull-temp-names")
    .attr("opacity", 0.6)
    .text("1235°");

  scatter.append("text")
    .attr("x", function(d) { return x(4.9); })
    .attr("y", function(d) { return y(.755); })
    .attr("class", "stull-temp-names")
    .attr("opacity", 0.6)
    .text("1240°");

  scatter.append("text")
    .attr("x", function(d) { return x(5.21); })
    .attr("y", function(d) { return y(.795); })
    .attr("class", "stull-temp-names")
    .attr("opacity", 0.6)
    .text("1250°");

  /**************************************
   * STULL REGIONS
   **************************************/
  var unfused = [
    {"x": 0.6, "y": 0.42},
    {"x": 0.6, "y": 1.0},
    {"x": 2.8, "y": 1.0}
  ];
  scatter.selectAll("unfused")
    .data([unfused])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 0.5)
    .style("fill", "#666666");

  var matte = [
    {"x": 0.6, "y": 0.08},
    {"x": 0.6, "y": 0.42},
    {"x": 2.8, "y": 1.0},
    {"x": 4.0, "y": 1.0}
  ];
  scatter.selectAll("matte")
    .data([matte])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 0.5)
    .style("fill", "#999999");

  var semimatte = [
    {"x": 1.2, "y": 0.242},
    {"x": 4.0, "y": 1},
    {"x": 5.0, "y": 1.0}
  ];
  scatter.selectAll("semimatte")
    .data([semimatte])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 0.5)
    .style("fill", "#cccccc");

  var underfired = [
    {"x": 2.4, "y": 0.08},
    {"x": 7.2, "y": 0.65},
    {"x": 7.2, "y": 0.08}
  ];
  scatter.selectAll("underfired")
    .data([underfired])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 0.5)
    .style("fill", "#666666");

  var lineFunction = d3.line()
    .x(function (d) {
      return x(d.x);
    })
    .y(function (d) {
      return y(d.y);
    })
    .curve(d3.curveCardinal);


  var crazed = [
    {"x": 0.6, "y": 0.08},
    {"x": 0.6, "y": 1.0},
    {
      "x": 1.67, "y": 1.0
    },
    {"x": 2.1, "y": 0.50},
    {"x": 2.38, "y": 0.25},
    {"x": 2.7, "y": 0.23},
    {"x": 3.3, "y": 0.25},
    {"x": 3.9, "y": 0.28},
    {"x": 4.2, "y": 0.29},
    {"x": 5.4, "y": 0.49},
    {"x": 7.2, "y": 0.615},
    {"x": 7.2, "y": 0.08}
  ];
  scatter.selectAll("crazed").data([crazed])
    .enter().append("polygon")
    .attr("points", function (d) {
      return d.map(function (d) {
        return [x(d.x), y(d.y)].join(",");
      }).join(" ");
    })
    .attr("opacity", 0.5)
    .style("fill", "url(#diagonalHatch)");

  var linearLineFunction = d3.line()
    .x(function (d) {
      return x(d.x);
    })
    .y(function (d) {

      return y(d.y);
    })
    .curve(d3.curveLinear);

  var qline = [
      {"x": 1.8, "y": 0.2},
      {"x": 4.2, "y": 0.6},
      {"x": 6.0, "y": 0.8},
      {"x": 7.2, "y": 0.92}
    ];
  scatter.selectAll("qline")
    .data([qline])
    .enter().append("path")
    .attr("d", linearLineFunction(qline))
    .attr("opacity", 0.9)
    .attr("fill", "none")
    .style("stroke", "#000000")
    .style("stroke-dasharray", ("3, 3"))
    .style("stroke-width", 1);

  scatter.append("text")
    .attr("x", function(d) { return x(1.9); })
    .attr("y", function(d) { return y(.14); })
    .attr("class", "stull-region-names")
    .attr("opacity", 0.6)
    .text("CRAZED");

  scatter.append("text")
    .attr("x", function(d) { return x(4.02); })
    .attr("y", function(d) { return y(.96); })
    .attr("class", "stull-region-names")
    .attr("opacity", 0.6)
    .text("SEMI-MATTE");

  scatter.append("text")
    .attr("x", function(d) { return x(3.1); })
    .attr("y", function(d) { return y(.96); })
    .attr("class", "stull-region-names")
    .attr("opacity", 0.6)
    .text("MATTE");

  scatter.append("text")
    .attr("x", function(d) { return x(1.85); })
    .attr("y", function(d) { return y(.96); })
    .attr("class", "stull-region-names")
    .attr("opacity", 0.6)
    .text("UNFUSED");

  scatter.append("text")
    .attr("x", function(d) { return x(4.3); })
    .attr("y", function(d) { return y(.21); })
    .attr("class", "stull-region-names")
    .attr("opacity", 0.6)
    .text("UNDER-FIRED");

  /*************************************
   * Set up d3-tip for tooltips
   * ***********************************/
  var tip = d3.tip().attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
      var ortonCone = '';
      if (d.from_orton_cone_name) {
        if (d.to_orton_cond_name) {
          ortonCone = "&Delta;" + d.from_orton_cone_name + "-" + d.to_orton_cone_name + " ";
        }
        else {
          ortonCone = "&Delta;" + d.from_orton_cone_name + " ";
        }
      }
      return ortonCone + d.name
        + "<p>"
        + Number(d.x).toFixed(2) + " SiO<sub>2</sub>, "
        + Number(d.y).toFixed(2) + " Al<sub>2</sub>O<sub>3</sub>"
        + "<br/><span style='color:red'>"
        + Number(d.analysis.umf_analysis.SiO2_Al2O3_ratio).toFixed(2)
        + "</span> SiO<sub>2</sub>:Al<sub>2</sub>O<sub>3</sub>"
        + "<br/><span style='color:yellow'>"
        + Number(d.analysis.umf_analysis.R2O_total).toFixed(1) + ":"
        + Number(d.analysis.umf_analysis.RO_total).toFixed(1) + "</span> R2O:RO"
        + "</p>";
    });

  scatter.call(tip);

  /*************************************
   * Recipe points
   * ***********************************/
  scatter.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 4)
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("opacity", 1)
    .style("fill", function (d) {
      return (d.pointcolor);
    })
    .attr("stroke-width", 1)
    .attr("stroke", "rgba(0, 0, 0, 0.5)")
    //      .style("fill", "#ff0000")
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  function idled() {
    idleTimeout = null;
  }

  function zoomed() {
    scatter.attr("transform", d3.event.transform);
    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
    /*
    var t = scatter.transition().duration(750);
    svg.select("#axis--x").transition(t).call(xAxis);
    svg.select("#axis--y").transition(t).call(yAxis);

    scatter.selectAll("text")
      .attr("opacity", 0);

    scatter.selectAll("circle").transition(t)
      .attr("cx", function (d) { return x(d.x); })
      .attr("cy", function (d) { return y(d.y); });

    scatter.selectAll("polygon").transition(t)
      .attr("points", function(d) {
        return d.map(function(d) {
          return [x(d.x),y(d.y)].join(",");
        }).join(" ");
      });

    scatter.selectAll("line").transition(t)
      .attr("d", function(d) { return linearLineFunction(d.values)});
      */
  }

  function resetted() {
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

});
