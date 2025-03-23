# CI Setup for Playwright Tests

This document explains how to set up the CI environment for running Playwright tests in GitHub Actions.

## Required Environment Variables

The following environment variables are set automatically in the workflow file:

- `CLIENT_API_DOMAIN`: Set to `http://localhost:8000` for testing
- `ALLOWED_ORIGIN`: Set to `http://localhost:5173` for testing
- `ENV`: Set to `development` for testing
- `BASE_URL`: Set to `http://localhost:5173` for Playwright tests
- `CI`: Automatically set by GitHub Actions

## Required Environments and Secrets

This workflow uses a GitHub environment called "CI" to access secrets.

### Setting up GitHub Environment and Secrets

1. In your GitHub repository, go to `Settings` > `Environments`
2. Click on `New environment`
3. Name it `CI` and click `Configure environment`
4. (Optional) Configure environment protection rules if needed
5. Under `Environment secrets`, click `Add secret`
6. Add the `OPENAI_API_KEY` secret with your actual API key
7. Click `Add secret`

## How the CI Works

1. The workflow runs on push to `main` and on pull requests to `main` that modify relevant files
2. It uses the "CI" environment which provides access to the secrets
3. It sets up the environment with required variables
4. Installs dependencies and runs checks
5. Installs Playwright browsers
6. Starts the dev server and waits for it to be ready
7. Verifies environment variables
8. Runs Playwright tests
9. Stops the dev server (always runs, even if tests fail)
10. Uploads the Playwright report as an artifact

## Troubleshooting

If the tests fail in CI but work locally, check:

1. Are all required secrets set up in GitHub?
2. Is the dev server starting correctly?
3. Check the logs for the "Verify Environment Variables" step to ensure all variables are present
4. Examine the uploaded Playwright report for detailed test failures
