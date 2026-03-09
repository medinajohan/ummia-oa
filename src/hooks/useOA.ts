import { useReducer, useMemo, useCallback, useEffect } from "react";
import type { OA } from "../mocks/mockOA";
import { fetchOA } from "../services/oaService";
import {
  getLatestActiveByCode,
  applyFilters,
  type OAFilters,
} from "../utils/oaUtils";

type State = {
  rawItems: OA[];
  nextToken: string | null;
  loading: boolean;
  error: string | null;
  filters: OAFilters;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; items: OA[]; nextToken: string | null }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_FILTERS"; filters: Partial<OAFilters> }
  | { type: "RESET" };

const initialState: State = {
  rawItems: [],
  nextToken: "PAGE_1",
  loading: false,
  error: null,
  filters: { subject: "", level: "" },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        rawItems: [...state.rawItems, ...action.items],
        nextToken: action.nextToken,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useOA(country: string) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadPage = useCallback(
    async (token: string | null) => {
      dispatch({ type: "FETCH_START" });
      try {
        const result = await fetchOA(country, token);
        dispatch({
          type: "FETCH_SUCCESS",
          items: result.items,
          nextToken: result.nextToken,
        });
      } catch (err) {
        dispatch({
          type: "FETCH_ERROR",
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    },
    [country],
  );

  useEffect(() => {
    console.log("useEffect", country);
    dispatch({ type: "RESET" });
    loadPage("PAGE_1");
  }, [loadPage]);

  const deduplicated = useMemo(
    () => getLatestActiveByCode(state.rawItems),
    [state.rawItems],
  );

  const items = useMemo(
    () => applyFilters(deduplicated, state.filters),
    [deduplicated, state.filters],
  );

  return {
    items,
    loading: state.loading,
    error: state.error,
  };
}
