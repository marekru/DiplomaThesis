library(XML)

##########################################################################################################
# 
# This script reads various file formats and performs other utility operations, including
# some verification tasks.
#
##########################################################################################################

#Function that reads an XML output file from the EVS for a single-valued
#measure, which includes ensemble scores and deterministic error statistics,
#and returns a paired list comprising the lead times (lead.times), events
#(events), numeric event values (events.numeric), climatological probabilities 
#of the events (events.prob), score values (scores) and the lower and upper 
#bounds of a main sampling interval (lower and upper) if available. The scores 
#are contained in a matrix with events in the rows and lead times in the 
#columns.  If there are several components to a score, specify the index of 
#the component to return.
#
#The threshold "All data" is given an NA indicator in the first index of the 
#returned thresholds

readEVSScores<-function(file, index=1) {
	doc = xmlRoot(xmlInternalTreeParse(file))
	#Read the lead times
	lead.times=as.numeric(unique(unlist(xpathApply(doc, "//lead_hour", xmlValue))))
	#Read the events
	events<-(unique(unlist(xpathApply(doc, "//threshold_value", xmlValue))))
	events<-gsub("GTE",">=",events)
	events<-gsub("LTE","<=",events)
	events<-gsub("GT",">",events)
	events<-gsub("LT","<",events)

	events.data<-gsub("All data","-9999 -9999",events)
	events.data<-gsub("Pr=","",events.data)
	events.data<-gsub(">= ","",events.data)
	events.data<-gsub("<= ","",events.data)
	events.data<-gsub("> ","",events.data)
	events.data<-gsub("< ","",events.data)
	events.data<-gsub("\\(|\\)","",events.data)

	events.data<-unlist(strsplit(events.data," "))
	events.numeric.all<-unlist(lapply(events.data,as.numeric))
	events.numeric<-events.numeric.all[seq(1, length(events.numeric.all), 2)]
	events.probs<-events.numeric.all[seq(2, length(events.numeric.all), 2)]
	events.numeric[events.numeric==-9999]<-NA	
	events.probs[events.probs==-9999]<-NA	

	#Read the scores and intervals (if available)
	scores<-matrix(nrow=length(events),ncol=length(lead.times))
	lower<-matrix(nrow=length(events),ncol=length(lead.times))
	upper<-matrix(nrow=length(events),ncol=length(lead.times))
	eventsFound<-vector("character")
	eventsFound.numeric<-vector("double")
	eventsFound.probs<-vector("double")
	inc<-0
	for(j in 1:length(lead.times)) {
		tmp=doc[[j+2]]
		for(i in 1:length(events.numeric)) {
			threshold_node = tmp[2]$threshold[i]$threshold
			raw_data<-threshold_node[2]$data[1]$values
			if(!is.null(raw_data)) {
				#Allow additions of duplicate thresholds on first lead time
				#since only trying to avoid duplication across lead times.
				if(j==1 || match(events.numeric[i],eventsFound.numeric,nomatch=-999) == -999) {
					inc=inc+1
					eventsFound[inc]=events[i]	
					eventsFound.numeric[inc]=events.numeric[i]
					eventsFound.probs[inc]=events.probs[i]
				}
				raw_data<-unlist(strsplit(xmlValue(raw_data),", "))
				scores[i,j]=as.numeric(raw_data[index])
				interval=threshold_node[2]$data[2]$sampling_intervals[1]$main_interval
				low=interval[2]$lower_bound[1]$values
				high=interval[3]$upper_bound[1]$values
				if(!is.null(low)) {
					raw_low<-unlist(strsplit(xmlValue(low),", "))	
					raw_high<-unlist(strsplit(xmlValue(high),", "))		
					lower[i,j]=as.numeric(raw_low[index])
					upper[i,j]=as.numeric(raw_high[index])
				}
				if(!is.na(scores[i,j]) && scores[i,j]==-999.0) { 
					scores[i,j]=NA
					lower[i,j]=NA
					upper[i,j]=NA				
				}
				if(!is.finite(scores[i,j])) { 
					scores[i,j]=NA 
					lower[i,j]=NA
					upper[i,j]=NA
				}	
				if(!is.na(lower[i,j]) && lower[i,j]==-999.0) {
					lower[i,j]=NA
					upper[i,j]=NA				
				}
				if(!is.na(upper[i,j]) && upper[i,j]==-999.0) {
					lower[i,j]=NA
					upper[i,j]=NA				
				}
			} 
		}
	}
	pairlist(lead.times=lead.times,events=eventsFound,events.numeric=eventsFound.numeric,events.probs=eventsFound.probs,
	scores=scores,lower=lower,upper=upper)
}

