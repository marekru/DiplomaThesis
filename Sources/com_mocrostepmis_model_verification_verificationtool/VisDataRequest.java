package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.microstepmis.model.verification.verificationtool.CategoricalStatistics.CategoricalStatisticsMethod;
import com.microstepmis.util.math.ContinuousStatistics.ContinuousStatisticsMethod;
import com.microstepmis.xplatform.JS;
/**
 * Visualization Data Request
 *
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VisDataRequest.java,v 1.9 2015/01/27 15:45:38 marekru Exp $
 * 
 * 
 */
@JS( files= { 
		@JS.File( name="../tomcat/webapps/ims/js/model/VisDataRequest.js" )
}) 
public class VisDataRequest{
	
	public VisDataRequest() {}

	public static class TableDataRequest{
		
		public TableDataRequest() {}
		
		public boolean wantThis = false;
		
		public Set<String> continuousMethods = new HashSet<String>();
		public Set<String> categoricalMethods = new HashSet<String>();
		public boolean wantErrorData = false;
		public boolean wantErrorTables = false;
		public boolean wantErrors = false;
		public boolean wantIntervals = false;
		public boolean wantCredibility = false;
		public boolean wantContingencyTable = false;
		
		
		public TableDataRequest(boolean wanted) {
			wantThis = wanted;
		}
		
		public Set<ContinuousStatisticsMethod> getContinuousStatisticsMethods(){
			Set<ContinuousStatisticsMethod> result = new HashSet<ContinuousStatisticsMethod>();
			for(String strMethod:continuousMethods){
				ContinuousStatisticsMethod method = null;
				try{
					method = ContinuousStatisticsMethod.valueOf(strMethod);
				}catch(IllegalArgumentException ex){
					// TODO LOG THIS
				}	
				if(method != null){
					result.add(method);
				}
			}
			return result;
		}
		
		public Set<CategoricalStatisticsMethod> getCategoricalStatisticsMethods(){
			Set<CategoricalStatisticsMethod> result = new HashSet<CategoricalStatisticsMethod>();
			for(String strMethod:categoricalMethods){
				CategoricalStatisticsMethod method = null;
				try{
					method = CategoricalStatisticsMethod.valueOf(strMethod);
				}catch(IllegalArgumentException ex){
					// TODO LOG THIS
				}	
				if(method != null){
					result.add(method);
				}
			}
			return result;
		}
	}
		
	public List<String> models = new ArrayList<String>();
	public List<StationCfg> stations = new ArrayList<StationCfg>();
	public boolean wantMetaInfo = false;
	public TableDataRequest surface = new TableDataRequest(true);
	public TableDataRequest progress = new TableDataRequest(false);
	public TableDataRequest upperair = new TableDataRequest(false);
}