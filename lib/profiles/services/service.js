"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cross-fetch/polyfill");
const serviceUtils_1 = require("./serviceUtils");
class Service {
    static validateProof(proof, ownerAddress, name = null) {
        let proofUrl;
        return Promise.resolve()
            .then(() => {
            proofUrl = this.getProofUrl(proof);
            return fetch(proofUrl);
        })
            .then((res) => {
            if (res.status !== 200) {
                throw new Error(`Proof url ${proofUrl} returned unexpected http status ${res.status}.
              Unable to validate proof.`);
            }
            return res.text();
        })
            .then((text) => {
            // Validate identity in provided proof body/tags if required
            if (this.shouldValidateIdentityInBody()
                && proof.identifier !== this.getProofIdentity(text)) {
                return proof;
            }
            const proofText = this.getProofStatement(text);
            proof.valid = serviceUtils_1.containsValidProofStatement(proofText, name)
                || serviceUtils_1.containsValidAddressProofStatement(proofText, ownerAddress);
            return proof;
        })
            .catch((error) => {
            console.error(error);
            proof.valid = false;
            return proof;
        });
    }
    static getBaseUrls() {
        return [];
    }
    static getProofIdentity(searchText) {
        return searchText;
    }
    static getProofStatement(searchText) {
        return searchText;
    }
    static shouldValidateIdentityInBody() {
        return false;
    }
    static prefixScheme(proofUrl) {
        if (!proofUrl.startsWith('https://') && !proofUrl.startsWith('http://')) {
            return `https://${proofUrl}`;
        }
        else if (proofUrl.startsWith('http://')) {
            return proofUrl.replace('http://', 'https://');
        }
        else {
            return proofUrl;
        }
    }
    static getProofUrl(proof) {
        const baseUrls = this.getBaseUrls();
        let proofUrl = proof.proof_url.toLowerCase();
        proofUrl = this.prefixScheme(proofUrl);
        for (let i = 0; i < baseUrls.length; i++) {
            const requiredPrefix = `${baseUrls[i]}${proof.identifier}`.toLowerCase();
            if (proofUrl.startsWith(requiredPrefix)) {
                return proofUrl;
            }
        }
        throw new Error(`Proof url ${proof.proof_url} is not valid for service ${proof.service}`);
    }
}
exports.Service = Service;
//# sourceMappingURL=service.js.map