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
 * @version $Id: verification.js,v 1.37 2015/04/21 13:24:46 marekru Exp $
 *
 */ 

function $(x) { return document.getElementById(x); } 
 
var verifCfg = null;
var visCfg = null;

var ContinuousStatisticsMethod = X2O.getConstructor('com.microstepmis.util.math.ContinuousStatistics$ContinuousStatisticsMethod');


var CONTENT_ID = "content";
var METAINFO_ID = "metainfo"; 
var TOOLTIP_ID = "tooltip"; 
var TOGGLE_BUTTON_ID = "toggle"; 
var GRAPH_ID = "graph"; 
var UNIFORM_SCALE_CHECKBOX_ID = "uniformScaleCheckBox";
var CLASS_PADDING = "graphPadding";
var CLASS_GRAPH = "graph";
var CLASS_SVG_WRAPPER = "svgWrapper";
 
var data = null;

var uniformScale = true;

var mainPlot = null;


var variables = [ "pressure"];//, "temperature", "windspeed", "winddir" ]; // humidity
var units     = [ "hPa", "degC", "m/s", "deg" ]; // "%"
var stations = [ "Al Faqaa"];//, "Al Jadaf", "Al Warqaa", "Hatta", "Jebel Ali", "Jebel Ali Ind" ];
var selected = ""; 
 
function init(){
 
	$(GRAPH_ID).innerHTML = "Loading configuration ...";
 
	/* Na zaciatku nacitam konfiguraky*/
	RPCCall(null, 
            "com.microstepmis.model.verification.verificationtool.ModelVerificationCfg",
            "readConfiguration",
            null, 
            handleVerificationConfig);  

	RPCCall(null, 
            "com.microstepmis.model.verification.verificationtool.VerificationVisCfg",
            "readConfiguration",
            null, 
            handleVisualizationConfig); 
			
	fillStationSelect();		
			
	addListeners();
	
	if($(UNIFORM_SCALE_CHECKBOX_ID)){
		$(UNIFORM_SCALE_CHECKBOX_ID).checked = uniformScale;	
	}
	doSomething();
	
}

function fillStationSelect(){
	stations.unshift({});
	var fun = function(a, b){
	  var key = b.toLowerCase().replace(/\s/g,"");
	  a[key] = b;
	  return a;
	};

	map = stations.reduce(fun);
	stations.shift();
	
	var select = d3.select("#content").insert("select", "#" + GRAPH_ID).attr("id", "stationSelect").node();
	Select.init( select );
	select.fillByMap(map);
	select.setValue("alfaqaa");
}

function addVariableToStation(station, varname, treshold){
	var variable = X2O.createInstance('com.microstepmis.model.verification.verificationtool.VarCfg');
	variable.variableName = varname;
	variable.treshold = treshold;
	
	station.variables.push(variable);
}


function addStationToRequest(request, name, variables){
	var station = X2O.createInstance('com.microstepmis.model.verification.verificationtool.StationCfg');
	station.name = name;
	station.variables = X2O.createInstance('java.util.HashSet');
	station.runs = X2O.createInstance('java.util.HashSet');
	for(var i = 0;i < variables.length;i++){
		addVariableToStation(station, variables[i], 0.0);
	}
	request.stations.push(station);
}


