# 1. Introduction

Fuser.js is an all-in-one deployment script intended for front-end of single-page web applications.

It automatically compresses the only html file (must be named `index.html`), and concatenate
and minify all the local scripts and stylesheets referenced from the html. If the html file
specifies an appcache manifest, it will also generate the manifest file which will include 
all the scripts (including external scripts) and stylesheets referenced in the html file, as 
well as all the files copied from the project directory.

There's also an option to copy and minify scripts not referenced in `index.html`. 

# 2. Usage
    ./fuserjs
        shows usage information
    ./fuserjs <project directory> <output directory> [config file path]
        Generate the minified version of website from the development version.
        You can also specify a configuration file.
        If no configuration file is specified, it will try to read the configuration
        from <project directory>/fuser_config.json

# 3. Prerequisite
You need `node.js` to run the script.

Dependencies are specified in package.json.

# 4. How it works

It uses `zombie.js` to parse and modify the html file, `csso` for minifying css and `uglify.js`
for minifying javascript files.

The concatenated and minified JavaScript file will be `js/main.js`, and the stylesheet will be
`style/style.css`.

By default, it will only copy image files, and all css and js files not referenced in `index.html`
and not specified in configuration will be ignored. Any other files will also be ignored.

You can include more files by changing the configuration. More below.

# 4. Configuration

You can specify the configuration file in your project `directory/fuser_config.json`, or any other
files, but you will need to pass in the path to the configration file.

The configuration file is in json format, and the following attributes are supported:

    extraScripts:
        An array for scripts that should be copied to the output directory and minified.
        (the scripts may or may not be referenced in index.html)
        The default value is empty;
    include:
        An array of files whose content will be appended to the body of index.html, useful for analytics
        scripts.
    ignore:
        A regular expression string specifying the pattern of names for files and directories that should
        be ignored. The default value is `".*\\..*"`, which ignores all files with an extension.
    override:
        A regular expression string specifying the pattern of names for the files and directories that
        should be copied. This overrides ignore (because reverse matching is hard with regex).
        The default value is `".*\\.png$|.*\\.jpg$|.*\\.gif$|.*\\.mp3$|.*\\.ogg$"`, i.e. all the image and audio files

        Note: currently directories and files are not tested separately, this may change in the future.

Note that files are not minified unless they are reference in `index.html`, or are included in `extraScripts`.

If a JavaScript file is copied and also included in `extraScripts`, the minified version will override the copied version.

# 5. License

* Fuser.js is licensed under [MIT](https://github.com/yyjhao/fuser-js/blob/master/MIT-LICENSE.txt)
  