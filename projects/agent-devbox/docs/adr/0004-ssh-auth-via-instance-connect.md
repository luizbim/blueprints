# OpenSSH with EC2 Instance Connect keys, not Tailscale SSH

Clients authenticate to a stock OpenSSH server that listens only on the Tailscale interface. The CLI's ssh `ProxyCommand` uses the Operator's SSO session to push a short-lived public key through EC2 Instance Connect before each connection. The Devbox keeps no standing `authorized_keys`, so a single identity system (AWS IAM Identity Center) decides both who may Wake the Devbox and who may log into it. Revoking the SSO session cuts off access immediately.

## Considered Options

**Tailscale SSH:** no keys at all, with access controlled by tailnet policy. Rejected because the remote IDEs (VS Code Remote-SSH, JetBrains Gateway) are built and tested against OpenSSH (sftp, port forwarding, a forwarded backend port), and their compatibility with Tailscale SSH is unverified. IDE support is a hard requirement.
