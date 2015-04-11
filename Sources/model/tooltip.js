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
 * @version $Id: tooltip.js,v 1.10 2014/09/16 12:24:18 marekru Exp $
 *
 */ 



if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.tooltip = {};



d3.modelvis.tooltip.display = {};

		
d3.modelvis.tooltip.display.args = function(s, args){
    var text = "";
	for(var i = 0;i < args.length;i++){
		text += " " + args[i];
    }
	return text;
};

d3.modelvis.tooltip.display.plotHourGeneral = function(s, args, indexFun){	
    return "" + getPlotIndex(s, args, indexFun);
};
	
	
d3.modelvis.tooltip.display.plotHour = function(s, args){
    return d3.modelvis.tooltip.display.plotHourGeneral(s, args, xToHour);
};


d3.modelvis.tooltip.display.plotValueGeneral = function(s, args, indexFun, decCount){
	var index = getPlotIndex(s, args, indexFun);
	return "" + s.data[index].toFixed(decCount);
};


d3.modelvis.tooltip.display.plotValue = function(s, args){
	return d3.modelvis.tooltip.display.plotValueGeneral(s, args, xToHour, 2);
};

d3.modelvis.tooltip.display.plotValueAsPercent = function(s, args){
	var deCount = 1;
	var floatNumber = (parseFloat(d3.modelvis.tooltip.display.plotValueGeneral(s, args, xToHour, 2)) * 100); 
	return floatNumber.toFixed(deCount) + " %";
};

d3.modelvis.tooltip.display.plotMonthGeneral = function(s, args, indexFun, monthFormat){
	var index = getPlotIndexY(s, args, indexFun);
	var monthNumber = d3.time.format("%-m").parse( "" + (index + 1) );
	return monthFormat( monthNumber );
};		
	
d3.modelvis.tooltip.display.plotMonth = function(s, args){
	return d3.modelvis.tooltip.display.plotMonthGeneral(s, args, xToHour, d3.time.format("%B") );
};	

d3.modelvis.tooltip.display.plotValueGeneralY = function(s, args, indexFun, decCount){
	var index = getPlotIndexY(s, args, indexFun);
	return "" + s.data[index].toFixed(2);
};

d3.modelvis.tooltip.display.plotValueY = function(s, args){
	return d3.modelvis.tooltip.display.plotValueGeneralY(s, args, xToHour, 2);
};


d3.modelvis.tooltip.display.length = function(s, args){
	var index = getPlotIndex(s, args, xToHour);
	return "" + s.data[index].length;
};

d3.modelvis.tooltip.display.data = function(s,args){
		return s.data;
}
	

function getPlotIndex(s, args, indexFun){
	var x = args[0][0];
	var index = indexFun(x, s.xScale, s.data.length - 1, Math.floor);
	return index;
}

function getPlotIndexY(s, args, indexFun){
	var y = args[0][1];
	var index = indexFun(y, s.yScale, s.data.length - 1, Math.floor);
	return index;
}

/*
function displayArgs(s, args){
	var text = "";
	for(var i = 0;i < args.length;i++){
		text += " " + args[i];
	}
	return text;
}

function displayPlotHourGeneral(s, args, indexFun){	
	return "" + getPlotIndex(s, args, indexFun);
}

function displayPlotHour(s, args){
	return displayPlotHourGeneral(s, args, xToHour);	
}

function displayPlotValueGeneral(s, args, indexFun, decCount){
	var index = getPlotIndex(s, args, indexFun);
	return "" + s.data[index].toFixed(decCount);
}


function displayPlotValue(s, args){
	return displayPlotValueGeneral(s, args, xToHour, 2);
}

function displayPlotValueAsPercent(s, args){
	var deCount = 1;
	return (parseFloat(displayPlotValueGeneral(s, args, xToHour, 2)) * 100).toFixed(deCount) + " %";
}

function displayPlotMonthGeneral(s, args, indexFun, monthFormat){
	var index = getPlotIndexY(s, args, indexFun);
	var monthNumber = d3.time.format("%-m").parse( "" + (index + 1) );
	return monthFormat( monthNumber );
}		
	
function displayPlotMonth(s, args){
	return displayPlotMonthGeneral(s, args, xToHour, d3.time.format("%B") );
}	

function displayPlotValueGeneralY(s, args, indexFun, decCount){
	var index = getPlotIndexY(s, args, indexFun);
	return "" + s.data[index].toFixed(2);
}

function displayPlotValueY(s, args){
	return displayPlotValueGeneralY(s, args, xToHour, 2);
}


function displayLength(s, args){
	var index = getPlotIndex(s, args, xToHour);
	return "" + s.data[index].length;
}
*/



