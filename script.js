(function() {
  var Crew, Pattern, Renderer, Search, Song, Trie, app, songmap, sorters;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  app = {};
  songmap = {
    '@naege': 'Come To Me',
    '@youngwon': 'Forever',
    'thor': 'Thor',
    'ladymade': 'Ladymade Star',
    'oblivion': 'Oblivion',
    'cherokee': 'Cherokee',
    'dreamofwinds': 'Dream of Winds',
    'cypher': 'Cypher Gate',
    'd2': 'D2',
    'whiteblue': 'Whiteblue',
    'supersonicrmx': 'Supersonic RMX',
    'rage': 'Rage of Demon',
    'fermion': 'Fermion',
    'sweetdream': 'Sweet Dream',
    'beeutiful': 'BEE-U-TIFUL',
    'thenightstage': 'The Night Stage',
    'outlawreborn': 'Out Law -Reborn-',
    'enemystorm': 'Enemy Storm',
    'airwave': 'Airwave',
    'zetrmx1': 'Zet RMX',
    'divineservice': 'Divine Service',
    'sin': 'SIN',
    'blythe': 'BlythE',
    '@gobaek2': 'PFW2',
    'heartofwitch': 'Heart of Witch',
    'brandnewdays': 'Brand New Days',
    '@baramegelive': 'Ask The Wind Live',
    '@ner': 'To You',
    '@piano': 'Piano Concerto No.1',
    '@baramege': 'Ask The Wind',
    'iwantyou': 'I Want You',
    'someday': 'Someday',
    'cosmicfantastic': 'Cosmic Fantastic',
    'endofthemoon': 'End of the Moonlight',
    'oblivion': 'Oblivion',
    'djmax': 'DJMAX',
    'flea': 'Flea',
    'eternalmemory': 'Eternal Memory',
    'desperadormx1': 'Desperado RMX',
    'inmyheart': 'In My Heart',
    'luvflowrmx1': 'Luv Flow RMX',
    'color': 'Color',
    'secretworld': 'Secret World',
    'cozyquilt': 'Cozy Quilt',
    'rayof': 'Ray of Illuminati',
    'thelastdance': 'The Last Dance',
    'eternalfantasy': 'Eternal Fantasy',
    'loveis': 'Love is Beautiful',
    'spaceofsoul': 'Space of Soul',
    'coloursof': 'Colours of Sorrow',
    'theclear': 'The Clear Blue Sky',
    'dualstrikers': 'Dual Strikers',
    'coastaltempo': 'Coastal Tempo',
    'beyondthe': 'Beyond the Future',
    'closer': 'Closer',
    'freedom': 'Freedom',
    'honeymoon': 'Honeymoon',
    'sweetshining': 'SSSS',
    'sayitfrom': 'Say It From Your Heart',
    'beatudown': 'Beat U Down',
    'grave': 'Grave Consequence',
    'showline': 'Shoreline',
    'novarmx': 'Nova RMX',
    'sonof': 'Son Of Sun',
    'miles': 'Miles',
    'hexad': 'HEXAD',
    'fate': 'Fate',
    'enemyrmx1': 'Enemy Storm RMX',
    'access': 'Access',
    'yourown': 'Your Own Miracle',
    'lovemode': 'Love Mode',
    'playthefuture': 'Play The Future',
    'jupiter': 'Jupiter Driving',
    'xlasher': 'Xlasher'
  };
  sorters = (function() {
    var compare, stcompare;
    compare = function(a, b) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    };
    stcompare = function(num) {
      return function(a, b) {
        var titleCompare;
        if (!(b.course != null)) {
          return -1;
        }
        if (!(a.course != null)) {
          return 1;
        }
        titleCompare = compare(a.course.stages[num].pattern.song.title, b.course.stages[num].pattern.song.title);
        if (titleCompare === 0) {
          return compare(a.course.stages[num].pattern.id, b.course.stages[num].pattern.id);
        } else {
          return titleCompare;
        }
      };
    };
    return {
      rank: function(a, b) {
        return a.rank - b.rank;
      },
      name: function(a, b) {
        return compare(a.name.toLowerCase(), b.name.toLowerCase());
      },
      stage1: stcompare(0),
      stage2: stcompare(1),
      stage3: stcompare(2),
      winrate: function(a, b) {
        if (!(b.course != null)) {
          return -1;
        }
        if (!(a.course != null)) {
          return 1;
        }
        if (b.course.plays === 0) {
          return -1;
        }
        if (a.course.plays === 0) {
          return 1;
        }
        return -1 * compare(a.course.wins / a.course.plays, b.course.wins / b.course.plays);
      }
    };
  })();
  Song = (function() {
    Song.songs = {};
    Song.getSong = function(id) {
      if (!(id in this.songs)) {
        this.songs[id] = new this(id);
      }
      return this.songs[id];
    };
    function Song(id) {
      this.id = id;
      if (this.id in songmap) {
        this.title = songmap[this.id];
      } else {
        this.title = (this.id + '').replace(/^./, function(x) {
          return x.toUpperCase();
        });
      }
    }
    return Song;
  })();
  Pattern = (function() {
    var levelmap;
    Pattern.patterns = {};
    Pattern.getPattern = function(id) {
      if (!(id in this.patterns)) {
        this.patterns[id] = new this(id);
      }
      return this.patterns[id];
    };
    levelmap = {
      '1': 'NM',
      '2': 'HD',
      '3': 'MX'
    };
    function Pattern(id) {
      this.id = id;
      this.song = Song.getSong(this.id.replace(/_\d$/, ''));
      this.level = parseInt(this.id.charAt(this.id.length - 1));
      this.levelName = levelmap[this.level];
      this.title = this.song.title + ' ' + this.levelName;
    }
    return Pattern;
  })();
  Trie = (function() {
    function Trie() {
      this.data = {};
      this.crews = {};
    }
    Trie.prototype.get = function(id) {
      if (id in this.data) {
        return this.data[id];
      }
      return null;
    };
    Trie.prototype.allocate = function(id) {
      if (!(id in this.data)) {
        this.data[id] = new Trie;
      }
      return this.data[id];
    };
    return Trie;
  })();
  Search = (function() {
    function Search() {
      this.all = [];
      this.root = new Trie;
      this.setupElements();
    }
    Search.prototype.setupElements = function() {
      this.element = document.getElementById('search');
      this.timer = 0;
      return this.element.onkeyup = __bind(function() {
        clearTimeout(this.timer);
        return this.timer = setTimeout((__bind(function() {
          return this.update();
        }, this)), 0);
      }, this);
    };
    Search.prototype.update = function() {
      var results;
      results = this.search();
      return this.onupdate(results);
    };
    Search.prototype.search = function() {
      var key, last, list, matches, results, walk, word, _i, _len;
      last = null;
      results = {};
      list = [];
      matches = this.element.value.toLowerCase().match(/\S+/g);
      if (!matches) {
        return this.all;
      }
      walk = function(tree) {
        var crew, key, _results;
        if (!tree) {
          return;
        }
        for (key in tree.crews) {
          crew = tree.crews[key];
          if (last === null || crew.id in last) {
            results[crew.id] = crew;
          }
        }
        _results = [];
        for (key in tree.data) {
          _results.push(walk(tree.data[key]));
        }
        return _results;
      };
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        word = matches[_i];
        walk(this.find(word));
        last = results;
      }
      for (key in results) {
        list.push(results[key]);
      }
      return list;
    };
    Search.prototype.index = function(word, crew) {
      return this.access(word).crews[crew.id] = crew;
    };
    Search.prototype.access = function(word) {
      var i, node, _ref;
      node = this.root;
      for (i = 0, _ref = word.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        node = node.allocate(word.charAt(i));
      }
      return node;
    };
    Search.prototype.find = function(word) {
      var i, node, _ref;
      node = this.root;
      for (i = 0, _ref = word.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        node = node.get(word.charAt(i));
        if (node === null) {
          break;
        }
      }
      return node;
    };
    return Search;
  })();
  Crew = (function() {
    var nextID;
    nextID = 1;
    function Crew(obj) {
      var key, stage, _i, _len, _ref;
      this.id = nextID++;
      for (key in obj) {
        this[key] = obj[key];
      }
      this.keywords = [this.name];
      if (this.course != null) {
        this.keywords.push(this.course.producer);
        _ref = this.course.stages;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          stage = _ref[_i];
          stage.pattern = Pattern.getPattern(stage.pattern);
          this.keywords.push(stage.pattern.title);
        }
      }
      this.addKeywords();
    }
    Crew.prototype.addKeywords = function() {
      var matches, word, _i, _len, _results;
      matches = this.keywords.join(' ').toLowerCase().match(/\S+/g);
      if (matches) {
        _results = [];
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          word = matches[_i];
          _results.push(app.search.index(word, this));
        }
        return _results;
      }
    };
    return Crew;
  })();
  Renderer = (function() {
    function Renderer() {
      this.element = document.getElementById('main');
      this.data = app.data;
      this.source = app.search;
      this.source.onupdate = __bind(function(crews) {
        this.crews = crews;
        this.sort();
        return this.render();
      }, this);
      this.setupHandlers();
      this.setUpdatedText();
      this.sortModifier = 1;
      this.sortKey = 'rank';
    }
    Renderer.prototype.setUpdatedText = function() {
      return document.getElementById('updated').innerHTML = new Date(1000 * this.data.updated).toString();
    };
    Renderer.prototype.setupHandlers = function() {
      return this.element.onclick = __bind(function(e) {
        var target;
        target = e.target;
        if (e.target.hasAttribute('data-sort')) {
          this.setSortKey(e.target.getAttribute('data-sort'));
          return this.render();
        }
      }, this);
    };
    Renderer.prototype.setSortKey = function(key) {
      if (key === this.sortKey) {
        this.sortModifier *= -1;
      } else {
        this.sortModifier = 1;
        this.sortKey = key;
      }
      return this.sort();
    };
    Renderer.prototype.sort = function() {
      return this.crews.sort(__bind(function(a, b) {
        return sorters[this.sortKey](a, b) * this.sortModifier;
      }, this));
    };
    Renderer.prototype.render = function() {
      return this.element.innerHTML = "<table cellspacing=\"0\" class=\"crew-list\">" + (this.renderHeaders()) + (this.renderCrews()) + "\n</table>";
    };
    Renderer.prototype.renderHeaders = function() {
      return "<tr>\n	<th data-sort=\"rank\" class=\"" + (this.sortClass('rank')) + "\">Rank</th>\n	<th data-sort=\"name\" class=\"" + (this.sortClass('name')) + "\" colspan=\"2\">Name</th>\n	<th data-sort=\"stage1\" class=\"" + (this.sortClass('stage1')) + "\">Stage 1</th>\n	<th data-sort=\"stage2\" class=\"" + (this.sortClass('stage2')) + "\">Stage 2</th>\n	<th data-sort=\"stage3\" class=\"" + (this.sortClass('stage3')) + "\">Stage 3</th>\n	<th>Course</th>\n	<th data-sort=\"winrate\" class=\"" + (this.sortClass('winrate')) + " last\">Win Rate</th>\n</tr>";
    };
    Renderer.prototype.sortClass = function(k) {
      if (this.sortKey === k) {
        if (this.sortModifier >= 0) {
          return "sort-ascending";
        } else {
          return "sort-descending";
        }
      } else {
        return "sort-none";
      }
    };
    Renderer.prototype.renderCrews = function() {
      var crew, html, _i, _len, _ref;
      html = '';
      _ref = this.crews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        crew = _ref[_i];
        html += this.renderCrew(crew);
      }
      return html;
    };
    Renderer.prototype.renderCrew = function(crew) {
      return "<tr class=\"crew\">\n	<td class=\"rank\">" + crew.rank + ".</td>\n	<td class=\"emblem\">" + (this.renderEmblem(crew)) + "</td>\n	<td class=\"name\">\n		<span class=\"crew-name\">" + crew.name + "</span>\n		<span class=\"crew-points\">" + crew.points + " pts</span>\n	</td>\n	" + (this.renderCourse(crew.course)) + "\n</tr>";
    };
    Renderer.prototype.renderEmblem = function(crew) {
      return "<img\n	src=\"http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/pattern/" + crew.emblemPattern.id + ".png\"\n	style=\"background:url(http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/plate/" + crew.emblemPlate.id + ".png\"\n	width=\"30\" height=\"30\">";
    };
    Renderer.prototype.renderCourse = function(course) {
      if (!(course != null)) {
        return "<td colspan=\"5\" class=\"no-course\">(No Course)</td>";
      }
      return "<td class=\"song\">" + (this.renderStageSong(course.stages[0])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[1])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[2])) + "</td>\n<td class=\"course-info\">\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[0])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[1])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[2])) + "</span>\n</td>\n<td class=\"win-info\">\n	<span class=\"percentage\">" + (this.renderCoursePercentage(course)) + "</span>\n	<span class=\"details\">\n		" + course.wins + " / " + course.plays + "\n	</span>\n	<span title=\"Producer\" class=\"producer\">" + course.producer + "</span>\n</td>";
    };
    Renderer.prototype.renderCoursePercentage = function(course) {
      if (course.plays === 0) {
        return "N/A";
      } else {
        return "" + (Math.round(course.wins / course.plays * 100)) + "%";
      }
    };
    Renderer.prototype.renderStageSong = function(stage) {
      return "<img src=\"http://images.djmaxcrew.com/Technika2/EN/icon/technika2/disc_s/" + stage.pattern.id + ".png\">\n<span class=\"effectors\">\n	" + (this.renderEffector(stage.effects.fade)) + "\n	" + (this.renderEffector(stage.effects.line)) + "\n	" + (this.renderEffector(stage.effects.scroll)) + "\n</span>";
    };
    Renderer.prototype.renderEffector = function(fx) {
      return fx;
    };
    Renderer.prototype.renderStageInfo = function(stage) {
      return "<span class=\"song-name\">" + stage.pattern.song.title + "</span> <span class=\"song-pattern p" + stage.pattern.level + "\">" + stage.pattern.levelName + "</span>";
    };
    return Renderer;
  })();
  window.gotData = function(x) {
    var crewData;
    app.search = new Search;
    x.crews = (function() {
      var _i, _len, _ref, _results;
      _ref = x.crews;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        crewData = _ref[_i];
        _results.push(new Crew(crewData));
      }
      return _results;
    })();
    app.data = x;
    app.renderer = new Renderer;
    app.search.all = x.crews;
    return app.search.update();
  };
}).call(this);
