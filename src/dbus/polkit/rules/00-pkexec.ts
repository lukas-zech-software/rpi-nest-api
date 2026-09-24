/* eslint-disable */
/**
 * This file contains all polkit rules to authenticate actions invoked by rpi-nest-api
 * NOTE: Code in this file must conform to ECMA-262 edition 5
 * {@see https://262.ecma-international.org/5.1/}
 */
// TODO: add own tsconfig.json to compile this file to ECMA5
// TODO: polkit rule files cannot load shared code from another file. should be included during build
// TODO: Define API user and group
var API_UNIX_USER = 'api';
var API_UNIX_GROUP = 'rpi-nest';

/**
 * List of paths to executables that may be invoked with `pkexec`
 */
// TODO: Combine allowed paths with command service implementation
var ALLOWED_PKEXEC_PATHS = [
  '/usr/bin/raspi-config',
  '/usr/bin/vcgencmd',
];

// @ts-ignore TODO: include shared code during build
function isApiServiceUser(subject: Subject) {
  return subject.user === API_UNIX_USER && subject.isInGroup(API_UNIX_GROUP);
}

function isAllowedToExecuteProgram(action: Action) {
  var program = action.lookup('program');

  // Uncomment for debugging
  // {@see https://polkit.pages.freedesktop.org/polkit/pkexec.1.html#pkexec-variables}
  // polkit.log('isAllowedToExecuteProgram - Action: ' + action)
  // polkit.log('isAllowedToExecuteProgram - program: ' + program)
  // polkit.log('isAllowedToExecuteProgram - command_line: ' + action.lookup('command_line'))

  if (program === undefined) {
    polkit.log('Error: program is undefined for action: ' + action);
    return false;
  }

  // TODO: Restrict access to specific arguments? action.lookup("command_line")
  return ALLOWED_PKEXEC_PATHS.indexOf(program) !== -1;
}

/**
 * Authenticate the usage of [pkexec](https://polkit.pages.freedesktop.org/polkit/pkexec.1.html)
 */
polkit.addRule(function (action, subject) {
  if (action.id === 'org.freedesktop.policykit.exec') {
    if (isApiServiceUser(subject) && isAllowedToExecuteProgram(action)) {
      return polkit.Result.YES;
    }
  }
});
