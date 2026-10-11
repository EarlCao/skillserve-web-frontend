import logo from '../../../assets/logo.png'
import { APP_NAME } from '../../../constants'

/**
 * Branded card shell used by authentication pages (login, ...).
 */
export default function AuthCard({ title, description, children, footer }) {
  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <img src={logo} alt="" className="size-12" />
          <span>{APP_NAME}</span>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body">
          {title && (
            <h1 className="card-title justify-center text-xl font-bold">{title}</h1>
          )}
          {description && (
            <p className="mb-2 text-center text-sm text-base-content/60">{description}</p>
          )}
          {children}
          {footer && <div className="mt-4 border-t border-base-200 pt-4">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
