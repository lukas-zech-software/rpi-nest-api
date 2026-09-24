export type TimeDate1Properties = {
  Timezone: string;
  LocalRTC: boolean;
  CanNTP: boolean;
  NTP: boolean;
  NTPSynchronized: boolean;
  TimeUSec: bigint;
  RTCTimeUSec: bigint;
};

/**
 * Date/Time settings DTO
 */
export type DateTimeInfo = {
  /**
   * The time zone of the device
   */
  timeZone: string;

  /**
   * The date of the device
   */
  date: Date;

  isNtpEnabled: boolean;
};
