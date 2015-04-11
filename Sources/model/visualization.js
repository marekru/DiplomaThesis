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
 * @version $Id: visualization.js,v 1.25 2014/09/17 14:36:42 marekru Exp $
 *
 */ 

function $(x) { return document.getElementById(x); } 


// TODO: samostatny file pre kazdy plot a  potom zvlast vizualizacne vecicky :)
// TODO: nastavenia scatterplotu - pojde vacsinou o vseobecne nastavania grafov, to bude bud v visConfigu alebo niekde samostatne inde
// TODO: kontrola dat, ci su dobre
// TODO: param boolean ci appendovat do svg alebo prepisat cele
// TODO: posielat balik parametrov (id, data, offset, width, height, overwrite, palette, ...)
// TODO: "bottom" / "left" ako constanty
// TODO: zbavit sa magie s cislami
// TODO: prerozdelit do samostatnych suborov
// TODO: i18n


var CLASS_PLOT = "plot";
var CLASS_MINIMALISTIC = "minimalistic";
var CLASS_LINE = "line";
var CLASS_BAR = "bar";
var CLASS_PLOTLINE = "plotline";
var CLASS_GRID = "grid";
var CLASS_AXIS = "axis";
var CLASS_COLOR = "color";
var CLASS_LABEL = "label";
var CLASS_LEGEND = "legendGroup";
var CLASS_TOOLTIP = "tooltip";
var CLASS_TOOLTIPHTML = "tooltipHTML";
var CLASS_EVENTGROUP = "eventGroup";
var CLASS_VALUE = "value";
var CLASS_TITLE = "title";
var CLASS_RULE = "rule";
var CLASS_NOSTROKE = "nostroke";
var CLASS_MAIN = "main";
var CLASS_TRANSLATE = "translateGroup";


// TODO vertical
function addBars(el, data, width, height, color, vertical, xScaleIn, yScaleIn, opacity, barPadding, flip){
	var pad = barPadding || 0;
	var group = el.append("svg:g")
				  .classed( CLASS_PLOT + " " + CLASS_BAR, true );
				  
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
	var minmax = (flip) ? [max, min] : [min, max];
	
	if(vertical){	
		xScale = xScaleIn || makeScale( minmax, [0, width]);
		yScale = yScaleIn || makeScale([0, data.length], [0,  height]);		
		widthFun = function(d){ return xScale(d); };
		heightFun = function(d, i){ return yScale(i + 1) - yScale(i) - pad; };
		yFun = function(d,i){ return yScale(i); };
	}else{
		xScale = xScaleIn || makeScale([0, data.length], [0, width]);
		yScale = yScaleIn || makeScale( minmax, [height, 0]);
		widthFun = function(d,i){ return xScale(i + 1) - xScale(i) - pad; };
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
		.attr("fill", colorToString(color) )
		.attr("fill-opacity", opacity);	
			
	
	var tooltip = null;
	
	return new ColorPlot(group, width, height, xScale, yScale, data, tooltip, color);
}


// parametre xScaleIn, yScaleIn nemusia byt zadane, vtedy sa dopocitaju
function addMinimalistic(el, data, width, height, palette, xScaleIn, yScaleIn){
	var group = el.append("svg:g")
				  .classed( CLASS_PLOT + " " + CLASS_MINIMALISTIC, true );
	
	
	var xScale = xScaleIn || makeScale([0, data.length], [0, width]);
	
	var min = d3.min(data);
	var max = d3.max(data);
	var colorScale = yScaleIn || palette.getScale([min, max]);
	
	
	var colWidth  = Math.ceil(xScale(1) - xScale(0));
	var colHeight = height;
			
	group.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("width", colWidth) 
		.attr("height", colHeight)
		.attr("x", function(d,i){ return Math.floor(xScale(i)); })
		.attr("y", 0)
		.attr("fill", 
			function(d){
				var value = colorScale(d);
				return  colorToString(value); 
			});			   
	
	var tooltipEl = addMinimalisticToolTip(group, colWidth, colHeight);
	var tooltip = new ToolTipSVG(tooltipEl, function(el, x){
		var i = xToHour(x, xScale, data.length - 1, Math.floor);
		el.attr("transform","translate(" + Math.floor(xScale(i)) + ",0)" );
	});
	
	return new ColorPlot(group, width, height, xScale, colorScale, data, tooltip, palette);
}


// parametre xScaleIn, yScaleIn nemusia byt zadane, vtedy sa dopocitaju
function addLine(el, data, width, height, interpolation, color, xScaleIn, yScaleIn){
	var group = el.append("svg:g")
				   .classed( CLASS_PLOT + " " + CLASS_LINE, true );

	var xScale = xScaleIn || makeScale([0, data.length - 1], [0, width]);
	var yScale = yScaleIn || makeScale([d3.min(data), d3.max(data)], [height, 0]);					 
				   
	var plotline = d3.svg.line()
			.interpolate(interpolation) 
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d); });					 
	
	group.append("path")
		.classed(CLASS_PLOTLINE, true)
		.attr("d", plotline(data))
		.style("stroke", colorToString(color));
		
	
	var tooltipEl = addLineToolTip(group, 3, colorToString(color) );	
	var tooltip = new ToolTipSVG(tooltipEl, function(el, x){
		var index = xToHour(x, xScale, data.length - 1, Math.floor);
		el.attr("transform","translate(" + xScale(index) + ", " + yScale(data[index]) + ")" );
	});
		
	return new ColorPlot(group, width, height, xScale, yScale, data, tooltip, color);
}



