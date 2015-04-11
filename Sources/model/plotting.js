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
 * @version $Id: plotting.js,v 1.21 2015/02/23 15:39:41 marekru Exp $
 *
 */

// TODO: riesit overlap + na konci kazdej metody dam fit SVG to content!
 

if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.plotting = {};

d3.modelvis.plotting.axis = function(selection, data, settings){

	var tickValues = ( settings.tickValues.length ) ? settings.tickValues : null; 
	var tickSize = settings.tickSize;
	var tickSizeInPercent = false;
	
	if( (typeof settings.tickSize === "string") && settings.tickSize.contains("%") ){
		tickSize = 6;
		tickSizeInPercent = true;
	}
	
	var axis = d3.svg.axis()
					 .scale(settings.scale)
					 .orient(settings.orientation)
					 .ticks(settings.tickCount)
					 .tickFormat(settings.tickFormat)
					 .tickValues(tickValues)
					 .tickSize(tickSize)
					 .tickPadding(settings.tickPadding);

	
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
			
	group.classed(CLASS_AXIS, true)
		.call(axis)
		.style({ 
			stroke : colorToString(settings.color),
			fill : colorToString(settings.color)
		});
				 				 
	if(settings.ticksOnly){
		group.classed(CLASS_NOSTROKE, true)
	}		 
	
	if(settings.textShiftX){
		group.selectAll("text")
			.attr("dx", settings.textShiftX);
	}
	
	if(settings.textShiftY){
		group.selectAll("text")
		 .attr("dy", settings.textShiftY);
	}
	
	var bbox = group.node().getBBox();
	
	if(tickSizeInPercent){
		var percent = parseInt(settings.tickSize.split("%")[0]) * 0.01; 
		group.selectAll("line")
		 .attr("x2", - bbox.width * percent);			 
	}

	if(settings.bgColor &&  settings.bgColor != "none"){
	
		group.insert("rect", ":first-child")
			.attr("x", bbox.x)
			.attr("y", bbox.y)
			.attr("width", bbox.width)
			.attr("height", bbox.height)
			.attr("fill", colorToString(settings.bgColor) );	
	}	

	var transform = "";
	var labelX = 0;
	var labelY = 0;
	var labelAnchor = "start";
	if(settings.orientation == settings.orientationTypes.left){
		transform += "rotate(-90)";
		labelX = -bbox.width;
		labelAnchor = "end";
	}else if(settings.orientation == settings.orientationTypes.right){
		transform = "rotate(90)";	
		labelX = bbox.width;
	}else if(settings.orientation == settings.orientationTypes.bottom){
		labelY = bbox.height + settings.textSize;
	}else{
		labelY = -bbox.height;
	}
	
	transform = "translate(" + labelX + ", " + labelY + ") " + transform;
	
	var text = group.append("text")
				 .classed(CLASS_LABEL, true)
				 .text(settings.label)
				 .attr("text-anchor", labelAnchor)
				 .attr("transform", transform)
				 .attr("font-size", settings.textSize + "px");				
		
	d3.modelvis.svg.fitToContent(svg, settings);
	
	return svg; // TODO ?
}

d3.modelvis.plotting.grid = function(selection, data, settings){

	var tickValues = ( settings.tickValues.length ) ? settings.tickValues : null; 
	var tickSize = (settings.orientation == "left" || settings.orientation == "right") ? -settings.width : -settings.height;
	
	var axis = d3.svg.axis()
					 .scale(settings.scale)
					 .orient(settings.orientation)
					 .ticks(settings.tickCount)
					 .tickValues(tickValues)
					 .tickPadding(0)
					 .tickSize(tickSize, 0)
					 .tickFormat("");

	var dasharray = [];
					
	if(settings.lineType === "dashed"){
		dasharray = [ 4, 4 ];
	}else if(settings.lineType === "dotted"){
		dasharray = [ 1, 4 ];
	}else if(settings.lineType === "dash-dotted"){
		dasharray = [ 4, 4, 1, 4 ];
	}else if(typeof settings.lineType === "object"){
		dasharray = settings.lineType;
	}
			
	var group = d3.modelvis.svg.createGroup(selection, settings);
	var svg = d3.select(group.node().parentNode); 		
		
	group.classed(CLASS_GRID, true)
		.call(axis)
		.style({ 
			stroke : colorToString(settings.color),
			fill : colorToString(settings.color),
			"stroke-dasharray" : dasharray.toString()
		});
	
	d3.modelvis.svg.fitToContent(svg, settings);

	return svg;
}

