package com.microstepmis.util.math;

import java.util.Collection;


/**
* (c) 2005 MicroStep-MIS  www.microstep-mis.com
*
* @author   marekru
* 
* @version  $Id: MeanForecastError.java,v 1.4 2015/04/21 13:17:26 marekru Exp $
* 
* Mean Forecast Error alebo tiez Bias (MFE)
* http://scm.ncsu.edu/scm-articles/article/measuring-forecast-accuracy-approaches-to-forecasting-a-tutorial
* */
public class MeanForecastError extends ContinuousStatistics { 

	@Override
	public <R extends Number> void preprocess(Collection<R> errors) {
		// nic netreba urobit
	}
	
	/**
	 * @param range - error
	 * @return range - nezmenena hodnota 
	 * **/
	@Override
	public Double processError(Double value) {
		return value;
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
