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
 * @version $Id: graphs.js,v 1.10 2015/02/23 15:39:41 marekru Exp $
 *
 */

 // http://reference.wolfram.com/language/guide/StatisticalVisualization.html
 // http://flowingdata.com/2012/05/15/how-to-visualize-and-compare-distributions/

if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.graphs = {};

d3.modelvis.functions = function(){
	var data = [];
	var displays = [];
	
	function fun() {
		for(var i = 0;i < displays.length;i++){
			displays[i]();
		}				
	}
	
	fun.data = function(d){
		if(!arguments.length){
			return data;
		}
		data = d;
		return fun;
	}
	
	fun.addDisplay = function(display, i){
		var display = display.data(data[i]);
		displays.push(display);
		return fun;
	}
	
	return fun;
}

d3.modelvis.display = function(){
	var data = [];
	var id = "";
	var graph = d3.modelvis.modul();
	
	function fun(){
		var cell = d3.select("#" + id);
		cell.html("");
		graph.data(data);
		cell.call(graph);
	}
	
	fun.data = function(d){
		if(!arguments.length){
			return data;
		}
		data = d;
		return fun;
	}
	
	fun.id = function(newId){
		if(!arguments.length){
			return id;
		}
		id = newId;
		return fun;
	}
	
	fun.graph = function(g){
		if(!arguments.length){
			return graph;
		}
		graph = g;
		return fun;
	}
	
	return fun;
}

function convertToArray(obj, iterations){
	if (Object.prototype.toString.call(obj) === '[object Object]' && iterations > 0) {
		var fun = function(key){
			return convertToArray(obj[key], iterations - 1);
		}	
		return Object.keys(obj).map( fun );
	}else{
		return obj;
	}
}


// podla settings vsetko urobit, nie len takto barjako :D
d3.modelvis.graphs.color = function(selection, data, settings){
	
	var d = ("data" in data) ? data["data"] : data;
	d = convertToArray(d, 2);
	var intervals = ("intervals" in data) ? data["intervals"] : Array.apply(null, {length: d.length}).map(function(c, i){ return i + 1; });
	var clickFunctions = ("clickfuns" in data) ? data["clickfuns"] : [];
	
	
	var width = settings.width;
	var height = settings.height;
	var barHeight = (settings.barHeight) ? settings.barHeight : Math.floor(height / d.length);
	
	var root = d3.modelvis.root();
	var row  = d3.modelvis.row();
	var graphCell = d3.modelvis.col();
	var legendCell = d3.modelvis.col().set("id", "legendCell");
	row.addChild(graphCell)
	   .addChild(legendCell);
	root.addChild(row);
	
	var graph = d3.modelvis.root();
	
	var yScale = null;				
	if(settings.sameScale){				
		var yMin = 0; 
		var yMax = Number.MIN_VALUE;
		for(var i = 0;i < d.length;i++){
			newMin = d3.min(d[i]);
			newMax = d3.max(d[i]);
			if (newMin != undefined) {
				yMin = Math.min(yMin, newMin);
			}
			if (newMax != undefined) {
				yMax = Math.max(yMax, newMax);	
			}	
		}
		// RED_GREY_BLUE_COLOR_PALETTE
		settings.palette.adaptive = false;
		maxim  = Math.max(Math.abs(yMin), Math.abs(yMax));
		maxim  = Math.ceil(maxim * 10) * 0.1; // zaokruhlime na najblizsie horne desatinne	
		values = [-maxim, -maxim*0.25, -maxim*0.5, -maxim*0.75, 0, 0, maxim*0.25,maxim*0.5, maxim*0.75, maxim];
		yScale = settings.palette.getScale(values);
	}
	
	var xMax = d3.max(d, function(a){ return a.length });
	var s = makeScale([0,xMax],[0,width]);
	var xAxisScale = makeScale([0, xMax - 1], [0, s(xMax - 1)]);
	var axis = d3.modelvis.axis()
				.set("scale", xAxisScale)
				.set("label", settings.xLabel)
				.set("orientation", "top")
				.set("tickCount", xMax - 1)
				.set("tickFormat", d3.modelvis.formatting.every2ndInv)
				.set("ticksOnly", true)
				.set("textSize", 11);
	
	var col = d3.modelvis.col();	
	var axisCol = d3.modelvis.col().addChild(axis);	
	
	
	var firstLine = d3.modelvis.row()
			 .addChild(col)
			 .addChild(axisCol);
	
	graph.addChild(firstLine);
	
    var tooltipDiv = d3.select("body").append("div").node();
		
	for(var i = 0;i < d.length;i++){
		
		
		var colorplot = d3.modelvis.colorplot()
						  .data(d[i])
						  .set("width", width)
						  .set("height", barHeight)
						  .set("yScale", yScale)
						  .set("xScale", s)
						  .set("tooltipDiv", tooltipDiv);
					  
		var ordScale = d3.scale.ordinal()
							   .domain([intervals[i]])
							   .rangePoints([0, barHeight]);	
				  
						  
		axisFormating = (intervals.length && intervals[0] && intervals[0].from) ? d3.modelvis.formatting.interval : d3.modelvis.formatting.every();			  
						  
		var axis = d3.modelvis.axis()
						.set("scale", ordScale)
						.set("label", "")
						.set("tickFormat", axisFormating)
						.set("tickCount", 1)
						.set("ticksOnly", true);
		
		colorplot.set("label", axisFormating(intervals[i]));
		
			
		var axisCol = d3.modelvis.col()
								 .set("alignment.horizontal", "right")
								 .addChild(axis);	
								 
		var click = (i < clickFunctions.length) ? clickFunctions[i] : null;
						
								 
		var colorCol = d3.modelvis.col().addChild(colorplot).set("click", click);	
		
		var line = d3.modelvis.row()
					 .addChild(axisCol)
					 .addChild(colorCol);
		
		graph.addChild(line);
	}
	
	var legend = d3.modelvis.colorlegend().set("palette", settings.palette);
	
	legendCell.addChild(legend);
	graphCell.addChild(graph);

	
	return selection.call(root).block;
}


