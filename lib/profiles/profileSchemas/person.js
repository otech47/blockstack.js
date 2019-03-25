"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore: Could not find a declaration file for module
const schema_inspector_1 = __importDefault(require("schema-inspector"));
const profile_1 = require("../profile");
const profileTokens_1 = require("../profileTokens");
const personLegacy_1 = require("./personLegacy");
const personUtils_1 = require("./personUtils");
const schemaDefinition = {
    type: 'object',
    strict: false,
    properties: {
        '@context': { type: 'string', optional: true },
        '@type': { type: 'string' },
        '@id': { type: 'string', optional: true },
        name: { type: 'string', optional: true },
        givenName: { type: 'string', optional: true },
        familyName: { type: 'string', optional: true },
        description: { type: 'string', optional: true },
        image: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                properties: {
                    '@type': { type: 'string' },
                    name: { type: 'string', optional: true },
                    contentUrl: { type: 'string', optional: true }
                }
            }
        },
        website: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                properties: {
                    '@type': { type: 'string' },
                    url: { type: 'string', optional: true }
                }
            }
        },
        account: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                properties: {
                    '@type': { type: 'string' },
                    service: { type: 'string', optional: true },
                    identifier: { type: 'string', optional: true },
                    proofType: { type: 'string', optional: true },
                    proofUrl: { type: 'string', optional: true },
                    proofMessage: { type: 'string', optional: true },
                    proofSignature: { type: 'string', optional: true }
                }
            }
        },
        worksFor: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                properties: {
                    '@type': { type: 'string' },
                    '@id': { type: 'string', optional: true }
                }
            }
        },
        knows: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                properties: {
                    '@type': { type: 'string' },
                    '@id': { type: 'string', optional: true }
                }
            }
        },
        address: {
            type: 'object',
            optional: true,
            properties: {
                '@type': { type: 'string' },
                streetAddress: { type: 'string', optional: true },
                addressLocality: { type: 'string', optional: true },
                postalCode: { type: 'string', optional: true },
                addressCountry: { type: 'string', optional: true }
            }
        },
        birthDate: { type: 'string', optional: true },
        taxID: { type: 'string', optional: true }
    }
};
class Person extends profile_1.Profile {
    constructor(profile = {}) {
        super(profile);
        this._profile = Object.assign({}, {
            '@type': 'Person'
        }, this._profile);
    }
    static validateSchema(profile, strict = false) {
        schemaDefinition.strict = strict;
        return schema_inspector_1.default.validate(schemaDefinition, profile);
    }
    static fromToken(token, publicKeyOrAddress = null) {
        const profile = profileTokens_1.extractProfile(token, publicKeyOrAddress);
        return new Person(profile);
    }
    static fromLegacyFormat(legacyProfile) {
        const profile = personLegacy_1.getPersonFromLegacyFormat(legacyProfile);
        return new Person(profile);
    }
    toJSON() {
        return {
            profile: this.profile(),
            name: this.name(),
            givenName: this.givenName(),
            familyName: this.familyName(),
            description: this.description(),
            avatarUrl: this.avatarUrl(),
            verifiedAccounts: this.verifiedAccounts(),
            address: this.address(),
            birthDate: this.birthDate(),
            connections: this.connections(),
            organizations: this.organizations()
        };
    }
    profile() {
        return Object.assign({}, this._profile);
    }
    name() {
        return personUtils_1.getName(this.profile());
    }
    givenName() {
        return personUtils_1.getGivenName(this.profile());
    }
    familyName() {
        return personUtils_1.getFamilyName(this.profile());
    }
    description() {
        return personUtils_1.getDescription(this.profile());
    }
    avatarUrl() {
        return personUtils_1.getAvatarUrl(this.profile());
    }
    verifiedAccounts(verifications) {
        return personUtils_1.getVerifiedAccounts(this.profile(), verifications);
    }
    address() {
        return personUtils_1.getAddress(this.profile());
    }
    birthDate() {
        return personUtils_1.getBirthDate(this.profile());
    }
    connections() {
        return personUtils_1.getConnections(this.profile());
    }
    organizations() {
        return personUtils_1.getOrganizations(this.profile());
    }
}
exports.Person = Person;
//# sourceMappingURL=person.js.map