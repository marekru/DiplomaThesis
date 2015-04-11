package com.microstepmis.model.verification.verificationtool;

import com.microstepmis.model.verification.verificationtool.DataExtractor.DataSource;
import com.microstepmis.model.verification.verificationtool.DataExtractor.ObservationSource;
import com.microstepmis.xplatform.XCfg;


@XCfg(label="Source")
public class SourceCfg {

	/**
	 * Cesta ku predpovediam / pozorovaniam
	 * - local grib directory
	 * - remote grib URL
	 * - local CSV file(s)
	 * - Web page URL
	 */
	@XCfg(label="Source Files")
	public String[] sources = { "C:/backup/backup/WRF_AL_FAQAA_20140901_20140930/dew.txt" };
	
	@XCfg(label="Source Type")
	public DataSource sourceType = ObservationSource.CSVFile;
	
	
	@XCfg(label="Variable", 
		  restriction = @XCfg.Restriction( enumeration={ 
					@XCfg.Enum(key = "pressure", value = "Pressure"),
					@XCfg.Enum(key = "temperature", value = "Temperature"),
					@XCfg.Enum(key = "humidity", value = "Humidity"),
					@XCfg.Enum(key = "precipitation", value = "Precipitation"),
					@XCfg.Enum(key = "windspeed", value = "Wind Speed"),
					@XCfg.Enum(key = "winddir", value = "Wind Direction"),
					@XCfg.Enum(key = "dewpoint", value = "Dew Point")
				  })
			) 
	public String variable = "";
	
	// TODO restrictions
	public String unit = "";
	
	@XCfg(label="Station Identificator")
	public String station = "";
	
	@XCfg(label="Run", 
		  restriction = @XCfg.Restriction( enumeration={ 
					@XCfg.Enum(key = "00", value = "00"),
					@XCfg.Enum(key = "06", value = "06"),
					@XCfg.Enum(key = "12", value = "12"),
					@XCfg.Enum(key = "18", value = "18")
				  })
	)
	public String run = "";
	
	
	public boolean matches(String stationName, String run, String variable){
		if(this.station.compareTo(stationName) != 0){
			return false;
		}
		if(this.variable.compareTo(variable) != 0){
			return false;
		}
		if(this.run.compareTo(run) != 0){
			return false;
		}
		return true;
	}
	
	public boolean matches(StationCfg stationCfg, String run, VarCfg varCfg){
		return matches(stationCfg.toString(), run, varCfg.variableName);
	}
	
}
