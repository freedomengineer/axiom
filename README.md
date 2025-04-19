## Fundamentals

These commands are only needed to be run once for later.

### Download Nodejs, Yarn and IC SDK

> Follow the instructions on the [Nodejs](https://nodejs.org/en), [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) and [Internet Computer](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)

### Import test account

```bash
# Import test account
dfx identity import test_account ./keys/test_account.pem

# Set test account as default
dfx identity use test_account
```

## Deploy and run locally

```bash
# Install dependencies
yarn

# Run until there is "✨ Done" appeared
yarn replica

# Deploy canisters
yarn deploy

# Start frontend
yarn frontend
```

## Frontend notes

- Remember to top up ICP in the user dropdown for further interactions with the canisters.
