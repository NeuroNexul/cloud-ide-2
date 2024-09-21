"use client";

import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import React from "react";
import Logo from "~/assets/logo-light.svg";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@repo/ui/components/ui/menubar";
import { useSettings } from "~/context/settings";

type Props = {
  className?: string;
};

export default function NavBar({ className }: Props) {
  const settings = useSettings();

  return (
    <div className={cn("w-full relative", "bg-muted/60", className)}>
      <div className="w-full flex flex-row gap-2 px-4 py-2 items-center">
        {/* Logo */}
        <div className="h-full">
          <Image src={Logo} alt="Logo" width={20} height={20} />
        </div>
        {/* Menu */}
        <div>
          <Menubar className="bg-transparent border-none p-0 h-auto">
            {/* File */}
            <MenubarMenu>
              <MenubarTrigger className="hover:bg-background transition-colors cursor-pointer">
                File
              </MenubarTrigger>
              <MenubarContent sideOffset={0}>
                <MenubarItem>
                  New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarItem disabled>New Incognito Window</MenubarItem>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>Share</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Email link</MenubarItem>
                    <MenubarItem>Messages</MenubarItem>
                    <MenubarItem>Notes</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem>Print</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Edit */}
            <MenubarMenu>
              <MenubarTrigger className="hover:bg-background transition-colors cursor-pointer">
                Edit
              </MenubarTrigger>
              <MenubarContent sideOffset={0}>
                <MenubarItem>
                  Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>Find</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Search the web</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Find...</MenubarItem>
                    <MenubarItem>Find Next</MenubarItem>
                    <MenubarItem>Find Previous</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem>Cut</MenubarItem>
                <MenubarItem>Copy</MenubarItem>
                <MenubarItem>Paste</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* View */}
            <MenubarMenu>
              <MenubarTrigger className="hover:bg-background transition-colors cursor-pointer">
                View
              </MenubarTrigger>
              <MenubarContent sideOffset={0}>
                <MenubarItem>
                  Command Palette <MenubarShortcut>⌘P</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>Open View</MenubarItem>
                <MenubarSeparator />
                {/* Appearence */}
                <MenubarSub>
                  <MenubarSubTrigger>Appearance</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem
                      onClick={() => {
                        // Toggle Fullscreen
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          document.documentElement.requestFullscreen();
                        }
                      }}
                    >
                      Fullscreen <MenubarShortcut>⌘⌃F</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarCheckboxItem
                      checked={settings.appearance.navBar?.enabled}
                      onCheckedChange={(e) =>
                        settings.setAppearance((s) => {
                          if (!s) s = {};
                          if (!s.navBar) s.navBar = {};
                          s.navBar.enabled = e;
                          return { ...s };
                        })
                      }
                    >
                      Nav Bar
                    </MenubarCheckboxItem>
                    <MenubarCheckboxItem
                      checked={settings.appearance.primarySideBar?.enabled}
                      onCheckedChange={(e) =>
                        settings.setAppearance((s) => {
                          if (!s) s = {};
                          if (!s.primarySideBar) s.primarySideBar = {};
                          s.primarySideBar.enabled = e;
                          return { ...s };
                        })
                      }
                    >
                      Primary Side Bar <MenubarShortcut>⌘⌃B</MenubarShortcut>
                    </MenubarCheckboxItem>
                    <MenubarSeparator />
                    <MenubarItem
                      onClick={() =>
                        settings.setAppearance((s) => {
                          if (!s) s = {};
                          if (!s.primarySideBar) s.primarySideBar = {};
                          s.primarySideBar.position =
                            s.primarySideBar.position === "left"
                              ? "right"
                              : "left";
                          return { ...s };
                        })
                      }
                    >
                      Move Primary Side Bar Right
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarCheckboxItem
                      checked={settings.editor?.minimap?.enabled}
                      onCheckedChange={(e) =>
                        settings.setEditor((s) => {
                          if (!s) s = {};
                          if (!s.minimap) s.minimap = {};
                          s.minimap.enabled = e;
                          return { ...s };
                        })
                      }
                    >
                      Minimap
                    </MenubarCheckboxItem>
                    <MenubarCheckboxItem checked>Breadcumb</MenubarCheckboxItem>
                    <MenubarCheckboxItem
                      checked={settings.editor?.stickyScroll?.enabled}
                      onCheckedChange={(e) =>
                        settings.setEditor((s) => {
                          if (!s) s = {};
                          if (!s.stickyScroll) s.stickyScroll = {};
                          s.stickyScroll.enabled = e;
                          return { ...s };
                        })
                      }
                    >
                      Sticky Scroll
                    </MenubarCheckboxItem>
                    <MenubarSub>
                      <MenubarSubTrigger>Render Whitespace</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarRadioGroup
                          value={settings.editor?.renderWhitespace}
                          onValueChange={(e) =>
                            settings.setEditor((s) => {
                              if (!s) s = {};
                              s.renderWhitespace = e as
                                | "all"
                                | "none"
                                | "boundary"
                                | "selection"
                                | "trailing";
                              return { ...s };
                            })
                          }
                        >
                          <MenubarRadioItem value="all">All</MenubarRadioItem>
                          <MenubarRadioItem value="none">None</MenubarRadioItem>
                          <MenubarRadioItem value="boundary">
                            Boundary
                          </MenubarRadioItem>
                          <MenubarRadioItem value="selection">
                            Selection
                          </MenubarRadioItem>
                          <MenubarRadioItem value="trailing">
                            Trailing
                          </MenubarRadioItem>
                        </MenubarRadioGroup>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarCheckboxItem
                      checked={settings.editor?.renderControlCharacters}
                      onCheckedChange={(e) =>
                        settings.setEditor((s) => {
                          if (!s) s = {};
                          s.renderControlCharacters = e;
                          return { ...s };
                        })
                      }
                    >
                      Render Control Characters
                    </MenubarCheckboxItem>
                    <MenubarSeparator />
                    <MenubarItem>
                      Zoom In <MenubarShortcut>⌘=</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                      Zoom Out <MenubarShortcut>⌘-</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                      Reset Zoom <MenubarShortcut>⌘0</MenubarShortcut>
                    </MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                {/* Layout */}
                <MenubarSub>
                  <MenubarSubTrigger>Layout</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Split Editor</MenubarItem>
                    <MenubarItem>Toggle Editor Group Layout</MenubarItem>
                    <MenubarItem>Toggle Editor Group Sizes</MenubarItem>
                    <MenubarItem>Toggle Editor Group Orientation</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem>
                  Terminal <MenubarShortcut>⌘`</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>Output</MenubarItem>
                <MenubarItem>Problems</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
        {/* Search */}
        <div></div>
      </div>
    </div>
  );
}
