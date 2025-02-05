import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllInterviews = query({
    handler: async(ctx)=> {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("User is not authenticated");

        const allInterviews = await ctx.db.query("interviews").collect();

        return allInterviews;
    }
});

export const getMyInterviews = query({
    handler: async(ctx)=> {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) return [];
        
        const myInterviews = await ctx.db.query("interviews")
            .withIndex("by_candidate_id", (q)=> q.eq("candidateId", identity.subject))
            .collect();
        
        return myInterviews;
    }
});

export const getInterviewByStreamCallId = query({
    args: {
        streamCallId: v.string(),
    },

    handler: async(ctx, args)=> {
        return await ctx.db.query("interviews")
            .withIndex("by_stream_call_id", (q)=> q.eq("streamCallId", args.streamCallId))
            .first();
    }
});

export const createInterview = mutation({
    args:{
        title: v.string(),
        description: v.optional(v.string()),
        startTime: v.number(),
        status: v.string(),
        streamCallId: v.string(),
        candidateId: v.string(),
        interviewerIds: v.array(v.string()),
    },

    handler: async(ctx, args)=>{
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("User is not authenticated");

        return await ctx.db.insert("interviews", {
            ...args,
        });
    }
});

export const updateInterviewStatus = mutation({
    args: {
        id: v.id("interviews"),
        status: v.string(),
    },

    handler: async(ctx, args)=> {
        return ctx.db.patch(args.id, {
            status: args.status,
            ...(args.status === 'completed' ? {endTime: Date.now()} : {}), // Conditional spread operator
        });
    }
})