library(XML)
library(gplots)

##########IMPORT DATA##############

####READ IN DATA FOR FOUR PLOTS

#XML output from EVS containing the reliability data
#This example plots two scenarios for two locations, namely before and after bias-correction. 
#The locations are in the rows and the scenarios are in the columns 

#Top-level directory TO EDIT
root<-""
#Data directory constructed from root directory (should not need to modify)
data<-paste(root,"/nonsrc/rscripts/example_scripts/example_evs_out/",sep="")

loc.a<-"05455500"
loc.b<-"07378500"
loc.a.events<-c(5,6,8,10)
loc.b.events<-c(5,6,8,9)
loc.a.raw<-paste(data,paste(loc.a,"_raw.Reliability_diagram.xml",sep=""),sep="")
loc.a.cor<-paste(data,paste(loc.a,"_corrected.Reliability_diagram.xml",sep=""),sep="")
loc.b.raw<-paste(data,paste(loc.b,"_raw.Reliability_diagram.xml",sep=""),sep="")
loc.b.cor<-paste(data,paste(loc.b,"_corrected.Reliability_diagram.xml",sep=""),sep="")

####################
#Output
####################

#Not needed to display only
outfile<-""

#True to write, false to display
postscript<-FALSE
if(postscript==TRUE) {
	ps.options(horizontal=FALSE,onefile=FALSE,paper="a4")
	postscript(outfile,height=7,width=7,pagecentre=TRUE)
}

loc.a.raw.rel<-readEVSDiagrams(loc.a.raw,3)
loc.a.cor.rel<-readEVSDiagrams(loc.a.cor,3)
loc.b.raw.rel<-readEVSDiagrams(loc.b.raw,3)
loc.b.cor.rel<-readEVSDiagrams(loc.b.cor,3)

#Indices of events to display
p1.events<-loc.a.events
p2.events<-loc.a.events  
p3.events<-loc.b.events 
p4.events<-loc.b.events 

events<-c("0.25","0.1","0.01","0.005")

#Index of time to use
time<-1

#Plot 1
p1.data<-vector("list")
p1.low<-vector("list")
p1.high<-vector("list")
p1.sample<-vector("list")
for(i in 1: length(p1.events)) {
	next.time<-loc.a.raw.rel$diagram.data[[time]]
	next.event<-next.time[p1.events[i]]
	next.data<-next.event[[1]]
	next.vals<-matrix(nrow=2,ncol=ncol(next.data))
	next.low<-matrix(nrow=2,ncol=ncol(next.data))
	next.high<-matrix(nrow=2,ncol=ncol(next.data))	
	next.sample<-matrix(nrow=2,ncol=ncol(next.data))	
	next.vals[1,]<-next.data[1,]
	next.vals[2,]<-next.data[4,]
	next.low[1,]<-next.data[1,]
	next.low[2,]<-next.data[5,]
	next.high[1,]<-next.data[1,]
	next.high[2,]<-next.data[6,]
	next.sample[1,]<-next.data[1,]
	next.sample[2,]<-next.data[7,]	
	p1.data[[i]]<-next.vals
	p1.low[[i]]<-next.low
	p1.high[[i]]<-next.high
	p1.sample[[i]]<-next.sample
}

#Plot 2
p2.data<-vector("list")
p2.low<-vector("list")
p2.high<-vector("list")
p2.sample<-vector("list")
for(i in 1: length(p2.events)) {
	next.time<-loc.a.cor.rel$diagram.data[[time]]
	next.event<-next.time[p2.events[i]]
	next.data<-next.event[[1]]
	next.vals<-matrix(nrow=2,ncol=ncol(next.data))
	next.low<-matrix(nrow=2,ncol=ncol(next.data))
	next.high<-matrix(nrow=2,ncol=ncol(next.data))	
	next.sample<-matrix(nrow=2,ncol=ncol(next.data))	
	next.vals[1,]<-next.data[1,]
	next.vals[2,]<-next.data[4,]
	next.low[1,]<-next.data[1,]
	next.low[2,]<-next.data[5,]
	next.high[1,]<-next.data[1,]
	next.high[2,]<-next.data[6,]
	next.sample[1,]<-next.data[1,]
	next.sample[2,]<-next.data[7,]	
	p2.data[[i]]<-next.vals
	p2.low[[i]]<-next.low
	p2.high[[i]]<-next.high
	p2.sample[[i]]<-next.sample
}

