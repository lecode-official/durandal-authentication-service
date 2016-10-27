
///<amd-module name='Authentication/AuthenticationState'/>

/**
 * Represents the state of the authentication.
 */
enum AuthenticationState {

    /**
     * The user is not authenticated.
     */
    None,

    /**
     * The user is authenticated.
     */
    Authenticated,

    /**
     * An error occurred due to an invalid state or generic error (of the session).
     */
    Error,

    /**
     * An error occurred during the silent renew process.
     */
    RenewError
}

// Exports the module, so that it can be loaded by Require
export = AuthenticationState;