// TODO same scale, axis, grid, ... podla settings
d3.modelvis.graphs.line = function(selection, data, settings){
	var width = settings.width;
	var height = settings.height;
	
	var xMax = 0;
	for(var method in data){
		newMax = data[method].length;
		xMax = Math.max(xMax,  newMax);
    }
	if (!xMax) {
		xMax = 48;
	}
	
	var hAxisSettings = settings.hAxis;
	hAxisSettings.scale = hAxisSettings.scale || makeScale([0, xMax - 1],[0, width]);
	hAxisSettings.tickCount = (hAxisSettings.tickCountAdaptive)? xMax : hAxisSettings.tickCount;
	hAxisSettings.label = hAxisSettings.label || "Forecast Hours";
	hAxisSettings.width = hAxisSettings.width || width;
	
	var axisD = d3.modelvis.axis().settings(hAxisSettings);
	
	var axisL = null;				   	   
	
	var yScale = null;				
	if(settings.sameScale){		
		var yMin = 0; 
		var yMax = Number.MIN_VALUE;
		for(var method in data){
			yMin = Math.min(yMin, d3.min(data[method]));
			yMax = Math.max(yMax, d3.max(data[method]));
		}
		var bias = Math.abs(yMax) * 0.1;
		
		
		var yScale = makeScale([yMin - bias, yMax + bias],[height,0]);
		
		// TODO
		axisL = d3.modelvis.axis()
					.set("scale", yScale)
					.set("label", "Error [hPa]") 
					.set("textSize", 11)
					.set("height", height)
					.set("tickCount", 5);
	}
	
    var hGrid = settings.hGrid;
	var vGrid = settings.vGrid;
	
	
	if (hGrid) {
		hGrid.settings().cast(axisL.settings())
					   .set("orientation", "left")
					   .set("width", width);	
	}
	if (vGrid) {		
		vGrid.settings().cast(axisD.settings())
					   .set("orientation", "top")
					   .set("height", height);
	}

	var graph = (hGrid) ? hGrid : vGrid;
		graph = (graph) ? graph : null;
	
	
    var tooltipDiv = d3.select("body").append("div").node();
	
	var tooltipSettings = d3.modelvis.settings.tooltip()
						.set("title", "")
						.set("div", tooltipDiv);;
	//.set("group", selection) // TODO dacok insie treba samozrejme :/
						
	var tooltip = d3.modelvis.tooltip.generate(tooltipSettings);
	
	var i = 0;
	for(var method in data){
		var plot = d3.modelvis.lineplot()
							  .data(data[method])
							  .set("width", width)
							  .set("height", height)
							  .set("color", settings.colors[i])
							  .set("yScale", yScale)
							  .set("tooltip", tooltip);
							  
							  
		var index = parseInt(method);
		if (isNaN(index)) {
				plot.set("label", method);
		}else if(settings.labels && settings.labels.length > index){
				plot.set("label", settings.labels[index]);
		}else{
				plot.set("label", "");
		}
					  
							  
		if(settings.strokeWidths.length){					  
			plot.set("strokeWidth", settings.strokeWidths[i]);
		}					  
		if(settings.interpolations.length){
		    plot.set("interpolation", settings.interpolations[i]);
		}
		
		if (!graph) {
			graph = plot;
		}else{
		    graph.addChild(plot);					  
		}
		i++;
	}
	
				
	var root = d3.modelvis.root();
	var r1 = d3.modelvis.row();
	var r2 = d3.modelvis.row();
	
	var leftAxisCell = d3.modelvis.col();
	var graphCell = d3.modelvis.col();
	var nothing = d3.modelvis.col();
	var bottomAxisCell = d3.modelvis.col();
	
	if(axisL){
		leftAxisCell.addChild(axisL);
	}
	graphCell.addChild(graph);
	bottomAxisCell.addChild(axisD);
	
	r1.addChild(leftAxisCell);
	r1.addChild(graphCell);
	r2.addChild(nothing);
	r2.addChild(bottomAxisCell);
	
	root.addChild(r1);
	root.addChild(r2);
	var block =  selection.call(root).block;
	
	tooltip.group = d3.select(block.select("." + CLASS_PLOT).node().parentNode);
	tooltip.createEventListeners();
	
	return block;
}

