import { Navigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../contexts/AuthContext.jsx'

function Login() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate replace to={location.state?.from?.pathname ?? '/dashboard'} />
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

export { Login }
