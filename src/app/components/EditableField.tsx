import { useState } from "react";
import { Pencil } from "lucide-react";

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  showIcon?: boolean;
}

export function EditableField({
  value,
  onSave,
  multiline = false,
  placeholder = "Click to edit...",
  className = "",
  displayClassName = "",
  showIcon = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    if (tempValue.trim()) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    }
    if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
          rows={2}
          className={`w-full px-2 py-1.5 border border-blue-500 rounded focus:outline-none resize-none ${className}`}
        />
      );
    }

    return (
      <input
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus
        className={`w-full px-2 py-1 border border-blue-500 rounded focus:outline-none ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-neutral-50 px-2 py-1 -mx-2 rounded transition-colors group/edit ${displayClassName}`}
    >
      {value || <span className="text-neutral-400">{placeholder}</span>}
      {showIcon && (
        <Pencil className="size-3 inline-block ml-2 opacity-0 group-hover/edit:opacity-100 text-neutral-400" />
      )}
    </div>
  );
}
