const TWO_YEAR_LENGTH = 2;

const SECOND_LENGTH_IN_TIME_FORMAT = 4;

const utcToLocaltime = (utc: Date) => new Date(utc).toLocaleString();

export const getTime = (utc: Date) =>
  utcToLocaltime(utc).slice(
    TWO_YEAR_LENGTH,
    utcToLocaltime.length - SECOND_LENGTH_IN_TIME_FORMAT
  );
