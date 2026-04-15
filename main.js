var text = document.getElementById("text");
var canon = document.getElementById("canonicalised");
var syllable = document.getElementById("syllabified");
var metre = document.getElementById("metred");

/* CANONICALISE */

replacements = [
  ["T", "ṭ"],
  ["D", "ḍ"],
  ["sh", "š"],
  ["aa", "ā"],
  [".", "ʿ"],
  ["ḳh", "x"],
  ["ġh", "ɣ"],
  ["'", ""],
  ["ch", "c"],
  ["kh", "kʰ"],
  ["gh", "gʰ"],
  ["ch", "cʰ"],
  ["jh", "jʰ"],
  ["ṭh", "ṭʰ"],
  ["Ḍ", "ḍ"],
  ["ḍh", "ḍʰ"],
  ["th", "tʰ"],
  ["dh", "dʰ"],
  ["nh", "nʰ"],
  ["ph", "pʰ"],
  ["bh", "bʰ"],
  ["mh", "mʰ"],
  ["ai", "ɛ"],
  ["au", "ɔ"],
  ["-", " "],
  ["̤", ""],
  ["uu", "ū"],
  ["ii", "ī"],
];

// normalise the transliterations from Rekhta to something more familiar for me (IAST with some modifications)
function canonicalise(text) {
  replacements.forEach((d) => {
    text = text.replaceAll(d[0], d[1]);
  });
  return text;
}

/* SYLLABIFY */

vowel = "aiuāīūeoɛɔ";
short = "aiu";
ignore = "ñʰ \n";
flexibles = [
  "bʰī",
  "to",
  "tū",
  "tʰā",
  "tʰe",
  "tʰī",
  "tʰīñ",
  "jo",
  "do",
  "sā",
  "se",
  "sī",
  "se",
  "so",
  "kih",
  "sūñ",
  "kā",
  "ke",
  "kī",
  "ko",
  "meñ",
  "mɛñ",
  "ne",
  "vuh",
  "vo",
  "ye",
  "yih",
  "ho",
  "hūñ",
  "hoñ",
  "hī",
  "hɛ",
  "hɛñ",
  "yūñ",
  "pe",
];

