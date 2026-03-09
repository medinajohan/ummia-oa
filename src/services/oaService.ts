import { listOA, createOA } from "../mocks/mockOA";
// import types
import type { OA, ListOAResult, CreateOAInput } from "../mocks/mockOA";

export const fetchOA = async (
  pais: string,
  nextToken?: string | null,
): Promise<ListOAResult> => {
  return listOA(pais, nextToken);
};

export const createOAService = async (input: CreateOAInput): Promise<OA> => {
  return createOA(input);
};
