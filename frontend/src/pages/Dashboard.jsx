import {
  Activity,
  ArrowUpRight,
  Cable,
  Camera,
  Cpu,
  Database,
  HardDrive,
  Mail,
  Plus,
  Router,
  ShieldAlert,
  UsersRound,
  Wifi,
} from '../lib/icons'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'

const summaryCards = [
  {
    label: 'Active Users',
    value: '2,847',
    detail: '+12.4%',
    icon: UsersRound,
  },
  {
    label: 'System Uptime',
    value: '99.98%',
    detail: '30 days',
    icon: Activity,
  },
  {
    label: 'CPU Load',
    value: '41%',
    detail: 'Normal',
    icon: Cpu,
  },
  {
    label: 'Open Alerts',
    value: '18',
    detail: '5 critical',
    icon: ShieldAlert,
  },
]

const statCards = [
  ['Internet Circuits', '12', '10 active', Cable],
  ['Wifi Access Points', '86', '4 offline', Wifi],
  ['Managed Cameras', '144', '138 online', Camera],
  ['Mailboxes', '1,204', '24 pending', Mail],
]

const serviceRows = [
  ['Identity Provider', 'Operational', '99.99%', '2 ms', 'success'],
  ['Network Gateway', 'Operational', '99.97%', '8 ms', 'success'],
  ['Asset Database', 'Degraded', '98.42%', '31 ms', 'warning'],
  ['Storage Cluster', 'Operational', '99.95%', '12 ms', 'success'],
  ['POS Integration', 'Monitoring', '99.41%', '18 ms', 'secondary'],
]

const activityItems = [
  ['09:42', 'Remote access policy updated', 'Security'],
  ['09:18', 'New access point registered', 'Wifi Data'],
  ['08:56', 'Boutique POS sync completed', 'POS Hookup'],
  ['08:31', 'Camera health scan finished', 'Cameras'],
  ['08:04', 'Mailbox retention rule changed', 'Emails'],
  ['07:48', 'IP address pool nearing threshold', 'IP Addressing'],
]

const quickActions = [
  ['Add User', UsersRound],
  ['Register Device', Router],
  ['Create Account', Database],
  ['Review Alerts', ShieldAlert],
]

function Dashboard() {
  return (
    <section className="content-grid dashboard-page">
      <div className="metric-grid">
        {summaryCards.map((item) => {
          const Icon = item.icon

          return (
            <Card className="metric-card" key={item.label}>
              <CardContent>
                <div className="metric-head">
                  <span className="metric-icon">
                    <Icon aria-hidden="true" size={19} />
                  </span>
                  <Badge variant={item.detail.includes('critical') ? 'warning' : 'secondary'}>
                    {item.detail}
                  </Badge>
                </div>
                <p className="metric-label">{item.label}</p>
                <p className="metric-value">{item.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="dashboard-panels">
        <Card className="chart-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Network</p>
              <CardTitle>Internet Utilization</CardTitle>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Open graph">
              <ArrowUpRight aria-hidden="true" size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="chart-placeholder">
              <div className="chart-grid-lines" aria-hidden="true" />
              <div className="chart-bars" aria-hidden="true">
                {[48, 62, 54, 78, 69, 88, 72, 64, 81, 93, 76, 84].map(
                  (height, index) => (
                    <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="quick-actions-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Actions</p>
              <CardTitle>Quick Actions</CardTitle>
            </div>
            <Plus aria-hidden="true" size={18} />
          </CardHeader>
          <CardContent>
            <div className="quick-action-grid">
              {quickActions.map(([label, Icon]) => (
                <Button className="quick-action-button" key={label} type="button" variant="ghost">
                  <Icon aria-hidden="true" size={17} />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="stat-grid">
        {statCards.map(([label, value, detail, Icon]) => (
          <Card className="stat-card" key={label}>
            <CardContent>
              <span className="stat-icon">
                <Icon aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="metric-label">{label}</p>
                <p className="stat-value">{value}</p>
                <p className="stat-detail">{detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="dashboard-panels lower-panels">
        <Card className="operations-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Operations</p>
              <CardTitle>Service Health</CardTitle>
            </div>
            <Badge variant="success">Live</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceRows.map(([name, status, uptime, latency, variant]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      <Badge variant={variant}>{status}</Badge>
                    </TableCell>
                    <TableCell>{uptime}</TableCell>
                    <TableCell>{latency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="activity-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Audit</p>
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="activity-scroll">
              <div className="activity-list">
                {activityItems.map(([time, title, area]) => (
                  <div className="activity-item" key={`${time}-${title}`}>
                    <span className="activity-dot" aria-hidden="true" />
                    <div>
                      <p className="activity-title">{title}</p>
                      <p className="activity-meta">
                        {time} - {area}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export { Dashboard }
