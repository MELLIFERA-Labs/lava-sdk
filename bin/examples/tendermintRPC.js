"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO when we publish package we will import latest stable version and not using relative path
const sdk_1 = require("../src/sdk/sdk");
/*
  Demonstrates how to use LavaSDK to send tendermintRPC calls to the Cosmos Hub.

  You can find a list with all supported chains (https://github.com/lavanet/lava-sdk/blob/main/supportedChains.json)
  
  Lava SDK supports only rpc calls with positional parameters
  {"jsonrpc": "2.0", "method": "block", "params": ["23"], "id": 1}
  But not rpc calls with named parameters
  {"jsonrpc": "2.0", "method": "subtract", "params": {"subtrahend": 23, "minuend": 42}, "id": 3}
*/
function getLatestBlock() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create dAccess for Cosmos Hub
        // Default rpcInterface for Cosmos Hub is tendermintRPC
        const cosmosHub = yield new sdk_1.LavaSDK({
            // private key with an active subscription
            privateKey: "<lava consumer private key>",
            // chainID for Cosmos Hub
            chainID: "COS5",
            // geolocation 1 for North america - geolocation 2 for Europe providers
            // default value is 1
            geolocation: "2",
        });
        // Get abci_info
        const info = yield cosmosHub.sendRelay({
            method: "abci_info",
            params: [],
        });
        // Parse and extract response
        const parsedInfo = JSON.parse(info).result.response;
        // Extract latest block number
        const latestBlockNumber = parsedInfo.last_block_height;
        // Fetch latest block
        const latestBlock = yield cosmosHub.sendRelay({
            method: "block",
            params: [latestBlockNumber],
        });
        return latestBlock;
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const latestBlock = yield getLatestBlock();
            console.log("Latest block:", latestBlock);
            process.exit(0);
        }
        catch (error) {
            console.error("Error getting latest block:", error);
        }
    });
})();
