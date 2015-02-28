library(fields) 
library(verification)
library(gplots)

##########################################################################################################
# 
# This script plots a single-valued metric or score as a 'continuous' function of threshold value in a 
# nine-plot frame (e.g. three lead times and three scenarios or three scores and three lead times etc.).
# In practice, this is achieved by specifying a large but finite number of thresholds at which the 
# probabilities are output from the EVS.
#
# Relies on methods from the utility R script: Utilities.R
#
##########################################################################################################

#Ensemble data:

#Base folders/files

#This example plots the Brier Skill Score (BSS) relative to climatology for a raw and bias-corrected ensemble
#The results are plotted by climatological exceedence probability on the domain axis and BSS on the range.
#Results are shown for 9 locations, i.e. 9 separate plots.

#Top-level directory TO EDIT
root<-""
#Data directory constructed from root directory (should not need to modify)
data<-paste(root,"/nonsrc/rscripts/example_scripts/example_evs_out/",sep="")

p1.raw.file<-paste(data,"05455500_raw.Brier_skill_score.xml",sep="")    
p2.raw.file<-paste(data,"01643000_raw.Brier_skill_score.xml",sep="") 
p3.raw.file<-paste(data,"08172000_raw.Brier_skill_score.xml",sep="") 
p4.raw.file<-paste(data,"03179000_raw.Brier_skill_score.xml",sep="") 
p5.raw.file<-paste(data,"03451500_raw.Brier_skill_score.xml",sep="") 
p6.raw.file<-paste(data,"07378500_raw.Brier_skill_score.xml",sep="") 
p7.raw.file<-paste(data,"08167500_raw.Brier_skill_score.xml",sep="") 
p8.raw.file<-paste(data,"01608500_raw.Brier_skill_score.xml",sep="") 
p9.raw.file<-paste(data,"03364000_raw.Brier_skill_score.xml",sep="") 

p1.cor.file<-paste(data,"05455500_corrected.Brier_skill_score.xml",sep="")    
p2.cor.file<-paste(data,"01643000_corrected.Brier_skill_score.xml",sep="") 
p3.cor.file<-paste(data,"08172000_corrected.Brier_skill_score.xml",sep="") 
p4.cor.file<-paste(data,"03179000_corrected.Brier_skill_score.xml",sep="") 
p5.cor.file<-paste(data,"03451500_corrected.Brier_skill_score.xml",sep="") 
p6.cor.file<-paste(data,"07378500_corrected.Brier_skill_score.xml",sep="") 
p7.cor.file<-paste(data,"08167500_corrected.Brier_skill_score.xml",sep="") 
p8.cor.file<-paste(data,"01608500_corrected.Brier_skill_score.xml",sep="") 
p9.cor.file<-paste(data,"03364000_corrected.Brier_skill_score.xml",sep="") 

####################
#Output
####################

#Not needed to display within R
outfile<-""  

postscript<-FALSE          #True to write, false to display                                              
if(postscript==TRUE) {
	ps.options(horizontal=FALSE,onefile=FALSE,paper="a4")
	postscript(outfile,height=7,width=7,pagecentre=TRUE)
}

#Data to plot by index.
plot.me<-c(1,2)

#Specify three times by column index 
times<-c(1)

probMin<-0.01 #Use the logit of this value as the minimum plotting position for the clim prob = 0 case 
probMax<-0.999

#Nominal values: one Y in each row
p1.data<-vector("list")
p2.data<-vector("list")
p3.data<-vector("list")
p4.data<-vector("list")
p5.data<-vector("list")
p6.data<-vector("list")
p7.data<-vector("list")
p8.data<-vector("list")
p9.data<-vector("list")
p1.low<-vector("list")
p2.low<-vector("list")
p3.low<-vector("list")
p4.low<-vector("list")
p5.low<-vector("list")
p6.low<-vector("list")
p7.low<-vector("list")
p8.low<-vector("list")
p9.low<-vector("list")
p1.high<-vector("list")
p2.high<-vector("list")
p3.high<-vector("list")
p4.high<-vector("list")
p5.high<-vector("list")
p6.high<-vector("list")
p7.high<-vector("list")
p8.high<-vector("list")
p9.high<-vector("list")

