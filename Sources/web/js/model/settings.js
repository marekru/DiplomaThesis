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
 * @version $Id: settings.js,v 1.20 2015/04/21 13:23:28 marekru Exp $
 *
 */ 
function set(attrName, value){
    var names = attrName.split(".");
	var actual = this;
	var lastIndex = names.length - 1;
	for(var i = 0;i < lastIndex ;i++){
		var name = names[i];
		if(! (name in actual) ){
			actual[name] = {};
		}	
		actual = actual[names[i]];
    }
	actual[names[lastIndex]] = value;
	return this;
}

function cast(f){
    for(var key in f){
	  if(key === "generator"){
		continue;
	  }
      this[key] = f[key];
    }; 
	return this;
}



	
function AnimationSettings(){
	this.easingTypes = {
		linear: "linear",
		swing: "swing",
		easeInQuad: "easeInQuad",
		easeOutQuad: "easeOutQuad",
		easeInOutQuad: "easeInOutQuad"
	};

	this.set = set;
	this.complete = function(){};
	
	this.duration = 500;
	this.easing = this.easingTypes.swing;
	
	// http://api.jquery.com/animate/
}

// Tato trieda je pravdepdoobne odsudena na zanik	
function LayoutSettings(selector){	
	this.set = set;
	
	// Booleans
	this.closable = true;
	this.resizable = true;
	this.slideable = false;
	this.hideTogglerOnSlide = true;
	this.initClosed = false;	
	this.initHidden = false;
	// CLASSES
	this.paneClass = "pane";
	this.resizerClass = "resizer";
	this.togglerClass = "toggler";
	// Sizes
	this.size = "auto";
	this.minSize = 0; // 0 == da sa zmensit ako to len ide
	this.maxSize = 0; // 0 == da sa zvacsit ako to len ide
	this.spacing_open = 10; // 10
	this.spacing_closed = 10; // 10
	this.togglerLength_closed = "100%";
	this.togglerLength_open = 50;
	// toggler
	this.togglerAlign_open   = "center";
	this.togglerAlign_closed = "center";
	this.togglerContent_open = "";
	this.togglerContent_closed = "";
	this.togglerTip_open   = Dictio.tr("Open"); 
	this.togglerTip_closed = Dictio.tr("Close");
	// resizer
	this.resizerTip = Dictio.tr("Resize");
	this.resizerDragOpacity = 0.5;
	this.resizerCursor = "ew-resize"; 
	// slider
	this.sliderTip = Dictio.tr("Slide Open"); 
	this.sliderCursor = "pointer"; 	
	this.slideTrigger_open = "click"; 	
	this.slideTrigger_close = "mouseout"; 	
	// animation
	this.fxName = "slide";  // "none", "slide", "drop", "scale"
	this.fxSpeed = "normal";
	this.fxSettings = new AnimationSettings();
	// events
	this.onshow = this.onshow_start = this.onshow_end = "";
	this.onhide = this.onhide_start = this.onhide_end = "";
	this.onopen = this.onopen_start = this.onopen_end = "";
	this.onclose = this.onclose_start = this.onclose_end = "";
	this.onresize = this.onresize_start = this.onresize_end = "";
	// TODO hotkeys
		
	if(selector){
		this.paneSelector = selector;
	}else{
		this.center = new LayoutSettings(".center")
		this.north = (new LayoutSettings(".north")).set("resizerCursor","ns-resize");;
		this.south = (new LayoutSettings(".south")).set("resizerCursor","ns-resize");;
		this.east = new LayoutSettings(".east");
		this.west = (new LayoutSettings(".west")).set("spacing_open", 10).set("spacing_closed", 10);		
	}
	
	
}

function ToolTipLineSettings(){
	this.set = set;
	
	this.label = "Dummy Label";
	this.fun = d3.modelvis.tooltip.display.args;
	this.rule = null;
	this.color = null;
	
	this.source = {};
	this.source.data = [];
	this.source.palette = null;
	this.source.xScale = makeScale([0,1],[0,1]);
	this.source.yScale = makeScale([0,1],[0,1]);
}


function ToolTipSettings(){
	this.set = set;
	
	this.title = "";
	this.group = null;
	this.div = null;
	this.hasRule = false;
	this.lines = [];
}

