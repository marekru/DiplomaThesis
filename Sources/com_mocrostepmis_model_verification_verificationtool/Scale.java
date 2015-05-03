package com.microstepmis.model.verification.verificationtool;

/*
 * extends Interval<Double> 
 * chcem v buducnosti dedit od Interval<Double> lebo takto to je naprd.
 * takto je to koli mapovaniu = neslo mi ukladat config za GUI, inak secko fungovalo jak ma
 * takze treba vyriesit, ako mapovat genericke typy...
 * 
 */
public class Scale { 

	final static public Double FROM_DEFAULT = 0.0;
	final static public Double TO_DEFAULT   = 0.0;
	
	public Double from = FROM_DEFAULT;
	public Double to = TO_DEFAULT;
	
	
}
