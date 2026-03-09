import { useOA } from "./hooks/useOA";
import "./App.css";

function App() {
  const {
    items,
    loading,
    error,
    filters,
    filterOptions,
    setFilters,
    hasMore,
    loadMore,
  } = useOA("CL");

  return (
    <div className="app-wrapper">
      <div className="app-content">
        <div className="app-header">Ummia OA</div>

        {/* Filters */}
        <div className="app-filters">
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ subject: e.target.value })}
          >
            <option value="">Todas las asignaturas</option>
            {filterOptions.subjects.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ level: e.target.value })}
          >
            <option value="">Todos los niveles</option>
            {filterOptions.levels.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Errors and loading */}
        {error && <p className="app-error">Error: {error}</p>}
        {loading && <p className="app-loading">Cargando...</p>}
        {!loading && !error && items.length === 0 && (
          <p className="app-empty">No hay registros que coincidan..</p>
        )}

        {/* Table */}
        {items.length > 0 && (
          <table className="app-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descripcion</th>
                <th>Nivel</th>
                <th>Asignatura</th>
                <th>Estado</th>
                <th>Version</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((oa) => (
                <tr key={oa.id}>
                  <td>{oa.codigo}</td>
                  <td>{oa.descripcion}</td>
                  <td>{oa.nivel}</td>
                  <td>{oa.asignatura}</td>
                  <td>
                    <span
                      className={`badge ${oa.estado === "ACTIVO" ? "badge--active" : "badge--inactive"}`}
                    >
                      {oa.estado}
                    </span>
                  </td>
                  <td>{oa.version}</td>
                  <td>{new Date(oa.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Load more button */}
        {hasMore && !loading && (
          <button className="load-more" onClick={loadMore}>
            Cargar más
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
