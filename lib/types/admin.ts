// Tipos para el sistema administrativo
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalCompanies: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  expiringSubscriptions: number
  pendingRequests: number
  userGrowth: number
  revenueGrowth: number
}

export interface ChartData {
  name: string
  users: number
  revenue: number
  subscriptions: number
}

export interface Alert {
  id: string
  type: "warning" | "error" | "info"
  title: string
  description: string
  date: string
  priority: "high" | "medium" | "low"
}

export interface RecentActivity {
  id: string
  type: string
  description: string
  user: string
  date: string
  status: "success" | "warning" | "error" | "info"
}

export interface AdminUser {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  role: string
  isActive: boolean
  contestAccess: boolean
  company?: {
    id: string
    nombre: string
  }
  createdAt: string
  lastLogin?: string
}

export interface AdminSubscription {
  id: string
  company: {
    id: string
    nombre: string
    email: string
    users: AdminUser[]
  }
  plan: string
  status: string
  fechaInicio: string
  fechaExpiracion: string
  precio: number
  maxConcursos: number
  concursosUsados: number
  maxUsers: number
  usersUsed: number
  maxStorage: number
  storageUsed: number
  autoRenewal: boolean
  paymentMethod: string
  lastPayment?: string
  nextPayment?: string
  contestAccessEnabled: boolean
}

export interface PaymentHistory {
  id: string
  subscriptionId: string
  amount: number
  status: string
  date: string
  method: string
  transactionId: string
}
