#
# songdb.coffee
#
# A database for songs and patterns. Provides song title / formatting.
#

info = do ->

	db = require './music-db'

	map =
		song: {}
		pattern: {}

	for music in db
		map.song[music.id] = music
		for chart in music.charts
			map.pattern[music.id + '_' + chart.difficulty] = chart
	
	return map

class Song

	constructor: (@id) ->
		@info = info.song[@id]
		if @info
			if @info.short
				@title = @info.short
			else
				@title = @info.title
		else
			@title = (@id + '').replace /^./, (x) -> x.toUpperCase()

class Pattern

	levelmap =
		'1': 'NM'
		'2': 'HD'
		'3': 'MX'

	constructor: (@id) ->
		@info = info.pattern[@id]
		@song = exports.song @id.replace /_\d$/, ''
		@level = parseInt @id.charAt @id.length - 1
		@levelName = levelmap[@level]
		@title = @song.title + ' ' + @levelName

songs = {}

patterns = {}

exports.song = (id) ->
	songs[id] = new Song(id) unless id of songs
	songs[id]

exports.pattern = (id) ->
	patterns[id] = new Pattern(id) unless id of patterns
	patterns[id]

