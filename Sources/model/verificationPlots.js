/**
 *
 * Copyright 2014, MicroStep-MIS spol. s r.o. (www.microstep-mis.com)
 * All rights reserved.
 *
 * This program/code is the exclusive and proprietary property of 
 * MicroStep-MIS. 
 * Any unauthorized use, reproduction or modification of this program/code 
 * without the prior written consent of MicroStep-MIS is strictly prohibited. 
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: verificationPlots.js,v 1.21 2014/11/25 12:53:04 marekru Exp $
 *
 */ 

function $(x) { return document.getElementById(x); } 


// TODO samostatny file pre kazdy plot a  potom zvlast vizualizacne vecicky :)
// TODO nastavenia scatterplotu - pojde vacsinou o vseobecne nastavania grafov, to bude bud v visConfigu alebo niekde samostatne inde
// TODO kontrola dat, ci su dobre
// TODO interaktivita
// TODO ak existuje ID, tak nevytvarat SVG
// TODO param boolean ci appendovat do svg alebo prepisat cele
// TODO posielat balik parametrov (id, data, offset, width, height, overwrite, palette, ...)
// TODO moznost nalepit 1 plot na 2. plot
// TODO class a ID constanty!
// TODO "bottom" / "left" ako constanty
// TODO zbavit sa magie s cislami
// TODO HTML tooltip koli formatovaniu textu
// TODO metoda na pridavanie tooltipu ???
// TODO multiline tooltip
// TODO inak offset pri vykreslovani


// TODO -> vid hore comentar
function scatterPlot(id, data, horizontal){
	if(horizontal){
		scatterPlotH(id, data);
	}else{
		scatterPlotV(id, data);
	}
}


// TODO -> vid hore comentar
function scatterPlotH(id, data){
	var width = 1200;
	var height = 600;
	var radius = 4;
	var offset = 27 + radius;
	var xLabel = "";
	var yLabel = "";
	
	
	var svg = d3.select("#" + id)
				.append("svg")
				.attr("width", width)
				.attr("height", height);
				
				

	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	

	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	

				
	var yScale = d3.scale.linear()
						 .domain([0,data.length - 1])
						 .range([height - offset, offset]);
	
	var xScale = d3.scale.linear()
						 .domain([minX,maxX])
						 .range([offset, width - offset]);
						 
																						 
	var xAxis = addAxis(svg, 0 , height - offset + 8, xScale, "bottom", xLabel, 10);																					
	var yAxis = addAxis(svg, offset - 8, 0, yScale, "left", yLabel, data.length, every2nd );
	
	addGrid(svg, offset - 6, 0, width - offset, yAxis);
	addGrid(svg, 0, height - offset + 8, height - offset, xAxis);					 					 
						 
	var groups = svg.selectAll(".group")
					.data(data)
					.enter()
					.append("svg:g")
					.classed("group", true)
					.attr("transform", 
						function(d,i){
							return "translate(0, " + (yScale(i)) + ")";
						} );
	
	groups.selectAll("circle")
			.data( function(d){ return d; })
			.enter()			
			.append("circle")
			.attr("cy", 0)
			.attr("cx", function(d){ return xScale(d); })
			.attr("r", radius)
			
	svg.append("svg:g")
		.classed("mean", true)
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cy", function(d, i){ return yScale(i);})
		.attr("cx", function(d){ return xScale( d3.mean(d)); })
		.attr("r", radius - 1)
	  
}


// TODO -> vid hore comentar
function scatterPlotV(id, data){
	var width = 1200;
	var height = 600;
	var radius = 4;
	var offset = 27 + radius;
	var xLabel = "";
	var yLabel = "";
	
	
	var svg = d3.select("#" + id)
				.append("svg")
				.attr("width", width)
				.attr("height", height);
				
				

	var minY = d3.min(data, function(array) {
		return d3.min(array);
	});	

	var maxY = d3.max(data, function(array) {
		return d3.max(array);
	});	

				
	var xScale = d3.scale.linear()
						 .domain([0,data.length - 1])
						 .range([offset, width - offset]);
	
	var yScale = d3.scale.linear()
						 .domain([minY,maxY])
						 .range([height - offset, offset]);
						 
	var xAxis = addAxis(svg, 0, height - offset + 8, xScale, "bottom", xLabel, data.length, every2nd );
																						 
	var yAxis = addAxis(svg, offset - 8, 0, yScale, "left", yLabel, 5);																					
	 
	addGrid(svg, offset - 6, 0, width - offset, yAxis);
	addGrid(svg, 0, height - offset + 8, height - offset, xAxis);			 					 
						 
	var groups = svg.selectAll(".group")
					.data(data)
					.enter()
					.append("svg:g")
					.classed("group", true)
					.attr("transform", 
						function(d,i){
							return "translate(" + (xScale(i)) + ",0)";
						} );
	
	groups.selectAll("circle")
			.data( function(d){ return d; })
			.enter()			
			.append("circle")
			.attr("cx", 0)
			.attr("cy", function(d){ return yScale(d); })
			.attr("r", radius)
			
	svg.append("svg:g")
		.classed("mean", true)
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d, i){ return xScale(i);})
		.attr("cy", function(d){ return yScale( d3.mean(d)); })
		.attr("r", radius)
	  
}