// syllabify a single line of poetry, including syllable weight (heavy or light)
function syllabify_line(line) {
  // C > .C
  res = "";
  for (var i = 0; i < line.length; i++) {
    var char = line[i];
    if (ignore.includes(char)) res += char;
    else if (vowel.includes(char)) res += char;
    else res += "." + char;
  }

  // VV > V.V
  res = res.replaceAll(/([aiuāīūeoɛɔ])([aiuāīūeoɛɔ])/g, "$1.$2");
  res = res.replaceAll(/([aiuāīūeoɛɔ])([aiuāīūeoɛɔ])/g, "$1.$2");

  // CV̆.C. > CV̆C.
  res = res.replaceAll(/[aiu]ñ?\..ʰ?([\. ]|$)/g, (d) => d.replace(".", ""));

  // formatting
  res = res.replaceAll(/(^\.|\.$)/g, (d) => "");
  res = res.replaceAll(/(\n\.|\.\n)/g, (d) => "\n");
  res = res.replaceAll(/( \.|\. )/g, (d) => " ");
  line = res;

  // make syllable divs
  line = line.replaceAll(" ", '</span> <span class="syll">');
  line = line.replaceAll(".", '</span>·<span class="syll">');
  line = '<span class="syll">' + line + "</span>";

  // light syllables: .(C)V̆. || .C.
  line = line.replaceAll(
    /<span class="syll">(([^<]*?[aiu]ñ?|[^aiuāīūeoɛɔ]ʰ?))<\/span>/g,
    '<span class="syll light">$1</span>',
  );

  // .C.[yv] > .C[yv]
  line = line.replaceAll(
    /<span class="syll light">([^aiuāīūeoɛɔ]ʰ?)<\/span>[· ]<span class="(syll|syll light)">([y])/g,
    '<span class="$2">$1$3',
  );
  line = line.replaceAll(
    /<span class="syll light">(x)<\/span>[· ]<span class="(syll|syll light)">(v)/g,
    '<span class="$2">$1$3',
  );

  // V̄.C.C. > V̄.CC
  line = line.replaceAll(
    /([āīūeoɛɔ]ñ?<\/span>[· ])<span class="syll light">([^aiuāīūeoɛɔ]ʰ?)<\/span>[· ]<span class="syll light">([^aiuāīūeoɛɔ]ʰ?)<\/span>/g,
    '$1<span class="syll light">$2$3</span>',
  );

  // flexible syllables
  flexibles.forEach((d) => {
    l = /(^| )<span class="(syll|syll light)">/g;
    r = /<\/span>($| )/g;
    line = line.replaceAll(
      new RegExp(l.source + d + r.source, "g"),
      `$1<span class="syll flex">${d}</span>$3`,
    );
    line = line.replaceAll(
      new RegExp(l.source + d + r.source, "g"),
      `$1<span class="syll flex">${d}</span>$3`,
    );
  });

  // eoɛɔ can be flexible if in second syllable or later
  line = line.replaceAll(
    /·<span class="(syll light|syll)">([^<]*?[eoɛɔ])<\/span>/g,
    '·<span class="syll flex">$2</span>',
  );
  line = line.replaceAll(
    / <span class="(syll light|syll)">([eo])<\/span> /g,
    ' <span class="syll flex">$2</span> ',
  );

  // end of multisyllable word with short a (usually Urdu choti he in script form) can be flexible
  // (for single syllable words like this not sure if it applies, e.g. "na" might be always light?)
  line = line.replaceAll(
    /·<span class="(syll light|syll)">([^<]*?[a])<\/span> /g,
    '·<span class="syll flex">$2</span> ',
  );

  // koī is flexible
  line = line.replaceAll(
    /<span class="syll">ko<\/span>·<span class="syll">ī<\/span>/g,
    '<span class="syll flex">ko<\/span>·<span class="syll flex">ī<\/span>',
  );

  // nahīñ - second syllable can scan short
  line = line.replaceAll(
    /<span class="syll light">na<\/span>·<span class="syll">hīñ<\/span>/g,
    '<span class="syll light">na<\/span>·<span class="syll flex">hīñ<\/span>',
  );

  return line;
}

// recursively generate space grafting combinations
// returns a list of all possible combinations of graftings
// e.g. "a b c" > ["ab c", "a bc", "abc"]
function make_graft_recursive(line) {
  var line_w = line.replace(/([^aiuāīūeoɛɔ]ʰ?) ([aiuāīūeoɛɔ])/, "$1-$2");
  if (line_w == line) return [line.replaceAll("-", " ")];
  var line_s = line.replace(/([^aiuāīūeoɛɔ]ʰ?) ([aiuāīūeoɛɔ])/, "$1$2");
  return []
    .concat(make_graft_recursive(line_w))
    .concat(make_graft_recursive(line_s));
}

// syllabify the whole verse, including cleanup like trimming whitespace
// also handles vowel-vowel combos
function syllabify(text) {
  lines = text.split("\n");
  var res = [];
  lines.forEach((line) => {
    line = line.trim();

    // iẓāfat and vāʾo
    line = line.replaceAll(/([^aiuāīūeoɛɔ]ʰ?) ([eo]) /g, "$1$2 ");
    line = line.replaceAll(/ɔ e /g, "a ve ");
    line = line.replaceAll(/ɛ e /g, "a ye ");
    line = line.replaceAll(/ɔ o /g, "a vo ");
    line = line.replaceAll(/ɛ o /g, "a yo ");
    line = line.replaceAll(/ī e /g, "i ye ");

    var s = make_graft_recursive(line);
    s = s.map(syllabify_line);

    // filter out things that violate the 3-light-syllable rule
    res.push(s);
  });
  return res;
}

/* METRIFY */