function AlignmentSettings(){
	this.set = set;
		
	this.horizontalAlignments = {
		left: "left",
		right: "right"
	};	
	
	this.verticallAlignments = {
		top: "top",
		bottom: "bottom",
		middle: "middle",
		baseline: "baseline",
		texttop: "text-top",
		textbottom: "text-bottom"
	};	

	// Properties
	this.vertical = this.verticallAlignments.top;
	this.horizontal = this.horizontalAlignments.left;
}


// MODUL SETTINGS

// abstraktne nastavenia abstraktneho modulu
function ModulSettings(){
	// Methods
	this.set = set;
	this.generator = function(selection, data, settings){
		console.log("none");
	};
	
	this.setGenerator = function(g){
		if(typeof(g) === "string"){
			if(g in d3.modelvis.plotting){
				this.generator = d3.modelvis.plotting[g];
			}else if(g in d3.modelvis.layout){
				this.generator = d3.modelvis.layout[g];
			}
		}else if(typeof(g) === "function"){
			this.generator = g;
		}
		return this;
	}
	
	this.click = function(){
		if(this.nodeName){
			console.log("click " + this.nodeName);
		}
	}
	// modul ID
	this.id = "";
	
	// Dimensions
	this.width = 0;
	this.height = 0;
	
	// Labels
	this.xLabel = "";
	this.yLabel = "";
	
	// zarovnanie modulu!
	this.alignment = d3.modelvis.settings.alignment();
	
}

function AxisSettings(){
	ModulSettings.call(this);

	this.orientationTypes = {
		top: "top",
		right: "right",
		bottom: "bottom",
		left: "left"
	};
	
	this.generator = d3.modelvis.plotting.axis;
	
	// ticks
	this.tickSize = 5;
	this.tickPadding = 3;
	this.tickCount = 5;
	this.tickCountAdaptive = false;
	this.tickValues = [];
	this.ticksOnly = false;
	this.tickFormat = d3.modelvis.formatting.every();
	
	this.textShiftX = 0;
	this.textShiftY = 0;
	this.textSize = 10;
	
	// colors
	this.bgColor = "none";
	this.color = "#777";
	
	this.orientation = this.orientationTypes.left;
	
	this.scale = null;
}
utils_extend(ModulSettings, AxisSettings);


function GridSettings(){
	AxisSettings.call(this);

	this.lineTypes = {
		solid: "solid",
		dashed: "dashed",
		dotted: "dotted",
		dashdotted: "dash-dotted"
	};
	this.cast = cast;
	this.generator = d3.modelvis.plotting.grid;
	
	this.lineType = this.lineTypes.dashed;	
	this.horizontal = false;
}
utils_extend(AxisSettings, GridSettings);


function LegendSettings(){
	ModulSettings.call(this);
	
	this.generator = d3.modelvis.plotting.legend;
	// TODO:
}
utils_extend(ModulSettings, LegendSettings);


function ColorLegendSettings(){
	LegendSettings.call(this);
	
	this.width = 20;
	this.height = 150;
	this.generator = d3.modelvis.plotting.colorlegend;
	this.palette = new ColorPalette(null, [0, 1], true);
	this.horizontal = false;
	this.gradientID = "ColorGradient";
}
utils_extend(LegendSettings, ColorLegendSettings);


// TODO: other legends

// PLOT SETTINGS

// abstraktna trieda nasaveni plotu
// TODO: Co s tymito vecami?
// this.unfiformScale = true;
// this.flip = false;
function PlotSettings(){
	ModulSettings.call(this);

	this.interpolationTypes = {
		linear: "linear", // piecewise linear segments, as in a polyline.
		linearClosed: "linear-closed", // close the linear segments to form a polygon.
		step: "step", // alternate between horizontal and vertical segments, as in a step function.
		stepBefore: "step-before", // alternate between vertical and horizontal segments, as in a step function.
		stepAfter: "step-after", // alternate between horizontal and vertical segments, as in a step function.
		basis: "basis", // a B-spline, with control point duplication on the ends.
		basisOpen: "basis-open", //an open B-spline; may not intersect the start or end.
		basisClosed : "basis-closed", // a closed B-spline, as in a loop.
		bundle: "bundle", // equivalent to basis, except the tension parameter is used to straighten the spline.
		cardinal: "cardinal", // a Cardinal spline, with control point duplication on the ends.
		cardinalOpen: "cardinal-open", // an open Cardinal spline; may not intersect the start or end, but will intersect other control points.
		cardinalClosed: "cardinal-closed", // a closed Cardinal spline, as in a loop.
		monotone: "monotone" //cubic interpolation that preserves monotonicity in y.
	};
	
	this.orientationTypes = {
		horizontal: "horizontal",
		vertical: "vertical"
	};
	
	// Scales
	this.xScale = null;
	this.yScale = null;
	
	// Colors
	this.color = "black";
	this.bgColor = "white";
	this.opacity = 1.0;
	
	//
	this.orientation = this.orientationTypes.horizontal;
	
	this.tooltipDiv = null;
	this.label = null;
}
utils_extend(ModulSettings, PlotSettings);


