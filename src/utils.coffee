#
# utils.coffee
#
# Utility functions
#


exports.th = (num) ->
	if 11 <= num % 100 <= 19
		num + '<sup>th</sup>'
	else if num % 10 == 1
		num + '<sup>st</sup>'
	else if num % 10 == 2
		num + '<sup>nd</sup>'
	else if num % 10 == 3
		num + '<sup>rd</sup>'
	else
		num + '<sup>th</sup>'

exports.createMask = (cont) ->
	obj = {}
	cont.call (o) ->
		obj[o.id] = o
	return obj