// all the metres
var metres = {
  "====-=-==": ["= = = / = - = / - = =", "hazaj musaddas aḳhram ashtar maḥżūf"],
  "==-====-==": ["= = / - = = // = = / - = =", "mutaqārib muṡamman aṡram"],
  "==-==-==-==": ["= = / - = = // = = / - = =", "mutaqārib muṡamman aṡram"],
  "==-===-===-===-=": [
    "= = - = / = = - = / = = - = / = = - =",
    "rajaz muṡamman sālim",
  ],
  "==-=-====-=-==": [
    "= = - / = - = = // = = - / = - = =",
    "muẓāriʿ muṡamman aḳhrab",
  ],
  "==-=-==-==-=-==": [
    "= = - / = - = = // = = - / = - = =",
    "muẓāriʿ muṡamman aḳhrab",
  ],
  "==-=-=--==-=-=": [
    "= = - / = - = - / - = = - / = - =",
    "muẓāriʿ muṡamman aḳhrab makfūf maḥżūf",
  ],
  "==--=======--=====": [
    "= = / - - = / = = / = = / = = / - - = / = = / = =",
    "mutadārik muṡamman muẓāʿaf maqt̤ūʿ maḳhbūn",
  ],
  "==--=====--===": [
    "= = - / - = = = // = = - / - = = =",
    "hazaj muṡamman aḳhrab",
  ],
  "==--===-==--===": [
    "= = - / - = = = // = = - / - = = =",
    "hazaj muṡamman aḳhrab",
  ],
  "==--==--==--==": [
    "= = - / - = = - / - = = - / - = =",
    "hazaj muṡamman aḳhrab makfūf maḥżūf",
  ],
  "==--=-=-==": [
    "= = - / - = - = / - = =",
    "hazaj musaddas aḳhrab maqbūẓ maḥżūf",
  ],
  "=-===-===-===-=": [
    "= - = = / = - = = / = - = = / = - =",
    "ramal muṡamman maḥżūf",
  ],
  "=-===-===-=": ["= - = = / = - = = / = - =", "ramal musaddas maḥżūf"],
  "=-==-==-==-==-==-==-==-=": [
    "= - = / = - = / = - = / = - = / = - = / = - = / = - = / = - =",
    "mutadārik muṡamman muẓāʿaf sālim",
  ],
  "=-==-==-==": [
    "= - = / = - = / = - = / =",
    "mutadārik muṡamman maqt̤ūʿ maḥżūf",
  ],
  "=-==-=-===": [
    "=* - = = / - = - = / = =",
    "ḳhafīf musaddas maḳhbūn maḥżūf maqt̤ūʿ",
  ],
  "--==-=-===": [
    "=* - = = / - = - = / = =",
    "ḳhafīf musaddas maḳhbūn maḥżūf maqt̤ūʿ",
  ],
  "=-==-=-=--=": [
    "=* - = = / - = - = / - - =",
    "ḳhafīf musaddas maḳhbūn maḥżūf",
  ],
  "--==-=-=--=": [
    "=* - = = / - = - = / - - =",
    "ḳhafīf musaddas maḳhbūn maḥżūf",
  ],
  "=-==--====": [
    "=* - = = / - - = = / = =",
    "ramal musaddas maḳhbūn maḥżūf maqt̤ūʿ ",
  ],
  "--==--====": [
    "=* - = = / - - = = / = =",
    "ramal musaddas maḳhbūn maḥżūf maqt̤ūʿ ",
  ],
  "=-==--==--=": [
    "=* - = = / - - = = / - - =",
    "ramal musaddas maḳhbūn maḥżūf",
  ],
  "--==--==--=": [
    "=* - = = / - - = = / - - =",
    "ramal musaddas maḳhbūn maḥżūf",
  ],
  "=-==--==--====": [
    "=* - = = / - - = = / - - = = / = =",
    "ramal muṡamman maḳhbūn maḥżūf maqt̤ūʿ",
  ],
  "--==--==--====": [
    "=* - = = / - - = = / - - = = / = =",
    "ramal muṡamman maḳhbūn maḥżūf maqt̤ūʿ",
  ],
  "=-==--==--==--=": [
    "=* - = = / - - = = / - - = = / - - =",
    "ramal muṡamman maḳhbūn maḥżūf",
  ],
  "--==--==--==--=": [
    "=* - = = / - - = = / - - = = / - - =",
    "ramal muṡamman maḳhbūn maḥżūf",
  ],
  "=-=-====-=-===": [
    "= - = / - = = = // = - = / - = = =",
    "hazaj muṡamman ashtar",
  ],
  "=-=-===-=-=-===": [
    "= - = / - = = = // = - = / - = = =",
    "hazaj muṡamman ashtar",
  ],
  "=-=-=-==-=-=-=": [
    "= - = / - = - = // = - = / - = - =",
    "hazaj muṡamman ashtar maqbūẓ",
  ],
  "=-=-=-=-=-=-=-=": [
    "= - = / - = - = // = - = / - = - =",
    "hazaj muṡamman ashtar maqbūẓ",
  ],
  "=--==-==--==-=": [
    "= - - = / = - = // = - - = / = - =",
    "munsariḥ muṡamman mat̤vī maksūf",
  ],
  "=--==-=-=--==-=": [
    "= - - = / = - = // = - - = / = - =",
    "munsariḥ muṡamman mat̤vī maksūf",
  ],
  "=--==-=-=--==": [
    "= - - = / = - = - / = - - = / =",
    "munsariḥ muṡamman mat̤vī manḥūr",
  ],
  "=--==--==-=": ["= - - = / = - - = / = - =", "sarīʿ musaddas mat̤vī maksūf"],
  "=--=-=-==--=-=-=": [
    "= - - = / - = - = // = - - = / - = - =",
    "rajaz muṡamman mat̤vī maḳhbūn",
  ],
  "=--=-=-=-=--=-=-=": [
    "= - - = / - = - = // = - - = / - = - =",
    "rajaz muṡamman mat̤vī maḳhbūn",
  ],
  "-===-===-===-===": [
    "- = = = / - = = = / - = = = / - = = =",
    "hazaj muṡamman sālim",
  ],
  "-===-===-==": ["- = = = / - = = = / - = =", "hazaj musaddas maḥżūf"],
  "-==-==-==-==": ["- = = / - = = / - = = / - = =", "mutaqārib muṡamman sālim"],
  "-==-==-==-=": ["- = = / - = = / - = = / - =", "mutaqārib muṡamman maḥżūf"],
  "-=-==-=-==-=-==-=-==": [
    "- = - / = = / - = - / = = / - = - / = = / - = - / = =",
    "mutaqārib muṡamman muẓāʿaf maqbūẓ aṡlam",
  ],
  "-=-==-=-==-=-==": [
    "- = - / = = / - = - / = = / - = - / = =",
    "mutaqārib musaddas muẓāʿaf maqbūẓ aṡlam",
  ],
  "-=-=-=-=-=-=-=-=": [
    "- = - = / - = - = / - = - = / - = - =",
    "hazaj muṡamman mazbūẓ",
  ],
  "-=-=--==-=-===": [
    "- = - = / - - = = / - = - = / = =",
    "mujtaṡ muṡamman maḳhbūn maḥżūf maqt̤ūʿ",
  ],
  "-=-=--==-=-=--=": [
    "- = - = / - - = = / - = - = / - - =",
    "mujtaṡ muṡamman maḳhbūn maḥżūf",
  ],
  "-=-=--==-=-=--==": [
    "- = - = / - - = = / - = - = / - - = =",
    "mujtaṡ muṡamman maḳhbūn",
  ],
  "--=-=-==--=-=-==": [
    "- - = - / = - = = // - - = - / = - = =",
    "ramal muṡamman mashkūl",
  ],
  "--=-=-==---=-=-==": [
    "- - = - / = - = = // - - = - / = - = =",
    "ramal muṡamman mashkūl",
  ],
  "--=-=--=-=--=-=--=-=": [
    "- - = - = / - - = - = / - - = - = / - - = - =",
    "kāmil muṡamman sālim",
  ],
};

