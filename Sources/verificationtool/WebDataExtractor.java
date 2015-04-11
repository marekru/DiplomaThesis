package com.microstepmis.model.verification.verificationtool;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.htmlcleaner.CleanerProperties;
import org.htmlcleaner.HtmlCleaner;
import org.htmlcleaner.TagNode;
import org.nfunk.jep.Variable;
import org.nfunk.jep.VariableFactory;



import com.microstepmis.model.verification.verificationtool.VerificationTables.VerifDataTable;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.DataSpecification.DateVarSpecification;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.DataSpecification.LineGroup;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.DataSpecification.LineSpecification;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.DataSpecification.VarSpecification;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.PageConfig.DataNode;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.PageConfig.Node;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.PageConfig.NothingNode;
import com.microstepmis.model.verification.verificationtool.WebDataExtractor.PageConfig.OuterNode;
import com.microstepmis.util.BasicTypeParser;
import com.microstepmis.util.Pair;

/**
 * Web Data Extractor
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: WebDataExtractor.java,v 1.16 2015/01/27 15:39:36 marekru Exp $
 *
 */
public class WebDataExtractor extends DataExtractor {

	/**
	 *  Mnozina URL adries
	 */
	Set<String> urls = new HashSet<String>();
	
	/**
	 * Specifikacia, ako ma vyzerat stranka, z ktorej stahujeme data, aby sme lahko vedeli vyextrahovat iba to, co potrebujeme.
	 */
	public PageConfig pageConfig = new PageConfig();
	
	/**
	 * @author marekru
	 * Tato trieda sluzi na specifikaciu vzhladu dat pomocou regularnych vyrazov.
	 * Na zaklade tejto specifikacie je mozno data parsovat lahko rozparsovat.
	 * Obsahuje niekolko podtried, ktore sluzia na specifikovanie jednotlivych elementov dat:
	 * Premennych, Riadkov, Skupin riadkov. 
	 * 
	 */
	static class DataSpecification{
		
		/**
		 * @author marekru
		 * 
		 * Napriklad:
		 * varName = "Station Number"
		 * regex   = [0-9]+
		 * endString = "\\s"
		 * type = String.class
		 */
		static class VarSpecification{
			public String varName = "";
			public String regex = "";
			public String endString = "";
			public Class<?> type = String.class;
			
			/**
			 * Metoda vysklada regularny vyraz pre danu premennu
			 * Vytvori groupu a na koniec prida ukoncovaci string, teda vysledok je:
			 * (regex)endString
			 * @return
			 */
			public String getRegex(){
				StringBuilder builder = new StringBuilder();
				builder.append('(');
				builder.append(regex);
				builder.append(')');
				builder.append(endString);
				return builder.toString();
			}
		}
		
		static class DateVarSpecification extends VarSpecification {
			public String datePattern = "yyyyMMddHH";
		}
		
		static class LineSpecification{
			public List<VarSpecification> variables = new ArrayList<VarSpecification>();
			
			/**
			 * Metoda vysklada regularny vyraz pre cely riadok.
			 * Zlepi regularne vyrazy pre vsetky premenne.
			 * @return
			 */
			public String getRegex(){
				StringBuilder builder = new StringBuilder();
				for (VarSpecification var : variables) {
					builder.append(var.getRegex());
				}
				return builder.toString();
			}
		}
	
		static class LineGroup{
			public static final int ANY_COUNT = -1;
			public boolean skip = false; 
			public int count = ANY_COUNT;
			public LineSpecification line = new LineSpecification();
		}
		
		public List<LineGroup> lineGroups = new ArrayList<LineGroup>();
		
		
	}
	
	/**
	 * 
	 * @author marekru
	 * Konfiguracna trieda, ktora svojou strukturou urcuje vzhlad stranky z ktorej budeme stahovat data.
	 * Trieda Nothing neobsahuje ziadne pre nas zaujimave data.
	 * Trieda Outer obsahuje niekde v sebe Data, ale az v dcerskych uzloch.
	 * Trieda Data obsahuje priamo v sebe nejaky typ dat.
	 */
	static class PageConfig{
		public static final String DATA_TYPE_TABLE = "table";
		public static final String DATA_TYPE_TITLE = "title";
		public static final String DATA_TYPE_META = "meta";
		