function barPlot(el, data, width, height, toolTipDir, color, bgColor, vertical, flip, unit){
	
	var g = el.append("g")
			  .classed(CLASS_BAR, true); 
	
	var label = "RMSE year " + ( (unit) ? unit : "" ) ;
	
	if(vertical){
	
	}else{
		g.append("text")
		 .attr("x", 0)
		 .attr("y", height + 10)
		 .text(label);
	}
	// TODO: label niekde rozumne umiestnit -  pravdepodobne bude prilis dlhy, abys me ho umiestnili vedla plotu!
	

	if(bgColor){
		g.append("rect")
		 .attr("x", 0)
		 .attr("y", 0)
		 .attr("width", width)
		 .attr("height", height + 0.5)
		 .attr("fill", colorToString(bgColor));
	} 
	
	var bars = addBars(g, data, width, height, color, vertical, null, null, 1.0, 1, flip);
	bars.element = g;
	
	if(vertical){
		var tt = new ToolTip("Values", g, toolTipDir);	
		tt.addLine("Month", bars, displayPlotMonth);	
		tt.addLine(label, bars, displayPlotValueY);	
		tt.createEventListeners();
	}else{
		var tt = new ToolTip("Values", g, toolTipDir);	
		tt.addLine("Hour", bars, displayPlotHour);	
		tt.addLine(label, bars, displayPlotValue);	
		tt.createEventListeners();
	}	
	
	return bars;
}


function multiLinePlot(el, data, width, height, interpolation, colors, unit, multiScale){
	if(multiScale){
		return multiLinePlotMultiScale(el, data, width, height, interpolation, colors);
	}else{
		return multiLinePlotOneScale(el, data, width, height, interpolation, colors, unit);
	}
}

function multiLinePlotMultiScale(el, data, width, height, interpolation, colors){
	
	var xMax = Number.MIN_VALUE;
	
	for(var key in data){
		xMax = Math.max(xMax, data[key].length);
	}
	
	var tickCount = Math.max(0, data[key].length);
	var xScale = makeScale([0, xMax], [0, width]);
	xScale = makeScale([0, xMax - 1], [0, xScale(xMax - 1)]);
	var xAxis = addAxis(el, 0, height,  xScale, "bottom", "hour", tickCount, every2ndInv);
	
	var leftAxisCount  = 0;
	var rightAxisCount = 0;
	var i = 0;
	var plots = [];
	for(var key in data){
		var color = colors[i++ % colors.length];
		
		var yMin = d3.min(data[key]);
		var yMax = d3.max(data[key]);
		var yScale = makeScale([yMin, yMax], [height, 0]);	
		
		var tickCount = 5;
		var tickValues = [];
		var diff = (yMax - yMin)/ tickCount;
		for(var j = 0;j < tickCount;j++){
			tickValues[j] = yMin + j * diff;
		}
		
		var axisWidth = 25;
		// TODO label
		if(rightAxisCount < leftAxisCount){
			var x = xScale(xMax - 1) + rightAxisCount * axisWidth;
			var yAxis = addColoredAxis(el, x, 0, axisWidth, yScale, "right", "error", tickValues, color);
			rightAxisCount++;
		}else{
			var x = -leftAxisCount * axisWidth;
			var yAxis = addColoredAxis(el, x, 0, axisWidth, yScale, "left", "error", tickValues, color);
			leftAxisCount++;
		}
		
		plots[plots.length] = addLine(el, data[key], width, height, interpolation, color, xScale, yScale);
		plots[plots.length - 1].name = key;
	}
	
	// TODO: addTooltip();
	// TODO: add axis, grid to multiplot ???
	return new MultiPlot(el, plots, xScale, plots[0].yScale, data, "MultiLinePlot Values");
}


