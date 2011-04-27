[Crewracing](http://dtinth.github.com/crewracing/) (Server-Side Part)
==================================================

This PHP script fetches the current ranking from the crew race and echo out the JSON data suitable for the [client](https://github.com/dtinth/crewracing).

It's just JSON, and to make it work with the client, must be wrapped in a function call `gotData(json data here);`. You can do so by

    echo "gotData(";
	include 'fetchdata.php';
	echo ");";

I actually do that in my server, I set up a cron job that runs a script that `ob_start()` before including, then use `ob_get_clean()` to
get the JSONP data, and finally upload it to my website, which makes it available for the live client here.

