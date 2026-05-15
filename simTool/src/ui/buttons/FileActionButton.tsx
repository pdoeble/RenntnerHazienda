import type { LucideIcon } from "lucide-react";

type FileActionButtonProps = {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export function FileActionButton({
  label,
  icon: Icon,
  disabled = true
}: FileActionButtonProps) {
  return (
    <button
      className="icon-button"
      type="button"
      disabled={disabled}
      title={disabled ? `${label} ist im Scaffold vorbereitet.` : label}
    >
      <Icon aria-hidden="true" size={16} />
      <span>{label}</span>
    </button>
  );
}
