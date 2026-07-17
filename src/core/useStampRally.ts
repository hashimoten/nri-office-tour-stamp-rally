import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckpointId, StampNotice, StampRecord } from "../types";
import { parsePointFromSearch } from "./pointParser";
import { acquireStamp } from "./stampService";
import { clearStamps, loadStamps, saveStamps } from "./storageService";

export const useStampRally = (search: string = window.location.search) => {
  const [stamps, setStamps] = useState<StampRecord[]>(loadStamps);
  const [notice, setNotice] = useState<StampNotice>(null);
  const processedSearch = useRef<string | null>(null);

  const collectStamp = useCallback((checkpointId: CheckpointId) => {
    const currentStamps = loadStamps();
    const result = acquireStamp(currentStamps, checkpointId);
    if (result.status === "acquired") saveStamps(result.stamps);

    setStamps(result.stamps);
    setNotice({ kind: result.status, checkpointId });
  }, []);

  const reportInvalidQr = useCallback(() => {
    setNotice({ kind: "invalid" });
  }, []);

  useEffect(() => {
    if (processedSearch.current === search) return;
    processedSearch.current = search;

    const parsedPoint = parsePointFromSearch(search);
    if (parsedPoint.kind === "none") return;

    if (parsedPoint.kind === "invalid") {
      reportInvalidQr();
      return;
    }

    collectStamp(parsedPoint.checkpointId);
  }, [collectStamp, reportInvalidQr, search]);

  const resetAll = useCallback(() => {
    clearStamps();
    setStamps([]);
    setNotice({ kind: "reset" });
  }, []);

  return { stamps, notice, collectStamp, reportInvalidQr, resetAll };
};
