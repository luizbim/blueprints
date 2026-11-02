import { agentDevboxCli } from './agent-devbox-cli.js';

describe('agentDevboxCli', () => {
  it('should work', () => {
    expect(agentDevboxCli()).toEqual('agent-devbox-cli');
  });
});
