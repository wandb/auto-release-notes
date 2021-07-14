# Auto Release Notes

Validate that PRs contain well-formatted release notes.

## Installation

Create the following `.github/workflow/pr.yml` file in your repo:

```
name: Validate that PR contains release notes

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate_release_notes:
    runs-on: ubuntu-latest
    steps:
      - name: Validate release notes
        uses: wandb/auto-release-notes@main
```

All PRs will now require well-formatted release notes -- or a NO RELEASE NOTES annotation --
to pass CI. To make things easier for developers, you should probably also add this to your
`pull_request_template.md`:

```
## Release Notes

Below, please enter user-facing release notes as one or more bullet points. If your change is not user-visible, write `NO RELEASE NOTES` instead, with no bullet points.

------------- BEGIN RELEASE NOTES ------------------

------------- END RELEASE NOTES --------------------
```


## Development
### Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

### Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

### Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
