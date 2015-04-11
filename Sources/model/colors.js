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
 * @version $Id: colors.js,v 1.5 2015/02/17 16:06:45 marekru Exp $
 *
 */ 


	
var DEFAULT_COLOR_PALETTE = [
		[ 142, 208, 246 ], // light blue
		[ 52, 60, 168 ],   // dark blue
		[ 47, 107, 25 ],  // green
		[ 237, 200, 20 ], // yellow
		[ 240, 11, 0 ]  // red
	];
	
	
var GREY_RED_COLOR_PALETTE = [
		[ 100, 100, 100 ],
		[ 150, 150, 150 ],
		[ 200, 200, 200 ],
		[ 255, 200, 200 ],
		[ 255, 150, 150 ],
		[ 255, 50, 50 ]
	];
	
var JET_COLOR_PALETTE = [
		[0, 0, 255],	// blue
		[0, 255, 255],  // cyan
		[0, 155, 0],	// green
		[255, 255, 0],  // yellow
		[155, 0, 0]		// red
	];

	
var WHITE_RED_COLOR_PALETTE = [
		"white", "red"
	];
	
	
var BLACK_RED_COLOR_PALETTE = [
		"black", "red"
	];
	
var GREEN_YELLOW_RED_COLOR_PALETTE = [
		[ 47, 107, 25 ],  // green
		[ 237, 200, 20 ], // yellow
		[ 240, 11, 0 ]  // red
	];


var BLUE_GREY_RED_COLOR_PALETTE = [
		[ 25, 100, 210 ],  // blue
		[245, 245, 245],//[ 20, 20, 20 ], // grey
		[ 220, 0, 0 ]  // red
	  ];
	

var PURPLE_GREY_ORANGE_COLOR_PALETTE = [
		[55,0,72],//[ 56, 0, 56 ] , // purple 
		[230,148,255],//[ 115, 0, 115 ] ,
		//[245, 245, 245], // grey
		[255,200,115],//[ 230,115,1 ],
		[ 219,67,9 ]//[ 88,43,0 ] // orange
	  ];	
	

var PURPLE_GREY_GREEN_COLOR_PALETTE = [
		[66,1,77],//[ 56, 0, 56 ] , // purple 
		[220,199,225],//[ 115, 0, 115 ] ,
		//[245, 245, 245], // grey
		[200,233,195],//[ 230,115,1 ],
		[ 0,68,26 ]//[ 88,43,0 ] // green
	  ];		
	
	
var BLUE_RED_COLOR_PALETTE = [
		[5,48,97],
		[33,102,172],
		[67,147,195],
		[146,197,222],
		[209,229,240],
		[253,219,199],
		[244,165,130],
		[214,96,77],
		[178,24,43],
		[103,0,31]	
	];
/*
[
		"#800026",
		"#fd8d3c",
		"#ffeda0",
		"#edf8b1",
		"#41b6c4",
		"#081d58"
		];	
	*/
var PROGRESS_CATEGORICAL_COLORS = [ "grey", [220,0,0] ];	
	
// defualtne farby
var DEFAULT_CATEGORICAL_COLORS = [ [0, 200, 100] , "red", [0,10,220] , "purple"];
// ak jestvuje d3, tak pouzijeme tie
if(d3){
	var catScale = d3.scale.category10();
	for(var i = 0;i < 10;i++){
		DEFAULT_CATEGORICAL_COLORS[i] = catScale(i);
	}
}
// este ich troska zamiesame :)
DEFAULT_CATEGORICAL_COLORS.sort(function() { return 0.5 - Math.random(); });
	
function ColorPalette(colors, values, adaptive){

	this.colors = colors || BLUE_RED_COLOR_PALETTE; //PURPLE_GREY_ORANGE_COLOR_PALETTE; //BLUE_GREY_RED_COLOR_PALETTE; //DEFAULT_COLOR_PALETTE; //BLACK_RED_COLOR_PALETTE; //WHITE_RED_COLOR_PALETTE; 
	this.values = values || [];
	this.adaptive = (!values || adaptive)? true : false;
	
	this.setValues = function(extremes){
		if(this.adaptive){
			var count = this.colors.length;
			var min = Math.min.apply(null, extremes);
			var max = Math.max.apply(null, extremes);
			var diff = max - min;
			var step  = diff / (count - 1);
			this.values = [];
			for(var i = 0;i < count;i++){
				this.values[i] = min + i*step;
			}
		}else{
			this.values = extremes;
		}
		this.values.sort(function(a,b){ return a - b; });
	}
	
	this.getScale = function(vals){
		if(vals){
			this.setValues(vals);
		}
		return makeScale(this.values, this.colors);
	}
	
	this.getPercentScale = function(vals){
		if(vals){
			this.setValues(vals);
		}
		var percents = [];
		var min = this.values[0];
		var range = this.values[this.values.length - 1] - min;
		if( range === 0 && (1/range) === Infinity){
			range = 1;
		}
		for(var i = 0;i < this.values.length;i++){
			var p = (this.values[i] - min)/range * 100;
			percents.push(p);
		}
		return makeScale(this.values, percents);
	}
	
	this.setValues(values);
}	


function colorToString(color){
	if(color instanceof Array){
		if(color.length == 4 && (typeof color[0]) == "number"){
			return "rgba(" + Math.round(color[0]) + ", " + Math.round(color[1]) + ", " + Math.round(color[2]) + ", " + color[3] + ")";
		}else if(color.length == 3 && (typeof color[0]) == "number"){
			return "rgb(" + Math.round(color[0]) + ", " + Math.round(color[1]) + ", " + Math.round(color[2]) + ")";
		}else{ 
			return colorToString(color[0]);
		}
	
	}else if((typeof color[0]) == "number"){
		return colorToString([color, color, color]);
	}else{
		return "" + color;
	}
}
