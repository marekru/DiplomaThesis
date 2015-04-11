package com.microstepmis.model.verification.verificationtool;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.SortedMap;
import java.util.Map.Entry;




import com.microstepmis.kernel.units.Unit;
import com.microstepmis.log.Log;
import com.microstepmis.model.verification.verificationtool.DataExtractor.DataKey;
import com.microstepmis.model.verification.verificationtool.DataExtractor.DataSource;
import com.microstepmis.model.verification.verificationtool.DataExtractor.ForecastSource;
import com.microstepmis.model.verification.verificationtool.VerificationTables.Errors;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ErrorsList;
import com.microstepmis.model.verification.verificationtool.VerificationTables.ForecastTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.Putable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;
import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTables;


/**<pre>
 * Processor of Verification Data
 *
 * Verification pipeline:
 * <code>
 * ++===============++    +----------+    +-------------+
 * ||DATA EXTRACTION|| -> |STATISTICS| -> |VISUALIZATION|
 * ++===============++    +----------+    +-------------+
 * </code>
 * Tato classa je DATA EXTRACTION cast.
 *
 * Trieda na pracu s datami verifikacie.
 * - extrakcia z roznych zdrojov
 * - prevody jednotiek
 * - ziskanie konkretnych datumov
 * - ukladanie do CVS suborov!
 *
 * TODO komentare k metodam, aspon k tym public
 * TODO upperair
 * </pre>
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VerifDataProcessor.java,v 1.23 2015/01/28 08:43:51 marekru Exp $
 *
 * 
 */
public final class VerifDataProcessor {

	private static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
	
	private static final Integer MIN_FRAC_DIGITS = 1;
	private static final Integer MAX_FRAC_DIGITS = 4;
	
	private static final Character VALUE_DELIMITER = ',';
	
	
	private static Log log = new Log(ModelVerificationCfg.LOG_NAME);
	
	private VerifDataProcessor() {}

	// region Data Access
	
	private static <T extends Putable> T getData(VerifDataDescriptor descriptor, Class<T> clazz) throws InstantiationException, IllegalAccessException{
		T observations = clazz.newInstance();
		Double lat = descriptor.getLat(); //degToDecimal(descriptor.station.latitudeDeg, descriptor.station.latitudeMin, 0.0);
		Double lon = descriptor.getLon(); //degToDecimal(descriptor.station.longitudeDeg, descriptor.station.longitudeMin, 0.0);
		DataExtractor extractor = DataExtractor.getInstance(descriptor.getSourceType());
		extractor.addSoruces(descriptor.getSoruces());
		List<Long> runs = extractor.getAllRuns(descriptor.getInterval());
		String level = "Surface"; //TODO rozne levely nie len surface
		for(Long run:runs){
			double latitude = (lat != null) ? lat : 0.0;
			double longitude = (lon != null) ? lon : 0.0;
			DataKey key = new DataKey(run, latitude , longitude, level, descriptor.getVariable());
			VerifDataTable data = extractor.extract(key);
			observations.putTable(new Date(run), data);	
		}
		return observations;
	}
	
	private static <T extends Putable> T getDataHandled(VerifDataDescriptor descriptor, Class<T> clazz){
		try {		
			return getData(descriptor, clazz);
		} catch(Exception ex) {
			log.exception("l(3)", ex);
		}
		return null;
	}
	
	public static VerifDataTable getObservations(VerifDataDescriptor descriptor){
		VerifDataTable table = new VerifDataTable();
		try {
			table = getData(descriptor, VerifDataTable.class);
		} catch(Exception ex) {
			log.exception("l(3)", ex);
		}
		return table;
	}

	
	public static ForecastTable getForecasts(VerifDataDescriptor descriptor){
		ForecastTable table = new ForecastTable();
		try {
			table = getData(descriptor, ForecastTable.class);
		} catch(Exception ex) {
			log.exception("l(3)", ex);
		}
		return table;
	}
	// endregion 
	
	// region Unit Conversion
	