/*
  TODO tato metoda bude generovat request na zaklade nastaveni v GUI a configuraku
*/
function createRequest(){
	var request = X2O.createInstance('com.microstepmis.model.verification.verificationtool.VisDataRequest');
	
	request.models = X2O.createInstance('java.util.ArrayList');
	request.models.push("WRF");
	
	//request.variables = X2O.createInstance('java.util.ArrayList');
	request.stations = X2O.createInstance('java.util.ArrayList');
	
	
	for(var i = 0;i < stations.length;i++){
		addStationToRequest(request, stations[i], variables);
	}
	
	request.wantMetaInfo = false;
	
	request.surface  = X2O.createInstance('com.microstepmis.model.verification.verificationtool.VisDataRequest$TableDataRequest');
	request.progress = X2O.createInstance('com.microstepmis.model.verification.verificationtool.VisDataRequest$TableDataRequest');
	request.upperair = X2O.createInstance('com.microstepmis.model.verification.verificationtool.VisDataRequest$TableDataRequest');
	
	
	request.surface.wantThis = true;
	request.surface.wantErrorData = false;
	request.surface.wantErrorTables = true;
	request.surface.wantErrors = true;
	request.surface.wantCredibility = true;
	request.surface.wantContingencyTable = false;
	request.surface.wantIntervals = true;
	
		
	request.surface.continuousMethods  = X2O.createInstance('java.util.HashSet');
	request.surface.categoricalMethods = X2O.createInstance('java.util.HashSet')
		

	request.surface.continuousMethods.push(ContinuousStatisticsMethod.MFE);
	request.surface.continuousMethods.push(ContinuousStatisticsMethod.MAE);
	request.surface.continuousMethods.push(ContinuousStatisticsMethod.RMSE);
	request.surface.continuousMethods.push(ContinuousStatisticsMethod.SD);
	//request.surface.continuousMethods.push(ContinuousStatisticsMethod.TS);
	
	
	var CategoricalStatisticsMethod = X2O.getConstructor('com.microstepmis.model.verification.verificationtool.CategoricalStatistics$CategoricalStatisticsMethod');
	request.surface.categoricalMethods.push(CategoricalStatisticsMethod.POD);
	
	
	request.progress.wantThis = true;
	request.progress.wantErrorData = false;
	request.progress.wantErrorTables = true;
	request.progress.wantErrors = true;
	request.progress.wantCredibility = true;
	request.progress.wantContingencyTable = false;
	request.progress.wantIntervals = true;
		
	request.progress.continuousMethods  = X2O.createInstance('java.util.HashSet');
	request.progress.continuousMethods.push(ContinuousStatisticsMethod.MFE);
	request.progress.continuousMethods.push(ContinuousStatisticsMethod.MAE);
	request.progress.continuousMethods.push(ContinuousStatisticsMethod.RMSE);
	request.progress.continuousMethods.push(ContinuousStatisticsMethod.SD);
	
	
	request.upperair.wantThis = false;

	
	return request;
}

function requestData(request, handler){
	RPCCall(null, 
		"com.microstepmis.model.verification.verificationtool.VerifDataAccessPoint",
		"requestLastData",
		null, 
		handler || handleResponse,
		request); 
}


function checkUniformScale(e){
	uniformScale = e.target.checked;
	showData();
}


function addListeners(){
	
	var uniformScalecheckBox = $(UNIFORM_SCALE_CHECKBOX_ID);
	var toggleButton = $(TOGGLE_BUTTON_ID);
	var select = $("stationSelect");
	
	if(uniformScalecheckBox){
		utils_addEvent(uniformScalecheckBox, "click", checkUniformScale, false);
	}
	if(toggleButton){
		utils_addEvent(toggleButton, "click", toggleGraph, false);
	}
	
	if(select){
		utils_addEvent(select, "click", function(){ showData(); }, false);
	}
}
 
 
function alertError(response){
	alert( 
		Dictio.tr( "Error" ) + ": " + 
		Dictio.tr( "Server operation failed" ) + ".\n" + 
		Dictio.tr( "Error message" ) + ": " + response.errMessage );
}
 
function handleVerificationConfig(result, response, request){
	if(!result) {
		alertError(response);
		return;
	}
	verifCfg = result;
}
 
 
function handleVisualizationConfig(result, response, request){
	if(!result) {
		alertError(response);
		return;
	}
	visCfg = result;
}


function handleResponse(result, response, request){
	if(!result) {
		alertError(response);
		return;
	}
	data = result;
	
	$(GRAPH_ID).innerHTML = "Loading graph ...";
	
	showData();
}


function getStationFromCfg(name){
	if (!verifCfg) {
		return;	
	}
	var st = verifCfg.stations;
	for(var i = 0;i < st.length;i++){
		if(st[i].name == name){
			return st[i];
		}
	}
}

