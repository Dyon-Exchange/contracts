# dyon-contracts

## Installation

To install this package you should go to Gitlab and create a personal access token as you will need it to access the private package registry for the repo.

Then create `.npmrc` in the root directory of the project that you want to install the library into and paste the following in.

```bash
@labrysio:registry=https://gitlab.com/api/v4/packages/npm/
'//gitlab.com/api/v4/packages/npm/:_authToken'="${GITLAB_AUTH_TOKEN}"
```

Then run `npm install @labrysio/dyon-contracts`