d3.modelvis.plotting.legend = function(selection, data, settings){
	if(settings instanceof ColorLegendSettings){
		return d3.modelvis.plotting.colorlegend(selection, data, settings);
	}
	console.log("legend");
}

d3.modelvis.plotting.colorlegend = function(selection, data, settings){
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_LEGEND, true);
				   
	var defs = group.append("defs");
	
	var gradient = defs.append("linearGradient")
					 .attr("id", settings.gradientID);
					 
	if(settings.horizontal){					 
		gradient.attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%");
	}else{    
		gradient.attr("x1","0%").attr("y1","100%").attr("x2","0%").attr("y2","0%");
	}
	
	var first = settings.palette.values[0];
	var last  = settings.palette.values[settings.palette.values.length - 1];
	
	var pScale = settings.palette.getPercentScale();
	
						
	gradient.selectAll("stop")
			.data(settings.palette.colors)
			.enter()
			.append("stop")
			.attr("offset", function(d,i){ return pScale(settings.palette.values[i]) + "%"; })
			.attr("style",function(d){ return "stop-color:" + colorToString(d); });

	group.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("height", settings.height)
		.attr("width",settings.width)
		.attr("fill","url(#" + settings.gradientID + ")");
		
	var horizontal = settings.horizontal;	
	var dim = (horizontal) ? settings.width: settings.height;	
	//var min = (horizontal) ? x: y;	
    var orient = (horizontal) ? "bottom" : "right";
    var secondDim = (horizontal) ? settings.height : settings.width; 
    var translationX = (horizontal) ? 0 : secondDim;
	var translationY = (horizontal) ? secondDim : 0;
	
	
	var range = new Array(settings.palette.values.length);
	var min = d3.min(settings.palette.values);
	var max = d3.max(settings.palette.values);
	var scale = makeScale([max,min],[0,dim]);
	for(var i = 0;i < range.length; i++){
		range[i] = scale(settings.palette.values[i]); //dim - i * dim / (range.length - 1);
	}
	
	
	axisScale = d3.scale.linear()
						.domain(settings.palette.values)
						.range(range);	
		
	
	var axis = d3.svg.axis()
					.scale(axisScale)
					.orient(orient)
					.ticks(settings.palette.values.length)
					.tickSize(4);
					
	group.append("svg:g")
		.attr("transform", "translate(" + translationX + "," + translationY + ")")
	    .classed("axis", true)
	    .call(axis);
		
	if(horizontal){	
		d3.modelvis.svg.fitHeightToContent(svg);
	}else{
		d3.modelvis.svg.fitWidthToContent(svg);
	}	
	
	return svg;	
}



// TODO
d3.modelvis.plotting.color = function(selection, data, settings){
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	
	group.classed(CLASS_PLOT, true)
	   .classed(CLASS_COLOR, true);
	
	
	var xScale = settings.xScale || makeScale([0, data.length], [0, settings.width]);
	
	var min = d3.min(data);
	var max = d3.max(data);
	var colorScale = settings.yScale || settings.palette.getScale([min, max]);
	
	
	var colWidth  = xScale(1) - xScale(0);
	var colHeight = settings.height;
			
	group.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("width", colWidth) 
		.attr("height", colHeight)
		.attr("x", function(d,i){ return xScale(i); })
		.attr("y", 0)
		.attr("fill", 
			function(d){
				var value = colorScale(d);
				return  colorToString(value); 
			});			   
	
	
	d3.modelvis.svg.fitToContent(svg, settings);
	
	var source = {
		"data" : data,
		"xScale": xScale,
		"yScale": colorScale,
		"palette": settings.palette,
		"label": settings.label
	}
	
	var tooltip = d3.modelvis.tooltip.color(svg, settings.tooltipDiv, colWidth, colHeight, source);
	
	return svg;
}

