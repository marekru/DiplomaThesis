package com.microstepmis.model.verification.verificationtool;

import com.microstepmis.util.math.Interval;
import com.microstepmis.xplatform.XCfg;


@XCfg(label="Height Interval")
public class HeightInterval extends Interval<Integer>{
	final static public Integer FROM_DEFAULT = 0;
	final static public Integer TO_DEFAULT   = Integer.MAX_VALUE;
	
	public HeightInterval() {
		super(FROM_DEFAULT, TO_DEFAULT);
	}
	
}