function BarPlotSettings(){
	PlotSettings.call(this);
	
	this.gapsize = 1;
	this.generator = d3.modelvis.plotting.bar;
}
utils_extend(PlotSettings, BarPlotSettings);


function ColorPlotSettings(){
	PlotSettings.call(this);
	
	this.generator = d3.modelvis.plotting.color;
	// Palette
	this.palette = new ColorPalette();
	
}
utils_extend(PlotSettings, ColorPlotSettings);

function BubblePlotSettings(){
	PlotSettings.call(this);
	
	this.generator = d3.modelvis.plotting.bubble;
}
utils_extend(PlotSettings, BubblePlotSettings);


function LinePlotSettings(){
	PlotSettings.call(this);
	
	this.generator = d3.modelvis.plotting.line;
	// TODO
	this.strokeWidth = 1;
	this.interpolation = this.interpolationTypes.cardinal;
	this.tooltip = null;
}
utils_extend(PlotSettings, LinePlotSettings);


function ScatterPlotSettings(){
	PlotSettings.call(this);
	this.generator = d3.modelvis.plotting.scatter;
	
	this.radius = 3;
	
}
utils_extend(PlotSettings, ScatterPlotSettings);

function DistributionPlotSettings(){
	PlotSettings.call(this);
	this.generator = d3.modelvis.plotting.distribution;
	
	this.alphaJump = 0.25;
	this.lineColor = "#FFC200";
	this.percents = [ 1, 0.8, 0.5, 0.3 ];
	
}
utils_extend(PlotSettings, DistributionPlotSettings);


function DensityPlotSettings(){
	PlotSettings.call(this);
	this.generator = d3.modelvis.plotting.density;
	
	this.colors = ["white", "#bdd7e7", "#6baed6", "#2171b5", "navy"]; // moznoze bez navy
	this.linecolor = "white";
	this.linewidth = 0.5;
	
}
utils_extend(PlotSettings, DensityPlotSettings);


function StripePlotSettings(){
	PlotSettings.call(this);
	this.generator = d3.modelvis.plotting.stripe;
	
	this.alphaJump = 0.25;
	this.depth = 3;
	this.color = "black";
	this.extremecolor = "navy";
	this.mediancolor = "#FFC200"; //"black";
	
}
utils_extend(PlotSettings, StripePlotSettings);

function FunctionalboxPlotSettings(){
	PlotSettings.call(this);
	this.generator = d3.modelvis.plotting.functionalbox;
	
	this.color = [100, 150, 230];
	this.envelopeColor = [50, 50, 50];
	this.outlierColor = "red";
	this.meanColor = "white";
	this.medianColor = [20,20,20];
	this.regions = [0.5];
	
}
utils_extend(PlotSettings, FunctionalboxPlotSettings);

function GraphSettings(){
	PlotSettings.call(this);
	
	// Booleans
	this.sameScale = true;
	this.showLegend = true;
	this.showTooltip = true;
	// Grids
	this.hGrid = false; // d3.modelvis.settings.grid().set("horizontal", true);
	this.vGrid = d3.modelvis.grid();
	// Axis
	this.hAxis = d3.modelvis.settings.axis().set("orientation", "bottom").set("tickCountAdaptive", true);
	this.vAxis = d3.modelvis.settings.axis().set("orientation", "left");
	
	this.xLabel = "Hour";
	this.xDisplay = d3.modelvis.tooltip.display.plotHour;

}
utils_extend(PlotSettings, GraphSettings);


