// TODO: Refactor to DefaultsProvider:
//   * Read defaults from json or environment (.env)
//   * Create defaults file from CLI questions
//   * Provide defaults file as part of pre-setup

import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  authentication: {
    isAdminPasswordResetEnabled: true,
  },
  metadata: {},
  // TODO: Remove once there are more settings
  test: {
    foo: 'foo',
    bar: 'bar',
  },
};
