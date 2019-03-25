"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importStar(require("crypto"));
const bitcoinjs_lib_1 = __importStar(require("bitcoinjs-lib"));
const bip39_1 = __importDefault(require("bip39"));
const bip32_1 = __importDefault(require("bip32"));
const utils_1 = require("./utils");
const wallet_1 = require("./encryption/wallet");
const APPS_NODE_INDEX = 0;
const IDENTITY_KEYCHAIN = 888;
const BLOCKSTACK_ON_BITCOIN = 0;
const BITCOIN_BIP_44_PURPOSE = 44;
const BITCOIN_COIN_TYPE = 0;
const BITCOIN_ACCOUNT_INDEX = 0;
const EXTERNAL_ADDRESS = 'EXTERNAL_ADDRESS';
const CHANGE_ADDRESS = 'CHANGE_ADDRESS';
function hashCode(string) {
    let hash = 0;
    if (string.length === 0)
        return hash;
    for (let i = 0; i < string.length; i++) {
        const character = string.charCodeAt(i);
        hash = (hash << 5) - hash + character;
        hash &= hash;
    }
    return hash & 0x7fffffff;
}
function getNodePrivateKey(node) {
    return utils_1.ecPairToHexString(bitcoinjs_lib_1.ECPair.fromPrivateKey(node.privateKey));
}
function getNodePublicKey(node) {
    return node.publicKey.toString('hex');
}
/**
 * The BlockstackWallet class manages the hierarchical derivation
 *  paths for a standard blockstack client wallet. This includes paths
 *  for bitcoin payment address, blockstack identity addresses, blockstack
 *  application specific addresses.
 *  @private
 */
