
app = {}

songmap =
	'@naege': 'Come To Me'
	'@youngwon': 'Forever'
	'thor': 'Thor'
	'ladymade': 'Ladymade Star'
	'oblivion': 'Oblivion'
	'cherokee': 'Cherokee'
	'dreamofwinds': 'Dream of Winds'
	'cypher': 'Cypher Gate'
	'd2': 'D2'
	'whiteblue': 'Whiteblue'
	'supersonicrmx': 'Supersonic RMX'
	'rage': 'Rage of Demon'
	'fermion': 'Fermion'
	'sweetdream': 'Sweet Dream'
	'beeutiful': 'BEE-U-TIFUL'
	'thenightstage': 'The Night Stage'
	'outlawreborn': 'Out Law -Reborn-'
	'enemystorm': 'Enemy Storm'
	'airwave': 'Airwave'
	'zetrmx1': 'Zet RMX'
	'divineservice': 'Divine Service'
	'sin': 'SIN'
	'blythe': 'BlythE'
	'@gobaek2': 'PFW2'
	'heartofwitch': 'Heart of Witch'
	'brandnewdays': 'Brand New Days'
	'@baramegelive': 'Ask The Wind Live'
	'@ner': 'To You'
	'@piano': 'Piano Concerto No.1'
	'@baramege': 'Ask The Wind'
	'iwantyou': 'I Want You'
	'someday': 'Someday'
	'cosmicfantastic': 'Cosmic Fantastic'
	'endofthemoon': 'End of the Moonlight'
	'oblivion': 'Oblivion'
	'djmax': 'DJMAX'
	'flea': 'Flea'
	'eternalmemory': 'Eternal Memory'
	'desperadormx1': 'Desperado RMX'
	'inmyheart': 'In My Heart'
	'luvflowrmx1': 'Luv Flow RMX'
	'color': 'Color'
	'secretworld': 'Secret World'
	'cozyquilt': 'Cozy Quilt'
	'rayof': 'Ray of Illuminati'
	'thelastdance': 'The Last Dance'
	'eternalfantasy': 'Eternal Fantasy'
	'loveis': 'Love is Beautiful'
	'spaceofsoul': 'Space of Soul'
	'coloursof': 'Colours of Sorrow'
	'theclear': 'The Clear Blue Sky'
	'dualstrikers': 'Dual Strikers'
	'coastaltempo': 'Coastal Tempo'
	'beyondthe': 'Beyond the Future'
	'closer': 'Closer'
	'freedom': 'Freedom'
	'honeymoon': 'Honeymoon'
	'sweetshining': 'SSSS'
	'sayitfrom': 'Say It From Your Heart'
	'beatudown': 'Beat U Down'
	'grave': 'Grave Consequence'
	'showline': 'Shoreline'
	'novarmx': 'Nova RMX'
	'sonof': 'Son Of Sun'
	'miles': 'Miles'
	'hexad': 'HEXAD'
	'fate': 'Fate'
	'enemyrmx1': 'Enemy Storm RMX'
	'access': 'Access'
	'yourown': 'Your Own Miracle'
	'lovemode': 'Love Mode'
	'playthefuture': 'Play The Future'
	'jupiter': 'Jupiter Driving'
	'xlasher': 'Xlasher'

sorters = do ->

	compare = (a, b) ->
		if a > b
			1
		else if a < b
			-1
		else
			0

	stcompare = (num) -> (a, b) ->
		return -1 if not b.course?
		return 1 if not a.course?
		titleCompare = compare a.course.stages[num].pattern.song.title, b.course.stages[num].pattern.song.title
		if titleCompare == 0
			compare a.course.stages[num].pattern.id, b.course.stages[num].pattern.id
		else
			titleCompare

	rank: (a, b) -> a.rank - b.rank
	name: (a, b) -> compare a.name.toLowerCase(), b.name.toLowerCase()
	stage1: stcompare 0
	stage2: stcompare 1
	stage3: stcompare 2
	winrate: (a, b) ->
		return -1 if not b.course?
		return 1 if not a.course?
		return -1 if b.course.plays == 0
		return 1 if a.course.plays == 0
		-1 * compare a.course.wins / a.course.plays, b.course.wins / b.course.plays

class Song

	@songs: {}

	@getSong: (id) ->
		if not (id of @songs)
			@songs[id] = new @(id)
		@songs[id]
	
	constructor: (@id) ->
		if @id of songmap
			@title = songmap[@id]
		else
			@title = (@id + '').replace /^./, (x) -> x.toUpperCase()

class Pattern

	@patterns: {}

	@getPattern: (id) ->
		if not (id of @patterns)
			@patterns[id] = new @(id)
		@patterns[id]

	levelmap =
		'1': 'NM'
		'2': 'HD'
		'3': 'MX'

	constructor: (@id) ->
		@song = Song.getSong @id.replace /_\d$/, ''
		@level = parseInt @id.charAt @id.length - 1
		@levelName = levelmap[@level]
		@title = @song.title + ' ' + @levelName

