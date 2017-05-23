/// <reference path="d3.v3.js" />
/// <reference path="d3/d3.js" />
/// <reference path="jquery-1.9.1.js" />
/// <reference path="angular.js" />

//jquery is required 

angular.module("chart.app", [])

    .factory("app.donut.service", function () {
        return {
            getValue: function (d) {
                if (angular.isNumber(d.value)) {
                    return d.value
                } else {
                    var val = new String(d.value)
                    if (val.indexOf(',') !== -1) {
                        val = val.replace(",", "")
                        return parseFloat(val)
                    }
                }
            }
        }
    })
    .service("app.wrap.service", function () {

        var _wrapBoxWidth;
        var _wrapBoxheight;

        Object.defineProperty(this, 'wrapBoxWidth', {
            get: function () {
                return _wrapBoxWidth
            },
            set: function (value) {
                _wrapBoxWidth = value
            }
        })

        Object.defineProperty(this, 'wrapBoxHeight', {
            get: function () {
                return _wrapBoxheight
            },
            set: function (value) {
                _wrapBoxheight = value
            }
        })

        this.wrapText = function (textElem) {
                textElem.forEach(function (elem) {
                    elem.forEach(function (textTag) {
                        var text = d3.select(textTag)
                        //console.log(text)
                        //console.log(width)
                        var words = text.text().split(/\s+/).reverse(),
                            word,
                            line = [],
                            lineNumber = 0,
                            lineHeight = 1.1,
                            textBoxHeight =
                            tSpan = text.text(null).append('tspan')
                                            .attr({
                                                x: 0,
                                                y: 0,
                                                dy:'0.35em'
                                            })
                        while (word = words.pop()) {
                            line.push(word)
                            tSpan.text(line.join(" "));
                            if (tSpan.node().getComputedTextLength() > _wrapBoxWidth) {
                                line.pop();
                                tSpan.text(line.join(" "));
                                line = [word];
                                tSpan = text.append("tspan").attr({
                                    x: 0,
                                    y: 0,
                                    dy: ++lineNumber * lineHeight + 0.32 + "em"
                                }).text(word)
                            }
                        }
                    })
                    
                })
        }
    })
    .service("app.chart.service", [function () {
        this.verticalPath = function (height) {
            return 'M0, 0H0V' + height + 'H0'
        }

        this.horizontalPath = function (width) {
            return 'M0, 0V0H' + width + 'V0'
        }
    }])

.directive("appCurveCharts", function () {
    return {
        scope:{
            data: '=',
        },
        controller: ["$scope", "$elem", "$attrs", function () {

        }]
    }

})

