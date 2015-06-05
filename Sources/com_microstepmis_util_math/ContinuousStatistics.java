package com.microstepmis.util.math;

import java.util.Collection;
import java.util.Map;
import java.util.Map.Entry;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;

import com.microstepmis.util.Pair;


/**
* (c) 2005 MicroStep-MIS  www.microstep-mis.com
*
* @author   marekru
* 
* @version  $Id: ContinuousStatistics.java,v 1.11 2015/04/21 13:17:26 marekru Exp $
* 
* Abstraktna trieda pre spojite meteorologicke statistiky.
* 
* 
*/
public abstract class ContinuousStatistics{
	
	
	/**
	 * Posledny pocet porovnanych dvojic
	 */
	private Counts lastPairCounts = new Counts(0,0);
	
	Integer N = 0; // pocet chyb

	public enum ContinuousStatisticsMethod{
		MFE,  // Mean Forecasts Error 
		MAE,  // Mean Absolute Error
		RMSE, // Root Mean Square Error
		TS,   // Tracking Signal
		SD	  // Standard Deviation
	}
	
	/**
	 * Vytvori instanciu triedy pre danu statisticku metodu.
	 * @param method
	 * @return
	 */
	public static ContinuousStatistics createInstance(ContinuousStatisticsMethod method){
		if(method == ContinuousStatisticsMethod.MFE){
			return new MeanForecastError();
		}else if(method == ContinuousStatisticsMethod.MAE){
			return new MeanAbsoluteError();
		}if(method == ContinuousStatisticsMethod.RMSE){
			return new RootMeanSquaredError();
		}if(method == ContinuousStatisticsMethod.TS){
			return new TrackingSignal();
		}if(method == ContinuousStatisticsMethod.SD){
			return new StandardDeviation();
		}
		// <- Sem pridaj dalsie
		return null;
	}
	
	public static <D extends Comparable<D>, R extends Number> Pair<List<Double>, Counts> calculateStatistics( 
			 Set<ContinuousStatisticsMethod> methods
		   , SortedMap<D, R> forecasts
		   , SortedMap<D, R> observations){
		return calculateStatistics(methods, forecasts, observations, null);
	}
	
	/**
	 * Metoda na zaklade zoznamu statistickych metod vypocita dane statistiky.
	 * @param methods
	 * @param forecasts
	 * @param observations
	 * @param interval
	 * @return
	 */
	public static <D extends Comparable<D>, R extends Number> Pair<List<Double>, Counts> calculateStatistics( 
				 Set<ContinuousStatisticsMethod> methods
			   , SortedMap<D, R> forecasts
			   , SortedMap<D, R> observations
			   , Interval<D> interval){
		List<Double> statsList = new ArrayList<Double>();
		Counts counts = new Counts(0,0);
		for(ContinuousStatisticsMethod method:methods){
			ContinuousStatistics statisticInstance = ContinuousStatistics.createInstance(method);
			Double statistics = statisticInstance.calculateStatistics(forecasts, observations, interval);
			statsList.add(statistics);
			counts = statisticInstance.getLastCounts();
		}
		return new Pair<List<Double>, Counts>(statsList, counts);
	}
	
	/**
	 * predspracovanie chyb
	 */
	abstract public <R extends Number> void preprocess(Collection<R> errors);
	/**
	 * metoda spracuvavajuca chybu do sumy napr. abs()
	 */
	abstract public Double processError(Double value);
	/**
	 * metoda spracuvavajuca naakumulovane chyby napr. Sum/n 
	 */
	abstract public Double processSum(Double sum);
	
	public static class Counts{
		
		
		public Counts(int pairCount, int maxPairCount) {
			lastPairCount = pairCount;
			lastMaximalPairCount = maxPairCount;
		}
		
		/**
		 * realny pocet dvojic hodnot (obs a fcst) v poslednom porovnani
		 * Je to posledne Sum.count.
		 */
		private int lastPairCount = 0;
		
		/**
		 * maximalny pocet dvojic, ktore by bolo mozne dosiahnut v poslednom porovnani
		 * Je to velkost intervalu dat z observation
		 */
		private int lastMaximalPairCount = 0;
		
		public int getLastPairCount() {
			return lastPairCount;
		}
		
		public int getLastMaximalPairCount() {
			return lastMaximalPairCount;
		}
		
	}
	

	/**
	 * Staticka funkcia, ktora vezme 2 tabulky a spravy porovnanie na zaklade istej 
	 * statistickej metody nad spojitymi datami v danom intervale a vrati vypocitanu hodnotu.
	 * @param forecasts - tabulka s predpovedami
	 * @param observations - tabulka s pozorovaniami
	 * @return 
	 * */
	public <D extends Comparable<D>, R extends Number> Double calculateStatistics(SortedMap<D,R> forecasts, 
																				  SortedMap<D,R> observations,
																				  Interval<D> interval) {
		SortedMap<D, R> data = observations; 
		// Ak existuje spravny interval, tak tento interval budu nase data
		if(interval != null && !interval.isNull() && !interval.isDecreasing()){
			data = observations.subMap(interval.from, interval.to); 
		}	
		return calculateStatistics(forecasts, data);
	}
	
	/**
	 * Staticka funkcia, ktora vezme 2 tabulky a spravy porovnanie na zaklade istej 
	 * statistickej metody nad spojitymi datami a vrati vypocitanu hodnotu.
	 * @param forecasts - tabulka s predpovedami
	 * @param observations - tabulka s pozorovaniami
	 * @return 
	 * */
	public <D extends Comparable<D>, R extends Number> Double calculateStatistics(Map<D,R> forecasts, Map<D,R> observations) {
		Collection<Double> errors = new ArrayList<Double>();
		// prejdi data a spocitaj chyby
		for(Entry<D, R> entry:observations.entrySet()){
			D key = entry.getKey();
			R observation = entry.getValue();
			R forecast = forecasts.get(key);
			if(forecast == null){
				continue;
			}
			Double error = error(forecast, observation);
			errors.add(error);
		}
		// nazaver spocitaj staistiku z tychto cyb
		return calculateStatistics(errors);
	}

	/**
	 * 
	 * @param <R> - Number zvacsa Double
	 * @param errors - tabulka chyb
	 * @return
	 */
	public <R extends Number> Double calculateStatistics(Collection<R> errors) {
		preprocess(errors);
		// prejdi data a prepocitaj statistiku
		Double sum = 0.0;
		N = 0;
		for(R err:errors){
			if(err == null){
				continue;
			}
			Double error = err.doubleValue();
			sum += processError(error);
			N++;
		}
		// zapamatam si posledne pocty parov
		lastPairCounts = new Counts(N, errors.size());
		return processSum(sum);
	}
	
	// observation - forecast
	public static <R extends Number> Double error(R forecast, R observation){
		return observation.doubleValue() - forecast.doubleValue();   
	}

	public Counts getLastCounts() {
		return lastPairCounts;
	}
	
}
