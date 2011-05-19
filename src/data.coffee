#
# data.coffee
#
# A high-level database abstraction layer. Provides searching, sorting, filtering and stuff.
#

utils = require './utils'


class Trie

	constructor: ->
		@data = {}
		@crews = {}
	
	allocate: (id) ->
		if not (id of @data)
			@data[id] = new Trie
		return @data[id]

	get: (id) ->
		if id of @data
			return @data[id]
		return null

	add: (crew) ->
		@crews[crew.id] = crew


class Filter

	constructor: ->
		@root = new Trie
		@_lastMask = null
		@_lastQuery = null
		@_lastResult = null
	
	index: (crew, keywords) ->
		keywords = keywords.toLowerCase()
		@addMatches crew, keywords.match /\S+/g
		@addMatches crew, keywords.match /\w+/g

	addMatches: (crew, matches) ->
		if matches
			for match in matches
				@access(match).add crew

	access: (word) ->
		node = @root
		for i in [0...word.length]
			node = node.allocate word.charAt i
		node

	find: (word) ->
		node = @root
		for i in [0...word.length]
			node = node.get word.charAt i
			if node is null
				break
		node

	search: (mask, query) ->
		return @_lastResult if mask == @_lastMask and query == @_lastQuery

		results = mask
		matches = query.toLowerCase().match(/\S+/g)

		if matches
			walk = (tree) ->
				return unless tree
				for key, crew of tree.crews
					if crew.id of mask
						results[crew.id] = crew
				for key of tree.data
					walk tree.data[key]
			for word in matches
				mask = results
				results = {}
				walk @find word

		return (crew for id, crew of results)


exports.Ranking = Ranking =

	MACHINE:   1
	LIVE:      2



exports.Query = class Query

	constructor: ->
		
		@mode = Ranking.MACHINE

		@search = ''

		@sort = 'rank'
		@direction = 1

		@limit = 90

	sortBy: (key) ->
		if key == @sort
			@direction *= -1
		else
			@sort = key
			@direction = 1


sorters = do ->

	cmp = (a, b, cont = -> 0) ->
		if a > b
			1
		else if a < b
			-1
		else
			cont()

	compare = (func) -> (a, b, cont) ->
		cmp func.call(a), func.call(b), cont

	require = (func) -> (a, b, cont) ->
		ares = func.call(a)
		bres = func.call(b)
		return 0 if not ares and not bres
		return 1 if not ares
		return -1 if not bres
		cont()

	rankcompare = (a, b) -> compare(-> @displayedRank)       a, b
	namecompare = (a, b) -> compare(-> @name.toLowerCase())  a, b

	requirecourse = (a, b, cont) ->
		require(-> @course?) a, b, ->
			cont()
	
	stagecompare = (num) -> (a, b) ->
		requirecourse a, b, ->
			compare(-> @course.stages[num].pattern.song.title) a, b, ->
				compare(-> @course.stages[num].pattern.id) a, b, ->
					namecompare a, b
	
	winratecompare = (a, b) ->
		requirecourse a, b, ->
			require(-> @course.plays > 0) a, b, ->
				compare(-> -1 * @course.wins / @course.plays) a, b, ->
					compare(-> -1 * @course.plays) a, b, ->
						rankcompare a, b

	rank: rankcompare
	name: namecompare
	stage1: stagecompare 0
	stage2: stagecompare 1
	stage3: stagecompare 2
	winrate: winratecompare

exports.canSortBy = (key) -> sorters.hasOwnProperty key

exports.Database = class Database

	db = require './db'

	constructor: (json) ->

		@db = new db.DB(json)

		@_calculateMachineRanking()
		@initialMasks = @_createInitialMasks()
		@filter       = @_createFilter()
	
	_calculateMachineRanking: ->

		crews = (crew for id, crew of @db.crews when crew.course)
		
		crews.sort (a, b) ->
			for i in [0...Math.max(a.previousRanks.length, b.previousRanks.length)]
				if a.previousRanks[i] == 0 or not a.previousRanks[i]?
					return 1
				if b.previousRanks[i] == 0 or not b.previousRanks[i]?
					return -1
				if a.previousRanks[i] != b.previousRanks[i]
					return a.previousRanks[i] - b.previousRanks[i]
			return 0
	
		nextRank = 1

		for crew in crews
			crew.machineRank = nextRank++

	_createInitialMasks: ->

		that = this
		masks = {}
		masks[Ranking.MACHINE] = utils.createMask -> @ crew for id, crew of that.db.crews when crew.course; return
		masks[Ranking.LIVE]    = utils.createMask -> @ crew for id, crew of that.db.crews; return
		return masks

	_createFilter: ->

		filter = new Filter

		for id, crew of @db.crews
			filter.index crew, crew.name
			if crew.course?
				filter.index crew, crew.course.producer
				for stage in crew.course.stages
					filter.index crew, stage.pattern.title

		return filter

	query: (q) ->
		
		results = (crew for crew in @filter.search @initialMasks[q.mode], q.search)
		
		for crew in results
			crew.displayedRank = @_getDisplayedRank(crew, q)

		results = (crew for crew in results when crew.displayedRank <= q.limit)
		results.sort (a, b) -> sorters[q.sort](a, b) * q.direction

		return results

	_getDisplayedRank: (crew, q) ->
		
		return (if q.mode == Ranking.MACHINE then crew.machineRank else crew.rank)


