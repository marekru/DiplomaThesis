package com.microstepmis.util.math;

import java.util.Collection;


/**
* (c) 2005 MicroStep-MIS  www.microstep-mis.com
*
* @author   marekru
* 
* @version  $Id: MeanAbsoluteError.java,v 1.5 2015/04/21 13:17:26 marekru Exp $
* 
* Mean Absolute Error alebo inak MAE
* http://en.wikipedia.org/wiki/Mean_absolute_error
* */
public class MeanAbsoluteError extends ContinuousStatistics {

	@Override
	public <R extends Number> void preprocess(Collection<R> errors) {
		// nic netreba urobit
	}
	
	/**
	 * @param range - error
	 * @return range - absolutna hodnota |error| - range.abs()
	 * **/
	@Override
	public Double processError(Double value) {
		return Math.abs(value);
	}


	/**
	 * @param sum - suma nascitanych hodnot
	 * @return sum / n
	 * **/
	@Override
	public Double processSum(Double sum) {
		if(N <= 0){
			return 0.0;
		}
		return sum / N.doubleValue();
	}

}
