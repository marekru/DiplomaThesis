default: pdf

main.dvi: *.tex *.bib komlogo-new.eps Makefile
	rm -f *.toc
	cslatex main
	bibtex main
	cslatex main
	cslatex main

main.ps: main.dvi
	dvips main.dvi

main.pdf: *.tex *.bib komlogo-new.pdf Makefile
	rm -f *.toc
	pdfcslatex main
	bibtex main
	pdfcslatex main
	pdfcslatex main

dvi: main.dvi

ps: main.ps

pdf: main.pdf

all: ps pdf

clean: 
	rm -f *.{log,aux,toc,bbl,blg,slo,srs}

dist-clean:
	rm -f *.{log,aux,dvi,toc,bbl,blg,slo,srs} main.ps main.pdf

booklet: main.ps
	cat main.ps | psbook | psnup -2 >main-booklet.ps

