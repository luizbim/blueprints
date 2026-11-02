# CI holds no AWS credentials; deploys run from the Operator's laptop

CI runs lint, typecheck, test, `cdk synth` and cdk-nag with no AWS credentials at all, and there are no automated tests against a real AWS account. Deploys run only from the Operator's laptop, under the Operator's SSO session. A personal account with a single Devbox gets nothing from continuous deployment, and a CI role able to deploy would be the most powerful credential in the whole design. CI's only external credential is the npm OIDC trust used to publish the CLI.

## Consequences

The behaviour that only a real account can show (hibernate and Wake, a direct Tailscale path, IDE connections) is covered by a manual smoke checklist, and its results are recorded in the README.
