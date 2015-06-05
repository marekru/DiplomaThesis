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
 * @version $Id: metainfo.js,v 1.3 2015/04/20 14:40:06 marekru Exp $
 *
 */ 

if(!d3.modelvis){
	d3.modelvis = {};
}

function displayMetaData(metadata, el){
	var table;
	if(metadata.append){
		table = el.append("table").attr("id", METAINFO_ID);
	}else{
		table = el.insert("table", "#" + GRAPH_ID).attr("id", METAINFO_ID);	
	}
	
    table.append("caption").text(metadata.caption);
	
	var timeFomrat = d3.time.format("%Y/%m/%d");
	
	var variable = metadata.variable.replace("wind", "wind ");
	if(variable === "humidity"){
		variable = "rel. " + variable;
	}
	
	
	
	var i = 0;
	var rows = [];
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Statistic");
	rows[i].append("td")
		   .append("select")
		   .attr("id", "statsSelect");
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Variable");
	rows[i].append("td").append("select").attr("id","variableSelect");
	//rows[i].append("span").classed("unit", true).text("[" + metadata.unit + "]");
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Station Name");
	rows[i].append("td").append("select").attr("id","stationSelect");
	//rows[i].append("td").text(metadata.station.name);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Station Location");
	rows[i].append("td").text(metadata.station.lat + ", " + metadata.station.lon);
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Station Elevation");
	rows[i].append("td").text(metadata.station.alt)
		   .append("span").classed("unit", true).text(" m");
	i++;
	
	rows[i] = table.append("tr");
	rows[i].append("th").text("Model");
	rows[i].append("td").append("select").attr("id","modelSelect");
	//rows[i].append("td").text(metadata.model);
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
	
	
	var stats = $("statsSelect");
	Select.init( stats );
	stats.fillByMap({"MFE": "MFE", "MAE": "MAE", "RMSE":"RMSE"});
	stats.setValue(metadata.statistics);
	
	var vars = $("variableSelect");
	Select.init( vars );
	vars.fillByMap({"pressure": "pressure", "temperature": "temperature" , "humidity": "humidity", "windspeed": "windspeed", "winddirection": "winddirection" });
	vars.setValue(metadata.variable);
	
	var stations = $("stationSelect");
	Select.init( stations );
	stations.fillByMap({"Al Faqaa": "Al Faqaa", "Al Jadaf": "Al Jadaf" , "Al Warqaa": "Al Warqaa", "Hatta": "Hatta", "Jebel Ali": "Jebel Ali", "Jebel Ali Ind": "Jebel Ali Ind" });
	stations.setValue(metadata.station.name );
	
	var models = $("modelSelect");
	Select.init( models );
	models.fillByMap({"WRF": "WRF", "ECMWF": "ECMWF" , "Aladin": "Aladin" });
	models.setValue( metadata.model );
	
	
}

 
function MetaData(){
	this.set = set;
	
	this.caption = "Meta Information"; 
	this.variable = "";
	this.model = "";
	this.timeinterval = verifCfg.timeInterval;
	this.interpolation = "Bilinear interpolation";
	this.station = {};
	this.station.name = "";
	this.station.lat = 24.73;
	this.station.lon = 55.62;
	this.station.alt = 218;
	this.verificationType = "Point-To-Point";
	this.run = "00"; 
	this.statistics = "";
	this.unit = ""; 
	this.append = false;
	this.fun = function(){};
} 
 
d3.modelvis.metainfo = function(){

	var data = new MetaData();
	
	function display(selection){
		displayMetaData(data, selection);
	}
	
	display.set = function(attName, value){
		data.set(attName, value);
		return display;
	}
	
	return display;
}



 