function addNextSiblingsToGroup(node, group){
	var it = node;
	var list = [];
	while(it.nextSibling){
		it = it.nextSibling;
		list[list.length] = it;
	}
	for(var i = 0;i < list.length;i++){
		if(list[i] != group){
			group.appendChild(list[i]);
		}
	}
}

function removeNodeButNotChilds(node){
	while (node.firstChild){
		node.parentNode.insertBefore(node.firstChild, node);
	}
	node.parentNode.removeChild(node);
}


function getBBoxOfMains(svg){
	var result = new Object();
	
	result.x = Number.MAX_VALUE;
	result.y = Number.MAX_VALUE;
	result.width  = 0;
	result.height = 0;
	
	var maxX = 0;
	var maxY = 0;
	
	var mains = svg.selectAll("." + CLASS_MAIN).each(
		function(){
			var bbox = this.getBBox();
			var xBBox = bbox.x + bbox.width;
			var yBBox = bbox.y + bbox.height;

			maxX = Math.max(maxX, xBBox);
			maxY = Math.max(maxY, yBBox);
			
			result.x = Math.min(result.x, bbox.x);
			result.y = Math.min(result.y, bbox.y);
		}
	); 
	result.width  = Math.abs(maxX - result.x);
	result.height = Math.abs(maxY - result.y);
	
	return result;
}

function fitSVGToContent2(svg){
	var svgBBox = svg.node().getBBox();
	if(svg.children.length > 0){
		var wrapper = null;
		if(svg.children.length === 1 && svg.children[0].id === "" ){ // TODO: pridat ID
			wrapper = svg.children[0];
		}else{
			// TODO: vytvor wrapper
			// TODO: pridaj vsetky dcerske elementy do wrappera
		}
		d3.select(wrapper)
		  .attr("transform", "translate(0,0)") // TODO: translate
		  .attr("width", 0) // TODO: width
		  .attr("height", 0); // TODO: height
	}
}

function fitSVGToContent(svg){
	var svgHeight = parseInt(svg.attr("height"));
	var correctSvgHeight = getBBoxOfMains(svg).height;
	if(svgHeight != correctSvgHeight){
		svg.attr("height", correctSvgHeight);
	}
}


function Executable(execute){
	this.execute = execute;
}
		
function assemble(funsPress, funsRelease, obj){
	return function(){
		if(!obj.pressed){
			executeFunctions( funsPress );
		}else{
			executeFunctions( funsRelease );
		}
		obj.pressed = !obj.pressed;
	}
} 

function toggle(tooltip, group, data, credData, colors, width, height, offset, duration){
	// TODO
	var translation = 0;
	
	var translate = function(){ translateNextSibilings(group, translation, duration, this); };
	
	
	var funsPress = [];
	var funsRelease = [];
	return assemble( funsPress, funsRelease, this );
}