//data for donut chart should be array of object with label and value property
.directive("appDonutChart", function () {
    return {

        restrict: 'A',

        scope: {
            data: '=donutData',
            width: '@donutWidth',
            height:'@donutHeight',
            innerRadius: '@donutInnerRadius',
            colors: '=donutColors',
            comparatorFn: '&?donutSortFn',
            showLegend: '@donutShowLegend',
            value: '@donutValueProperty',
            label: '@donutTextProperty',
            showPopover:'@donutShowPopover'
        },

        controller: ["$scope", "$element", "$log", "app.donut.service", function (scope, elem, log, srvc) {
            var legendSpacing = 0;
            var colors = [];
            var legendDrawingAreaWidth ;
            var circleDrawingAreaWidth;
            var circleDrawingAreaHeight;
            var legendDrawingAreaHeight;
            var legendYPosition;
            var circleXPostion;
            var circleYPostion;
            var labelArea = 40;

            var margin = {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }

            if (angular.isUndefined(scope.data)) {
                log.error("donut data is not defined")
                return
            }
            //get the container height
            //var elemHeight = elem.height(),
            //    elemWidth = elem.width();

            var elemHeight = +scope.height,
                elemWidth = +scope.width

            if (angular.isUndefined(elemHeight) || angular.isUndefined(elemWidth) || elemHeight === 0) {
                log.warn("either element height or width is not defined")
                elemHeight = 500;
                elemWidth = 500;
            }
            angular.element(elem[0]).height(elemHeight)
            angular.element(elem[0]).width(elemWidth)

            var svgHeight = elemHeight,
                svgWidth = elemWidth;


            donutDrawingAreaWidth = svgWidth - labelArea;
            donutDrawingAreaHeight = svgHeight - labelArea;
            donutXPostion = donutDrawingAreaWidth / 2;
            donutYPosition = donutDrawingAreaHeight / 2;

            //getting 25% for legend drawing area
            if (scope.showLegend == "true") {
                //divide the svg width for circle and legend
                //75% of width for circle, 25% of width for legend - fixed
                legendDrawingAreaWidth = (25 / 100) * svgWidth
                donutDrawingAreaWidth = ((75 / 100) * svgWidth) - labelArea
                donutXPostion = donutXPostion - legendDrawingAreaWidth
            }

            
            legendDrawingAreaHeight = svgHeight



            var outerRadius = (Math.min(donutDrawingAreaHeight, donutDrawingAreaWidth) / 2) - 10
            var innerRadius = +scope.innerRadius;

            var container = d3.select(elem[0]);

            var svgContainer = container.append('svg')
                                        .attr('height', svgHeight)
                                        .attr('width', svgWidth)
                                        //.attr('transform', 'translate(' + margin.left + ", " + margin.top + ")")

            var g = svgContainer.append('g')
                                .attr('transform', 'translate(' +labelArea/2 + ', ' + labelArea/2 + ')')
                                .attr('class', 'donut-drawing-area')

            var donutG = g.append('g')
                            .attr('transform', 'translate(' + donutXPostion + ', ' + donutYPosition + ')')
                            .attr('class', 'donut')

            //creating the arc generator with inner radius and outer radius for pie/donut
            var arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);
          
            if (angular.isDefined(scope.colors)) {
                colors = scope.colors
            } else {
                colors = d3.scaleOrdinal(d3.schemeCategory20);
            }

            //creating the arcs
            //arc start angle and end angle are decided by data
            //endangle and start angle will be generated based on value
            var pie = d3.layout
                        .pie()
                        .value(function (d) {
                            return srvc.getValue(d)
                        })

            //sorting the arcs
            if (scope.comparatorFn) {
                pie = pie.sort(function (a, b) {
                        return scope.comparatorFn({
                            a: a,
                            b: b
                        })
                    })
            } else {
                pie = pie.sort(null)
            }

            var path = donutG.selectAll('path.donut-path')
                        .data(pie(scope.data))
                        .enter()
                        .append('path')
                //use arc generator to generate arc based on data. Data will be object with StartAngle, EndAngle, Data
                        .attr('d', arc)
                        .attr('fill', function (d, i) {
                            if (angular.isFunction(colors)) {
                                return colors(d.data.label)
                            } else {
                                return colors[i]
                            }
                        })
                        .attr('class', 'donut-path')

            //store the current data for animation transition
            path.each(function (d) {
                this._current = d
            })

            var chartLabelsG = donutG.append('g')
                                        .attr('class', 'labels')

            var chartLabel = chartLabelsG.selectAll('text')
                                .data(pie(scope.data))
                                .enter()
                                .append('text')
                                .text(function (d) {
                                    return d.data[scope.value]
                                })
                                .attr({
                                    x: function (d) {
                                        var c = arc.centroid(d),
                                            //label radius
                                            labelr = outerRadius + 10
                                            x = c[0],
                                            y = c[1],
                                            // pythagorean theorem for hypotenuse
                                            h = Math.sqrt(x * x + y * y);

                                            return (x / h * labelr);
                                    },
                                    y: function (d) {
                                        var c = arc.centroid(d),
                                            labelr = outerRadius + 10
                                            x = c[0],
                                            y = c[1],
                                            // pythagorean theorem for hypotenuse
                                            h = Math.sqrt(x * x + y * y);

                                            return (y / h * labelr);
                                    },
                                    dy: ".35em",
                                    'text-anchor': function (d) {
                                        console.log(d.endAngle + d.startAngle)
                                        console.log(2 *  (Math.PI/180))
                                        // are we past the center?
                                        return (d.endAngle + d.startAngle)/2 > (180 *  (Math.PI/180)) ?
                                                "end" : "start";
                                    }
                                })



                        //.on('mouseover', function (d) {
                        //    d3.select(this).attr("d", d3.svg.arc()
                        //                .innerRadius(innerRadius)
                        //                .outerRadius(outerRadius + 5));
                        //})
                        //.on('mouseout', function (d) {
                        //    d3.select(this).attr("d", d3.svg.arc()
                        //                .innerRadius(innerRadius)
                        //                .outerRadius(outerRadius));
                        //})
                //.on('mousemove', function () {
                //            console.log(d3.mouse(this))
                //        })

            //if height and width changes -> change the outer radius of the donut and grow the circle big
            //and set the svg width and height
            //scope.$watchGroup(['width', 'height'], function (newValues, oldValues, scope) {
            //    var newWidth = newValues[0];
            //    var newHeight = newValues[1];

            //    angular.element(elem[0]).height(newHeight)
            //    angular.element(elem[0]).width(newWidth)

            //    svgHeight = newHeight
            //    svgWidth = newWidth

            //    svgContainer.attr({
            //        height: svgHeight,
            //        width: svgWidth
            //    })


            //    if (scope.showLegend == "true") {
            //        circleDrawingAreaWidth = (0.90 * svgWidth) - margin.top - margin.bottom;
            //        legendYPosition = (0.10 * svgHeight);
            //    } else {
            //        circleDrawingAreaWidth = svgWidth;
            //    }

            //    circleDrawingAreaHeight = svgHeight;
                
            //    circleYPosition = circleDrawingAreaHeight / 2;
            //    circleXPostion = circleDrawingAreaWidth / 2;

                

            //    g.attr({
            //        transform:'translate(' + circleXPostion  + ', ' + circleYPosition + ')'
            //    })

            //    if (scope.showLegend == 'true') {
            //        legendG.attr({
            //            transform: 'translate(' + (circleDrawingAreaWidth - 30) + ', ' + legendYPosition + ')'
            //        })
            //    }
                

            //    var newOuterRadius = (Math.min(circleDrawingAreaHeight, circleDrawingAreaWidth) / 2) - 10

            //    path.transition().duration(750)
            //        .attrTween("d", arcRadiusTween(+newOuterRadius, +outerRadius, function (t) {
            //            arc.outerRadius(t)
            //        }))
            //})

            scope.$watch("showLegend", function (newVal, oldVal) {
                if (newVal == 'true') {
                    //move chart to left and give space for legend
                    legendDrawingAreaWidth = (25 / 100) * svgWidth
                    donutDrawingAreaWidth = ((75 / 100) * svgWidth) - labelArea
                    donutXPostion = donutXPostion - legendDrawingAreaWidth + labelArea
                    donutG.attr('transform', 'translate(' + donutXPostion + ', ' + donutYPosition + ')')
                    legendG.style('visibility', 'visible')
                } else {
                    if (angular.isDefined(legendG)) {
                        legendG.style('visibility', 'hidden')
                    }
                }
            })

            scope.$watch('innerRadius', function (newInnerRadius, oldInnerRadius) {
                if (+newInnerRadius !== +oldInnerRadius) {
                    path.transition().duration(500)
                        .attrTween("d", arcRadiusTween(+newInnerRadius, +oldInnerRadius, function (t) {
                            arc.innerRadius(t)
                        }))
                }
            })

            scope.$watch("showPopover", function(newVal, oldVal){
                if (newVal == "true") {
                    path.on('click', function (d, i) {
                            d3.event.stopPropagation();
                            //path projection
                            //d3.select(this).attr("d", d3.svg.arc()
                            //    .innerRadius(innerRadius)
                            //    .outerRadius(outerRadius + 5));
                            var xPosition = d3.mouse(this)[0]
                            var yPosition = d3.mouse(this)[1]
                            console.log(((svgHeight / 2) + yPosition))
                            console.log(((svgHeight / 2) + xPosition))
                            var popoverWidth = $('.app-popover').width();

                            //here 10px is arrow width
                            d3.select('.app-popover')
                                .style('display', 'block')
                                .style('top', ((donutDrawingAreaHeight / 2) + yPosition + labelArea - 5) + "px")
                                .style('left', (((donutDrawingAreaWidth) / 2) + xPosition + labelArea - (popoverWidth / 2) - 20) + "px")
                            d3.select('.app-popover .legend-label')
                              .html(d.value)
                        })
                    angular.element(document).on('click', function () {
                        angular.element('.app-popover').css('display', 'none')
                    })
                    angular.element('.app-popover').on('click', function (e) {
                        e.stopPropagation()
                    })
                } else {
                    svgContainer.selectAll('path.donut-path').on('click', null)
                    angular.element('.app-popover').css('display', 'none')
                }

            })

            scope.$watch("data", function (newVal, oldVal) {
                //arcs.value(function (d) {
                //    return srvc.getValue(d)
                //})
                //path = path.data(arcs(newVal))
                //path.transition().duration(750).attrTween("d", arcTween)
            })

            
            function arcRadiusTween(r1, r2, callFn) {
                //the below callback function will be called for each path in chart
                return function (data, idx) {
                    //interpolate
                    //generate range of value between new and old data and i() accepts a domain of [0,1]
                    //i(0) will be first value in interpolate - here r2
                    //i(1) will be second value in interpolate - here r1
                    var i = d3.interpolate(r2, r1)
                    //the below is timing call back funtion
                    return function (t) {
                        //t will varry from 0 to 1
                        //change the arc inner radius with transition timing t and interpolate i()
                        //generate the path for arc for data using the inner radius changed(new inner radius) arc()
                        callFn(i(t))
                        return arc(data);
                    };
                }
            }
            var legendOuterPadding= 10
            var legendG = svgContainer.append('g')
                                        .attr('transform', 'translate(' + (donutDrawingAreaWidth - labelArea + 10) + ',' + margin.top +  ')')
                                        .attr('class', 'legend')

            var y = d3.scale.ordinal()
                            .domain(scope.data.map(function (d) {
                                return d[scope.label]
                            }))
                            .rangeRoundBands([0, svgHeight])

                                
            var g2 = legendG.selectAll('g')
                            .data(scope.data)
                            .enter()
                            .append('g')
                            .attr('transform', function (d, i) {
                                return 'translate(0, ' + y(d[scope.label]) + ')'
                            })

            g2.append('circle')
                .attr('cx', 5)
                .attr('cy', 5)
                .attr('r', 5)
                .attr('fill', function (d, i) {
                    return colors[i]
                })
            g2.append('text')
                .text(function (d) {
                    return d[scope.value]
                })
                .attr('class', 'legend-label')
                .attr('x', 15)
                .attr('y', 2)
                .attr('dy', '0.65em')

            

            //var popSvg = container.append('svg')
            //                      .attr('width', 100)
            //                      .attr('height', 150)
            //                      .attr('transform', 'translate(0, 0)')
            //var popoverContext = popSvg.append('g')
            //                                 .attr('class', 'popover-context')

            //popoverContext.append('g')
            //              .append('rect')
            //              .attr('height', 50)
            //              .attr('width', 100)
            //              .attr('fill', '#eaf2f9')

            //popoverContext.append('g')
            //              .append('rect')
            //              .attr('height', 100)
            //              .attr('width', 100)
            //              .attr('transform', 'translate(0, 50)')


        }]
    }
})

