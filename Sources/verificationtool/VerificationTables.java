package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

import com.microstepmis.model.verification.verificationtool.CategoricalStatistics.CategoricalStatisticsMethod;
import com.microstepmis.util.math.ContinuousStatistics.ContinuousStatisticsMethod;

/**
 * <h3>Verification Tables</h3>
 * Obsahuje zoznam vsetkych tabuliek, ktore sa pouzivaju pri verifikacii.
 * Zvacsa ide o "typedefy", ktorych ulohou je zjednodusit kod.
 * 
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VerificationTables.java,v 1.7 2015/01/27 15:43:48 marekru Exp $
 * 
 */
public final class VerificationTables {
	private VerificationTables(){}
	
	interface Putable{
		public void putTable(Date key, VerifDataTable table);
	}

	private static class VerifTableGeneral<T extends Comparable<T>, S> extends TreeMap<T, S>{
		private static final long serialVersionUID = 1L;
		public VerifTableGeneral() {}
		public VerifTableGeneral(SortedMap<T, S> map){
			super(map);
		}
	}
	
	public static class VerifTable<S> extends VerifTableGeneral<Date, S>{
		private static final long serialVersionUID = 1L;
		public VerifTable() {}
		public VerifTable(SortedMap<Date, S> map){
			super(map);
		}	
	}
		
	public static class VerifDataTable extends VerifTable<Double> implements Putable{
		private static final long serialVersionUID = 1L;
		public VerifDataTable() {}
		public VerifDataTable(SortedMap<Date, Double> map){
			super(map);
		}
		public void putTable(Date key, VerifDataTable table) {
			super.putAll(table);
		}	
	}
	
	public static class ForecastTable extends VerifTable<VerifDataTable> implements Putable{
		private static final long serialVersionUID = 1L;
		public ForecastTable() {}
		public ForecastTable(SortedMap<Date, VerifDataTable> map){
			super(map);
		}
		public void putTable(Date key, VerifDataTable table) {
			super.put(key, table);
		}
	}
	
	public static class VerifDataTables extends ArrayList<VerifDataTable>{
		private static final long serialVersionUID = 1L;
		private TimeInterval interval = null;
		public VerifDataTables() { }
		
		public void setInterval(TimeInterval interval) {
			this.interval = interval;
		}
		
		public TimeInterval getInterval(){
			if(interval != null){
				return interval;
			}
			if(size() > 0){
				Date from = this.get(0).firstKey();
				Date to   = this.get(size() - 1).lastKey();
				return new TimeInterval(from, to);
			}
			return null;
		}
	}
	
	public static class Errors extends ArrayList<Double>{
		private static final long serialVersionUID = 1L;
		public Errors() {}
		public Errors(Collection<? extends Double> collection){
			super(collection);
		}
	}
	
	public static class ErrorsList extends ArrayList<Errors>{	
		private static final long serialVersionUID = 1L;
		public ErrorsList() {}
	}

	public static class ContinuousStatisticsTable extends HashMap<ContinuousStatisticsMethod, List<Double>>{
		private static final long serialVersionUID = 1L;
		public ContinuousStatisticsTable() {}
	}

	public static class CategoricalStatisticsTable extends HashMap<CategoricalStatisticsMethod, Double>{
		private static final long serialVersionUID = 1L;
		public CategoricalStatisticsTable() {}
	}
	
	public static class DataCredibility extends ArrayList<Double>{
		private static final long serialVersionUID = 1L;
		public DataCredibility() { }
		public DataCredibility(int size) { super(size); }
	}
	
	public static VerifDataTable createVerifDataTable(){
		return new VerifDataTable();
	}
	
	public static VerifDataTables createVerifDataTables(){
		return new VerifDataTables();
	}
	
	public static Errors createErrorsTable(){
		return new Errors();
	}
	
	public static ErrorsList createErrorsTableList(){
		return new ErrorsList();
	}
	
	public static ContinuousStatisticsTable createContinuousStatisticsTable(){
		return new ContinuousStatisticsTable();
	}
	
	public static CategoricalStatisticsTable createCategoricalStatisticsTable(){
		return new CategoricalStatisticsTable();
	}
	
	public static DataCredibility createDataCredibility(){
		return new DataCredibility();
	}
	
	
	
}
