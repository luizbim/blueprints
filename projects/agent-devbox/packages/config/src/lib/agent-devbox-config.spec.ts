import { agentDevboxConfig } from './agent-devbox-config.js';

describe('agentDevboxConfig', () => {
  it('should work', () => {
    expect(agentDevboxConfig()).toEqual('agent-devbox-config');
  });
});
