#
# build.coffee
#
# Compiles bunch of coffee files into one JavaScript file.
#

fs = require 'fs'
cs = require 'coffee-script'

HEADER = """
	/*
	 * Crewracing - Better Crew List!
	 * http://github.com/dtinth/crewracing
	 *
	 * By Thai Pangsakulyanont (DJ THAI in TECHNIKA2)
	 * MIT Licensed
	 */
"""

class Compiler

	constructor: ->
		@files = []

	addFile: (fn) ->
		@files.push fn

	watch: (file) ->
		timer = 0
		for file in @files
			fs.watchFile file, (curr, prev) =>
				if curr.mtime > prev.mtime
					clearTimeout timer
					timer = setTimeout (=> @compile()), 100
		@compile()

	compileFile: (filename) ->
		contents   = fs.readFileSync filename, 'utf-8'
		moduleName = filename.replace(/^.*\//, './').replace(/\.coffee$/, '')
		try
			code = cs.compile contents, bare: true
			fn = new Function(code)
			console.log "... #{moduleName}: ok!"
		catch e
			fn = new Function("throw new Error(#{JSON.stringify e.toString()});")
			console.log "... #{moduleName}: #{e.toString()}"
		"{ name: #{JSON.stringify moduleName}, factory: #{fn.toString().replace(/function(\s+\w+)?\s*\(\s*\)/, 'function(require, exports, module)')} }"

	compile: ->
		console.log "#{new Date().toString()}"
		code = """
			#{HEADER}
			var Crewracing = (function() {
				var modules = {}, require = function(name) { return modules[name](); };
				function m(factory) {
					var initialized = false;
					var module = { exports: {} };
					return function() {
						if (!initialized) {
							factory(require, module.exports, module);
							initialized = true;
						}
						return module.exports;
					};
				}
				return function() {
					for (var i = 0; i < arguments.length; i ++) {
						modules[arguments[i].name] = m(arguments[i].factory);
					}
					require('./main');
					return { require: require };
				};
			})()(
			#{(@compileFile file for file in @files).join(',\n');}
			);
		"""
		fs.writeFileSync 'js.js', code
		console.log ""
			

compiler = new Compiler

compiler.addFile 'src/main.coffee'
compiler.addFile 'src/ui.coffee'
compiler.addFile 'src/data.coffee'
compiler.addFile 'src/db.coffee'
compiler.addFile 'src/songdb.coffee'
compiler.addFile 'src/songmap.coffee'
compiler.addFile 'src/utils.coffee'
compiler.addFile 'src/hash.coffee'
compiler.addFile 'src/storage.coffee'

compiler.watch()