#Read data
if(1 %in% plot.me) {
	p1.raw.data<-readEVSScores(p1.raw.file)
	p2.raw.data<-readEVSScores(p2.raw.file)
	p3.raw.data<-readEVSScores(p3.raw.file)
	p4.raw.data<-readEVSScores(p4.raw.file)
	p5.raw.data<-readEVSScores(p5.raw.file)
	p6.raw.data<-readEVSScores(p6.raw.file)
	p7.raw.data<-readEVSScores(p7.raw.file)
	p8.raw.data<-readEVSScores(p8.raw.file)
	p9.raw.data<-readEVSScores(p9.raw.file)
	p1.data[[1]]=p1.raw.data$scores[p1.raw.data$events.probs<=probMax,times[1]]
	p2.data[[1]]=p2.raw.data$scores[p2.raw.data$events.probs<=probMax,times[1]]
	p3.data[[1]]=p3.raw.data$scores[p3.raw.data$events.probs<=probMax,times[1]]
	p4.data[[1]]=p4.raw.data$scores[p4.raw.data$events.probs<=probMax,times[1]]
	p5.data[[1]]=p5.raw.data$scores[p5.raw.data$events.probs<=probMax,times[1]]
	p6.data[[1]]=p6.raw.data$scores[p6.raw.data$events.probs<=probMax,times[1]]
	p7.data[[1]]=p7.raw.data$scores[p7.raw.data$events.probs<=probMax,times[1]]
	p8.data[[1]]=p8.raw.data$scores[p8.raw.data$events.probs<=probMax,times[1]]
	p9.data[[1]]=p9.raw.data$scores[p9.raw.data$events.probs<=probMax,times[1]]
	p1.low[[1]]=p1.raw.data$lower[p1.raw.data$events.probs<=probMax,times[1]]
	p2.low[[1]]=p2.raw.data$lower[p2.raw.data$events.probs<=probMax,times[1]]
	p3.low[[1]]=p3.raw.data$lower[p3.raw.data$events.probs<=probMax,times[1]]
	p4.low[[1]]=p4.raw.data$lower[p4.raw.data$events.probs<=probMax,times[1]]
	p5.low[[1]]=p5.raw.data$lower[p5.raw.data$events.probs<=probMax,times[1]]
	p6.low[[1]]=p6.raw.data$lower[p6.raw.data$events.probs<=probMax,times[1]]
	p7.low[[1]]=p7.raw.data$lower[p7.raw.data$events.probs<=probMax,times[1]]
	p8.low[[1]]=p8.raw.data$lower[p8.raw.data$events.probs<=probMax,times[1]]
	p9.low[[1]]=p9.raw.data$lower[p9.raw.data$events.probs<=probMax,times[1]]
	p1.high[[1]]=p1.raw.data$upper[p1.raw.data$events.probs<=probMax,times[1]]
	p2.high[[1]]=p2.raw.data$upper[p2.raw.data$events.probs<=probMax,times[1]]
	p3.high[[1]]=p3.raw.data$upper[p3.raw.data$events.probs<=probMax,times[1]]
	p4.high[[1]]=p4.raw.data$upper[p4.raw.data$events.probs<=probMax,times[1]]
	p5.high[[1]]=p5.raw.data$upper[p5.raw.data$events.probs<=probMax,times[1]]
	p6.high[[1]]=p6.raw.data$upper[p6.raw.data$events.probs<=probMax,times[1]]
	p7.high[[1]]=p7.raw.data$upper[p7.raw.data$events.probs<=probMax,times[1]]
	p8.high[[1]]=p8.raw.data$upper[p8.raw.data$events.probs<=probMax,times[1]]
	p9.high[[1]]=p9.raw.data$upper[p9.raw.data$events.probs<=probMax,times[1]]
}
if(2 %in% plot.me) {
	p1.cor.data<-readEVSScores(p1.cor.file)
	p2.cor.data<-readEVSScores(p2.cor.file)
	p3.cor.data<-readEVSScores(p3.cor.file)
	p4.cor.data<-readEVSScores(p4.cor.file)
	p5.cor.data<-readEVSScores(p5.cor.file)
	p6.cor.data<-readEVSScores(p6.cor.file)
	p7.cor.data<-readEVSScores(p7.cor.file)
	p8.cor.data<-readEVSScores(p8.cor.file)
	p9.cor.data<-readEVSScores(p9.cor.file)
	p1.data[[2]]=p1.cor.data$scores[p1.cor.data$events.probs<=probMax,times[1]]
	p2.data[[2]]=p2.cor.data$scores[p2.cor.data$events.probs<=probMax,times[1]]
	p3.data[[2]]=p3.cor.data$scores[p3.cor.data$events.probs<=probMax,times[1]]
	p4.data[[2]]=p4.cor.data$scores[p4.cor.data$events.probs<=probMax,times[1]]
	p5.data[[2]]=p5.cor.data$scores[p5.cor.data$events.probs<=probMax,times[1]]
	p6.data[[2]]=p6.cor.data$scores[p6.cor.data$events.probs<=probMax,times[1]]
	p7.data[[2]]=p7.cor.data$scores[p7.cor.data$events.probs<=probMax,times[1]]
	p8.data[[2]]=p8.cor.data$scores[p8.cor.data$events.probs<=probMax,times[1]]
	p9.data[[2]]=p9.cor.data$scores[p9.cor.data$events.probs<=probMax,times[1]]
	p1.low[[2]]=p1.cor.data$lower[p1.cor.data$events.probs<=probMax,times[1]]
	p2.low[[2]]=p2.cor.data$lower[p2.cor.data$events.probs<=probMax,times[1]]
	p3.low[[2]]=p3.cor.data$lower[p3.cor.data$events.probs<=probMax,times[1]]
	p4.low[[2]]=p4.cor.data$lower[p4.cor.data$events.probs<=probMax,times[1]]
	p5.low[[2]]=p5.cor.data$lower[p5.cor.data$events.probs<=probMax,times[1]]
	p6.low[[2]]=p6.cor.data$lower[p6.cor.data$events.probs<=probMax,times[1]]
	p7.low[[2]]=p7.cor.data$lower[p7.cor.data$events.probs<=probMax,times[1]]
	p8.low[[2]]=p8.cor.data$lower[p8.cor.data$events.probs<=probMax,times[1]]
	p9.low[[2]]=p9.cor.data$lower[p9.cor.data$events.probs<=probMax,times[1]]
	p1.high[[2]]=p1.cor.data$upper[p1.cor.data$events.probs<=probMax,times[1]]
	p2.high[[2]]=p2.cor.data$upper[p2.cor.data$events.probs<=probMax,times[1]]
	p3.high[[2]]=p3.cor.data$upper[p3.cor.data$events.probs<=probMax,times[1]]
	p4.high[[2]]=p4.cor.data$upper[p4.cor.data$events.probs<=probMax,times[1]]
	p5.high[[2]]=p5.cor.data$upper[p5.cor.data$events.probs<=probMax,times[1]]
	p6.high[[2]]=p6.cor.data$upper[p6.cor.data$events.probs<=probMax,times[1]]
	p7.high[[2]]=p7.cor.data$upper[p7.cor.data$events.probs<=probMax,times[1]]
	p8.high[[2]]=p8.cor.data$upper[p8.cor.data$events.probs<=probMax,times[1]]
	p9.high[[2]]=p9.cor.data$upper[p9.cor.data$events.probs<=probMax,times[1]]
}

