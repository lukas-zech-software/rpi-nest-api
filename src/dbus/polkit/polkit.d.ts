declare global {
  interface PolkitResults {
    NO: 'no';
    YES: 'yes';
    AUTH_SELF: 'auth_self';
    AUTH_SELF_KEEP: 'auth_self_keep';
    AUTH_ADMIN: 'auth_admin';
    AUTH_ADMIN_KEEP: 'auth_admin_keep';
    NOT_HANDLED: null;
  }

  type PolkitResult = PolkitResults[keyof PolkitResults];

  interface Action {
    id: string;

    /**
     * The lookup() method is used to lookup the polkit variables passed from the mechanism.
     *  For example, the pkexec(1) mechanism sets the variable "program" which can be obtained
     *  using the expression action.lookup("program").
     *  If there is no value for the given key, then undefined is returned.
     */
    lookup(key: string): string | undefined;
  }

  interface Subject {
    /**
     * The process id.
     */
    pid: number;

    /**
     * The user name.
     */
    user: string;

    /**
     * Array of groups that user user belongs to.
     */
    groups: string[];

    /**
     * The seat that the subject is associated with - blank if not on a local seat.
     */
    seat: string;

    /**
     * The session that the subject is associated with.
     */
    session: string;

    /**
     * Set to true only if seat is local.
     */
    local: boolean;

    /**
     * Set to true only if the session is active.
     */
    active: boolean;

    /**
     * can be used to check if the subject is in given group
     */
    isInGroup(groupName: string): boolean;

    /**
     * can be used to check if the subject is in given netgroup
     */
    isInNetGroup(groupName: string): boolean;
  }

  interface PolkitGlobal {
    Result: PolkitResults;

    /**
     * The addRule() method is used for adding a function that may be called whenever an authorization check for action and subject is performed.
     * Functions are called in the order they have been added until one of the functions returns a value.
     * Hence, to add an authorization rule that is processed before other rules,
     * put it in a file in /etc/polkit-1/rules.d with a name that sorts before other rules files,
     * for example 00-early-checks.rules.
     *
     * Each function should return a value from polkit.Result corresponding to the values that can be used as defaults.
     *
     * If the function returns polkit.Result.NOT_HANDLED, null, undefined or does not return a value at all,
     * the next user function is tried.
     */
    addRule(rule: (action: Action, subject: Subject) => PolkitResult | void): void;

    /**
     * The addAdminRule() method is used for adding a function that may be called whenever administrator authentication is required.
     * The function is used to specify what identities may be used for administrator authentication
     * for the authorization check identified by action and subject.
     * Functions added are called in the order they have been added until one of the functions returns a value.
     *
     * Each function should return an array of strings where each string is of the form
     * "unix-group:<group>", "unix-netgroup:<netgroup>" or "unix-user:<user>".
     *
     * If the function returns null, undefined or does not return a value at all, the next function is tried.
     */
    addAdminRule(rule: (action: Action, subject: Subject) => string[] | void): void;

    /**
     * The log() method writes the given message to the system logger
     * prefixed with the JavaScript filename and line number.
     * Log entries are emitted using the LOG_AUTHPRIV flag meaning that the log entries
     * usually ends up in the file /var/log/secure.
     * The log() method is usually only used when debugging rules.
     *
     * The Action and Subject types has suitable toString() methods defined for easy logging.
     */
    log(message: string): void;

    /**
     * The spawn() method spawns an external helper identified by the argument vector argv and waits for it to terminate.
     * If an error occurs or the helper doesn't exit normally with exit code 0, an exception is thrown.
     * If the helper does not exit within 10 seconds, it is killed.
     * Otherwise, the program's standard output is returned as a string.
     *
     * The spawn() method should be used sparingly as helpers may take a very long or indeterminate amount of time
     * to complete and no other authorization check can be handled while the helper is running.
     *
     * Note that the spawned programs will run as the unprivileged polkitd system user.
     */
    spawn(argv: string[]): string | never;
  }

  const polkit: PolkitGlobal;
}

export {};
