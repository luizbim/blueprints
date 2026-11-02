# The agent is the adversary; the design bounds blast radius

Agents run Unattended with permission prompts skipped, and they read untrusted input (READMEs, issues, web pages) that can prompt-inject them. The design therefore assumes any Agent Session may act maliciously, and aims to limit what it can reach rather than to prevent bad actions. In practice: the Devbox is disposable and rebuildable from code, it holds no credentials that reach beyond itself, its AWS role is scoped to its own lifecycle, and git access uses narrowly scoped tokens.

Out of scope: compromise of the AWS account itself, and a malicious Operator.
