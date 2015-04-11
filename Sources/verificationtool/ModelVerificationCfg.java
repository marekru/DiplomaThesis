package com.microstepmis.model.verification.verificationtool;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import com.microstepmis.ims.cfg.Stations.Station;
import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.CategoricalStatistics.CategoricalStatisticsMethod;
import com.microstepmis.model.verification.verificationtool.DataExtractor.ForecastSource;
import com.microstepmis.model.verification.verificationtool.DataExtractor.ObservationSource;
import com.microstepmis.util.math.ContinuousStatistics.ContinuousStatisticsMethod;
import com.microstepmis.xplatform.JS;
import com.microstepmis.xplatform.X2O;
import com.microstepmis.xplatform.XCfg;
import com.microstepmis.xplatform.rpc.RPC;

/**
 * Model Verification Configuration
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: ModelVerificationCfg.java,v 1.30 2015/03/24 07:43:35 marekru Exp $
 * TODO dokumentacne komentare ku vnutornym classam
 */

@JS( files= { 
		@JS.File( name="../tomcat/webapps/ims/js/ModelVerificationCfg.js" )
}) 

@XCfg(label="Model Verification Configuration")
public final class ModelVerificationCfg {

	public static final String CONFIG_BLOCK_NAME = "c/CfgVerif";
	public static final String FILE_NAME = "../cfg/model/ModelVerificationCfg.xml";
	public static final String LOG_NAME = "ModelVerif";
	public static final String FCST_BLOCK_NAME = "fcst";
	
	private static Log log = new Log(LOG_NAME);

	public ModelVerificationCfg(){}
	
	
	public static final class StationCreator{
		
		private StationCreator(){}
		
		public static StationCfg createStation() {
			return new StationCfg();
		}
		
		public static StationCfg createStation(String name, Double lat, Double lon, boolean nameIsCCCC) {
			StationCfg station = new StationCfg();
			if(nameIsCCCC){
				station.cccc = name;
			}
			station.name = name;
			station.latitude = lat;
			station.longitude = lon;
			return station;
		}
		
		public static StationCfg createStation(String name, boolean nameIsCCCC){
			return createStation(name, null, null, nameIsCCCC);
		}
		
		public static StationCfg createStation(String name){
			return createStation(name, false);
		}
		
		public static StationCfg createStation(Double lat, Double lon){
			return createStation(null, lat, lon, true);
		}
	}
	
	@XCfg(label="Forecast Sources")
	public SourceCfg[] fcstSources = { 
		new SourceCfg()
	};
	
	@XCfg(label="Observation Sources")
	public SourceCfg[] obsSources = { 
		new SourceCfg()
	};
	
	/**
	 * Zoznam stanic na verifikaciu
	 * Mena stanic - rovnake ako v ../cfg/station/stations.xml
	 */ 
	@XCfg(label="Stations")
	public ArrayList<StationCfg> stations = new ArrayList<StationCfg>(); // NOSONAR - koli mapovaniu TODO - nebudu mi stacit polia?
	{
		stations.add(StationCreator.createStation("Irbid"));
		stations.add(StationCreator.createStation("OMAA", true));
		stations.add(StationCreator.createStation(53.38333511352539, 23.616666793823242));
	}
	
