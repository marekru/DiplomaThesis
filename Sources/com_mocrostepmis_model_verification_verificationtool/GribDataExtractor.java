package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.microstepmis.ims.data.grib.GribDB;
import com.microstepmis.ims.data.grib.grib1.Grib1;
import com.microstepmis.ims.data.grib.grib1.Grib1Convertor;
import com.microstepmis.ims.data.grib.tables.GribTables;
import com.microstepmis.ims.data.gribdb.RemoteGribDB;
import com.microstepmis.ims.data.productdb.Source;
import com.microstepmis.kernel.units.NonSI;
import com.microstepmis.kernel.units.SI;
import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;

/**
 * Grib Data Extractor
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: GribDataExtractor.java,v 1.13 2015/01/27 15:38:37 marekru Exp $
 * 
 * TODO Remote Grib DataBase 
 * TODO upperair
 */
public class GribDataExtractor extends DataExtractor {


	static final String DEFAULT_GRIB_PATH = "../data/grib";
	static final String DEFAULT_DB_NAME = com.microstepmis.ims.data.gribdb.GribDB.DEFAULT_DB_NAME;

	
	GribDB localGribDB = null;
	RemoteGribDB remoteGribDB = null;
	
	public GribDataExtractor(boolean remote) {
		this(remote, null);
	}
	
	public GribDataExtractor(boolean remote, String tablePath) {
		init(tablePath);
		if(remote){
			remoteGribDB = new RemoteGribDB(DEFAULT_DB_NAME, "");
		}else{
			localGribDB = new GribDB();
			localGribDB.setGribHash(false); // aby sme sa vyhli memory leakom
		}
	}
	
	@Override
	public List<Long> getAllRuns(TimeInterval interval) {
		if(isRemote()){
			return getAllRunsRemote(interval);
		}else{	
			return getAllRunsLocal(interval);
		}
	}

	@Override
	public void addSoruces(String[] sources) {
		if(isRemote()){
			for(String url:sources){
				remoteGribDB = new RemoteGribDB(DEFAULT_DB_NAME, url);
				break;
			}
		}else{
			for(String folder:sources){
				localGribDB.add_folder(folder, true, false, 0, 0, null);
			}
		}
	}
	
	@Override
	public VerifDataTable extract(DataKey key) {
		if(isRemote()){
			return extractFromRemote(key);
		}else{
			return extractFromLocal(key);
		}
	}
	
	@Override
	public Map<Double, VerifDataTable> extractUpperAir(DataKey key) {
		return new TreeMap<Double, VerifDataTable>(); 
	}
	
	public boolean isRemote(){
		return (localGribDB == null);
	}
	
	private List<Long> subInterval(TimeInterval interval, List<Long> runs){
		List<Long> result = new ArrayList<Long>();
		Long from = interval.from.getTime();
		Long to   = interval.to.getTime();
		for(Long run:runs){
			if(run >= from && run <= to){
				result.add(run);
			}
		}
		return result;
	}
	
	private List<Long> getAllRunsLocal(TimeInterval interval){
		List<Long> runs = localGribDB.getAllRuns();
		return subInterval(interval, runs);
	}
	
	private List<Long> getAllRunsRemote(TimeInterval interval){
		List<Source> sources = remoteGribDB.getSourcesList();
		List<Long> runs = new ArrayList<Long>();
		if(sources.size() > 0){
			runs = remoteGribDB.getPotentialTimestamps(sources.get(0));
			return subInterval(interval, runs);
		}
		return runs;
	}

	
	private int getCenterID(DataKey key){
		if(!isRemote()){
			List<Integer> centers = localGribDB.getAllCenters();
			for(Integer center:centers){
				List<Integer> fcsts = localGribDB.getAllForecasts(center, key.getRun(), key.getParameter(), key.getLevel());
				if(fcsts.size() > 0){
					return center;
				}
			}
		}
		return -1;
	}
	
	private VerifDataTable extractFromLocal(DataKey key) {
		VerifDataTable table = new VerifDataTable();
		int centerID = getCenterID(key);
		double lon = key.getLon() * 0.001;
		double lat = key.getLat() * 0.001;
		List<Integer> fcsts = localGribDB.getAllForecasts(centerID, key.getRun(), key.getParameter(), key.getLevel());
		for(Integer forecast:fcsts){
			try {
				Double value = localGribDB.getInterpolatedValueEfficiently(centerID, key.getRun(), forecast, key.getLevel(), key.getParameter(), lon, lat);
				GregorianCalendar calendar = new GregorianCalendar();
				calendar.setTimeInMillis(key.getRun());
				calendar.add(Calendar.HOUR_OF_DAY, forecast);
				table.put(calendar.getTime(), value);
			} catch (Exception ex) {
				log.exception(null, ex);
			}
		}
		return table;
	}
	
	private VerifDataTable extractFromRemote(DataKey key) {	// NOSONAR nevyuzity argument neriesime, bude sa prerabat
		// TODO
		return new VerifDataTable();
	}	
	
	
	private void init(String gribTablePath) {
		initGribTables(gribTablePath);
		initUnits();
	}
	
	private void initGribTables(String path){
		if(path == null){
			try {
				GribTables.init();
			} catch (Exception e) {
				log.warning("l(0)", "Unable to initialize Grib Tables: %s", GribTables.GRIB_TABLE_DEFAULT_DIR);
			}
		}else{
			try {
				GribTables.init(path);
			} catch (Exception e) {
				log.warning("l(0)", "Unable to initialize Grib Tables: %s", path);
			}
		}
	}
	
	private void initUnits(){
		SI.initializeClass();
		NonSI.initializeClass();
	}
	
	
	/*
	public static void main(String[] args) {
		try {
			String[] folders = { "c:/METRo/Gribs/cosmo-2011111100/cosmo-2011111100/" };
			GribDataExtractor extractor = new GribDataExtractor(false);
			extractor.addSoruces(folders);
			String level = "Surface Above Ground (00002 m)";//"Surface";
			String parameter = "temperature";//"pressure";
			double lat = 44.5711111; // 1000.0;
			double lon = 26.085; // 1000.0;
			List<Long> runs = extractor.getAllRuns(new TimeInterval());
			for(Long run:runs){
				DataKey key = new DataKey(run, lat, lon, level, parameter);
				VerifDataTable table = extractor.extract(key);
				System.out.println(table.values());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	*/

}
