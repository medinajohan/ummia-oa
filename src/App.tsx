import { useEffect, useState } from 'react'
import { fetchOA } from './services/oaService'
import type { OA } from './mocks/mockOA'
import './App.css'

function App() {
  const [items, setItems] = useState<OA[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchOA('CL')
      .then((result) => setItems(result.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='app-wrapper'>
      <div className='app-content'>
      <div className='app-header'>Ummia OA</div>
      {loading && <p className='app-loading'>Cargando...</p>}
      {error && <p className='app-error'>Error: {error}</p>}
      {!loading && !error && items.length === 0 && <p className='app-no-records'>No hay registros.</p>}
      {items.length > 0 && (
        <table className='app-table'>
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
                <td>{oa.estado}</td>
                <td>{oa.version}</td>
                <td>{new Date(oa.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </div>
  )
}

export default App
