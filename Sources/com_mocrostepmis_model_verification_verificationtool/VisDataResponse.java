package com.microstepmis.model.verification.verificationtool;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.microstepmis.ims.data.taf.verification.ContingencyTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.CategoricalStatisticsTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ContinuousStatisticsTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.DataCredibility;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ErrorsList;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ForecastTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTables;
import com.microstepmis.util.Pair;
import com.microstepmis.xplatform.JS;

/**
 * Visualization Data Response
 *
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VisDataResponse.java,v 1.9 2015/01/27 15:45:38 marekru Exp $
 * 
 * 
 */
@JS( files= { 
		@JS.File( name="../tomcat/webapps/ims/js/model/VisDataResponse.js" )
}) 
public class VisDataResponse{ // TODO upperair
	
	public static class DataPackage{
		// region Surface
		// 	Errors
		public ForecastTable errorDataSurface;
		public List<ForecastTable> errorTablesSurface;
		public List<ErrorsList> errorsSurface;
		//	Continuous Stats
		public List<ContinuousStatisticsTable> continuousStatsSurface;
		public List<DataCredibility> credibilitySurface;
		//	Categorical Stats
		public ContingencyTable contingencyTabeSurface;
		public CategoricalStatisticsTable categoricalStatsSurface;
		//	Others
		public List<TimeInterval> intervalsSurface;
		// endregion
		
		// region Progress
		public ErrorsList errorsProgress;
		public ContinuousStatisticsTable continuousStatsProgress;
		public DataCredibility credibilityProgress;
		public List<TimeInterval> intervalsProgress;
		// endregion
		
		/* TODO upperair
		public Foo continuousStatsUpperair = new Foo();
		public Goo categoricalStatsUpperair = new Goo();
		public Hoo contingencyTabeUpperair = new Hoo();
		public Joo errorsUpperair = new Joo();
		public Loo dataTablesUpperair = new Loo();
		*/
		
		public DataPackage getOnlyRequested(VisDataRequest request) {
			DataPackage result = new DataPackage();
			if(request.surface.wantThis){
				VisDataRequest.TableDataRequest tdRequest = request.surface;
				result.errorDataSurface = tdRequest.wantErrorData ? errorDataSurface : result.errorDataSurface;
				result.errorTablesSurface = tdRequest.wantErrorTables ? errorTablesSurface : result.errorTablesSurface;
				result.errorsSurface = tdRequest.wantErrors ? errorsSurface : result.errorsSurface;
				result.credibilitySurface = tdRequest.wantCredibility ? credibilitySurface : result.credibilitySurface;
				result.contingencyTabeSurface = tdRequest.wantContingencyTable ? contingencyTabeSurface : result.contingencyTabeSurface;
				result.continuousStatsSurface = (tdRequest.continuousMethods.size() > 0) ? continuousStatsSurface : result.continuousStatsSurface;
				result.categoricalStatsSurface = (tdRequest.categoricalMethods.size() > 0) ? categoricalStatsSurface : result.categoricalStatsSurface;
				result.intervalsSurface = (tdRequest.wantIntervals) ? intervalsSurface : result.intervalsSurface;
			}
			if(request.progress.wantThis){
				VisDataRequest.TableDataRequest tdRequest = request.progress;
				result.errorsProgress = tdRequest.wantErrors ? errorsProgress : result.errorsProgress;
				result.credibilityProgress = tdRequest.wantCredibility ? credibilityProgress : result.credibilityProgress;
				result.continuousStatsProgress = (tdRequest.continuousMethods.size() > 0) ? continuousStatsProgress : result.continuousStatsProgress;
				result.intervalsProgress = (tdRequest.wantIntervals) ? intervalsProgress : result.intervalsProgress;
			}
			if(request.upperair.wantThis){
				// TODO
			}
			return result;
		}
		
	}
	
	/**
	 * @key Meno premennej
	 * @value Balik dat
	 */
	public static class VariablesData extends HashMap<String, DataPackage>{
		private static final long serialVersionUID = 1L;
	}
	

	/**
	 * @key Meno stanice
	 * @value Mapa premennych s datami
	 */
	public static class StationData extends HashMap<String, VariablesData>{
		private static final long serialVersionUID = 1L;	
	}
	
	/**
	 * @key Meno modelu
	 * @value Mapa stanic s premennuimi
	 */
	public Map<String, StationData> modelData = new HashMap<String, StationData>();
	
	/**
	 * Zatial stupidne premenne koli mapovaniu!
	 */
	public DataPackage pack = null;
	public VariablesData varDara = null;
	public VerifDataTable table = null;

}
