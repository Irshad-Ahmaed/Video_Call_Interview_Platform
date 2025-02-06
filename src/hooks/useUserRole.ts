import { useUser } from "@clerk/nextjs"
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

export const useUserRole = () => {
    const {user} = useUser();

    const userData = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || ""
    });

    const isLoading = userData === undefined; // if userData is undefined state that means its in loading state

    return{
        isLoading,
        isInterviewer: userData?.role === 'interviewer',
        isCandidate: userData?.role === 'candidate',
    };
}