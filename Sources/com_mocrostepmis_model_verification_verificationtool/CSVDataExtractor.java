package com.microstepmis.model.verification.verificationtool;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.Set;



import java.util.TreeSet;

import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;
import com.microstepmis.util.FileUtils;

/**
 * CSV Files Data Extractor
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: CSVDataExtractor.java,v 1.17 2015/01/28 08:32:23 marekru Exp $
 *
 * TODO rozdielne spravanie pre OBSERVATION a FORECASTS 
 * TODO citanie upperair dat
 * zatial riesim len Observation
 */
public class CSVDataExtractor extends DataExtractor {

	static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd HH:mm:ss"; 
	
	// mnozina, aby sme nemali duplicitne cesty k suborom
	Set<String> fileNames = new HashSet<String>();
	List<File> files = new ArrayList<File>();
	
	DateFormat dateFormat = new SimpleDateFormat(DEFAULT_DATE_PATTERN);
	String fieldDelimiter = ",";

	private DataSource source = ForecastSource.CSVFile;
	
	public CSVDataExtractor(DataSource source) {
		this.source = source;
	}
	
	/**
	 * @param interval - interval do ktoreho maju spadat vsetky runy
	 * @return - Zoznam runov spadajucich do daneho intervalu
	*/
	@Override
	public List<Long> getAllRuns(TimeInterval interval) {
		if(isForecast()){
			return getAllRunsForecasts(interval);
		}else if(isObservation()){
			return getAllRunsObservations(interval);
		}
		return new ArrayList<Long>();
	}

	
	/**
	 * @param sources - cesty k CSV suborom
	 * Metoda prida cesty do extractoru dat.
	 * V pripade, ze sme uz dany subor pridali, neurobi nic.
	 * Ak dany subor neexistuje, zaloguje tuto informaciu ako warning.
	 */
	@Override
	public void addSoruces(String[] sources) {
		for (String src : sources) {
			File file = new File(src);
			String path = file.getAbsolutePath();
			if(!fileNames.contains(path)){
				fileNames.add(path);
				if(file.exists()){
					files.add(file);
				}else{
					log.warning("l(3)", "File %s does not exist.", path);
				}
			}
		}
	}

	
	/**
	 * @param key - v kluci sa ignoruje vsetko okrem RUN-u
	 * 				dovodom je, ze z CSVka nemam ako odcitat polohu, parameter, ...
	 */
	@Override
	public VerifDataTable extract(DataKey key) {
		if(isForecast()){
			return extractForecasts(key);
		}else if(isObservation()){
			return extractObservations(key);
		}
		return new VerifDataTable();
	}
	
	
	@Override
	public Map<Double, VerifDataTable> extractUpperAir(DataKey key) {
		return new TreeMap<Double, VerifDataTable>(); 
	}
	
	public boolean isForecast(){
		return (source instanceof ForecastSource);
	}
	
	public boolean isObservation(){
		return (source instanceof ObservationSource);
	}
	
	/**
	 * 
	 * @param key
	 * @return
	 */
	private VerifDataTable extractForecasts(DataKey key){
		for(File file : files){
			try {
				String line = findDateLine(file, key.getRun());
				if(line != null){
					String[] columns = line.split(fieldDelimiter, -1);
					VerifDataTable result = new VerifDataTable();
					Calendar calendar = new GregorianCalendar();
					calendar.setTimeInMillis(key.getRun());
					for(int i = 1;i < columns.length;i++){
						try {
							Double value = Double.valueOf(columns[i]);  
							result.put(calendar.getTime(), value);
						} catch (Exception e) {
							result.put(calendar.getTime(), null);
							log.warning("l(3)", "Couldn't parse '%s' to Double. Filling hole with null.", columns[i]);
						}
						calendar.add(Calendar.HOUR, 1);
					}
					return result;
				}
			} catch (IOException ex) {
				log.exception("l(3)", ex);
			}
		}
		return new VerifDataTable();
	}
	
	/**
	 * 
	 * @param key
	 * @return
	 */
	private VerifDataTable extractObservations(DataKey key){
		for (File file : files) {
			try {
				String firstLine = readFirstDataLine(file);
				Date date = lineToDate(firstLine);
				if(key.getRun() == date.getTime()){
					return readCSVFile(file);
				}
			}catch (IOException e) {
				log.exception("l(3)", e);
			}
		}
		return new VerifDataTable();

	}
	
	private List<Long> filterDates(List<Long> runs, TimeInterval interval){
		List<Long> result = new ArrayList<Long>();
		for(Long run:runs){
			Date date = new Date(run);
			if(interval.contains(date)){
				result.add(run);
			}
		}
		return result;
	}
	