.directive("appBarStackedChart", function () {
    return {
        restrict: 'A',
        scope: {
            data: '=barData',
            colors: '=barColors',

        },
        controller: ["$scope", "$element", "app.chart.service", function (scope, elem, chartSrvc) {
            var margin = { top: 20, right: 160, bottom: 35, left: 35 };
            var width = elem.width();
            var height = elem.height();
            var svgWidth = elem.width() + margin.left + margin.right;
            var svgHeight = elem.height() + margin.top + margin.bottom;

            var svg = d3.select(elem[0])
                          .append("svg")
                          .attr("width", svgWidth)
                          .attr("height", svgHeight)
                          .append("g")
                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var parse = d3.timeFormat("%Y").parse;

            var dataset = d3.stack().keys(["Desktop", "Laptop", "Mobile"])(scope.data)
                
            //    .map(function (fruit) {
            //    return scope.data.map(function (d) {
            //        return { x: d.year, y: +d[fruit] };
            //    });
            //}));
            var x = d3.scaleBand()
                      .rangeRound([10, width - 10])
                      .paddingInner(0.05)
                      .align(0.1)
                      .domain(scope.data.map(function (d) {
                          return d.year
                      }))

            var y = d3.scaleLinear()
                      .rangeRound([height, 0])
                      .domain([0,1000])

            var yAxis = d3.axisLeft()
                          .scale(y)
                          .ticks(10)
                          .tickSize(-width, 0, 0)
                          .tickFormat(function (d) { return d });

            var xAxis = d3.axisBottom()
                          .scale(x)
                          .tickFormat(function (d) { return d; });

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);


            var groups = svg.selectAll("g.cost")
                              .data(dataset)
                              .enter().append("g")
                              .attr("class", "cost")
                              .style("fill", function (d, i) {
                                  return scope.colors[i];
                              });

            var rect = groups.selectAll("rect")
                             .data(function (d) { return d; })
                             .enter()
                             .append("rect")
                             .attr("x", function (d) {
                                 return x(d.data.year);
                             })
                             .attr("y", function (d) {
                                 return y(d[1]);
                             })
                             .attr("height", function (d) {
                                 return y(d[0]) - y(d[1]);
                             })
                             .attr("width", x.bandwidth());

        }]
    }
})

.directive("appBarChart", function () {
    return {
        scope:{
            data: "=barData",
            xKey: '@barXKey',
            yKey: '@barYKey',
            colors:'=barColors'
        },
        controller: ["$element", "$scope", function (elem, scope) {

            var svgWidth = elem.width();
            var svgHeight = elem.height();
            var margin = { top: 20, right: 20, bottom: 30, left: 40 }

            var svgContainer = d3.select(elem[0])
                                    .append("svg")
                                    .attr("width", svgWidth)
                                    .attr("height", svgHeight)

            var elemHeight = elem.height(),
                elemWidth = elem.width();

            var width = svgWidth - margin.left - margin.right;
            var height = svgHeight - margin.top - margin.bottom;

            var xScale = d3.scale.ordinal()
                            .rangeRoundBands([0, width], 0.4)
                            .domain(scope.data.map(function (data, idx) {
                                return data[scope.xKey]
                            }))

            var yScale = d3.scale.linear()
                            .domain([0,d3.max(scope.data, function (d) {
                                return d[scope.yKey]
                            })])
                            .rangeRound([height, 0])

            

            console.log("x value " + xScale("0"))
            console.log("y value " + yScale("50"))
            console.log(xScale.rangeBand())

            var g = svgContainer.append('g')
                                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .tickFormat(function (d) {
                                return d + "%"
                            })
            //.axisBottom(xScale)

            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            //.tickSize(width)
            g.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(function (g) {
                            g.call(xAxis)
                             .attr('class', 'x-axis')
                            g.select('.domain').remove()
                            g.append('path')
                                .attr("d", "M0,3V0H" + width + "V3")
                                .attr('class', 'domain')
                                .attr('fill', 'white')
                            g.selectAll('.tick text')
                             .attr('fill', '#008dde')
                        })

            g.append('g')
             .call(function (g) {
                    g.call(yAxis)
                     .attr('class', 'bg-axis');

                    g.select('.domain').remove();
                    var ticks = g.selectAll('.tick');

                    ticks.select('text').remove();
                    ticks.select('line').remove();


                    var tickPath = ticks.append('path');

                    tickPath
                            .attr('d', function (d, i) {
                                if (i%5 == 0) {
                                    return "M0,2V0H" + svgWidth + "V2"
                                }
                                return "M0,1V0H" + width + "V1"
                            })
                            .attr('class', 'tick-line')
                        

//                     .select('text').remove()
  //                   .select('line').remove();
                    //g.select('.domain').remove();
                })

            var barsG = g.append('g')
                                 .attr('class', 'bars')

            var rectG = barsG.selectAll('g')
                            .data(scope.data)
                            .enter()
                            .append('g')

            rectG.append('rect')
             .attr('height', function (d) {
                 return height - yScale(d[scope.yKey])
             })
             .attr("x", function (d) {
                 return xScale(d[scope.xKey])
             })
             .attr("y", function (d) {
                 return yScale(d[scope.yKey])
             })
             .attr("width", xScale.rangeBand())
             .attr("fill", function (d, i) {
                 return scope.colors[i]
             })
             .attr('fill-opacity', '0.8')


        }]
    }
})