function translateNextSibilings(group, translation, duration){
	var parent = d3.select(group.node().parentNode);
	var translateGroup = parent.append("svg:g");
	var svg = d3.select(translateGroup.node().ownerSVGElement);
	addNextSiblingsToGroup(group.node(), translateGroup.node());
	translateGroup.classed(CLASS_TRANSLATE, true); 
	translateGroup.attr("transform", "translate(0, 0)")
				  .transition()
				  .duration(duration || 500)
				  .attr("transform", "translate(0, " + translation + ")");
				  
	return translateGroup;
}

function collapseTranslation(translateGroup, duration){
	translateGroup.transition()
				  .duration(duration || 500)
				  .attr("transform", "translate(0, 0)")
				  .each("end",function() { 
					var tGroup = d3.select(this).node();
					var svg = d3.select(tGroup.ownerSVGElement);
					removeNodeButNotChilds(tGroup);
					fitSVGToContent(svg);
				  });
}

function resizeSVG(svg, diff, duration){
	var svgHeight = parseInt(svg.attr("height")) + diff;
			
	svg.transition()
		.duration(duration || 500)
		.attr("height", svgHeight)
		.each("end", function() { fitSVGToContent(svg); });
}

function expandGroup(group, svg, duration, fromScale, toScale){
	var fScale = fromScale || [1, 0.1];
	var tScale = toScale || [1, 1];

	var initScale = "scale(" + fScale[0] + ", " + fScale[1] + ")";
	var finishScale = "scale(" + tScale[0] + ", " + tScale[1] + ")";

	var translate = group.attr("transform");
	group.attr("transform", translate + initScale)
		.attr("opacity", 0)
		.transition()
		.duration(duration || 500)
		.attr("transform", translate + finishScale)
		.attr("opacity", 1)
		.each("end", function() { fitSVGToContent(svg); });
}



function collapseAndRemove(group, duration, scale){
	var fScale = scale || [1, 0.1];
	var initScale = "scale(" + fScale[0] + ", " + fScale[1] + ")";
	var translate = group.attr("transform");
	group.transition()
		  .duration(duration || 500)
		  .attr("transform", translate + initScale)
		  .attr("opacity", 0)
		  .each("end",function() { 
			d3.select(this).remove()
		   });
}


function addClickableRect(group, width, height, paddingX, paddingY){
	var px = paddingX || 0;
	var py = paddingY || 0;
	
	var rect = group.node().getBBox();
	
	var w = width || rect.width;
	var h = height || rect.height;
	
	group.append("rect")
		.attr("x", -px)
		.attr("y", rect.y - py)
		.attr("width", w + px)
		.attr("height", h + py)
		.attr("opacity", 0.0); 
}


function addMultiLine(group, data, width, height, colors, tooltip, unit, obj){
	var multi = multiLinePlot(group, data, width, height, "cardinal", colors, unit);
	for(var i = 0;i < multi.plots.length;i++){
		tooltip.addLine(multi.plots[i].name, multi.plots[i], displayPlotValue);
		obj.names[i] = multi.plots[i].name; 
	}
	tooltip.createEventListeners();
	obj.multi = multi;
}

function addCredibilityBars(group, data, width, height, tooltip, obj){
	var yBarScale = makeScale([1.0, 0.0],[0, height]);
	obj.bars = addBars(group, data, width, height, [ 0, 0, 0, 0.4 ], null, null, yBarScale, true);	
	obj.bars.name = "Credibility";
	tooltip.addLine(obj.bars.name, obj.bars, displayPlotValueAsPercent);
	obj.names.push(obj.bars.name);
	tooltip.createEventListeners();
}

function addPairsTooltipline(data, tooltip, obj){
	var name = "Pairs";
	var plot = new Plot(null, 0, 0, obj.multi.xScale , obj.multi.yScale, data);
	tooltip.addLine(name, plot, displayLength);
	obj.names.push(name);
}

