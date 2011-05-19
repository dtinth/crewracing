


class HashChecker

	class HashListener

		constructor: (@main, @name, @onchange) ->
			@value = null

		check: ->
			v = @get()
			return if v == @value
			@value = v
			@onchange(@value)

		get: -> @main.get @name
		set: (v) -> @main.set @name, v
		del: -> @main.del @name

	constructor: ->
		@initialized = false
		@listeners = {}
	
	start: ->
		return if @initialized
		@hash = ''
		@hashObj = {}
		if "onhashchange" of window
			window.onhashchange = => setTimeout (=> @checkHash()), 1
		else
			setInterval (=> @checkHash()), 500
		setTimeout (=> @checkHash()), 100
		@initialized = true
	
	listen: (name, listener) ->
		@listeners[name] = new HashListener @, name, listener

	get: (name) -> @hashObj[name]

	set: (name, value) -> @hashObj[name] = value; @listeners[name].value = value if @listeners[name]; @update()
	del: (name) -> delete @hashObj[name]; @listeners[name].value = undefined if @listeners[name]; @update()

	update: ->
		location.hash = @hash = '#' + (encodeURIComponent(name) + (if value == true then "" else "=" + encodeURIComponent(value)) for name, value of @hashObj).join '&'

	checkHash: ->
		return if location.hash == @hash
		@hash = location.hash
		@hashObj = {}
		for pair in @hash.replace(/^#/, '').split('&')
			continue if pair == ''
			key = pair
			value = true
			position = pair.indexOf '='
			if position > -1
				key = pair.substr 0, position
				value = decodeURIComponent pair.substr position + 1
			key = decodeURIComponent key
			continue if key == ''
			@hashObj[key] = value
		@onbegin()
		for key, listener of @listeners
			listener.check()
		@onend()
	
	onbegin: ->
	onend:   ->

module.exports = new HashChecker

