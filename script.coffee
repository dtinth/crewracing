
app = {}

songname = (id) ->
	id.replace /_\d$/, ''

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

songtitle = (name) ->
	if name of songmap
		songmap[name]
	else
		(name + '').replace /^./, (x) -> x.toUpperCase()

class Renderer

	constructor: ->
		@element = document.getElementById 'main'
		@data    = app.data

	render: ->
		@element.innerHTML = """
			<table cellspacing="0" class="crew-list">#{@renderCrews()}
			</table>
		"""

	renderCrews: ->
		html = ''
		html += @renderCrew(crew) for crew in @data.crews
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
			</td>
		"""
	
	renderCoursePercentage: (course) ->
		if course.plays is 0
			"N/A"
		else
			"#{Math.round(course.wins / course.plays * 100)}%"
	
	renderStageSong: (stage) ->
		"""
			<img src="http://images.djmaxcrew.com/Technika2/EN/icon/technika2/disc_s/#{stage.song.id}.png">
			<span class="effectors">
				#{@renderEffector(stage.effects.fade)}
				#{@renderEffector(stage.effects.line)}
				#{@renderEffector(stage.effects.scroll)}
			</span>
		"""
	
	renderEffector: (fx) ->
		fx
	
	levelMap =
		'1': 'NM'
		'2': 'HD'
		'3': 'MX'

	renderStageInfo: (stage) ->
		"""
			<span class="song-name">#{songtitle songname stage.song.id}</span> <span class="song-pattern p#{stage.song.level}">#{levelMap[stage.song.level]}</span>
		"""

window.gotData = (x) ->
	app.data = x
	app.renderer = new Renderer
	app.renderer.render()

