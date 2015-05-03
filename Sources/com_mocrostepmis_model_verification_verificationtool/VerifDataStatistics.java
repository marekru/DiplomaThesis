package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Map.Entry;
import java.util.TreeMap;

import org.jfree.data.statistics.BoxAndWhiskerCalculator;
import org.jfree.data.statistics.Statistics;

import com.microstepmis.ims.data.taf.verification.ContingencyTable;
import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.CategoricalStatistics.CategoricalStatisticsMethod;
import com.microstepmis.model.verification.verificationtool.VerificationTables.CategoricalStatisticsTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ContinuousStatisticsTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.DataCredibility;
import com.microstepmis.model.verification.verificationtool.VerificationTables.Errors;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ErrorsList;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ForecastTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTables;
import com.microstepmis.util.Pair;
import com.microstepmis.util.math.ContinuousStatistics;
import com.microstepmis.util.math.ContinuousStatistics.ContinuousStatisticsMethod;
import com.microstepmis.util.math.ContinuousStatistics.Counts;
import com.microstepmis.util.math.Interval;

/**<pre>
 * Statistics of Verification Data
 *
 * Verification pipeline:
 * <code>
 * +---------------+    ++==========++    +-------------+   
 * |DATA EXTRACTION| -> ||STATISTICS|| -> |VISUALIZATION|   
 * +---------------+    ++==========++    +-------------+   
 * </code>
 * Tato classa je STATISTICS cast.
 * <br>
 * Trieda na pocitanie statistik verifikacie:
 * <li> Continuous Stats: MAE, MFE, RMSE, TS, ...
 * <li> Categorical statistics = contingency tables
 * <li> Median, Q1, Q2, Q3, IQR : http://www.purplemath.com/modules/boxwhisk3.htm
 * <li> ....
 *<p>
 * TODO upperair
 * TODO komentare k metodam, aspon k tym public
 * TODO porozmslat, ktore metody budu public
 * </pre>
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VerifDataStatistics.java,v 1.13 2015/01/27 15:43:48 marekru Exp $
 * 
 */
public final class VerifDataStatistics {

	private static Log log = new Log(ModelVerificationCfg.LOG_NAME);
	
	private VerifDataStatistics(){}
	
	
	// TODO premiestnit do VerifDataProcessor ?
	public static List<TimeInterval> getIntervals(List<VerifDataTables> tables){
		List<TimeInterval> result = new ArrayList<TimeInterval>();
		for(VerifDataTables vTables:tables){
			result.add(vTables.getInterval());
		}
		return result;
	}

	// TODO premiestnit do VerifDataProcessor ?
	public static List<TimeInterval> getCommonIntervals(List<VerifDataTables> tables1, List<VerifDataTables> tables2){
		if(tables1.size() != tables2.size()){
			return new ArrayList<TimeInterval>();
		}
		List<TimeInterval> result = new ArrayList<TimeInterval>();
		Iterator<VerifDataTables> it1 = tables1.iterator();
		Iterator<VerifDataTables> it2 = tables2.iterator();
		for(;it1.hasNext() && it2.hasNext();){
			VerifDataTables tab1 = it1.next();
			VerifDataTables tab2 = it2.next();
			TimeInterval interval1 = tab1.getInterval();
			TimeInterval interval2 = tab2.getInterval();
			Interval<Date> intersect = interval1.intersection(interval2);
			result.add(new TimeInterval(intersect.from, intersect.to));
		}	
		return result;
	}
	
	public static List<ContinuousStatisticsTable> calcContinuousStats(List<ErrorsList> errorsLists, Set<ContinuousStatisticsMethod> methods){
		List<ContinuousStatisticsTable> result = new ArrayList<ContinuousStatisticsTable>();
		for(ErrorsList errors:errorsLists){
			ContinuousStatisticsTable stats = calcContinuousStats(errors, methods);
			result.add(stats);
		}
		return result;
	}
	
	private static Errors removeNulls(Errors errors){
		Errors result = new Errors();
		for (Double error : errors) {
			if(error == null){
				continue;
			}
			result.add(error);
		}
		return result;
	}
	
