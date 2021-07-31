import { Octokit } from '@octokit/rest';
export declare type Commit = {
    sha: string;
    commit: {
        message: string;
    };
};
export declare type PullRequest = {
    url: string;
    state: string;
    body: string | null;
    base: {
        ref: string;
    };
};
export declare function getReleaseNotesForCommit(octokit: Octokit, owner: string, repo: string, commit: Commit): Promise<string[] | null>;
export declare function getLastReleaseInfo(octokit: Octokit, owner: string, repo: string, lastReleaseTag: string): Promise<{
    commitsSinceLastRelease: Commit[];
    lastReleasePublishedAt: string | null;
    lastReleaseSHA: string;
}>;
