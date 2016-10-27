
///<amd-module name='Authentication/User'/>

/**
 * Represents an object that contains information about the user gained from the ID token.
 */
class User {

    // #region Constructors

    /**
     * Initializes a new User instance.
     * @param {{ [key: string]: any; }} jwtToken The decoded token.
     */
    constructor(jwtToken: { [key: string]: any; }) {
        this._subject = jwtToken["sub"];
        this._amr = jwtToken["amr"];
        this._name = jwtToken["name"];
        this._emailAddress = jwtToken["email_address"];
    }

    // #endregion

    // #region Private Fields

    /**
     * Contains the subject of the user.
     */
    private _subject: string;

    /**
     * Contains the name of the user.
     */
    private _name: string;

    /**
     * Contains the email address of the user.
     */
    private _emailAddress: string;

    /**
     * Contains the AMR value (indicator for external sign in).
     */
    private _amr: string;
    
    // #endregion

    // #region Public Properties

    /**
     * Gets the subject of the user.
     */
    public get subject(): string {
        return this._subject;
    }

    /**
     * Gets the AMR value (indicator for external sign in).
     */
    public get amr(): string {
        return this._amr;
    }

    /**
     * Gets the name of the user.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the email address of the user.
     */
    public get emailAddress(): string {
        return this._emailAddress;
    }
    
    // #endregion

}

// Exports the module, so that it can be loaded by Require
export = User;