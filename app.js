function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
    
  var axes = svg.append('g')
    .attr('clip-path', 'url(#axes-clip)');

  axes.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis);

  axes.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Degrees Celsius');
}

function addBar(bars, svg, chartWidth, chartHeight, margin, y, yAxis) {
    var xBar1 = d3.scale.ordinal()
        .rangeRoundBands([0, chartWidth], .1);
    var xBar2 = d3.scale.ordinal();
    var yBar = d3.scale.linear()
        .range([chartHeight, 0]);
    
    var xAxisBar = d3.svg.axis()
        .scale(xBar1)
        .orient("bottom");
    var yAxisBar = d3.svg.axis()
        .scale(yBar)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var barArea = d3.select('svg').append("g")
        .attr("transform", "translate(" + (chartWidth + margin.left) + "," + margin.top + ")");
    
    var yearPeriods = bars.map(function (b) { return b.Year;});
    var scenarios = ['all', 'low', 'medium-low', 'medium-high', 'high'];
    xBar1.domain(yearPeriods);
    xBar2.domain(scenarios).rangeRoundBands([0, xBar1.rangeBand()]);
    
    barArea.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(xAxisBar);
    
    barArea.append("g")
      .attr("class", "y axis no-ticks")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");
    
    var yearGroup = barArea.selectAll(".yearGrouping")
        .data(bars)
        .enter().append("g")
        .attr('class', 'group')
        .attr('group', function(d) { return d.Year;})
        .attr("transform", function(d) { return "translate(" + xBar1(d.Year) + ",0)"; });
        
    yearGroup.selectAll(".bar-outer")
        .data(bars)
        .enter()
        .append("g")
        .attr('class', 'bar-outer')
        .attr('group', function(d) { return d.Year;})
        .each(function() {
            var li = d3.select(this);
            //Do something with d.year here
            li.selectAll("rect")
                .data(function(d) { 
                    return d.Scenarios;
                })
                .enter()
                .append("rect")
                .attr('class', function (d) { return 'bar-' + d.Scenario; })
                .attr('x', function (d) { return xBar2(d.Scenario); })
                .attr('width', xBar2.rangeBand())
                .attr('y', function (d) { return y(d.Percentile95); })
                .attr('height', function (d) { 
                    var height = y(d.Percentile5) - y(d.Percentile95);
                    return height; 
            });
    });
        
        yearGroup.selectAll(".bar-inner")
        .data(bars)
        .enter()
        .append("g")
                .attr('class', 'bar-inner')
        .attr('group', function(d) { return d.Year;})
        .each(function() {
            var li = d3.select(this);
            //Do something with d.year here
            li.selectAll("rect")
                .data(function(d) { return d.Scenarios; })
                .enter()
                .append("rect")
        .attr('class', function (d) { return 'bar-' + d.Scenario + '-inner'; })
        .attr('x', function (d) { return xBar2(d.Scenario); })
        .attr('width', xBar2.rangeBand())
        .attr('y', function (d) { return y(d.Percentile83); })
        .attr('height', function (d) { 
                    var height = y(d.Percentile17) - y(d.Percentile83);
            return height; 
        });
    });
        
        yearGroup.selectAll(".median-line")
        .data(bars)
        .enter()
        .append("g")
                .attr('class', 'median')
        .attr('group', function(d) { return d.Year;})
        .each(function() {
            var li = d3.select(this);
            //Do something with d.year here
            li.selectAll("rect")
                .data(function(d) { return d.Scenarios; })
                .enter()
                .append("rect")
        .attr('class', function (d) { return 'median-line-small'; })
        .attr('x', function (d) { return xBar2(d.Scenario); })
        .attr('width', xBar2.rangeBand())
        .attr('y', function (d) { return y(d.Median); })
        .attr('height', 3);
    });
    
    //TEMPORARY
    function getAllElementsWithAttribute(attribute)
    {
        var matchingElements = [];
        var allElements = document.getElementsByTagName('*');
        for (var i = 0, n = allElements.length; i < n; i++)
        {
        if (allElements[i].getAttribute(attribute) !== null)
        {
          // Element exists with attribute. Add to array.
          matchingElements.push(allElements[i]);
        }
        }
        
        for (i=0; i < matchingElements.length; i++) {
            var match = matchingElements[i];
            var year = match.getAttribute('group');
          
            console.log(year);
            var children = match.childNodes;
            var childrenLength = match.childElementCount;
                        console.log(match.childElementCount);
            var shouldDelete = new Array(childrenLength);
                                    
            for (n = 0; n < childrenLength; n++) {
                if (children[n].hasAttribute('group')) {
                    if (children[n].getAttribute('group') != year) {
                        shouldDelete[n] = true;
                    }
                }
            }
            
            var removed = 0;
            for (m = 0; m < childrenLength; m++) {
                if (shouldDelete[m]) {
                    match.removeChild(children[m - removed]);
                    removed++;
                }
            }
            
        }
        return matchingElements;
    }

    var groups = getAllElementsWithAttribute('group');
    console.log(groups);
}

