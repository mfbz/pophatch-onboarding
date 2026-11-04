import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MessageProps = {
  children: ReactNode;
  // A message right under another of PopHatch's keeps the avatar's place but not the avatar.
  continued?: boolean;
};

type TypingProps = { continued?: boolean };

type ReplyProps = { children: ReactNode };

const BUBBLE =
  "rounded-[22px_22px_22px_6px] bg-bubble text-[18px] leading-normal text-fg max-tablet:text-base";

function Avatar({ hidden }: { hidden: boolean }) {
  return (
    <Image
      src="/brand/logo-pearl.png"
      alt=""
      width={30}
      height={30}
      className={cn("size-7.5 shrink-0", hidden && "invisible")}
    />
  );
}

// PopHatch speaking: a bubble with its avatar, rising in as it arrives.
function PopHatchMessage({ children, continued = false }: MessageProps) {
  return (
    <div className="flex max-w-[82%] animate-rise items-end gap-2.5 motion-reduce:animate-none max-tablet:max-w-[92%]">
      <Avatar hidden={continued} />
      <p className={cn(BUBBLE, "px-4 py-2.75")}>{children}</p>
    </div>
  );
}

// The three dots before a message. Hidden from screen readers: the message itself is announced.
function TypingMessage({ continued = false }: TypingProps) {
  return (
    <div
      aria-hidden
      data-typing
      className="flex animate-rise items-end gap-2.5 motion-reduce:animate-none"
    >
      <Avatar hidden={continued} />
      <span className={cn(BUBBLE, "inline-flex gap-1 px-4 py-3.75")}>
        {[0, 150, 300].map((delay) => (
          <i
            key={delay}
            style={{ animationDelay: `${delay}ms` }}
            className="size-1.75 animate-typing rounded-full bg-fg"
          />
        ))}
      </span>
    </div>
  );
}

// The artist's answer, on the right in lime.
function ArtistReply({ children }: ReplyProps) {
  return (
    <p className="max-w-[70%] animate-rise self-end rounded-[22px_22px_6px_22px] bg-lime px-4 py-2.5 text-[18px] leading-normal font-medium text-navy motion-reduce:animate-none max-tablet:max-w-[85%] max-tablet:text-base">
      {children}
    </p>
  );
}

export { ArtistReply, PopHatchMessage, TypingMessage };