###  Flood thresholds as probabilities

#Quantile lines for plotting
flood.probs<-c(
0.98277,
0.996477,
0.994457,
0.99566,
0.999569,
0.990209,
0.999701,
0.997554,
0.991777)

line.type="dashed"
quant.col="black"

#########PLOT PARAMETERS############

####################
#Line properties
####################

#Line colors
m<-255
colors <- c(
	"red",
	"blue",
#	rgb(200,200,0,maxColorValue=m),
	rgb(0,200,0,maxColorValue=m)
#	rgb(80,80,80,maxColorValue=m)
#	rgb(0,215,215,maxColorValue=m)
)
#Error colors for shaded regions
error.shaded.colors<-c(
	rgb(255,215,215,maxColorValue=m),
	rgb(215,215,255,maxColorValue=m),
#	rgb(255,255,185,maxColorValue=m),
	rgb(200,255,200,maxColorValue=m)
#	rgb(215,215,215,maxColorValue=m),
#	rgb(200,255,255,maxColorValue=m)
)
#Error colors for lines around shaded regions
error.shaded.line.colors<-c(
	rgb(255,190,190,maxColorValue=m),
	rgb(190,190,255,maxColorValue=m),
#	rgb(255,255,160,maxColorValue=m),
	rgb(190,255,190,maxColorValue=m)
#	rgb(215,215,215,maxColorValue=m),
#	rgb(190,255,255,maxColorValue=m)
)

