"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const service_1 = require("./service");
class LinkedIn extends service_1.Service {
    static getBaseUrls() {
        const baseUrls = [
            'https://www.linkedin.com/feed/update/',
            'http://www.linkedin.com/feed/update/',
            'www.linkedin.com/feed/update/'
        ];
        return baseUrls;
    }
    static getProofUrl(proof) {
        const baseUrls = this.getBaseUrls();
        let proofUrl = proof.proof_url.toLowerCase();
        proofUrl = super.prefixScheme(proofUrl);
        for (let i = 0; i < baseUrls.length; i++) {
            if (proofUrl.startsWith(`${baseUrls[i]}`)) {
                return proofUrl;
            }
        }
        throw new Error(`Proof url ${proof.proof_url} is not valid for service ${proof.service}`);
    }
    static normalizeUrl(proof) {
        return '';
    }
    static shouldValidateIdentityInBody() {
        return true;
    }
    static getProofIdentity(searchText) {
        const $ = cheerio_1.default.load(searchText);
        const profileLink = $('.share-update-card__header > a');
        if (profileLink !== undefined) {
            if (profileLink.attr('href') === undefined) {
                return '';
            }
            const url = profileLink.attr('href');
            // Parse URL for identifier
            const identifier = url.split('?').shift().split('/').pop();
            return identifier;
        }
        else {
            return '';
        }
    }
    static getProofStatement(searchText) {
        const $ = cheerio_1.default.load(searchText);
        const postContent = $('.share-update-card__update-text');
        let statement = '';
        if (postContent !== undefined) {
            statement = postContent.text();
        }
        return statement;
    }
}
exports.LinkedIn = LinkedIn;
//# sourceMappingURL=linkedIn.js.map