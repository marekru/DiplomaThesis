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
 * @version $Id: formatting.js,v 1.2 2014/10/27 14:59:39 marekru Exp $
 *
 */ 

 if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.formatting = {};

d3.modelvis.formatting.every = function(){
	return (function(d){  return d; });
}

d3.modelvis.formatting.everyNth = function(n){
	return (function(d,i){ 
			return (i % n == 0)?d:"";
		   });
}

d3.modelvis.formatting.everyNthInv = function(n){
	return (function(d,i){ 
			return (i % n == 0)?"":d;
		   });
}

d3.modelvis.formatting.every2nd = function(d,i){
	return d3.modelvis.formatting.everyNth(2)(d,i); 																				 
}

d3.modelvis.formatting.every2ndInv = function(d,i){
	return d3.modelvis.formatting.everyNthInv(2)(d,i); 																				 
}

d3.modelvis.formatting.everyIndex = function(n){
	return (function(d, i){  return i; });
}

d3.modelvis.formatting.interval = function(interval, index){
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