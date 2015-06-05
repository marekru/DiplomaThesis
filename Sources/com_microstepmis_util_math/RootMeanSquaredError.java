package com.microstepmis.util.math;

import java.util.Collection;


/**
* (c) 2005 MicroStep-MIS  www.microstep-mis.com
*
* @author   marekru
* 
* @version  $Id: RootMeanSquaredError.java,v 1.4 2015/04/21 13:17:26 marekru Exp $
* 
* Root Mean Squared Error alebo inak RMSE
* 
* */
public class RootMeanSquaredError extends ContinuousStatistics {
	
	@Override
	public <R extends Number> void preprocess(Collection<R> errors) {
		// nic netreba urobit
	}

	/**
	 * @param value - error
	 * @return value^2 - umocnena chyba na 2 
	 * **/
	@Override
	public Double processError(Double value) {
		return value * value;
	}

	/**
	 * @param sum - suma nascitanych chyb
	 * @return sqrt(sum/n) 
	 * **/
	@Override
	public Double processSum(Double sum) {
		if(N == 0){
			return 0.0;
		}
		Double ratio = sum / N.doubleValue(); 
		return Math.sqrt(ratio);
	}

	
}
