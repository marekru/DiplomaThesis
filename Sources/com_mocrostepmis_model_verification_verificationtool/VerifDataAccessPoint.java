package com.microstepmis.model.verification.verificationtool;

import java.io.File;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Set;


import com.microstepmis.ims.data.taf.verification.ContingencyTable;
import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.CategoricalStatistics.CategoricalStatisticsMethod;
import com.microstepmis.model.verification.verificationtool.ModelVerification.MeasurementType;
import com.microstepmis.model.verification.verificationtool.VerificationTables.CategoricalStatisticsTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ContinuousStatisticsTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.DataCredibility;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ErrorsList;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ForecastTable;
import com.microstepmis.util.FileUtils;

import com.microstepmis.util.math.ContinuousStatistics.ContinuousStatisticsMethod;

import com.microstepmis.xplatform.rpc.RPC;

/**
 * Verification Data Access Point
 *
 * Pristupoy bod z webu pre vsetky dolezite data z verifikacie.
 *
 * TODO data sa budu ziskavat vykucne podla requestu a nie podla konfigu !!! ... ci ??? ... skor ci
 * TODO vytvorit request a response, aby korespondovali 1:1
 * TODO dalsie metody podla requestu resp. responsu
 * TODO cfg nenacitavat vzdy, ale nejako inak to poriesit !!!
 * TODO vytvorit pre metody dvojicky s parametrom CFG iba :)
 * TODO doplnit komentare
 * TODO premysliet to cele, ci sa to neda nejako zjednotit, ze pre upperair, surface 
 * 		... bude len 1 metoda addDataToPackage a vsetky metody v tejto classe budu v nejakych samostatnych
 * 		Pravdepodobne by sa to dalo nejako vykoumat cez reflection model...uvidime :)
 * 
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VerifDataAccessPoint.java,v 1.21 2015/03/24 07:44:45 marekru Exp $
 * 
 * 
 * 
 */
public final class VerifDataAccessPoint {
	private static Log log = new Log(ModelVerificationCfg.LOG_NAME);
	
	private VerifDataAccessPoint(){}
	
	/**
	 * Hlavna metoda tejto triedy.
	 * Jej ulohou je na zaklade requestu ziskat vsetky pozadovane data a poskladat vysledny response.
	 * @param request - specifikacia pozadovanych dat
	 * @return response - tabulka modelov, obsahujuca tabulku premennych 
	 * a pre kazdu premennu existuje balik dat obsahujucit vsetky pozadovane data (surove data, statistiky, kontingencne tabulky, ...).
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static VisDataResponse requestLastData(VisDataRequest request){
		log.note("l(5)", "HERE !!!!");
		VisDataResponse result = new VisDataResponse();
		for(String model: request.models){ 
			log.note("l(5)", "Requesting Model: %s ", model);
			VisDataResponse.StationData stationData = new VisDataResponse.StationData();
			for(StationCfg station: request.stations){
				log.note("l(5)", "Requesting station: %s ", station.toString());
				VisDataResponse.VariablesData varData = new VisDataResponse.VariablesData();
				for(VarCfg var:station.variables){
					log.note("l(5)", "Requesting Variable: %s ", var.variableName);
					VisDataResponse.DataPackage value = packRequestedData(request, var, station);
					varData.put(var.variableName, value);
				}
				stationData.put(station.toString(), varData);
			}
			result.modelData.put(model, stationData);
		}
		return result;
	}
	
	// region Surface Methods

	/**
	 * 
	 * <p>
	 * Metoda nam vratiu tabulku s chybami
	 * Tabulky nie su nijako upravovane.
	 * 
	 * @param dir - priecinok, v ktorom ocakavame data
	 * @param variableName - meno ziadanej premennej
	 * @return prazdna tabulka, ak subor neexistuje
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static ForecastTable getLastErrorDataSurface(String dir, StationCfg station, String variableName ){ 
		File file = getLastModifiedFile(dir, MeasurementType.Surface, station, variableName);
		ForecastTable result = new ForecastTable();
		if( file != null ){
			result = VerifDataProcessor.readForecastTableFromCsv(file.getPath());
		}else{
			log.warning("l(3)", "File for station: %s and variable: %s in directory: %s doesn't exists.", station.toString(), variableName, dir);
		}
		return result;
	}
	
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static ContingencyTable getLastContingencyTableSurface(String dir, StationCfg station, String variableName ){ 
		return new ContingencyTable(); // TODO natiahnut ulozenu contingency table
	}
	
	
	/** 
	 * Metoda vypocita statistiky z poslednych ulozenych dat.
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param interval - interval v ktorom sa pohybujeme
	 * @param treshold - hranicna hodnota, na zaklade ktorej sa pocita kontingencna tabulka
	 * @param methods - ake statisticke metody chceme pouzit
	 * @return Mapa: </br>
	 * 				 <b>key</b> -> Statisticka metoda </br>
	 * 				 <b>value</b> -> Samotna statistika
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static CategoricalStatisticsTable getLastCategoricalStatsSurface(String dir, StationCfg station, String variableName, TimeInterval interval, Double treshold, Set<CategoricalStatisticsMethod> methods){
		ContingencyTable table = getLastContingencyTableSurface(dir, station, variableName);
		return VerifDataStatistics.calcCategoricalStats(table, methods);
	}
	
	/**
	 * 
	 * Metoda, ktora vyextrahuje posledne data v spravnom formate.
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param verificationPeriodStep - krok verifikacie, zvucajne 1 mesiac
	 * @param statisticsStep - krok pre statistiky - zvycajne 48 hodin
	 * @return
	 */
	
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static List<ForecastTable> getLastErrorTablesSurface(String dir, StationCfg station, String variableName, TimeInterval timeInterval, StepSize verificationPeriodStep){
		ForecastTable data = getLastErrorDataSurface(dir, station, variableName);
		List<TimeInterval> intervals = timeInterval.toSubintervals(verificationPeriodStep);
		return VerifDataProcessor.extractIntervals(data, intervals);
	}

