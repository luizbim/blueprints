import { agentDevboxIdleDetector } from './agent-devbox-idle-detector.js';

describe('agentDevboxIdleDetector', () => {
  it('should work', () => {
    expect(agentDevboxIdleDetector()).toEqual('agent-devbox-idle-detector');
  });
});
