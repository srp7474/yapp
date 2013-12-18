// yapp - Yet Another Param Parser for CLI program argv params

/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/

// Created: 16-Dec-2013



/*
 * This utility takes the oParms table and produces the oOpt settings for this run.
 *
 * If an error occurs it executes printHelp which a details what is expected.
 *
 * oParms consists of rows of 4 columns. Each column has the format:
 *
 *  0 - The oOpt name to set
 *  1 - Processing flag:
 *        'S' mandatory string value follows
 *        's' optional  string value follows
 *        'p' property value follows key or key= or key=value (1st 2 set key tp null)
 *        'b' boolean value to set true if present (nothing follows)
 *        'e' Environment variable value (nothing follows), col 2 has env variable name.
 *  2 - The commands line flag expected (case sensitive)
 *  3 - Help description. For e the first word is the environment variable
 *
 *  This was derived froms Parms.java, a small utility developed by
 *  Steve Pritchard  of Rexcel Systems Inc
 *
 */


var c    = console;
var u    = require("util");
var path = require("path");

var parms = {};

/* ------------------------ Sample Definitions ------------------
var oOpt = {
   sType     : 'default.type'
  ,sName     : 'default.name'
}

var oParms = [
 // 0            1     2          3
 // OptSw        Type  Parm       Help meaning
  ['bHelp'    ,  "b",  "-h"       ,"Generate this Help Information that you are now reading"  ]
 ,['sFile'    ,  "S",  "-file"    ,"Work Directory"                                           ]
 ...
 ,['bVerbose' ,  "b",  "-v"       ,"Verbose mode"                                             ]
 ,['bReplace' ,  "b",  "-r"       ,"Replace components. ***DANGEROUS***"                      ]
];
*/

exports.parse = function(oParms,oOpt) {
  if (!oParms)                    quit("oParms not supplied");
  if (!(u.isArray(oParms)))       quit("oParms is not an Array");
  if (oParms.length < 1)          quit("oParms has no rows");
  for(var i=0,iMax=oParms.length; i<iMax; i+=1) {
    var oP = oParms[i];
    if (!(u.isArray(oP))) quit("Row "+i+" not an Array");
    if (oP.length !== 4)  quit("Row "+i+" col count not 4");
    for(var j=0,jMax=oP.length; j<jMax; j+=1) {
      if (typeof oP[j] !== 'string') quit("oParms row="+i+" Col="+j+" not string but "+(typeof oP[j]));
    }
    if ("Ssbep".indexOf(oP[1]) < 0) quit("oParms row="+i+" type="+oP[1]+" not implemented");
    if (oP[1] != 'e') {
      if (oP[2].charAt(0) !== '-') quit("oParms row="+i+" parm="+oP[2]+" must start with '-'");
    }
  }
  if (!oOpt) oOpt = {};
  oOpt = parseArgs(process.argv,oParms,oOpt);
  return oOpt;
}

function quit(sMsg) {
  c.log(sMsg);
  process.exit(4);
}

function parseArgs(argv,oParms,oOpt) {
  var oMap = {"-h":{type:'b'}};
  for(var i=0,iMax=oParms.length; i<iMax; i+=1) {
    var oP = oParms[i];
    if (typeof oOpt[oP[0]] === 'undefined') { // assign default values
      if (oP[1] === 'p') {
        oOpt[oP[0]] = {};
      } else if (oP[1] === 'b') {
        oOpt[oP[0]] = false;
      } else if (oP[1] === 'e') {
        if ((!process.env[oP[2]]) && (!oOpt[oP[0]])) quit("env variable "+oP[2]+" has no value or default");
        oOpt[oP[0]] = process.env[oP[2]];
      } else {
        oOpt[oP[0]] = null;
      }
    }
    if (oMap[oP[2]]) {
      quit("Duplicate key "+oP[2]+" in oParms table");
    } else {
      oMap[oP[2]] = {type:oP[1],fld:oP[0]};
    }
  }
  var nLoop = 2;
  while(nLoop < argv.length) {
    var oM = oMap[argv[nLoop]];
    if ((!oM) || (oM.type === 'e')) return error(nLoop,"Not known "+argv[nLoop]);
    oM.bHad = true;
    switch(oM.type) {
      case 'S':
      case 's':
        if (nLoop+1 < argv.length) {
          nLoop += 1;
          oOpt[oM.fld] = argv[nLoop];
        } else {
          return error(nLoop,"argv exhausted for "+argv[nLoop]);
        }
        break;
      case 'p':
        if (nLoop+1 < argv.length) {
          nLoop += 1;
          var sParts = argv[nLoop].trim().split("=");
          if (sParts.length < 2) sParts[1] = null;
          oOpt[oM.fld][sParts[0]] = sParts[1];
        } else {
          return error(nLoop,"argv exhausted for "+argv[nLoop]);
        }
        break;
      case 'b':
        if (oM.fld) oOpt[oM.fld] = true;
        break;
    }
    nLoop += 1;
  }

  var sKeys = Object.keys(oMap);
  var bErr = false;
  if (oMap['-h'].bHad) {
    printHelp();
    process.exit(4);
  } else {
    for(var i=0,iMax=sKeys.length; i<iMax; i+=1) {
      var oM = oMap[sKeys[i]];
      if ((oM.type === 'S') && !oM.bHad) {
        c.log("Parm "+sKeys[i]+" required and not specified");
        bErr = true;
      }
    }
  }
  if (bErr) quit("Terminated due to errors");
  return oOpt;

  function error(nLoop,sErr) {
    c.log("ParmError at parm "+nLoop+":"+sErr);
    printHelp();
    process.exit(4);
  }

  function printHelp() {
    var nMax = 0;
    for(var i=0,iMax=oParms.length; i<iMax; i+=1) {
      var oP = oParms[i];
      if (oP[1] !== 'e') if (nMax < oP[2].length) nMax = oP[2].length;
    }
    c.log("---------- Help for "+path.basename(process.argv[1])+" --------------------");
    var sStr = 'Parm          '.substring(0,nMax)+" Type      Usage";
    c.log(sStr);
    for(i=0,iMax=oParms.length; i<iMax; i+=1) {
      oP = oParms[i];
      if (oP[1] !== 'e') {
        sStr = (oP[2]+'                   ').substring(0,nMax+1);
        switch(oP[1]) {
          case 'S': sStr += 'str(reqd) '; break;
          case 's': sStr += 'str(opt)  '; break;
          case 'b': sStr += 'boolean   '; break;
          case 'p': sStr += 'def prop  '; break;
        }
        sStr += oP[3];
        c.log(sStr);
      }
    }
  }
}