	private List<Long> getAllRunsForecasts(TimeInterval interval){
		Set<Long> result = new TreeSet<Long>();
		for(File file : files){
			try {
				List<Long> list = readCSVDates(file);
				result.addAll(filterDates(list, interval));
			} catch (IOException ex) {
				log.exception("l(3)", ex); 
			}
		}
		return new ArrayList<Long>(result);
	}

	/**
	 * Metoda prejde vsetky subory, pridane metodou addSources.
	 * Pre kazdy subor zisti prvy a posledny datum a vytvori z nich interval.
	 * Ak ma tento interval prienik so vstupnym intervalom, tak pridame datum do vysledku.
	 **/
	private List<Long> getAllRunsObservations(TimeInterval interval){
		Set<Long> result = new TreeSet<Long>(); // aby sme nemali duplikaty a este budu aj usporiadane - parada!
		for (File file : files) {
			try {
				String firstLine = readFirstDataLine(file);
				Date first = lineToDate(firstLine);
				if(interval.contains(first)){
					result.add(first.getTime());
				}else{
					String lastLine = FileUtils.readLastLine(file);
					Date last = lineToDate(lastLine);
					if(interval.contains(last)){
						result.add(first.getTime());
					}
				}
			} catch (IOException e) {
				// Toto miesto nepredpokladame, ze niekedy dosiahneme
				log.exception("l(3)", e);
			}
		}
		return new ArrayList<Long>(result);
	}
	
	/**
	 * 
	 * @param file
	 * @return
	 * @throws IOException
	 * Precitam vsetky datumy v CSV subore;
	 */
	private List<Long> readCSVDates(File file) throws IOException{
		List<Long> result = new ArrayList<Long>();
		BufferedReader reader = new BufferedReader(new FileReader(file));
		String line = "";
		try{
			while(null != (line = reader.readLine())){
				if(!isDataLine(line)){
					continue;
				}
				String[] columns = line.split(fieldDelimiter, -1);
				Date date = strToDate(columns[0]);
				if(date != null){
					result.add(date.getTime());
				}
			}
		}finally{
			reader.close();
		}
		return result;
	}
	
	/**
	 *  TODO FCST a upperair
	 * @param file
	 * @return
	 * @throws IOException
	 * Precitam vsetky riadky a pridam dane hodonty do tabulky
	 */
	private VerifDataTable readCSVFile(File file) throws IOException{
		VerifDataTable result = new VerifDataTable();
		BufferedReader reader = new BufferedReader(new FileReader(file));
		String line = "";
		try {
			while(null != (line = reader.readLine()) ){
				String[] columns = line.split(fieldDelimiter, -1);
				if(columns.length > 1){
					Date date = strToDate(columns[0]);
					try {
						Double value = Double.valueOf(columns[1]);  
						result.put(date, value);
					} catch (Exception e) {
						log.warning("l(3)", "Couldn't parse %s to Double.", columns[1]);
					}
				}
			}
		}finally{
			reader.close();
		}
		return result;
	}
	

	private String findDateLine(File file, long timestamp) throws IOException{
		BufferedReader reader = new BufferedReader(new FileReader(file));
		String line = "";
		try {
			while(null != (line = reader.readLine()) ){
				String[] columns = line.split(fieldDelimiter, -1);
				if(columns.length > 1){
					Date date = strToDate(columns[0]);
					if(date != null && date.getTime() == timestamp){
						return line;
					}
					
				}
			}
		}finally{
			reader.close();
		}
		return line;
	}
	
	private boolean isDataLine(String line){
		return (lineToDate(line) != null);
	}
	
	private String readFirstDataLine(File file) throws IOException{
		FileReader fileReader = new FileReader(file);
		BufferedReader reader = new BufferedReader(fileReader);
		String line = "";
		try {
			while(line != null && !isDataLine(line)){
				line = reader.readLine();
			}
		}finally{
			reader.close();
		}
		if(line != null){
			line = line.trim();
		}
		return line;
	}
	
	private Date strToDate(String str){
		try {
			return dateFormat.parse(str);
		} catch (ParseException e) {
			SimpleDateFormat format = (SimpleDateFormat)dateFormat;
			log.warning("l(3)", "Wrong date format: %s , expected this: %s ", str, format.toPattern());
			return null;
		}
	}
	
	private Date lineToDate(String line){
		if(line == null){
			return null;
		}
		String[] columns = line.split(fieldDelimiter, -1);
		if(columns.length < 1){
			return null;
		}
		return strToDate(columns[0]);
	}
	
	
	
	
}
