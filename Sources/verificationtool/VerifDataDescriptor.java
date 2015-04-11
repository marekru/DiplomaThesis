package com.microstepmis.model.verification.verificationtool;


import com.microstepmis.model.verification.verificationtool.DataExtractor.DataSource;
/**
 * Verification Data Descriptor
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VerifDataDescriptor.java,v 1.8 2015/01/28 08:52:45 marekru Exp $
 * 
 */
public class VerifDataDescriptor{
	private DataSource source;
	private String[] sources;
	private TimeInterval interval;
	private Double lat; 	
	private Double lon;		
	private String variable; 
	private String run;
	
	public VerifDataDescriptor(DataSource source, String[] sources, TimeInterval interval, Double lat, Double lon, String variable, String run) {
		this.source = source;
		if(sources != null){
			this.sources = sources.clone(); // musim klonovat?
		}else{
			this.sources = new String[0];
		}
		this.interval = interval;
		this.lat = lat;
		this.lon = lon;
		this.variable = variable;
		this.run = run;
	}
	
	public VerifDataDescriptor(DataSource source, String[] sources, TimeInterval interval) {
		this(source, sources, interval, 0.0, 0.0, "", "00");
	}
	
	public VerifDataDescriptor(SourceCfg source, VarCfg var, StationCfg station, TimeInterval interval) {
		this(source.sourceType, source.sources, interval, station.latitude, station.longitude, var.variableName, source.run);
	}
	
	public String[] getSoruces(){
		return sources.clone();
	}
	
	public DataSource getSourceType() {
		return source;
	}
	
	public Double getLat() {
		return lat;
	}
	
	public Double getLon() {
		return lon;
	}
	
	public TimeInterval getInterval() {
		return interval;
	}
	
	public String getVariable() {
		return variable;
	}
	
	public String getRun(){
		return run;
	}
			
	
}