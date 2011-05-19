#
# storage.coffee
#
# Provides persistent client-side data storage for each crew.
#


id = (uid, key) -> "#{uid}-#{key}"

exports.checkFlag = (uid, key) ->

	if localStorage?
		if localStorage.getItem?
			return localStorage.getItem(id(uid, key)) == 'yes'

	return false

exports.setFlag = (uid, key, y) ->
	
	if y then localStorage.setItem(id(uid, key), 'yes') else localStorage.removeItem(id(uid, key))