// TODO rozsekat na funkcie !!!
function toggleMultiline(tooltip, group, displayData, colors, width, height, offset, duration, unit){
	var padding = 2;
	var translate = "translate(0," + (offset + padding) + ")";

	var trans = height + 40;
	
	return function(){	
		var data = displayData.continuous;
		var credData = displayData.credibility;
		var errors = displayData.errors;
		
		
		if(this.pressed){	
			tooltip.deleteLines(this.names);
			tooltip.createEventListeners();
			
			collapseAndRemove(this.subG, duration);
			
			this.subG = null;
			tooltip.setTitle(this.title);
				
			
			
			collapseTranslation(this.translateGroup, duration);
			
			this.bars.element.transition().duration(500).remove();
			
			var svg = d3.select(this.translateGroup.node().ownerSVGElement);
			resizeSVG(svg, -trans, duration);
			
			
		}else{
			var subG = group.append("svg:g");
			
			// Posun vsetkeho
			this.translateGroup = translateNextSibilings(group, trans, duration);
			
			var svg = d3.select(group.node().ownerSVGElement);
			resizeSVG(svg, trans, duration);
			
			this.names = [];
			addMultiLine(subG, data, width, height, colors, tooltip, unit, this);
			addCredibilityBars(group, credData, width, offset, tooltip, this);
			addPairsTooltipline(errors, tooltip, this);
			
			this.title = tooltip.title;
			tooltip.setTitle(this.multi.name);
			
			subG.attr("transform", translate);
			addClickableRect(subG, width, null, 0, padding);
			expandGroup(subG, svg, duration)
				
			this.subG = subG;
		}
		this.pressed = !this.pressed;
	}
}


function addGrid(svg, x, y, dim, axis){

	var a = axis;
	a.tickSize(-dim, 0)
	 .tickFormat("");	

	var grid = svg.append("svg:g")
				.classed(CLASS_GRID, true)
				.attr("transform", "translate(" + x + ", " + y +")")
				.call(a);
		
	return grid;
	
}

function addAxis(svg, x, y , scale, orient, label, tickCount, tickFormat, ticksOnly, tickValues, tickSize){
	
	var orientation = orient || "bottom"; // top right bottom left
	var ticks = tickCount || 5;
	
	var axis = d3.svg.axis()
					 .scale(scale)
					 .orient(orientation)
					 .ticks(ticks)
					 .tickFormat(tickFormat)
					 .tickValues(tickValues);
		
	if(tickSize){
		axis.tickSize(tickSize);
	}	 
					 
	var g = svg.append("svg:g")
			   .classed(CLASS_AXIS, true)
			   .attr("transform", "translate(" + x +  ", " + y + ")")
			   .call(axis);
		
	var rect = g.node().getBBox();	

	var transform = "";
	var x = 0;
	var y = 0;
	
	if(orient == "left"){
		transform = "translate(" + rect.x + ",0)rotate(-90)";
	}else if(orient == "bottom"){
		x = (rect.x + rect.width);
		y = (rect.y + rect.height + 10);
	}else if(orient == "top"){
		x = (rect.x + rect.width);
		y = (rect.y - 5);
	}	
	
	var text = g.append("text")
				 .classed(CLASS_LABEL, true)
				 .attr("x", x) 
				 .attr("y", y) 
				 .text(label);				 

	text.attr("transform", transform);
	
	if(ticksOnly){
		g.classed(CLASS_NOSTROKE, true)
	}
				 
	return axis;
}

function addColoredAxis(svg, x, y , width, scale, orient, label, ticks, color, tickFormat){
	var orientation = orient || "left";

	var tickCount;
	var tickValues;
	if((typeof ticks) == "number"){
		tickCount = ticks;
	}else{
		tickValues = ticks;
		tickCount = ticks.length;
	}
	
	var axis = d3.svg.axis()
					 .scale(scale)
					 .orient(orientation)
					 .ticks(tickCount)
					 .tickValues(tickValues)
					 .tickPadding(-width + 1)
					 .tickSize(width)
					 .tickFormat(tickFormat);
					 
	var lineColor = "white";
					 
	var g = svg.append("svg:g")
				.classed(CLASS_AXIS + " " + CLASS_COLOR, true)
				.attr("transform", "translate(" + x +  ", " + y + ")")
				.attr("style", "stroke: " + lineColor + "; fill: " + lineColor)
				.call(axis);

	g.selectAll("text").attr("dy", -4);	
	
	var axisColor = colorToString(color);
	var bbox = g.node().getBBox();
	
	g.insert("rect", ":first-child")
		.attr("x", bbox.x)
		.attr("y", bbox.y)
		.attr("width", width)
		.attr("height", bbox.height)
		.attr("fill", axisColor);
		
	
	
	
	return axis;
}