.directive("appLineChart", function () {
    return {
        restrict: "A",
        scope: {
            data : '=lineData'
        },
        controller: ["$scope", "$element", function (scope, elem) {

            var MARGINS = { top: 20, right: 20, bottom: 20, left: 50 }

            var svgContainer = d3.select(elem[0])
                                 .append('svg')
                                 .attr('width', 1000)
                                 .attr('height', 500)

            var color = ["steelblue", "green", "#f2b447"];

            xScale = d3.scale.linear()
                        .domain([2000, 2010])
                        .range([MARGINS.left, 1000 - MARGINS.right])

            yScale = d3.scale.linear()
                        .domain([10, 215])
                        .range([500 - MARGINS.top, MARGINS.bottom])

                                  xAxis = d3.svg.axis()
                                          .scale(xScale)
                                          .orient("bottom"),

                                  yAxis = d3.svg.axis()
                                          .scale(yScale)
                                          .orient("left");

            var lines = d3.svg.line()
                            .x(function (d) {
                                return xScale(d.year);
                            })
                            .y(function (d) {
                                return yScale(d.sale);
                            });

            //                svgContainer.append("svg:g")
            //                    .attr("transform", "translate(0," + (500 - MARGINS.bottom) + ")")
            //                    .call(xAxis);


            //svgContainer.append("svg:g")
            //                    .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            //                    .call(yAxis);

            for (var i = 0; i < scope.data.length ; i++) {
                svgContainer.append('svg:path')
                        .attr('d', lines(scope.data[i]))
                        .attr('stroke', color[i])
                        .attr('stroke-width', 2)
                        .attr('fill', 'none');
            }
            
        }]
    }
})

.directive("appLegend", function () {
    return {
        scope: {
            data:'=legendData',
            colors:'=legendColors'
        },
        restrict: "A",
        controller: ["$scope", "$element", function (scope, elem) {
            var margin = { top: 10, bottom: 10, left: 10, right: 10 }
            var containerWidth = 100
            var containerHeight = 90
            var svgWidth = containerWidth - margin.left - margin.right;
            var svgHeight = containerHeight - margin.top - margin.bottom;
            var legendWidth = 20

            var svgContainer = d3.select(elem[0])
                                .append("svg")
                                .attr('height', svgHeight)
                                .attr('width', svgWidth)

            var g = svgContainer.append('g')
                                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

            var legendG = g.selectAll('g')
                            .data(scope.data)
                            .enter()
                            .append('g')
                            .attr('transform',function(d, i){
                                return 'translate(0,'+ i * legendWidth + ')'
                            });

            legendG.append('text')
                    .text(function (d) {
                        return d
                    })
                    .attr('x', 15)
                    .attr('y', 2)
                    .attr('dy', '0.65em')

            legendG.append('circle')
                    .attr('cx', 5)
                    .attr('cy', 5)
                    .attr('r', 5)
                    .attr('fill', function (d, i) {
                        return scope.colors[i]
                    })
                            
                                
        }]
    }
})



//grouped chart with negative axis
.directive("appGrpBarChart", function () {
    return {
        restrict: "A",
        scope: {
            data: "=grpBarData",
            colors: '=grpBarColors',
            title: '@grpTitle'
        },
        controller: ["$scope","$element", function (scope, elem) {

            var svgWidth = elem.width();
            var svgHeight = elem.height();

            var margin = { top: 20, bottom: 20, right: 20, left: 300 }
            var svgContainer = d3.select(elem[0])
                                  .append('svg')
                                  .attr('height', svgHeight)
                                  .attr("width", svgWidth)
                                  .append('g')
                                  .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

            var width = svgWidth - margin.left - margin.right
            var height = svgHeight - margin.top - margin.bottom

            //keys except group title
            var keys = d3.keys(scope.data[0]).filter(function (key) {
                return key !== scope.title
            })

            console.log(keys)

            scope.data.forEach(function (d) {
                d.groupValues = keys.map(function (keyName) {
                    return { name: keyName, value: +d[keyName] }
                })
            })

            console.log(scope.data)

            var y0 = d3.scale.ordinal()
                        .domain(scope.data.map(function (d) {
                            return d[scope.title]
                        }))
                        .rangeRoundBands([0, height])

            var y1 = d3.scale.ordinal()
                        .domain(keys)
                        .rangeRoundBands([0, y0.rangeBand()], 0.3)

            var x = d3.scale.linear()
                        .domain([d3.min(scope.data, function (d) {
                            return d3.min(d.groupValues, function (d) {
                                return Math.min(0, d.value)
                            })
                        }), d3.max(scope.data, function (d) {
                            return d3.max(d.groupValues, function (d) {
                                return d.value
                            })
                        })])
                        .range([0, width])

            var categoryG = svgContainer.selectAll(".category")
                                .data(scope.data)
                                .enter()
                                .append('g')
                                .attr('class', 'category')
                                .attr('transform', function (d) {
                                    return 'translate(0, ' + y0(d[scope.title]) + ')'
                                })

            var g = categoryG.selectAll('rect')
                      .data(function (d) {
                          return d.groupValues
                      })
                      .enter()
                      .append('rect')
                      .attr('class', 'quarters')
                      .attr('y', function (d) {
                          return y1(d.name)
                      })
                      .attr('x', function (d) {
                          return x(Math.min(0, d.value));
                      })
                      .attr('height', y1.rangeBand())
                      .attr('width', function (d) {
                          return Math.abs(x(d.value) - x(0))
                      })
                      .attr('fill', function (d, i) {
                          return scope.colors[i]
                      })

            //categoryG.append('path')
            //            .attr('d', function (d, i) {
            //                if (i === quarterNames.length - 1) {
            //                    console.log("last " + y1(d.name))
            //                }
            //                return "M0,100.5H0V1H1113L0,100.5"
            //            })



            var xAxis = d3.svg.axis()
                          .scale(x)
                          .orient("top")

            var y0Axis = d3.svg.axis()
                            .scale(y0)
                            .orient("left")

            var y1Axis = d3.svg.axis()
                            .scale(y1)
                            .orient("left")

            var groupXAxis = d3.svg.axis()
                                .scale(x)
                                .orient("bottom")
                            
            //y axis for each group at x(0)
            categoryG.append('g')
                        .attr('class', 'y-axes')
                        .attr('transform', 'translate('+ x(0) + ', 0)')
                        .call(function (g) {
                            g.call(y1Axis)
                            g.selectAll('.tick').remove()
                            g.select('.domain').remove()
                            g.append('path')
                                .attr('class', 'domain')
                                .attr('d', 'M0 0H0V' + y0.rangeBand() + 'H0')
                        })

            //seperator line(axis) between each group
            categoryG.append('g')
                        .attr('transform', 'translate(0, ' + (y0.rangeBand() - 0.5) + ')')
                        .call(function (g) {
                            g.call(groupXAxis)
                            g.selectAll('.tick').remove();
                            g.select('.domain')
                                .attr('d', "M" + (0 - margin.left)  + ", 0.5 V0 H" + width + "V0.5")
                        })
            //group y-axis
            categoryG.append('g')
                        .attr('class', 'label-y-axis')
                        .attr('transform', 'translate(-20, 0)')
                        .call(function (g) {
                            g.call(y1Axis)
                            g.select('.domain')
                                .attr('d', 'M0 0H0V' + y0.rangeBand() + 'H0')
                            g.selectAll('.tick')
                                .attr('transform', function (text) {
                                    return 'translate(-20,' + (y1(text) + y1.rangeBand()/2) + ')'
                                })
                            
                        })

            //x-axis
            svgContainer.append('g')
                        .call(function (g) {
                            g.call(xAxis)
                             .attr('class', 'x-axis')
                            g.select('.domain')
                                .attr('d', 'M' + (0 - margin.left)  + ',-1V0H' + width + 'V-1')
                            g.selectAll('.tick line')
                                .style('stroke', 'black')
                        })

            svgContainer.append('g')
                        .call(function (g) {
                            g.call(y0Axis)
                            g.attr('class', 'y-title-axis')
                                .attr('transform', 'translate(-100, 0)')

                            g.select('.domain')
                                .remove();
                        })

            console.log(y0.domain())
            console.log(y1.domain())
            console.log(x.domain())
            console.log(y0.rangeBand())

            
        }]
    }
})

