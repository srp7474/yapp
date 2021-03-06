yapp
====

_Node.js project_

#### Yet Another Param Parser for CLI program argv params ####

Version: 0.0.1

This module provides a convenient, uniform method to define, specify, access and
display command line program parameters.

#### Installation ####

```
npm install yapp [-g]
```

#### Example 1 ####


```javascript
var yapp = require("yapp");
var oParms1 = [
   ["bBool",  "b",  "-bool",   "test Bool switch"]
  ,["sOpt",   "s",  "-ostr",   "test optional string"]
  ,["sReqd",  "S",  "-rstr",   "test required string"]
  ,["oProp",  "p",  "-D",      "test properties"]
  ,["sEnv",   "e",  "T_ENV",   "test environment variable"]
];

var oOpt = yapp.parse(oParms1);
console.log("Options:\r\n",oOpt);
```
creates oOpt as:

```
Options:
{ bBool: false,
  sOpt: null,
  sReqd: 'STR1',
  oProp: {},
  sEnv: 'test env str'
}
```
when run with command lines

```
set T_ENV=test env str
node example1.js -rstr STR1
```

creates oOpt as:

```
Options:
{ bBool: true,
  sOpt: 'OptStr',
  sReqd: 'XXX',
  oProp: { P1: '1', P2: null },
  sEnv: 'another string'
}
```

when run with command lines

```
set T_ENV=another string
node example1.js -rstr XXX -D P1=1 -D P2 -ostr OptStr -bool
```

and creates help output:

```
---------- Help for example1.js --------------------
Parm  Type      Usage
-bool boolean   test Bool switch
-ostr str(opt)  test optional string
-rstr str(reqd) test required string
-D    def prop  test properties
```

when run with command line

```
node example1.js -h
```

#### Method ####

__yapp.parse(parms[,opts])__

Returns an Object using `parms` as specified with the [parms
specs](#parm_specs).  The `opts` parameter can optionally be supplied that
provides default values for optional values.

#### Parameter Specifications ####
<a name="parm_specs"></a>
The `Parameter Specifications` consists of an array of `lines` where each
`line` is an array of 4 string values (columns).  Each column has the following
meaning.

```
  Col   Meaning
   0    TargetName in output object
   1    Type of parameter
   2    Parameter string on command line (must start with -) or
        Environment variable name if Type 'e'
   3    Description of Usage
```

The `Type` values must be one of the following values

```
  Type  Usage
   'S'  Required string. TargetName will be set to value which follows
        parameter in command line.

   's'  Optional string. TargetName will be set to value which follows
        parameter in command line.
        TargetName will be defaulted to null in output object

   'b'  Optional boolean value will set TargetName to true if present
        TargetName will be defaulted to false in output object

   'p'  Optional property object storing key/value string pairs specified as key=value or key=
        TargetName will be an object to which the key/value pairs will be added.

   'e'  TargetName set to Col[2] value.  If value is not set
        will cause error unless the default `opts` is supplied and contains
        a name for the TargetName.
```
#### Processing Sequence for yapp.parse(parms,[,opts]) call ####

1. The `parms` table is validated.  Any errors are reported and the program is
terminated with a call to `process.exit(4)`.

2. If no `opts` object is supplied an empty one is produced.

3. Default values from the `parms` table are generated.

4. The command line parameters are processed against the `parms` table.

5. If any errors are detected such as an unknown command line string a
diagnostic is displayed, the help information is displayed and the program is
terminated with a call to `process.exit(4)`.

6. A check is made that the required strings are provided (Type 'S').  If any
are missing a diagnostic is displayed, the help information is displayed and
the program is terminated with a call to `process.exit(4)`.

7. The resulting `opts` Object is returned.

