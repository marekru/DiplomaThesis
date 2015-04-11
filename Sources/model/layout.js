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
 * @version $Id: layout.js,v 1.1 2014/10/15 10:02:08 marekru Exp $
 *
 */

if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.layout = {};

d3.modelvis.layout.root = function(selection, data, settings){
	return selection.append("table");
}

d3.modelvis.layout.row = function(selection, data, settings){
	return selection.append("tr");
}

d3.modelvis.layout.col = function(selection, data, settings){
	return selection.append("td")
					.attr("align", settings.alignment.horizontal)
					.style({
						"vertical-align" : settings.alignment.vertical	
					});
}