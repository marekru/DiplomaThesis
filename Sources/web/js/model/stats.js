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
 * @version $Id: stats.js,v 1.5 2015/04/20 14:30:16 marekru Exp $
 *
 *
 * Multivariate kernel density estimation
 */ 

function multiply(a,b){
	return a*b;
}

function minus( v1, v2 ){
	if(v1.length){
		var result = new Array(v1.length);
		for(var i = 0; i < v1.length;i++){
			result[i] = v1[i] - v2[i];
		}
		return result;
	}else{
		return v1 - v2;
	}
}

function div(v1, v2){
	if(v1.length){
		var result = new Array(v1.length);
		for(var i = 0; i < v1.length;i++){
			result[i] = v1[i] / v2[i];
		}
		return result;
	}else{
		return v1 / v2;
	}
}
 
 if( !d3.modelvis ){
	d3.modelvis = {}; 
}

d3.modelvis.stats = {};


d3.modelvis.stats.dimension = function(x){
	if(x.length){
		return ( x[0].length ) ? x[0].length : 1;
	}else{
		return 0;
	}
}

d3.modelvis.stats.bandwidth = function(x, dim){
	if(dim == 1){
		return [ science.stats.bandwidth.nrd(x) ];
	}else if(dim == 2){
		var i = 0;
		var fun = function(x){ return x[i]; };
		var sigma1 = Math.sqrt(science.stats.variance(x.map( fun ) ));
		i++;
		var sigma2 = Math.sqrt(science.stats.variance(x.map( fun ) ));
		var n = Math.pow(x.length, -0.166);
		return  [ sigma1 * n, sigma2 * n ]; 
	}else{
		var result = new Array(dim);
		var fun = function(x){ return x[i]; };
		for(var i = 0; i < dim; i++){
			var array = x.map( fun );
			var sigma = Math.sqrt(science.stats.variance(array));
			var n = x.length;
			result[i] = sigma / Math.pow( 4 / ((dim + 2) * n) , 1/(dim + 4))
		}
		return result;
	}
}

d3.modelvis.stats.kernel = function(){
	var K = science.stats.kernel.gaussian;
	
	function multivariateKernel(x){
		var values = (arguments.length && !x.length) ? arguments : x; // ak ma viacej argumentov a x nema dlzku
		return values.map( K ).reduce( multiply );
	}
	
	multivariateKernel.kernel = function(x){
		if(!arguments.length){
			return K;
		}
		if( (typeof x) == "function" ){
			K = x;
		}else if( (typeof x) == "string" ){
			K = science.stats.kernel[x];
		}
		return multivariateKernel;
	}
	
	return multivariateKernel;
}

d3.modelvis.stats.kde = function(){
	var kernel = d3.modelvis.stats.kernel();
    var sample = [];

	function kde(points) {
		var d = d3.modelvis.stats.dimension(points); 
		var H = d3.modelvis.stats.bandwidth(sample, d); 
		
		return points.map(function(x) {
			var y = 0;
			var n = sample.length;
			for(var i = 0; i < n; i++){
				var difference = minus(x,sample[i]);
				var ratio = div(difference, H);
				y += kernel( ratio );
			}
			var product = H.reduce(multiply);
			return y / (product * n);
		});
	}

	kde.kernel = function(x) {
		if (!arguments.length){
			return kernel;
		}
		kernel = x;
		return kde;
	};

	kde.sample = function(x) {
		if (!arguments.length){ 
			return sample;
		}
		sample = x;
		return kde;
	};

	return kde;
}


d3.modelvis.stats.nearest = function(){
	var mean = 0;
	var percent = 1.0;
	
	function nearest(data){
		if(percent >= 1.0){
			return data;
		}
		var m = mean || d3.mean(data);
		var d = data;
		d = d.sort( function(a,b){
			return Math.abs(a - m) - Math.abs(b - m);
		});
		return d.slice(0, d.length * percent);
	}
	
	nearest.mean = function(x){
		if (!arguments.length){ 
			return mean;
		}
		mean = x;
		return nearest;
	}
	
	nearest.percent = function(x){
		if (!arguments.length){ 
			return percent;
		}
		percent = x;
		return nearest;
	}
	
	return nearest;
}


// http://jsbin.com/kuliruyubu/2/
d3.modelvis.stats.quantiles = function(){
	var depth = 2;
	
	function quantiles(data){

		var result = {};
		result.median = 0;
		result.Qpairs = [];
		result.lowoutliers = [];
		result.highoutliers = [];
		
		var d = data;
		d.sort(function(a,b){ return a - b; });
		
		var step = Math.pow(0.5, depth);
		var length = Math.pow(2, depth) - 1;

		var percentfun = function(x,i){
		  return step * (i + 1);
		};

		var percents = Array.apply(null, new Array(length));
		percents = percents.map( percentfun );

		var indexfun = function(x){ return Math.floor(x * (d.length) ); };
		var indeces = percents.map( indexfun );

		var Q1 = d[indexfun(0.25)];
		var Q3 = d[indexfun(0.75)];
		var IQR = Q3 - Q1;

		var lowinnerfence = Q1 - 1.5 * IQR;
		var highinnerfence = Q3 + 1.5 * IQR;

		result.lowoutliers = d.filter( function(x){ return x < lowinnerfence; } );
		result.highoutliers = d.filter( function(x){ return x > highinnerfence; } );

		var Q = indeces.map( function(x){ return d[x]; } );

		for(var i = 0;i < (Q.length * 0.5) - 1;i++){
		  result.Qpairs[i] = [Q[i], Q[Q.length - i - 1]];
		}

		result.median = d[indexfun(0.5)];

		return result;
	}
		
	quantiles.depth = function(x){
		if (!arguments.length){ 
			return depth;
		}
		depth = x;
		return quantiles;
    }	
		
	return quantiles;	
}