// TODO:
d3.modelvis.plotting.bar = function(selection, data, settings){
	var padding = settings.gapsize || 0;
	
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	   .classed(CLASS_BAR, true);
				  
	var min = d3.min(data);
	var max = d3.max(data);		
	var diff = (max - min);
	
	
	min = Math.max(0, min - diff * 0.1);
	max += diff * 0.1;
	
	var xScale = null;
	var yScale = null; 
	var widthFun = function(){ return 0; };
	var heightFun = function(){ return 0; };
	var xFun = function(){ return 0; };
	var yFun = function(){ return 0; };
	var minmax = (settings.flip) ? [max, min] : [min, max];
	
	if(settings.vertical){	
		xScale = settings.xScale || makeScale( minmax, [0, settings.width]);
		yScale = settings.yScale || makeScale([0, data.length], [0,  settings.height]);		
		widthFun = function(d){ return xScale(d); };
		heightFun = function(d, i){ return yScale(i + 1) - yScale(i) - padding; };
		yFun = function(d,i){ return yScale(i); };
	}else{
		xScale = settings.xScale || makeScale([0, data.length], [0, settings.width]);
		yScale = settings.yScale || makeScale( minmax, [settings.height, 0]);
		widthFun = function(d,i){ return xScale(i + 1) - xScale(i) - padding; };
		heightFun = function(d){ return yScale(d); };
		xFun = function(d,i){ return xScale(i); };
	}
	
	group.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("width", widthFun)
		.attr("height", heightFun)
		.attr("x", xFun)
		.attr("y", yFun)
		.attr("fill", colorToString(settings.color) )
		.attr("fill-opacity", settings.opacity);	
			
	
	// TODO:
	var tooltip = null;
	
	d3.modelvis.svg.fitToContent(svg, settings);
	
	return svg;
}

d3.modelvis.plotting.line = function(selection, data, settings){

	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	   .classed(CLASS_LINE, true);


	var xScale = settings.xScale || makeScale([0, data.length - 1], [0, settings.width]);
	var yScale = settings.yScale || makeScale([d3.min(data), d3.max(data)], [settings.height, 0]);					 
				   
	var plotline = d3.svg.line()
			.interpolate(settings.interpolation) 
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d); });					 
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", plotline(data))
		 .style("stroke", colorToString(settings.color))
		 .style("stroke-width", settings.strokeWidth);
		
	
	var tooltipEl = d3.modelvis.tooltip.addLineRule(svg, 3, colorToString(settings.color) );	
	var tooltipRule = new ToolTipSVG(tooltipEl, function(el, x){
		var index = xToHour(x, xScale, data.length - 1, Math.floor);
		el.attr("transform","translate(" + xScale(index) + ", " + yScale(data[index]) + ")" );
	});
	
	var source = {
		"data" : data,
		"xScale": xScale,
		"yScale": yScale
	}
	
	var lineSettings = d3.modelvis.settings.tooltipline()
		.set("label", settings.label)
		.set("fun", d3.modelvis.tooltip.display.plotValue)
		.set("rule", tooltipRule)
		.set("source", source)
		.set("color", settings.color);
		
	var line = d3.modelvis.tooltip.createLine(lineSettings);
	settings.tooltip.addLine(line);
	
	
	d3.modelvis.svg.fitToContent(svg, settings);
	
	return svg;
}

d3.modelvis.plotting.scatter = function(selection, data, settings){
	
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	     .classed("scatter", true);
				
	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	

	
	var xScale = settings.xScale || makeScale([0,data.length - 1],[settings.radius, settings.width - settings.radius]);
	var yScale = settings.yScale || makeScale([minX,maxX], [settings.height - settings.radius, settings.radius]);
						 
																						 
	var groups = group.selectAll(".group")
					.data(data)
					.enter()
					.append("svg:g")
					.classed("group", true)
					.attr("transform", 
						function(d,i){
							return "translate(" + (xScale(i)) + ", 0)";
						} );
	
	groups.selectAll("circle")
			.data( function(d){ return d; })
			.enter()			
			.append("circle")
			.attr("cy", function(d){ return yScale(d); })
			.attr("cx", 0)
			.attr("r", settings.radius);
	
	
	group.append("svg:g")
		.classed("mean", true)
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cy", function(d){ return yScale(d3.mean(d));})
		.attr("cx", function(d, i){ return xScale(i); })
		.attr("r", settings.radius*0.5);
	
	
	return svg;
}



