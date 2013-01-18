var uglifyJS = require("uglify-js"),
	fs = require("fs");

module.exports = function(inputFiles, outputFile, callback){
	var result = uglifyJS.minify(inputFiles);
	fs.writeFile(outputFile, result.code, function(err){
		if(err){
			console.log("Error while writing minified js file", outputFile, err);
		}else{
			callback && callback();
		}
	});
};