class HTTPMethod {
  static readonly GET: string = "get";
  static readonly POST: string = "post";
  static readonly PUT: string = "put";
  static readonly PATCH: string = "PATCH";
  static readonly DELETE: string = "delete";
}

class AccessToken {
  static readonly "removed": string = 'REMOVED';
}

class NetworkInfo {
  static readonly URL: string = import.meta.env.VITE_API_BASE_URL;
  static readonly ACCESSTOKEN: string = import.meta.env.REMOVED;
  static readonly AZURE_CLIENT_ID: string = import.meta.env.REMOVED;
  static readonly AZURE_TENANT_ID: string = import.meta.env.REMOVED;
  static readonly AZURE_SECRET_ID: string = import.meta.env.REMOVED;
  static readonly REACT_APP_URL: string = import.meta.env.REACT_APP_URL;
}

export { NetworkInfo, AccessToken, HTTPMethod };
