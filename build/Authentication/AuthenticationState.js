///<amd-module name='Authentication/AuthenticationState'/>
define("Authentication/AuthenticationState", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Represents the state of the authentication.
     */
    var AuthenticationState;
    (function (AuthenticationState) {
        /**
         * The user is not authenticated.
         */
        AuthenticationState[AuthenticationState["None"] = 0] = "None";
        /**
         * The user is authenticated.
         */
        AuthenticationState[AuthenticationState["Authenticated"] = 1] = "Authenticated";
        /**
         * An error occurred due to an invalid state or generic error (of the session).
         */
        AuthenticationState[AuthenticationState["Error"] = 2] = "Error";
        /**
         * An error occurred during the silent renew process.
         */
        AuthenticationState[AuthenticationState["RenewError"] = 3] = "RenewError";
    })(AuthenticationState || (AuthenticationState = {}));
    return AuthenticationState;
});
