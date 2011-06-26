<?php

require_once 'lib-song-db.php';

class SongFetcher {

	function run() {
		$this->db = new SongDB;
		$this->fetch();
		$this->db->save();
	}

	function fetch() {
		$this->fetchMode(1);
		$this->fetchMode(2);
		$this->fetchMode(3);
	}

	function fetchMode($mode) {
		for ($page = 1; $this->fetchModePage($mode, $page); $page++) { }
	}

	function fetchModePage($mode, $page) {
		echo "Fetch mode $mode page $page\n";
		$url = 'http://www.djmaxcrew.com/ranking/ranking_pop_mixing01.asp?rmenu=04&page=' . $page . '&mode=' . $mode;
		$contents = file_get_contents($url);
		$doc = new DOMDocument;
		@$doc->loadHTML($contents);
		$xp = new DOMXPath($doc);
		$modenames = array( 1 => 'nm', 2 => 'hd', 3 => 'mx' );
		$modename = $modenames[$mode];
		foreach ($xp->query('//td[@width="215"][@height="70"]/table[.//a][.//img]') as $table) {
			$image = $xp->query('.//img', $table)->item(0);
			$link  = $xp->query('.//a', $table)->item(0);
			if (preg_match('~([^/]+)_\d\.png$~', $image->getAttribute('src'), $match)) {
				$id = $match[1];
				$title = $link->firstChild->nodeValue;
				$song = $this->db->get($id);
				if (!isset($song->title))
					$song->title = $title;
				if (!isset($song->$modename))
					$song->$modename = 0;
			}
		}
		$total = intval(substr($xp->query('//table[@width="725"]//td[@align="center"]/table[@align="center"]//td[3]/img')->item(0)->getAttribute('onclick'), 9));
		return $page < $total;
	}

}


$sf = new SongFetcher;
$sf->run();

