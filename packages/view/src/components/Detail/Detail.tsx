/* eslint-disable react/no-array-index-key */
import type { GlobalProps } from "types/global";

import { getTargetCommit, getTime } from "./Detail.util";

const TARGET_ID = "2a7a93cde9c9f74d5f05c1d0fb1da8e96da7057b";

const Detail = ({ data }: GlobalProps) => {
  const commit = getTargetCommit({ data, id: TARGET_ID });
  if (!commit) return null;
  const { authorDate, message, committer } = commit;
  const time = getTime(authorDate);
  return (
    <>
      <div>작성 날짜</div>
      <p>{time}</p>

      <div>메세지</div>
      <p>{message}</p>

      <div>Committer Name</div>
      {committer.names.map((name: string, i: number) => (
        <p key={i}>{name}</p>
      ))}

      <div>Committer Email</div>
      {committer.emails.map((email: string, i: number) => (
        <p key={i}>{email}</p>
      ))}
    </>
  );
};

export default Detail;
