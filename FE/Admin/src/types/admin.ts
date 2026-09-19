export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'
export interface TableColumn { key: string; label: string; type?: 'text' | 'status' | 'money' | 'product' | 'user' }
export interface ManagementRow { id: string; [key: string]: string | number | undefined }
export interface ManagementConfig {
  title: string; eyebrow: string; description: string; addLabel: string; searchPlaceholder: string; entityName: string
  columns: TableColumn[]; rows: ManagementRow[]; filters: string[]
  stats?: Array<{ label: string; value: string; note: string; tone: StatusTone }>
}
