#
# main.coffee
#
# App controller for Crewracing
#


data  = require './data'
ui    = require './ui'
utils = require './utils'

class Application

	constructor: ->
		@table = new ui.Table
		@table.onsort = (key) => @sortBy key

		@showAll = new ui.Checkbox 'Show All', document.getElementById 'limit'
		@showAll.ontoggle = => @update()

		@searchBox = new ui.SearchBox
		@searchBox.onchange = => @update()
		@searchBox.onsave = => @saveState()

		@rankMode = @_createRankMode()
		@rankMode.onselect = => @update()
		@rankMode.onclick = => @rankMode.select (if @rankMode.getKey() == data.Ranking.MACHINE then data.Ranking.LIVE else data.Ranking.MACHINE); @update()

		@updatedText = document.getElementById 'updated-text'
		@query = new data.Query

	_createRankMode: ->
		o = (key, value, disp) -> new ui.DropDown.Option key, value, disp
		options = [
			o  data.Ranking.LIVE,    'Live Ranking',     'Live'
			o  data.Ranking.MACHINE, 'Machine Ranking',  'Machine'
		]
		return new ui.DropDown options, data.Ranking.MACHINE, 'Ranking Mode', document.getElementById 'mode-switch'

	saveState: ->
		# unimplemented!

	sortBy: (key) ->
		@query.sortBy key
		@update()

	load: (json) ->
		@data = new data.Database json
		@loadData()
	
	loadData: ->
		unless @roundSwitch?
			@latestData = @data
			@roundSwitch = @_createRoundSwitch()
			@roundSwitch.onvalidate = (opt, cont) =>
				@switchRound opt.key, => cont true
		@roundSwitch.select @data.db.round
		if @switchRound.cont
			@switchRound.cont()
			delete @switchRound.cont
		@updatedText.innerHTML = @data.db.updated
		@update()
	
	switchRound: (round, cont) ->
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
		@latestRound = @data.db.round
		o = (key, value, disp) -> new ui.DropDown.Option key, value, disp
		options = []
		for round in [19..@data.db.round]
			options.push o round, "#{utils.th(round)} Crew Race Round", "<span class='round'>Round #{round}</span>#{if round == @latestRound then " (Current)" else " (Archive)"}"
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


