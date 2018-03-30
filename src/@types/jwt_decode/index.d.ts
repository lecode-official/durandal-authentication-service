
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