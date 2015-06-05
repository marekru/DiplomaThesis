package com.microstepmis.model.verification.verificationtool;

import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import com.microstepmis.agentspace.LocalSpace;
import com.microstepmis.ims.cfg.Stations;
import com.microstepmis.ims.cfg.Stations.Station;
import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.CategoricalStatistics.CategoricalStatisticsMethod;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ErrorsList;
import com.microstepmis.model.verification.verificationtool.VisDataResponse.DataPackage;
import com.microstepmis.model.verification.verificationtool.VerificationTables.*;
import com.microstepmis.util.math.ContinuousStatistics.ContinuousStatisticsMethod;
import com.microstepmis.xplatform.X2O;


/**
 * <h3>Model Verification</h3>
 *
 * <p>
 * Hlavna trieda verifikacie
 * 
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: ModelVerification.java,v 1.33 2015/01/28 08:11:21 marekru Exp $
 * 
 */
public final class ModelVerification {
	private static Log log = new Log(ModelVerificationCfg.LOG_NAME);
	
	private ModelVerification() {}
	
	enum MeasurementType{ 
		Surface,
		Upperair
	}

	
	private static boolean completeStationInfo(Station station){
		boolean result = true;
		result &= (station.name != null); 
		result &= (station.latitude != null); 
		result &= (station.longitude != null); 
		return result;
	}
	
	private static boolean hasSimilarNameOrCCCC(Station st0, Station st1){
		if(st0 == null || st1 == null){
			return false;
		}
		if(st0.name != null && st1.name != null && st0.name.compareTo(st1.name) == 0){
			return true;
		}
		if(st0.cccc != null && st1.cccc != null && st0.cccc.compareTo(st1.cccc) == 0){
			return true;
		}
		return false;
	}
	
	private static Stations readStationsFromBlock(){
		Stations stations = (Stations) LocalSpace.getInstance().read(Stations.blockName);
		if(stations != null){
			return stations;
		}
		try {
			stations = (Stations) X2O.mapFromXML(new File("../cfg/station/stations.xml"));
		} catch (Exception e) {
			log.exception("l(3)", e);
			return null;
		}
		return stations;
	}
	
	private static List<StationCfg> completizeStationInfo( List<StationCfg> stationList ){
		List<StationCfg> result = new ArrayList<StationCfg>();
		Stations stations = readStationsFromBlock();
		if(stations == null){
			log.warning("l(3)", "Couldn't load block %s. Stations won't ne completized.", Stations.blockName);
			return stationList;
		}
		for(StationCfg station:stationList){
			if(completeStationInfo(station)){
				result.add(station);
			}else{
				boolean found = false;
				for(Station st:stations.stations){
					if(hasSimilarNameOrCCCC(st, station)){
						StationCfg completizedStation = new StationCfg(st);
						completizedStation.variables.addAll(station.variables);
						result.add(completizedStation);
						found = true;
						break;
					}
				}
				if(!found){
					result.add(station);
				}
			}
		}
		return result;
	}
	
	
	/**
	 * 
	 * @param mainDir
	 * @param measurementType
	 * @param variableName
	 * @param observation
	 * @return
	 */
	public static String constructDirPath(String mainDir, MeasurementType measurementType, StationCfg station, String variableName){ //, boolean observation){
		StringBuilder builder = new StringBuilder();
		builder.append(mainDir);
		builder.append('/');
		builder.append(measurementType.toString());
		builder.append('/');
		builder.append(station.toString());
		builder.append('/');
		//builder.append((observation)?"Observation":"Forecast");
		//builder.append('/');
		builder.append(variableName);
		return builder.toString();
	}
	
	/**
	 * 
	 * @param interval
	 * @return
	 */
	public static String constructFilePath(TimeInterval interval){
		SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHH");
		Calendar from = new GregorianCalendar();
		from.setTime(interval.from);
		Calendar to = new GregorianCalendar();
		to.setTime(interval.to);
		//////////////////
		StringBuilder builder = new StringBuilder();
		builder.append(format.format(from.getTime()));
		builder.append("_");
		builder.append(format.format(to.getTime()));
		builder.append(".csv");
		return builder.toString();
	}
	
	/**
	 * 
	 * @param verifCfg
	 * @param observation
	 * @return
	 */
	public static String constructFilePath(ModelVerificationCfg verifCfg, MeasurementType measurementType, StationCfg station, String variableName){ //, boolean observation){
		StringBuilder builder = new StringBuilder();
		String dir = constructDirPath(verifCfg.dataFileOutputDir, measurementType, station, variableName); //, observation);
		String fileName = constructFilePath(verifCfg.timeInterval);
		builder.append(dir);
		builder.append('/');
		builder.append(fileName);
		return builder.toString();
	}
	
