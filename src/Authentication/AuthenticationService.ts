﻿ 
///<amd-module name='Authentication/AuthenticationService'/>

// #region Import Directives

/// <reference path="../Typings/References.d.ts" />

import AuthenticationConfiguration = require("Authentication/AuthenticationConfiguration");
import AuthenticationState = require("Authentication/AuthenticationState");
import DateTime = require("Globalization/DateTime");
import HttpClient = require("Http/HttpClient");
import jwt_decode = require("jwt_decode");
import jquery = require("jquery");
import knockout = require("knockout");
import IStore = require("Storage/IStore");
import StorageService = require("Storage/StorageService");
import TimeSpan = require("Globalization/TimeSpan");
import User = require("Authentication/User");

// #endregion

/**
 * Represents a service that is used to manage authentication, which means detecting bearer tokens and requesting refresh tokens.
 */
class AuthenticationService {

    // #region Private Static Fields

    /**
     * Contains a value that determines the state of the authentication.
     */
    private static _state: KnockoutObservable<AuthenticationState> = knockout.observable<AuthenticationState>(AuthenticationState.None); 

    /**
     * Contains some information about the current user. This value is null if no user is signed in.
     */
    private static _user: KnockoutObservable<User|null> = knockout.observable<User|null>(null);

    /**
     * Contains the current configuration of the authentication service.
     */
    private static configuration: AuthenticationConfiguration;

    /**
     * Contains the store that is used to persist the token.
     */
    private static store: IStore;

    // #endregion

    // #region Private Static Methods

