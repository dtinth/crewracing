

rect = (color, x, y, w, h) ->
	
	ctx.fillStyle = color
	ctx.fillRect x, y, w, h


checkbox = ->

	ctx.globalAlpha = 0.4
	rect '#888', 0, 1, w, w

	ctx.globalAlpha = 1
	rect '#888', 0, 0, w, w

	rect '#ddd', 1, 1, w - 2, w - 2
	rect '#eee', 1, 2, w - 2, w - 3
	rect '#fff', 2, 3, w - 3, w - 4

checkmark = ->

	x = 7
	y = 15
	left = 3.7
	right = 7.7
	weight = 4

	ctx.fillStyle = '#c19'

	ctx.beginPath()
	ctx.moveTo x, y
	ctx.lineTo x - left, y - left
	ctx.lineTo x - left, y - left - weight
	ctx.lineTo x, y - weight
	ctx.lineTo x + right, y - right - weight
	ctx.lineTo x + right, y - right
	ctx.lineTo x, y
	ctx.fill()


newFile 18, 19
checkbox()
ctx.globalCompositeOperation = 'destination-out'
rect 'rgba(0,0,0,0.5)', 0, 0, w, h
saveFile 'checkbox'


newFile 18, 19
checkbox()
checkmark()
saveFile 'checkbox-checked'









