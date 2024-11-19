class HTTPMethod {
  static readonly GET: string = "get";
  static readonly POST: string = "post";
  static readonly PUT: string = "put";
  static readonly PATCH: string = "patch";
  static readonly DELETE: string = "delete";
}

class AccessToken {
  static readonly "removed": string = 'REMOVED';
}

class NetworkInfo {
  static readonly URL: string = import.meta.env.VITE_API_BASE_URL;
  static readonly ACCESSTOKEN: string = import.meta.env.REMOVED;
}

export { NetworkInfo, AccessToken, HTTPMethod };
