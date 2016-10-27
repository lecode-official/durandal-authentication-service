///<amd-module name='Authentication/User'/>
define("Authentication/User", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Represents an object that contains information about the user gained from the ID token.
     */
    var User = (function () {
        // #region Constructors
        /**
         * Initializes a new User instance.
         * @param {{ [key: string]: any; }} jwtToken The decoded token.
         */
        function User(jwtToken) {
            this._subject = jwtToken["sub"];
            this._amr = jwtToken["amr"];
            this._name = jwtToken["name"];
            this._emailAddress = jwtToken["email_address"];
        }
        Object.defineProperty(User.prototype, "subject", {
            // #endregion
            // #region Public Properties
            /**
             * Gets the subject of the user.
             */
            get: function () {
                return this._subject;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User.prototype, "amr", {
            /**
             * Gets the AMR value (indicator for external sign in).
             */
            get: function () {
                return this._amr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User.prototype, "name", {
            /**
             * Gets the name of the user.
             */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User.prototype, "emailAddress", {
            /**
             * Gets the email address of the user.
             */
            get: function () {
                return this._emailAddress;
            },
            enumerable: true,
            configurable: true
        });
        return User;
    }());
    return User;
});