	/**
	 * Spojite statisticke Metody, ktore sa pouziju pri procese verifikacie
	 * */
	@XCfg(label="Continuous Statistic Methods")
	public HashSet<ContinuousStatisticsMethod>  continuousMethods = new HashSet<ContinuousStatisticsMethod>(); // NOSONAR - koli mapovaniu 
	{
		continuousMethods.add(ContinuousStatisticsMethod.MFE);
		continuousMethods.add(ContinuousStatisticsMethod.MAE);
		continuousMethods.add(ContinuousStatisticsMethod.RMSE);
	}
	/**
	 * Kategoricke statisticke Metody, ktore sa pouziju pri procese verifikacie
	 * */
	@XCfg(label="Categorical Statistic Methods")
	public HashSet<CategoricalStatisticsMethod> categoricalMethods = new HashSet<CategoricalStatisticsMethod>(); // NOSONAR - koli mapovaniu 
	{
		categoricalMethods.add(CategoricalStatisticsMethod.POD);
		categoricalMethods.add(CategoricalStatisticsMethod.FAR);
	}
	/**
	 * Casovy Interval, v ktorom sa uskutocni verifikacia.
	 * TimeStamp
	 */	
	@XCfg(label="Time Interval")
	public TimeInterval timeInterval = new TimeInterval();
	/**
	 * Vyskovy Interval, v ktorom sa uskutocni verifikacia.
	 */
	@XCfg(label="Level Interval")
	public HeightInterval levelInterval = new HeightInterval();
	/**
	 * Velkost kroku verifikacne - standardne 1 mesiac
	 * <p>
	 * Cely timeInterval sa rozseka na X kuskov, dlzky N, ktore chceme podrobnejsie skumat.
	 * Kde N je verificationPeriodStep.
	 */
	@XCfg(label="Verification Period Step")
	public StepSize verificationPeriodStep = StepSize.MONTH;
	/**
	 * Velkost kroku statistik verifikacie - standardne  2 dni (48 hodin)
	 * <p>
	 * Cely timeInterval sa rozseka na nejakych X kuskov. 
	 * Kazdy takyto kusok sa potom spracuva tak, ze sa vezme 1. hodina, potom (1 + N)-ta, potom (1 + 2N)-ta .... a z nich sa vypocita statistika.
	 * Takymto sposobom sa to urobi pre kazdu hodinu od 1 po N.
	 */
	@XCfg(label="Statistics Step")
	public StepSize statisticsStep = StepSize.DAYS_2;
	/**
	 * Velkost kroku pri (rocnom/mesacnom/...)priebehu - standardne 1 den
	 * <p>
	 * V celom timeInterval sa pocita statistika pre kazdy N dnovi interval (napr. priemer za cely den).
	 */
	@XCfg(label="Progress Step")
	public StepSize progressStep = StepSize.DAY;
	/**
	 * Velkost kroku pri klzavom priemeri - standardne 14 dni (2 tyzdne)
	 * <p>
	 * Pri klzavom priemery sa pocita priemer pre konkretny den z poslednych N dni, ktore boli.
	 * Kde N je teda movingAverageStep.
	 */
	@XCfg(label="Moving Average Step")
	public StepSize movingAverageStep = StepSize.DAYS_14;
	/**
	 * True ak chceme, aby sa urobila verifikacia Upper Air
	 */
	@XCfg(label="Verify Upperair")
	public boolean upperAir = false;
	/**
	 * True ak chceme, aby sa urobil aj prebeh predpovedi pocas celeho intervaku (zvycajne rok)
	 */
	@XCfg(label="Progress") // TODO lepsi label
	public boolean progress = false;
	/**
	 * True ak chceme, aby boli data po nacitani a prekonvertovani do spravnych jednotiek ulozene do CSV suborov.
	 */
	@XCfg(label="Save Result to CVS File")
	public boolean saveToCSVFile = true;
	/**
	 * Miesto kam sa budu ukladat vyextrahovane data pripravene na verifikaciu.
	 */
	@XCfg(label="Result Output folder", defaultValue="../Output")
	public String dataFileOutputDir = "../Output"; 
	
	
	/**
	 * 
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static ModelVerificationCfg readConfiguration(){
		ModelVerificationCfg result = new ModelVerificationCfg();
		try {
			File configFile = new File(FILE_NAME);
			result = (ModelVerificationCfg) X2O.mapFromXML(configFile);
			log.note("l(5)", "Configuration file %s successfully loaded", FILE_NAME);
		} catch (Exception e) {
			log.warning("l(3)", "Unable to load configuration file %s. Using default configuration.", FILE_NAME);
			log.exception("l(1)", e);
		}
		return result;
	}
	
	/**
	 * 
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static boolean writeConfiguration(ModelVerificationCfg cfg){
		File configFile = new File(FILE_NAME);
		try {
			if(configFile.createNewFile()){
				 log.note(null, "File %s created.", configFile.getPath());
			}
			X2O.mapToXML(configFile, cfg);
		} catch (Exception e) {
			log.exception(null, e);
			return false;
		}
		return true;
	}
	
}
