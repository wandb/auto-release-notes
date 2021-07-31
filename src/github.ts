import {Octokit} from '@octokit/rest';
import {getReleaseNotesFromPrBody} from './parse';

export type Commit = {
  sha: string;
  commit: {
    message: string;
  };
};

export type PullRequest = {
  url: string;
  state: string;
  body: string | null;
  base: {
    ref: string;
  };
};

export async function getReleaseNotesForCommit(
  octokit: Octokit,
  owner: string,
  repo: string,
  commit: Commit
): Promise<string[] | null> {
  // TODO: what's the response object shape from octokit?
  const pulls: PullRequest[] = (
    await octokit.request(
      'GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls',
      {
        owner,
        repo,
        commit_sha: commit.sha,
        mediaType: {
          previews: ['groot']
        }
      }
    )
  ).data;

  const pullsFiltered = pulls.filter(pull => {
    if (pull.state !== 'closed') {
      console.warn(
        `Commit ${commit.sha} (${commit.commit.message}) is associated with a PR in state "${pull.state}": ${pull.url}`
      );
    }

    return (
      pull.state === 'closed' &&
      (pull.base.ref === 'master' || pull.base.ref === 'main')
    );
  });

  if (pullsFiltered.length !== 1) {
    console.warn(
      `Commit ${commit.sha} (${commit.commit.message}) is associated with ${pullsFiltered.length} closed PRs against the main branch:`
    );
    console.warn(pullsFiltered.map(pull => pull.url).join('\n'));
    return null;
  }

  console.log({
    pullsFiltered: pullsFiltered.length
  });

  try {
    return getReleaseNotesFromPrBody(pullsFiltered[0].body || '');
  } catch (e) {
    return null;
  }
}

export async function getLastReleaseInfo(
  octokit: Octokit,
  owner: string,
  repo: string,
  lastReleaseTag: string
) {
  let res = await octokit.repos.getReleaseByTag({
    owner,
    repo,
    tag: lastReleaseTag
  });
  const lastReleaseSHA = res.data.target_commitish;
  const lastReleasePublishedAt = res.data.published_at;
  console.log(
    'Grabbing all commits since',
    lastReleasePublishedAt,
    lastReleaseSHA
  );

  // .paginate() resolves to an array of results from all pages combined:
  const commitsSinceLastRelease: Commit[] = await octokit.paginate(
    'GET /repos/{owner}/{repo}/commits' as any,
    {
      owner,
      repo,
      since: lastReleasePublishedAt
    }
  );

  const githubInfo = {
    commitsSinceLastRelease,
    lastReleasePublishedAt,
    lastReleaseSHA
  };

  return githubInfo;
}