.directive("appMoreGrpBarChart", ["app.wrap.service", function (wrapSrcv) {
    return {
        restrict:"A",
        scope: {
            data: '=groupData',
            groupTitle: '@groupTitle',
            hideYAxes: '@hideYAxes',
            colors: '=groupBarColors'
        },
        controller: ["$scope", "$element", "$log", function (scope, elem, log) {

            var svgWidth = elem.width();
            var svgHeight = elem.height();
            var barPadding = 0.2;
            var margin = { top: 20, bottom: 20, right: 0, left: 0 }

            //since we're changing the scope value inside directive make sure you change the copy value not the actual reference
            //but if you want the update the scope from inside the directive you have to update on actual reference $scope
            var scopeData = angular.copy(scope.data)

            if (scope.hideYAxes == 'true') {
                margin.left = 300
            }

            var svgContainer = d3.select(elem[0])
                                  .append('svg')
                                  .attr('height', svgHeight)
                                  .attr("width", svgWidth)
                                  .append('g')
                                  .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

            var width = svgWidth - margin.left - margin.right
            var height = svgHeight - margin.top - margin.bottom

            log.log("width - " + width)
            log.log("height - " + height)

            var y0 = d3.scale.ordinal()
                        .domain(scopeData.map(function (data) {
                            return data[scope.groupTitle]
                        }))
                        .rangeRoundBands([0, height])
            log.log("y0 domain - " + y0.domain())
            scopeData.forEach(function (d) {
                console.log("y0 value - " + y0(d[scope.groupTitle]))
            })

            var y0Axis = d3.svg.axis()
                            .scale(y0)
                            .orient("left")

            var keys = d3.keys(scopeData[0]).filter(function (key) {
                return key != scope.groupTitle
            })
            log.log("keys - " + keys)
            var y1 = d3.scale.ordinal()
                        .domain(keys)
                        .rangeRoundBands([0, y0.rangeBand()])
            log.log("y1 domain - " + y1.domain())
            keys.forEach(function (key) {
                log.log("y1 value - " + y1(key))
            })
            var y1Axis = d3.svg.axis()
                            .scale(y1)
                            .orient("left")

            var innerKeys = d3.keys(scopeData[0][keys[0]])
            log.log("inner keys - " + innerKeys)
            var y2 = d3.scale.ordinal()
                        .domain(innerKeys)
                        .rangeRoundBands([0, y1.rangeBand()], barPadding)
            log.log('y2 domain - ' + y2.domain())
            innerKeys.forEach(function (key) {
                log.log("y2 value - " + y2(key))
            })
            var y2Axis = d3.svg.axis()
                            .scale(y2)
                            .orient("left")

            scopeData.forEach(function (data, index) {
                keys.forEach(function (key) {
                    data[key].groupValues = innerKeys.map(function (innerKey) {
                        return { name: innerKey, value: +data[key][innerKey] }
                    })
                })
            })

            scopeData.forEach(function (data) {
                data.headerValues = keys.map(function (key) {
                    return {name:key, groupValues:data[key].groupValues}
                })
            })



            log.log(scopeData)

            var maxArr = [];
            var minArr = [];

            scopeData.forEach(function (scopeData, i) {
                keys.forEach(function (key) {
                   var min =  d3.min([scopeData[key]], function (data) {
                        return d3.min(data.groupValues, function (d) {
                            return d.value
                        })
                   })
                    minArr.push(min)
                })
            })

            scopeData.forEach(function (scopeData, i) {
                keys.forEach(function (key) {
                    var max = d3.max([scopeData[key]], function (data) {
                        return d3.max(data.groupValues, function (d) {
                            return d.value
                        })
                    })
                    maxArr.push(max)
                })
            })

            var x = d3.scale.linear()
                        .domain([
                            d3.min(minArr, function(d){
                                return Math.min(0, d) 
                            }),
                            d3.max(maxArr)
                        ])
                        .range([0, width])

            var xAxis = d3.svg.axis()
                            .scale(x)
                            .orient("bottom")

            log.log("x domian : " + x.domain())
            scopeData.forEach(function (data) {
                keys.forEach(function (key) {
                    innerKeys.forEach(function (inner) {
                        log.log("x value for: " + data[key][inner]+ " - " +  x(data[key][inner]) + " width")
                    })
                })
            })

            var headerGroup1 = svgContainer.selectAll('.header-1-group')
                                            .data(scopeData)
                                            .enter()
                                            .append('g')
                                            .attr('class', 'header-1-group')
                                            .attr('transform', function (d) { return 'translate(0, ' +y0(d[scope.groupTitle]) + ')' })


            var headerGroup2 = headerGroup1.selectAll('.header-2-group')
                                            .data(function (d, i) {
                                                return d.headerValues
                                            })
                                            .enter()
                                            .append('g')
                                            .attr('class', function (d, i) {
                                                return (i == (keys.length - 1)) ? 'header-2-group last' : 'header-2-group'
                                            })
                                            .attr('transform', function (d) { return 'translate(0, ' + y1(d.name) + ')' })

            headerGroup2.selectAll('rect')
                                .data(function (d, i) {
                                    return d.groupValues
                                })
                                .enter()
                                .append('rect')
                                .attr('x', function (d) { return x(Math.min(0, d.value)) })
                                .attr('y', function (d) { return y2(d.name) })
                                .attr('height', function (d) { return y2.rangeBand() })
                                .attr('width', function (d) { return Math.abs(x(d.value) - x(0)) })
                                .attr('fill', function (d, i) { return scope.colors[i] })
            //axes

            //center - y - axis
            svgContainer.append('g')
            .call(function (g) {
                g.call(y0Axis)
                 .attr('transform', 'translate(' + x(0) + ', 0)')
                 .attr('class', 'center-axis')
                g.selectAll('.tick > text').remove()
                g.select('.domain')
                    .attr('d', 'M0, 0H0V' + height + 'H0')
            })

            //x - axis
            svgContainer.append('g')
                        .call(function (g) {
                            g.call(xAxis)
                                .attr('transform', 'translate(0,' + height + ')')
                                .attr('class', 'x-axis')
                             g.select('.domain').remove()
                        })

            if (scope.hideYAxes == 'true') {
                //y0 - axis
                //svgContainer.append('g')
                //            .call(function (g) {
                //                g.call(y0Axis)
                //                    .attr('class', 'header-y-axis-1')
                //                    .attr('transform', function (d) {
                //                        console.log(d)
                //                        return 'translate(-200, 0)'
                //                    })
                //                g.select('.domain')
                //                    .remove();
                                
                //            })

                wrapSrcv.wrapBoxWidth = 150;
                wrapSrcv.wrapBoxHeight = y0.rangeBand();

                headerGroup1.append('g')
                            .attr({
                                transform:'translate(' + (0 - margin.left) + ' ,11)'
                            })
                            .append('text').text(function (d) { return d.title })
                            .call(wrapSrcv.wrapText)
                            
                            //.append('rect')
                            //.attr({
                            //    x: function (d) {
                            //        console.log(`group 1 title -  ${d.title}`)
                            //        return 0
                            //    },
                            //    y: 0,
                            //    width: 150,
                            //    height: y0.rangeBand(),
                            //    fill:'none'
                            //})

                //y1 - axis
                headerGroup1.append('g')
                            .call(function (g) {
                                g.call(y1Axis)
                                    .attr('class', 'header-y-axis-2')
                                    .attr('transform', 'translate(-65, 0)')
                                g.selectAll('.tick')
                                    .attr('transform', function (d) {
                                        console.log(d)
                                        return 'translate(0, ' + (y1(d) + 10) + ')'
                                    })
                                g.select('.domain')
                                    .remove()
                            })

                //y2 - axis
                headerGroup2.append('g')
                            .call(function (g) {
                                g.call(y2Axis)
                                    .attr('class', 'header-y-axis-3')
                                g.select('.domain').remove()
                            })
            }

            //seperator line

            var verticalSeperator = d3.select('g')
            
            
            headerGroup1.append('g')
                        .attr('class', 'separator-line')
                        .attr('transform', 'translate(-300, ' + y0.rangeBand() + ')')
                        .append('path')
                        .attr('d', 'M0, 0V0H' + (width + 300) + 'V0')

            headerGroup2.append('g')
                        .attr('class', 'separator-line')
                        .attr('transform', 'translate(-150, ' + y1.rangeBand() + ')')
                        .append('path')
                        .attr('d', 'M0, 0V0H' + (width + 150) + 'V0')

            d3.selectAll('.header-2-group.last > .separator-line')
                        .remove()

            svgContainer.append('g')
                        .attr('class', 'vertical-separator group-2')
                        .append('path')
                        .attr('d', 'M0, 0H0V' + height + 'H0')
            svgContainer.append('g')
                        .attr('class', 'separator-line')
                        .attr('transform', 'translate(-300, 0)')
                        .append('path')
                        .attr('d', 'M0, 0V0H' + (width + 300) + 'V0')
        }]
    }
}])