function getVariableFromCfg(stationName, variableName) {
	var station = getStationFromCfg(stationName);
	if (!station) {
		return;
	}
	var vars = station.variables;
	for(var i = 0;i < vars.length;i++){
		if (vars[i].variableName == variableName) {
			return vars[i];
		}
	}
}


// TODO pridat do d3.modelvis
function showMetaInfo(metadata, el, append){
	var table;
	if(append){
		table = el.append("table").attr("id", METAINFO_ID);
	}else{
		table = el.insert("table", "#" + GRAPH_ID).attr("id", METAINFO_ID);	
	}
	
    table.append("caption").text("Meta Information");
	
	var timeFomrat = d3.time.format("%Y/%m/%d");
	
	var variable = metadata.variable.replace("wind", "wind ");
	if(variable === "humidity"){
		variable = "rel. " + variable;
	}
	
	var i = 0;
	var rows = [];
	rows[i] = table.append("tr");
	rows[i].append("th").text("Variable");
	rows[i].append("td").text(variable + " (" + metadata.statistics + ") ")
		   .append("span").classed("unit", true).text("[" + metadata.unit + "]");
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Station Name");
	rows[i].append("td").text(metadata.station.name);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Station Location LatLon");
	rows[i].append("td").text(metadata.station.lat + ", " + metadata.station.lon);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Station Elevation");
	rows[i].append("td").text(metadata.station.alt)
		   .append("span").classed("unit", true).text(" m");
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Model");
	rows[i].append("td").text(metadata.model);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Verification Type");
	rows[i].append("td").text(metadata.verificationType);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Interpolation Type");
	rows[i].append("td").text(metadata.interpolation);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Run");
	rows[i].append("td").text(metadata.run);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Time Interval");
	rows[i].append("td").text(timeFomrat(metadata.timeinterval.from) + " - " + timeFomrat(metadata.timeinterval.to) );
	// intervalFormat(metadata.timeinterval)
	i++;
}

function RMSE(values){
	var pom = d3.mean(values, function(d){ return d*d; });
	return Math.sqrt(pom);
}

function yearRMSE(errors){
	var result = [];
	for(var i = 0;i < errors.length; i++){
		for(var j = 0;j < errors[i].length; j++){
			if(result[j] === undefined){
				result[j] = [];
			}
			result[j].push(errors[i][j]);
		}
	}
	for(var i = 0;i < result.length; i++){
		result[i] = [].concat.apply([], result[i]);
		result[i] = RMSE(result[i]);
	}
	return result;
}



function yearMonthRMSE(errors){
	var result = [];
	for(var i = 0;i < errors.length; i++){
		var pom = [];
		pom = pom.concat.apply(pom, errors[i]);
		result[i] = RMSE(pom);
	}
	return result;
}

