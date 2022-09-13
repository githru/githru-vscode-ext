const TWO_YEAR_LENGTH = 2;

const SECOND_LENGTH_IN_TIME_FORMAT = 4;

const utcToLocalTime = (utc: Date) => new Date(utc).toLocaleString();

export const getTime = (utc: Date) =>
  utcToLocalTime(utc).slice(
    TWO_YEAR_LENGTH,
    utcToLocalTime.length - SECOND_LENGTH_IN_TIME_FORMAT
  );
