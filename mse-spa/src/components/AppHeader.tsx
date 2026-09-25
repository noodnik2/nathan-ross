import './AppHeader.css'

interface AppHeaderProps {
  breadcrumb?: string
}

export function AppHeader({ breadcrumb }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__bar">
        <span className="app-header__brand" aria-hidden="true">
          ♫{' '}
        </span>
        <span className="app-header__brand">Music Session Explorer</span>
      </div>
      {breadcrumb && (
        <div className="app-header__breadcrumb" data-testid="breadcrumb">
          {breadcrumb}
        </div>
      )}
    </header>
  )
}