#Function that reads an XML output file from the EVS for a diagram metric
#and returns a paired list comprising the lead times (lead.times), events
#(events), climatological probabilities of the events (events.probs), numeric event 
#values (events.numeric), scores (scores) and the lower and upper bounds of a main 
#sampling interval (lower and upper) if available.  Each diagram is stored in a 
#matrix with as many columns as points in the diagram and three-times as many rows
#as specified to read in the input. Each group of three rows comprises the data values,
#followed by the lower and upper bounds of the main sampling intervals (if defined,
#otherwise NA). By default, two rows are read, corresponding to the X and Y values of 
#the diagram, respectively and, thus, six rows are returned (with sampling intervals). 
#Each matrix is stored in a list of lists, with the first list comprising the lead times 
#and the second list comprising each data datrix indexed by event.  The times and events 
#are indexed by their string values.  Optionally, specify a vector of events to read,
#identified by there climatological probabilities.

readEVSDiagrams<-function(file,rows=2,subset.probs=NULL) {
	doc = xmlRoot(xmlInternalTreeParse(file))
	#Read the lead times
	lead.times=as.numeric(unique(unlist(xpathApply(doc, "//lead_hour", xmlValue))))
	#Read the events
	events<-(unique(unlist(xpathApply(doc, "//threshold_value", xmlValue))))
	events<-gsub("GT",">",events)
	events<-gsub("LT","<",events)
	events<-gsub("GTE",">=",events)
	events<-gsub("LTE","<=",events)

	events.data<-gsub("All data","-9999 -9999",events)
	events.data<-gsub("Pr=","",events.data)
	events.data<-gsub("> | < | <= | >=","",events.data)
	events.data<-gsub("\\(|\\)","",events.data)
	events.data<-unlist(strsplit(events.data," "))
	events.numeric.all<-unlist(lapply(events.data,as.numeric))
	events.numeric<-events.numeric.all[seq(1, length(events.numeric.all), 2)]
	events.probs<-events.numeric.all[seq(2, length(events.numeric.all), 2)]
	events.numeric[events.numeric==-9999]<-NA	
	events.probs[events.probs==-9999]<-NA	

	#Read the diagrams
	diagrams<-vector("list")
	eventsFound<-vector("character")
	eventsFound.numeric<-vector("double")
	eventsFound.probs<-vector("double")

	inc<-0
	for(j in 1:length(lead.times)) {
		tmp=doc[[j+2]]
		events.store<-vector("list");
		for(i in 1:length(events)) {
			threshold_node = tmp[2]$threshold[i]$threshold
			if(!is.null(threshold_node)) {
				#Data found for event?
				if(j==1 || match(events.numeric[i],eventsFound.numeric,nomatch=-999) == -999) {
					inc=inc+1
					eventsFound[inc]=events[i]	
					eventsFound.numeric[inc]=events.numeric[i]
					eventsFound.probs[inc]=events.probs[i]
				}
				sampleIndex = xmlSize(threshold_node[2]$data)
				interval_node=threshold_node[2]$data[sampleIndex]$sampling_intervals[1]$main_interval
				t<-threshold_node[2]$data[1]$values
				#For fitted ROC, number of columns varies for fitted
				tst<-c()
				try(tst<-threshold_node[2]$data[4]$values)	
				if(!is.null(tst)) t = tst
				t<-unlist(strsplit(xmlValue(t),", "))			
				addMe<-matrix(nrow=3*rows,ncol=length(t))
					
				#Main data
				for(k in 1: rows) {
					v<-threshold_node[2]$data[k]$values
					l<-interval_node[2]$lower_bound[k]$values
					u<-interval_node[3]$upper_bound[k]$values
					start<-(k-1)*3;
					#Nominal value
					if(!is.null(v)) {
						vv<-as.numeric(unlist(strsplit(xmlValue(v),", ")))
						vv[vv==-999]<-NA
 						addMe[start+1,1:length(vv)]=vv;
					}
					#Lower bound
					if(!is.null(l)) {
						ll<-as.numeric(unlist(strsplit(xmlValue(l),", ")))
						ll[ll==-999]<-NA
 						addMe[start+2,1:length(ll)]=ll
					}
					#Upper bound
					if(!is.null(u)) {
 						uu<-as.numeric(unlist(strsplit(xmlValue(u),", ")))
						uu[uu==-999]<-NA
 						addMe[start+3,1:length(uu)]=uu
					}
				}
				if(!is.null(subset.probs)) {
					if(events.probs[i] %in% subset.probs) {
						events.store[[events[i]]]=addMe;	
					}
				} else {
					events.store[[events[i]]]=addMe;
				}
			}
		}
		diagrams[[j]]=events.store;
	}

	#Remove events not required
	if(!is.null(subset.probs)) {
		retain<-match(subset.probs,events.probs)
		eventsFound.probs=eventsFound.probs[retain]
		eventsFound.numeric=eventsFound.numeric[retain]
		eventsFound=eventsFound[retain]
	}
	pairlist(diagram.data=diagrams,lead.times=lead.times,events=eventsFound,events.numeric=eventsFound.numeric,events.probs=eventsFound.probs)
}

#Function that reads an XML output file comprising box plots from the EVS 
#and returns a paired list comprising the lead times (lead.times) and a matrix
#of box plot values for each lead time, comprising the observed value in the 
#first column and the error quantiles in the remaining columns.  Also returns
#the probabilities corresponding to the quantiles, which are contained in the first row
#of each data block. The rows par controls the reading of rows that contain individual boxes. 
#For very large datasets with many similar observed values, the data may be thinned 
#for plotting. In that case, to guarantee reading a given number of rows in the tails,
#specify a number of rows for augment.tails 