	/**
	 * 
	 * Metoda, transformuje posledne ulozene chyby do spravneho formatu.
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param verificationPeriodStep - krok verifikacie, zvucajne 1 mesiac
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static List<ErrorsList> getLastErrorsSurface(String dir, StationCfg station, String variableName, TimeInterval timeInterval, StepSize verificationPeriodStep){
		List<ForecastTable> errorTables = getLastErrorTablesSurface(dir, station, variableName, timeInterval, verificationPeriodStep);
		return VerifDataProcessor.transformErrors(errorTables);
	}
	
	/**
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param verificationPeriodStep - krok verifikacie, zvucajne 1 mesiac
	 * @param statisticsStep - krok pre statistiky - zvycajne 48 hodin
	 * @param methods - mnozina statistickych metod, ktore sa budu pocitat
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static List<ContinuousStatisticsTable> getLastContinuousStatsSurface(
			String dir, 
			StationCfg station,
			String variableName, 
			TimeInterval timeInterval, 
			StepSize verificationPeriodStep, 
			Set<ContinuousStatisticsMethod> methods){
		List<ErrorsList> errorsLists = getLastErrorsSurface(dir, station, variableName, timeInterval, verificationPeriodStep);
		return VerifDataStatistics.calcContinuousStats(errorsLists, methods);
	}
	
	
	/**
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param verificationPeriodStep - krok verifikacie, zvucajne 1 mesiac
	 * @param statisticsStep - krok pre statistiky - zvycajne 48 hodin
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static List<DataCredibility> getLastCredibilitySurface(
			String dir, 
			StationCfg station,
			String variableName, 
			TimeInterval timeInterval, 
			StepSize verificationPeriodStep, 
			StepSize statisticsStep){
		List<ErrorsList> errorsLists = getLastErrorsSurface(dir, station, variableName, timeInterval, verificationPeriodStep);
		// TODO vypocet credibility asi inak!
		return VerifDataStatistics.calcDataCredibility(errorsLists, verificationPeriodStep.toHours(), statisticsStep.toHours(), false);
	}
	
	// endregion
	
	// region Progress methods
	
	/**
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param progressStep - krok ...
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static ErrorsList getLastErrorsProgress(String dir, StationCfg station, String variableName, TimeInterval timeInterval, StepSize progressStep){
		ForecastTable data = getLastErrorDataSurface(dir, station, variableName);
		List<TimeInterval> intervals = timeInterval.toSubintervals(progressStep);
		return VerifDataProcessor.transformErrorsProgress(data, intervals);
	}
	
	/**
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param progressStep - krok ...
	 * @param methods - mnozina statistickych metod, ktore sa budu pocitat
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static ContinuousStatisticsTable getLastContinuousStatsProgress(String dir, StationCfg station, String variableName, TimeInterval timeInterval, StepSize progressStep, Set<ContinuousStatisticsMethod> methods){
		ErrorsList errorsList = getLastErrorsProgress(dir, station, variableName, timeInterval, progressStep);
		return VerifDataStatistics.calcContinuousStats(errorsList, methods);
	}
	
	/**
	 * 
	 * @param dir - priecinok z ktoreho berieme data
	 * @param variableName - meno premennej
	 * @param timeInterval - interval v ktorom sa pohybujeme
	 * @param progressStep - krok ...
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static List<Double> getLastCredibilityProgress(String dir, StationCfg station, String variableName, TimeInterval timeInterval, StepSize progressStep){
		ErrorsList errorsList = getLastErrorsProgress(dir, station, variableName, timeInterval, progressStep);
		// TODO vypocet credibility asi inak!
		return VerifDataStatistics.calcDataCredibility(errorsList, timeInterval.getDurationInHours(), progressStep.toHours(), true);
	}
	
	// endregion
	
	// region Pack Data
	
	/**
	 * 
	 * @param request
	 * @param variableName
	 * @return
	 */
	private static VisDataResponse.DataPackage packRequestedData(VisDataRequest request, VarCfg variable, StationCfg station){
		ModelVerificationCfg cfg = ModelVerificationCfg.readConfiguration();
		VisDataResponse.DataPackage pack = new VisDataResponse.DataPackage();
		
		addSurfaceDataToPackage (request.surface,  pack, cfg, variable, station);
		addProgressDataToPackage(request.progress, pack, cfg, variable, station);
		addUpperairDataToPackage(request.upperair, pack, cfg, variable, station);
		
		return pack.getOnlyRequested(request);
	}
	
