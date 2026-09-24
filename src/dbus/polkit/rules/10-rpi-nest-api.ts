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
// TODO: Combine Polkit Rule with service definition! Important!
const ALLOWED_ACTION_IDS = [
  'org.freedesktop.login1.reboot',
  'org.freedesktop.login1.reboot-multiple-sessions',
  // TODO: Restrict access to specific units? action.lookup("unit")
  // TODO: Restrict access to specific verbs like start/stop? action.lookup("verb")
  'org.freedesktop.systemd1.manage-units',
  'org.freedesktop.systemd1.manage-unit-files',
  'org.freedesktop.NetworkManager.checkpoint-rollback',
  'org.freedesktop.NetworkManager.enable-disable-network',
  'org.freedesktop.NetworkManager.network-control',
  'org.freedesktop.NetworkManager.reload',
  'org.freedesktop.NetworkManager.settings.modify.global-dns',
  'org.freedesktop.NetworkManager.settings.modify.hostname',
  'org.freedesktop.NetworkManager.settings.modify.own',
  'org.freedesktop.NetworkManager.settings.modify.system',
  'org.freedesktop.timedate1.set-ntp',
  'org.freedesktop.timedate1.set-time',
  'org.freedesktop.timedate1.set-timezone',
];

// @ts-ignore TODO: include shared code during build
function isApiServiceUser(subject: Subject) {
  return subject.user === API_UNIX_USER && subject.isInGroup(API_UNIX_GROUP);
}

function isAllowedAction(action: Action) {
  // Uncomment for debugging
  // polkit.log('isAllowedAction: ' + action)
  return ALLOWED_ACTION_IDS.indexOf(action.id) !== -1;
}

polkit.addRule(function (action, subject) {
  if (isApiServiceUser(subject) && isAllowedAction(action)) {
    return polkit.Result.YES;
  }
});
