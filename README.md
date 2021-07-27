# dyon-contracts

## Installation

To install this package you should go to Gitlab and create a personal access token as you will need it to access the private package registry for the repo.

Then create `.npmrc` in the root directory of the project that you want to install the library into and paste the following in.

```bash
@labrysio:registry=https://gitlab.com/api/v4/packages/npm/
'//gitlab.com/api/v4/packages/npm/:_authToken'="${GITLAB_AUTH_TOKEN}"
```

Then run `npm install @labrysio/dyon-contracts`

## Development

```bash
npm run test # run the test suite

npm run deploy # deploy to a local network

npm run deploy-goerli # deploy to goerli

npm run deploy-kovan # deploy to kovan
```

After the contracts are deployed and the code is pushed to the master branch, Gitlab CI will build a package and add to the package registry. If you are adding new code or doing a new deployment you will need to increment the version number or delete the existing package on the registry so the new one can be uploaded.
