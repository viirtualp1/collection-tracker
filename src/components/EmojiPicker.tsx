import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./EmojiPicker.scss";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  id?: string;
}

const POPULAR_EMOJIS = [
  "🏠",
  "🛋️",
  "🍳",
  "🛏️",
  "🚿",
  "🚗",
  "📚",
  "💻",
  "🎮",
  "🎨",
  "🎵",
  "🏋️",
  "🌳",
  "🏖️",
  "🏕️",
  "🏢",
  "🏪",
  "🏥",
  "🏫",
  "🎭",
  "🎪",
  "🎯",
  "⚽",
  "🏀",
  "🎾",
  "🏐",
  "🏓",
  "🏸",
  "🏒",
  "🎿",
  "⛷️",
  "🏂",
  "🚴",
  "🏇",
  "🏊",
  "🤽",
  "🚣",
  "🧗",
  "🏔️",
  "⛰️",
  "🌋",
  "🏜️",
  "🏝️",
  "🏞️",
  "🌅",
  "🌄",
  "🌆",
  "🌇",
  "🌃",
  "🌉",
  "🌁",
  "🌊",
  "🌌",
  "🌠",
  "⭐",
  "🌟",
  "💫",
  "✨",
  "🔥",
  "💧",
  "❄️",
  "☀️",
  "🌙",
  "⭐",
];

function EmojiPicker({ value, onChange, id }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  return (
    <div className="emoji-picker-wrapper">
      <button
        ref={buttonRef}
        type="button"
        className="emoji-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select emoji"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="emoji-picker-display">{value || "😀"}</span>
        <span className="emoji-picker-arrow">▼</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="emoji-picker-dropdown"
            ref={pickerRef}
            role="listbox"
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            <div className="emoji-picker-grid">
              {POPULAR_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className={`emoji-picker-item ${
                    value === emoji ? "selected" : ""
                  }`}
                  onClick={() => handleEmojiSelect(emoji)}
                  aria-label={`Select ${emoji}`}
                  role="option"
                  aria-selected={value === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="emoji-picker-footer">
              <input
                type="text"
                className="emoji-picker-input"
                placeholder="Or type emoji..."
                maxLength={2}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                id={id}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default EmojiPicker;
