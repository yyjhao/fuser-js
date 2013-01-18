var Browser = require("zombie"),
	fs = require("fs");

module.exports = function(htmlpath, includeFiles, callback){
	browser = new Browser();
	browser.runScripts = false;
	browser.visit("file://" + htmlpath, function(e, browser){
		if(e){
			console.log("Opening page fail", e);
		}else{
			var manifest = browser.query("html").getAttribute("manifest");

			// dom queries ftw
			var externScripts = [].map.call(browser.queryAll("script[src^='http://']"), function(s){return s.src;});
			var internScriptsElms = browser.queryAll("script:not(script[src^='http://'])");
			var internScripts = [].map.call(internScriptsElms,  function(s){return s.src;});

			// Remove all internal scripts except for the first one
			// which gets its src changed to the combined and compressed script
			[].forEach.call(internScriptsElms, function(s, ind){
				if(ind > 0){
					s.parentNode.removeChild(s);
				}else{
					s.src = "js/main.js";
				}
			});

			var externStyles = [].map.call(browser.queryAll("link[rel='stylesheet'][href^='http://']"), function(s){return s.href;});
			var internStylesElms = browser.queryAll("link[rel='stylesheet'][href]:not([href^='http'])");
			// using s.href will return the absolute path
			var internStyles = [].map.call(internStylesElms, function(s){ return s.getAttribute("href"); });

			// same as js, remove all except the first, which gets its href changed to the combined styleshet
			[].forEach.call(internStylesElms, function(s, ind){
				if(ind > 0){
					s.parentNode.removeChild(s);
				}else{
					s.href = "style/style.css";
				}
			});

			// hacky append to the end of body
			var includes = includeFiles.map(function(file){
				return fs.readFileSync(file).toString();
			}).reduce(function(prev, inc){
				return prev + inc;
			}, "");

			browser.document.body.innerHTML += includes;

			[].forEach.call(browser.queryAll("pre"), function(p){
				p.innerHTML = p.innerHTML.replace(/\n\r|\n|\r/g, "(fuser~break)")
								.replace(/\t/g, "(fuser~tab)")
								.replace(/\s/g, "(fuser~space)");
			});

			var html = '<!DOCTYPE html>' + browser.html().replace(/\n|\t|\r/g, " ")
				.replace(/\s{2,}/g, " ")
				.replace(/\(fuser~tab\)/g, "\t")
				.replace(/\(fuser~space\)/g, " ")
				.replace(/\(fuser~break\)/g, "\n");

			callback(html, {
				scripts: {
					"external": externScripts,
					"internal": internScripts
				},
				stylesheets: {
					"external": externStyles,
					"internal": internStyles
				},
				manifest: manifest
			});
		}
	});
};