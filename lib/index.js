"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleaseNotesForCommit = exports.getLastReleaseInfo = exports.getReleaseNotesFromPrBody = void 0;
var parse_1 = require("./parse");
Object.defineProperty(exports, "getReleaseNotesFromPrBody", { enumerable: true, get: function () { return parse_1.getReleaseNotesFromPrBody; } });
var github_1 = require("./github");
Object.defineProperty(exports, "getLastReleaseInfo", { enumerable: true, get: function () { return github_1.getLastReleaseInfo; } });
Object.defineProperty(exports, "getReleaseNotesForCommit", { enumerable: true, get: function () { return github_1.getReleaseNotesForCommit; } });
//# sourceMappingURL=index.js.map