// add metres w/ final cheat short syllable
for (key in metres) {
  metres[key][0] = metres[key][0].replaceAll("-", "–").replaceAll("=", "×");
  metres[key + "-"] = metres[key];
}

// recursively generate combinations of weak/heavy for flexible syllables
// e.g. [flex][flex] > [HH, HL, LH, LL]
function make_flex_recursive(line) {
  var line_w = line.replace("[syll flex]", "-");
  if (line_w == line) return [line];
  var line_s = line.replace("[syll flex]", "=");
  return []
    .concat(make_flex_recursive(line_w))
    .concat(make_flex_recursive(line_s));
}

// edit distance between two metrical pattern strings
function editDist(a, b) {
  var m = a.length,
    n = b.length;
  var dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (var i = 0; i <= m; i++) dp[i][0] = i;
  for (var j = 0; j <= n; j++) dp[0][j] = j;
  for (var i = 1; i <= m; i++)
    for (var j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0),
      );
  return dp[m][n];
}

// find the closest known metre to a pattern string
function closestMetre(pattern) {
  var bestDist = 999,
    bestKey = null;
  for (var key in metres) {
    var d = editDist(pattern, key);
    if (d < bestDist) {
      bestDist = d;
      bestKey = key;
    }
  }
  return bestKey != null ? [bestKey, metres[bestKey], bestDist] : null;
}