#Plot 3
p3.data<-vector("list")
p3.low<-vector("list")
p3.high<-vector("list")
p3.sample<-vector("list")
for(i in 1: length(p3.events)) {
	next.time<-loc.b.raw.rel$diagram.data[[time]]
	next.event<-next.time[p3.events[i]]
	next.data<-next.event[[1]]
	next.vals<-matrix(nrow=2,ncol=ncol(next.data))
	next.low<-matrix(nrow=2,ncol=ncol(next.data))
	next.high<-matrix(nrow=2,ncol=ncol(next.data))	
	next.sample<-matrix(nrow=2,ncol=ncol(next.data))	
	next.vals[1,]<-next.data[1,]
	next.vals[2,]<-next.data[4,]
	next.low[1,]<-next.data[1,]
	next.low[2,]<-next.data[5,]
	next.high[1,]<-next.data[1,]
	next.high[2,]<-next.data[6,]
	next.sample[1,]<-next.data[1,]
	next.sample[2,]<-next.data[7,]	
	p3.data[[i]]<-next.vals
	p3.low[[i]]<-next.low
	p3.high[[i]]<-next.high
	p3.sample[[i]]<-next.sample
}

#Plot 4
p4.data<-vector("list")
p4.low<-vector("list")
p4.high<-vector("list")
p4.sample<-vector("list")
for(i in 1: length(p4.events)) {
	next.time<-loc.b.cor.rel$diagram.data[[time]]
	next.event<-next.time[p4.events[i]]
	next.data<-next.event[[1]]
	next.vals<-matrix(nrow=2,ncol=ncol(next.data))
	next.low<-matrix(nrow=2,ncol=ncol(next.data))
	next.high<-matrix(nrow=2,ncol=ncol(next.data))	
	next.sample<-matrix(nrow=2,ncol=ncol(next.data))	
	next.vals[1,]<-next.data[1,]
	next.vals[2,]<-next.data[4,]
	next.low[1,]<-next.data[1,]
	next.low[2,]<-next.data[5,]
	next.high[1,]<-next.data[1,]
	next.high[2,]<-next.data[6,]
	next.sample[1,]<-next.data[1,]
	next.sample[2,]<-next.data[7,]	
	p4.data[[i]]<-next.vals
	p4.low[[i]]<-next.low
	p4.high[[i]]<-next.high
	p4.sample[[i]]<-next.sample
}

#########PLOT PARAMETERS############

####################
#Line properties
####################

#Line colors
m<-255
colors <- c(
	"red",
	"blue",
	rgb(200,200,0,maxColorValue=m),
	rgb(0,200,0,maxColorValue=m)
#	rgb(80,80,80,maxColorValue=m)
#	rgb(0,215,215,maxColorValue=m)
)
#Error colors for shaded regions
error.shaded.colors<-c(
	rgb(255,215,215,maxColorValue=m),
	rgb(215,215,255,maxColorValue=m),
	rgb(255,255,185,maxColorValue=m),
	rgb(200,255,200,maxColorValue=m)
#	rgb(215,215,215,maxColorValue=m),
#	rgb(200,255,255,maxColorValue=m)
)
#Error colors for lines around shaded regions
error.shaded.line.colors<-c(
	rgb(255,190,190,maxColorValue=m),
	rgb(190,190,255,maxColorValue=m),
	rgb(255,255,160,maxColorValue=m),
	rgb(190,255,190,maxColorValue=m)
#	rgb(215,215,215,maxColorValue=m),
#	rgb(190,255,255,maxColorValue=m)
)

line.width<-2
error.width<-1.0
#error.lines.lty<-"solid"
error.lines.lty<-"solid"
line.type<-"l"
label.pos<-1
label.pos.x<-0.5
label.pos.y<-0.082