d3.modelvis.tooltip.addColorRule = function(svg, width, height){
	var g = svg.append("svg:g").classed(CLASS_TOOLTIP, true);
	
	var padding = 0;
	
	g.append("rect")
	 .classed("rect", true)
	 .attr("x", padding)
	 .attr("y", padding)
	 .attr("width", width - padding*2)
	 .attr("height", height - padding*2);
	
	return g.style("display", "none");
}

d3.modelvis.tooltip.addLineRule = function(svg, radius, color){
	var g = svg.append("svg:g").classed(CLASS_TOOLTIP, true);
	
	g.append("circle")
	 .classed("dot", true)
	 .attr("cx", 0)
	 .attr("cy", 0)
	 .attr("r", radius)
	 .style("stroke", color)
	 .style("stroke-width", 1);
	
	return g.style("display", "none");
}


d3.modelvis.tooltip.createLine = function(settings){
    return new ToolTipLine(settings.label, settings.source, settings.fun, settings.rule, settings.color);
}


d3.modelvis.tooltip.generate = function(settings){
	var tooltip = new ToolTip(settings.title, settings.group, settings.div, settings.hasRule);
	if (!settings.lines) {
		return tooltip;
	}
	for(var  i = 0; i < settings.lines.length;i++){
		var line = d3.modelvis.tooltip.createLine(settings.lines[i]);
		tooltip.addLine(line);
	}
	tooltip.createEventListeners();
	return tooltip;
}

d3.modelvis.tooltip.color = function(svg, div, colWidth, colHeight, source){
		
	var xScale = source.xScale;
	
	var fun = function(el, x){
		var i = xToHour(x, xScale, source.data.length - 1, Math.floor);
		el.attr("transform","translate(" + Math.floor(xScale(i)) + ",0)" );
	};
	
	var tooltipEl = d3.modelvis.tooltip.addColorRule(svg, colWidth, colHeight);
	var tooltipRule = new ToolTipSVG(tooltipEl, fun);
	
	var tooltipSettings = d3.modelvis.settings.tooltip()
						.set("title", "")
						.set("group", svg)
						.set("div", div);
	
	var line1 = d3.modelvis.settings.tooltipline()
						.set("label", "Value")
						.set("fun", d3.modelvis.tooltip.display.plotValue)
						.set("rule", tooltipRule)
						.set("source", source);
						
	
	var line2 = d3.modelvis.settings.tooltipline()
						.set("label", "Hour")
						.set("fun", d3.modelvis.tooltip.display.plotHour)
						.set("rule", tooltipRule)
						.set("source", source);
			
	tooltipSettings.lines.push(line1);
	tooltipSettings.lines.push(line2);	
				
	if (source.label) {
		var line3 = d3.modelvis.settings.tooltipline()
						.set("label", "Date")
						.set("fun", d3.modelvis.tooltip.display.data)
						.set("source.data", source.label);
						
		tooltipSettings.lines.push(line3);	
		
	}				
	return d3.modelvis.tooltip.generate(tooltipSettings);								
}



function ToolTipSVG(el, fun){
    this.element = el;
    this.display = fun;
}

// http://jsbin.com/xuxupeco/3/
function ToolTipLine(label, source, fun, rule, color){
	this.label = label || "---";
	this.source  = source;
	this.display = fun || displayArgs; // funkcia function(source, args){...};
	this.rule = rule || null;
	this.labelColor = color || source.color || source.palette || null;
	
	this.toString = function(){
		return ( this.label + ": " + this.display(source, arguments) );
	};
	
	this.toTableRow = function(){
		var resultEl = document.createElement("tr");
		var labelEl  = document.createElement("th");
		var valueEl  = document.createElement("td");
		utils_elementSetText(labelEl, this.label);
		utils_elementSetText(valueEl, this.display(source, arguments) );
		labelEl.className = CLASS_LABEL;
		if(this.labelColor){
			labelEl.style.borderLeft = "2px solid " + colorToString(this.labelColor);
		}
		valueEl.className = CLASS_VALUE;
		resultEl.appendChild(labelEl);
		resultEl.appendChild(valueEl);	
		return resultEl;
	};
	
}

