
/**
 * Represents the interface of the static JWT-decode module.
 */
interface JwtDecodeStatic {
    (token: string): { [key: string]: any };
}

/**
 * Declares the static variable of the JWT-decode module.
 */
declare var jwt_decode: JwtDecodeStatic;

/**
 * Declares the JWT-module.
 */
declare module "jwt_decode" {
    export = jwt_decode;
}

/// <reference path="Declarations.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/knockout/knockout.d.ts" />
/// <reference path="../../bower_components/typescript-globalization/build/typescript-globalization.d.ts" />
/// <reference path="../../bower_components/typescript-storage-service/build/typescript-storage-service.d.ts" />
declare module 'Authentication/AuthenticationConfiguration' {
	/// <reference path="../Typings/References.d.ts" />
	import StorageKind = require("Storage/StorageKind"); class AuthenticationConfiguration {
	    /**
	     * Gets or sets the base URI of the identity service.
	     */
	    uri: string;
	    /**
	     * Gets or sets the ID of the client, which the web application represents.
	     */
	    clientId: string;
	    /**
	     * Gets or sets the URI path to which the Identity Server redirects after the tokens were renewed.
	     */
	    renewCallbackPath: string;
	    /**
	     * Gets or sets the response type.
	     */
	    responseType: string;
	    /**
	     * Gets or sets the scope that should be requested from the identity service.
	     */
	    scopes: Array<string>;
	    /**
	     * Gets or sets the URI that is used to sign in.
	     */
	    signInPath: string;
	    /**
	     * Gets or sets the URI that is used to sign out.
	     */
	    signOutPath: string;
	    /**
	     * Gets or sets the storage kind that should be used to persist the token.
	     */
	    storageKind: StorageKind;
	}
	export = AuthenticationConfiguration;

}
declare module 'Authentication/AuthenticationService' {
	/// <reference path="../Typings/References.d.ts" />
	import AuthenticationConfiguration = require("Authentication/AuthenticationConfiguration");
	import AuthenticationState = require("Authentication/AuthenticationState"); class AuthenticationService {
	    /**
	     * Contains a value that determines the state of the authentication.
	     */
	    private static _state;
	    /**
	     * Contains the bearer token which is used to authenticate the user. This value is null if no user is signed in.
	     */
	    private static _bearerToken;
	    /**
	     * Contains some information about the current user. This value is null if no user is signed in.
	     */
	    private static _user;
	    /**
	     * Contains the current configuration of the authentication service.
	     */
	    private static configuration;
	    /**
	     * Contains the store that is used to persist the token.
	     */
	    private static store;
	    /**
	     * Generates a new GUID and returns it.
	     * @return string Returns a GUID, which is generated randomly.
	     */
	    private static generateGuid();
	    /**
	     * Removes all authentication-based values from the local store.
	     */
	    private static clearStore();
	    /**
	     * Checks whether an bearer token has been provided via hash and writes it to the local storage.
	     * @param {string} silentHash If this parameter is provided, the method will detect the bearer token from the string instead of the window.location.hash.
	     */
	    private static detectBearerToken(silentHash?);
	    /**
	     * Checks the token and sets all variables according to its state.
	     */
	    private static checkToken();
	    /**
	     * Silently renews the token by using an iFrame.
	     * @return {JQueryPromise<string>} Returns the silent hash from the identity server.
	     */
	    private static silentRenew();
	    /**
	     * Gets a value that determines the state of the authentication.
	     */
	    static readonly state: KnockoutObservable<AuthenticationState>;
	    /**
	     * Gets the bearer token which is used to authenticate the user. This value is null if no user is signed in.
	     */
	    static readonly bearerToken: KnockoutObservable<string | null>;
	    /**
	     * Gets some information about the current user. This value is null if no user is signed in.
	     */
	    static readonly user: KnockoutObservable<{
	        [key: string]: any;
	    } | null>;
	    /**
	     * Configures the authentication manager so that it can be used to detect bearer tokens and obtain refresh tokens.
	     * @param {AuthenticationConfiguration} configuration The configuration that the authentication service should use.
	     */
	    static use(configuration: AuthenticationConfiguration): void;
	    /**
	     * Redirects the user to the URI where the sign in takes place.
	     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced.
	     */
	    static signIn(redirectUri?: string): void;
	    /**
	     * Redirects the user to the local sign in.
	     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced.
	     */
	    static signInLocal(redirectUri?: string): void;
	    /**
	    * Redirects the user to the sign in of an external provider. The provider is set as acr_values parameter in the request.
	    * @param {string} provider The name of the provider.
	    * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced.
	    */
	    static signInExternal(provider: string, redirectUri?: string): void;
	    /**
	     * Redirects the user to the provided path of the identity service.
	     * @param {string} path The path to which the user is redirected.
	     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced.
	     */
	    static redirect(path: string, redirectUri?: string): void;
	    /**
	     * Redirects the user to the URI where the sign out takes place.
	     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced.
	     */
	    static signOut(redirectUri?: string): void;
	    /**
	     * Clears all information that has been stored by the authentication service.
	     */
	    static clear(): void;
	}
	export = AuthenticationService;

}
declare module 'Authentication/AuthenticationState' {
	 enum AuthenticationState {
	    /**
	     * The user is not authenticated.
	     */
	    None = 0,
	    /**
	     * The user is authenticated.
	     */
	    Authenticated = 1,
	    /**
	     * An error occurred due to an invalid state or generic error (of the session).
	     */
	    Error = 2,
	    /**
	     * An error occurred during the silent renew process.
	     */
	    RenewError = 3,
	}
	export = AuthenticationState;

}
