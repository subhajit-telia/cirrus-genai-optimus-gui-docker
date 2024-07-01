class NetworkInfo {
    static readonly URL: string =
        import.meta.env.VITE_ENV === "DEV"
            ?  import.meta.env.VITE_API_URL
            : import.meta.env.VITE_API_URL;
}

class HTTPMethod {
    static readonly GET: string = "get";
    static readonly POST: string = "post";
    static readonly PUT: string = "put";
    static readonly PATCH: string = "patch";
    static readonly DELETE: string = "delete";

}

export {NetworkInfo, HTTPMethod};