	public static ContinuousStatisticsTable calcContinuousStats(ErrorsList errorsList, Set<ContinuousStatisticsMethod> methods){
		ContinuousStatisticsTable contStatistics = new ContinuousStatisticsTable(); 
		for(ContinuousStatisticsMethod method:methods){
			List<Double> values = new ArrayList<Double>();
			for(Errors errors:errorsList){
				ContinuousStatistics stats = ContinuousStatistics.createInstance(method);
				Errors notNullErrors = removeNulls(errors);
				Double value = stats.calculateStatistics(notNullErrors);
				values.add(value);
			}
			contStatistics.put(method, values);
		}
		return contStatistics;
	}
	
	public static CategoricalStatisticsTable calcCategoricalStats(ContingencyTable table, Set<CategoricalStatisticsMethod> methods){
		CategoricalStatisticsTable catStatistics = new CategoricalStatisticsTable();
		for(CategoricalStatisticsMethod method:methods){
			Double value = CategoricalStatistics.calculateStatistics(table, method);
			catStatistics.put(method, value);
		}
		return catStatistics;
	}
	
	
	public static ForecastTable calcErrors(ForecastTable forecasts, VerifDataTable observations){
		ForecastTable result = new ForecastTable();
		for( Entry<Date, VerifDataTable> entry : forecasts.entrySet()){
			VerifDataTable errorTable = calcErrors(entry.getValue(), observations);
			result.put(entry.getKey(), errorTable);
		}
		return result;
	}
	/*
	public static List<ErrorsList> calcErrorsLists(List<VerifDataTables> forecastTables, List<VerifDataTables> observationTables){
		List<ErrorsList> result = new ArrayList<ErrorsList>();
		if(forecastTables.size() != observationTables.size()){
			// TODO LOG LEVEL
			log.warning(null, "Tables of different sizes %d != %d. May cause wrong data comparism.", forecastTables.size(), observationTables.size());
		}
		Iterator<VerifDataTables> fcsIt = forecastTables.iterator();
		Iterator<VerifDataTables> obsIt = observationTables.iterator();
		while(fcsIt.hasNext() && obsIt.hasNext()){
			VerifDataTables fcst = fcsIt.next();
			ErrorsList errors = calcErrorsList(fcst, obsIt.next());
			result.add(errors);
		}
		return result;
	}
	*/
	/*
	public static ErrorsList calcErrorsList(VerifDataTables forecastTables, VerifDataTables observationTables){
		ErrorsList result = new ErrorsList(); 
		if(forecastTables.size() != observationTables.size()){
			// TODO LOG LEVEL
			log.warning(null, "Tables of different sizes %d != %d. May cause wrong data comparism.", forecastTables.size(), observationTables.size());
		}
		Iterator<VerifDataTable> fcsIt = forecastTables.iterator();
		Iterator<VerifDataTable> obsIt = observationTables.iterator();
		while(fcsIt.hasNext() && obsIt.hasNext()){
			Errors errors = calcErrors(fcsIt.next(), obsIt.next());
			result.add(errors);
		}
		return result;
	}
	*/
	
	public static VerifDataTable calcErrors(VerifDataTable forecasts, VerifDataTable observations){
		VerifDataTable errorTable = new VerifDataTable();
		// prejdi data a spocitaj chyby
		for(Entry<Date, Double> entry:forecasts.entrySet()){
			Date key = entry.getKey();
			Double forecast = entry.getValue();
			Double observation = observations.get(key);
			if(observation == null){
				// pridavame do tabulky, aby nam bolo jasne, ze nieco nam tam chyba
				errorTable.put(key, null); 
				// TODO log this level(5)
				//continue; -> alternativny pristup
			}else{
				Double error = ContinuousStatistics.error(forecast, observation);
				errorTable.put(key, error);
			}
		}
		return errorTable;
	}
	
	/*
	public static Errors calcErrors(VerifDataTable forecasts, VerifDataTable observations){
		VerifDataTable errorTable = calcErrorsWithDates(forecasts, observations);
		return VerifDataProcessor.tableToErrors(errorTable);
	}
	*/
	
	private static Double[] calcMaximalPairCount(int count, long intervalDuration, long stepHours , boolean progress){
		Double[] result = new Double[count];
		if(count == 0){
			return result;
		}
		long remainder = intervalDuration % stepHours;
		if(progress){
			for(int i = 0;i < count;i++){
				Integer value = (int)(stepHours); 
				result[i] = value.doubleValue();
			}
			// posledny krok moze byt zrezany
			result[result.length - 1] -= remainder;
		}else{
			Double maxCount = Math.floor(intervalDuration / (double)stepHours);
			long c = stepHours - remainder;
			for(int i = 0;i < count;i++){
				Double addition = (i < c) ? 1.0 : 0.0; // niektore hodiny sme pri floor orezali, preto treba doplnit
				result[i] = (maxCount) + addition;
			}
		}
		return result;	
	}
	