// generate all metrical scansion hypotheses for a line, keeping the likely ones (the ones used in Urdu poetry)
// at the top
function metrify(line) {
  var l = line;
  line = line.replaceAll(
    /<span class="(syll|syll light|syll flex)">[^<]*?<\/span>[· ]?/g,
    "[$1]",
  );
  line = line.replaceAll("[syll light]", "-");
  line = line.replaceAll("[syll]", "=");

  // generate hypotheses
  var lines = make_flex_recursive(line);

  // count types of metre
  var hypo = [],
    rand = [];
  lines.forEach((d) => {
    if (d in metres) {
      hypo.push([d, metres[d], l]);
    } else rand.push([d, null, l]);
  });

  // if no exact match, find the closest known metre for the best unmatched hypothesis
  if (hypo.length == 0 && rand.length > 0) {
    var bestRand = null,
      bestRandDist = 999;
    rand.forEach((d) => {
      var c = closestMetre(d[0]);
      if (c && c[2] < bestRandDist) {
        bestRand = d;
        bestRandDist = c[2];
        bestRand[1] = c; // [pattern, metreInfo, dist]
      }
    });
    if (bestRand) {
      // move the best approximate match to the front
      rand = rand.filter((d) => d !== bestRand);
      rand.unshift(bestRand);
    }
  }

  return hypo.concat(rand);
}

// add syllable weight annotations to each syllable using HTML ruby
function rubify(syll, m) {
  var isApprox = m[1] != null && Array.isArray(m[1]) && m[1].length == 3;
  // for approximate matches, use the gold (closest metre) pattern for ruby
  var metre = isApprox
    ? m[1][0].replaceAll("-", "–").replaceAll("=", "×")
    : m[0].replaceAll("-", "–").replaceAll("=", "×");
  for (var i = 0; i < metre.length; i++) {
    var weight = metre[i];
    var label = weight == "×" ? "syll" : "syll light";
    syll = syll.replace(
      /<span class="(syll|syll light|syll flex)">([^<]*?)<\/span>/,
      `<span class="done ${label}"><ruby>$2<rt>${weight}</rt></ruby></span>`,
    );
  }
  if (isApprox) {
    var metreInfo = m[1][1];
    var dist = m[1][2];
    syll += ` <span class="anno" style="opacity:0.6">(≈${canonicalise(metreInfo[1])}, dist ${dist})</span>`;
  } else if (m[1] != null) {
    syll += ` <span class="anno">(${canonicalise(m[1][1])})</span>`;
  }
  syll = syll.replaceAll("done ", "");
  if (m[1] == null)
    syll = syll.replaceAll(
      /<span class="(syll|syll light|syll flex)">(.*?)<\/span>/g,
      "<span>$2</span>",
    );
  return syll;
}