		static abstract class Node{}
		static class NothingNode extends Node{}
		static class OuterNode extends Node{
			public List<Node> childNodes = new ArrayList<Node>();
		}
		static class DataNode extends Node{
			//public String type = DATA_TYPE_TABLE;
			public DataSpecification specif = new DataSpecification();
		}
		
		public Node root = new NothingNode(); 
	}

	
	// TODO data si zalohovat niekde a ak uz budu existovat, tak znova pouzit a neparsovat to vsetko od zaciatku
	@Override
	public List<Long> getAllRuns(TimeInterval interval) {
		List<Long> result = new ArrayList<Long>();
		for(String url:urls){
			List<Pair<DataSpecification, String>> data = parsePage(url, pageConfig);
			for(Pair<DataSpecification, String> pair:data){
				List<List<Variable>> varLists = parse(pair.get1(), pair.get2(), true);
				for(List<Variable>  varList:varLists){
					for(Variable var:varList){
						Object value = var.getValue();
						Date date = new Date();
						if(value instanceof Calendar){
							date = ((Calendar)value).getTime();
						}else if(value instanceof Date){
							date = (Date)value;
						}
						if(interval.contains(date)){
							result.add(date.getTime());
						}
					}
				}
			}
			
		}
		return result;
	}

	@Override
	public void addSoruces(String[] sources) {
		for(String source:sources){
			urls.add(source);
		}
	}

	// TODO fuj nechutne...milion forcyklov :/ treba to dako este premysliet
	// TODO pamatat si data, aby sa to neparsovalo milionkrat
	@Override
	public VerifDataTable extract(DataKey key) {
		VerifDataTable result = new VerifDataTable();
		Date date = new Date();
		for (String url : urls) {
			List<Pair<DataSpecification, String>> data = parsePage(url, pageConfig);
			for(Pair<DataSpecification, String> pair: data){
				List<List<Variable>> varLists = parse(pair.get1(), pair.get2());
				for(List<Variable>  varList:varLists){
					for(Variable var:varList){
						Object value = var.getValue(); 
						if(value instanceof Calendar){
							date = ((Calendar)value).getTime();
						}
						if(value instanceof Date){
							date = (Date)value;
						}
						if(key.getParameter().equals(var.getName())){
							if(value instanceof Double){
								result.put(date, (Double)value);
							}
						}
					}
				}	
			}
		}
		return result;
	}
	
	@Override
	public Map<Double, VerifDataTable> extractUpperAir(DataKey key) {
		return new TreeMap<Double, VerifDataTable>(); 
	}
	
	
	private  List<Pair<DataSpecification, String>> parsePage(String urlString, PageConfig config){
		try {
			URL url = new URL(urlString);
			// Cleaner Properties
			CleanerProperties props = new CleanerProperties();
			props.setTranslateSpecialEntities(true);
			props.setTransResCharsToNCR(true);
			props.setOmitComments(true);
			// parse webpage
			HtmlCleaner cleaner = new HtmlCleaner(props);
			TagNode tagNode = cleaner.clean(url);
			return parse(tagNode, config.root);
		} catch (MalformedURLException mUrlEx) {
			log.exception(null, mUrlEx);
		} catch (IOException ioEx){
			log.exception(null, ioEx);
		}
		return new LinkedList<Pair<DataSpecification,String>>();
	}
	
	
	private List<Pair<DataSpecification, String>> parse(TagNode tNode, Node cNode){
		// Linked list lebo budeme vela mergovat :/
		List<Pair<DataSpecification, String>> result = new LinkedList<Pair<DataSpecification,String>>();
		if(cNode instanceof NothingNode ){ // Nothing
			return result;
		}else if(cNode instanceof OuterNode){ // vnor sa do rekurzie
			OuterNode oNode = (OuterNode)cNode;
			// TODO co s tymto warningom?
			List<TagNode> tChildNodes = tNode.getChildTagList();
			ListIterator<TagNode> it = tChildNodes.listIterator();
			for(Node node:oNode.childNodes){
				if(!it.hasNext()){
					break;
				}
				List<Pair<DataSpecification, String>> list = parse(it.next(), node);
				result.addAll(list);
			}
		}else if(cNode instanceof DataNode){
			//precitaj data a pridaj do vysledku
			DataNode dataNode = (DataNode)cNode;
			StringBuffer buffer = tNode.getText();
			Pair<DataSpecification, String> pair = new Pair<WebDataExtractor.DataSpecification, String>(dataNode.specif , buffer.toString());
			result.add(pair);
		}
		return result;
	}