    /**
     * Generates a new GUID and returns it.
     * @return string Returns a GUID, which is generated randomly.
     */
    private static generateGuid(): string {

        // Defines the random function for generating the GUID parts.
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        // Returns a new GUID
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    /**
     * Removes all authentication-based values from the local store.
     */
    private static clearStore() {
        AuthenticationService.store.store<string>("AuthenticationService:BearerToken", null);
        AuthenticationService.store.store<DateTime>("AuthenticationService:BearerTokenExpiration", null);
        StorageService.local.store<string>("AuthenticationService:State", null);
    }

    /**
     * Checks whether an bearer token has been provided via hash and writes it to the local storage.
     * @param {string} silentHash If this parameter is provided, the method will detect the bearer token from the string instead of the window.location.hash. 
     */
    private static detectBearerToken(silentHash?: string) {

        // Checks whether a hash is provided, which indicates that an bearer token may be part of the hash
        if (!silentHash && (!window.location.hash || window.location.hash.substr(1).length == 0)) {
            return;
        }
        if (!!silentHash && silentHash.substr(1).length == 0) {
            return;
        }

        // Gets the hash without the #-character
        var hash = !!silentHash ? silentHash.substr(1) : window.location.hash.substr(1);
        
        // Initializes a dictionary that will be filled with key-value-pairs from the hash
        var hashParameters: { [Key: string]: string; } = {};

        // Fills the dictionary with the hash content
        hash.split('&').forEach(keyValuePair => {

            // Checks whether the key value pair contains a =-character, which is required to mark it as real key-value-pair
            if (keyValuePair.indexOf("=") == -1) {
                return;
            }

            // Adds the key-value-pair to the dictionary
            var pair = keyValuePair.split("=", 2);
            hashParameters[pair[0]] = pair[1];
        });

        // Checks whether an "error" entry exists or an "access_token" has been provided
        if (!!hashParameters["error"]) {

            // Sets the new state of the authentication
            AuthenticationService.state(!!silentHash ? AuthenticationState.RenewError : AuthenticationState.Error);

            // Clears all values depending on the bearer token
            AuthenticationService.clearStore();

            // Clears the hash as it should not be detected by the navigation service
            if (!silentHash) {
                window.location.hash = "";
            }
        } else if (!!hashParameters["state"] && !!hashParameters["access_token"] && !!hashParameters["id_token"]) {
            
            // Checks whether the state of the authentication request is the same as in the response
            if (hashParameters["state"] === StorageService.local.get<string>("AuthenticationService:State")) {
                
                // Adds the new bearer token to the local storage
                StorageService.local.store<string>("AuthenticationService:State", null);
                AuthenticationService.store.store<string>("AuthenticationService:IdToken", hashParameters["id_token"]);
                AuthenticationService.store.store<string>("AuthenticationService:BearerToken", hashParameters["access_token"]);
                AuthenticationService.store.store<DateTime>("AuthenticationService:BearerTokenExpiration", DateTime.now.addSeconds(parseInt(hashParameters["expires_in"])));
            } else {
                
                // Sets the new state of the authentication
                AuthenticationService.state(!!silentHash ? AuthenticationState.RenewError : AuthenticationState.Error);

                // Clears all values depending on the bearer token
                AuthenticationService.clearStore();
            }

            // Clears the hash as it should not be detected by the navigation service
            if (!silentHash) {
                window.location.hash = "";
            }
        }
    }

    /**
     * Checks the token and sets all variables according to its state.
     */
    private static checkToken() {

        // Gets the bearer token
        var bearerToken = AuthenticationService.store.get<string>("AuthenticationService:BearerToken");
        var bearerTokenExpiration = AuthenticationService.store.get<DateTime>("AuthenticationService:BearerTokenExpiration");

        // Gets the ID token
        var token = AuthenticationService.store.get<string>("AuthenticationService:IdToken");

        // Checks whether the bearer token is still valid
        if (!bearerToken || !token || !bearerTokenExpiration || TimeSpan.fromDateTime(bearerTokenExpiration, DateTime.now).ticks < 0) {
            
            // Clears all values depending on the bearer token
            AuthenticationService.clearStore();
        } else {

            // Sets the state of the authentication to authenticated
            AuthenticationService.state(AuthenticationState.Authenticated);
            
            // Sets the timeout for silent renew
            window.setTimeout(() => {

                // Starts the silent renew
                AuthenticationService.silentRenew().then(silentHash => {
                    
                    // Detects the token from the silent hash and checks the set token
                    AuthenticationService.detectBearerToken(silentHash);
                    AuthenticationService.checkToken();
                },() => {

                    // If renewal failed, the store is cleared and the token is checked
                    AuthenticationService.clearStore();

                    // Sets the new state
                    AuthenticationService.state(AuthenticationState.RenewError);

                    // Checks the token in order to update all variables
                    AuthenticationService.checkToken();
                });
            }, Math.max(3000, TimeSpan.fromDateTime(bearerTokenExpiration.subtractMinutes(5), DateTime.now).totalMilliseconds));
        }

        // Gets the ID token
        var token = AuthenticationService.store.get<string>("AuthenticationService:IdToken");
        
        // Checks whether an ID token is provided
        if (!!token) {
            
            // Decodes the token
            var decodedToken = jwt_decode(token);

            // Creates the new user information
            var user = new User(decodedToken);

            // Updates the user information
            AuthenticationService.user(user);
        } else {

            // Sets the user information to null
            AuthenticationService.user(null);
        }
    }

    /**
     * Silently renews the token by using an iFrame.
     * @return {JQueryPromise<string>} Returns the silent hash from the identity server.
     */
    private static silentRenew(): JQueryPromise<string> {

        // Creates a deferred jQuery object
        var deferred = jquery.Deferred<string>();
        
        // Initializes the state, so that it can be used by the sign in URI
        StorageService.local.store<string>("AuthenticationService:State", AuthenticationService.generateGuid());   

        // Gets the state
        var state = StorageService.local.get<string>("AuthenticationService:State");

        // Creates the URL for the sign in
        var url = AuthenticationService.configuration.uri + AuthenticationService.configuration.signInPath + "?" +
            "client_id=" + encodeURIComponent(AuthenticationService.configuration.clientId) + "&" +
            "redirect_uri=" + encodeURIComponent(window.location.protocol + "//" + window.location.host + AuthenticationService.configuration.renewCallbackPath) + "&" +
            "response_type=" + encodeURIComponent(AuthenticationService.configuration.responseType) + "&" +
            "scope=" + encodeURIComponent(AuthenticationService.configuration.scopes.join(" ")) + "&" +
            "state=" + encodeURIComponent(!!state ? state : "") + "&" +
            "nonce=" + encodeURIComponent(AuthenticationService.generateGuid()) + "&" +
            "prompt=none";

        // Adds a new iFrame to the DOM
        var frame = window.document.createElement("iframe");
        frame.style.display = "none";
        frame.src = url;

        // Defines a cleanup function that removes the iFrame again
        var cleanup = () => {

            // Removes the event listener
            window.removeEventListener("message", message, false);

            // Safely clears the timeout
            if (handle) {
                window.clearTimeout(handle);
            }

            // Sets the handle to null
            handle = null;

            // Removes the iFrame
            window.document.body.removeChild(frame);
        };

        // Defines a cancel function that is called when the request timed out
        var cancel = (evt: any) => {

            // Performs the cleanup
            cleanup();

            // Rejects the promise
            deferred.reject();
        };

        // Defines a callback for the message from the iFrame
        var message = (evt: MessageEvent) => {

            // Checks whether the message came from the correct server and the correct frame
            if (handle && evt.origin === location.protocol + "//" + location.host && evt.source == frame.contentWindow) {

                // Performs the cleanup
                cleanup();

                // Resolves the promise
                deferred.resolve(evt.data);
            }
        };

        // Adds the iFrame to the DOM and starts the timeout countdown
        var handle: number|null = window.setTimeout(cancel, 10000);
        window.addEventListener("message", message, false);
        window.document.body.appendChild(frame);

        // Returns the deferred
        return deferred;
    }

    // #endregion

    // #region Public Static Properties

    /**
     * Gets a value that determines the state of the authentication.
     */
    public static get state(): KnockoutObservable<AuthenticationState> {
        return AuthenticationService._state;
    }

    /**
     * Gets some information about the current user. This value is null if no user is signed in.
     */
    public static get user(): KnockoutObservable<User|null> {
        return AuthenticationService._user;
    }
    
    // #endregion

    // #region Public Static Methods

    /**
     * Configures the authentication manager so that it can be used to detect bearer tokens and obtain refresh tokens.
     * @param {AuthenticationConfiguration} configuration The configuration that the authentication service should use.
     */
    public static use(configuration: AuthenticationConfiguration) {

        // Sets the configuration
        AuthenticationService.configuration = configuration;

        // Sets the store
        AuthenticationService.store = StorageService.get(configuration.storageKind);

        // Registers for changes of the state, so that the bearer token header in the default headers of the HTTP client can be updated
        AuthenticationService.state.subscribe(newValue => {
            if (!!AuthenticationService.store.get<string>("AuthenticationService:BearerToken")) {
                HttpClient.defaultHeaders["Authorization"] = "Bearer " + AuthenticationService.store.get<string>("AuthenticationService:BearerToken");
            } else {
                delete HttpClient.defaultHeaders["Authorization"];
            }
        });

        // Tries to detect an bearer token
        AuthenticationService.detectBearerToken();

        // Checks the token and sets all variables according to the state
        AuthenticationService.checkToken();
    }

    /**
     * Redirects the user to the URI where the sign in takes place.
     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced. 
     */
    public static signIn(redirectUri?: string) {

        // Initializes the state, so that it can be used by the sign in URI
        StorageService.local.store<string>("AuthenticationService:State", AuthenticationService.generateGuid());  

        // Gets the ID token
        var idToken = AuthenticationService.store.get<string>("AuthenticationService:IdToken"); 

        // Gets the state
        var state = StorageService.local.get<string>("AuthenticationService:State");

        // Gets the redirect URI
        var uri = redirectUri;
        if (!uri) {
            uri = window.location.protocol + "//" + window.location.host;
        }

        // Redirects the user to the sign in URI
        window.location.href = AuthenticationService.configuration.uri + AuthenticationService.configuration.signInPath + "?" +
            (!!idToken ? "id_token_hint=" + encodeURIComponent(idToken) + "&" : "") +
            "client_id=" + encodeURIComponent(AuthenticationService.configuration.clientId) + "&" +
            "redirect_uri=" + encodeURIComponent(uri) + "&" +
            "response_type=" + encodeURIComponent(AuthenticationService.configuration.responseType) + "&" +
            "scope=" + encodeURIComponent(AuthenticationService.configuration.scopes.join(" ")) + "&" +
            "state=" + encodeURIComponent(!!state ? state : "") + "&" +
            "nonce=" + encodeURIComponent(AuthenticationService.generateGuid());
    }

    /**
     * Redirects the user to the provided path of the identity service.
     * @param {string} path The path to which the user is redirected.
     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced. 
     */
    public static redirect(path: string, redirectUri?: string) {

        // Gets the redirect URI
        var uri = redirectUri;
        if (!uri) {
            uri = window.location.protocol + "//" + window.location.host;
        }

        // Redirects the user to the sign in URI
        window.location.href = AuthenticationService.configuration.uri + path + "?" +
        "client_id=" + encodeURIComponent(AuthenticationService.configuration.clientId) + "&" +
        "redirect_uri=" + encodeURIComponent(uri);
    }

    /**
     * Redirects the user to the local sign in.
     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced. 
     */
    public static signInLocal(redirectUri?: string) {
        AuthenticationService.signIn(redirectUri);
    } 

    /**
    * Redirects the user to the sign in of an external provider.
    * @param {string} provider The name of the provider. 
    * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced. 
    */
    public static signInExternal(provider: string, redirectUri?: string) {

        // Initializes the state, so that it can be used by the sign in URI
        StorageService.local.store<string>("AuthenticationService:State", AuthenticationService.generateGuid());  

        // Gets the ID token
        var idToken = AuthenticationService.store.get<string>("AuthenticationService:IdToken"); 

        // Gets the state
        var state = StorageService.local.get<string>("AuthenticationService:State");

        // Gets the redirect URI
        var uri = redirectUri;
        if (!uri) {
            uri = window.location.protocol + "//" + window.location.host;
        }

        // Redirects the user to the sign in URI
        window.location.href = AuthenticationService.configuration.uri + AuthenticationService.configuration.signInPath + "?" +
            (!!idToken ? "id_token_hint=" + encodeURIComponent(idToken) + "&" : "") +
            "client_id=" + encodeURIComponent(AuthenticationService.configuration.clientId) + "&" +
            "redirect_uri=" + encodeURIComponent(uri) + "&" +
            "response_type=" + encodeURIComponent(AuthenticationService.configuration.responseType) + "&" +
            "scope=" + encodeURIComponent(AuthenticationService.configuration.scopes.join(" ")) + "&" +
            "state=" + encodeURIComponent(!!state ? state : "") + "&" +
            "acr_values=" + encodeURIComponent("idp:" + provider) + "&" +
            "nonce=" + encodeURIComponent(AuthenticationService.generateGuid());
    }

    /**
     * Redirects the user to the URI where the sign out takes place.
     * @param {string} redirectUri If a redirect URI is provided, the default redirection (to the base URI) is replaced. 
     */
    public static signOut(redirectUri?: string) {

        // Removes the ID token
        var idToken = AuthenticationService.store.get<string>("AuthenticationService:IdToken");
        AuthenticationService.store.store<string>("AuthenticationService:IdToken", null);

        // Clears all values depending on the bearer token
        this.clearStore();

        // Gets the redirect URI
        var uri = redirectUri;
        if (!uri) {
            uri = window.location.protocol + "//" + window.location.host;
        }

        // Redirects the user to the sign out URI
        window.location.href = AuthenticationService.configuration.uri + AuthenticationService.configuration.signOutPath + "?" +
            (!!idToken ? "id_token_hint=" + encodeURIComponent(idToken) + "&" : "") +
            "post_logout_redirect_uri=" + encodeURIComponent(uri);
    }

    /**
     * Clears all information that has been stored by the authentication service.
     */
    public static clear() {

        // Removes the ID token
        AuthenticationService.store.store<string>("AuthenticationService:IdToken", null);

        // Clears all values depending on the bearer token
        this.clearStore();

        // Checks the token, so that the user information and the state is updated
        AuthenticationService.checkToken();
    }

    // #endregion
}

// Exports the module, so that it can be loaded by Require
export = AuthenticationService;