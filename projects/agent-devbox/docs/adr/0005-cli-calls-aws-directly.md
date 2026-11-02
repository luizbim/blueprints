# The CLI calls AWS directly with SSO credentials; no control-plane Lambda

The `devbox` CLI calls EC2 and EC2 Instance Connect itself, through the AWS SDK, using short-lived credentials from the Operator's IAM Identity Center session. The safety boundary is the `DevboxOperator` permission set: start, stop and describe instances, plus `SendSSHPublicKey`, all limited to resources tagged `devbox`. The CLI only operates an existing Devbox. Creating and destroying it is left to `cdk deploy` and `cdk destroy`, which need deploy-level permissions that the Operator permission set does not grant.

## Considered Options

**A Lambda behind a function URL or API Gateway as the go-between for Devbox operations:** rejected. The only sound way to authenticate the caller is IAM-signed requests made with those same SSO credentials, so the Lambda would add a component, a network hop and an attack surface without adding any security. It would only earn its place if a caller without AWS credentials (such as a phone) came back into scope.

**Shelling out to the `aws` CLI for every operation:** rejected in favour of the SDK, whose calls are typed and can be unit-tested with mocks. The `aws` CLI is still required for `aws sso login`, which the SDK can't perform.