function multiLinePlotOneScale(el, data, width, height, interpolation, colors, unit){
	var xMax = Number.MIN_VALUE; 
	var yMin = Number.MAX_VALUE;
	var yMax = Number.MIN_VALUE; 
	var tickCount = 0;
	
	for(var key in data){
		xMax = Math.max(xMax, data[key].length);
		yMin = Math.min(yMin, d3.min(data[key]));
		yMax = Math.max(yMax, d3.max(data[key]));
		tickCount = Math.max(tickCount, data[key].length)	
	}
	
	var xScale = makeScale([0, xMax], [0, width]);
	xScale = makeScale([0, xMax - 1], [0, xScale(xMax - 1)]);
	var yScale = makeScale([yMin, yMax], [height, 0]);	
	
	var xAxis = addAxis(el, 0, height,  xScale, "bottom", "hour", tickCount, every2ndInv);
	var yAxis = addAxis(el, 0, 0, yScale, "left", "error (" + unit + ")", 5);
	
	addGrid(el, 0, height, height + 2, xAxis);
	
	
	var i = 0;
	var plots = [];
	for(var key in data){
		var color = colors[i % colors.length]; i++;
		plots[plots.length] = addLine(el, data[key], width, height, interpolation, color, xScale, yScale);
		plots[plots.length - 1].name = key;
	}
	
	
	// TODO: addTooltip();
	// TODO: add axis, grid to multiplot ???
	return new MultiPlot(el, plots, xScale, yScale, data, "MultiLinePlot Values");
}


// TODO rename this !!!
function multiMinimaliticErrorPlot(group, data, width, height, uniformScale){
	var resultG = group.append("svg:g");
	var mPlots = [];
	var palette = new ColorPalette();
	palette.colors = GREY_RED_COLOR_PALETTE;
	var barHeight = height / data.length;
	
	var abs = function(el, index){ 
					data[i][index] = Math.abs(el); 
			  };
	
	if(uniformScale){
		var yMin = 0; //Number.MAX_VALUE;
		var yMax = Number.MIN_VALUE;
		for(var i = 0;i < data.length;i++){
			data[i].forEach(abs);
			yMin = Math.min(yMin, d3.min(data[i]));
			yMax = Math.max(yMax, d3.max(data[i]));	
		}
		var yScale = palette.getScale([yMin, yMax]);
		
		addColorLegend(group, palette, "legendGradient2", width + 80, 0, 15, 180, false, "");
	}

	for(var i = 0;i < data.length;i++){
		mPlots[i] = addMinimalistic(resultG, data[i], width, barHeight, palette, null, yScale);
		mPlots[i].element.attr("transform", "translate(0," + (barHeight * i) + ")");
	}
	
	return new MultiPlot(resultG, mPlots, mPlots[0].xScale, yScale, data, "???"); 
}


function multiMinimaliticPlot(group, varData, width, barHeight, method, toolTipDir, inColors, uniformScale, unit){
	var colors = inColors || [ "red", "green", "blue" ];
	var resultG = group.append("svg:g").classed(CLASS_MAIN, true);
	var mPlots = [];
	var palette = new ColorPalette();
	var data 	  = varData.continuousStatsSurface;
	var credData  = varData.credibilitySurface;
	var intervals = varData.intervalsSurface;
	var errors    = varData.errorsSurface;
	
	var yScale = null;
	if(uniformScale){
		if ("from" in uniformScale && "to" in uniformScale && uniformScale.from != uniformScale.to) {
			yScale = palette.getScale([uniformScale.from, uniformScale.to]);	
		}else{
			var yMin = 0; //Number.MAX_VALUE;
			var yMax = Number.MIN_VALUE;
			for(var i = 0;i < data.length;i++){
				yMin = Math.min(yMin, d3.min(data[i][method]));
				yMax = Math.max(yMax, d3.max(data[i][method]));	
			}
			yScale = palette.getScale([yMin, yMax]);
		}
		addColorLegend(group, palette, "legendGradient", width + 80, 0, 15, 180, false, method + " [" + unit + "]");
	}
	
	

	for(var i = 0;i < data.length;i++){
		mPlots[i] = addMinimalistic(resultG, data[i][method], width, barHeight, palette, null, yScale);
		mPlots[i].element.attr("transform", "translate(0," + (barHeight * i) + ")");
		
		
		var eventCatcher = mPlots[i].element;
		
		var intervalScale = d3.scale
					  .ordinal()
					  .domain([intervals[i]])
					  .rangePoints([0, barHeight]);
		
		addAxis(eventCatcher, 0, 0, intervalScale, "left", "", 1, intervalFormat, true);
		
		var tt = new ToolTip("Values", eventCatcher, toolTipDir);	
		tt.addLine("Hour", mPlots[i], displayPlotHour);	
		tt.addLine(method + "'", mPlots[i], displayPlotValue);	
		tt.createEventListeners();
		
		var displayData = {};
		displayData.continuous = data[i];
		displayData.credibility = credData[i];
		displayData.errors = errors[i];
		
		eventCatcher.on("click", toggleMultiline(tt, eventCatcher, displayData, colors, width, 80, barHeight, 500, unit) );
	}
	
	var xMax = data[0][method].length;
	var xAxisScale = makeScale([0, xMax - 1], [0, mPlots[0].xScale(xMax - 1)]);
	var xAxis = addAxis(group, 0, 0, xAxisScale, "top", "Forecast Hours", data[0][method].length, every2ndInv, true);
	
	return new MultiPlot(resultG, mPlots, mPlots[0].xScale, yScale, data, "???"); 
}
