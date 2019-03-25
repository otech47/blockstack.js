"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
function isNameValid(fullyQualifiedName = '') {
    const NAME_PART_RULE = /^[a-z0-9\-_+]+$/;
    const LENGTH_MAX_NAME = 37;
    if (!fullyQualifiedName
        || fullyQualifiedName.length > LENGTH_MAX_NAME) {
        return Promise.resolve(false);
    }
    const nameParts = fullyQualifiedName.split('.');
    if (nameParts.length !== 2) {
        return Promise.resolve(false);
    }
    return Promise.resolve(nameParts.reduce((agg, namePart) => {
        if (!agg) {
            return false;
        }
        else {
            return NAME_PART_RULE.test(namePart);
        }
    }, true));
}
function isNamespaceValid(namespaceID) {
    const NAMESPACE_RULE = /^[a-z0-9\-_]{1,19}$/;
    return Promise.resolve(namespaceID.match(NAMESPACE_RULE) !== null);
}
function isNameAvailable(fullyQualifiedName) {
    return config_1.config.network.getNameInfo(fullyQualifiedName)
        .then(() => false)
        .catch((e) => {
        if (e.message === 'Name not found') {
            return true;
        }
        else {
            throw e;
        }
    });
}
function isNamespaceAvailable(namespaceID) {
    return config_1.config.network.getNamespaceInfo(namespaceID)
        .then(() => false)
        .catch((e) => {
        if (e.message === 'Namespace not found') {
            return true;
        }
        else {
            throw e;
        }
    });
}
function ownsName(fullyQualifiedName, ownerAddress) {
    return config_1.config.network.getNameInfo(fullyQualifiedName)
        .then(nameInfo => nameInfo.address === ownerAddress)
        .catch((e) => {
        if (e.message === 'Name not found') {
            return false;
        }
        else {
            throw e;
        }
    });
}
function revealedNamespace(namespaceID, revealAddress) {
    return config_1.config.network.getNamespaceInfo(namespaceID)
        .then(namespaceInfo => namespaceInfo.recipient_address === revealAddress)
        .catch((e) => {
        if (e.message === 'Namespace not found') {
            return false;
        }
        else {
            throw e;
        }
    });
}
function namespaceIsReady(namespaceID) {
    return config_1.config.network.getNamespaceInfo(namespaceID)
        .then(namespaceInfo => namespaceInfo.ready)
        .catch((e) => {
        if (e.message === 'Namespace not found') {
            return false;
        }
        else {
            throw e;
        }
    });
}
function namespaceIsRevealed(namespaceID) {
    return config_1.config.network.getNamespaceInfo(namespaceID)
        .then(namespaceInfo => !namespaceInfo.ready)
        .catch((e) => {
        if (e.message === 'Namespace not found') {
            return false;
        }
        else {
            throw e;
        }
    });
}
function isInGracePeriod(fullyQualifiedName) {
    const network = config_1.config.network;
    return Promise.all([network.getNameInfo(fullyQualifiedName),
        network.getBlockHeight(),
        network.getGracePeriod(fullyQualifiedName)])
        .then(([nameInfo, blockHeight, gracePeriod]) => {
        const expiresAt = nameInfo.expire_block;
        return (blockHeight >= expiresAt) && (blockHeight < (gracePeriod + expiresAt));
    })
        .catch((e) => {
        if (e.message === 'Name not found') {
            return false;
        }
        else {
            throw e;
        }
    });
}
function addressCanReceiveName(address) {
    return config_1.config.network.getNamesOwned(address)
        .then(names => (Promise.all(names.map(name => isNameValid(name)))
        .then(validNames => validNames.filter(nameValid => nameValid).length < 25)));
}
function isAccountSpendable(address, tokenType, blockHeight) {
    return config_1.config.network.getAccountStatus(address, tokenType)
        .then(accountStatus => accountStatus.transfer_send_block_id >= blockHeight);
}
exports.safety = {
    addressCanReceiveName,
    isInGracePeriod,
    ownsName,
    isNameAvailable,
    isNameValid,
    isNamespaceValid,
    isNamespaceAvailable,
    revealedNamespace,
    namespaceIsReady,
    namespaceIsRevealed,
    isAccountSpendable
};
//# sourceMappingURL=safety.js.map