// TODO lepsie pomenovat ??
d3.modelvis.plotting.distribution = function(selection, data, settings){
	
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	     .classed("distribution", true);
				
	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var xScale = settings.xScale || makeScale([0,data.length - 1],[0, settings.width]);
	var yScale = settings.yScale || makeScale([minX,maxX], [settings.height, 0]);
						 
		
	var minmax = d3.svg.area()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y0(function(d) { return yScale(d3.min(d)); }) 
			.y1(function(d) { return yScale(d3.max(d)); });	
			
	var means = data.map( function(x){
							return d3.mean(x); 
						});
											
	var n = settings.percents.length || 3;		
	var fun = function(x, i){
				var p = (settings.percents) ? settings.percents[j] : (1 - j/n);
				var f = d3.modelvis.stats.nearest().mean(means[i]).percent(p);
				return f(x);
			  }
	for(var j = 0; j < n; j++){
		var nears = data.map( fun );		
		group.append("path")
			 .attr("d", minmax(nears))
			 .style("fill", colorToString(settings.color) )
			 .style("fill-opacity", settings.alphaJump);
	}
					
						
	var line = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d); });	
						
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", line(means))
		 .style("stroke", colorToString(settings.lineColor) );
	
	
	return svg;
}



d3.modelvis.plotting.functionalbox = function(selection, data, settings){
    var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	     .classed("distribution", true);
				
	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var xScale = settings.xScale || makeScale([0,data.length - 1],[0, settings.width]);
	var yScale = settings.yScale || makeScale([minX,maxX], [settings.height, 0]);
						 
		
	var area = d3.svg.area()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y0(function(d) { return yScale(d[0]); }) 
			.y1(function(d) { return yScale(d[1]); });	
	
	
	var indeces = d3.modelvis.stats.sortIndecesByBendDepth(data);
	var median = indeces[0];
	var band = d3.modelvis.stats.band().data(data);
	var filter = d3.modelvis.stats.filterIndeces().indeces(indeces);
	
	var c025 = band( filter(0.25) );
	var c05 = band( filter(0.5) );
	var c075 = band( filter(0.75) );
	
	var findOutliers = d3.modelvis.stats.outliers().region(c05);
	var outliers = findOutliers(data);
	
	var envelope = band( filter(1.0, outliers) );
	
	var regions = [c05]; //[c025, c05, c075];
	
	
	for(var i = 0;i < regions.length;i++){
		group.append("path")
				 .attr("d", area(regions[i]))
				 .style("fill", colorToString([100,150,230])) //colorToString(settings.color) )
				 .style("fill-opacity", 1.0); // settings.alphaJump
	}
	
	var envelopeColor = [50,50,50];
	
	var lineL = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d[0]); });
			
	
	var lineT = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d[1]); });
			
	
		group.append("path")
			.classed(CLASS_PLOTLINE, true)
			.attr("d", lineT(envelope))
			.style("stroke", colorToString(envelopeColor) );
			
			
		group.append("path")
			.classed(CLASS_PLOTLINE, true)
			.attr("d", lineL(envelope))
			.style("stroke", colorToString(envelopeColor) );	
	
	for(var j = 0;j < outliers.length;j++){
		
		var index = outliers[j];
		
		var line = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d[index]); });
			
		group.append("path")
			.classed(CLASS_PLOTLINE, true)
			.attr("d", line(data))
			.style("stroke", "red" )
			.style("stroke-dasharray", "5,5")
			.style("stroke-width", 0.8);	
	}
				
	var line = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d[median]); });
			
	
	
	var meanline = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d3.mean(d)); });
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", line(data))
		 .style("stroke", colorToString([20,20,20]) );
	
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", meanline(data))
		 .style("stroke", colorToString("white") );
	
	/*
	for(var j= 0;j <= Math.floor(data[0].length * 0.5);j++){
		
		var index = indeces[j];
		
		var line = d3.svg.line()
				.interpolate(settings.interpolationTypes.cardinal) // basis ?
				.x(function(d, i) { return xScale(i); })
				.y(function(d) { return yScale(d[index]); });
			
			
		group.append("path")
			 .classed(CLASS_PLOTLINE, true)
			 .attr("d", line(data))
			 .style("stroke", "black" )
			 .style("stroke-opacity",  ( data[0].length - j )/data[0].length  );
	}
	*/
	
	return svg;
}