	private Variable parse(VarSpecification spec, String var){
		Object value = new Object();
		try {
			if(spec instanceof DateVarSpecification){
				DateVarSpecification dateSpec = (DateVarSpecification)spec;
				value = BasicTypeParser.parse(spec.type, var, dateSpec.datePattern);	
			}else{
				value = BasicTypeParser.parse(spec.type, var);
			}
		} catch (Exception e) {
			log.warning("", "Failed to parse string: %s.", var);
			log.exception(null, e);
		}
		return new VariableFactory().createVariable(spec.varName, value);
	}
	

	private List<Variable> parse(LineSpecification spec, String line, boolean dateOnly){
		List<Variable> result = new ArrayList<Variable>();
		String regex = spec.getRegex();
		Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
		Matcher macther = pattern.matcher(line);
		while(macther.find()){
			int count = Math.min(macther.groupCount(), spec.variables.size());
			for(int i = 0;i < count;i++){
				VarSpecification varSpecif = spec.variables.get(i);
				if(!dateOnly || varSpecif instanceof DateVarSpecification){
					// i + 1, pretoze 0. groupa je ""
					String value = macther.group(i + 1).trim();
					Variable var = parse(varSpecif, value);
					result.add(var);
				}
			}
		}
		return result;
	}
	
	private List<List<Variable>> parse(DataSpecification spec, String str){
		return parse(spec, str, false);
	}	

	
	private boolean variablesOK(List<Variable> vars, LineSpecification spec){
		if(vars.size() != spec.variables.size()){
			return false;
		}
		for(int i = 0;i < vars.size();i++){
			Object value = vars.get(i).getValue();
			Class<?> type = spec.variables.get(i).type;
			try {
				value = type.cast(value);	
			} catch (ClassCastException ex) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 * Metoda prechadza vstupny string po riadkoch na zaklade LineGroup a parsuje ich do zoznamu premennych.
	 * Vystupom je zoznam zoznamov premmennych pre kazdy riadok.
	 * @param str
	 * @return
	 */
	private List<List<Variable>> parse(DataSpecification spec, String str, boolean dateOnly){
		List<List<Variable>> result = new ArrayList<List<Variable>>();
		String[] lines = str.split("\n");
		int index = 0;
		// cez vsetky "Skupiny" riadkov
		for(LineGroup group:spec.lineGroups){
			// ak je to lubovolny pocet riadkov
			if(group.count == LineGroup.ANY_COUNT){
				while(index < lines.length){
					List<Variable> vars = parse(group.line, lines[index], dateOnly);
					// riadok sa sparsoval spravne
					if(vars.size() == group.line.variables.size() || dateOnly){
						if(!group.skip && variablesOK(vars, group.line)){
							result.add(vars);
						}
					}else if(index != 0){ // na riadku uz je nieco ine, zrejme ide o dalsiu line Group
						break;
					}
					index++;
				}
			}else{ // ak je to konkretny pocet riadkov
				for(int i = 0;i < group.count && index < lines.length;i++){
					List<Variable> vars = parse(group.line, lines[index], dateOnly);
					if(!group.skip && variablesOK(vars, group.line)){
						result.add(vars);
					}
					index++;
				}
			}
		}	
		return result;
	}
	
  
	/*
	public static void main(String[] args) {

		WebDataExtractor extractor = new WebDataExtractor();
		
		String[] urls = {
				"http://weather.uwyo.edu/cgi-bin/sounding?region=mideast&TYPE=TEXT%3ALIST&YEAR=2014&MONTH=05&FROM=2800&TO=2800&STNM=62306"
		};
		
		DataSpecification spec = new DataSpecification();
		
		LineSpecification lineSpec = new WebDataExtractor.DataSpecification.LineSpecification();
		VarSpecification numSpec = new WebDataExtractor.DataSpecification.VarSpecification();
		numSpec.varName = "Station Number";
		numSpec.regex = "[0-9]+";
		numSpec.endString = "\\s";
		
		VarSpecification idSpec = new WebDataExtractor.DataSpecification.VarSpecification();
		idSpec.varName = "Station ID";
		idSpec.regex = "[a-z]+";
		idSpec.endString = "\\s";
		
		VarSpecification nameSpec = new WebDataExtractor.DataSpecification.VarSpecification();
		nameSpec.varName = "Station Name";
		nameSpec.regex = ".+";
		nameSpec.endString = "\\sObservations.*";
		
		DateVarSpecification dateSpec = new DateVarSpecification();
		dateSpec.varName = "Date";
		dateSpec.regex = "[0-9]{2}Z\\s[0-9]{2}\\s[a-z]+\\s[0-9]{4}";
		dateSpec.endString = "";
		dateSpec.datePattern = "00'Z' dd MMM yyyy";
		dateSpec.type = Date.class;
			
		lineSpec.variables.add(numSpec);
		lineSpec.variables.add(idSpec);
		lineSpec.variables.add(nameSpec);
		lineSpec.variables.add(dateSpec);
		
		
		LineGroup group = new LineGroup();
		group.line = lineSpec;
		spec.lineGroups.add(group);
		
		// N riadkov dat
		LineGroup group2 = new WebDataExtractor.DataSpecification.LineGroup();
		group2.count = DataSpecification.LineGroup.ANY_COUNT;
		group2.line = new WebDataExtractor.DataSpecification.LineSpecification();
		VarSpecification pressure = new WebDataExtractor.DataSpecification.VarSpecification();
		VarSpecification height = new WebDataExtractor.DataSpecification.VarSpecification();
		VarSpecification temperature = new WebDataExtractor.DataSpecification.VarSpecification();
		VarSpecification dewpoint = new WebDataExtractor.DataSpecification.VarSpecification();
		VarSpecification humidity = new WebDataExtractor.DataSpecification.VarSpecification();
		VarSpecification direction = new WebDataExtractor.DataSpecification.VarSpecification();
		VarSpecification speed = new WebDataExtractor.DataSpecification.VarSpecification();
			
		pressure.regex = height.regex = temperature.regex = dewpoint.regex = humidity.regex = direction.regex = speed.regex = ".{7}";
		pressure.type = height.type = temperature.type = dewpoint.type = humidity.type = direction.type = speed.type = Double.class;
		
		//dewpoint.endString = ".{7}";
		humidity.endString = ".{7}";//.{7}";
		speed.endString = ".{7}.{7}.{7}";
		
		pressure.varName = "Pressure";
		height.varName = "Height";
		temperature.varName = "Temp";
		dewpoint.varName = "DewPoint";
		humidity.varName = "Humidity"; 
		direction.varName = "Dir";
		speed.varName = "Speed";
		
		group2.line.variables.add(pressure);
		group2.line.variables.add(height);
		group2.line.variables.add(temperature);
		group2.line.variables.add(dewpoint);
		group2.line.variables.add(humidity);
		group2.line.variables.add(direction);
		group2.line.variables.add(speed);
		
		DataSpecification spec2 = new DataSpecification();
		
		spec2.lineGroups.add(group2);
		
		// Toto sa bude citat z XML configu
		PageConfig config = new PageConfig();
		
		OuterNode root = new OuterNode();
		root.childNodes.add(new NothingNode());
		OuterNode body = new OuterNode();
		DataNode header = new DataNode();
		header.specif = spec;
		body.childNodes.add(header);
		DataNode data = new DataNode();
		data.specif = spec2;
		body.childNodes.add(data);
		body.childNodes.add(new NothingNode());
		body.childNodes.add(new DataNode());		
		root.childNodes.add(body);
		config.root = root;
		
	
		extractor.addSoruces(urls);
		extractor.pageConfig = config;
		GregorianCalendar from = new GregorianCalendar(1970, 1, 1, 0, 0);
		GregorianCalendar to   = new GregorianCalendar(2020, 1, 1, 0, 0);
		Interval<Calendar> interval = new Interval<Calendar>(from, to);
		
		DataKey key = new DataKey(0L, 0.0, 0.0, "", "Pressure");
		
		ContinuousDataTable<Calendar> d = extractor.extract(key);
		for (Map.Entry<Calendar, Range> entry : d.data.entrySet()) {
			System.out.println(((DoubleRange)entry.getValue()).num);
		}
		
	}
	*/
	
}
