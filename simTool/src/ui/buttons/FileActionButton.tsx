import type { LucideIcon } from "lucide-react";

type FileActionButtonProps = {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
};

export function FileActionButton({
  label,
  icon: Icon,
  disabled = false,
  onClick
}: FileActionButtonProps) {
  return (
    <button
      className="icon-button"
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
    >
      <Icon aria-hidden="true" size={16} />
      <span>{label}</span>
    </button>
  );
}
