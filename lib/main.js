import * as core from '@actions/core';
import * as github from '@actions/github';
import { getReleaseNotesFromPrBody } from './parse';
async function run() {
    try {
        const pr = github.context.payload.pull_request;
        if (!pr) {
            throw new Error('Webhook paylaod had no pull request');
        }
        const releaseNotes = getReleaseNotesFromPrBody(pr.body || '');
        if (releaseNotes.length === 0) {
            core.info('This PR is marked as having no release notes ✅');
            return;
        }
        core.info('Release notes identified: ✅');
        core.info(releaseNotes.map(releaseNote => `* ${releaseNote}`).join('\n'));
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=main.js.map