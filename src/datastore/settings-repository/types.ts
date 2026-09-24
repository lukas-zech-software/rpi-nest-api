/**
 * Types for settings objects
 */
export type AuthenticationSettings = {
  isAdminPasswordResetEnabled: boolean;
};

/**
 * Types for metadata objects
 */
export type MetadataSettings = {
  name?: string;
  description?: string;
  location?: string;
};

/**
 * This is a mock type necessary for testing until there is
 * at least one other settings type implemented
 * TODO: Remove once there are more settings
 */
export type TestSettings = {
  foo: string;
  bar: string;
};

/**
 * Type for all settings objects and defaults
 */
export type Settings = {
  authentication: AuthenticationSettings;
  // TODO: Remove once there are more settings
  test: TestSettings;
  metadata: MetadataSettings;
};