	public static DataCredibility calcDataCredibility(ErrorsList errorsList, long intervalDuration, long stepHours , boolean progress){
		DataCredibility result = new DataCredibility(errorsList.size());
		Double[] maxims = calcMaximalPairCount(errorsList.size(), intervalDuration, stepHours, progress);
		int i = 0;
		for(List<Double> errors:errorsList){
			Integer size = errors.size();
			Double ratio = size.doubleValue() / maxims[i];
			result.add(ratio);
			i++;
		}
		return result;
	}
	
	public static List<DataCredibility> calcDataCredibility(List<ErrorsList> errorsLists, long intervalDuration, long stepHours , boolean progress){
		List<DataCredibility> result = new ArrayList<DataCredibility>();
		for(ErrorsList errors:errorsLists){
			DataCredibility credibility = calcDataCredibility(errors, intervalDuration, stepHours, progress);
			result.add(credibility);
		}
		return result;
	}
	

	public static Double calcMedian(Collection<Double> errors){
		return Statistics.calculateMedian(new ArrayList<Double>( errors ));
	}
	

	public static Double calcFirstQuartile(Collection<Double> errors){
		// musi byt usortene
		return BoxAndWhiskerCalculator.calculateQ1(new ArrayList<Double>( errors ));
	}
	
	public static Double calcThirdQuartile(Collection<Double> errors){
		// musi byt usortene
		return BoxAndWhiskerCalculator.calculateQ3(new ArrayList<Double>( errors ));
	}
	
	private static Double calcIQR(Double Q1, Double Q3){
		return Q3 - Q1;
	}
	
	private static Pair<Double, Double> calcBounds(Double Q1, Double Q3, Double multiplier){
		Double IQR = calcIQR(Q1, Q3);
		Double lower = Q1 - multiplier * IQR;
		Double upper = Q1 + multiplier * IQR;
		return new Pair<Double, Double>(lower, upper);
	}
	
	public static Pair<Double, Double> calcOutlierBounds(Double Q1, Double Q3){
		return calcBounds(Q1,Q3, 1.5);
	}
	
	public static Pair<Double, Double> calcExtremeBounds(Double Q1, Double Q3){
		return calcBounds(Q1,Q3, 3.0);
	}
	
	public static Pair<Double, Double> calcMinMax(Collection<Double> errors){
		Double min = Double.MAX_VALUE;
		Double max = Double.MIN_VALUE;
		for(Double error:errors){
			min = Math.min(min, error);
			max = Math.max(max, error);
		}
		return new Pair<Double, Double>(min, max);
	}
	
	public static Pair<List<Double>, List<Double>> getValuesOutOfBounds(Errors errors, Pair<Double, Double> bounds){
		List<Double> under = new ArrayList<Double>();
		List<Double> over  = new ArrayList<Double>();
		for(Double error:errors){
			if(error.compareTo(bounds.get1()) < 0){
				under.add(error);
			}
			if(error.compareTo(bounds.get2()) > 0){
				over.add(error);
			}
		}
		return new Pair<List<Double>, List<Double>>(under, over);
	}
	
	public static Pair<List<Double>, Counts> calcStatistics(Set<ContinuousStatisticsMethod> methods, 
																 VerifDataTable forecasts, 
																 VerifDataTable observations){
		return ContinuousStatistics.calculateStatistics(methods, forecasts, observations);
	}
	
	public static List<Pair<List<Double>, Counts>> calcStatistics(Set<ContinuousStatisticsMethod> methods, 
																	   List<VerifDataTable> forecastTables, 
																	   List<VerifDataTable> observationTables){
		List<Pair<List<Double>, Counts>> result = new ArrayList<Pair<List<Double>,Counts>>();
		Iterator<VerifDataTable> obsIt = forecastTables.iterator();
		Iterator<VerifDataTable> forIt = observationTables.iterator();
		while(obsIt.hasNext() && forIt.hasNext()){
			Pair<List<Double>, Counts> stats = ContinuousStatistics.calculateStatistics(methods, forIt.next() , obsIt.next()); 
			result.add(stats);
		}
		return result;
	}
	
	
}
