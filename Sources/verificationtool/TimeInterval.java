package com.microstepmis.model.verification.verificationtool;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import com.microstepmis.util.math.Interval;
import com.microstepmis.xplatform.XCfg;

@XCfg(label="Time Interval")
public class TimeInterval extends Interval<Date>{
	final static public Date FROM_DEFAULT = new GregorianCalendar(1970, 1, 1, 0, 0).getTime();
	final static public Date TO_DEFAULT   = new GregorianCalendar(2500, 1, 1, 0, 0).getTime();
	
	public TimeInterval() {
		super(FROM_DEFAULT, TO_DEFAULT);
	}
	public TimeInterval(String from, String to, String pattern){
		this();
		SimpleDateFormat format = new SimpleDateFormat(pattern);
		try {
			this.from = format.parse(from);
		} catch (ParseException e) {
			this.from = FROM_DEFAULT;
		}
		try {
			this.to = format.parse(to);
		} catch (ParseException e) {
			this.to = TO_DEFAULT;
		}
	}
	public TimeInterval(Date from, Date to){
		super(from, to);
	}
	public TimeInterval(Calendar from, Calendar to){
		super(from.getTime(), to.getTime());
	}
	public TimeInterval(Calendar from, StepSize step){
		this(from, from);
		Calendar to = (Calendar)from.clone();
		to.add(step.code, step.count);
		this.to = to.getTime();
	}
	public TimeInterval(Interval<Long> interval){
		super(new Date(interval.from), new Date(interval.to));
	}
	
	public long getDurationInHours(){
		long diff = Math.abs(to.getTime() - from.getTime());
		return diff / (60 * 60 * 1000);
	}
	
	public Interval<Calendar> toCalendar(){
		Calendar f = new GregorianCalendar(); 
		f.setTime(this.from);
		Calendar t = new GregorianCalendar(); 
		t.setTime(this.to);
		return new Interval<Calendar>(f, t);
	}
	
	public List<TimeInterval> toSubintervals(StepSize step){
		List<TimeInterval> result = new ArrayList<TimeInterval>();
		Calendar fromCalendar = new GregorianCalendar();
		fromCalendar.setTime(from);
		while( contains(fromCalendar.getTime()) && to.compareTo(fromCalendar.getTime()) > 0 ){  
			TimeInterval interval = new TimeInterval(fromCalendar, step);
			result.add(interval);
			fromCalendar.add(step.code, step.count);
		}
		return result;
	}
	
	
}