package com.microstepmis.model.verification.verificationtool;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;

/**
 * Block Data Extractor
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: BlockDataExtractor.java,v 1.7 2014/09/17 12:23:20 marekru Exp $
 *
 */
public class BlockDataExtractor extends DataExtractor {

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
	
}
