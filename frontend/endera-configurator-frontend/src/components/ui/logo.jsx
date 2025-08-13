import enderaLogo from '../../assets/endera-logo.png'

const Logo = ({ 
  size = 'md', 
  className = '', 
  variant = 'default',
  showText = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  }

  const variantClasses = {
    default: '',
    white: 'filter brightness-0 invert',
    dark: ''
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={enderaLogo} 
        alt="Endera" 
        className={`${sizeClasses[size]} ${variantClasses[variant]}`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">Vehicle Configurator</span>
        </div>
      )}
    </div>
  )
}

export default Logo
