import { isCheckpointId } from "./checkpoints.js";

export const POINT_PARAMETER_NAME = "point";

export const parsePointFromSearch = (search) => {
  const params = new URLSearchParams(search);

  if (!params.has(POINT_PARAMETER_NAME)) return { kind: "none" };

  const point = params.get(POINT_PARAMETER_NAME);
  return point && isCheckpointId(point)
    ? { kind: "valid", checkpointId: point }
    : { kind: "invalid" };
};