function ColorGraphSettings(){
	GraphSettings.call(this);
	this.generator = d3.modelvis.graphs.color;
	
	this.barHeight = 0;
	this.palette = d3.modelvis.settings.colorplot().palette;
	this.showdistribution = true; // radsej false
	// TODO
}
utils_extend(GraphSettings, ColorGraphSettings);

function LineGraphSettings(){
	GraphSettings.call(this);
	this.generator = d3.modelvis.graphs.line;
	
	this.colors = DEFAULT_CATEGORICAL_COLORS;
	this.strokeWidths = [];
	this.interpolations = [];
}
utils_extend(GraphSettings, LineGraphSettings);

function ScatterGraphSettings(){
	GraphSettings.call(this);
	this.generator = d3.modelvis.graphs.scatter;
	
}
utils_extend(GraphSettings, ScatterGraphSettings);

function DistributionGraphSettings(){
	GraphSettings.call(this);
	this.generator = d3.modelvis.graphs.distribution;
	this.plot = d3.modelvis.distributionplot;
	
}
utils_extend(GraphSettings, DistributionGraphSettings);

if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.settings = {};

d3.modelvis.settings.colorLegendCounter = 0;

d3.modelvis.settings.animation = function(){
  return new AnimationSettings();
};

d3.modelvis.settings.layout = function(){
  return new LayoutSettings();
};

d3.modelvis.settings.alignment = function(){
  return new AlignmentSettings();
};

// TOOLTIP
d3.modelvis.settings.tooltipline = function(){
	return new ToolTipLineSettings();
}

d3.modelvis.settings.tooltip = function(){
	return new ToolTipSettings();
}

// MODULS
d3.modelvis.settings.modul = function(){
  return new ModulSettings();
};

d3.modelvis.settings.root = function(){
  return d3.modelvis.settings.modul().setGenerator("root");
};

d3.modelvis.settings.row = function(){
  return d3.modelvis.settings.modul().setGenerator("row");
};

d3.modelvis.settings.col = function(){
  return d3.modelvis.settings.modul().setGenerator("col");
};

d3.modelvis.settings.axis = function(){
  return new AxisSettings();
};

d3.modelvis.settings.coloraxis = function(){
	var resultat = d3.modelvis.settings.axis()
									   .set("color", "white")
									   .set("ticksOnly", true)
									   .set("tickSize", "100%")
									   .set("textSize", 8)
									   .set("textShiftX", 4)
									   .set("textShiftY", -4);
	return resultat;
}

d3.modelvis.settings.grid = function(){
  return new GridSettings();
};

d3.modelvis.settings.legend = function(){
  return new LegendSettings();
};

d3.modelvis.settings.colorlegend = function(){
  var i = d3.modelvis.settings.colorLegendCounter++;
  var settings = new ColorLegendSettings();
  settings.gradientID += ("" + i);
  return settings;
};

// PLOTS

d3.modelvis.settings.plot = function(){
  return new PlotSettings();
};

d3.modelvis.settings.barplot = function(){
  return new BarPlotSettings();
};

d3.modelvis.settings.colorplot = function(){
  return new ColorPlotSettings();
};

d3.modelvis.settings.bubbleplot = function(){
  return new BubblePlotSettings();
};

d3.modelvis.settings.lineplot = function(){
  return new LinePlotSettings();
};

d3.modelvis.settings.scatterplot = function(){
  return new ScatterPlotSettings();
};

d3.modelvis.settings.distributionplot = function(){
  return new DistributionPlotSettings();
};

d3.modelvis.settings.densityplot = function(){
  return new DensityPlotSettings();
};

d3.modelvis.settings.stripeplot = function(){
  return new StripePlotSettings();
};

d3.modelvis.settings.functionalboxplot = function(){
  return new FunctionalboxPlotSettings();
};

// Graphs

d3.modelvis.settings.graph = function(){
  return new GraphSettings();
};

d3.modelvis.settings.colorgraph = function(){
  return new ColorGraphSettings();
};

d3.modelvis.settings.linegraph = function(){
  return new LineGraphSettings();
};

d3.modelvis.settings.scattergraph = function(){
  return new ScatterGraphSettings();
};

d3.modelvis.settings.distributiongraph = function(){
  return new DistributionGraphSettings();
};


