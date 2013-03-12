// https://gist.github.com/slevithan/2387872/raw/b48b1065e4d4ecf8ea79d223fa6b5b76b1c211cb/xregexp-lookbehind2.js
// Simulating infinite-length leading lookbehind in JavaScript. Uses XRegExp.
// Captures within lookbehind are not included in match results. Lazy
// repetition in lookbehind may lead to unexpected results.

lookbehind = (function (XRegExp) {


    function prepareLb(lb) {
        // Allow mode modifier before lookbehind
        var parts = /^((?:\(\?[\w$]+\))?)\(\?<([=!])([\s\S]*)\)$/.exec(lb);
        return {
            // $(?!\s) allows use of (?m) in lookbehind
            lb: XRegExp(parts ? parts[1] + "(?:" + parts[3] + ")$(?!\\s)" : lb),
            // Positive or negative lookbehind. Use positive if no lookbehind group
            type: parts ? parts[2] === "=" : !parts
        };
    }

    XRegExp.execLb = function (str, lb, regex) {
        var pos = 0, match, leftContext;
        lb = prepareLb(lb);
        while (match = XRegExp.exec(str, regex, pos)) {
            leftContext = str.slice(0, match.index);
            if (lb.type === lb.lb.test(leftContext)) {
                return match;
            }
            pos = match.index + 1;
        }
        return null;
    };

    XRegExp.testLb = function (str, lb, regex) {
        return !!XRegExp.execLb(str, lb, regex);
    }; XRegExp.searchLb = function (str, lb, regex) { var match = XRegExp.execLb(str, lb, regex);
        return match ? match.index : -1;
    };

    XRegExp.matchAllLb = function (str, lb, regex) {
        var matches = [], pos = 0, match, leftContext;
        lb = prepareLb(lb);
        while (match = XRegExp.exec(str, regex, pos)) {
            leftContext = str.slice(0, match.index);
            if (lb.type === lb.lb.test(leftContext)) {
                matches.push(match[0]);
                pos = match.index + (match[0].length || 1);
            } else {
                pos = match.index + 1;
            }
        }
        return matches;
    };

    XRegExp.replaceLb = function (str, lb, regex, replacement) {
        var output = "", pos = 0, lastEnd = 0, match, leftContext;
        lb = prepareLb(lb);
        while (match = XRegExp.exec(str, regex, pos)) {
            leftContext = str.slice(0, match.index);
            if (lb.type === lb.lb.test(leftContext)) {
                // Doesn't work correctly if lookahead in regex looks outside of the match
                output += str.slice(lastEnd, match.index) + XRegExp.replace(match[0], regex, replacement);
                lastEnd = match.index + match[0].length;
                if (!regex.global) {
                    break;
                }
                pos = match.index + (match[0].length || 1);
            } else {
                pos = match.index + 1;
            }
        }
        return output + str.slice(lastEnd);
    };

});


/*// Test it...*/

/*console.log(XRegExp.execLb("Fluffy cat", "(?i)(?<=fluffy\\W+)", XRegExp("(?i)(?<first>c)at")));*/
/*// -> ["cat", "c"]*/
/*// Result has named backref: result.first -> "c"*/

/*console.log(XRegExp.execLb("Fluffy cat", "(?i)(?<!fluffy\\W+)", /cat/i));*/
/*// -> null*/

/*console.log(XRegExp.testLb("Fluffy cat", "(?i)(?<=fluffy\\W+)", /cat/i));*/
/*// -> true*/

/*console.log(XRegExp.testLb("Fluffy cat", "(?i)(?<!fluffy\\W+)", /cat/i));*/
/*// -> false*/

/*console.log(XRegExp.searchLb("Catwoman's fluffy cat", "(?i)(?<=fluffy\\W+)", /cat/i));*/
/*// -> 18*/

/*console.log(XRegExp.searchLb("Catwoman's fluffy cat", "(?i)(?<!fluffy\\W+)", /cat/i));*/
/*// -> 0*/

/*console.log(XRegExp.matchAllLb("Catwoman's cats are fluffy cats", "(?i)(?<=fluffy\\W+)", /cat\wi));*/
/*// -> ["cats"]*/

/*console.log(XRegExp.matchAllLb("Catwoman's cats are fluffy cats", "(?i)(?<!fluffy\\W+)", /cat\wi));*/
/*// -> ["Catwoman", "cats"]*/

/*console.log(XRegExp.replaceLb("Catwoman's fluffy cat is a cat", "(?i)(?<=fluffy\\W+)", /cat/ig, "dog"));*/
/*// -> "Catwoman's fluffy dog is a cat"*/

/*console.log(XRegExp.replaceLb("Catwoman's fluffy cat is a cat", "(?i)(?<!fluffy\\W+)", /cat/ig, "dog"));*/
/*// -> "dogwoman's fluffy cat is a dog"*/

/*console.log(XRegExp.replaceLb("Catwoman's fluffy cat is a cat", "(?i)(?<!fluffy\\W+)", /cat/ig, function ($0) {*/
  /*var first = $0.charAt(0);*/
  /*return first === first.toUpperCase() ? "Dog" : "dog";*/
/*}));*/
/*// -> "Dogwoman's fluffy cat is a dog"*/
