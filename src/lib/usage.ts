import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";


const FREE_POINTS = 5;
const PRO_POINTS = 100; // Assuming Pro users get more points

const GENERATION_COST = 1;

const DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export async function getUsageTracker(){
    const { has } = await auth();
    const hasProAccess = has({plan: "pro"})
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        points: hasProAccess ? PRO_POINTS: FREE_POINTS, // Number of points to start with
        tableName: 'Usage',
        duration: DURATION
        
    });
    return usageTracker
}

export async function consumeCredits(){
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const usageTracker = await getUsageTracker();

    const result = await usageTracker.consume(userId, GENERATION_COST); // Consume 1 point
    return result;
}

export async function getUsageStatus() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result
}