class BlockstackWallet {
    constructor(rootNode) {
        this.rootNode = rootNode;
    }
    toBase58() {
        return this.rootNode.toBase58();
    }
    /**
     * Initialize a blockstack wallet from a seed buffer
     * @param {Buffer} seed - the input seed for initializing the root node
     *  of the hierarchical wallet
     * @return {BlockstackWallet} the constructed wallet
     */
    static fromSeedBuffer(seed) {
        return new BlockstackWallet(bip32_1.default.fromSeed(seed));
    }
    /**
     * Initialize a blockstack wallet from a base58 string
     * @param {string} keychain - the Base58 string used to initialize
     *  the root node of the hierarchical wallet
     * @return {BlockstackWallet} the constructed wallet
     */
    static fromBase58(keychain) {
        return new BlockstackWallet(bip32_1.default.fromBase58(keychain));
    }
    /**
     * Initialize a blockstack wallet from an encrypted phrase & password. Throws
     * if the password is incorrect. Supports all formats of Blockstack phrases.
     * @param {string} data - The encrypted phrase as a hex-encoded string
     * @param {string} password - The plain password
     * @return {Promise<BlockstackWallet>} the constructed wallet
     */
    static fromEncryptedMnemonic(data, password) {
        return wallet_1.decryptMnemonic(data, password)
            .then((mnemonic) => {
            const seed = bip39_1.default.mnemonicToSeed(mnemonic);
            return new BlockstackWallet(bip32_1.default.fromSeed(seed));
        })
            .catch((err) => {
            if (err.message && err.message.startsWith('bad header;')) {
                throw new Error('Incorrect password');
            }
            else {
                throw err;
            }
        });
    }
    /**
     * Generate a BIP-39 12 word mnemonic
     * @return {Promise<string>} space-separated 12 word phrase
     */
    static generateMnemonic() {
        return bip39_1.default.generateMnemonic(128, crypto_1.randomBytes);
    }
    /**
     * Encrypt a mnemonic phrase with a password
     * @param {string} mnemonic - Raw mnemonic phrase
     * @param {string} password - Password to encrypt mnemonic with
     * @return {Promise<string>} Hex-encoded encrypted mnemonic
     */
    static encryptMnemonic(mnemonic, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const encryptedBuffer = yield wallet_1.encryptMnemonic(mnemonic, password);
            return encryptedBuffer.toString('hex');
        });
    }
    getIdentityPrivateKeychain() {
        return this.rootNode
            .deriveHardened(IDENTITY_KEYCHAIN)
            .deriveHardened(BLOCKSTACK_ON_BITCOIN);
    }
    getBitcoinPrivateKeychain() {
        return this.rootNode
            .deriveHardened(BITCOIN_BIP_44_PURPOSE)
            .deriveHardened(BITCOIN_COIN_TYPE)
            .deriveHardened(BITCOIN_ACCOUNT_INDEX);
    }
    getBitcoinNode(addressIndex, chainType = EXTERNAL_ADDRESS) {
        return BlockstackWallet.getNodeFromBitcoinKeychain(this.getBitcoinPrivateKeychain().toBase58(), addressIndex, chainType);
    }
    getIdentityAddressNode(identityIndex) {
        const identityPrivateKeychain = this.getIdentityPrivateKeychain();
        return identityPrivateKeychain.deriveHardened(identityIndex);
    }
    static getAppsNode(identityNode) {
        return identityNode.deriveHardened(APPS_NODE_INDEX);
    }
    /**
     * Get a salt for use with creating application specific addresses
     * @return {String} the salt
     */
    getIdentitySalt() {
        const identityPrivateKeychain = this.getIdentityPrivateKeychain();
        const publicKeyHex = getNodePublicKey(identityPrivateKeychain);
        return crypto_1.default.createHash('sha256').update(publicKeyHex).digest('hex');
    }
    /**
     * Get a bitcoin receive address at a given index
     * @param {number} addressIndex - the index of the address
     * @return {String} address
     */
    getBitcoinAddress(addressIndex) {
        return BlockstackWallet.getAddressFromBIP32Node(this.getBitcoinNode(addressIndex));
    }
    /**
     * Get the private key hex-string for a given bitcoin receive address
     * @param {number} addressIndex - the index of the address
     * @return {String} the hex-string. this will be either 64
     * characters long to denote an uncompressed bitcoin address, or 66
     * characters long for a compressed bitcoin address.
     */
    getBitcoinPrivateKey(addressIndex) {
        return getNodePrivateKey(this.getBitcoinNode(addressIndex));
    }
    /**
     * Get the root node for the bitcoin public keychain
     * @return {String} base58-encoding of the public node
     */
    getBitcoinPublicKeychain() {
        return this.getBitcoinPrivateKeychain().neutered();
    }
    /**
     * Get the root node for the identity public keychain
     * @return {String} base58-encoding of the public node
     */
    getIdentityPublicKeychain() {
        return this.getIdentityPrivateKeychain().neutered();
    }
    static getNodeFromBitcoinKeychain(keychainBase58, addressIndex, chainType = EXTERNAL_ADDRESS) {
        let chain;
        if (chainType === EXTERNAL_ADDRESS) {
            chain = 0;
        }
        else if (chainType === CHANGE_ADDRESS) {
            chain = 1;
        }
        else {
            throw new Error('Invalid chain type');
        }
        const keychain = bip32_1.default.fromBase58(keychainBase58);
        return keychain.derive(chain).derive(addressIndex);
    }
    /**
     * Get a bitcoin address given a base-58 encoded bitcoin node
     * (usually called the account node)
     * @param {String} keychainBase58 - base58-encoding of the node
     * @param {number} addressIndex - index of the address to get
     * @param {String} chainType - either 'EXTERNAL_ADDRESS' (for a
     * "receive" address) or 'CHANGE_ADDRESS'
     * @return {String} the address
     */
    static getAddressFromBitcoinKeychain(keychainBase58, addressIndex, chainType = EXTERNAL_ADDRESS) {
        return BlockstackWallet.getAddressFromBIP32Node(BlockstackWallet
            .getNodeFromBitcoinKeychain(keychainBase58, addressIndex, chainType));
    }
    /**
     * Get a ECDSA private key hex-string for an application-specific
     *  address.
     * @param {String} appsNodeKey - the base58-encoded private key for
     * applications node (the `appsNodeKey` return in getIdentityKeyPair())
     * @param {String} salt - a string, used to salt the
     * application-specific addresses
     * @param {String} appDomain - the appDomain to generate a key for
     * @return {String} the private key hex-string. this will be a 64
     * character string
     */
    static getLegacyAppPrivateKey(appsNodeKey, salt, appDomain) {
        const hash = crypto_1.default
            .createHash('sha256')
            .update(`${appDomain}${salt}`)
            .digest('hex');
        const appIndex = hashCode(hash);
        const appNode = bip32_1.default.fromBase58(appsNodeKey).deriveHardened(appIndex);
        return getNodePrivateKey(appNode).slice(0, 64);
    }
    static getAddressFromBIP32Node(node) {
        return bitcoinjs_lib_1.default.payments.p2pkh({ pubkey: node.publicKey }).address;
    }
    /**
     * Get a ECDSA private key hex-string for an application-specific
     *  address.
     * @param {String} appsNodeKey - the base58-encoded private key for
     * applications node (the `appsNodeKey` return in getIdentityKeyPair())
     * @param {String} salt - a string, used to salt the
     * application-specific addresses
     * @param {String} appDomain - the appDomain to generate a key for
     * @return {String} the private key hex-string. this will be a 64
     * character string
     */
    static getAppPrivateKey(appsNodeKey, salt, appDomain) {
        const hash = crypto_1.default
            .createHash('sha256')
            .update(`${appDomain}${salt}`)
            .digest('hex');
        const appIndexHexes = [];
        // note: there's hardcoded numbers here, precisely because I want this
        //   code to be very specific to the derivation paths we expect.
        if (hash.length !== 64) {
            throw new Error(`Unexpected app-domain hash length of ${hash.length}`);
        }
        for (let i = 0; i < 11; i++) { // split the hash into 3-byte chunks
            // because child nodes can only be up to 2^31,
            // and we shouldn't deal in partial bytes.
            appIndexHexes.push(hash.slice(i * 6, i * 6 + 6));
        }
        let appNode = bip32_1.default.fromBase58(appsNodeKey);
        appIndexHexes.forEach((hex) => {
            if (hex.length > 6) {
                throw new Error('Invalid hex string length');
            }
            appNode = appNode.deriveHardened(parseInt(hex, 16));
        });
        return getNodePrivateKey(appNode).slice(0, 64);
    }
    /**
     * Get the keypair information for a given identity index. This
     * information is used to obtain the private key for an identity address
     * and derive application specific keys for that address.
     * @param {number} addressIndex - the identity index
     * @param {boolean} alwaysUncompressed - if true, always return a
     *   private-key hex string corresponding to the uncompressed address
     * @return {Object} an IdentityKeyPair type object with keys:
     *   .key {String} - the private key hex-string
     *   .keyID {String} - the public key hex-string
     *   .address {String} - the identity address
     *   .appsNodeKey {String} - the base-58 encoding of the applications node
     *   .salt {String} - the salt used for creating app-specific addresses
     */
    getIdentityKeyPair(addressIndex, alwaysUncompressed = false) {
        const identityNode = this.getIdentityAddressNode(addressIndex);
        const address = BlockstackWallet.getAddressFromBIP32Node(identityNode);
        let identityKey = getNodePrivateKey(identityNode);
        if (alwaysUncompressed && identityKey.length === 66) {
            identityKey = identityKey.slice(0, 64);
        }
        const identityKeyID = getNodePublicKey(identityNode);
        const appsNodeKey = BlockstackWallet.getAppsNode(identityNode).toBase58();
        const salt = this.getIdentitySalt();
        const keyPair = {
            key: identityKey,
            keyID: identityKeyID,
            address,
            appsNodeKey,
            salt
        };
        return keyPair;
    }
}
exports.BlockstackWallet = BlockstackWallet;
//# sourceMappingURL=wallet.js.map