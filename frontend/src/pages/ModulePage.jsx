import { useEffect, useState } from 'react'
import { CrudPageTemplate } from '../components/crud/CrudPageTemplate.jsx'
import { modulesApi } from '../services/api/modulesApi'
import { tableSchemasApi } from '../services/api/tableSchemasApi'

function ModulePage({ resource, title }) {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [columns, setColumns] = useState([])

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    Promise.all([modulesApi.list(resource), tableSchemasApi.columns(resource)])
      .then(([records, schemaColumns]) => {
        setRows(records)
        setColumns(schemaColumns.filter((column) => !column.is_hidden).map((column) => ({
          key: column.key,
          label: column.label,
        })))
      })
      .catch(() => {
        setRows([])
        setError(`${title} records could not be loaded.`)
      })
      .finally(() => setIsLoading(false))
  }, [resource, title])

  return (
    <CrudPageTemplate
      title={title}
      resource={resource}
      description={`Manage ${title.toLowerCase()} records, status, ownership, and recent updates.`}
      error={error}
      isLoading={isLoading}
      columns={columns}
      rows={rows}
    />
  )
}

export { ModulePage }
