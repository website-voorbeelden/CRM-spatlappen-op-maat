// Shared server/browser/operator cadence. One source prevents a future release
// from silently restoring a more frequent background job.
export const notificationIntervalMinutes=15;
export const notificationCron='*/15 * * * *';
export const notificationHeartbeatGraceSeconds=(notificationIntervalMinutes*2+5)*60;