.directive("appSingleGrpBarChart", ["app.wrap.service", "app.chart.service", function (wrapSrcv, chartSrvc) {
    return {
        restrict: "A",
        scope: {
            data: '=groupData',
            groupTitle: '@groupTitle',
            sectorTitle:'@sectorTitle',
            hideYAxes: '@hideYAxes',
            colors: '=groupBarColors'
        },
        controller: ["$scope", "$element", "$log", function (scope, elem, log) {

            var svgWidth = elem.width();
            var svgHeight = elem.height();
            var barPadding = 0.2;
            var margin = { top: 20, bottom: 20, right: 0, left: 0 }

            //since we're changing the scope value inside directive make sure you change the copy value not the actual reference
            //but if you want the update the scope from inside the directive you have to update on actual reference $scope
            var scopeData = angular.copy(scope.data)

            if (scope.hideYAxes == 'true') {
                margin.left = 300
            }

            var svgContainer = d3.select(elem[0])
                                  .append('svg')
                                  .attr('height', svgHeight)
                                  .attr("width", svgWidth)
                                  .append('g')
                                  .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

            var width = svgWidth - margin.left - margin.right
            var height = svgHeight - margin.top - margin.bottom

            log.log("width - " + width)
            log.log("height - " + height)

            ////keys ----------------------------------
            //var firstData = scopeData[0]['sectorValues'][0]
            ////350, 300
            //var secondLevelYKeys = d3.keys(firstData).filter(function (key) {
            //    return key != 'title'
            //})
            ////2014-Q1, 2015-Q2...
            //var thirdLevelYKeys = d3.keys(firstData[secondLevelYKeys[0]]).filter(function (key) {
            //    return key != 'title'
            //})
            //console.log(`First level y keys [${secondLevelYKeys}]`)
            //console.log(`Second level Y keys [${thirdLevelYKeys}]`)
            //------------------------------------------

            //First level x axis --------------------------
            var x1 = d3.scale.ordinal()
                        .domain(scopeData.map(function (data) {
                            return data['sector']
                        }))
                        .rangeRoundBands([0, width], 0.1)
            var x1Axis = d3.svg.axis()
                            .scale(x1)
                            .orient("top")

            var x1NoPad = d3.scale.ordinal()
            .domain(scopeData.map(function (data) {
                return data['sector']
            }))
            .rangeRoundBands([0, width])
            var x1AxisNoPad = d3.svg.axis()
                            .scale(x1)
                            .orient("top")

            console.log('x1 domain [' + x1.domain() + ']')
            //------------------------------------------

            //Second Level x axis ----------------------------
            var minArr = [];
            var maxArr = [];

            scopeData.forEach(function (scopeData) {
                scopeData['sectorValues'].forEach(function (sectorValue) {
                    sectorValue['titleValues'].forEach(function (titleValue) {
                        var min = d3.min(titleValue['rijValues'], function (rijValue) {
                            return +rijValue['value']
                        })
                        minArr.push(min)
                    })
                })
            })

            scopeData.forEach(function (scopeData) {
                scopeData['sectorValues'].forEach(function (sectorValue) {
                    sectorValue['titleValues'].forEach(function (titleValue) {
                        var max = d3.max(titleValue['rijValues'], function (rijValue) {
                            return +rijValue['value']
                        })
                        maxArr.push(max)
                    })
                })
            })

            var x2 = d3.scale.linear()
                        .domain([
                            d3.min(minArr, function (d) {
                                return Math.min(0, d)
                            }),
                            d3.max(maxArr)
                        ])
                        .range([0, x1.rangeBand()])
            console.log('x2 domain [' + x2.domain() + ']')
            var x2Axis = d3.svg.axis()
                            .scale(x2)
                            .orient("bottom")

            //------------------------------------------------

            //scales are based on first data
            //First level y axis --------------------------
            var firstLevelDataArr = scopeData[0]['sectorValues']
            var y1 = d3.scale.ordinal()
                        .domain(firstLevelDataArr.map(function (data) {
                            return data['title']
                        }))
                        .rangeRoundBands([0, height])
            var y1Axis = d3.svg.axis()
                            .scale(y1)
                            .orient("left")
            console.log('y1 domain [' + y1.domain() + ']')
            //-------------------------------------------

            
            //Second Level Y Axis -----------------------
            var secondLevelDataArr = scopeData[0]['sectorValues'][0]['titleValues']
            var y2 = d3.scale.ordinal()
                        .domain(secondLevelDataArr.map(function (data) {
                            return data['rij']
                        }))
                        .rangeRoundBands([0, y1.rangeBand()])

            var y2Axis = d3.svg.axis()
                            .scale(y2)
                            .orient('left')
            console.log('y2 domain [' + y2.domain() + ']')
            //-------------------------------------------

            //Third Level Y Axis-------------------------
            var thirdLevelDataArr = scopeData[0]['sectorValues'][0]['titleValues'][0]['rijValues']
            var y3 = d3.scale.ordinal()
                        .domain(thirdLevelDataArr.map(function (data) {
                            return data['quarter']
                        }))
                        .rangeRoundBands([0, y2.rangeBand()], 0.1)

            var y3Axis = d3.svg.axis()
                            .scale(y3)
                            .orient('left')
            console.log('y3 domain [' + y3.domain() + ']')
            //-------------------------------------------

            //console.log(scopeData)
            var xGroup1 = svgContainer.selectAll('g')
                                        .data(scopeData)
                                        .enter()
                                        .append('g')
                                        .attr({
                                            transform: function (d) { return 'translate(' + x1(d['sector']) + ', 0)' },
                                            'class':'x-group1'
                                        })

            var yGroup1 = xGroup1.selectAll('g')
                                  .data(function (d) {
                                      return d['sectorValues']
                                  })
                                  .enter()
                                  .append('g')
                                  .attr({
                                      transform: function (d) { return 'translate(0, ' + y1(d['title']) + ')' },
                                      'class':'y-group1'
                                  })

            var yGroup2 = yGroup1.selectAll('g')
                                 .data(function (d, i) {
                                     return d['titleValues']
                                 })
                                .enter()
                                .append('g')
                                .attr({
                                    transform: function (d) { return 'translate(0,' + y2(d['rij']) + ')' },
                                    'class': 'y-group2'
                                })

            yGroup2.selectAll('rect')
                                 .data(function (d, i) {
                                     return d['rijValues']
                                 })
                                .enter()
                                .append('rect')
                                .attr({
                                    x: function (d) { return x2(Math.min(0, +d['value'])) },
                                    y: function (d) { return y3(d['quarter']) },
                                    'class': 'y-bar',
                                    height: y3.rangeBand(),
                                    width: function (d) { return Math.abs( x2(+d['value']) - x2(0)) },
                                    fill: function (d, i) { return scope.colors[i] }
                                })

            //axes
            //center - y - axis - group 2
            xGroup1.append('g')
                    .call(function (g) {
                        g.call(y1Axis)
                            .attr({
                                transform: 'translate(' + x2(0) + ', 0)',
                                'class': 'x-group1-axis center-axis y-axis'
                            })
                        g.selectAll('.tick > text').remove()
                        g.select('.domain')
                            .attr('d', chartSrvc.verticalPath(height))
                    })

            xGroup1.append('g')
                    .call(function (g) {
                        g.call(y1Axis)
                            .attr({
                                transform: 'translate(' +( x1.rangeBand() + 15) + ', 0)',
                                'class': 'x-group1-axis center-axis y-axis'
                            })
                        g.selectAll('.tick > text').remove()
                        g.select('.domain')
                            .attr('d', chartSrvc.verticalPath(height))
                    })

            //x - axis bottom - group 2
            xGroup1.append('g')
                    .call(function (g) {
                        g.call(x2Axis)
                            .attr({
                                transform: 'translate(0, ' + height + ')',
                                'class':'x-axis bottom-axis x-group2-axis'
                            })
                       g.select('.domain').remove()
                    })

            //x- axis top - group 1
            svgContainer.append('g')
                        .call(function (g) {
                            g.call(x1Axis)
                                .attr({
                                    'class': 'x-axis top-axis x-group1-axis'
                                })
                            g.select('.domain')
                                .attr('d', chartSrvc.horizontalPath(width))
                        })

            //y-axis mid separator
            //yGroup2.append('g')
            //        .call(function (g) {
            //            g.call(x1Axis)
            //                .attr({
            //                    'transform': 'translate(0,' + y1.rangeBand() + ')',
            //                    'class':'sample'
            //                })
            //            g.selectAll('.tick > text').remove()
            //            g.select('.domain')
            //                .attr('d', chartSrvc.horizontalPath(y2.rangeBand() + 1))
            //        })

            yGroup2.append('g')
                    .call(function (g) {
                        g.call(x1Axis)
                            .attr({
                                'transform': 'translate(0,' + y2.rangeBand() + ')'
                            })
                        g.selectAll('.tick').remove()
                        g.select('.domain')
                            .attr('d', function(d){
                                console.log(d)
                                return chartSrvc.horizontalPath(x1NoPad.rangeBand())
                            })
                    })
           


            //groups for left axes
            var leftAxesGroup1 = svgContainer.selectAll('.left-axis-group1')
                                            .data(firstLevelDataArr)
                                            .enter()
                                            .append('g')
                                            .attr('class', 'left-axis-group1')
                                            .attr('transform', function (d) {
                                                //console.log(d)
                                                return "translate(0, " + y1(d['title']) + ')'
                                            })

            var leftAxesGroup2 = leftAxesGroup1.selectAll('.left-axis-group2')
                                                .data(function (d) {
                                                    return d['titleValues']
                                                })
                                                .enter()
                                                .append('g')
                                                .attr('class', 'left-axis-group2')
                                                .attr('transform', function (d) {
                                                   // console.log(d)
                                                    return "translate(0, " + y2(d['rij']) + ')'
                                                })

            //left axis - 3rd level axis
            leftAxesGroup2.append('g')
                            .call(function (g) {
                                g.call(y3Axis)
                                    g.select('.domain')
                                    .attr('d', function(d){
                                        console.log(d)
                                        return chartSrvc.verticalPath(y2.rangeBand() + 1)
                                    })
                            })


            //left axis 2-nd level axis
            leftAxesGroup1.append('g')
                            .call(function (g) {
                                g.call(y2Axis)
                                    .attr('transform', 'translate(-100, 0)')
                                g.select('.domain')
                                    .remove()
                            })

            //left axis 1-st level axis

            svgContainer.append('g')
                        .call(function (g) {
                            g.call(y1Axis)
                                .attr('transform', 'translate(-200, 0)')
                            g.select('.domain')
                                .attr('d', chartSrvc.verticalPath(height))
                        })

            svgContainer.append('g')
                        .attr('class', 'separator-line')
                        .attr('transform', 'translate(-300, 0)')
                        .append('path')
                        .attr('d', 'M0, 0V0H' + margin.left + 'V0')

            svgContainer.append('g')
                                    .attr('class', 'separator-line')
                                    .attr('transform', 'translate(-300, '+height + ')')
                                    .append('path')
                                    .attr('d', 'M0, 0V0H' + margin.left + 100 + 'V0')




            //left axes y
            //svgContainer.append('g')
            //            .attr({
            //                transform:'translate(-100'
            //            })
                        
            //based on first data draw the left y axes text
            //firstLevelDataArr.forEach(function (firstLevelData) {
            //    var axisGroup1 = svgContainer.append('g')
            //                        .attr({
            //                            'transform': 'translate(0,' + y1(firstLevelData['title']) + ')'
            //                        })
            //    secondLevelDataArr.forEach(function (secondLevelData) {
            //        axisGroup1.append('g')
            //                            .attr({
            //                                'transform': 'translate(0,' + y2(secondLevelData['rij']) + ')'
            //                            })
            //                    .call(function (g) {
            //                        g.call(y3Axis)
            //                        g.select('.domain')
            //                            .attr('d', chartSrvc.verticalPath(y2.rangeBand() + 1))
            //                    })

            //    })
            //})


           



            //svgContainer.append('g')
            //            .call(function (g) {
            //                g.call(x1Axis)
            //                    .attr({
            //                        'class': 'x-axis bottom-axis'
            //                    })
            //                g.select('.domain')
            //                    .attr('d', 'M0, 0V0H' + width + 'V0')
            //            })

            ////x - axis
            //svgContainer.append('g')
            //            .call(function (g) {
            //                g.call(xAxis)
            //                    .attr('transform', 'translate(0,' + height + ')')
            //                    .attr('class', 'x-axis')
            //                g.select('.domain').remove()
            //            })

            //if (scope.hideYAxes == 'true') {
            //    //y0 - axis
            //    //svgContainer.append('g')
            //    //            .call(function (g) {
            //    //                g.call(y0Axis)
            //    //                    .attr('class', 'header-y-axis-1')
            //    //                    .attr('transform', function (d) {
            //    //                        console.log(d)
            //    //                        return 'translate(-200, 0)'
            //    //                    })
            //    //                g.select('.domain')
            //    //                    .remove();

            //    //            })

            //    wrapSrcv.wrapBoxWidth = 150;
            //    wrapSrcv.wrapBoxHeight = y0.rangeBand();

            //    headerGroup1.append('g')
            //                .attr({
            //                    transform: 'translate(' + (0 - margin.left) + ' ,11)'
            //                })
            //                .append('text').text(function (d) { return d.title })
            //                .call(wrapSrcv.wrapText)

            //    //.append('rect')
            //    //.attr({
            //    //    x: function (d) {
            //    //        console.log(`group 1 title -  ${d.title}`)
            //    //        return 0
            //    //    },
            //    //    y: 0,
            //    //    width: 150,
            //    //    height: y0.rangeBand(),
            //    //    fill:'none'
            //    //})

            //    //y1 - axis
            //    headerGroup1.append('g')
            //                .call(function (g) {
            //                    g.call(y1Axis)
            //                        .attr('class', 'header-y-axis-2')
            //                        .attr('transform', 'translate(-65, 0)')
            //                    g.selectAll('.tick')
            //                        .attr('transform', function (d) {
            //                            console.log(d)
            //                            return 'translate(0, ' + (y1(d) + 10) + ')'
            //                        })
            //                    g.select('.domain')
            //                        .remove()
            //                })

            //    //y2 - axis
            //    headerGroup2.append('g')
            //                .call(function (g) {
            //                    g.call(y2Axis)
            //                        .attr('class', 'header-y-axis-3')
            //                    g.select('.domain').remove()
            //                })
            //}

            ////seperator line

            //var verticalSeperator = d3.select('g')


            //headerGroup1.append('g')
            //            .attr('class', 'separator-line')
            //            .attr('transform', 'translate(-300, ' + y0.rangeBand() + ')')
            //            .append('path')
            //            .attr('d', 'M0, 0V0H' + (width + 300) + 'V0')

            //headerGroup2.append('g')
            //            .attr('class', 'separator-line')
            //            .attr('transform', 'translate(-150, ' + y1.rangeBand() + ')')
            //            .append('path')
            //            .attr('d', 'M0, 0V0H' + (width + 150) + 'V0')

            //d3.selectAll('.header-2-group.last > .separator-line')
            //            .remove()

            //svgContainer.append('g')
            //            .attr('class', 'vertical-separator group-2')
            //            .append('path')
            //            .attr('d', 'M0, 0H0V' + height + 'H0')
            //svgContainer.append('g')
            //            .attr('class', 'separator-line')
            //            .attr('transform', 'translate(-300, 0)')
            //            .append('path')
            //            .attr('d', 'M0, 0V0H' + (width + 300) + 'V0')
        }]
    }
}])



