import { Plugin } from "@elizaos/core";
import transferToken from "./actions/transfer.ts";
import { WalletProvider, walletProvider } from "./providers/wallet.ts";
import { SuiService } from "./services/sui.ts";
import swapToken from "./actions/swap.ts";
import printPosition from "./actions/position.ts";
import incrementWorld from "./actions/increment.ts";

export { WalletProvider, transferToken as TransferSuiToken };

export const suiPlugin: Plugin = {
    name: "sui",
    description: "Sui Plugin for Eliza",
    actions: [transferToken, swapToken, printPosition, incrementWorld],
    evaluators: [],
    providers: [walletProvider],
    services: [new SuiService()],
};

export default suiPlugin;
