(function() {
  var Renderer, app, songmap, songname, songtitle, sorters;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  app = {};
  songname = function(id) {
    return id.replace(/_\d$/, '');
  };
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
  songtitle = function(name) {
    if (name in songmap) {
      return songmap[name];
    } else {
      return (name + '').replace(/^./, function(x) {
        return x.toUpperCase();
      });
    }
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
        var idA, idB, titleA, titleB, titleCompare;
        if (!(b.course != null)) {
          return -1;
        }
        if (!(a.course != null)) {
          return 1;
        }
        titleA = songtitle(songname(idA = a.course.stages[num].song.id));
        titleB = songtitle(songname(idB = b.course.stages[num].song.id));
        titleCompare = compare(titleA, titleB);
        if (titleCompare === 0) {
          return compare(idA, idB);
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
  Renderer = (function() {
    var levelMap;
    function Renderer() {
      this.element = document.getElementById('main');
      this.data = app.data;
      this.setupHandlers();
      this.sortModifier = 1;
      this.setSortKey('rank');
    }
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
      return this.data.crews.sort(__bind(function(a, b) {
        return sorters[this.sortKey](a, b) * this.sortModifier;
      }, this));
    };
    Renderer.prototype.render = function() {
      return this.element.innerHTML = "<table cellspacing=\"0\" class=\"crew-list\">" + (this.renderHeaders()) + (this.renderCrews()) + "\n</table>";
    };
    Renderer.prototype.renderHeaders = function() {
      return "<tr class=\"header\">\n	<td class=\"name\" colspan=\"3\">Crewracing</td>\n	<td class=\"update\" colspan=\"5\">Last Updated: " + (new Date(1000 * this.data.updated).toString()) + "</td>\n</tr>\n<tr>\n	<th data-sort=\"rank\" class=\"" + (this.sortClass('rank')) + "\">Rank</th>\n	<th data-sort=\"name\" class=\"" + (this.sortClass('name')) + "\" colspan=\"2\">Name</th>\n	<th data-sort=\"stage1\" class=\"" + (this.sortClass('stage1')) + "\">Stage 1</th>\n	<th data-sort=\"stage2\" class=\"" + (this.sortClass('stage2')) + "\">Stage 2</th>\n	<th data-sort=\"stage3\" class=\"" + (this.sortClass('stage3')) + "\">Stage 3</th>\n	<th>Course</th>\n	<th data-sort=\"winrate\" class=\"" + (this.sortClass('winrate')) + " last\">Win Rate</th>\n</tr>";
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
      _ref = this.data.crews;
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
      return "<td class=\"song\">" + (this.renderStageSong(course.stages[0])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[1])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[2])) + "</td>\n<td class=\"course-info\">\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[0])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[1])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[2])) + "</span>\n</td>\n<td class=\"win-info\">\n	<span class=\"percentage\">" + (this.renderCoursePercentage(course)) + "</span>\n	<span class=\"details\">\n		" + course.wins + " / " + course.plays + "\n	</span>\n</td>";
    };
    Renderer.prototype.renderCoursePercentage = function(course) {
      if (course.plays === 0) {
        return "N/A";
      } else {
        return "" + (Math.round(course.wins / course.plays * 100)) + "%";
      }
    };
    Renderer.prototype.renderStageSong = function(stage) {
      return "<img src=\"http://images.djmaxcrew.com/Technika2/EN/icon/technika2/disc_s/" + stage.song.id + ".png\">\n<span class=\"effectors\">\n	" + (this.renderEffector(stage.effects.fade)) + "\n	" + (this.renderEffector(stage.effects.line)) + "\n	" + (this.renderEffector(stage.effects.scroll)) + "\n</span>";
    };
    Renderer.prototype.renderEffector = function(fx) {
      return fx;
    };
    levelMap = {
      '1': 'NM',
      '2': 'HD',
      '3': 'MX'
    };
    Renderer.prototype.renderStageInfo = function(stage) {
      return "<span class=\"song-name\">" + (songtitle(songname(stage.song.id))) + "</span> <span class=\"song-pattern p" + stage.song.level + "\">" + levelMap[stage.song.level] + "</span>";
    };
    return Renderer;
  })();
  window.gotData = function(x) {
    app.data = x;
    app.renderer = new Renderer;
    return app.renderer.render();
  };
}).call(this);
