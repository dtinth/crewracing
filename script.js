(function() {
  var Crew, Masker, Pattern, Renderer, Search, Song, Trie, app, findMachineRanking, listToMask, processData, songmap, sorters, th;
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
    'xlasher': 'Xlasher',
    'masairmx1': 'Masai RMX',
    'keystothe': 'Keys to the World',
    'area7': 'Area 7',
    'burnitdown': 'Burn It Down',
    'monoxide': 'MonoXide',
    'getdown': 'Get Down',
    'theguilty': 'The Guilty'
  };
  th = function(num) {
    var _ref;
    if ((11 <= (_ref = num % 100) && _ref <= 19)) {
      return num + '<sup>th</sup>';
    } else if (num % 10 === 1) {
      return num + '<sup>st</sup>';
    } else if (num % 10 === 2) {
      return num + '<sup>nd</sup>';
    } else if (num % 10 === 3) {
      return num + '<sup>rd</sup>';
    } else {
      return num + '<sup>th</sup>';
    }
  };
  sorters = (function() {
    var cmp, compare, namecompare, rankcompare, require, requirecourse, stagecompare, winratecompare;
    cmp = function(a, b, cont) {
      if (cont == null) {
        cont = function() {
          return 0;
        };
      }
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return cont();
      }
    };
    compare = function(func) {
      return function(a, b, cont) {
        return cmp(func.call(a), func.call(b), cont);
      };
    };
    require = function(func) {
      return function(a, b, cont) {
        var ares, bres;
        ares = func.call(a);
        bres = func.call(b);
        if (!ares && !bres) {
          return 0;
        }
        if (!ares) {
          return 1;
        }
        if (!bres) {
          return -1;
        }
        return cont();
      };
    };
    rankcompare = function(a, b) {
      return compare(function() {
        return this.getAppropriateRank();
      })(a, b);
    };
    namecompare = function(a, b) {
      return compare(function() {
        return this.name.toLowerCase();
      })(a, b);
    };
    requirecourse = function(a, b, cont) {
      return require(function() {
        return this.course != null;
      })(a, b, function() {
        return cont();
      });
    };
    stagecompare = function(num) {
      return function(a, b) {
        return requirecourse(a, b, function() {
          return compare(function() {
            return this.course.stages[num].pattern.song.title;
          })(a, b, function() {
            return compare(function() {
              return this.course.stages[num].pattern.id;
            })(a, b, function() {
              return namecompare(a, b);
            });
          });
        });
      };
    };
    winratecompare = function(a, b) {
      return requirecourse(a, b, function() {
        return require(function() {
          return this.course.plays > 0;
        })(a, b, function() {
          return compare(function() {
            return -1 * this.course.wins / this.course.plays;
          })(a, b, function() {
            return compare(function() {
              return -1 * this.course.plays;
            })(a, b, function() {
              return rankcompare(a, b);
            });
          });
        });
      });
    };
    return {
      rank: rankcompare,
      name: namecompare,
      stage1: stagecompare(0),
      stage2: stagecompare(1),
      stage3: stagecompare(2),
      winrate: winratecompare
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
  Masker = (function() {
    function Masker() {
      var name, _i, _len, _ref;
      this.masks = ['live', 'machine'];
      this.elements = {};
      _ref = this.masks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this.elements[name] = document.getElementById('mask-' + name);
        this.registerHandler(this.elements[name], name);
      }
      this.activeMask = 'machine';
      this.update();
    }
    Masker.prototype.registerHandler = function(el, name) {
      return el.onclick = __bind(function() {
        this.setMask(name);
        return this.update();
      }, this);
    };
    Masker.prototype.setMask = function(activeMask) {
      this.activeMask = activeMask;
    };
    Masker.prototype.update = function() {
      var name, _i, _len, _ref;
      _ref = this.masks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this.elements[name].className = (name === this.activeMask ? 'active' : 'inactive');
      }
      return this.onupdate();
    };
    Masker.prototype.onupdate = function() {};
    return Masker;
  })();
  Search = (function() {
    function Search() {
      this.limit = 90;
      this.root = new Trie;
      this.setupElements();
    }
    Search.prototype.setupElements = function() {
      this.element = document.getElementById('search');
      this.timer = 0;
      this.element.onkeyup = __bind(function() {
        clearTimeout(this.timer);
        return this.timer = setTimeout((__bind(function() {
          return this.update();
        }, this)), 0);
      }, this);
      this.element.onchange = __bind(function() {
        return this.update();
      }, this);
      app.masker.onupdate = __bind(function() {
        return this.update();
      }, this);
      this.filtLink = document.getElementById('filter-link');
      this.filtCheck = document.getElementById('filter-checkmark');
      return this.filtLink.onclick = __bind(function() {
        return this.toggleLimit();
      }, this);
    };
    Search.prototype.toggleLimit = function() {
      if (this.limit === Infinity) {
        this.limit = 90;
      } else {
        this.limit = Infinity;
      }
      return this.update();
    };
    Search.prototype.update = function() {
      var results;
      this.filtCheck.className = this.limit === Infinity ? "checked" : "unchecked";
      results = this.search();
      return this.onupdate(results);
    };
    Search.prototype.onupdate = function() {};
    Search.prototype.search = function() {
      var addCrew, crew, key, last, list, matches, results, walk, word, _i, _j, _len, _len2, _ref;
      last = app.data.masks[app.masker.activeMask];
      results = {};
      list = [];
      matches = this.element.value.toLowerCase().match(/\S+/g);
      addCrew = __bind(function(crew) {
        if (crew.getAppropriateRank() <= this.limit) {
          return results[crew.id] = crew;
        }
      }, this);
      if (!matches) {
        _ref = app.data.crews;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          crew = _ref[_i];
          if (crew.id in last) {
            addCrew(crew);
          }
        }
      } else {
        walk = function(tree) {
          var key, _results;
          if (!tree) {
            return;
          }
          for (key in tree.crews) {
            crew = tree.crews[key];
            if (last === null || crew.id in last) {
              addCrew(crew);
            }
          }
          _results = [];
          for (key in tree.data) {
            _results.push(walk(tree.data[key]));
          }
          return _results;
        };
        for (_j = 0, _len2 = matches.length; _j < _len2; _j++) {
          word = matches[_j];
          walk(this.find(word));
          last = results;
          results = {};
        }
        results = last;
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
        this.course.crew = this;
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
    Crew.prototype.getAppropriateRank = function() {
      if (app.masker.activeMask === 'machine') {
        return this.machineRank;
      }
      return this.rank;
    };
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
      if (this.crews.length === 0) {
        return "<tr class=\"no-matches\">\n	<td colspan=\"8\">No matches!</td>\n</tr>";
      }
      html = '';
      _ref = this.crews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        crew = _ref[_i];
        html += this.renderCrew(crew);
      }
      return html;
    };
    Renderer.prototype.renderCrew = function(crew) {
      return "<tr class=\"crew\">\n	<td class=\"rank\">" + (crew.getAppropriateRank()) + ".</td>\n	<td class=\"emblem\">" + (this.renderEmblem(crew)) + "</td>\n	<td class=\"name\">\n		<span class=\"crew-name\">" + crew.name + "</span>\n		<span class=\"crew-points\">" + crew.points + " pts" + (this.renderAdditionalRanking(crew)) + "</span>\n	</td>\n	" + (this.renderCourse(crew.course)) + "\n</tr>";
    };
    Renderer.prototype.renderAdditionalRanking = function(crew) {
      if (app.masker.activeMask === "live") {
        return "";
      }
      return " (" + (th(crew.rank)) + ")";
    };
    Renderer.prototype.renderEmblem = function(crew) {
      return "<img\n	src=\"http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/pattern/" + crew.emblemPattern.id + ".png\"\n	style=\"background:url(http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/plate/" + crew.emblemPlate.id + ".png\"\n	width=\"30\" height=\"30\">";
    };
    Renderer.prototype.renderCourse = function(course) {
      if (!(course != null)) {
        return "<td colspan=\"5\" class=\"no-course\">(No Course)</td>";
      }
      return "<td class=\"song\">" + (this.renderStageSong(course.stages[0])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[1])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[2])) + "</td>\n<td class=\"course-info\">\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[0])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[1])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[2])) + "</span>\n</td>\n<td class=\"win-info\">\n	<span class=\"percentage\">" + (this.renderCoursePercentage(course)) + "</span>\n	<span class=\"details\">" + (this.renderWinRateDetails(course)) + "</span>\n	<span title=\"Producer\" class=\"producer\">" + course.producer + "</span>\n</td>";
    };
    Renderer.prototype.renderCoursePercentage = function(course) {
      if (course.crew.machineRank > 90 && course.plays === 0) {
        return "<span class=\"na-unranked\">&times;</span>";
      } else if (course.plays === 0) {
        return "<span class=\"na-noplays\">&mdash;</span>";
      } else {
        return "" + (Math.round(course.wins / course.plays * 100)) + "%";
      }
    };
    Renderer.prototype.renderWinRateDetails = function(course) {
      if (course.crew.machineRank > 90 && course.plays === 0) {
        return "Unranked";
      } else if (course.plays === 0) {
        return "No plays";
      } else {
        return "" + course.wins + " / " + course.plays;
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
  findMachineRanking = function(list) {
    var i, _ref, _results;
    list = list.slice();
    list.sort(function(a, b) {
      var i, _ref;
      for (i = 0, _ref = Math.min(a.previousRanks.length, b.previousRanks.length); (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        if (a.previousRanks[i] === 0 || !a.course) {
          return 1;
        }
        if (b.previousRanks[i] === 0 || !b.course) {
          return -1;
        }
        if (a.previousRanks[i] !== b.previousRanks[i]) {
          return a.previousRanks[i] - b.previousRanks[i];
        }
      }
      return 0;
    });
    _results = [];
    for (i = 0, _ref = list.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      _results.push(list[i].machineRank = i + 1);
    }
    return _results;
  };
  listToMask = function(list) {
    var item, mask, _i, _len;
    mask = {};
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      item = list[_i];
      mask[item.id] = item;
    }
    return mask;
  };
  processData = function(x) {
    var crew, crewData;
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
    findMachineRanking(x.crews);
    x.masks = {};
    x.masks.live = listToMask((function() {
      var _i, _len, _ref, _results;
      _ref = x.crews;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        crew = _ref[_i];
        _results.push(crew);
      }
      return _results;
    })());
    x.masks.machine = listToMask((function() {
      var _i, _len, _ref, _results;
      _ref = x.crews;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        crew = _ref[_i];
        if (crew.course != null) {
          _results.push(crew);
        }
      }
      return _results;
    })());
    return x;
  };
  window.gotData = function(x) {
    app.masker = new Masker;
    app.search = new Search;
    app.data = processData(x);
    app.renderer = new Renderer;
    app.search.update();
    return document.getElementById('round').innerHTML = th(x.round);
  };
}).call(this);
