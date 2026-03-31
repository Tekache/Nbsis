import '../styles/header.css'

function Header({ title, subtitle }) {
  return (
    <div className="header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

export default Header