// TODO rovnaku kostru pre tieto posledne ploty scatter, distribution, density
d3.modelvis.graphs.scatter = function(selection, data, settings){
	var width = settings.width;
	var height = settings.height;
	
	// TODO
	var axisD = d3.modelvis.axis()
						  .set("orientation", "bottom")
						  .set("scale", makeScale([0, 47],[0, width - 6]))
						  .set("tickCount", 48)
						  .set("label", "Forecast Hours")
						  .set("width", width)
						  .set("tickFormat", d3.modelvis.formatting.every2nd);
	
	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var yScale = settings.yScale || makeScale([minX,maxX], [settings.height, 0]);
	
	var axisL = d3.modelvis.axis()
					.set("scale", yScale)
					.set("label", "Error [hPa]") 
					.set("textSize", 11)
					.set("height", height);
	
	var plot = d3.modelvis.scatterplot()
						  .data(data)
						  .set("width", width)
						  .set("height", height);
						  
				
	var root = d3.modelvis.root();
	var r1 = d3.modelvis.row();
	var r2 = d3.modelvis.row();
	
	var leftAxisCell = d3.modelvis.col();
	var graphCell = d3.modelvis.col();
	var nothing = d3.modelvis.col();
	var bottomAxisCell = d3.modelvis.col();
	
	leftAxisCell.addChild(axisL);
	
	graphCell.addChild(plot);
	bottomAxisCell.addChild(axisD);
	
	r1.addChild(leftAxisCell);
	r1.addChild(graphCell);
	r2.addChild(nothing);
	r2.addChild(bottomAxisCell);
	
	root.addChild(r1);
	root.addChild(r2);
	
	return selection.call(root).block;
}


d3.modelvis.graphs.distribution = function(selection, data, settings){
	var width = settings.width;
	var height = settings.height;
	
	var axisD = d3.modelvis.axis()
						  .set("orientation", "bottom")
						  .set("scale", makeScale([0, 47],[0, width - 6]))
						  .set("tickCount", 48)
						  .set("label", "Forecast Hours")
						  .set("width", width)
						  .set("tickFormat", d3.modelvis.formatting.every2nd);
	
	var minX = d3.min(data, function(array) {
		return d3.min(array);
	});	
	var maxX = d3.max(data, function(array) {
		return d3.max(array);
	});	
	
	var yScale = settings.yScale || makeScale([minX,maxX], [settings.height, 0]);
	
	var axisL = d3.modelvis.axis()
					.set("scale", yScale)
					.set("label", "Error [hPa]") 
					.set("textSize", 11)
					.set("height", height);
	
	var plot = d3.modelvis.distributionplot()
						  .data(data)
						  .set("width", width)
						  .set("height", height);
						  
				
	var root = d3.modelvis.root();
	var r1 = d3.modelvis.row();
	var r2 = d3.modelvis.row();
	
	var leftAxisCell = d3.modelvis.col();
	var graphCell = d3.modelvis.col();
	var nothing = d3.modelvis.col();
	var bottomAxisCell = d3.modelvis.col();
	
	leftAxisCell.addChild(axisL);
	
	graphCell.addChild(plot);
	bottomAxisCell.addChild(axisD);
	
	r1.addChild(leftAxisCell);
	r1.addChild(graphCell);
	r2.addChild(nothing);
	r2.addChild(bottomAxisCell);
	
	root.addChild(r1);
	root.addChild(r2);
	
	return selection.call(root).block;
}


// TODO others