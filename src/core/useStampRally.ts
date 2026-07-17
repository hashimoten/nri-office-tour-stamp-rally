import { useEffect, useRef, useState } from "react";
import type { StampNotice, StampRecord } from "../types";
import { parsePointFromSearch } from "./pointParser";
import { acquireStamp } from "./stampService";
import { clearStamps, loadStamps, saveStamps } from "./storageService";

export const useStampRally = (search: string = window.location.search) => {
  const [stamps, setStamps] = useState<StampRecord[]>(loadStamps);
  const [notice, setNotice] = useState<StampNotice>(null);
  const processedSearch = useRef<string | null>(null);

  useEffect(() => {
    if (processedSearch.current === search) return;
    processedSearch.current = search;

    const parsedPoint = parsePointFromSearch(search);
    if (parsedPoint.kind === "none") return;

    if (parsedPoint.kind === "invalid") {
      setNotice({ kind: "invalid" });
      return;
    }

    const currentStamps = loadStamps();
    const result = acquireStamp(currentStamps, parsedPoint.checkpointId);
    if (result.status === "acquired") saveStamps(result.stamps);

    setStamps(result.stamps);
    setNotice({
      kind: result.status,
      checkpointId: parsedPoint.checkpointId,
    });
  }, [search]);

  const resetAll = () => {
    clearStamps();
    setStamps([]);
    setNotice({ kind: "reset" });
  };

  return { stamps, notice, resetAll };
};
