package com.microstepmis.model.verification.verificationtool;

import java.util.Calendar;
import java.util.GregorianCalendar;

import com.microstepmis.xplatform.XCfg;


@XCfg(label="Step Size")
public  class StepSize{
	// Zoznam najbeznejsich krokov (12h, 24h, 48h pre verifikaciu 14d pre klazavy priemer)
	// Nemozu byt public koli mapovaniu do JS
	static final StepSize HOUR = new StepSize(Calendar.HOUR_OF_DAY);
	static final StepSize HOURS_12 = new StepSize(Calendar.HOUR_OF_DAY, 12);
	static final StepSize DAY = new StepSize(Calendar.DAY_OF_YEAR);
	static final StepSize DAYS_2 = new StepSize(Calendar.DAY_OF_YEAR, 2);
	static final StepSize WEEK = new StepSize(Calendar.WEEK_OF_YEAR);
	static final StepSize MONTH = new StepSize(Calendar.MONTH);
	static final StepSize YEAR = new StepSize(Calendar.YEAR);
	static final StepSize DAYS_14 = new StepSize(Calendar.DAY_OF_YEAR, 14);
	
	@XCfg(label="Field", // TODO lepsie label
		  restriction = @XCfg.Restriction( enumeration={ 
			@XCfg.Enum(key = "" + Calendar.HOUR_OF_DAY, value = "Hour"),
			@XCfg.Enum(key = "" + Calendar.DAY_OF_YEAR, value = "Day"),
			@XCfg.Enum(key = "" + Calendar.WEEK_OF_YEAR, value = "Week"),
			@XCfg.Enum(key = "" + Calendar.MONTH, value = "Month"),
			@XCfg.Enum(key = "" + Calendar.YEAR, value = "Year")
		 })
	) 
	public int code = 0; 
	@XCfg(label="Amount")
	public int count = 1;
	
	public StepSize() {}
	
	public StepSize(int code) {
		this.code = code;
	}
	
	public StepSize(int code, int count) {
		this.code = code;
		this.count = count;
	}
	
	public long toHours(){
		Calendar start = new GregorianCalendar();
		Calendar end = new GregorianCalendar();
		end.add(code, count);
		TimeInterval interval = new TimeInterval(start, end);
		return interval.getDurationInHours();
	}
}