//app.directive('lineCharts', function () {
//    return {
//        scope: {
//            chartData: '=',
//            clickArc: '&onClickarc'
//        },
//        link: function (scope, element, attrs) {
//            var directiveId = 'radarChart' + new Date().valueOf() + Math.random().toFixed(16).substring(10);

//            angular.element(element).find('.chart').attr('id', directiveId)
//            refreshDirective();

//            //scope.$watch('chartData', function (newVal, oldVal) {
//            //    refreshDirective();
//            //}, true);

//            //scope.clickArc = function (d) {
//            //	alert(d.data);
//            //}

//            function refreshDirective() {
//                if (scope.chartData)
//                    drawBarChart(scope.chartData, directiveId);
//            }
//            function drawBarChart(chartdata, directiveId) {

//                var data = [[{ "sale": "202", "year": "2000" }, { "sale": "215", "year": "2001" }, { "sale": "179", "year": "2002" }, {
//                    "sale": "199", "year": "2003"
//                }, { "sale": "134", "year": "2003" }, { "sale": "176", "year": "2010" }],

//                [{ "sale": "20", "year": "2000" }, { "sale": "25", "year": "2001" }, { "sale": "179", "year": "2002" }, {
//                    "sale": "197", "year": "2003"
//                }, { "sale": "144", "year": "2003" }, { "sale": "136", "year": "2010" }]