/*
d3.modelvis.plotting.functionalbox = function(selection, data, settings){
		var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	     .classed("distribution", true);
				
	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var xScale = settings.xScale || makeScale([0,data.length - 1],[0, settings.width]);
	var yScale = settings.yScale || makeScale([minX,maxX], [settings.height, 0]);
						 
		
	var area = d3.svg.area()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y0(function(d) { return yScale(d[0]); }) 
			.y1(function(d) { return yScale(d[1]); });	
			
											
	var fun = function(x){
				var f = d3.modelvis.stats.quantiles().depth(2);
				return f(x);
			  }
    
	var mapedData = data.map( fun );
	var quantiles = mapedData.map( function(x){  return x.Qpairs; } );
	var n = quantiles[0].length;
	
	for(var j = 0; j < n; j++){
		var quantil = quantiles.map( function(x){ return x[j]; } );
		group.append("path")
			 .attr("d", area(quantil))
			 .style("fill", colorToString(settings.color) )
			 .style("fill-opacity", settings.alphaJump);
	}
					
						
	var line = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d.median); });
			
	
	var lineMin = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d3.min(d)); });			
						
						
	var lineMax = d3.svg.line()
			.interpolate(settings.interpolationTypes.cardinal) // basis ?
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d3.max(d)); });					
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", line(mapedData))
		 .style("stroke", "black" );
		 
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", lineMin(data))
		 .style("stroke", "blue" );
		 
	
	group.append("path")
		 .classed(CLASS_PLOTLINE, true)
		 .attr("d", lineMax(data))
		 .style("stroke", "blue" );	 
	
	// TODO outliers
	
	return svg;
}
*/

d3.modelvis.plotting.density = function(selection, data, settings){
	var width = settings.width;
	var height = settings.height;
	
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	     .classed("density", true);
			
	var canvas = group.append("foreignObject")
					 .attr("width",width)
					 .attr("height",height)
					 .append("xhtml:canvas")
					 .attr("width",width)
					 .attr("height",height);
					 
	var minY = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxY = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var xScale = settings.xScale || makeScale([0,data.length - 1],[0, width]);
	var yScale = settings.yScale || makeScale([minY,maxY], [height, 0]);				 
					 
	var context = canvas.node().getContext("2d");
	var image = context.createImageData(width, height);				 
	
	var diff = maxY - minY;
	var ystep = diff/(height - 1);
	var fun = function(c, i){ return minY + i*ystep; };
	var points = Array.apply(null, {length: height}).map(fun);
	var values = [];
	for(var i = 0;i < data.length;i++){
		var kde = science.stats.kde().sample(data[i]);
		values[i] = kde(points);
	}				 
		
	var colors = ["white", "#bdd7e7", "#6baed6", "#2171b5"]; // "#c6dbef", "#9ecae1", "#6baed6", "#3182bd" , "#055691"];
	
	/*
		#eff3ff
		#bdd7e7
		#6baed6
		#2171b5
	*/
	
	//var extent = d3.extent (values);
	var min = d3.min(values, function(array) {
		return d3.min(array);
	});	
	var max = d3.max(values, function(array) {
		return d3.max(array);
	});
	var extent = [min, max];
	var diff = (extent[1] - extent[0])/(colors.length - 1);
	var domain = [ extent[0] + (extent[1] - extent[0])/32];
	for(var i = 1;i < colors.length - 1;i++){
		domain.push(extent[0] + i*diff);
	}
	
	var zScale = makeScale( extent , [0, colors.length - 1] ); //colors
	var widthScale = (width/data.length);//(data.length/width);
	
	for(var i = 0; i < values.length; i++){
		var x0 = i * widthScale + 1;
		var x2 = (i + 1) * widthScale + 1;
			
		for(var j = 0; j < values[i].length; j++){
			var value = zScale(values[i][j]);
			var C1 = Math.floor(value);
			var C2 = C1 + 1;
			var ratio = value - C1;
			var w = ratio * widthScale;
			var y = height - j;
			var x1 = x0 + w;
			// farba 1
			context.beginPath();
			context.imageSmoothingEnabled= false
			context.lineWidth = 2;
			context.strokeStyle = colors[C1];
			context.moveTo(x0,y);
			context.lineTo(x2,y);
			context.stroke();
			
			// farba 2
    		context.beginPath();
			context.lineWidth = 2;
			context.strokeStyle = colors[C2];
			context.moveTo(x0,y);
			context.lineTo(x1,y);
			context.stroke();
		}	
		
		context.beginPath();
		context.lineWidth = 1.5;
		context.strokeStyle = "white";
		context.moveTo(x0,0);
		context.lineTo(x0,height);
		
		context.stroke();
		
	}
	
	/*
	for (var i = 0, n = width * height * 4; i < n; i += 4) {
		
		var index = i/4;
		var vindex = height - Math.floor(index / width) - 1;	
		var hindex = index % width;
		var param = hindex * widthScale;
		hindex = Math.floor(param);
		param -= hindex;
		//var c = d3.rgb(zScale( (i/4 < w*h) ? values[i/4] : extent[0] ));
		var c = d3.rgb(zScale(values[hindex][vindex]));
		
	
		image.data[i + 0] = c.r; 
		image.data[i + 1] = c.g; 
		image.data[i + 2] = c.b;
		image.data[i + 3] = 255;
	}	
					 
	context.putImageData(image, 0, 0);
	context.drawImage(canvas.node(), 0, 0, width, height);
	*/
	return svg;				 
}

