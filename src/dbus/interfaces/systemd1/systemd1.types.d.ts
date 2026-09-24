/**
 * org.freedesktop.systemd1.Manager
 * {@see https://www.freedesktop.org/software/systemd/man/org.freedesktop.systemd1.html#The%20Manager%20Object}
 */
export interface ManagerMethods {
  StartUnit(name: string, mode: string): Promise<string>;
  LoadUnit(name: string): Promise<string>;
  RestartUnit(name: string, mode: string): Promise<string>;
}

/**
 * org.freedesktop.systemd1.Unit - Unit Objects
 * {@see https://www.freedesktop.org/software/systemd/man/org.freedesktop.systemd1.html#Unit%20Objects}
 */
export interface UnitProperties {
  ActiveEnterTimestamp: number;
  ActiveEnterTimestampMonotonic: number;
  ActiveExitTimestamp: number;
  ActiveExitTimestampMonotonic: number;
  ActiveState: string;
  After: string[];
  AllowIsolate: boolean;
  AssertResult: boolean;
  AssertTimestamp: number;
  AssertTimestampMonotonic: number;
  Asserts: any[];
  Before: string[];
  BindsTo: any[];
  BoundBy: any[];
  CanClean: any[];
  CanFreeze: boolean;
  CanIsolate: boolean;
  CanReload: boolean;
  CanStart: boolean;
  CanStop: boolean;
  CollectMode: string;
  ConditionResult: boolean;
  ConditionTimestamp: number;
  ConditionTimestampMonotonic: number;
  Conditions: any[];
  ConflictedBy: any[];
  Conflicts: string[];
  ConsistsOf: any[];
  DefaultDependencies: boolean;
  Description: string;
  Documentation: any[];
  DropInPaths: any[];
  FailureAction: string;
  FailureActionExitStatus: number;
  Following: string;
  FragmentPath: string;
  FreezerState: string;
  Id: string;
  IgnoreOnIsolate: boolean;
  InactiveEnterTimestamp: number;
  InactiveEnterTimestampMonotonic: number;
  InactiveExitTimestamp: number;
  InactiveExitTimestampMonotonic: number;
  Job: Job[];
  JobRunningTimeoutUSec: number;
  JobTimeoutAction: string;
  JobTimeoutRebootArgument: string;
  JobTimeoutUSec: number;
  JoinsNamespaceOf: any[];
  LoadError: string[];
  LoadState: string;
  Names: string[];
  NeedDaemonReload: boolean;
  OnFailure: any[];
  OnFailureJobMode: string;
  PartOf: any[];
  Perpetual: boolean;
  PropagatesReloadTo: any[];
  RebootArgument: string;
  Refs: any[];
  RefuseManualStart: boolean;
  RefuseManualStop: boolean;
  ReloadPropagatedFrom: any[];
  RequiredBy: any[];
  Requires: string[];
  RequiresMountsFor: string[];
  Requisite: any[];
  RequisiteOf: any[];
  SourcePath: string;
  StartLimitAction: string;
  StartLimitBurst: number;
  StartLimitIntervalUSec: number;
  StateChangeTimestamp: number;
  StateChangeTimestampMonotonic: number;
  StopWhenUnneeded: boolean;
  SubState: string;
  SuccessAction: string;
  SuccessActionExitStatus: number;
  Transient: boolean;
  TriggeredBy: any[];
  Triggers: any[];
  UnitFilePreset: string;
  UnitFileState: string;
  WantedBy: any[];
  Wants: any[];
}

export type Job = number | string;