	/**
	 * 
	 * @param table
	 * @param from
	 * @param to
	 * @return
	 */
	public static VerifDataTable convertUnits(VerifDataTable table, String from, String to){
		VerifDataTable result = new VerifDataTable();
		Unit fromUnit = Unit.one;
		Unit toUnit = Unit.one;
		try {
			fromUnit = Unit.getUnit(from);
			toUnit = Unit.getUnit(to);
		} catch (ParseException e) {
			log.warning("l(3)","Couldn't parse unit: %s or unit %s.", from, to);
			return table;
		}
		if(fromUnit.label.compareTo(toUnit.label) == 0){
			log.note("l(4)", "Tried to convert from %s to %s. No unit conversion needed.", from, to);
			return table; // netreba nam konverziu
		}
		for(Entry<Date, Double>entry:table.entrySet()){
			Double value = Unit.convert(entry.getValue(),fromUnit, toUnit);
			result.put(entry.getKey(), value);
		}
		return result;
	}
	
	public static ForecastTable convertUnits(ForecastTable table, String from, String to){
		// nebude lepsie najprv previest stringy na unit a tak to porovnat?
		if(from.compareTo(to) == 0){
			log.note(null, "Tried to convert from %s to %s. No unit conversion needed.", from, to);
			return table;
		}
		ForecastTable result = new ForecastTable();
		for(Entry<Date, VerifDataTable>entry : table.entrySet()){
			VerifDataTable value = convertUnits(entry.getValue(), from, to);
			result.put(entry.getKey(), value);
		}
		return result;
	}
	
	// endregion

	// region Interval Extraction
	
	public static VerifDataTable extractInterval(VerifDataTable table, TimeInterval interval){
		SortedMap<Date, Double> submap = table.subMap(interval.from, interval.to);
		return new VerifDataTable(submap);
	}
	
	public static ForecastTable extractInterval(ForecastTable table, TimeInterval interval){
		SortedMap<Date, VerifDataTable> submap = table.subMap(interval.from, interval.to);
		return new ForecastTable(submap);
	}
	
	
	public static VerifDataTables extractIntervals(VerifDataTable table, List<TimeInterval> intervals){
		VerifDataTables result = new VerifDataTables();
		for(TimeInterval interval:intervals){
			result.add(extractInterval(table, interval));
		}
		return result;
	}
	
	public static List<ForecastTable> extractIntervals(ForecastTable table, List<TimeInterval> intervals){
		List<ForecastTable> result = new ArrayList<VerificationTables.ForecastTable>();
		for(TimeInterval interval:intervals){
			result.add(extractInterval(table, interval));
		}
		return result;
	}
	
	// endregion
	
	// region Error Lists Transformation
	
	public static ErrorsList transformErrors(ForecastTable errors){
		ErrorsList result = new ErrorsList();
		for (Entry<Date, VerifDataTable> entry : errors.entrySet()) {
			int i = 0;
			for(Entry<Date,Double> dataEntry : entry.getValue().entrySet()){
				if(i >= result.size()){
					result.add(new Errors());
				}
				Double value = dataEntry.getValue(); 
				result.get(i).add(value);
				i++;
			}
		}
		return result;
	}
	
	public static List<ErrorsList> transformErrors(List<ForecastTable> errors){
		List<ErrorsList> result = new ArrayList<VerificationTables.ErrorsList>();
		for(ForecastTable table:errors){
			result.add(transformErrors(table));
		}
		return result;
	}
	
	public static Errors transformErrorsProgress(ForecastTable errors, TimeInterval timeInterval){
		Errors result = new Errors();
		for (Entry<Date, VerifDataTable> entry : errors.entrySet()) {
			VerifDataTable table = VerifDataProcessor.extractInterval(entry.getValue(), timeInterval);
			result.addAll(table.values());
		}
		return result;
	}
	
	public static ErrorsList transformErrorsProgress(ForecastTable errors, List<TimeInterval> intervals){
		ErrorsList result = new ErrorsList();
		for (TimeInterval timeInterval : intervals) {
			Errors err = transformErrorsProgress(errors, timeInterval);
			result.add(err);
		}
		
		return result;
	}
	
