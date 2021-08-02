"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastReleaseInfo = exports.getReleaseNotesForCommit = void 0;
const parse_1 = require("./parse");
async function getReleaseNotesForCommit(octokit, owner, repo, commit) {
    // TODO: what's the response object shape from octokit?
    const pulls = (await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
        owner,
        repo,
        commit_sha: commit.sha,
        mediaType: {
            previews: ['groot']
        }
    })).data;
    const pullsFiltered = pulls.filter(pull => {
        if (pull.state !== 'closed') {
            console.warn(`Commit ${commit.sha} (${commit.commit.message}) is associated with a PR in state "${pull.state}": ${pull.url}`);
        }
        return (pull.state === 'closed' &&
            (pull.base.ref === 'master' || pull.base.ref === 'main'));
    });
    if (pullsFiltered.length !== 1) {
        console.warn(`Commit ${commit.sha} (${commit.commit.message}) is associated with ${pullsFiltered.length} closed PRs against the main branch:`);
        console.warn(pullsFiltered.map(pull => pull.url).join('\n'));
        return null;
    }
    try {
        return parse_1.getReleaseNotesFromPrBody(pullsFiltered[0].body || '');
    }
    catch (e) {
        return null;
    }
}
exports.getReleaseNotesForCommit = getReleaseNotesForCommit;
async function getLastReleaseInfo(octokit, owner, repo, lastReleaseTag) {
    let res = await octokit.repos.getReleaseByTag({
        owner,
        repo,
        tag: lastReleaseTag
    });
    const lastReleaseSHA = res.data.target_commitish;
    const lastReleasePublishedAt = res.data.published_at;
    console.log('Grabbing all commits since', lastReleasePublishedAt, lastReleaseSHA);
    // .paginate() resolves to an array of results from all pages combined:
    const commitsSinceLastRelease = await octokit.paginate('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        since: lastReleasePublishedAt
    });
    const githubInfo = {
        commitsSinceLastRelease,
        lastReleasePublishedAt,
        lastReleaseSHA
    };
    return githubInfo;
}
exports.getLastReleaseInfo = getLastReleaseInfo;
//# sourceMappingURL=github.js.map