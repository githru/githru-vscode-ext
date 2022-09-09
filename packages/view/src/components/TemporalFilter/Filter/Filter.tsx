import { useState } from "react";
import * as React from "react";

import "./Filter.scss";

type Props = {
  setFromDate: React.Dispatch<React.SetStateAction<string>>;
  setToDate: React.Dispatch<React.SetStateAction<string>>;
};

const Filter = (props: Props) => {
  const { setFromDate, setToDate } = props;
  const [fromDateFilter, setFromDateFilter] = useState<string>("");
  const [toDateFilter, setToDateFilter] = useState<string>("");

  const fromDateChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFromDateFilter(e.target.value);
    setFromDate(fromDateFilter);
  };
  const toDateChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setToDateFilter(e.target.value);
    setToDate(toDateFilter);
  };

  return (
    <section className="filter">
      <form>
        <div>
          <span>From:</span>
          <input
            className="date-from"
            type="date"
            value={fromDateFilter}
            onChange={fromDateChangeHandler}
          />
          <span>To:</span>
          <input
            className="date-to"
            type="date"
            value={toDateFilter}
            onChange={toDateChangeHandler}
          />
        </div>
      </form>
    </section>
  );
};

export default Filter;