width <-1.25
error.width<-0.5
#error.lines.lty<-"solid"
error.lines.lty<-"solid" #"solid"

####################
#Plot titles
####################

title.p1<-"05455500"
title.p2<-"01643000"
title.p3<-"08172000"
title.p4<-"03179000"
title.p5<-"03451500"
title.p6<-"07378500"
title.p7<-"08167500"
title.p8<-"01608500"
title.p9<-"03364000"

ARE_PROBS<-TRUE  #Is true for probability plotting on a log10(p/1-p) scale
x.title<-"Climatological exceedence probability"
if(ARE_PROBS) {
	x.title<-expression(paste("Climatological exceedence probability (", Logit[e], " axis labelled with probability)", sep = ""))
}
y.title<-"Brier Skill Score"

####################
#Axes
####################

yMin.r1<--1.0
yMax.r1<-1.0
yaxis.r1<-seq(yMin.r1,yMax.r1,0.2)

yMin.r2<--1.0
yMax.r2<-1.0
yaxis.r2<-seq(yMin.r2,yMax.r2,0.2)

yMin.r3<--1.0
yMax.r3<-1.0
yaxis.r3<-seq(yMin.r3,yMax.r3,0.2)

xMin<-0.01
xMax<-probMax
pMax<-1.0 #Proportion that controls position of x-axis extent

#label.pos.x<-0.9
#label.pos.y<-0.935
label.pos.x<-0.075
label.pos.y<--0.75
label.pos<-1

#Common X-axis values
xa<-vector("list")
xa[[1]]=p1.cor.data$events.probs[p1.cor.data$events.probs<=probMax]
xa[[2]]=p2.cor.data$events.probs[p2.cor.data$events.probs<=probMax]
xa[[3]]=p3.cor.data$events.probs[p3.cor.data$events.probs<=probMax]
xa[[4]]=p4.cor.data$events.probs[p4.cor.data$events.probs<=probMax]
xa[[5]]=p5.cor.data$events.probs[p5.cor.data$events.probs<=probMax]
xa[[6]]=p6.cor.data$events.probs[p6.cor.data$events.probs<=probMax]
xa[[7]]=p7.cor.data$events.probs[p7.cor.data$events.probs<=probMax]
xa[[8]]=p8.cor.data$events.probs[p8.cor.data$events.probs<=probMax]
xa[[9]]=p9.cor.data$events.probs[p9.cor.data$events.probs<=probMax]

#Replace zero probability with a small value for log plotting purposes
fin<-function(input) {
	d<-input
	d[input==0]<-probMin
	d		
}
xa<-lapply(xa,fin)

