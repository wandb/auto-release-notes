import {Octokit} from '@octokit/rest'
import {edit} from 'external-editor'
import {compact} from 'lodash'
import {Plugin} from 'release-it'

import * as autoReleaseNotes from './src'

const getReleaseNotesBuffer = (
  releaseNotes: string[],
  commitsToInspect: autoReleaseNotes.Commit[]
) => {
  const formattedReleaseNotes = releaseNotes.join('\n* ')
  const formattedCommitsToInspect = commitsToInspect
    .map(commit => `* ${commit.commit.message.split('\n')[0]}`)
    .join('\n')

  return `
${formattedReleaseNotes}


${
  commitsToInspect.length > 0
    ? `
## Ambiguous Commits

Release notes could not be inferred for the following commits -- please check them manually, and then remove this section.

${formattedCommitsToInspect}`
    : ''
}
`
}

const octokit = new Octokit({
  baseUrl: 'https://api.github.com',
  auth: process.env['GITHUB_TOKEN'],
  userAgent: `auto-release-notes`,
  log: null as any,
  request: {
    timeout: 10000
  }
})

class AutoReleaseNotesPlugin extends Plugin {
  async getChangelog(latestVersion: string) {
    const lastReleaseInfo = await autoReleaseNotes.getLastReleaseInfo(
      octokit,
      'wandb',
      'auto-release-notes',
      `${latestVersion}`
    )

    const commitsToInspect: autoReleaseNotes.Commit[] = []
    const commitReleaseNotes: (string[] | null)[] = await Promise.all(
      lastReleaseInfo.commitsSinceLastRelease.map(async commit => {
        const releaseNotes = await autoReleaseNotes.getReleaseNotesForCommit(
          octokit,
          'wandb',
          'auto-release-notes',
          commit
        )

        if (releaseNotes == null) {
          commitsToInspect.push(commit)
        }

        return releaseNotes
      })
    )
    const allReleaseNotes = compact(commitReleaseNotes).flat()

    const defaultNotes = getReleaseNotesBuffer(
      allReleaseNotes,
      commitsToInspect
    )

    return edit(defaultNotes)
  }
}

module.exports = AutoReleaseNotesPlugin
