<?php


class Store {
	function __construct($data = array()) {
		foreach ($data as $k => $v) {
			$this->$k = $v;
		}
	}
}

class Crew extends Store {
}

class Course extends Store {
	var $stages;
	var $producer;
	var $plays;
	var $wins;
}

class Stage extends Store {
}

class Song {
	function __construct($url) {
		$this->id = basename($url, '.png');
		$this->songID = strstr($this->id, '_', true);
		$this->level = intval(substr(strstr($this->id, '_'), 1));
	}
}

class Effects {
	var $fade = '-';
	var $line = '-';
	var $scroll = '-';
}

class EmblemPlate {
	function __construct($url) {
		$this->id = basename($url, '.png');
	}
}

class EmblemPattern {
	function __construct($url) {
		$this->id = basename($url, '.png');
	}
}

class CrewListLoader {
	
	var $url;

	function __construct($url) {
		$this->url = $url;
	}

	function crewFromElement($node) {
		$crew = new Crew(array(
			'rank'          => intval($this->xp->query('./td[@width=70]/span/text()', $node)->item(0)->nodeValue),
			'previousRanks' => array(
				intval($this->xp->query('./td[@width=320]/table//tr[1]/td[2]/span[2]/text()', $node)->item(0)->nodeValue),
				intval($this->xp->query('./td[@width=320]/table//tr[1]/td[4]/span[2]/text()', $node)->item(0)->nodeValue),
			),
			'emblemPlate'   => new EmblemPlate($this->xp->query('./td[@width=61]/table/@background', $node)->item(0)->nodeValue),
			'emblemPattern' => new EmblemPattern($this->xp->query('./td[@width=61]/table//img/@src', $node)->item(0)->nodeValue),
			'name'          => trim($this->xp->query('./td[@width=170]/span/text()', $node)->item(0)->nodeValue),
			'points'        => intval($this->xp->query('./td[@width=170]/span/text()', $node)->item(1)->nodeValue),
			'course'        => $this->courseFromElement($node->nextSibling),
		));
		return $crew;
	}

	function courseFromElement($node) {
		if ($this->xp->query('.//table', $node)->length == 0) {
			return null;
		}
		$stages = array();
		for ($i = 0; $i < 3; $i ++) {
			$stages[] = new Stage(array(
				'song'    => null,
				'pattern' => null,
				'effects' => new Effects,
			));
		}
		foreach ($this->xp->query('.//td[@width=52]/img/@src', $node) as $k => $v) {
			$stages[$k]->song = new Song($v->nodeValue);
			$stages[$k]->pattern = basename($v->nodeValue, '.png');
		}
		$categories = array('fade', 'line', 'scroll');
		foreach (array_map('trim', explode(':', trim($this->xp->query('.//td[@width=170]/span/text()', $node)->item(0)->nodeValue))) as $stage => $effector) {
			foreach (explode('/', $effector) as $k => $v) {
				$category = $categories[$k];
				$stages[$stage]->effects->$category = $v;
			}
		}
		$plays = $wins = 0;
		if (preg_match_all('~\d+~', $this->xp->query('.//td[@width=170]/span/text()', $node)->item(1)->nodeValue, $matches)) {
			$plays = intval($matches[0][0]);
			$wins = intval($matches[0][1]);
		}
		$nbsp = iconv('iso-8859-1', 'utf-8', chr(160));
		return new Course(array(
			'stages' => $stages,
			'producer' => trim(str_replace($nbsp, ' ', $this->xp->query('.//td[@width=110]/span/text()', $node)->item(0)->nodeValue)),
			'plays' => $plays,
			'wins' => $wins,
		));
	}

	function load(&$out, $coursesOnly = false) {
		
		$this->data = file_get_contents($this->url);
		$this->doc = new DOMDocument;
		@$this->doc->loadHTML($this->data);
		
		$query = '//table[@width=725]//table[@width=661]//table[@width=661][.//table[@width=661]]//tr[@onmouseover]';
		$this->xp = new DOMXPath($this->doc);
		
		$list = $this->xp->query($query);
		foreach ($list as $node) {
			$crew = $this->crewFromElement($node);
			if (!$coursesOnly || $crew->course) {
				$out[] = $crew;
			}
		}
		return $list->length;

	}

}

$crews = array();

//$prefix = './test-data/testdata.';
$prefix = 'http://www.djmaxcrew.com/crewrace/crewrace_ing.asp?page=';

$stderr = @fopen('php://stderr', 'w');
for ($page = 1; $page < 50; $page ++) {
	$url = $prefix . $page;
	if ($stderr) {
		fprintf($stderr, "Fetching: %s\n", $url);
	}
	$loader = new CrewListLoader($url);
	if ($loader->load($crews, $page > 3) == 0) {
		fprintf($stderr, "No more pages!\n");
		break;
	}
}

echo json_encode(array(
	'updated' => time(),
	'crews' => $crews
));
