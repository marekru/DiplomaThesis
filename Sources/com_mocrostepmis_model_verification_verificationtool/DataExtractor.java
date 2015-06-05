package com.microstepmis.model.verification.verificationtool;

import java.util.Calendar;
import java.util.List;
import java.util.Map;

import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.DBDataExtractor.DBType;
import com.microstepmis.util.math.Interval;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;

/**
 * Data Extractor
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: DataExtractor.java,v 1.14 2015/04/21 08:22:53 marekru Exp $
 * 
 * Abstraktna trieda na ziskavanie predpovedi a pozorovani. Sluzi aj ako factory na vytvaranie dcerskych tried.
 */
public abstract class DataExtractor {
	

	Log log = new Log(ModelVerificationCfg.LOG_NAME);

	public interface DataSource{}
	
	public enum ForecastSource implements DataSource{
		LocalGrib, RemoteGrib, Block, EnviDB, CSVFile // ... 
	}
	
	public enum ObservationSource implements DataSource{
		WebSource, CLDB, CSVFile // ...
	}
	
	// TODO zatial takto, uvidime neskor, co vsetko tam bude treba/netreba
	public static class DataKey{
		public final static String DEFAULT_LEVEL = "Surface";
		
		private long run;
		private double lat;
		private double lon;
		private String level;
		private String parameter;
		
		public DataKey(long run, double lat, double lon, String level, String parameter) {
			this.run = run;
			this.lat = lat;
			this.lon = lon;
			this.level = level;
			this.parameter = parameter;
		}
		
		public DataKey(long run){
			this.run = run;
			this.lat = 0.0;
			this.lon = 0.0;
			this.level = "";
			this.parameter = "";
		}
		
		public long getRun() {
			return run;
		}
		
		public double getLat() {
			return lat;
		}
		
		public double getLon() {
			return lon;
		}
		
		public String getLevel() {
			if(level == null){
				return DEFAULT_LEVEL;
			}
			return level;
		}
		
		public String getParameter() {
			return parameter;
		}
		
	}
	
	/**
	 * Factory metoda na vytvaranie DataExtractorov na zaklade zdroja dat.
	 * @param source
	 * @return
	 */
	public static DataExtractor getInstance(DataSource source){
		if(source instanceof ForecastSource){
			return getInstance((ForecastSource)source);
		}else if(source instanceof ObservationSource){
			return getInstance((ObservationSource)source);
		}
		return null;
	}
	
	private static DataExtractor getInstance(ForecastSource source){
		if(source == ForecastSource.LocalGrib){
			return new GribDataExtractor(false);
		}else if(source == ForecastSource.RemoteGrib){
			return new GribDataExtractor(true);
		}else if(source == ForecastSource.Block){
			return new BlockDataExtractor();
		}else if(source == ForecastSource.EnviDB){
			return new DBDataExtractor(DBType.EnviDB);
		}else if(source == ForecastSource.CSVFile){
			return new CSVDataExtractor(source);
		}
		return null;
	}
	
	private static DataExtractor getInstance(ObservationSource source){
		if(source == ObservationSource.WebSource){
			return new WebDataExtractor();
		}else if(source == ObservationSource.CLDB){
			return new DBDataExtractor(DBType.CLDB);
		}else if(source == ObservationSource.CSVFile){
			return new CSVDataExtractor(source);
		}
		return null;
	}
	
	abstract public List<Long> getAllRuns(TimeInterval interval);
	
	abstract public void addSoruces(String[] sources);
	
	abstract public VerifDataTable extract(DataKey key);
	// TODO domysliet ake budu parametre
	abstract public Map<Double, VerifDataTable> extractUpperAir(DataKey key);
	
	
}