function ToolTip(title, group, div, hasRule){
	this.title = title;
	this.group = group; // na ktoru svg groupu to je naviazane
	this.div   = div; // miesto, kde sa to bude zobrazovat
	this.lines = [];
	this.rule;
	
	if(this.div.style){
		this.div.style.display = "none";
	}else{
		this.div.style("display", "none");
	}
	
	var eventLines = [];
	var rule;
	var eventTitle = title;
	
	this.addClassAttr = function(){
		if(div.className != undefined){
		    var pos = 0;
			if( (pos = div.className.search(CLASS_TOOLTIPHTML)) < 0){
				div.className += ((!pos)?" ":"") + CLASS_TOOLTIPHTML; 
			}
		}else{
			div.classed(CLASS_TOOLTIPHTML, true);
		}
	}
	this.addClassAttr();
	
	this.createRule = function(){
		this.rule = document.createElement("div");
		this.rule.className = CLASS_RULE;
		this.rule.style.display = "none";
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(this.rule);
		rule = this.rule;
	}
	if(hasRule){
		this.createRule();
	}
	
	this.setTitle = function(title){
		this.title = title;
		eventTitle = this.title;
	}
	
	this.setLines = function(labels, sources, funs){
		for(var i = 0;i < sources.length;i++){
			var label;
			var fun;
			if(i < labels.length){
				label = labels[i];
			}
			if(i < funs.length){
				fun = funs[i];
			}
			this.lines[i] = new ToolTipLine(label, sources[i], fun);
		}
		eventLines = this.lines;
	};
	
	
	this.addLine = function(labelOrLine, source, fun){
		if (labelOrLine instanceof ToolTipLine) {
				this.lines[this.lines.length] = labelOrLine;
		}else{
				this.lines[this.lines.length] = new ToolTipLine(labelOrLine, source, fun);
		}
		eventLines = this.lines;
	};
	
	this.deleteLine = function(label){
		var newLines = [];
		for(var i = 0;i < this.lines.length;i++){
			if(this.lines[i].label != label){
				newLines[newLines.length] = this.lines[i];
			}
		}
		this.lines = newLines;
		eventLines = this.lines;	
	}
	
	this.deleteLines = function(labels){
		for(var i = 0;i < labels.length;i++){
			this.deleteLine(labels[i]);
		}
	}
	
	this.createEventListeners = function(){
		if(!this.group){
			return;
		}

		this.group.classed(CLASS_EVENTGROUP, true);
		
		this.group.on("mouseover", function(){
				if(div.style){
					div.style.display = "";
				}else{
					div.style("display", "");
				}
				for(var i = 0;i < eventLines.length;i++){
					if(!eventLines[i].rule == false){
						var element = eventLines[i].rule.element;
						element.style("display", "");
					}
				}
				if(rule){
					rule.style.display = "";
				}
		});
		
		this.group.on("mouseout", function(){
				if(div.style){
					div.style.display = "none";
				}else{
					div.style("display", "none");
				}
				for(var i = 0;i < eventLines.length;i++){
					if(!eventLines[i].rule == false){
						var element = eventLines[i].rule.element;
						element.style("display", "none");
					}
				}
				if(rule){
					rule.style.display = "none";
				}
		});
		
		this.group.on("mousemove",function(){
			var coords = d3.mouse(this);
			utils_elementRemoveChildren(div);
			var table   = document.createElement("table");
			var caption = document.createElement("caption");
			utils_elementSetText(caption, eventTitle);
			table.appendChild(caption);
			for(var i = 0;i < eventLines.length;i++){
				var row = eventLines[i].toTableRow(coords);
				table.appendChild(row);
			}
			div.appendChild(table);
			
			var offset = 20;
			
			div.style.top = (d3.event.pageY + offset) + "px";
			div.style.left = (d3.event.pageX + offset) + "px";
			
			for(var i = 0;i < eventLines.length;i++){
				if(!eventLines[i].rule == false){
					var element = eventLines[i].rule.element;
					var fun     = eventLines[i].rule.display;
					fun(element, coords[0]);
				}
			}
			if(rule){
				rule.style.left = d3.event.pageX + "px";
			}
		});
	}
}
