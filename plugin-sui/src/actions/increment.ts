import {
    ActionExample,
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    ServiceType,
    // ServiceType,
    State,
    composeContext,
    elizaLogger,
    generateObject,
    type Action,
} from "@elizaos/core";
import { SuiService } from "../services/sui";
import { z } from "zod";

export interface IncrementPayload extends Content {
    value: number;
}

function isIncrementPayload(content: Content): boolean {
    console.log("Content for transfer", content);
    return typeof content.value === "number";
}

const swapTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "value": 0
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested value you will increment:
- Value you will increment the world

Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "INCREMENT",
    similes: ["INCREMENT_WORLD", "INCREMENT_VALUE"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        console.log("Validating sui transfer from user:", message.userId);
        return true;
    },
    description: "Increment the world by some amount.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting INCREMENT handler...");

        const service = runtime.getService<SuiService>(
            ServiceType.TRANSCRIPTION
        );

        if (!state) {
            // Initialize or update state
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const incrementSchema = z.object({
            value: z.number(),
        });

        // Compose transfer context
        const incrementContext = composeContext({
            state,
            template: swapTemplate,
        });

        // Generate transfer content with the schema
        const content = await generateObject({
            runtime,
            context: incrementContext,
            schema: incrementSchema,
            modelClass: ModelClass.SMALL,
        });

        console.log("Generated content:", content);
        const incrementContent = content.object as IncrementPayload;
        elizaLogger.info("Increment content:", incrementContent);

        // Validate transfer content
        if (!isIncrementPayload(incrementContent)) {
            console.error("Invalid content for INCREMENT action.");
            if (callback) {
                callback({
                    text: "Unable to process increment request. Invalid content provided.",
                    content: { error: "Invalid transfer content" },
                });
            }
            return false;
        }

        // one action only can call one callback to save new message.
        // runtime.processActions

        try {
            const result = await service.incrementByValue(
                incrementContent.value
            );

            if (result.success) {
                callback({
                    text: `Successfully increment ${
                        incrementContent.value
                    } , Transaction: ${service.getTransactionLink(result.tx)}`,
                });
                return true;
            } else {
                callback({
                    text: `transaction error : ${result.message}`,
                });
                return false;
            }
        } catch (error) {
            elizaLogger.error("Error increment world :", error);
            callback({
                text: `Failed to increment ${error}, incrementContent : ${JSON.stringify(
                    incrementContent
                )}`,
                content: { error: "Failed to increment world" },
            });
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Increment world by value 1",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you increment the world by value 1 ",
                    action: "INCREMENT",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully increment value 1  to world, Transaction: 0x39a8c432d9bdad993a33cc1faf2e9b58fb7dd940c0425f1d6db3997e4b4b05c0",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