#Axis values
x.labs<-xa[[1]]
xaxis<-xa[[1]]
func<-function(input) {
	d<-input
	d<-log((d)/(1.0-d))
	d
}
if(ARE_PROBS) {	
	xa<-lapply(xa,func)
	a<-unlist(xa)
	xMax<-func(probMax)
	#Custom axis
	xaxis<-c(xMin,0.1,0.5,0.9,0.99,0.999)
	xaxis<-func(xaxis)
	label.pos.x<-func(label.pos.x)
	flood.probs<-func(flood.probs)
	xMin<-func(xMin)
	x.labs<-c("1","0.9","0.5","0.1","0.01","0.001")
}

####################
#CIs
####################

#Is true to plot confidence intervals
plot_CIs<-TRUE
plotBars<-FALSE #Is true for bars, false for lines
plotRegions<-TRUE #Is true to plot regions, otherwise lines (if not bars)

####################
#Legend
####################

#Legend items
items<-c("Raw","CBP-ICK")
legend.position<-"bottomright"  #Legend position in first plot

####################
#Zero line
####################

p1.zero<-TRUE
p2.zero<-TRUE
p3.zero<-TRUE
p4.zero<-TRUE
p5.zero<-TRUE
p6.zero<-TRUE
p7.zero<-TRUE
p8.zero<-TRUE
p9.zero<-TRUE

################################################################################################
#  PLOTTING
################################################################################################

#Nine plot frame
close.screen(all.screens=TRUE)
split.screen(c(3,3))
par(cex=0.6)

##ADD FIRST PLOT
screen(1)
par(mar=c(2.5, 4.5, 2.5, 0.5) - 0.4)

x<-xa[[1]]
y<-p1.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r1,yMax.r1),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p1.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p1.data[[plot.me[i]]], ui=p1.high[[plot.me[i]]], 
				li=p1.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], barcol=colors[plot.me[i]], pt.bg = par("bg"), 
				sfrac = 0.01, gap=0, lwd=error.width,lty="solid",labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p1.low[[plot.me[i]]]
			y.high<-p1.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p1.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p1.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p1.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p1.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p1.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}

#Zero line
if(p1.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[1],flood.probs[1]),c(yMin.r1,yMax.r1),type="l",col=quant.col,lwd=width,lty=line.type)

axis(side="1",at=xaxis,cex.axis=1.0,labels=x.labs)
axis(side="2",at=yaxis.r1,labels=yaxis.r1,cex.axis=1.0)

#Legend
legend(legend.position,inset=c(0.00,0.00),items[plot.me],col=colors[plot.me],lwd=c(width,width),cex=1.2,bty="n")
text(label.pos.x,label.pos.y,title.p1,cex=1.2,font=1,pos=label.pos)

#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r1,yMin.r1),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r1,yMax.r1),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r1,yMax.r1),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r1,yMax.r1),col="black",xaxs="r",lwd=1)	

##ADD SECOND PLOT
screen(2)
par(cex=0.6)
par(mar=c(2.5, 3.5, 2.5, 1.5) - 0.4)
x<-xa[[2]]
y<-p2.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r1,yMax.r1),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p2.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p2.data[[plot.me[i]]], ui=p2.high[[plot.me[i]]], li=p2.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p2.low[[plot.me[i]]]
			y.high<-p2.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p2.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p2.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p2.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p2.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p2.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,cex.axis=1.0,labels=x.labs)
axis(side="2",at=yaxis.r1,cex.axis=1.0,labels=yaxis.r1)
text(label.pos.x,label.pos.y,title.p2,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p2.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[2],flood.probs[2]),c(yMin.r1,yMax.r1),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r1,yMin.r1),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r1,yMax.r1),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r1,yMax.r1),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r1,yMax.r1),col="black",xaxs="r",lwd=1)	

##ADD THIRD PLOT
screen(3)
par(cex=0.6)
par(mar=c(2.5, 2.5, 2.5, 2.5) - 0.4)
x<-xa[[3]]
y<-p3.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r1,yMax.r1),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p3.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p3.data[[plot.me[i]]], ui=p3.high[[plot.me[i]]], li=p3.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p3.low[[plot.me[i]]]
			y.high<-p3.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p3.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p3.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p3.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p3.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p3.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,cex.axis=1.0,labels=x.labs)
