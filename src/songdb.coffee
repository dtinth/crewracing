#
# songdb.coffee
#
# A database for songs and patterns. Provides song title / formatting.
#


class Song

	songmap = require './songmap'

	constructor: (@id) ->
		if @id of songmap
			@title = songmap[@id]
		else
			@title = (@id + '').replace /^./, (x) -> x.toUpperCase()

class Pattern

	levelmap =
		'1': 'NM'
		'2': 'HD'
		'3': 'MX'

	constructor: (@id) ->
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

