package com.microstepmis.model.verification.verificationtool;

import com.microstepmis.xplatform.XCfg;

@XCfg(label="Variable")
public class VarCfg{
	public VarCfg() {}
	
	public VarCfg(String varName, String  unit) {
		variableName = varName;
		this.unit = unit;
	}
	
	@XCfg(label="Variable Name", 
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
	public String variableName = "";

	@XCfg(label="Unit") // TODO restrictions
	public String unit = "";
	
	@XCfg(label="Scale")
	public Scale scale = new Scale();
	 
	/**
	 * Hranica, nad ktoru hodnoty povazujeme uz za alarmujuce
	 */
	@XCfg(label="Treshold")
	public Double treshold = Double.MAX_VALUE;
	
	@Override
	public int hashCode() {
		return variableName.hashCode();
	}
	
	@Override
	public boolean equals(Object obj) {
		if(obj instanceof VarCfg){
			VarCfg var = (VarCfg)obj;
			return var.variableName.equals(variableName);
		}
		return false;
	}
	
}
