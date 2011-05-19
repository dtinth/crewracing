#
# ui.coffee
#
# User Interface for Crewracing
#


utils = require './utils'
data = require './data'
storage = require './storage'


createLink = ->
	el = document.createElement 'a'
	el.href = 'javascript://crewracing/'
	el


class State

	constructor: (@element, @base) ->
		@hash = {}
	
	set: (name) ->
		@hash[name] = true
		@update()
	
	unset: (name) ->
		delete @hash[name]
		@update()

	update: ->
		@element.className = @base + ' ' + (key for key of @hash).join(' ')


exports.DropDown = class DropDown

	showing = null

	@Option = Option = class Option
	
		constructor: (@key, @text, @displayedText) ->
			@displayedText ?= @text

	
	class DropdownOption

		constructor: (@dropdown, @option) ->

			@selected = false
			@element = document.createElement 'li'
			@text = createLink()
			@text.innerHTML = @option.text
			@text.onclick = => @dropdown.userSelect @
			@element.appendChild @text
			@update()
			@dropdown.list.appendChild @element

		select: -> @selected = true; @update()
		deselect: -> @selected = false; @update()

		update: ->
			@element.className = (if @selected then 'selected' else '')


	constructor: (@options, defaultOption, label, @container) ->

		@element = document.createElement 'div'
		@state = new State @element, 'dropdown'

		@activator = createLink()
		@activator.className = 'dropdown-activator'

		if label != ""
			labelElement = document.createElement 'span'
			labelElement.className = 'label'
			labelElement.innerHTML = label + ': '
			@activator.appendChild labelElement

		@selectedOptionContainer = document.createElement 'span'
		@selectedOptionContainer.className = 'sel-opt'

		@selectedOptionIndicator = document.createElement 'span'
		@selectedOptionIndicator.className = 'text'

		@selectedOptionContainer.appendChild @selectedOptionIndicator
		@activator.appendChild @selectedOptionContainer

		@list = document.createElement 'ul'
		@list.className = 'dropdown-list'

		@map = {}
		for option in @options
			@map[option.key] = new DropdownOption @, option

		@select @map[defaultOption]

		@element.appendChild @activator
		@element.appendChild @list
		@container.appendChild @element

		@delay = 0
		@element.onmouseover = => @open()
		@element.onmouseout = => @delayedClose()
		@activator.onfocus = => @open()
		@activator.onclick = => @open(); @onclick()
		@close()
	
	delayedClose: ->
		clearTimeout @delay
		@delay = setTimeout (=> @close()), 180

	open: ->
		clearTimeout @delay
		if showing != @
			if showing != null
				showing.close()
		showing = @
		@state.set 'dropdown-open'
	
	close: ->
		clearTimeout @delay
		@state.unset 'dropdown-open'

	onclick: ->
	onvalidate: (opt, cont) -> cont true
	onselect: ->

	getKey: -> @selectedOption.option.key

	userSelect: (d) ->
		if d == @selectedOption
			@delayedClose()
			return
		state = 0
		@onvalidate d.option, (valid) =>
			if state == 1
				@state.unset 'dropdown-working'
			state = 2
			if valid
				@select d
				@onselect()
			@delayedClose()
		if state == 0
			state = 1
			@state.set 'dropdown-working'


	select: (d) ->
		
		if d instanceof Option
			d = @map[d.key]
		else if not (d instanceof DropdownOption)
			d = @map[d]

		return false unless d instanceof DropdownOption

		if @selectedOption?
			@selectedOption.deselect()

		@selectedOption = d
		@selectedOption.select()

		@selectedOptionIndicator.innerHTML = @selectedOption.option.displayedText


exports.SearchBox = class SearchBox

	constructor: ->
		@element = document.getElementById 'search'
		@element.onkeyup = (e) =>
			e ?= event
			if e.keyCode == 13
				@save()
			@change()
		@element.onchange = => @change(); @save()

	getValue: -> @element.value
	setValue: (v) -> @element.value = v

	change: ->
		@onchange()

	save: ->
		@onsave()


exports.Checkbox = class Checkbox

	constructor: (label, @container) ->
		@checked = false
		@element = createLink()
		@element.innerHTML = label
		@element.onclick = => @clicked()
		@updateClassName()
		@container.appendChild @element

	getClassName: ->
		"checkbox checkbox-#{if @checked then "checked" else "unchecked"}"

	updateClassName: ->
		@element.className = @getClassName()

	clicked: ->
		@checked = !@checked
		@updateClassName()
		@ontoggle()
		return false


