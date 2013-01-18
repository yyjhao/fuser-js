var fs = require("fs");

module.exports = function(inputFiles, outputFile, callback){
	var header = [
		"CACHE MANIFEST",
		// update the comment will force cache to update
		// even when the list of file is the same
		// so we just set a comment of the current date whenever we generate a new manifest
		"# " + (new Date()).toString()
	].join("\n");

	inputFiles.unshift("CACHE:");
	var cachedList = inputFiles.join("\n");

	var footer = [
		"NETWORK:",
		"*"
	].join("\n");

	fs.writeFile(outputFile, [header, cachedList, footer].join("\n\n"), function(err){
		if(err){
			console.log("Error while generating manifest file", outputFile, err);
		}else{
			callback && callback();
		}
	});
};