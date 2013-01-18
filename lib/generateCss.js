var csso = require("csso"),
	fs = require("fs");

module.exports = function(inputFiles, outputFile, callback){
	// perhaps sync is more intuitive but it works....s
	(function readCss(curdata, ind){
		if(ind === inputFiles.length){
			fs.writeFile(outputFile, csso.justDoIt(curdata), function(err){
				if(err){
					console.log("Error while generating minified css file", outputFile, err);
				}else{
					callback && callback();
				}
			});
		}else{
			fs.readFile(inputFiles[ind], function(err, data){
				if(err){
					console.log("Error while reading input file", inputFiles[ind], err);
				}else{
					readCss(curdata + data, ind + 1);
				}
			});
		}
	})("", 0);
};