#Min, max and freq. of sample y-axis in log space
sample.ymin<-4
sample.ymax<-12
sample.freq<-2 

#Legend position
legend.pos = "topright"
show_all<-FALSE  #False to show legend in first plot only

####################
#Plot titles
####################

p1.title<-paste(paste("a. ",loc.a,sep=""),": raw",sep="")
p2.title<-paste(paste("b. ",loc.a,sep=""),": CBP-ICK",sep="")
p3.title<-paste(paste("c. ",loc.b,sep=""),": raw",sep="")
p4.title<-paste(paste("d. ",loc.b,sep=""),": CBP-ICK",sep="")

####################
#CIs
####################

#Is true to plot confidence intervals
plotCIs<-TRUE
plotBars<-TRUE #Is true for bars, false for lines
plotRegions<-FALSE #Is true to plot regions, otherwise lines (if not bars)

###############PLOT################

#par(mfrow=c(2,2))  #Four plot frame
close.screen(all.screens=TRUE)
split.screen(c(2,2))
par(cex=0.6)
range<-range(0:1)

##ADD FIRST PLOT
screen(1)
par(mar=c(3.5, 5.0, 2, 0.4) + 0.0)
plot1<-plot(p1.data[[1]][1,],p1.data[[1]][2,],xlim=range,ylim=range,col=colors[1],
    xlab="",ylab="",type="l",xaxs="i"
    ,yaxs="i",lwd=line.width,cex.axis=1.2)
for(i in 2:length(p1.events)) {
	lines(p1.data[[i]][1,],p1.data[[i]][2,],type="l",col=colors[i],lwd=line.width)
}
#Add 1:1 line
lines(c(0.0,1.0),c(0.0,1.0),type="l",lwd=2)
dat<-expression(paste("", Log, "(n)", sep = ""))
text(0.27,0.91,dat,cex=1.1,font=1)

