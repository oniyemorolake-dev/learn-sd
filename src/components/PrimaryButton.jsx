export default function PrimaryButton({ children, onClick, disabled, type = 'button' }) {
  return (
    <button type={type} className="btn-primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
