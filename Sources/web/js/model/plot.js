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
 * @version $Id: plot.js,v 1.4 2014/09/30 12:38:38 marekru Exp $
 *
 */ 



function Plot(el, width, height, xScale, yScale, data, tooltipSVG){
	this.element = el;
	this.width = width;
	this.height = height;
	this.xScale = xScale;
	this.yScale = yScale;
	this.data = data;
	this.tooltipSVG = tooltipSVG;
}

function ColorPlot(el, width, height, xScale, yScale, data, tooltipSVG, palette){
	this.palette = palette || [ "black" ];
	Plot.call(this, el, width, height, xScale, yScale, data, tooltipSVG);
}
utils_extend(Plot, ColorPlot);


function MultiPlot(el, plots, xScale, yScale, data, name){
	this.element = el;
	this.plots = plots || [];
	this.name = name || "Values";
	this.xScale = xScale;
	this.yScale = yScale;
	this.data = data;
}