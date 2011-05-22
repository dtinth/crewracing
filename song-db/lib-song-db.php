<?php

function norm($x) {
	return str_replace("\r", "\n", str_replace("\r\n", "\n", $x));
}

class SongDB {

	function __construct() {
		$this->data = array();
		foreach (explode("\n---\n", norm(file_get_contents('song-db.txt'))) as $section) {
			$obj = array();
			foreach (explode("\n", trim($section)) as $line) {
				if (false !== ($colon = strpos($line, ':'))) {
					$left = trim(substr($line, 0, $colon));
					$right = trim(substr($line, 1 + $colon));
					$obj[$left] = $right;
				}
			}
			if (!empty($obj))
				$this->data[] = (object)$obj;
		}
	}

	function save() {
		file_put_contents('song-db.txt', implode("\n---\n", array_map(function($x) {
			$lines = array();
			foreach ((array)$x as $k => $v) {
				$lines[] = $k . ': ' . $v;
			}
			return implode("\n", $lines);
		}, $this->data)));
	}

	function get($name) {
		foreach ($this->data as $v) {
			if ($v->name == $name) return $v;
		}
		$v = (object)array('name' => $name);
		$this->data[] = $v;
		return $v;
	}

}