d3.modelvis.stats.outliers = function(){
		
		var centralRegion = []; // c0.5
		var IQR = [];
		var upperFence = [];
		var lowerFence = [];
				
		function isOutlier(data, index) {
			for(var i = 0;i < data.length;i++){
				var value = data[i][index];
				if(value > upperFence[i] || value < lowerFence[i]){
					return true;
				}
			}
			return false;
		}
		
		function outliers(data){
			var result = [];
			for(var i = 0;i < data.length;i++){
				if(isOutlier(data, i)){
					result.push(i);
				}
			}
			return result;
		}
		
		outliers.region = function(x){
			if (!arguments.length){ 
				return centralRegion;
			}
			centralRegion = x;
			
			// vypocitam hranice
			IQR = centralRegion.map( function(x){ return Math.abs(x[0] - x[1]); } );
			lowerFence = centralRegion.map( function(x,i){ return x[0] - 1.5 * IQR[i]; } );
			upperFence = centralRegion.map( function(x,i){ return x[1] + 1.5 * IQR[i]; } );
			
			return outliers;		
		}
		
		return outliers;
}

d3.modelvis.stats.filterIndeces = function(){
    var indeces = [];

	region = function(percentil){
		return Math.floor(indeces.length * percentil);
	}	
    
		
	function filterIndeces(percentil, exceptions){
		
		var maxIndex = region(percentil);
		
		
		var accept = function(x,i){
			if(i > maxIndex){
				return false;
		    }	
			if(exceptions && exceptions.length){
				return exceptions.indexOf(x) < 0;
			}
			return true;
		};
		
		return indeces.filter( accept );
	}
	
	filterIndeces.indeces =	function(x){
		if (!arguments.length){ 
			return indeces;
		}
		indeces = x;
		return filterIndeces;
	}
	
	return filterIndeces;
		
}

d3.modelvis.stats.band = function(){
	
	var data = [];
	
	function band(indeces){ // line indeces
		var result = [];
		for(var i = 0;i < data.length;i++){
			var min = Number.MAX_VALUE;
			var max = -Number.MAX_VALUE;
			for(var j = 0;j < indeces.length;j++){
				var value = data[i][indeces[j]];
				min = Math.min(min, value);
				max = Math.max(max, value);
			}
			result[i] = [min, max];
		}
		return result;	
    }
	
	band.data = function(x){
		if (!arguments.length){ 
			return data;
		}
		data = x;
		
		return band;
	}
		
	return band;	   
};



d3.modelvis.stats.lambda = function(data, bandPairs, lineindex, bandindex){
    var result = 0;
	for(var i = 0;i < data.length;i++){
		var index0 = bandPairs[bandindex][0];
		var index1 = bandPairs[bandindex][1];
		var val0 = data[i][index0];
		var val1 = data[i][index1];
		var min = Math.min(val0, val1);
		var max = Math.max(val0, val1);
		var val = data[i][lineindex];
		if(val <= max && val >= min){
		    result++;  
		}
    }
	return result;
}

// http://jsbin.com/vidonebuna/5/
d3.modelvis.stats.bandDepth = function(){

    var data = [];
	var bandPairs = [];
	var n = 0;
		
    function bandDepth(lineindex){
		var result = 0;
		for(var i = 0;i < bandPairs.length;i++){
			result += d3.modelvis.stats.lambda(data, bandPairs, lineindex, i);  
		}
		return result; // * 1/combinationCount, combinationCount = bandPairs.length <- toto netreba, kedze je to pre vsetky ciary rovnake 
    };
	
	bandDepth.data = function(x){
		if (!arguments.length){ 
			return data;
		}
		data = x;
		
		n = data[0].length;
		// vygeneruj indexy pasem
		bandPairs = [];
		for(var i = 0;i < n;i++){
		  for(var j = 0;j < i;j++){
			bandPairs.push( [i,j] );
		  }
		}
		
		return bandDepth;
	}

    return bandDepth;		
		
}

d3.modelvis.stats.sortIndecesByBendDepth = function(data){
	var BDs = [];
	var n = data[0].length;
	var bandDepth = d3.modelvis.stats.bandDepth().data(data);
	for(var i = 0;i < n;i++){ 
		BDs.push(bandDepth(i));
	}
	var indeces = Array.apply(null, new Array(n)).map(function(x,i){ return i; });
	indeces = indeces.sort( function(a,b){ return BDs[b] - BDs[a];  } );

	return indeces;
}


d3.modelvis.stats.movingAvarage = function(data, inStep){
  var step = inStep | 14;
    return data.map(function (value, index) { 
        var slice = data.slice(index - step * 0.5, index + step * 0.5 + 1);
		if (!slice) {
			return value; // TODO
		}
		return d3.mean(slice);
    });
}

