#
# main.coffee
#
# App controller for Crewracing
#


data  = require './data'
ui    = require './ui'
utils = require './utils'
hash  = require './hash'

class Application

	class HashChecker

		constructor: (@app) ->
			hash.onbegin = => @dirty = false
			hash.listen 'q',     (v) => @app.searchBox.setValue (if v? then v else ""); @dirty = true
			hash.listen 'live',  (v) => @app.rankMode.select (if v then data.Ranking.LIVE else data.Ranking.MACHINE); @dirty = true
			hash.listen 'all',   (v) => @app.showAll.setChecked (if v then true else false); @dirty = true
			# hash.listen 'sort',  (v) => @app.query.sort = (if data.canSortBy v then v else 'rank'); @dirty = true
			# hash.listen 'desc',  (v) => @app.query.direction = (if v then -1 else 1); @dirty = true
			hash.listen 'round', (v) => v = parseInt v; @app.switchRound (if 19 <= v <= @app.latestData.db.round then v else @app.latestData.db.round)
			hash.onend = => @app.update() if @dirty

	constructor: ->
		@table = new ui.Table
		@table.onsort = (key) => @sortBy key

		@showAll = new ui.Checkbox 'Show All', document.getElementById 'limit'
		@showAll.ontoggle = => (if @showAll.checked then hash.set 'all', true else hash.del 'all'); @update()

		@searchBox = new ui.SearchBox
		@searchBox.onchange = => @update()
		@searchBox.onsave = => hash.set 'q', @searchBox.getValue()

		@rankMode = @_createRankMode()
		@rankMode.onselect = => (if @rankMode.getKey() == data.Ranking.LIVE then hash.set 'live', true else hash.del 'live'); @update()

		@updatedText = document.getElementById 'updated-text'
		@query = new data.Query

		@hashChecker = new HashChecker @

	_createRankMode: ->
		o = (key, value, disp) -> new ui.DropDown.Option key, value, disp
		options = [
			o  data.Ranking.LIVE,    'Live Ranking',     'Live'
			o  data.Ranking.MACHINE, 'Machine Ranking',  'Machine'
		]
		return new ui.DropDown options, data.Ranking.MACHINE, 'Ranking Mode', document.getElementById 'mode-switch'

	sortBy: (key) ->
		@query.sortBy key
		# if key == 'rank'
		#	hash.del 'sort'
		# else
		#	hash.set 'sort', @query.sort
		# if @query.direction > 0 then hash.del 'desc' else hash.set 'desc', true
		@update()

	load: (json) ->
		@data = new data.Database json
		@loadData()
	
	loadData: ->
		unless @roundSwitch?
			@latestData = @data
			@roundSwitch = @_createRoundSwitch()
			@roundSwitch.onvalidate = (opt, cont) =>
				round = parseInt opt.key
				if round == @latestData.db.round
					hash.del 'round'
				else
					hash.set 'round', round
				@switchRound round, cont
			hash.start()
		@roundSwitch.select @data.db.round
		if @switchRound.cont
			@switchRound.cont true
			delete @switchRound.cont
		@updatedText.innerHTML = @data.db.updated
		@update()
	
	switchRound: (round, cont) ->
		cont false if @switchRound.cont
		@switchRound.cont = cont
		if round != @latestData.db.round
			js = document.createElement 'script'
			js.src = "http://tnk.dt.in.th/tnk2/archives/round#{round}.js"
			js.type = 'text/javascript'
			document.body.appendChild js
		else
			@data = @latestData
			@loadData()

	_createRoundSwitch: ->
		o = (key, value, disp) -> new ui.DropDown.Option key, value, disp
		options = []
		for round in [19..@data.db.round]
			options.push o round, "#{utils.th(round)} Crew Race Round", "<span class='round'>Round #{round}</span>#{if round == @latestData.db.round then " (Current)" else " (Archive)"}"
		return new ui.DropDown options, @data.db.round, '', document.getElementById 'round-switch'

	update: ->
		@query.limit = (if @showAll.checked then Infinity else 90)
		@query.search = @searchBox.getValue()
		@query.mode = @rankMode.getKey()
		results = @data.query @query
		@table.update @query, results


application = null

window.gotData = (json) ->

	application = new Application if application is null

	application.load json


