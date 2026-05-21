import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertTriangle, Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from '../../lib/icons'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useSystemSettings } from '../../contexts/SystemSettingsContext.jsx'
import { authService } from '../../services/authService'
import {
  getDefaultLandingRouteForUser,
  userCanAccessPath,
} from '../../services/permissionService'

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean(),
  username: z.string().trim().min(1, 'Username or email is required.'),
})

function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, login } = useAuth()
  const { settings } = useSystemSettings()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: '',
      remember: false,
      username: '',
    },
  })

  useEffect(() => {
    authService.clearRememberedLogin()
    reset({
      password: '',
      remember: false,
      username: '',
    })
    setFormError('')
    setShowPassword(false)
  }, [reset])

  async function onSubmit(values) {
    setFormError('')

    try {
      const currentUser = await login(values)
      const fromPath = location.state?.from?.pathname
      const landingRoute =
        fromPath && userCanAccessPath(currentUser, fromPath)
          ? fromPath
          : getDefaultLandingRouteForUser(currentUser, {
              hiddenSidebarPaths: settings.hiddenSidebarPaths,
            })
      toast.success('Signed in successfully.')
      navigate(landingRoute, { replace: true })
    } catch {
      setFormError('Invalid username or password.')
      toast.error('Invalid credentials.')
      reset({
        password: '',
        remember: false,
        username: '',
      })
      setError('username', { message: 'Check your username or email.' })
      setError('password', { message: 'Check your password.' })
    }
  }

  return (
    <form
      className="auth-form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      {formError ? (
        <div className="auth-alert" role="alert">
          <AlertTriangle aria-hidden="true" size={16} />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="field-group auth-field">
        <Label htmlFor="username">Username or email</Label>
        <div className="auth-input-shell">
          <UserRound aria-hidden="true" size={16} />
          <Input
            id="username"
            autoComplete="off"
            aria-invalid={Boolean(errors.username)}
            placeholder="Enter username or email"
            {...register('username')}
          />
        </div>
        {errors.username ? (
          <p className="field-error">{errors.username.message}</p>
        ) : null}
      </div>

      <div className="field-group auth-field">
        <div className="auth-label-row">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="auth-input-shell auth-password-field">
          <LockKeyhole aria-hidden="true" size={16} />
          <Input
            id="password"
            autoComplete="new-password"
            type={showPassword ? 'text' : 'password'}
            aria-invalid={Boolean(errors.password)}
            placeholder="Enter password"
            {...register('password')}
          />
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={16} />
            ) : (
              <Eye aria-hidden="true" size={16} />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="field-error">{errors.password.message}</p>
        ) : null}
      </div>

      <Label className="remember-row auth-remember-row" htmlFor="remember">
        <Checkbox id="remember" {...register('remember')} />
        <span>Remember me</span>
        <button
          className="auth-forgot-link"
          type="button"
          onClick={() => toast.info('Please contact your system administrator.')}
        >
          Forgot password?
        </button>
      </Label>

      <Button className="auth-submit" disabled={isLoading} type="submit">
        {isLoading ? (
          <>
            <LoaderCircle aria-hidden="true" className="spin" size={16} />
            Signing in
          </>
        ) : (
          'Login'
        )}
      </Button>

      <p className="auth-security-note">
        <LockKeyhole aria-hidden="true" size={14} />
        <span>256-bit SSL · Enterprise Grade · Authorized Access Only</span>
      </p>
    </form>
  )
}

export { LoginForm }
