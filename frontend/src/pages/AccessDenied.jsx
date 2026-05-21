import { LockKeyhole } from '../lib/icons'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'

function AccessDenied() {
  return (
    <section className="access-denied-page">
      <Card className="access-denied-card">
        <CardContent>
          <div className="access-denied-icon">
            <LockKeyhole aria-hidden="true" size={26} />
          </div>
          <h2>Access denied</h2>
          <p>Your current role does not include permission to view this page.</p>
          <Link className="button button-default button-size-default button-link-reset" to="/">
            Return to available page
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}

export { AccessDenied }
