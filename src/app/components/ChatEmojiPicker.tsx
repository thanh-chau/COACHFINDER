import { RefObject, useState } from "react";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import { Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface ChatEmojiPickerProps {
  accent?: "orange" | "blue";
  textareaRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  triggerClassName?: string;
}

const accentClass = {
  orange: "hover:text-orange-500 data-[state=open]:text-orange-500 data-[state=open]:bg-orange-50",
  blue: "hover:text-blue-500 data-[state=open]:text-blue-500 data-[state=open]:bg-blue-50",
};

export function ChatEmojiPicker({
  accent = "orange",
  textareaRef,
  value,
  onChange,
  triggerClassName = "p-2.5 text-gray-400 shrink-0 rounded-xl hover:bg-gray-100 transition-colors",
}: ChatEmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const insertEmoji = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    const emoji = emojiData.emoji;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? start;
    const nextValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
    const nextCaret = start + emoji.length;

    onChange(nextValue);
    setOpen(false);
    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${triggerClassName} ${accentClass[accent]}`}
          aria-label="Chọn emoji"
        >
          <Smile className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="w-[min(340px,calc(100vw-32px))] border-gray-200 bg-white p-0 shadow-xl"
      >
        <EmojiPicker
          onEmojiClick={insertEmoji}
          theme={Theme.LIGHT}
          emojiStyle={EmojiStyle.NATIVE}
          width="100%"
          height={380}
          searchPlaceHolder="Tìm emoji..."
          previewConfig={{ showPreview: false }}
          lazyLoadEmojis
        />
      </PopoverContent>
    </Popover>
  );
}