/*
 *
 * Ma zlozitost O(w*h*n*m) lepsie ide O(m*h*n) , kedze w > 47, tak zrychlime aspon 48x
d3.modelvis.plotting.density = function(selection, data, settings){
	
	var width = settings.width;
	var height = settings.height;
	
	var group = d3.modelvis.svg.createGroup(selection, settings);		
	var svg = d3.select(group.node().parentNode); 
	
	group.classed(CLASS_PLOT, true)
	     .classed("density", true);
			
	var canvas = group.append("foreignObject")
					 .attr("width",width)
					 .attr("height",height)
					 .append("xhtml:canvas")
					 .attr("width",width)
					 .attr("height",height);
			
	var minY = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxY = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var xScale = settings.xScale || makeScale([0,data.length - 1],[0, width]);
	var yScale = settings.yScale || makeScale([minY,maxY], [height, 0]);
	
	var scale = 0.1; //0.5;
	var w = Math.floor(width*scale); // 48
	var h = Math.floor(height*scale);
	var diff = maxY - minY;
	var xstep = 48/w;
	var ystep = diff/(h - 1);
	var fun = function(c, i){ return [ i % w * xstep , minY + Math.floor(i / w) * ystep ]; };
	var points = Array.apply(null, {length: w * h}).map(fun);


	var toPoint = function(index){
	  var i = index; 
	  return function(value){ return [i, value]; };   
	};
	var f = function(val, i){ return val.map(toPoint(i)); };
	var samples = [].concat.apply([],data.map(f));
	
	
	var kde = d3.modelvis.stats.kde()
							   .sample(samples);
							   
	var values = kde(points);
	
	
	var context = canvas.node().getContext("2d");
	var image = context.createImageData(w, h);
	
	var colors = ["white","#c6dbef", "#9ecae1", "#6baed6", "#3182bd" , "#055691"];
	
	var extent = d3.extent (values);
	var diff = (extent[1] - extent[0])/5;
	var domain = [ extent[0] + (extent[1] - extent[0])/32];
	for(var i = 1;i < colors.length - 1;i++){
		domain.push(extent[0] + i*diff);
	}
	var treshold = true;
	if(treshold){
		var zScale = d3.scale.threshold().domain(domain).range(colors);
	}else{
		var zScale = makeScale( extent , colors ); //[ "white"  , "darkblue" ]	
	}
	var data = [];
	for (var i = 0, n = width * height * 4; i < n; i += 4) {
		var c = d3.rgb(zScale( (i/4 < w*h) ? values[i/4] : extent[0] ));
	
		image.data[i + 0] = c.r; 
		image.data[i + 1] = c.g;
		image.data[i + 2] = c.b;
		image.data[i + 3] = 255;
	}
	context.putImageData(image, 0, 0);
	if(treshold){
		context.imageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
	}
	context.scale(width/w, height/h);
	context.drawImage(canvas.node(), 0, 0, width, height);
	
	return svg;
}
*/
