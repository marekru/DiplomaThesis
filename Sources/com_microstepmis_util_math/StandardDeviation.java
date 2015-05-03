package com.microstepmis.util.math;

import java.util.Collection;

public class StandardDeviation extends RootMeanSquaredError {

	Double mean = 0.0;
	
	@Override
	public <R extends Number> void preprocess(Collection<R> errors) {
		ContinuousStatistics stats = ContinuousStatistics.createInstance(ContinuousStatisticsMethod.MFE);
		mean = stats.calculateStatistics(errors); // treba davat pozor, aby som nesiel do rekurzie nekonecnej
	}

	/**
	 * @param value - error
	 * @return (value - mean)^2 - umocneny rozdiel od priemeru
	 */
	@Override
	public Double processError(Double value) {
		Double meanDiff = value - mean;
		return meanDiff * meanDiff;
	}
	
	// process sum kradnem od RMSE
	
}