readEVSBoxPlots<-function(file,read.freq=1,augment.tails=NA) {
	doc = xmlRoot(xmlInternalTreeParse(file))
	#Read the lead times
	lead.times=unique(unlist(xpathApply(doc, "//lead_hour", xmlValue)))
	lead.times.numeric<-as.numeric(lead.times)
	#Read the boxes
	boxesByTime<-vector("list")
	quantiles<-c()
	for(j in 1:length(lead.times)) {
		tmp=doc[[j+2]]
		totalrows<-xmlSize(tmp[2]$data)
		rows<-floor(totalrows/read.freq)
		v<-tmp[2]$data[1]$values
		vv<-as.numeric(unlist(strsplit(xmlValue(v),", ")))	
		quantiles=vv
		cols=length(vv)
		iterate<-seq(2,rows*read.freq,read.freq)
		if(!is.na(augment.tails)) {
			start<-seq(2,augment.tails,1)
			end<-seq(totalrows,totalrows-augment.tails,-1)
			iterate=c(start,iterate,end)
			iterate=unique(sort(iterate))
		}
		m<-matrix(nrow=length(iterate),ncol=cols)
		tot=1
		for(k in 1:length(iterate)) {	
			v=tmp[2]$data[iterate[tot]]$values
			vv=as.numeric(unlist(strsplit(xmlValue(v),", ")))	
			m[tot,]=vv
			tot=tot+1
		}
		boxesByTime[[lead.times[j]]]=m;
	}
	pairlist(box.data=boxesByTime,lead.times=lead.times,data.quantiles=quantiles)
}

#Read text pairs from EVS (not XML) and return data, absent date and time (with lead time)
readPairs <-function (file, header = FALSE, na.strings="-999.0") {
	tab1row <- read.table(file, header = header, nrows = 1)
	classes <- sapply(tab1row, class)
	tab<-read.table(file=file,header=header,na.strings=na.strings,sep=" ",colClasses=classes)
	m<-data.matrix(tab)	
	m=unname(m)
	m[1:nrow(m),2:ncol(m)]
}

#Function to subset input by lead time: returns lead time in first column if rLead is true
getLead <-function (data, lead , rLead=FALSE) {
	rows<-nrow(data)
	cols<-ncol(data)
	if(is.null(rows) || rows==0) {
		stop("'data' must be a matrix with a positive number of rows.")
	}
	returnMe<-matrix(nrow=rows,ncol=cols)
	nxt<-1
	for(i in 1: rows) {
		if(data[i,1]==lead) {
			returnMe[nxt,]=data[i,]
			nxt=nxt+1
		}
	}
	if(rLead) {
		returnMe[1:nxt-1,]
	} 
      else {
		returnMe[1:nxt-1,2:cols]
	}
}

#Function to subset input by observed value exceeding a threshold, where obs are in the specified column
getByObsExc<-function (data, threshold, col) {
	rows<-nrow(data)
	cols<-ncol(data)
	if(is.null(rows) || rows==0) {
		stop("'data' must be a matrix with a positive number of rows.")
	}
	returnMe<-matrix(nrow=rows,ncol=cols)
	nxt<-1
	for(i in 1: rows) {
		if(data[i,col]>threshold) {
			returnMe[nxt,]=data[i,]
			nxt=nxt+1
		}
	}
	returnMe[1:nxt-1,]
}

#Subset observations by non-null forecasts
subObsByNonNullFcst <-function (obs, fcst) {
	rows<-length(obs)
	returnMe<-vector(length=rows)
	nxt<-1
	for(i in 1: rows) {
		if(!is.na(fcst[i])) {
			returnMe[nxt]=obs[i]
			nxt=nxt+1
		}
	}	
	returnMe[1:nxt-1]
}

####TEST METHODS

#base.file<-"G:/NOAA_work/Articles/HEP_papers/SREF_verification/Verification_results/EVS_results/"
#ma.f<-paste(base.file,"MARFC/24_hour/Overall/MARFC.Relative_operating_characteristic.xml",sep="")
#ma.roc<-readEVSDiagrams(ma.f,12)

#base<-"C:/Documents and Settings/brownj/Desktop/EVS_CI_results/"
#file1<-paste(base,"HMOS.Streamflow.Spread-bias_diagram.XML",sep="")
#data<-readEVSDiagrams(file1)
#print(data)

#base<-"G:/NOAA_work/Articles/HEP_papers/SREF_verification/Verification_results/EVS_results/CNRFC/24_hour/Overall/"
#file1<-paste(base,"CNRFC.Correlation_coefficient.XML",sep="")
#print(readEVSScores(file1))

#file<-"D:/NOAA_work/HEP_projects//Hindcasting/Verification/GFS/Forcing/EVS_outputs/No_bootstrap/FTSC1/FTSC1.Precipitation.GFS_1D.Relative_mean_error.xml"
#d<-readEVSScores(file)



