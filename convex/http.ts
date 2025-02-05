import { httpRouter } from "convex/server";
import {httpAction} from "./_generated/server"
import { Webhook } from "svix";
import {WebhookEvent} from "@clerk/nextjs/server";
import {api} from "./_generated/api";

const http = httpRouter();

// What are Webhooks:
// They are automated messages that are sent when something happens.

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if(!webhookSecret){
            throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
        }

        const svix_id = request.headers.get("svix-id");  // clerk uses svix for webhooks, id, signatures and etc.
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if(!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("No svix headers found", {
                status: 400,
            });
        }

        const payload = await request.json();
        const body = JSON.stringify(payload);

        const wh = new Webhook(webhookSecret);
        let evt: WebhookEvent;

        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp,
            }) as WebhookEvent;
        } catch (error) {
            console.error("Error verifying webhook:", error);
            return new Response("Error occurred", {status: 400});
        }

        const eventType = evt.type;
        if(eventType === "user.created"){
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.users.syncUser, {
                    clerkId: id,
                    email,
                    name,
                    image: image_url
                })
            } catch (error) {
                console.log("Error creating user", error);
                return new Response("Error creating user", {status: 500});
            }
        } else{
            console.log("Event Type is not supported");
            return new Response("Event Type is not supported", {status: 400});   
        }

        return new Response("Webhook processed successfully", {status: 200});
    }),
});

export default http;