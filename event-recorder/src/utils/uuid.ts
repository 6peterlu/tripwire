import { v4 } from "uuid";

export function generateNUUIDs(n: number) {
  const uuids = [];
  for (let i = 0; i < n; i++) {
    uuids.push(v4());
  }
  return uuids;
}
