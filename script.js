(function() {
  var Renderer, app, songmap, songname, songtitle;
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
  Renderer = (function() {
    var levelMap;
    function Renderer() {
      this.element = document.getElementById('main');
      this.data = app.data;
    }
    Renderer.prototype.render = function() {
      return this.element.innerHTML = "<table cellspacing=\"0\" class=\"crew-list\">" + (this.renderCrews()) + "\n</table>";
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
