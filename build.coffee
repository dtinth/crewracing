fs = require 'fs'
cs = require 'coffee-script'

HEADER = """
	/*
	 * Crewracing - Better Crew List!
	 * http://github.com/dtinth/crewracing
	 *
	 * By DJ THAI
	 */
"""

class Compiler

	constructor: ->
		@files = []

	addFile: (fn) ->
		@files.push fn

	watch: ->
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
			code = cs.compile contents
			fn = new Function(code)
			console.log "... #{moduleName}: ok!"
		catch e
			fn = new Function("throw new Error(#{JSON.stringify e.toString()});")
			console.log "... #{moduleName}: #{e.toString()}"
		"""
			require._m(#{JSON.stringify moduleName}, #{fn.toString().replace(/function(\s+\w+)?\s*\(\s*\)/, 'function(require, exports, module)')});
		"""

	compile: ->
		console.log "#{new Date().toString()}"
		code = """
			#{HEADER}
			var Crewracing = (function() {
			var require = function(n) {
				if (require[n] instanceof require._u) {
					require[n] = require[n].init();
				}
				return require[n];
			};
			require._u = function(fn) {
				this.fn = fn;
			};
			require._u.prototype.init = function() {
				var module = { exports: {} };
				this.fn.call(module.exports, require, module.exports, module);
				return module.exports;
			};
			require._m = function(n, fn) {
				require[n] = new require._u(fn);
			};
			#{(@compileFile file for file in @files).join('\n');}
			require('./main');
			return { require: require };
			})();
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
compiler.addFile 'src/storage.coffee'

compiler.watch()
