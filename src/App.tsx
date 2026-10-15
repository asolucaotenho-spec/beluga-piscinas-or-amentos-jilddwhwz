import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Index } from './pages/Index'
import { BudgetWizard } from './pages/BudgetWizard'
import { BudgetsList } from './pages/BudgetsList'
import { BudgetReview } from './pages/BudgetReview'
import { ModelsList } from './pages/ModelsList'
import { ModelDetail } from './pages/ModelDetail'
import { ProductsList } from './pages/ProductsList'
import { ClientsList } from './pages/ClientsList'
import { SettingsPage } from './pages/SettingsPage'
import NotFound from './pages/NotFound'

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, isLoading, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return (
      <Layout>
        <div className="py-20 text-center space-y-2">
          <h2 className="text-xl font-bold text-red-600">Sem Permissão</h2>
          <p className="text-xs text-[#5B6B78]">
            Esta área é restrita aos administradores da Beluga Piscinas.
          </p>
        </div>
      </Layout>
    )
  }

  return <Layout>{children}</Layout>
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rotas Protegidas no Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <BudgetsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets/new"
          element={
            <ProtectedRoute>
              <BudgetWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets/:id"
          element={
            <ProtectedRoute>
              <BudgetReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/models"
          element={
            <ProtectedRoute>
              <ModelsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/models/:id"
          element={
            <ProtectedRoute>
              <ModelDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute adminOnly>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/*"
          element={
            <ProtectedRoute adminOnly>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review"
          element={
            <ProtectedRoute adminOnly>
              <ModelsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/budgets"
          element={
            <ProtectedRoute adminOnly>
              <BudgetsList />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
