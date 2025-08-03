import Image from "next/image";
import { useEffect, useState } from "react";


const ShimmerMessages = () => {
    const messages = [
        "Thinking...",
        "Generating response...",
        "Loading data...",
        "Processing your request...",
        "Fetching information...",
        "Analyzing your code...",
        "Generating code snippets...",
        "Compiling functions...",
        "Optimizing algorithms...",
        "Building components...",
        "Refactoring code...",
        "Testing implementations...",
        "Debugging logic...",
        "Creating documentation...",
        "Validating syntax..."
    ]

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 2000); // Change message every 2 secondz
        return () => clearInterval(interval);
    }, [messages.length]);


    return (
        <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground animate-pulse">
                {messages[currentMessageIndex]}
            </span>
        </div>
    );
};

export const MessageLoading = () => {
    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image
                    src="/logo.svg"
                    alt="Vibe"
                    width={18}
                    height={18}
                    className="shrink-0"
                />
                <span className="text-sm font-medium">Vibe</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                 <ShimmerMessages />
            </div>
        </div>
    );
}
