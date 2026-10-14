import { memo } from "react";
import { IconPaperclip, IconPlus } from "@tabler/icons-react";

function isIconName(value) {
  return value === "plus" || value === "paperclip";
}

export const AttachmentButton = memo(function AttachmentButton({
  onClick,
  icon = "plus"
}) {
  const iconClassName = "w-4 h-4 text-neutral-400 dark:text-neutral-600";
  let iconNode;
  if (isIconName(icon)) {
    iconNode =
      icon === "paperclip" ? (
        <IconPaperclip className={iconClassName} strokeWidth={2} />
      ) : (
        <IconPlus className={iconClassName} strokeWidth={2} />
      );
  } else {
    iconNode = icon;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="size-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
      aria-label="Attach"
    >
      {iconNode}
    </button>
  );
});
