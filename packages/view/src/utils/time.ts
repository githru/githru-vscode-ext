const TWO_YEAR_LENGTH = 2;

const SECOND_LENGTH_IN_TIME_FORMAT = 4;

const utcToLocalTime = (utc: Date | string) => new Date(utc).toLocaleString();

const getYYYYMMDDWithDelimiter = (utc: string, delimiter = "-") => {
  const splitedDate = utc.split(". ").slice(0, 3);

  if (splitedDate[1].length === 1) {
    splitedDate[1] = `0${splitedDate[1]}`;
  }

  if (splitedDate[2].length === 1) {
    splitedDate[2] = `0${splitedDate[2]}`;
  }

  return splitedDate.join(delimiter);
};

export const getTime = (utc: Date) =>
  utcToLocalTime(utc).slice(
    TWO_YEAR_LENGTH,
    utcToLocalTime.length - SECOND_LENGTH_IN_TIME_FORMAT
  );

export const getYYYYMMDD = (utc: string) =>
  getYYYYMMDDWithDelimiter(utcToLocalTime(utc));
