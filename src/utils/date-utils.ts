export function setDateToTheFirstDateOfMonth(now: number) {
  const date = new Date(now);
  date.setDate(1);
  return date.getTime();
}

export function normalizeEpochRange(startEpoch: number, endEpoch: number) {
  const date1 = new Date(startEpoch);
  date1.setHours(0);
  date1.setMinutes(0);
  date1.setSeconds(0);
  startEpoch = date1.getTime();

  const date2 = new Date(endEpoch);
  date2.setHours(23);
  date2.setMinutes(59);
  date2.setSeconds(59);
  endEpoch = date2.getTime();
  return [startEpoch, endEpoch];
}