// function that runs the whole scansion process every time the textarea is updated
function update() {
  // canonicalise and syllabify
  var t = text.value.replaceAll(/\n+/g, "\n");
  var c = canonicalise(t);
  canon.innerHTML = c.replaceAll("\n", "<br>");
  var lines = syllabify(c);

  // generate metrical hypotheses and make them pretty
  var res = "";
  var counts = {};
  var approxCounts = {};
  var noMatchCount = 0;
  lines.forEach((l, verse) => {
    // get hypotheses
    var m = [];
    l.forEach((x) => {
      m = m.concat(metrify(x));
    });

    // filter out three light syllables in a row
    m = m.filter((d) => {
      return d[0].search("---") == -1;
    });

    // exact matches first, then approximate, then unmatched
    function matchRank(d) {
      if (d[1] == null) return 2; // no match
      if (Array.isArray(d[1]) && d[1].length == 3) return 1; // approximate
      return 0; // exact
    }
    m.sort((a, b) => matchRank(a) - matchRank(b));

    // pretty printed versions + ruby
    var all = [];
    var hasExact = m.some((d) => matchRank(d) == 0);
    m.forEach((d, i) => {
      if (matchRank(d) == 0) {
        // count exact matches
        var name = d[0];
        if (!(name in counts)) counts[name] = {};
        counts[name][verse] = true;
      }
      all.push(
        `<p>${i == 0 ? "" : '<span class="anno">' + (i + 1) + " — </span>"}${rubify(d[2], d)}</p>`,
      );
    });

    // if no exact match, count the single lowest-distance approximate
    if (!hasExact) {
      var bestApprox = null,
        bestApproxDist = 999;
      m.forEach((d) => {
        if (matchRank(d) == 1 && d[1][2] < bestApproxDist) {
          bestApproxDist = d[1][2];
          bestApprox = d;
        }
      });
      if (bestApprox) {
        var metreName = canonicalise(bestApprox[1][1][1]);
        if (!(metreName in approxCounts)) approxCounts[metreName] = {};
        approxCounts[metreName][verse] = true;
      } else {
        noMatchCount++;
      }
    }

    res += `<button type="button" class="collapsible">${all[0]}</button><div class="content">${all.slice(1).join("\n")}</div>`;
  });

  // count found metres and list by # of verses they can fit for
  // merge exact counts (keyed by pattern) into counts by name
  var countsByName = {};
  Object.keys(counts).forEach((n) => {
    var name = canonicalise(metres[n][1]);
    if (!(name in countsByName))
      countsByName[name] = { verses: {}, visual: metres[n][0] };
    Object.assign(countsByName[name].verses, counts[n]);
  });
  // merge in approx counts
  Object.keys(approxCounts).forEach((name) => {
    if (!(name in countsByName)) {
      // look up the visual pattern for this metre name
      var visual = "";
      for (var mk in metres) {
        if (canonicalise(metres[mk][1]) == name) { visual = metres[mk][0]; break; }
      }
      countsByName[name] = { verses: {}, visual: visual };
    }
    // don't overwrite exact matches — only count approx for verses not already exact
    if (!countsByName[name].approxVerses) countsByName[name].approxVerses = {};
    Object.keys(approxCounts[name]).forEach((v) => {
      if (!(v in countsByName[name].verses))
        countsByName[name].approxVerses[v] = true;
    });
  });

  var ct = "<p>The following metres could be found in this poem:<ul>";
  var nameKeys = Object.keys(countsByName);
  nameKeys.sort((a, b) => {
    var aTotal =
      Object.keys(countsByName[a].verses).length +
      Object.keys(countsByName[a].approxVerses || {}).length;
    var bTotal =
      Object.keys(countsByName[b].verses).length +
      Object.keys(countsByName[b].approxVerses || {}).length;
    return bTotal - aTotal;
  });
  nameKeys.forEach((name) => {
    var exact = Object.keys(countsByName[name].verses).length;
    var approx = Object.keys(countsByName[name].approxVerses || {}).length;
    var label = `${exact} / ${lines.length}`;
    if (approx > 0) label += ` + ≈${approx}`;
    ct += `<li>${name} <span class="anno">(${label})</span><br>${countsByName[name].visual}</li>`;
  });
  if (noMatchCount > 0) {
    ct += `<li style="opacity:0.5">no match <span class="anno">(${noMatchCount} / ${lines.length})</span></li>`;
  }
  ct += "</ul></p>";

  // list all the metrical scansion hypotheses for each line, make it pretty and collapsible
  metred.innerHTML =
    ct +
    "<h3>Line-by-line</h3><p>Click each line to view possible metrical scansions.</p>" +
    res;

  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}

// set up auto-run
update();
text.addEventListener(
  "keyup",
  (d) => {
    update();
  },
  false,
);
