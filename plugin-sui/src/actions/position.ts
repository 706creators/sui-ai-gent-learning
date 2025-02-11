import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ServiceType,
    State,
    elizaLogger,
    type Action,
} from "@elizaos/core";
import { SuiService } from "../services/sui";

// 新加了 action 以后，需要删除 数据库 rm -rf agent/data/db.sqlite
export default {
    name: "POSITION",
    similes: ["POSITION", "POSITION"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.info(`message  : ${JSON.stringify(message)}`);
        console.log("Validating some data from user:", message.userId);
        return true;
    },
    description: "Get the position of the agent's wallet",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.info("Starting POSITION handler...");

        const service = runtime.getService<SuiService>(
            ServiceType.TRANSCRIPTION
        );

        if (!state) {
            // Initialize or update state
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        if (service.getNetwork() != "mainnet") {
            const privateKey = await service.getPrivateKey();
            callback({
                text: `Here is your private key: ${privateKey}`,
                content: {
                    link: `https://github.com/706creators`,
                },
            });
            return true;
        } else {
            callback({
                text: "Sorry, I can only get the private key on the mainnet",
                content: {
                    error: "you are on the mainnet",
                },
            });
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Print your position",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll print my wallet position .",
                    action: "POSITION",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Here is my position ..... ",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
