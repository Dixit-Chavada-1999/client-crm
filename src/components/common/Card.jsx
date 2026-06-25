import { cn } from '../../utils/cn';

export default function Card({ children, className, padding = true }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={cn('pb-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
};

Card.Body = function CardBody({ children, className }) {
  return <div className={cn('py-4', className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }) {
  return (
    <div className={cn('pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  );
};
