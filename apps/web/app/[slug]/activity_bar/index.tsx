import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import React from "react";
import {
  IoFolderOutline,
  IoGitMergeOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { VscDebugAlt } from "react-icons/vsc";

const AButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "p-0 w-full h-full grid place-items-center aspect-square",
        "bg-transparent hover:bg-background/60"
      )}
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
});
AButton.displayName = "AButton";

type Props = object;

export default function ActivityBar({}: Props) {
  return (
    <div className="h-full relative bg-muted w-12 py-1 flex flex-col">
      <ScrollArea
        className="w-full h-full flex-grow flex-shrink flex-1"
        orientation="vertical"
      >
        <div className="w-full h-auto flex flex-col items-center justify-start gap-1 px-1">
          <AButton>
            <IoFolderOutline size={20} />
          </AButton>
          <AButton>
            <IoSearchOutline size={20} />
          </AButton>
          <AButton>
            <IoGitMergeOutline size={20} />
          </AButton>
          <AButton>
            <VscDebugAlt size={20} />
          </AButton>
          {/* <AButton>
            <IoGitMergeOutline size={20} />
          </AButton> */}
        </div>
      </ScrollArea>

      <div className="w-full h-auto flex flex-col items-center justify-start gap-1 px-1">
        <AButton>
          <IoPersonOutline size={20} />
        </AButton>
        <AButton>
          <IoSettingsOutline size={20} />
        </AButton>
      </div>
    </div>
  );
}
