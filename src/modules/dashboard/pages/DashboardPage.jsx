import { format } from 'date-fns'
import { Activity, AlertTriangle, CalendarCheck, CheckCircle2, Clock3, RefreshCw, ShieldCheck, TrendingUp, UserCheck, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorState from '../../../components/common/ErrorState'
import Skeleton from '../../../components/ui/Skeleton'
import { useDashboard } from '../hooks/useDashboard'

const numberFormat = new Intl.NumberFormat()
const formatNumber = (value) => numberFormat.format(value ?? 0)
const formatActivity = (value) => value?.replaceAll('_', ' ') ?? 'system activity'
const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : 'Unknown time')

const PIE_COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#9333ea']
const TONE_STYLES = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
}

function SummaryCard({ label, value, detail, icon: Icon, tone = 'primary' }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-base-content/60">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{formatNumber(value)}</p>
          <p className="mt-1 text-xs capitalize text-base-content/50">{detail}</p>
        </div>
        <div className={`rounded-2xl p-3 ${TONE_STYLES[tone] ?? TONE_STYLES.primary}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}

function StatusRow({ label, value, tone = 'primary' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-base-200 py-2 last:border-0">
      <span className="text-sm capitalize text-base-content/70">{label.replaceAll('_', ' ')}</span>
      <span className={`badge badge-${tone} badge-sm`}>{formatNumber(value)}</span>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div><Skeleton className="h-8 w-56" /><Skeleton className="mt-2 h-4 w-80" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-box" />)}</div>
      <div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-80 rounded-box" /><Skeleton className="h-80 rounded-box" /></div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()
  const dashboard = data?.data

  if (isLoading) return <DashboardLoading />

  if (isError || !dashboard) {
    return <ErrorState title="Could not load dashboard" message={error?.message} onRetry={refetch} />
  }

  const users = dashboard.user_summary
  const services = dashboard.service_summary
  const bookings = dashboard.booking_summary
  const verification = dashboard.verification_summary
  const reports = dashboard.reports_summary
  const analytics = dashboard.analytics
  const bookingStatusData = Object.entries(analytics.booking_statuses).map(([name, value]) => ({ name: name.replaceAll('_', ' '), value }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Platform pulse</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-base-content/60">A live overview of users, marketplace activity, bookings, and platform health.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh dashboard">
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <section aria-labelledby="dashboard-summary-heading">
        <h2 id="dashboard-summary-heading" className="sr-only">Platform summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Clients" value={users.total_clients} detail="registered customers" icon={Users} />
          <SummaryCard label="Providers" value={users.total_providers} detail="registered providers" icon={UserCheck} tone="secondary" />
          <SummaryCard label="Active users" value={users.active_users} detail="currently active" icon={TrendingUp} tone="success" />
          <SummaryCard label="Suspended users" value={users.suspended_users} detail="needs attention" icon={AlertTriangle} tone="warning" />
          <SummaryCard label="Services" value={services.total_services} detail="all service listings" icon={Activity} />
          <SummaryCard label="Approved services" value={services.approved_services} detail="ready for clients" icon={CheckCircle2} tone="success" />
          <SummaryCard label="Pending services" value={services.pending_services} detail="awaiting review" icon={Clock3} tone="warning" />
          <SummaryCard label="Reported services" value={services.reported_services} detail="flagged in reports" icon={AlertTriangle} tone="error" />
          <SummaryCard label="Pending bookings" value={bookings.pending} detail="awaiting action" icon={Clock3} tone="warning" />
          <SummaryCard label="Open reports" value={reports.pending + reports.investigating} detail="pending or investigating" icon={ShieldCheck} tone="error" />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Platform activity" description="New users, providers, services, and bookings over the last six months.">
          <div className="h-72 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthly_activity} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" name="Users" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="providers" name="Providers" stroke="#9333ea" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="services" name="Services" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Booking status" description="Current bookings grouped by lifecycle status.">
          <div className="h-72 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingStatusData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Bookings" fill="#2563eb" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Verification requests" description="Provider verification pipeline.">
          <div className="flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={Object.entries(verification).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} paddingAngle={3}>
                  {Object.entries(verification).map(([name], index) => <Cell key={name} fill={PIE_COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4"><span><b className="block text-lg">{formatNumber(verification.pending)}</b>Pending</span><span><b className="block text-lg">{formatNumber(verification.approved)}</b>Approved</span><span><b className="block text-lg">{formatNumber(verification.rejected)}</b>Rejected</span><span><b className="block text-lg">{formatNumber(verification.additional_info_required)}</b>Needs info</span></div>
        </Card>

        <Card title="Reports" description="Moderation workload by status.">
          <div className="flex flex-col gap-1">
            <StatusRow label="pending" value={reports.pending} tone="warning" />
            <StatusRow label="investigating" value={reports.investigating} tone="info" />
            <StatusRow label="resolved" value={reports.resolved} tone="success" />
            <StatusRow label="rejected" value={reports.rejected} tone="error" />
            <StatusRow label="reported services" value={services.reported_services} tone="secondary" />
          </div>
        </Card>

        <Card title="Booking snapshot" description="At-a-glance booking totals.">
          <div className="flex flex-col gap-1">
            <StatusRow label="confirmed" value={bookings.confirmed} tone="info" />
            <StatusRow label="active" value={bookings.active} tone="primary" />
            <StatusRow label="completed" value={bookings.completed} tone="success" />
            <StatusRow label="cancelled" value={bookings.cancelled} tone="error" />
            <StatusRow label="disputed" value={bookings.disputed} tone="warning" />
          </div>
        </Card>
      </div>

      <Card title="Recent activities" description="Important events recorded across the platform." footer={<span className="text-xs text-base-content/50">Latest 8 events</span>}>
        {dashboard.recent_activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-base-content/60"><Activity className="size-8" /><p>No recent activities recorded.</p></div>
        ) : (
          <div className="divide-y divide-base-200">
            {dashboard.recent_activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary"><CalendarCheck className="size-4" /></div>
                <div className="min-w-0 flex-1"><p className="font-medium capitalize">{formatActivity(activity.description)}</p><p className="text-xs text-base-content/60">{activity.causer?.name ?? 'System'} · {formatDateTime(activity.created_at)}</p></div>
                <span className="hidden rounded-full bg-base-200 px-2 py-1 text-xs capitalize text-base-content/60 sm:inline-flex">{activity.log_name ?? 'system'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