function showData(station){
	var st = stations[$("stationSelect").selectedIndex];
	station = station || st || "Al Faqaa";
	
	if(station == selected){
		return;
	}
	selected = station;
	$(GRAPH_ID).innerHTML = "";
		
	var model = "WRF";
	var method = ContinuousStatisticsMethod.RMSE;
	var width = 600;
	var barHeightScale = 1.5;
	
	var colors = DEFAULT_CATEGORICAL_COLORS;
		
	var d = document.getElementById(TOOLTIP_ID);
	if(! d){
		d = document.createElement("div");
		d.id = TOOLTIP_ID;
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(d);
	}
	
	
	for(var i = 0; i < variables.length; i++){
		var variable = variables[i];
		var unit = units[i].replace("deg", "\u00B0");
		
		// TODO na zaklade configu sa rozhodnut ako to vizualizovat !!!
		var pressData = data.modelData[model][station][variable].continuousStatsSurface;
		var credData = data.modelData[model][station][variable].credibilitySurface;
		var intervals = data.modelData[model][station][variable].intervalsSurface;
		var errors = data.modelData[model][station][variable].errorsSurface;
		var varData = data.modelData[model][station][variable];
		
		
		var barHeight = barHeightScale * Math.floor(width / pressData[0][method].length); 
		
		
		var graphDIV = d3.select("#" + GRAPH_ID)
						 .append("div")
						 .classed(CLASS_GRAPH, true);
		
		// TODO
		var metadata = {};
		metadata.variable = variable;
		metadata.model = model;
		metadata.timeinterval = verifCfg.timeInterval;
		metadata.interpolation = "Bilinear interpolation";
		metadata.station = {};
		metadata.station.name = station;
		metadata.station.lat = 24.73;
		metadata.station.lon = 55.62;
		metadata.station.alt = 218;
		metadata.verificationType = "Point-To-Point";
		metadata.run = "00"; 
		metadata.statistics = method;
		metadata.unit = unit; 
		showMetaInfo(metadata, graphDIV);
		
		
		var svgWrapper = graphDIV.append("div")
								 .classed(CLASS_SVG_WRAPPER, true);
		
		var svg = svgWrapper.append("svg")
					.attr("width", width)
					.attr("height", barHeight * pressData.length);
			
		uniformScale = getVariableFromCfg(station, variable).scale; 			
		
		mainPlot = multiMinimaliticPlot(svg, varData, width, barHeight, method, d, colors, uniformScale, unit);
		
		/*
		var rmse = yearRMSE(errors);
		var bar = barPlot(mainPlot.element, rmse, width, 50, d, "#8FB2D1", "#DEEEFF", false, true);
		bar.element.attr("transform", "translate(0," + (12*barHeight) +")");
		
		
		
		var ymRmse = yearMonthRMSE(errors);
		var bar = barPlot(mainPlot.element, ymRmse, 50, 12*barHeight, d, "#8FB2D1", "#DEEEFF", true);
		bar.element.attr("transform", "translate(" + width + ", 0)");
		var svgWidth = parseInt(svg.attr("width"));
		svg.attr("width", svgWidth + 50);
		
		fitSVGToContent(svg);
		*/
		
		svgWrapper.classed(CLASS_PADDING, true);

	}
	
	
	
	/*
	var stringIntervals = [];
	for(var i = 0;i < intervals.length;i++){
		stringIntervals[i] = intervalFormat(intervals[i]);
	}
	
	
	var intervalScale = d3.scale
						  .ordinal()
						  .domain(stringIntervals)
						  .rangePoints([barHeight * 0.5, barHeight * (pressData.length - 0.5) ]);

	
	// TODO musi sa to hybat spolu s celym onym, takze treba to inak vyriesit :/
	addAxis(svg, 0, 0 , intervalScale, "left", "Interval", intervals.length, null, true, stringIntervals);
	*/
	
	
	/*
	// TODO: zbavit sa magie s cislami
	
	var tt = new ToolTip("Values", g, d);	
	tt.addLine("Hour", mplot, displayPlotHour);	
	tt.addLine("RMSE small", mplot, displayPlotValue);	
	tt.createEventListeners();
	
	g.on("click", toggleMultiline(tt, g, pressData, colors, 600, 80, 20, 500) );
	*/
	
	//var other = svg.append("svg:g").attr("transform", "translate(0, 20)");
	//var mplot = minimalistic(other, data["MFE"], 600, 20, new ColorPalette());
	
	
	//Scatter Plot
	//scatterPlot(GRAPH_ID, data, true);
	
}


function eventFire(el, etype){
	if (el.fireEvent) {
		el.fireEvent('on' + etype);
	}else{
		var evObj = document.createEvent('Events');
		evObj.initEvent(etype, true, false);
		el.dispatchEvent(evObj);
	}
}


function toggleGraph(e){
	var plots = mainPlot.plots;
	for(var i = 0;i < plots.length;i++){
		var el = plots[i].element.node();
		eventFire(el, 'click');
	}
}

function doSomething(){


	$(GRAPH_ID).innerHTML = "Loading data ...";
	var request = createRequest();
	
	requestData(request);


	/*
	// TODO na zaklade configov a nastaveni GUI nastavi spravne meno metody!
	var methodName = "getLastConinuousStatistics"; //"getLastErrors"; 

	RPCCall(null, 
            "com.microstepmis.model.verification.verificationtool.VerifDataAccessPoint",
            methodName,
            null, 
            handleData); 

	*/
	
}


