Test data for the Ensemble Verification System (EVS) version 5.0

Provided by Hydrologic Solutions Limited

March 2013

****************************************************************
Overview

The test data comprise ~22 years of ensemble streamflow forecasts 
and corresponding observations from one forecast location. The 
forecasts and observations are daily mean streamflow values.
The forecast lead times range from 1 to 5 days. The files 
containing the observations and forecasts are briefly explained 
below, together with the example EVS project file that controls
the verification.

****************************************************************

Observation file:
EVS_flow_observations.obs  

File format: ASCII (see EVS User's Manual)
Column #1: forecast valid date and time in UTC (yyyymmddhh)
Column #2: observation (instantaneous flow, CMS)

****************************************************************

Forecast file:
EVS_flow_ensemble_forecasts.fcst 

Format file: ASCII (see EVS User's Manual)

Format description:
Column #1: forecast valid date and time in UTC (yyyymmddhh)
Column #2: forecast lead time in hours (up to 120 hours)
Column #3-102: ensemble member values (instantaneous flows, CMS) 

****************************************************************

EVS project file:
EVS_flow_test_project_file.evs

The EVS project file will run on the command line and output all
results into the output directory specified in the EVS project 
file. Alternatively, the project may be executed using the GUI 
(recommended to begin with). Consult the EVS User's Manual for 
details. 

If the EVS.jar is located in a directory above /Outputs and
at the same level as TEST_DATA, the project file can be executed 
without modification, as relative paths (relative to the EVS.jar) 
have been used in the test project file, EVS_flow_test_project_file.evs. 
Otherwise, change the following relative paths in the file
EVS_flow_test_project_file.evs to their corresponding absolute 
paths on the local file system (this can be done via a text 
editor or using the EVS GUI).

- the forecast file (line #10)
- the observation file (line #12) 
- the output directory (line #50)

END