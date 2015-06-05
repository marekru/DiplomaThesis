package com.microstepmis.model.verification.verificationtool;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

import com.microstepmis.log.Log;
import com.microstepmis.xplatform.JS;
import com.microstepmis.xplatform.X2O;
import com.microstepmis.xplatform.XCfg;
import com.microstepmis.xplatform.rpc.RPC;


/**
 * Verification Visualization Configuration
 *
 * <p>
 * (c) 2005 MicroStep-MIS  www.microstep-mis.com
 *
 * <p>
 * @author $Author: marekru $
 *         
 * @version $Id: VerificationVisCfg.java,v 1.8 2014/09/09 12:26:32 marekru Exp $
 * Configuracna trieda pre viszualizaciu verifikacie
 * 
 * TODO other properties
 */
@JS( files= { 
		@JS.File( name="../tomcat/webapps/ims/js/VisualizationCfg.js" )
}) 
@XCfg(label="Verification Visualization Configuration")
public final class VerificationVisCfg {

	public static final String CONFIG_BLOCK_NAME = "c/CfgVerifVis";
	public static final String FILE_NAME = "../cfg/model/VisualizationCfg.xml";
	
	private static Log log = new Log(ModelVerificationCfg.LOG_NAME);
	
	public interface PlotType{}
	
	enum TimePlotType implements PlotType{
		ScatterPlot,
		BoxPlot,
		ColorPlot,
		LinePlot,
		SpiralPlot
		// TODO others
	}
	
	enum CategoricalPlotType implements PlotType{
		BarPlot,
		MosaicPlot,
		AssociationPlot,
		DoubleDeckerPlot
		// TODO others
	}
	
	enum CredibilityMethod{
		Alpha,
		Size,
		Pattern
		// TODO others
	}

	public VerificationVisCfg(){}
	
	/**
	 * Toto je hlavne pre offline zobrazovanie.
	 * Na obrazovke sa to riesi inak.
	 **/
	@XCfg(label="Meta Information Configuration")
	static public final class MetaInfoCfg{
		/**
		 * True - zobrazi Lat/Lon/Alt(model vs real)
		 */
		@XCfg(label="Display Station Location")
		public boolean location = true;
		/**
		 * True - zobrazi meno modelu
		 */
		@XCfg(label="Display Model Name")
		public boolean modelName = true;
		/**
		 * True - zobrazi meno porovnanej premennej
		 */
		@XCfg(label="Display Variable Name")
		public boolean variableName = true;
		
		// TODO others
	}
	
	/**
	 * 
	 * [M] - Meno Modelu
	 * [F] - From - Datum odkedy
	 * [T] - To   - Datum dokedy
	 * [V] - Variable - Meno premennej
	 * [E] - Extension - typ suboru
	 * 
	 */
	@XCfg(label="File Name Pattern")
	static public final class FileNamePattern{
		@XCfg(label="Date Format") // TODO len niektore povolene znaky!
		public String dateFormat = "yyyyMMddHH";
		@XCfg(label="Extension",
	  		  restriction = @XCfg.Restriction( enumeration={ 
	  			@XCfg.Enum(key="png", value="png"),
				@XCfg.Enum(key="jpg", value="jpg"),
				@XCfg.Enum(key="svg", value="svg") // ???
			  })
		)
		public String extension  = "png";
		@XCfg(label="Name Pattern",
			  restriction = @XCfg.Restriction(
				pattern = "(\\[[MVFT]\\]|[_-])+\\.\\[E\\]", // TODO pattern
				patternHelp = "[M] - Model Name, [F] - From, [T] - To, [V] - Variable, [E] - Extension"
		      )
		) // TODO mozno dajako lepsie navrhnut :D
		public String pattern    = "[M]_[F]_[T]_[V].[E]";
	}
	

	@XCfg(label="Time Plot Configuration")
	public static final class TimePlotCfg{

		@XCfg(label="Plot Type")
		public TimePlotType type = TimePlotType.LinePlot;
		
		public TimePlotCfg() {}
		
		public TimePlotCfg(TimePlotType type) {
			this.type = type;
		}
		
		@Override
		public int hashCode() {
			return type.hashCode();
		}
		