	public static Errors tableToErrors(VerifDataTable table){
		return new Errors(table.values());
	}	
	
	
	public static ErrorsList tablesToErrors(VerifDataTables tables){
		ErrorsList result = new ErrorsList();
		for(VerifDataTable table:tables){
			result.add(tableToErrors(table));
		}
		return result;
	}
	
	// endregion

	// region I/O Tables
	
	public static void saveTableToCsv(VerifDataTable table, File file){
		saveTableToCsv(table, file, DATE_FORMAT);
	}
	
	public static void saveTableToCsv(ForecastTable table, File file){
		saveTableToCsv(table, file, DATE_FORMAT);
	}
	
	
	private static void makeDirForFile(File file){
		if(file.getParentFile().exists()){
			log.note("l(4)", "Directory %s already exists.", file.getParent());
		}else if(file.getParentFile().mkdirs()){
			log.note("l(3)", "Created direcotry: %s", file.getParent());	
		}else{
			log.warning("l(3)", "Directory %s couldn't be created and doesn't exists.", file.getParent());		
		}
	}
	
	private static void closeWriter(BufferedWriter writer){
		if(writer != null){
			try {
				writer.close();
			} catch (IOException ioe2) {
				log.exception("l(2)", ioe2);
			}
		}
	}
	
	private static NumberFormat constructNumberFormat(){
		NumberFormat numberFormat = DecimalFormat.getNumberInstance(Locale.ENGLISH); 
		numberFormat.setMinimumFractionDigits(MIN_FRAC_DIGITS); 
		numberFormat.setMaximumFractionDigits(MAX_FRAC_DIGITS);
		numberFormat.setGroupingUsed(false);
		return numberFormat;
	}
	
	public static void saveTableToCsv(ForecastTable table, File file, String datePattern){
		makeDirForFile(file);
		BufferedWriter writer = null;
		try {
			writer = new BufferedWriter(new FileWriter(file));
			SimpleDateFormat dateFormat = new  SimpleDateFormat(datePattern);
			NumberFormat numberFormat = constructNumberFormat(); // potrebujeme zarucit jednotny format pre Double
			for (Entry<Date, VerifDataTable> entry : table.entrySet()) {
				Date date = entry.getKey();
				String dateString = dateFormat.format(date);
				writer.append(dateString);
				for(Double value:entry.getValue().values()){
					String valueString = (value == null) ? "": numberFormat.format(value);
					writer.append(VALUE_DELIMITER);
					writer.append(valueString);
				}
				writer.write('\n');
			}
		} catch (IOException ioe1) {
			log.exception("l(2)", ioe1);
		}finally{
			// zavrieme writer
			closeWriter(writer);
		}
	}
	
	public static void saveTableToCsv(VerifDataTable table, File file, String datePattern){
		makeDirForFile(file);
		BufferedWriter writer = null;
		try {
			writer = new BufferedWriter(new FileWriter(file));
			SimpleDateFormat dateFormat = new  SimpleDateFormat(datePattern);
			NumberFormat numberFormat = constructNumberFormat(); // potrebujeme zarucit jednotny format pre Double
			for(Entry<Date, Double> entry:table.entrySet()){
				Date date = entry.getKey();
				String dateString = dateFormat.format(date);
				String valueString = numberFormat.format(entry.getValue());
				writer.write(dateString);
				writer.write(VALUE_DELIMITER);
				writer.write(valueString);
				writer.write('\n');
			}	
		} catch (IOException ioe1) {
			log.exception("l(2)", ioe1);
		}finally{
			// ak writer jestvuje, tak ho zavrieme
			closeWriter(writer);
		}
	}
	
	private static <T extends Putable> T readTableFromCsv(String sourcePath, Class<T> type){
		DataSource source = ForecastSource.CSVFile;
		String[] sources = { sourcePath };
		VerifDataDescriptor descriptor = new VerifDataDescriptor(source, sources, new TimeInterval());
		return getDataHandled(descriptor, type);
	}
	
	public static VerifDataTable readVerifDataTableFromCsv(String sourcePath){
		return readTableFromCsv(sourcePath, VerifDataTable.class);
	}
	
	public static ForecastTable readForecastTableFromCsv(String sourcePath){
		return readTableFromCsv(sourcePath, ForecastTable.class);
	}
	
	// endregion
	
}
