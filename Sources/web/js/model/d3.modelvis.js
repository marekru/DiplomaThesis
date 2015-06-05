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
 * @version $Id: d3.modelvis.js,v 1.5 2014/10/22 14:20:32 marekru Exp $
 *
 */

// TODO: vsetko implementovat ako sucast D3 kniznice a rozhadzat do roznych fileov!!!
// - addBars, addLine, addXYZ ...
// - axis
// - - 

function include(script){
	d3.select("head").append("script")
					.attr("language", "JavaScript")
					.attr("type", "text/javascript")
					.attr("src", script);
}

if( !d3.modelvis ){
	d3.modelvis = {}; 
}

function includeAll(){
	include("../../../js/model/formatting.js");
	include("../../../js/model/moduls.js");
	include("../../../js/model/settings.js");
	include("../../../js/model/svg.js");
	include("../../../js/model/layout.js");
	include("../../../js/model/plotting.js");
	include("../../../js/model/graphs.js");
	include("../../../js/model/metainfo.js");
	include("../../../js/model/colors.js");
	include("../../../js/model/plot.js");
	include("../../../js/model/visualization.js");
	include("../../../js/model/tooltip.js");
	include("../../../js/model/verificationPlots.js");
	include("../../../js/model/verification.js");
}

 