axis(side="2",at=yaxis.r1,cex.axis=1.0,labels=yaxis.r1)
text(label.pos.x,label.pos.y,title.p3,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p3.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[3],flood.probs[3]),c(yMin.r1,yMax.r1),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r1,yMin.r1),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r1,yMax.r1),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r1,yMax.r1),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r1,yMax.r1),col="black",xaxs="r",lwd=1)	

##ADD FOURTH PLOT
screen(4)
par(cex=0.6)
par(mar=c(3.6, 4.5, 1.4, 0.5) - 0.4)
x<-xa[[4]]
y<-p4.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r2,yMax.r2),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p4.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p4.data[[plot.me[i]]], ui=p4.high[[plot.me[i]]], li=p4.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p4.low[[plot.me[i]]]
			y.high<-p4.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p4.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p4.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p4.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p4.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p4.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,cex.axis=1.0,labels=x.labs)
axis(side="2",at=yaxis.r2,labels=yaxis.r2,cex.axis=1.0)
text(label.pos.x,label.pos.y,title.p4,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p4.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[4],flood.probs[4]),c(yMin.r2,yMax.r2),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r2,yMin.r2),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r2,yMax.r2),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r2,yMax.r2),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r2,yMax.r2),col="black",xaxs="r",lwd=1)	

##ADD FIFTH PLOT
screen(5)
par(cex=0.6)
par(mar=c(3.6, 3.5, 1.4, 1.5) - 0.4)
x<-xa[[5]]
y<-p5.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r2,yMax.r2),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p5.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p5.data[[plot.me[i]]], ui=p5.high[[plot.me[i]]], li=p5.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p5.low[[plot.me[i]]]
			y.high<-p5.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p5.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p5.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p5.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p5.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p5.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,cex.axis=1.0,labels=x.labs)
axis(side="2",at=yaxis.r2,cex.axis=1.0,labels=yaxis.r2)
text(label.pos.x,label.pos.y,title.p5,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p5.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[5],flood.probs[5]),c(yMin.r2,yMax.r2),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r2,yMin.r2),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r2,yMax.r2),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r2,yMax.r2),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r2,yMax.r2),col="black",xaxs="r",lwd=1)	

##ADD SIXTH PLOT
screen(6)
par(cex=0.6)
par(mar=c(3.6, 2.5, 1.4, 2.5) - 0.4)
x<-xa[[6]]
y<-p6.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r2,yMax.r2),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p6.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p6.data[[plot.me[i]]], ui=p6.high[[plot.me[i]]], li=p6.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p6.low[[plot.me[i]]]
			y.high<-p6.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p6.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p6.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p6.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p6.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p6.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,cex.axis=1.0,labels=x.labs)
axis(side="2",at=yaxis.r2,cex.axis=1.0,labels=yaxis.r2)
text(label.pos.x,label.pos.y,title.p6,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p6.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[6],flood.probs[6]),c(yMin.r2,yMax.r2),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r2,yMin.r2),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r2,yMax.r2),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r2,yMax.r2),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r2,yMax.r2),col="black",xaxs="r",lwd=1)	

##ADD SEVENTH PLOT
screen(7)
par(cex=0.6)
par(mar=c(4.6, 4.5, 0.4, 0.5) - 0.4)
x<-xa[[7]]
y<-p7.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r3,yMax.r3),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p7.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p7.data[[plot.me[i]]], ui=p7.high[[plot.me[i]]], li=p7.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p7.low[[plot.me[i]]]
			y.high<-p7.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p7.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p7.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p7.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p7.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p7.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,labels=x.labs,cex.axis=1.0)
axis(side="2",at=yaxis.r3,labels=yaxis.r3,cex.axis=1.0)
text(label.pos.x,label.pos.y,title.p7,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p7.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[7],flood.probs[7]),c(yMin.r3,yMax.r3),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r3,yMin.r3),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r3,yMax.r3),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r3,yMax.r3),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r3,yMax.r3),col="black",xaxs="r",lwd=1)	

