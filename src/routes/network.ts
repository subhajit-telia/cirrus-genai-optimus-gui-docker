class NetworkInfo {
    static readonly URL: string = process.env.REACT_APP_BACKEND_URL || '';
}

class AccessToken {
    static readonly "removed": string = process.env.REACT_APP_CLIENT_API_KEY || '';
}

class HTTPMethod {
    static readonly GET: string = "get";
    static readonly POST: string = "post";
    static readonly PUT: string = "put";
    static readonly PATCH: string = "patch";
    static readonly DELETE: string = "delete";

}

export {NetworkInfo, AccessToken, HTTPMethod};