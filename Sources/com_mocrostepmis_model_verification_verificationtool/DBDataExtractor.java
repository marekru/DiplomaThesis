package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;

public class DBDataExtractor extends DataExtractor {

	public enum DBType{
		EnviDB, CLDB
	}
	
	DBType dbType;
	
	public DBDataExtractor(DBType type) {
		dbType = type;
	}
	
	@Override
	public List<Long> getAllRuns(TimeInterval interval) {
		return new ArrayList<Long>();
	}

	@Override
	public void addSoruces(String[] sources) {
		// TODO Auto-generated method stub
	}

	@Override
	public VerifDataTable extract(DataKey key) {
		return new VerifDataTable();
	}
	
	@Override
	public Map<Double, VerifDataTable> extractUpperAir(DataKey key) {
		return new TreeMap<Double, VerifDataTable>(); 
	}

	public DBType getDbType() {
		return dbType;
	}
}