	/**
	 * TODO ak sa bude dat, tak este krajsie to sprav :)
	 * @param request
	 * @param pack
	 * @param cfg
	 * @param variableName
	 */
	private static void addSurfaceDataToPackage(VisDataRequest.TableDataRequest request, VisDataResponse.DataPackage pack, ModelVerificationCfg cfg, VarCfg variable, StationCfg station){
		if(!request.wantThis){
			return;
		}
		pack.errorDataSurface = getLastErrorDataSurface(cfg.dataFileOutputDir, station, variable.variableName);
		boolean wantErrorsOrStatsOrCredibility = request.wantErrors || (request.continuousMethods.size() > 0 || request.wantCredibility);
		if(request.wantErrorTables || wantErrorsOrStatsOrCredibility || request.wantIntervals){
			TimeInterval interval = fitInterval(pack.errorDataSurface,cfg.timeInterval);
			pack.intervalsSurface = interval.toSubintervals(cfg.verificationPeriodStep);
			if(request.wantErrorTables || wantErrorsOrStatsOrCredibility){
				pack.errorTablesSurface = VerifDataProcessor.extractIntervals(pack.errorDataSurface, pack.intervalsSurface);
			}
			if(wantErrorsOrStatsOrCredibility){
				pack.errorsSurface = VerifDataProcessor.transformErrors(pack.errorTablesSurface);
				pack.continuousStatsSurface = VerifDataStatistics.calcContinuousStats(pack.errorsSurface, request.getContinuousStatisticsMethods());	
				if(request.wantCredibility){
					// TODO vypocet credibility asi inak!
					//pack.credibilitySurface = VerifDataStatistics.calcDataCredibility(pack.errorsSurface, cfg.verificationPeriodStep.toHours(), cfg.statisticsStep.toHours(), false);
				}
			}
		}
		
		if(request.wantContingencyTable || request.categoricalMethods.size() > 0){
			pack.contingencyTabeSurface = getLastContingencyTableSurface(cfg.dataFileOutputDir, station, variable.variableName);
			pack.categoricalStatsSurface = VerifDataStatistics.calcCategoricalStats(pack.contingencyTabeSurface, request.getCategoricalStatisticsMethods());
		}
		
	}
	