//                ];

//                var color = ["steelblue", "green", "#f2b447"];

//                var vis = d3.select("#" + directiveId)
//                    .append("svg")
//                    .attr("width", 1000)
//                    .attr("height", 500);

//                var   WIDTH = 1000,
//                      HEIGHT = 500,
//                      MARGINS = { top: 20, right: 20, bottom: 20, left: 50 },
//                      xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([2000, 2010]),
//                      yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([10, 215]),

//                      xAxis = d3.svg.axis()
//                              .scale(xScale)
//                              .orient("bottom"),

//                      yAxis = d3.svg.axis()
//                              .scale(yScale)
//                              .orient("left");

//                vis.append("svg:g")
//                    .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
//                    .call(xAxis);


//                vis.append("svg:g")
//                    .attr("transform", "translate(" + (MARGINS.left) + ",0)")
//                    .call(yAxis);

//                var lineGen = d3.svg.line()
//                              .x(function (d) {
//                                  return xScale(d.year);
//                              })
//                              .y(function (d) {
//                                  return yScale(d.sale);
//                              });

//                for (var i = 0; i < data.length ; i++) {
//                    vis.append('svg:path')
//                          .attr('d', lineGen(data[i]))
//                          .attr('stroke', color[i])
//                          .attr('stroke-width', 2)
//                          .attr('fill', 'none');
//                }


//            }
//        }
//    };
//});