function drawPaths (svg, data, x, y) {
  var upperOuterArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.pct95); })
    .y1(function (d) { return y(d.pct83); });

  var upperInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.pct83); })
    .y1(function (d) { return y(d.medianAll); });

  var medianLine = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.medianAll); });
  var rcp26line = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.median26); });
  var rcp45line = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.median45); });
  var rcp60line = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.median60); });
  var rcp85line = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.median85); });

  var lowerInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.medianAll); })
    .y1(function (d) { return y(d.pct17); });

  var lowerOuterArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.pct17); })
    .y1(function (d) { return y(d.pct05); });

  svg.datum(data);

  svg.append('path')
    .attr('class', 'area upper outer')
    .attr('d', upperOuterArea)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .attr('class', 'area lower outer')
    .attr('d', lowerOuterArea)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .attr('class', 'area upper inner')
    .attr('d', upperInnerArea)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .attr('class', 'area lower inner')
    .attr('d', lowerInnerArea)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .attr('class', 'rcp26-line')
    .attr('d', rcp26line)
    .attr('clip-path', 'url(#rect-clip)');
      svg.append('path')
    .attr('class', 'rcp45-line')
    .attr('d', rcp45line)
    .attr('clip-path', 'url(#rect-clip)');
  svg.append('path')
    .attr('class', 'rcp60-line')
    .attr('d', rcp60line)
    .attr('clip-path', 'url(#rect-clip)');
  svg.append('path')
    .attr('class', 'rcp85-line')
    .attr('d', rcp85line)
    .attr('clip-path', 'url(#rect-clip)');
      svg.append('path')
    .attr('class', 'median-line')
    .attr('d', medianLine)
    .attr('clip-path', 'url(#rect-clip)');
}

function startTransitions (svg, chartWidth, chartHeight, rectClip, x) {
  rectClip.transition()
    .duration(3000)
    .attr('width', chartWidth);
}

function makeCharts (data) {    
  var svgWidth  = 900,
      svgHeight = 600,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = (svgWidth/2)  - margin.left - margin.right,
      chartHeight = svgHeight*(2/3) - margin.top  - margin.bottom;

  var x = d3.time.scale().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.date; })),
      y = d3.scale.linear().range([chartHeight, 0])
            .domain([d3.min(data, function (d) { return d.pct05 - 1;}), d3.max(data, function (d) { return d.pct95 + 1; })]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(4)
                .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
      yAxis = d3.svg.axis().scale(y).orient('left')
                .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

  var svg = d3.select('body').append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
    .attr('preserveAspectRatio', 'xMidYMid')
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var rectClip = svg.append('clipPath')
    .attr('id', 'rect-clip')
    .append('rect')
      .attr('width', 0)
      .attr('height', chartHeight);

    drawPaths(svg, data, x, y);
    addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
    startTransitions(svg, chartWidth, chartHeight, rectClip, x);
    
        d3.json('data/barjuly.json', function (error, rawData) {
    if (error) {
        console.error(error);
        return;
    }
            
    var barData = rawData.map(function (d) {
        return {
            Year: d.Year,
            Scenarios: d.Scenarios
        };
    });
    addBar(barData, svg, chartWidth, chartHeight, margin, y, yAxis);
});
}

function makeLegend() {
      var svgWidth  = 900,
      svgHeight = 600,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = (svgWidth/2)  - margin.left - margin.right,
      chartHeight = svgHeight*(2/3) - margin.top  - margin.bottom,
      legendWidth = svgWidth - margin.left - margin.right,
      legendHeight = svgHeight*(1/3) - margin.top - margin.bottom,
          legendItemHeight = 20,
          legendItemWidth = 30,
          legendStartY = chartHeight + margin.bottom * 2;
    
    var legend = d3.select('svg').append('g')
        .attr('transform', 'translate(' + margin.left + ',' + legendStartY + ')');
    legend.append('text').text('Legend').attr('transform', 'translate(0,0)');
    
    legend.append('rect').attr('class', 'median-line').attr('width', 50).attr('height', 3).attr('transform', 'translate(0,25)');
    legend.append('rect').attr('class', 'rcp85-line').attr('width', 50).attr('height', 1).attr('transform', 'translate(0,50)');
    legend.append('rect').attr('class', 'rcp60-line').attr('width', 50).attr('height', 1).attr('transform', 'translate(0,75)');
    legend.append('text').text('Median of All Models and Scenarios').attr('transform', 'translate(150,25)');
    legend.append('text').text('Median of All Models for High Emissions').attr('transform', 'translate(150,50)');
    legend.append('text').text('Median of All Models for Medium Emissions').attr('transform', 'translate(150,75)');
    
    
}

var parseDate  = d3.time.format('%Y-%m-%d').parse;

d3.json('data/linejuly.json', function (error, rawData) {
  if (error) {
    console.error(error);
    return;
  }

  var lineData = rawData.map(function (d) {
    return {
      date:  parseDate(d.Date),
      pct05: d.Pct05,
      pct17: d.Pct17,
      pct83: d.Pct83,
      pct95: d.Pct95,
      medianAll: d.MedianAll,
      median26: d.Median26,
      median45: d.Median45,
      median60: d.Median60,
      median85: d.Median85
    };
  });
    makeCharts(lineData);
    makeLegend();
});