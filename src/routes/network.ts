class NetworkInfo {
    static readonly URL: string =
        import.meta.env.VITE_ENV === "DEV"
            ?  import.meta.env.VITE_API_URL
            : import.meta.env.VITE_API_URL;
}

class AccessToken {
    static readonly "removed": string = 'IgGuQSjs60HH0R6MTs6c9WiAZupfFYWc';
}

class HTTPMethod {
    static readonly GET: string = "get";
    static readonly POST: string = "post";
    static readonly PUT: string = "put";
    static readonly PATCH: string = "patch";
    static readonly DELETE: string = "delete";

}

export {NetworkInfo, AccessToken, HTTPMethod};