##ADD EIGHTH PLOT
screen(8)
par(cex=0.6)
par(mar=c(4.6, 3.5, 0.4, 1.5) - 0.4)
x<-xa[[8]]
y<-p8.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r3,yMax.r3),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p8.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p8.data[[plot.me[i]]], ui=p8.high[[plot.me[i]]], li=p8.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p8.low[[plot.me[i]]]
			y.high<-p8.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p8.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p8.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p8.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p8.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p8.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,labels=x.labs,cex.axis=1.0)
axis(side="2",at=yaxis.r3,cex.axis=1.0,labels=yaxis.r3)
text(label.pos.x,label.pos.y,title.p8,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p8.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[8],flood.probs[8]),c(yMin.r3,yMax.r3),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r3,yMin.r3),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r3,yMax.r3),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r3,yMax.r3),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r3,yMax.r3),col="black",xaxs="r",lwd=1)	

##ADD NINTH PLOT
screen(9)
par(cex=0.6)
par(mar=c(4.6, 2.5, 0.4, 2.5) - 0.4)
x<-xa[[9]]
y<-p9.data[[plot.me[1]]]
plot(x,y,xaxt="n",yaxt="n",col=colors[plot.me[1]],xlab="",ylab="",
	xlim=c(xMin,xMax),ylim=c(yMin.r3,yMax.r3),type="l",lwd=width,xaxs="r",
      yaxs="i")
#Plot additional lines
for(i in 2:length(plot.me)) {
	lines(x,p9.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)	
}
#Plot CIs
if(plot_CIs) {
	if(plotBars) {	
		for(i in 1:length(plot.me)) {
			plotCI(x = x, y = p9.data[[plot.me[i]]], ui=p9.high[[plot.me[i]]], li=p9.low[[plot.me[i]]], type="n",  col=colors[plot.me[i]], 
				barcol=colors[plot.me[i]], pt.bg = par("bg"), sfrac = 0.01, gap=0, lwd=error.width,lty="solid", 
				labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1:length(plot.me)) {
			x.co<-x
			y.low<-p9.low[[plot.me[i]]]
			y.high<-p9.high[[plot.me[i]]]
			ind<-!is.na(x.co)&!is.na(y.low)&!is.na(y.high)				
			x.co<-x.co[ind]
			y.low<-y.low[ind]
			y.high<-y.high[ind]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in 1:length(plot.me)) {
			lines(x,p9.data[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=width)
			lines(x,p9.low[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p9.high[[plot.me[i]]],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in 1:length(plot.me)) {
			lines(x,p9.low[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(x,p9.high[[plot.me[i]]],type="l",col=colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	}
}
axis(side="1",at=xaxis,labels=x.labs,cex.axis=1.0)
axis(side="2",at=yaxis.r3,cex.axis=1.0,labels=yaxis.r3)
text(label.pos.x,label.pos.y,title.p9,cex=1.2,font=1,pos=label.pos)
#Zero line
if(p9.zero) {
	lines(c(xMin,xMax),c(0,0),col="black",xaxs="r")	
}
#Flood threshold
lines(c(flood.probs[9],flood.probs[9]),c(yMin.r3,yMax.r3),type="l",col=quant.col,lwd=width,lty=line.type)
#Replot chart boundaries in case of overlap
lines(c(xMin,xMax),c(yMin.r3,yMin.r3),col="black",xaxs="r",lwd=1)
lines(c(xMin,xMax),c(yMax.r3,yMax.r3),col="black",xaxs="r",lwd=1)
#lines(c(xMin,xMin),c(yMin.r3,yMax.r3),col="black",xaxs="r",lwd=1)	
#lines(c(xMax,xMax),c(yMin.r3,yMax.r3),col="black",xaxs="r",lwd=1)	

##Add overall axis titles
mtext(x.title, side = 1, line=-1.2, outer=TRUE,cex=0.95)
mtext(y.title, side = 2, line=-1.25, outer=TRUE,cex=0.95)

#Device off
if(postscript==TRUE) {
	dev.off()
}
