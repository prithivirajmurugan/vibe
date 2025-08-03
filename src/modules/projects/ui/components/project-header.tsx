import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSubContent } from "@radix-ui/react-dropdown-menu";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

interface Props {
    projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();

    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({
            id: projectId
        }, { refetchInterval: 5000 })
    )

    const { setTheme, theme } = useTheme();


    return (
        <header className="flex justify-between p-2 items-center border-b">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" 
                size="sm"
                className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!">
                    <Image src="/logo.svg" alt="Vibe" width={18} height={18} />
                    <span className="text-sm font-medium">{project.name}</span>
                    <ChevronDownIcon />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem asChild>
                    <Link href="/">
                     <ChevronLeftIcon />
                     <span>
                        Go to Dashboard
                     </span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                        <SunMoonIcon className="size-4 text-muted-foreground" />
                        <span>Appearance</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                              <DropdownMenuRadioItem value="light">
                                <span>Light Mode</span>
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="dark">
                                <span>Dark Mode</span>
                              </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="system">
                                    <span>System</span>
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>

        </header>
    )
    
}