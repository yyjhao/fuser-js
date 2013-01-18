var ncp = require("ncp").ncp;

module.exports = function(projectDir, outputDir, override, ignore, callback){
	var allfiles = [];
	ncp(projectDir, outputDir, {filter: function(filepath){
			// return true if should include
			// also add the files to file lists for manifest
			var filename = filepath.split("/").pop();
			if (override.test(filename) || (!ignore.test(filename))){
				allfiles.push(filepath);
				return true;
			}else{
				return false;
			}
		}
	}, function(err){
		if(err){
			console.log("Error while copying " + projectDir + " to  " + outputDir, err);
		}else{
			callback && callback(allfiles);
		}
	});
};