export default function Badge({
  children,
  variant = 'brand',
  className = '',
  style = {},
  icon: Icon,
}) {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`} style={style}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