#Plot CIs
if(plotCIs) {
	if(plotBars) {	
		for(i in length(p1.events):1) {
			plotCI(x = p1.data[[i]][1,], y = p1.data[[i]][2,], ui=p1.high[[i]][2,], 
				li=p1.low[[i]][2,], type="n",  col=colors[i], barcol=colors[i], pt.bg = par("bg"), 
				sfrac = 0.01, gap=0, lwd=error.width,lty="solid",labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in length(p1.events):1) {
			x.co<-p1.data[[i]][1,]
			y.low<-p1.low[[i]][2,]
			y.high<-p1.high[[i]][2,]
			x.co<-x.co[!is.na(y.low)]
			y.low<-y.low[!is.na(y.low)]
			y.high<-y.high[!is.na(y.high)]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in length(p1.events):1) {
			lines(p1.data[[i]][1,],p1.data[[i]][2,],type=line.type,col=colors[i],lwd=line.width)
			lines(p1.data[[i]][1,],p1.low[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(p1.data[[i]][1,],p1.high[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in length(p1.events):1) {
			lines(p1.areas,p1.low[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
			lines(p1.areas,p1.high[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
		}	
	}
}

#Add plot label
text(label.pos.x,label.pos.y,p1.title,cex=1.2,font=1,pos=label.pos)
#Add legend
legend("bottomright",inset=c(0.025,0.025),events,col=colors,
     lwd=c(2,2,2,2,2),cex=1.1,bty="n")

#Re-plot axes
lines(c(0.0,0.0),c(0.0,1.0),type="l",lwd=1)
lines(c(0.0,1.0),c(1.0,1.0),type="l",lwd=1)
lines(c(1.0,1.0),c(0.0,1.0),type="l",lwd=1)
lines(c(1.0,0.0),c(0.0,0.0),type="l",lwd=1)

#SAMPLE SIZE PLOT
par(fig=c(0.045, 0.265, 0.765, 0.985),new=T)
prob<-seq(1:10)
prob=prob/10
plot(p1.sample[[1]][1,],log(p1.sample[[1]][2,]),col=colors[1],xlim=c(0,1),ylim=c(sample.ymin,sample.ymax),
    xlab="",ylab="",type="l",xaxs="i",yaxs="i",lwd=2,cex.axis=0.8,xaxt="n",yaxt="n")
for(i in 2:length(p1.events)) {
	lines(p1.sample[[i]][1,],log(p1.sample[[i]][2,]),type="l",col=colors[i],lwd=line.width)
}
axis(side="1",seq(0,1,0.25),cex.axis=0.9)
axis(side="2",seq(sample.ymin,sample.ymax,sample.freq),cex.axis=0.9)
par(new=F)


##ADD SECOND PLOT
screen(2)
par(cex=0.6)
par(mar=c(3.5, 3.6, 2, 1.8) + 0.0)
plot2<-plot(p2.data[[1]][1,],p2.data[[1]][2,],xlim=range,ylim=range,col=colors[1],
    xlab="",ylab="",type="l",xaxs="i"
    ,yaxs="i",lwd=line.width,cex.axis=1.2)
for(i in 2:length(p2.events)) {
	lines(p2.data[[i]][1,],p2.data[[i]][2,],type="l",col=colors[i],lwd=line.width)
}
#Add 1:1 line
lines(c(0.0,1.0),c(0.0,1.0),type="l",lwd=2)
dat<-expression(paste("", Log, "(n)", sep = ""))
text(0.27,0.91,dat,cex=1.1,font=1)

#Plot CIs
if(plotCIs) {
	if(plotBars) {	
		for(i in length(p2.events):1) {
			plotCI(x = p2.data[[i]][1,], y = p2.data[[i]][2,], ui=p2.high[[i]][2,], 
				li=p2.low[[i]][2,], type="n",  col=colors[i], barcol=colors[i], pt.bg = par("bg"), 
				sfrac = 0.01, gap=0, lwd=error.width,lty="solid",labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in length(p2.events):1) {
			x.co<-p2.data[[i]][1,]
			y.low<-p2.low[[i]][2,]
			y.high<-p2.high[[i]][2,]
			x.co<-x.co[!is.na(y.low)]
			y.low<-y.low[!is.na(y.low)]
			y.high<-y.high[!is.na(y.high)]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in length(p2.events):1) {
			lines(p2.data[[i]][1,],p2.data[[i]][2,],type=line.type,col=colors[i],lwd=line.width)
			lines(p2.data[[i]][1,],p2.low[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(p2.data[[i]][1,],p2.high[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in length(p2.events):1) {
			lines(p2.areas,p2.low[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
			lines(p2.areas,p2.high[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
		}	
	}
}

#Add plot label
text(label.pos.x,label.pos.y,p2.title,cex=1.2,font=1,pos=label.pos)
#Add legend
#legend("bottomright",inset=c(0.025,0.025),events,col=colors,
#     lwd=c(2,2,2,2,2),cex=1.1,bty="n")

#Re-plot axes
lines(c(0.0,0.0),c(0.0,1.0),type="l",lwd=1)
lines(c(0.0,1.0),c(1.0,1.0),type="l",lwd=1)
lines(c(1.0,1.0),c(0.0,1.0),type="l",lwd=1)
lines(c(1.0,0.0),c(0.0,0.0),type="l",lwd=1)

#SAMPLE SIZE PLOT
par(fig=c(0.545, 0.765, 0.765, 0.985),new=T)
plot(p2.sample[[1]][1,],log(p2.sample[[1]][2,]),col=colors[1],xlim=c(0,1),ylim=c(sample.ymin,sample.ymax),
    xlab="",ylab="",type="l",xaxs="i",yaxs="i",lwd=2,cex.axis=0.8,xaxt="n",yaxt="n")
for(i in 2:length(p2.events)) {
	lines(p2.sample[[i]][1,],log(p2.sample[[i]][2,]),type="l",col=colors[i],lwd=line.width)
}
axis(side="1",seq(0,1,0.25),cex.axis=0.9)
axis(side="2",seq(sample.ymin,sample.ymax,sample.freq),cex.axis=0.9)
par(new=F)

##ADD THIRD PLOT
screen(3)
par(cex=0.6)
par(mar=c(5.0, 5.0, 0.5, 0.4) + 0.0)
plot3<-plot(p3.data[[1]][1,],p3.data[[1]][2,],xlim=range,ylim=range,col=colors[1],
    xlab="",ylab="",type="l",xaxs="i"
    ,yaxs="i",lwd=line.width,cex.axis=1.2)
for(i in 2:length(p3.events)) {
	lines(p3.data[[i]][1,],p3.data[[i]][2,],type="l",col=colors[i],lwd=line.width)
}
#Add 1:1 line
lines(c(0.0,1.0),c(0.0,1.0),type="l",lwd=2)
dat<-expression(paste("", Log, "(n)", sep = ""))
text(0.27,0.91,dat,cex=1.1,font=1)

#Plot CIs
if(plotCIs) {
	if(plotBars) {	
		for(i in length(p3.events):1) {
			plotCI(x = p3.data[[i]][1,], y = p3.data[[i]][2,], ui=p3.high[[i]][2,], 
				li=p3.low[[i]][2,], type="n",  col=colors[i], barcol=colors[i], pt.bg = par("bg"), 
				sfrac = 0.01, gap=0, lwd=error.width,lty="solid",labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in 1: length(p3.events)) {
			x.co<-p3.data[[i]][1,]
			y.low<-p3.low[[i]][2,]
			y.high<-p3.high[[i]][2,]
			x.co<-x.co[!is.na(y.low)]
			y.low<-y.low[!is.na(y.low)]
			y.high<-y.high[!is.na(y.high)]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in length(p3.events):1) {
			lines(p3.data[[i]][1,],p3.data[[i]][2,],type=line.type,col=colors[i],lwd=line.width)
			lines(p3.data[[i]][1,],p3.low[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(p3.data[[i]][1,],p3.high[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in length(p3.events):1) {
			lines(p3.areas,p3.low[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
			lines(p3.areas,p3.high[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
		}	
	}
}

#Add plot label
text(label.pos.x,label.pos.y,p3.title,cex=1.2,font=1,pos=label.pos)
#Add legend
#legend("bottomright",inset=c(0.025,0.025),events,col=colors,
#     lwd=c(2,2,2,2,2),cex=1.1,bty="n")

#Re-plot axes
lines(c(0.0,0.0),c(0.0,1.0),type="l",lwd=1)
lines(c(0.0,1.0),c(1.0,1.0),type="l",lwd=1)
lines(c(1.0,1.0),c(0.0,1.0),type="l",lwd=1)
lines(c(1.0,0.0),c(0.0,0.0),type="l",lwd=1)

#SAMPLE SIZE PLOT
par(fig=c(0.045, 0.265, 0.265, 0.485),new=T)
plot(p3.sample[[1]][1,],log(p3.sample[[1]][2,]),col=colors[1],xlim=c(0,1),ylim=c(sample.ymin,sample.ymax),
    xlab="",ylab="",type="l",xaxs="i",yaxs="i",lwd=2,cex.axis=0.8,xaxt="n",yaxt="n")
for(i in 2:length(p3.events)) {
	lines(p3.sample[[i]][1,],log(p3.sample[[i]][2,]),type="l",col=colors[i],lwd=line.width)
}
axis(side="1",seq(0,1,0.25),cex.axis=0.9)
axis(side="2",seq(sample.ymin,sample.ymax,sample.freq),cex.axis=0.9)
par(new=F)

##ADD FOURTH PLOT
screen(4)
par(cex=0.6)
par(mar=c(5.0, 3.6, 0.5, 1.8) + 0.0)
plot4<-plot(p4.data[[1]][1,],p4.data[[1]][2,],xlim=range,ylim=range,col=colors[1],
    xlab="",ylab="",type="l",xaxs="i"
    ,yaxs="i",lwd=line.width,cex.axis=1.2)
for(i in 2:length(p4.events)) {
	lines(p4.data[[i]][1,],p4.data[[i]][2,],type="l",col=colors[i],lwd=line.width)
}
#Add 1:1 line
lines(c(0.0,1.0),c(0.0,1.0),type="l",lwd=2)
dat<-expression(paste("", Log, "(n)", sep = ""))
text(0.27,0.91,dat,cex=1.1,font=1)

#Plot CIs
if(plotCIs) {
	if(plotBars) {	
		for(i in length(p4.events):1) {
			plotCI(x = p4.data[[i]][1,], y = p4.data[[i]][2,], ui=p4.high[[i]][2,], 
				li=p4.low[[i]][2,], type="n",  col=colors[i], barcol=colors[i], pt.bg = par("bg"), 
				sfrac = 0.01, gap=0, lwd=error.width,lty="solid",labels=FALSE, add=TRUE)
		}
	} else if(plotRegions) {
		for(i in length(p4.events):1) {
			x.co<-p4.data[[i]][1,]
			y.low<-p4.low[[i]][2,]
			y.high<-p4.high[[i]][2,]
			x.co<-x.co[!is.na(y.low)]
			y.low<-y.low[!is.na(y.low)]
			y.high<-y.high[!is.na(y.high)]
			# Create a 'loop' around the x values. Add values to 'close' the loop
			x.vec <- c(x.co, tail(x.co, 1), rev(x.co), x.co[1])
			# Same for y values
			y.vec <- c(y.low, tail(y.high, 1), rev(y.high), y.low[1])
			polygon(x.vec,y.vec,col=error.shaded.colors[plot.me[i]],border=NA)
		}
		#Replot lines
		for(i in length(p4.events):1) {
			lines(p4.data[[i]][1,],p4.data[[i]][2,],type=line.type,col=colors[i],lwd=line.width)
			lines(p4.data[[i]][1,],p4.low[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
			lines(p4.data[[i]][1,],p4.high[[i]][2,],type="l",col=error.shaded.line.colors[plot.me[i]],lwd=error.width,lty=error.lines.lty)
		}	
	} else {
		for(i in length(p4.events):1) {
			lines(p4.areas,p4.low[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
			lines(p4.areas,p4.high[[i]],type="l",col=colors[i],lwd=error.width,lty=error.lines.lty)
		}	
	}
}

#Add plot label
text(label.pos.x,label.pos.y,p4.title,cex=1.2,font=1,pos=label.pos)
#Add legend
#legend("bottomright",inset=c(0.025,0.025),events,col=colors,
#     lwd=c(2,2,2,2,2),cex=1.1,bty="n")

#Re-plot axes
lines(c(0.0,0.0),c(0.0,1.0),type="l",lwd=1)
lines(c(0.0,1.0),c(1.0,1.0),type="l",lwd=1)
lines(c(1.0,1.0),c(0.0,1.0),type="l",lwd=1)
lines(c(1.0,0.0),c(0.0,0.0),type="l",lwd=1)

#SAMPLE SIZE PLOT
par(fig=c(0.545, 0.765, 0.265, 0.485),new=T)
plot(p4.sample[[1]][1,],log(p4.sample[[1]][2,]),col=colors[1],xlim=c(0,1),ylim=c(sample.ymin,sample.ymax),
    xlab="",ylab="",type="l",xaxs="i",yaxs="i",lwd=2,cex.axis=0.8,xaxt="n",yaxt="n")
for(i in 2:length(p4.events)) {
	lines(p4.sample[[i]][1,],log(p4.sample[[i]][2,]),type="l",col=colors[i],lwd=line.width)
}
axis(side="1",seq(0,1,0.25),cex.axis=0.9)
axis(side="2",seq(sample.ymin,sample.ymax,sample.freq),cex.axis=0.9)
par(new=F)

##Add overall axis titles
mtext("Forecast probability", side = 1, line=-1.5, outer=TRUE,cex=0.95)
mtext("Observed relative frequency", side = 2, line=-1.5, outer=TRUE,cex=0.95)

#Device off
if(postscript==TRUE) {
	dev.off()
}

close.screen(all.screens=TRUE)