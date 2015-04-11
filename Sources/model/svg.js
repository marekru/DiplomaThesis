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
 * @version $Id: svg.js,v 1.2 2014/10/16 08:23:35 marekru Exp $
 *
 */

// TODO: riesit overlap + na konci kazdej metody dam fit SVG to content!
 

if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.svg = {};

d3.modelvis.svg.fitDimToContent = function(selection, dim){
	var node = selection.node();
	if(node.tagName === "svg" && node.children.length > 0){
		var bbox = node.getBBox();
		// nastav width, height
		selection.attr(dim, bbox[dim]);
		
		var wrapper = null;
		var WRAPPER_CLASS = "wrapper";
		
		// Ak uz mame vytvoreny wrapper, tak ho nevytvarame znova
		if(node.children.length === 1 && node.children[0].classList.contains(WRAPPER_CLASS) ){
			wrapper = node.children[0];
		}else{
			var list = [];
			for(var i = 0;i < node.children.length;i++){
				list.push(node.children[i]);
			}
			wrapper = selection.append("svg:g").classed(WRAPPER_CLASS, true).node();
			for(var i = 0;i < list.length;i++){
				wrapper.appendChild(list[i]);
			}
		}
		
		var deltaX = (dim == "width") ? -bbox.x : 0;
		var deltaY = (dim == "height") ? -bbox.y : 0;
		var t = d3.transform(d3.select(wrapper).attr("transform"));
		var tx = t.translate[0] + deltaX;
		var ty = t.translate[1] + deltaY;
		d3.select(wrapper).attr("transform", "translate(" + tx + ", " + ty + ")");
	}
}
// TODO vseobecna funkcia
d3.modelvis.svg.fitWidthToContent = function(selection){
	d3.modelvis.svg.fitDimToContent(selection, "width");
};

d3.modelvis.svg.fitHeightToContent = function(selection){
	d3.modelvis.svg.fitDimToContent(selection, "height");
};

d3.modelvis.svg.fitToContent = function(selection, settings){
	if(!settings || !settings.width){
		d3.modelvis.svg.fitWidthToContent(selection);
	}
	if(!settings || !settings.height){
		d3.modelvis.svg.fitHeightToContent(selection);
	}
};

d3.modelvis.svg.createGroup = function(selection, settings){
	var svg = selection;
	if(svg.node().tagName != "svg"){
		var width = (settings) ? settings.width : 0;
		var height = (settings) ? settings.height : 0;
		svg = selection.append("svg")
				.attr("width", width)
				.attr("height", height)
	}
	return svg.append("g");
}
