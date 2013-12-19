// test Yapp

var log = console.log;


var yapp = require("../lib/yapp.js");


log("Test Yapp starting");
var oParms1 = [
   ["bBool",  "b",  "-bool",   "test Bool switch"]
  ,["sOpt",   "s",  "-ostr",   "test optional string"]
  ,["sReqd",  "S",  "-rstr",   "test required string"]
  ,["oProp",  "p",  "-D",      "test properties"]
  ,["sEnv",   "e",  "T_ENV",   "test environment variable"]
];

var oOpt = yapp.parse(oParms1);
log("Main Result ----\r\n oOpt=%o",oOpt);


runTest(10,"-h",oParms1,"-D    def prop  test properties");
runTest(20,"-h",null,"oParms not supplied");
runTest(30,"-h",{},"oParms is not an Array");
runTest(40,"-h",[],"oParms has no rows");
runTest(50,"-h",[{}],"Row 0 not an Array");
runTest(60,"-h",[[""]],"Row 0 col count not 4");
runTest(70,"-h",[[{},"","",""]],"oParms row=0 Col=0 not string but object");
runTest(80,"-h",[["bad","x","bad","bad type"]],"oParms row=0 type=x not implemented");
runTest(90,"-h",[["bad","s","bad","no parm"]],"oParms row=0 parm=bad must start with '-'");

runTest(100,"-D p1=P1 -D p2 -D p3= -rstr test100",oParms1,'{"bBool":false,"sOpt":null,"sReqd":"test100","oProp":{"p1":"P1","p2":null,"p3":""},"sEnv":"test env str"}');
delete process.env.T_ENV;
runTest(160,"-rstr test100",oParms1,"env variable T_ENV has no value or default");
oOpt = {sEnv:'default value'};
runTest(170,"-rstr test100",oParms1,'{"sEnv":"default value","bBool":false,"sOpt":null,"sReqd":"test100","oProp":{}}',oOpt);
log("Test Yapp ending");
return;


function runTest(nTest,args,parms,sExpect,oOpt) {
  log("===================== test "+nTest+" start ===================");
  var fnExit = process.exit;
  var fnLog  = console.log;
  var sLastMsg = null;

  console.log = myLog;
  process.exit = myExit;
  var sParts = args.split(" ");
  process.argv.length = 2;
  for(var i=0,iMax=sParts.length; i<iMax; i+=1) {
    process.argv.push(sParts[i]);
  }
  try {
    var oOpt = yapp.parse(parms,oOpt);
    var sGot = JSON.stringify(oOpt);
    if (sExpect !== sGot) {
      console.error("EXPECTED:"+sExpect);
      console.error("     GOT:"+sGot);
    } else {
      log("Test Result "+sGot);
      log("test "+nTest+" OK");
    }
  } catch (e) {
    log("Error taken %o",e);
    if (sExpect !== sLastMsg) {
      console.error("EXPECTED:"+sExpect);
      console.error("     GOT:"+sLastMsg);
    } else {
      log("test "+nTest+" OK");
    }
  }
  process.exit = fnExit;
  console.log  = fnLog;
  log("===================== test end ===================");
  return;

  function myExit(code) {
    log("process.exit code="+code+" taken");
    throw Error("Process exit caught");
  }

  function myLog(msg) {
    fnLog(msg);
    sLastMsg = msg;
    return;
  }

}
