import { useReducer, useMemo, useCallback, useEffect, useRef } from "react";
import type { CreateOAInput, OA } from "../mocks/mockOA";
import { createOAService, fetchOA } from "../services/oaService";
import {
  getLatestActiveByCode,
  applyFilters,
  type OAFilters,
  extractFilterOptions,
} from "../utils/oaUtils";

type State = {
  rawItems: OA[];
  nextToken: string | null;
  loading: boolean;
  error: string | null;
  filters: OAFilters;
  creating: boolean;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; items: OA[]; nextToken: string | null }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_FILTERS"; filters: Partial<OAFilters> }
  | { type: "REFETCH" }
  | { type: "RESET" }
  | { type: "OPTIMISTIC_ADD"; item: OA }
  | { type: "OPTIMISTIC_CONFIRM"; tempId: string; item: OA }
  | { type: "OPTIMISTIC_ROLLBACK"; tempId: string; error: string };

const initialState: State = {
  rawItems: [],
  nextToken: "PAGE_1",
  loading: false,
  error: null,
  filters: { subject: "", level: "" },
  creating: false,
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
    case "REFETCH":
      return { ...initialState, filters: state.filters };
    case "RESET":
      return initialState;
    case "OPTIMISTIC_ADD":
      return {
        ...state,
        creating: true,
        rawItems: [action.item, ...state.rawItems],
      };
    case "OPTIMISTIC_CONFIRM":
      return {
        ...state,
        creating: false,
        rawItems: state.rawItems.map((oa) =>
          oa.id === action.tempId ? action.item : oa,
        ),
      };
    case "OPTIMISTIC_ROLLBACK":
      return {
        ...state,
        creating: false,
        error: action.error,
        rawItems: state.rawItems.filter((oa) => oa.id !== action.tempId),
      };
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

  const filterOptions = useMemo(
    () => extractFilterOptions(deduplicated),
    [deduplicated],
  );

  const setFilters = useCallback((filters: Partial<OAFilters>) => {
    dispatch({ type: "SET_FILTERS", filters });
  }, []);

  const loadMore = useCallback(() => {
    if (state.nextToken && !state.loading) {
      loadPage(state.nextToken);
    }
  }, [state.nextToken, state.loading, loadPage]);

  const refetch = useCallback(() => {
    dispatch({ type: "REFETCH" });
    loadPage("PAGE_1");
  }, [loadPage]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    loadPage("PAGE_1");
  }, [loadPage]);

  const idCounter = useRef(0);

  const create = useCallback(async (input: CreateOAInput) => {
    const tempId = `temp-${Date.now()}-${++idCounter.current}`;
    const optimistic: OA = {
      id: tempId,
      codigo: input.codigo,
      descripcion: input.descripcion,
      nivel: input.nivel,
      asignatura: input.asignatura,
      pais: input.pais,
      estado: input.estado ?? "ACTIVO",
      version: 0,
      updatedAt: new Date().toISOString(),
      createdBy: input.createdBy ?? `user_${input.pais.toLowerCase()}`,
    };

    dispatch({ type: "OPTIMISTIC_ADD", item: optimistic });

    try {
      const created = await createOAService(input);
      dispatch({ type: "OPTIMISTIC_CONFIRM", tempId, item: created });
    } catch (err) {
      dispatch({
        type: "OPTIMISTIC_ROLLBACK",
        tempId,
        error: err instanceof Error ? err.message : "Error al crear OA",
      });
      throw err;
    }
  }, []);

  return {
    items,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    filterOptions,
    hasMore: state.nextToken !== null,
    creating: state.creating,
    setFilters,
    loadMore,
    refetch,
    reset,
    create,
  };
}
