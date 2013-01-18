var fs = require("fs"),
	path = require("path"),
	parseHtml = require("./parseHtml"),
	generateJs = require("./generateJs"),
	generateCss = require("./generateCss"),
	generateManifest = require("./generateManifest"),
	copyDirectory = require("./copyDirectory"),
	Step = require("Step");


module.exports = function(projectDir, outputDir, conf, callback){
	// by default, all files except images and sound are ignored
	var	ignore = ("ignore" in conf) ? conf.ignore : ".*\\..*",
		override = ("override" in conf) ? conf.override : ".*\\.png$|.*\\.jpg$|.*\\.gif$|.*\\.mp3$|.*\\.ogg$",
		extraScripts = conf.extraScripts || [],
		includes = (conf.page_includes || []).map(function(inc){
			return path.resolve(projectDir, inc);
		});

	// string to regex

	// config files and hidden files are ignored by default
	// and can only be overridden in override
	ignore = new RegExp(ignore + "|^fuser_config\\.json$|\\^..*");

	override = new RegExp(override);

	// compile regex for speed!
	ignore.compile(ignore);
	override.compile(override);

	copyDirectory(projectDir, outputDir, override, ignore, function(allfiles){
		// allfiles will be used for generating appcache manifest file
		allfiles = allfiles.filter(function(f){
			// filter out directories
			return fs.statSync(f).isFile();
		}).map(function(f){
			return path.relative(projectDir, f);
		});

		parseHtml(path.resolve(projectDir, "index.html"), includes, function(html, meta){
			allfiles.push("index.html");
			allfiles.push("js/main.js");
			allfiles.push("style/style.css");

			meta.scripts.external.forEach(function(s){
				allfiles.push(s);
			});

			meta.stylesheets.external.forEach(function(s){
				allfiles.push(s);
			});

			var internJs = meta.scripts.internal.map(function(f){
				return path.resolve(projectDir, f);
			});
			var internCss = meta.stylesheets.internal.map(function(c){
				return path.resolve(projectDir, c);
			});

			// build up the list of 'parallel' functions for Step
			var todos = [
				function writeIndex(){
					fs.writeFile(path.resolve(outputDir, "index.html"), html, this.parallel());
				},
				function genJs(){
					var cb = this.parallel();
					generateJs(internJs, path.resolve(outputDir, "js/main.js"), function(){
						console.log("Main JavaScript file js/main.js generated.");
						cb();
					});
				},
				function genCss(){
					var cb = this.parallel();
					generateCss(internCss, path.resolve(outputDir, "style/style.css"), function(){
						console.log("Main style sheet file style/style.css generated.");
						cb();
					});
				},
				function genManifest(){
					var cb = this.parallel();
					if(meta.manifest){
						generateManifest(allfiles, path.resolve(outputDir, meta.manifest), function(){
							console.log("offline.appcache generated.");
							cb();
						});
					}else{
						console.log("Appcache manifest is not included in html, no appcache manifest generated.");
						cb();
					}
				}
			];

			// also for Step
			extraScripts.forEach(function(s){
				allfiles.push(s);
				todos.push(function(){
					var cb = this.parallel();
					generateJs([path.resolve(projectDir, s)], path.resolve(outputDir, s), function(){
						console.log(s, "minified.");
						cb();
					});
				});
			});

			// callback will be called once all the 'parallel' tasks are done.
			todos.push(callback || function(){});

			Step.apply(Step, todos);
			
		});
	});
};