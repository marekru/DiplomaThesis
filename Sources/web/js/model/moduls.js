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
 * @version $Id: moduls.js,v 1.12 2015/04/21 13:23:28 marekru Exp $
 *
 */ 

if( !d3.modelvis ){
	d3.modelvis = {}; 
}


d3.modelvis.modul = function() {
    var settings = d3.modelvis.settings.modul();
	var children = [];
	var data = [];

    function fun(selection) {
		this.block = settings.generator(selection, data, settings);
		
		
		if(this.block){
			//console.log(settings.id);
			if(settings.id){
				this.block.attr("id", settings.id);
			}
			// TODO: ak je nejaky rozumny click event, tak zobrazi kurzor ako paprcu
			this.block.on("click", settings.click); // radsej d3 ako jQuery, kedze ide o d3 plugin
			
			if(children.length > 0){
				for(var i = 0; i < children.length;i++){		
					this.block.call(children[i]);
				}
			}
		}
    }
	
	fun.set = function(attName, value){
		if(!arguments.length){
			return settings[attName]; 
		}
		settings.set(attName, value);
		return fun;
	}
	
	fun.settings = function(s){
		if(!arguments.length){
			return settings;
		}
		settings = s;
		return fun;
	}
	
	fun.data = function(d){
		if(!arguments.length){
			return data;
		}
		data = d;
		return fun;
	}
	
	fun.generator = function(g){
		if(!arguments.length){
			return settings.generator;
		}
		settings.setGenerator(g);

		return fun;
	}
	
	// Pridat subplot, os, legendu alebo iny modul
	fun.addChild = function(modul){
		children.push(modul);
		return fun;
	}

    return fun;
}


d3.modelvis.any = function(name){
	if(name && (name in d3.modelvis.settings) ){
		var s = d3.modelvis.settings[name]();
		return d3.modelvis.modul().settings( s );
	}else{
		return d3.modelvis.modul();
	}
}

// layout

d3.modelvis.root = function(){
	return d3.modelvis.any("root");
}

d3.modelvis.row = function(){
	return d3.modelvis.any("row");
}

d3.modelvis.col = function(){
	return d3.modelvis.any("col");
}

// other

d3.modelvis.axis = function(){
	return d3.modelvis.any("axis");
}

d3.modelvis.coloraxis = function(){
	return d3.modelvis.any("coloraxis");
}

d3.modelvis.grid = function(){
	return d3.modelvis.any("grid");
}

d3.modelvis.legend = function(){
	return d3.modelvis.any("legend");
}

d3.modelvis.colorlegend = function(){
	return d3.modelvis.any("colorlegend");
}

// plots

d3.modelvis.plot = function(){
	return d3.modelvis.any("plot");
}

d3.modelvis.colorplot = function(){
	return d3.modelvis.any("colorplot");
}

d3.modelvis.bubbleplot = function(){
	return d3.modelvis.any("bubbleplot");
}

d3.modelvis.barplot = function(){
	return d3.modelvis.any("barplot");
}

d3.modelvis.lineplot = function(){
	return d3.modelvis.any("lineplot");
}

d3.modelvis.scatterplot = function(){
	return d3.modelvis.any("scatterplot");
}

d3.modelvis.distributionplot = function(){
	return d3.modelvis.any("distributionplot");
}

d3.modelvis.densityplot = function(){
	return d3.modelvis.any("densityplot");
}

d3.modelvis.stripeplot = function(){
	return d3.modelvis.any("stripeplot");
}

d3.modelvis.functionalboxplot = function(){
	return d3.modelvis.any("functionalboxplot");
}

// graphs

d3.modelvis.graph = function(){
	return d3.modelvis.any("graph");
}

d3.modelvis.colorgraph = function(){
	return d3.modelvis.any("colorgraph");
}

d3.modelvis.linegraph = function(){
	return d3.modelvis.any("linegraph");
}

d3.modelvis.scattergraph = function(){
	return d3.modelvis.any("scattergraph");
}

d3.modelvis.distributiongraph = function(){
	return d3.modelvis.any("distributiongraph");
}

d3.modelvis.densitygraph = function(){
	var densityplot = d3.modelvis.densityplot;
	return d3.modelvis.any("distributiongraph").set("plot", densityplot);
}

d3.modelvis.stripegraph = function(){
	var stripeplot = d3.modelvis.stripeplot;
	return d3.modelvis.any("distributiongraph").set("plot", stripeplot);
}

d3.modelvis.functionalboxgraph = function(){
	var functionalboxplot = d3.modelvis.functionalboxplot;
	return d3.modelvis.any("distributiongraph").set("plot", functionalboxplot);
}