	public static void verify(ModelVerificationCfg cfg){
		List<StationCfg> stations = completizeStationInfo(cfg.stations);
		for(StationCfg stationCfg:stations){
			for(VarCfg varCfg:stationCfg.variables){
				for(String run:stationCfg.runs){
					SourceCfg obsSource = null;
					SourceCfg fcstSource = null;
					for(SourceCfg sourceCfg:cfg.obsSources){
						if(sourceCfg.matches(stationCfg, run, varCfg)){
							obsSource = sourceCfg;
							break;
						}
					}
					for(SourceCfg sourceCfg:cfg.fcstSources){
						if(sourceCfg.matches(stationCfg, run, varCfg)){
							fcstSource = sourceCfg;
							break;
						}
					}
					if(obsSource == null || fcstSource == null){
						continue;
					}
						
					VerifDataDescriptor obsDescriptor = new VerifDataDescriptor(obsSource, varCfg, stationCfg, new TimeInterval());
					VerifDataDescriptor fcstDescriptor = new VerifDataDescriptor(fcstSource, varCfg, stationCfg, new TimeInterval());
					
					VerifDataTable observation = VerifDataProcessor.getObservations(obsDescriptor);
					ForecastTable forecast = VerifDataProcessor.getForecasts(fcstDescriptor);
					
					observation = VerifDataProcessor.convertUnits(observation, obsSource.unit, varCfg.unit);
					forecast = VerifDataProcessor.convertUnits(forecast, fcstSource.unit, varCfg.unit);
					
					// 1. najprv vypocitam chyby
					ForecastTable errors = VerifDataStatistics.calcErrors(forecast, observation);
					if(cfg.saveToCSVFile){
						String path = constructFilePath(cfg, MeasurementType.Surface, stationCfg, varCfg.variableName);
						VerifDataProcessor.saveTableToCsv(errors, new File(path));
					}
					if(cfg.progress){
						// 2. potom vytiahnem intervali chyb
						List<TimeInterval> intervals = cfg.timeInterval.toSubintervals(cfg.progressStep);
						ErrorsList errorGroups = VerifDataProcessor.transformErrorsProgress(errors, intervals);
						// 3. statistiky pre intervali
						ContinuousStatisticsTable stats = VerifDataStatistics.calcContinuousStats(errorGroups, cfg.continuousMethods); //NOSONAR toto sa neskor vyuzie
					}else{
						// 2. potom vytiahnem intervali chyb
						List<TimeInterval> intervals = cfg.timeInterval.toSubintervals(cfg.verificationPeriodStep);
						List<ForecastTable> errorTables = VerifDataProcessor.extractIntervals(errors, intervals);
						List<ErrorsList> errorGroups = VerifDataProcessor.transformErrors(errorTables);
						// 3. statistiky pre intervali
						List<ContinuousStatisticsTable> stats = VerifDataStatistics.calcContinuousStats(errorGroups, cfg.continuousMethods); //NOSONAR toto sa neskor vyuzie
					}
					// TODO Contingency table pre ForecastTable spravit...ako? neviem
					//ContingencyTable table = CategoricalStatistics.createContingencyTable(forData, obsData, obsDesc.getInterval(), var.treshold);
					//Map<CategoricalStatisticsMethod, Double> catStatistics = VerifDataStatistics.calcCategoricalStats(table, verifCfg.categoricalMethods); // NOSONAR pouzije sa to v buducnu
					
				}
			}
		}
		
	}
	
	public static void verify(){
		ModelVerificationCfg cfg = ModelVerificationCfg.readConfiguration();
		verify(cfg);
	}

	
	public static void main(String[] args) {
		//verify();
		
		VisDataRequest request = new VisDataRequest();
		request.wantMetaInfo = false;
		request.models.add("WRF");
		
		final String STATION_NAME = "Al Faqaa";
		
		StationCfg station = new StationCfg();
		station.name = STATION_NAME;
		station.variables.add(new VarCfg("pressure", ""));
		request.stations.add(station);
		request.surface.categoricalMethods.add(CategoricalStatisticsMethod.POD.toString());

		request.surface.continuousMethods.add(ContinuousStatisticsMethod.MFE.toString());
		request.surface.continuousMethods.add(ContinuousStatisticsMethod.MAE.toString());
		request.surface.continuousMethods.add(ContinuousStatisticsMethod.RMSE.toString());
		
		request.surface.wantErrors = true;
		request.surface.wantContingencyTable = true;
		request.surface.wantCredibility = true;
		request.surface.wantErrorTables = true;
		request.surface.wantErrorData = true;
		request.surface.wantIntervals = true;
		
		
		request.progress.wantThis = true;
		request.progress.continuousMethods.add(ContinuousStatisticsMethod.RMSE.toString());
		request.progress.wantErrors = true;
		request.progress.wantContingencyTable = true;
		request.progress.wantCredibility = true;
		request.progress.wantErrorTables = true;
		request.progress.wantErrorData = true;
		request.progress.wantIntervals = true;
		
		
		
		VisDataResponse response = VerifDataAccessPoint.requestLastData(request);
		
		DataPackage data = response.modelData.get("WRF").get("Al Faqaa").get("pressure");
	
		
		System.out.println(data);
		
		//ModelVerificationCfg.writeConfiguration(new ModelVerificationCfg());
		
	}
	
	
	

}
