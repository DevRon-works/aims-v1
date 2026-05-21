import { api } from '../../api/axios'

export type DynamicFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'date'
  | 'select'
  | 'textarea'
  | 'boolean'
  | 'status'
  | 'notes'

export type DynamicTableColumn = {
  id: number
  module: string
  key: string
  label: string
  field_type: DynamicFieldType
  options: string[] | null
  is_custom: boolean
  is_protected: boolean
  is_required: boolean
  is_hidden: boolean
  sort_order: number
}

export type DynamicColumnPayload = Partial<Pick<
  DynamicTableColumn,
  'key' | 'label' | 'field_type' | 'options' | 'is_required' | 'is_hidden' | 'sort_order'
>>

export const tableSchemasApi = {
  async columns(module: string): Promise<DynamicTableColumn[]> {
    const response = await api.get(`/table-schemas/${module}/columns`)

    return response.data?.data ?? []
  },
  createColumn: (module: string, payload: DynamicColumnPayload) =>
    api.post(`/table-schemas/${module}/columns`, payload),
  updateColumn: (module: string, columnId: number, payload: DynamicColumnPayload) =>
    api.put(`/table-schemas/${module}/columns/${columnId}`, payload),
  deleteColumn: (module: string, columnId: number) =>
    api.delete(`/table-schemas/${module}/columns/${columnId}`),
  updateValues: (module: string, recordId: string, customFields: Record<string, unknown>) =>
    api.patch(`/table-schemas/${module}/records/${recordId}/values`, {
      custom_fields: customFields,
    }),
}