exports.Table = class Table

	constructor: ->
		@element = document.getElementById 'main'
		@element.onclick = (e) =>
			e ?= event # damn you internet explorer
			target = e.target
			target ?= e.srcElement # damn you internet explorer
			if (target.getAttribute 'data-sort')?
				@onsort target.getAttribute 'data-sort'
			else if (target.getAttribute 'data-crew-toggle')?
				uid = target.getAttribute 'data-crew-toggle'
				storage.setFlag uid, 'cleared', !storage.checkFlag(uid, 'cleared')
				target.parentNode.className = @renderCrewClassNameUid(uid)

	update: (query, results) ->
		@element.innerHTML = @render query, results
	
	render: (query, results) ->
		"""
			<table cellspacing="0" class="crew-list">
				#{@renderHeaders query}
				#{@renderCrews query, results}
			</table>
		"""

	renderHeaders: (query) ->
		"""
			<tr>
				<th onclick="return true;" data-sort="rank" class="#{@renderSortClass query, 'rank'}">Rank</th>
				<th onclick="return true;" data-sort="name" class="#{@renderSortClass query, 'name'}" colspan="2">Name</th>
				<th onclick="return true;" data-sort="stage1" class="#{@renderSortClass query, 'stage1'}">Stage 1</th>
				<th onclick="return true;" data-sort="stage2" class="#{@renderSortClass query, 'stage2'}">Stage 2</th>
				<th onclick="return true;" data-sort="stage3" class="#{@renderSortClass query, 'stage3'}">Stage 3</th>
				<th>Course</th>
				<th onclick="return true;" data-sort="winrate" class="#{@renderSortClass query, 'winrate'} last">Win Rate</th>
			</tr>
		"""
	
	renderSortClass: (query, k) ->
		if query.sort == k
			if query.direction >= 0
				"sort-ascending"
			else
				"sort-descending"
		else
			"sort-none"

	renderCrews: (query, crews) ->
		if crews.length == 0
			"""
				<tr class="no-matches">
					<td colspan="8">No matches!</td>
				</tr>
			"""
		else
			(@renderCrew(query, crew) for crew in crews).join "\n"

	renderCrew: (query, crew) ->
		"""
			<tr class="#{@renderCrewClassName(crew)}">
				<td title="Mark/unmark as cleared." class="rank" data-crew-toggle="#{crew.uid}" onclick="return true;">#{crew.displayedRank}.</td>
				<td class="emblem">#{@renderEmblem(crew)}</td>
				<td class="name">
					<span class="crew-name">#{crew.name}</span>
					<span class="crew-points">#{crew.points} pts#{@renderAdditionalRanking(query, crew)}</span>
				</td>
				#{@renderCourse(crew.course)}
			</tr>
		"""
	
	renderCrewClassName: (crew) ->
		@renderCrewClassNameUid crew.uid
	
	renderCrewClassNameUid: (uid) ->
		"crew" + (if storage.checkFlag(uid, 'cleared') then " crew-cleared" else "")
		

	renderAdditionalRanking: (query, crew) ->
		return "" if query.mode == data.Ranking.LIVE
		""" (#{utils.th(crew.rank)})"""

	renderEmblem: (crew) ->
		"""
			<img
				src="http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/pattern/#{crew.emblemPattern.id}.png"
				style="background:url(http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/plate/#{crew.emblemPlate.id}.png"
				width="30" height="30">
		"""

	renderCourse: (course) ->
		if not course?
			return """<td colspan="5" class="no-course">(No Course)</td>"""
		"""
			<td class="song">#{@renderStageSong(course.stages[0])}</td>
			<td class="song">#{@renderStageSong(course.stages[1])}</td>
			<td class="song">#{@renderStageSong(course.stages[2])}</td>
			<td class="course-info">
				<span class="song-line">#{@renderStageInfo(course.stages[0])}</span>
				<span class="song-line">#{@renderStageInfo(course.stages[1])}</span>
				<span class="song-line">#{@renderStageInfo(course.stages[2])}</span>
			</td>
			<td class="win-info">
				<span class="percentage">#{@renderCoursePercentage(course)}</span>
				<span class="details">#{@renderWinRateDetails(course)}</span>
				<span title="Producer" class="producer">#{course.producer}</span>
			</td>
		"""
	
	renderCoursePercentage: (course) ->
		if course.crew.machineRank > 90 and course.plays == 0
			"""<span class="na-unranked">&times;</span>"""
		else if course.plays == 0
			"""<span class="na-noplays">&mdash;</span>"""
		else
			"#{Math.round(course.wins / course.plays * 100)}%"
	
	renderWinRateDetails: (course) ->
		if course.crew.machineRank > 90 and course.plays == 0
			"Unranked"
		else if course.plays == 0
			"No plays"
		else
			"#{course.wins} / #{course.plays}"

	renderStageSong: (stage) ->
		"""
			<img src="http://images.djmaxcrew.com/Technika2/EN/icon/technika2/disc_s/#{stage.pattern.id}.png">
			<span class="effectors">
				#{@renderEffector(stage.effects.fade)}
				#{@renderEffector(stage.effects.line)}
				#{@renderEffector(stage.effects.scroll)}
			</span>
		"""
	
	renderEffector: (fx) ->
		fx
	
	renderStageInfo: (stage) ->
		"""
			<span class="song-name">#{stage.pattern.song.title}</span> <span class="song-pattern p#{stage.pattern.level}">#{stage.pattern.levelName}</span>
		"""
