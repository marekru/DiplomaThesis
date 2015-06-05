package com.microstepmis.util.math;

import java.util.Collection;


/**
* (c) 2005 MicroStep-MIS  www.microstep-mis.com
*
* @author   marekru
* 
* @version  $Id: TrackingSignal.java,v 1.4 2015/04/21 13:17:25 marekru Exp $
* 
* Tracking Signal alebo inak TS
* 
* */
public class TrackingSignal extends ContinuousStatistics {
	
	private Double MAE = 1.0;
	
	/**
	 * Predpocitam si MAE, aby som na konci mohol to cele vydelit tym
	 */
	@Override
	public <R extends Number> void preprocess(Collection<R> errors) {
		ContinuousStatistics stats = ContinuousStatistics.createInstance(ContinuousStatisticsMethod.MAE);
		MAE = stats.calculateStatistics(errors);	// treba si dat pozor, aby MAE znova nevolalo rekurzivne calculateStatistics
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
	 * @param sum - suma nascitanych chyb
	 * @return sum/MAE 
	 * **/
	@Override
	public Double processSum(Double sum) {
		return sum / MAE;
	}
}