class Trie

	constructor: ->
		@data = {}
		@crews = {}
	
	get: (id) ->
		if id of @data
			return @data[id]
		return null
	
	allocate: (id) ->
		if not (id of @data)
			@data[id] = new Trie
		return @data[id]

class Search

	constructor: ->
		@all = []
		@root = new Trie
		@setupElements()
	
	setupElements: ->
		@element = document.getElementById 'search'
		@timer = 0
		@element.onkeyup = =>
			clearTimeout @timer
			@timer = setTimeout (=> @update()), 0
		@element.onchange = => @update()
	
	update: ->
		results = @search()
		@onupdate results

	search: ->
		last = null
		results = {}
		list = []
		matches = @element.value.toLowerCase().match(/\S+/g)
		if not matches
			return @all
		walk = (tree) ->
			if not tree
				return
			for key of tree.crews
				crew = tree.crews[key]
				if last is null or crew.id of last
					results[crew.id] = crew
			for key of tree.data
				walk tree.data[key]
		for word in matches
			walk @find word
			last = results
		for key of results
			list.push results[key]
		list

	index: (word, crew) ->
		@access(word).crews[crew.id] = crew

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

class Crew

	nextID = 1

	constructor: (obj) ->
		@id = nextID++
		for key of obj
			@[key] = obj[key]
		@keywords = [@name]
		if @course?
			@keywords.push @course.producer
			for stage in @course.stages
				stage.pattern = Pattern.getPattern stage.pattern
				@keywords.push stage.pattern.title
		@addKeywords()
	
	addKeywords: ->
		matches = @keywords.join(' ').toLowerCase().match(/\S+/g)
		if matches
			for word in matches
				app.search.index word, @

class Renderer

	constructor: ->
		@element = document.getElementById 'main'
		@data    = app.data
		@source  = app.search
		@source.onupdate = (@crews) => @sort(); @render()
		@setupHandlers()
		@setUpdatedText()

		@sortModifier = 1
		@sortKey = 'rank'

	setUpdatedText: ->
		document.getElementById('updated').innerHTML = new Date(1000 * @data.updated).toString()

	setupHandlers: ->
		@element.onclick = (e) =>
			target = e.target
			if e.target.hasAttribute 'data-sort'
				@setSortKey e.target.getAttribute 'data-sort'
				@render()

	setSortKey: (key) ->
		if key == @sortKey
			@sortModifier *= -1
		else
			@sortModifier = 1
			@sortKey = key
		@sort()
	
	sort: ->
		@crews.sort (a, b) => sorters[@sortKey](a, b) * @sortModifier

	render: ->
		@element.innerHTML = """
			<table cellspacing="0" class="crew-list">#{@renderHeaders()}#{@renderCrews()}
			</table>
		"""

	renderHeaders: ->
		"""
			<tr>
				<th data-sort="rank" class="#{@sortClass 'rank'}">Rank</th>
				<th data-sort="name" class="#{@sortClass 'name'}" colspan="2">Name</th>
				<th data-sort="stage1" class="#{@sortClass 'stage1'}">Stage 1</th>
				<th data-sort="stage2" class="#{@sortClass 'stage2'}">Stage 2</th>
				<th data-sort="stage3" class="#{@sortClass 'stage3'}">Stage 3</th>
				<th>Course</th>
				<th data-sort="winrate" class="#{@sortClass 'winrate'} last">Win Rate</th>
			</tr>
		"""
	
	sortClass: (k) ->
		if @sortKey == k
			if @sortModifier >= 0
				"sort-ascending"
			else
				"sort-descending"
		else
			"sort-none"

	renderCrews: ->
		html = ''
		html += @renderCrew(crew) for crew in @crews
		html

	renderCrew: (crew) ->
		"""
			<tr class="crew">
				<td class="rank">#{crew.rank}.</td>
				<td class="emblem">#{@renderEmblem(crew)}</td>
				<td class="name">
					<span class="crew-name">#{crew.name}</span>
					<span class="crew-points">#{crew.points} pts</span>
				</td>
				#{@renderCourse(crew.course)}
			</tr>
		"""
	
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
				<span class="details">
					#{course.wins} / #{course.plays}
				</span>
				<span title="Producer" class="producer">#{course.producer}</span>
			</td>
		"""
	
	renderCoursePercentage: (course) ->
		if course.plays is 0
			"N/A"
		else
			"#{Math.round(course.wins / course.plays * 100)}%"
	
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

window.gotData = (x) ->
	app.search = new Search
	x.crews = (new Crew crewData for crewData in x.crews)
	app.data = x
	app.renderer = new Renderer
	app.search.all = x.crews
	app.search.update()