		@Override
		public boolean equals(Object obj) {
			if(obj instanceof TimePlotCfg){
				TimePlotCfg  plotCfg = (TimePlotCfg)obj;
				return type.equals(plotCfg.type);
			}
			return false;
		}
		// TODO
	}

	@XCfg(label="Categorical Plot Configuration")
	public static final class CategoricalPlotCfg{
		
		@XCfg(label="Plot Type")
		public CategoricalPlotType type = CategoricalPlotType.BarPlot;

		public CategoricalPlotCfg() {}
		
		public CategoricalPlotCfg(CategoricalPlotType type) {
			this.type = type;
		}
		
		@Override
		public int hashCode() {
			return type.hashCode();
		}
		
		@Override
		public boolean equals(Object obj) {
			if(obj instanceof CategoricalPlotCfg){
				CategoricalPlotCfg  plotCfg = (CategoricalPlotCfg)obj;
				return type.equals(plotCfg.type);
			}
			return false;
		}
		// TODO
	}
	
	/**
	 * True - Visualizujeme aj na disk do obrazka, nie len na IMS obvrazovku
	 */
	@XCfg(label="Visualize to File")
	public boolean offline = true;
	/**
	 * Vzor, ako maju byt pomenovane vystupne subory - treba to domysliet
	 */
	@XCfg(label="Output File Pattern")
	public FileNamePattern fileNamePattern = new FileNamePattern();
	/**
	 * Nastavenia vsetkych meta informacii, ktore treba zobrazit
	 */
	@XCfg(label="Meta info Configuration")
	public MetaInfoCfg metaInfo = new MetaInfoCfg();
	/**
	 * Sposoby, ktorymi budeme visualizovat spojite casovo orientovane data
	 */
	@XCfg(label="Time Plots")
	public HashSet<TimePlotCfg> timePlots = new HashSet<TimePlotCfg>(); // NOSONAR - koli mapovaniu
	{
		for(TimePlotType type:TimePlotType.values()){
			timePlots.add(new TimePlotCfg(type));
		}
	}
	/**
	 * Sposoby, ktorymi budeme visualizovat contingencne tabulky
	 */
	@XCfg(label="Catgeorical Plots")
	public HashSet<CategoricalPlotCfg> categoricalPlots = new HashSet<CategoricalPlotCfg>(); // NOSONAR - koli mapovaniu
	{
		for(CategoricalPlotType type:CategoricalPlotType.values()){
			categoricalPlots.add(new CategoricalPlotCfg(type));
		}
	}
	/**
	 * Sposob, ktorymi budeme visualizovat doveryhodnost dat
	 */
	@XCfg(label="Credibility Method")
	public CredibilityMethod credibilityMethod = CredibilityMethod.Alpha;
	/**
	 * Meno fontu, ktory sa pouzije pri visualizacii
	 */
	@XCfg(label="Font Family", // TODO dalsie fonty
		  restriction = @XCfg.Restriction( enumeration={ 
	  			@XCfg.Enum(key="Arial", value="Arial"),
				@XCfg.Enum(key="Times New Roman", value="Times New Roman"),
				@XCfg.Enum(key="Verdena", value="Verdena") 
		  })
	)
	public String fontFamily = "Arial";
	
	
	// TODO
	// - Color palettes
	
	
	/**
	 * 
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static VerificationVisCfg readConfiguration(){
		VerificationVisCfg result = new VerificationVisCfg();
		try {
			File configFile = new File(FILE_NAME);
			result = (VerificationVisCfg) X2O.mapFromXML(configFile);
		} catch (Exception e) {
			log.warning(null, "Unable to load configuration file %s. Using default configuration.", FILE_NAME);
			log.exception(null, e);
		}
		return result;
	}
	
	/**
	 * 
	 * @return
	 */
	@RPC(permissions = { @RPC.Permission(name = "FreePermission") })
	public static boolean writeConfiguration(VerificationVisCfg cfg){
		File configFile = new File(FILE_NAME);
		try {
			if(configFile.createNewFile()){
				log.note(null, "File %s created.", configFile.getPath());
			}
			X2O.mapToXML(configFile, cfg);
		} catch (Exception e) {
			log.exception(null, e);
			return false;
		}
		return true;
	}
}
