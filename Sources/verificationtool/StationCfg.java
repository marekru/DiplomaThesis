package com.microstepmis.model.verification.verificationtool;

import java.util.HashSet;

import com.microstepmis.ims.cfg.Stations.Station;

public class StationCfg extends Station {
	
	public HashSet<VarCfg> variables = new HashSet<VarCfg>();
	{
		//variables.add(new VarCfg("dewpoint", ""));
	}
	// TODO resriction !!! 00, 06, 12, 18
	public HashSet<String> runs = new HashSet<String>();
	{
		runs.add("00");
	}

	public StationCfg() {
		// TODO Auto-generated constructor stub
	}
	
	
	public StationCfg(Station station) {
		this.altitude = station.altitude;
		this.cccc = station.cccc;
		this.compact = station.compact;
		this.country = station.country;
		this.IATA = station.IATA;
		this.id = station.id;
		this.isFir = station.isFir;
		this.latitude = station.latitude;
		this.letter = station.letter;
		this.longitude = station.longitude;
		this.name = station.name;
		this.wmo = station.wmo;
		this.zoomIdx = station.zoomIdx;		
	}
	
	
	@Override
	public String toString() {
		if(notEmpty(name)){
			return name;
		}else if(notEmpty(cccc)){
			return cccc;
		}else if(notEmpty(country)){
			return country;
		}else if(latitude != null && longitude != null){
			return (latitude.toString() + "_" + longitude.toString()).replace('.', 'o');
		}else if(notEmpty(wmo)){
			return wmo;
		}else{
			return "Unknown";
		}
	}
	
	private static boolean notEmpty(String str) {
		return str != null && str.length() > 0;
	}
	
}
