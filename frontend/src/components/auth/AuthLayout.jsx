import { Card } from '../ui/card'
import { useSystemSettings } from '../../contexts/SystemSettingsContext.jsx'

function AuthLayout({ children }) {
  const { settings } = useSystemSettings()
  const logoSrc = settings.logoDataUrl || '/favicon.svg'

  return (
    <main className="auth-shell">
      <div className="auth-background" aria-hidden="true" />
      <Card className="auth-card">
        <section className="auth-brand-panel" aria-label="AIMS system information">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="auth-panel-network" aria-hidden="true" />
          <svg className="auth-network-svg" viewBox="0 0 320 260" aria-hidden="true">
            <path d="M42 138 96 72l72 30 58-54 52 88-66 72-76-42-58 46Z" />
            <path d="M96 72v94l116 42M168 102l-32 64M226 48l-14 160M42 138l126-36 110 34" />
            <circle cx="42" cy="138" r="5" />
            <circle cx="96" cy="72" r="5" />
            <circle cx="168" cy="102" r="5" />
            <circle cx="226" cy="48" r="5" />
            <circle cx="278" cy="136" r="5" />
            <circle cx="212" cy="208" r="5" />
            <circle cx="136" cy="166" r="5" />
            <circle cx="78" cy="212" r="5" />
          </svg>
          <div className="auth-brand-stack">
            <div className="auth-brand">
              <div
                className="auth-logo auth-logo-image"
                aria-hidden="true"
              >
                <img src={logoSrc} alt="" />
              </div>
              <div className="auth-brand-copy">
                <h1>AIMS</h1>
                <p>Avada Integrated Management System</p>
              </div>
            </div>
            <div className="auth-brand-message">
              <p className="auth-kicker">Enterprise access portal</p>
              <h2>Secure operations begin here.</h2>
              <p>
                Centralized access for Avada IT, branch operations, monitoring,
                and administrative management.
              </p>
            </div>
          </div>
          <p className="auth-version">Version {settings.version || '1.0.0'}</p>
        </section>

        <section className="auth-form-panel" aria-label="Login form">
          <div className="auth-form-wrap">
            <div className="auth-intro">
              <p className="auth-kicker">Secure access</p>
              <h2>Sign in to AIMS</h2>
              <p>Secure access for authorized users</p>
            </div>
            {children}
          </div>
        </section>
      </Card>
    </main>
  )
}

export { AuthLayout }
