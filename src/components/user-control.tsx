"use client"

import { UserButton } from "@clerk/nextjs"
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { dark } from "@clerk/themes";

interface Props {
    showName?: boolean;
}


export const UserControl = ({ showName = true }: Props) => {
    const currentTheme = useCurrentTheme();
    return (
        <UserButton showName={showName} appearance={
            {
                elements: {
                    userButtonBox: "rounded-md!",
                    userButtonAvatarBox: "rounded-md! size-8!",
                    userButtonTrigger: "rounded-md!",
                },
                baseTheme: currentTheme === "dark" ? dark : undefined,
            }
        }
        />
    )
}