function addColorLegend(svg, palette, gradId, x, y, width, height, horizontal, label){

	var group = svg.append("svg:g")
				   .classed(CLASS_LEGEND, true)
				   .attr("transform", "translate(" + x + ", " + y + ")");

	var defs = group.append("defs");
	var gradient = defs.append("linearGradient")
					 .attr("id", gradId);
	if(horizontal){					 
		gradient.attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%");
	}else{    
		gradient.attr("x1","0%").attr("y1","100%").attr("x2","0%").attr("y2","0%");
	}
	
	var pScale = d3.scale.linear()
						.domain([palette.values[0],palette.values[palette.values.length - 1]])
						.range([0,100]);
	
						
	gradient.selectAll("stop")
			.data(palette.colors)
			.enter()
			.append("stop")
			.attr("offset", function(d,i){ return pScale(palette.values[i]) + "%"; })
			.attr("style",function(d){ return "stop-color:" + colorToString(d); });

	group.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("height", height)
		.attr("width",width)
		.attr("fill","url(#" + gradId + ")");
		
	var dim = (horizontal) ? width: height;	
	var min = (horizontal) ? x: y;	
    var orient = (horizontal) ? "bottom" : "right";
    var secondDim = (horizontal) ? height : width; 
    var translationX = (horizontal) ? 0 : secondDim;
	var translationY = (horizontal) ? secondDim : 0;
	
	var range = [];
	for(var i = 0;i < palette.values.length;i++){
		var value = min + pScale(palette.values[i]) * dim * 0.01; // lebo pScale dava percenta
		range.unshift(value);
	}
	
	axisScale = d3.scale.linear()
						.domain(palette.values)
						.range(range);	
		
	
	var axis = d3.svg.axis()
					.scale(axisScale)
					.orient(orient)
					.ticks(palette.values.length)
					.tickSize(2);
					
	group.append("svg:g")
		.attr("transform", "translate(" + translationX + "," + translationY + ")")
	    .classed("axis", true)
	    .call(axis);
		
	var labelPadding = 5;	
	var translationX = (horizontal) ? dim : -labelPadding;
    var translationY = (horizontal) ? -labelPadding : dim;
	var rotation = (horizontal) ? 0 : -90;
		
	group.append("text")
		 .attr("x", 0)
		 .attr("y", 0)
		 .attr("transform", "translate(" + translationX + "," + translationY + ")rotate(" + rotation + ")")
		 .attr("text-anchor", "start")
		 .text(label);
		
	return group;		   
}


function xToHour(x, xScale, max, rType){
	var invX = xScale.invert(x);
	var index = Math.min(Math.max(0, rType(invX)), max);	
	return index;
}

function makeScale(domain, range){
	return d3.scale.linear().domain(domain).range(range);
}


function intervalFormat(interval, index){
	var from = interval.from;
	var to = interval.to;
	
	if(from.getMonth() != to.getMonth() && to.getHours() < 5){
		to.setHours(-1);
	}
	if(from.getMonth() == to.getMonth()){
		var firstDay = new Date(from.getFullYear(), from.getMonth(), 1);
		var lastDay  = new Date(to.getFullYear(), to.getMonth() + 1, 0);
		if(from.getDay() == firstDay.getDay() && to.getDay() == lastDay.getDay() ){
			return d3.time.format("%B")(from);
		}
	}
	var format = "%b %e";
	var timeFormat = d3.time.format(format);
	return timeFormat(from) + "-" + timeFormat(to);
}


function every2ndInv(d,i){
	return everyNthInv(2)(d,i); 																				 
}

function everyNthInv(n){
	return (function(d,i){ 
			return (i % n == 0)?"":d;
		   });
}

function every2nd(d,i){
	return everyNth(2)(d,i); 																				 
}

function everyNth(n){
	return (function(d,i){ 
			return (i % n == 0)?d:"";
		   });
}

function executeFunctions(executables){
	for(var key in executables){
		if(executables[key].execute){
			executables[key].execute();
		}else{
			executables[key]();
		}
	}
}

