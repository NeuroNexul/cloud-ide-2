"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  LayoutGridIcon,
  LayoutListIcon,
  PlusIcon,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResponseData } from "@/functions/core";
import Dockerode from "dockerode";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { newContainer } from "@/functions/new_container";
import { toast } from "sonner";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { useRouter } from "next/navigation";

type ContainerInfoWithPassword = Dockerode.ContainerInfo & {
  password?: string | null;
  metadata?: {
    containerId: string;
    containerName: string;
    password: string;
    port: number;
    createdAt: string;
  } | null;
};

type Props = {
  containers: ResponseData<ContainerInfoWithPassword[]>;
};

export default function Renderer({ containers }: Props) {
  const router = useRouter();

  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("Refreshing container list...");
      router.refresh();
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [router]);

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");
  const [isNewContainerDialogOpen, setIsNewContainerDialogOpen] =
    React.useState(false);
  const [newContainerName, setNewContainerName] = React.useState("");
  const [newContainerResponse, setNewContainerResponse] =
    React.useState<ResponseData<{
      containerId: string;
      containerName: string;
      port: number;
      password: string;
      url: string;
    }> | null>(null);

  async function handleCreateContainer() {
    const res = await newContainer(newContainerName);

    if (res.type === "error" || !res.payload) {
      toast.error(`Error: ${res.message}`);
      return;
    }

    toast.success(`Container "${newContainerName}" created successfully!`);
    setNewContainerName("");
    setNewContainerResponse(res);
    setIsNewContainerDialogOpen(false);
  }

  // console.log("Rendering with containers:", containers);

  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Cloud-IDE Work Spaces</h1>
      </header>

      <div className="border-2 rounded-lg">
        <div className="flex items-center justify-between border-b-2 p-2">
          <h2 className="text-lg font-semibold ml-2">Available Containers</h2>

          {/* Right Button Group */}
          <div className="flex items-center space-x-4">
            <ToggleGroup
              type="single"
              variant="outline"
              value={viewMode}
              onValueChange={(value: "grid" | "list") => setViewMode(value)}
            >
              <ToggleGroupItem value="grid" aria-label="Toggle grid view">
                <LayoutGridIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Toggle list view">
                <LayoutListIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Dialog
              open={isNewContainerDialogOpen}
              onOpenChange={setIsNewContainerDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <PlusIcon size={16} />
                  Create New Container
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Container</DialogTitle>
                  <DialogDescription>
                    Create a new container by providing the necessary details.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="containerName" className="sr-only">
                      Container Name
                    </Label>
                    <Input
                      id="containerName"
                      placeholder="Container Name"
                      value={newContainerName}
                      onChange={(e) => setNewContainerName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <DialogClose asChild>
                    <Button type="button" variant="destructive">
                      Close
                    </Button>
                  </DialogClose>

                  <Button variant="secondary" onClick={handleCreateContainer}>
                    Create Container
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-6">
          {containers.payload.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No containers available.
            </p>
          ) : (
            <div
              className={cn(
                "p-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "flex flex-col space-y-4 gap-6"
              )}
            >
              {containers.payload.map((container) => (
                <WorkspaceCard
                  key={container.Id}
                  container={container}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* New Container Response */}
        <Dialog
          open={newContainerResponse !== null}
          onOpenChange={() => setNewContainerResponse(null)}
        >
          <DialogContent className="block">
            <DialogHeader className="w-full pb-4">
              <DialogTitle className="flex items-center gap-2">
                <CheckCircleIcon className="size-6 text-green-500" /> Success!
              </DialogTitle>
              <DialogDescription>
                Your container has been created successfully. Here are the
                details:
              </DialogDescription>
            </DialogHeader>
            <DialogDescription>
              <p className="w-full flex items-center gap-2 pb-1">
                <span className="font-semibold whitespace-nowrap min-w-[140px]">
                  Container ID:
                </span>
                <pre className="bg-muted/30 p-2 rounded-md flex-1 truncate select-all">
                  <code>{newContainerResponse?.payload?.containerId}</code>
                </pre>
              </p>
              <p className="w-full flex items-center gap-2 pb-1">
                <span className="font-semibold whitespace-nowrap min-w-[140px]">
                  Container Name:
                </span>
                <pre className="bg-muted/30 p-2 rounded-md flex-1 truncate select-all">
                  <code>{newContainerResponse?.payload?.containerName}</code>
                </pre>
              </p>
              <p className="w-full flex items-center gap-2 pb-1">
                <span className="font-semibold whitespace-nowrap min-w-[140px]">
                  Port:
                </span>
                <pre className="bg-muted/30 p-2 rounded-md flex-1 truncate select-all">
                  <code>{newContainerResponse?.payload?.port}</code>
                </pre>
              </p>
              <p className="w-full flex items-center gap-2 pb-1">
                <span className="font-semibold whitespace-nowrap min-w-[140px]">
                  Password:
                </span>
                <pre className="bg-muted/30 p-2 rounded-md flex-1 truncate select-all">
                  <code>{newContainerResponse?.payload?.password}</code>
                </pre>
              </p>
              <p className="w-full flex items-center gap-2 pb-1">
                <span className="font-semibold whitespace-nowrap min-w-[140px]">
                  URL:
                </span>
                <pre className="bg-muted/30 p-2 rounded-md flex-1 truncate select-all">
                  <code>{newContainerResponse?.payload?.url || "/"}</code>
                </pre>
              </p>
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setNewContainerResponse(null)}
              >
                Close
              </Button>

              <Button variant="secondary" asChild>
                <Link
                  href={newContainerResponse?.payload?.url || "/"}
                  target="_blank"
                >
                  <ExternalLinkIcon className="size-4" />
                  Open in new tab
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
