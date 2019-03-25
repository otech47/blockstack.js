"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getName(profile) {
    if (!profile) {
        return null;
    }
    let name = null;
    if (profile.name) {
        name = profile.name;
    }
    else if (profile.givenName || profile.familyName) {
        name = '';
        if (profile.givenName) {
            name = profile.givenName;
        }
        if (profile.familyName) {
            name += ` ${profile.familyName}`;
        }
    }
    return name;
}
exports.getName = getName;
function getGivenName(profile) {
    if (!profile) {
        return null;
    }
    let givenName = null;
    if (profile.givenName) {
        givenName = profile.givenName;
    }
    else if (profile.name) {
        const nameParts = profile.name.split(' ');
        givenName = nameParts.slice(0, -1).join(' ');
    }
    return givenName;
}
exports.getGivenName = getGivenName;
function getFamilyName(profile) {
    if (!profile) {
        return null;
    }
    let familyName = null;
    if (profile.familyName) {
        familyName = profile.familyName;
    }
    else if (profile.name) {
        const nameParts = profile.name.split(' ');
        familyName = nameParts.pop();
    }
    return familyName;
}
exports.getFamilyName = getFamilyName;
function getDescription(profile) {
    if (!profile) {
        return null;
    }
    let description = null;
    if (profile.description) {
        description = profile.description;
    }
    return description;
}
exports.getDescription = getDescription;
function getAvatarUrl(profile) {
    if (!profile) {
        return null;
    }
    let avatarContentUrl = null;
    if (profile.image) {
        profile.image.map((image) => {
            if (image.name === 'avatar') {
                avatarContentUrl = image.contentUrl;
                return avatarContentUrl;
            }
            else {
                return null;
            }
        });
    }
    return avatarContentUrl;
}
exports.getAvatarUrl = getAvatarUrl;
function getVerifiedAccounts(profile, verifications) {
    if (!profile) {
        return null;
    }
    const filteredAccounts = [];
    if (profile.hasOwnProperty('account') && verifications) {
        profile.account.map((account) => {
            let accountIsValid = false;
            let proofUrl = null;
            verifications.map((verification) => {
                if (verification.hasOwnProperty('proof_url')) {
                    verification.proofUrl = verification.proof_url;
                }
                if (verification.valid
                    && verification.service === account.service
                    && verification.identifier === account.identifier
                    && verification.proofUrl) {
                    accountIsValid = true;
                    proofUrl = verification.proofUrl;
                    return true;
                }
                else {
                    return false;
                }
            });
            if (accountIsValid) {
                account.proofUrl = proofUrl;
                filteredAccounts.push(account);
                return account;
            }
            else {
                return null;
            }
        });
    }
    return filteredAccounts;
}
exports.getVerifiedAccounts = getVerifiedAccounts;
function getOrganizations(profile) {
    if (!profile) {
        return null;
    }
    const organizations = [];
    if (profile.hasOwnProperty('worksFor')) {
        return profile.worksFor;
    }
    return organizations;
}
exports.getOrganizations = getOrganizations;
function getConnections(profile) {
    if (!profile) {
        return null;
    }
    let connections = [];
    if (profile.hasOwnProperty('knows')) {
        connections = profile.knows;
    }
    return connections;
}
exports.getConnections = getConnections;
function getAddress(profile) {
    if (!profile) {
        return null;
    }
    let addressString = null;
    if (profile.hasOwnProperty('address')) {
        const addressParts = [];
        if (profile.address.hasOwnProperty('streetAddress')) {
            addressParts.push(profile.address.streetAddress);
        }
        if (profile.address.hasOwnProperty('addressLocality')) {
            addressParts.push(profile.address.addressLocality);
        }
        if (profile.address.hasOwnProperty('postalCode')) {
            addressParts.push(profile.address.postalCode);
        }
        if (profile.address.hasOwnProperty('addressCountry')) {
            addressParts.push(profile.address.addressCountry);
        }
        if (addressParts.length) {
            addressString = addressParts.join(', ');
        }
    }
    return addressString;
}
exports.getAddress = getAddress;
function getBirthDate(profile) {
    if (!profile) {
        return null;
    }
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    let birthDateString = null;
    if (profile.hasOwnProperty('birthDate')) {
        const date = new Date(profile.birthDate);
        birthDateString = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    return birthDateString;
}
exports.getBirthDate = getBirthDate;
//# sourceMappingURL=personUtils.js.map