	/**
	 * 
	 * @param request
	 * @param pack
	 * @param cfg
	 * @param variableName
	 */
	private static void addProgressDataToPackage(VisDataRequest.TableDataRequest request, VisDataResponse.DataPackage pack, ModelVerificationCfg cfg, VarCfg variable, StationCfg station){
		if(!request.wantThis){
			return;
		}
		if(pack.errorDataSurface == null){
			pack.errorDataSurface = getLastErrorDataSurface(cfg.dataFileOutputDir, station, variable.variableName);
		}	
		boolean wantErrorsOrStatsOrCredibility = request.wantErrors || (request.continuousMethods.size() > 0 || request.wantCredibility);
		if(request.wantIntervals || wantErrorsOrStatsOrCredibility){
			TimeInterval interval = fitInterval(pack.errorDataSurface,cfg.timeInterval);
			pack.intervalsProgress = interval.toSubintervals(cfg.progressStep);
			if(wantErrorsOrStatsOrCredibility){
				pack.errorsProgress = VerifDataProcessor.transformErrorsProgress(pack.errorDataSurface, pack.intervalsProgress);
				pack.continuousStatsProgress = VerifDataStatistics.calcContinuousStats(pack.errorsProgress, request.getContinuousStatisticsMethods());
				if(request.wantCredibility){
					// TODO vypocet credibility asi inak!
					//pack.credibilityProgress = VerifDataStatistics.calcDataCredibility(errorsList, timeInterval.getDurationInHours(), progressStep.toHours(), true);
				}
			}
		}
	}
	
	/**
	 * 
	 * @param request
	 * @param pack
	 * @param cfg
	 * @param variableName
	 */
	private static void addUpperairDataToPackage(VisDataRequest.TableDataRequest request, VisDataResponse.DataPackage pack, ModelVerificationCfg cfg, VarCfg variable, StationCfg station){ // NOSONAR - v buducnu bude implementovana
		// TODO
	}
	
	// endregion
	
	
	/**
	 * 
	 * <p>
	 * Ziska subor s hodnotami chyb predpovede
	 * Ak takyto subor neexistuje , tak vrati null
	 * @param mainDir - hlavny priecinok, kde ocakavame data
	 * @param measurementType - typ merania - upperair/surface
	 * @param variableName - meno premennej
	 * @return null - ak nebolo mozne najst subor
	 */
	private static File getLastModifiedFile(String mainDir, MeasurementType measurementType, StationCfg station, String variableName){
		String path = ModelVerification.constructDirPath(mainDir, measurementType,station, variableName);
		File dir = new File(path);
		return FileUtils.getLastModifiedFile(dir);
	}
	
	
	/**
	 * @param fcstTable
	 * @param obsTable
	 * @param interval
	 * @return
	 * 
	 */
	private static TimeInterval fitInterval(ForecastTable errorTable, TimeInterval interval){
		if(errorTable.size() <= 0){
			return interval;
		}
		Date from = errorTable.firstKey();
		Calendar fromCalendar = new GregorianCalendar();
		if(interval.contains(from)){
			fromCalendar.setTime(from);
			fromCalendar.set(Calendar.HOUR_OF_DAY, 0);
			fromCalendar.set(Calendar.DAY_OF_MONTH, 1);
		}else{
			fromCalendar.setTime(interval.from);
		}
		Date to = errorTable.lastKey();
		Calendar toCalendar = new GregorianCalendar();
		if(interval.contains(to)){
			toCalendar.setTime(to);
		}else{
			toCalendar.setTime(interval.to);
		}
		return new TimeInterval(fromCalendar, toCalendar);
	}
	
}
