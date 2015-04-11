package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.Map.Entry;

import com.microstepmis.ims.data.taf.verification.ContingencyTable;
import com.microstepmis.util.math.Interval;
/**
 * Trieda pre kategoricke statistiky ako POD, FAR, CSI...
 *
 * TODO - premiestnit pravdepodobne do Math utils :)
 * 
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * @author   marekru
 * 
 * @version  $Id: CategoricalStatistics.java,v 1.11 2014/08/18 14:26:02 marekru Exp $
 * 
 */
public final class CategoricalStatistics{
	
	public enum CategoricalStatisticsMethod{
		POD, FAR, CSI, Accuracy //...
	}
	
	private CategoricalStatistics(){}
	
	/**
	 * Staticka metoda na vypocet statistiky z kontingencnej tabulky na zaklade danej metody.
	 * @param table - kontingencna tabulka
	 * @param method - statisticka metoda
	 * @return - 0.0 ak je pozuita neznama statistika
	 */
	public static Double calculateStatistics(ContingencyTable table, CategoricalStatisticsMethod method){
		if(method == CategoricalStatisticsMethod.POD){
			return table.computePOD();
		}else if(method == CategoricalStatisticsMethod.FAR){
			return table.computeFAR();
		}else if(method == CategoricalStatisticsMethod.CSI){
			return table.computeCSI();
		}else if(method == CategoricalStatisticsMethod.Accuracy){
			return table.computeACC();
		}
		// ...
		return 0.0;
	}
	
	public static List<Double> calculateStatistics( Set<CategoricalStatisticsMethod> methods, ContingencyTable contingencyTable){
		List<Double> result = new ArrayList<Double>();
		for(CategoricalStatisticsMethod method:methods){
			Double value = calculateStatistics(contingencyTable, method);
			result.add(value);
		}
		return result;
	}
	
	
	/**
	 * 
	 * Staticka metoda, ktora na zaklade tresholdu a tabuliek predpovedi a pozorovani v danom intervale
	 * vytvori contingencnu tabulku.
	 * @param forecasts - predpovede
	 * @param observations - pozorovania
	 * @param interval - interval v tabulke pozorovani
	 * @param treshold - hranica, od ktorej chapeme hodnoty ako alarmujuce
	 * @param underTreshold - ak true, tak alarmujuce hodnoty budu pod tresholodm
	 * @return
	 */
	public static <D extends Comparable<D>, R extends Number> ContingencyTable createContingencyTable(SortedMap<D, R> forecasts, 
																					SortedMap<D, R> observations, 
																					Interval<D> interval,
																					R treshold,
																					boolean underTreshold){
		if(interval.isNull() || interval.isDecreasing()){
			return null; 
		}
		// vyber dany interval z tabulky
		SortedMap<D, R> data = observations.subMap(interval.from, interval.to); 
		ContingencyTable table = new ContingencyTable();
		for(Entry<D, R> entry:data.entrySet()){
			D key = entry.getKey();
			R observation = entry.getValue();
			R forecast = forecasts.get(key);
			if(forecast == null){
				continue;
			}
			// vypocitame contingencnu tabulku pre jednu hodnotu a pripocitame ju do celkovej tabulky
			ContingencyTable smallTable = calculateContingencyTable(observation, forecast, treshold, underTreshold); 
			table.add(smallTable);
		}
		return table;
	}
	
	
	public static <D extends Comparable<D>, R extends Number> ContingencyTable createContingencyTable(SortedMap<D, R> forecasts, 
																					SortedMap<D, R> observations, 
																					Interval<D> interval,
																					R treshold){
		return createContingencyTable(forecasts, observations, interval, treshold, false);
	}
	
	private static <R extends Number> ContingencyTable calculateContingencyTable(R observation, R forecast, R treshold, boolean underTreshold){
		Double obs = observation.doubleValue();
		Double fcst = forecast.doubleValue();
		Double tres = treshold.doubleValue();
		int num1 = 0;
		int num2 = 0;
		if(underTreshold){
			num1 = tres.compareTo(obs);
			num2 = tres.compareTo(fcst);
		}else{
			num1 = obs.compareTo(tres);
			num2 = fcst.compareTo(tres);
		}ContingencyTable table = new ContingencyTable();
		if(num1 >= 0 && num2 >= 0){
			table.hit();
		}else if(num1 >= 0 && num2 < 0){
			table.miss();
		}else if(num1 < 0 && num2 >= 0){
			table.far();
		}else{
			table.corNeg();
		}
		return table;
	}
	
}
