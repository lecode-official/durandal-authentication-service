
///<amd-module name='Authentication/AuthenticationConfiguration'/>

// #region Import Directives

/// <reference path="../Typings/References.d.ts" />

import StorageKind = require("Storage/StorageKind");

// #endregion

/**
 * Represents the configuration of the authentication service.
 */
class AuthenticationConfiguration {

    // #region Public Properties

    /**
     * Gets or sets the base URI of the identity service.
     */
    public uri: string;

    /**
     * Gets or sets the ID of the client, which the web application represents.
     */
    public clientId: string;

    /**
     * Gets or sets the URI path to which the Identity Server redirects after the tokens were renewed.
     */
    public renewCallbackPath: string;

    /**
     * Gets or sets the response type.
     */
    public responseType: string;

    /**
     * Gets or sets the scope that should be requested from the identity service.
     */
    public scopes: Array<string>;

    /**
     * Gets or sets additional parameters that are sent to the sign in endpoint.
     */
    public additionalParameters: { [key: string]: string; }|null;

    /**
     * Gets or sets the URI that is used to sign in.
     */
    public signInPath: string;

    /**
     * Gets or sets the URI that is used to sign out.
     */
    public signOutPath: string;

    /**
     * Gets or sets the storage kind that should be used to persist the token.
     */
    public storageKind: StorageKind;

    // #endregion

}

// Exports the module, so that it can be loaded by Require
export = AuthenticationConfiguration;