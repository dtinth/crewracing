
arrow = (yo) ->
	ctx.lineWidth = 3
	x = 7
	y = 10 + yo
	spreadx = 5
	spready = 4
	ctx.beginPath()
	ctx.moveTo x - spreadx, y - spready
	ctx.lineTo x, y
	ctx.lineTo x + spreadx, y - spready
	ctx.stroke()

newFile 18, 18
ctx.strokeStyle = '#888'
arrow 0
saveFile 'arrow'

newFile 18, 18
ctx.strokeStyle = 'rgba(0,0,0,0.4)'
arrow -1
ctx.strokeStyle = '#ddd'
arrow 0
saveFile 'arrow-open'
