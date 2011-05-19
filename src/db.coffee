#
# db.coffee
#
# Low-level database / model for Crewracing.
#


exports.DB = class DB

	class Crew

		class Course

			songdb = require './songdb'

			constructor: (@crew, json) ->
				for key, value of json
					@[key] = value
				for stage in @stages
					stage.pattern = songdb.pattern stage.pattern

		constructor: (@db, @id, json) ->
			for key, value of json
				@[key] = value
			if @course
				@course = new Course(@, json.course)
			@uid = "cr-week#{@db.round}-crew#{escape(@name)}"

	constructor: (json) ->

		@updated = new Date 1000 * json.updated
		@round = json.round
		@crews = {}
		@db = {}

		for crew, id in json.crews
			@crews[id] = new Crew(@, id, crew)








