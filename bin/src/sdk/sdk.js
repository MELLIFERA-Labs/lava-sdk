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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLavaSDK = void 0;
const wallet_1 = require("../wallet/wallet");
const errors_1 = __importDefault(require("./errors"));
const relayer_1 = __importDefault(require("../relayer/relayer"));
const stateTracker_1 = require("../stateTracker/stateTracker");
const chains_1 = require("../util/chains");
class LavaSDK {
    constructor(endpoint, chainID, rpcInterface, privKey) {
        this.chainID = chainID;
        this.rpcInterface = rpcInterface;
        this.privKey = privKey;
        this.lavaEndpoint = endpoint;
        this.account = errors_1.default.errAccountNotInitialized;
        this.relayer = errors_1.default.errRelayerServiceNotInitialized;
        this.stateTracker = errors_1.default.errStateTrackerServiceNotInitialized;
    }
    /**
     * Init lava-SDK
     *
     * @async
     * After creating LavaSDK manually with new LavaSDK(...)
     * it needs to be initializes with object.init()
     *
     * Better approach is not to do this manually but to use createLavaSDK method
     *
    */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize wallet
            // Create wallet
            const wallet = yield (0, wallet_1.createWallet)(this.privKey);
            // Get account from wallet
            this.account = yield wallet.getConsumerAccount();
            // print account detail
            wallet.printAccount(this.account);
            // Initialize state tracker
            // Create state stracker
            this.stateTracker = yield (0, stateTracker_1.createStateTracker)(this.lavaEndpoint);
            // Initialize relayer
            // Get current consumer session
            const consumerSession = yield this.stateTracker.getConsumerSession(this.account, this.chainID, this.rpcInterface);
            // Create relayer
            this.relayer = new relayer_1.default(consumerSession, this.chainID, this.privKey);
        });
    }
    /**
     * Send relay to network through providers
     *
     * @async
     * @param {string} method - RPC method name
     * @param {string[]} params - RPC params
     *
     * @returns Promise object represents json response
     *
    */
    sendRelay(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if account was initialized
            if (this.relayer instanceof Error) {
                throw errors_1.default.errRelayerServiceNotInitialized;
            }
            // Check if state tracker was initialized
            if (this.stateTracker instanceof Error) {
                throw errors_1.default.errStateTrackerServiceNotInitialized;
            }
            // Check if state tracker was initialized
            if (this.account instanceof Error) {
                throw errors_1.default.errAccountNotInitialized;
            }
            // For every relay get new current session
            // Todo in the future do this only on epoch change
            // And in the relay generate random session_id
            const consumerSession = yield this.stateTracker.getConsumerSession(this.account, this.chainID, this.rpcInterface);
            this.relayer.setConsumerSession(consumerSession);
            // Send relay
            const relayResponse = yield this.relayer.sendRelay(method, params);
            // Decode relay response
            var dec = new TextDecoder();
            const decodedResponse = dec.decode(relayResponse.getData_asU8());
            return decodedResponse;
        });
    }
}
/**
 * Create Lava-SDK instance
 *
 * Lava-SDK is used for dAccess with provided network
 * You can find all supported networks and there chainIDs
 * in the (url)
 *
 * @async
 * @param {string} privateKey - Private key of lava network staked client
 * @param {string} chainID - ChainID for the network you want to query
 * @param {string} endpoint - Lava network public rpc endpoint (default: http://public-rpc.lavanet.xyz:80/rpc/)
 * @param {?string} rpcInterface - rpcInterface of provider, it's optional so if not set for cosmos-chains it will be tendermintRPC and for evm chains jsonRPC
 *
 * @returns Promise object represents LavaSDK object
 */
function createLavaSDK(privateKey, chainID, endpoint, rpcInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate chainID
        if (!(0, chains_1.isValidChainID)(chainID)) {
            throw errors_1.default.errChainIDUnsupported;
        }
        // If the rpc is not defined used default for specified chainID
        if (typeof rpcInterface === "undefined") {
            rpcInterface = (0, chains_1.fetchRpcInterface)(chainID);
        }
        // Create lavaSDK
        const lavaSDK = new LavaSDK(endpoint, chainID, rpcInterface, privateKey);
        // Initialize lavaSDK
        yield lavaSDK.init();
        return lavaSDK;
    });
}
exports.createLavaSDK = createLavaSDK;
