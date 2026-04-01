class HTTPMethod {
  static readonly GET: string = "get";
  static readonly POST: string = "post";
  static readonly PUT: string = "put";
  static readonly PATCH: string = "PATCH";
  static readonly DELETE: string = "delete";
}

class NetworkInfo {

  private static runtimeEnv(): any {
    return (typeof window !== "undefined" && (window as any).RUNTIME_ENV) || {};
  }

  static readonly SANITIZE_URL: string =
    (NetworkInfo.runtimeEnv().API_ENDPOINT || import.meta.env.VITE_API_BASE_URL) + "/api";

  static readonly URL: string = NetworkInfo.SANITIZE_URL.replace("undefined/", "");

  static readonly VITE_API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL;

  static readonly REACT_APP_API_URL: string =
    NetworkInfo.runtimeEnv().API_ENDPOINT || "";

  static readonly ACCESSTOKEN: string =
    NetworkInfo.runtimeEnv().API_KEY || "";

  static readonly AZURE_CLIENT_ID: string =
    NetworkInfo.runtimeEnv().AZURE_AD_CLIENT_ID || "";

  static readonly AZURE_TENANT_ID: string =
    NetworkInfo.runtimeEnv().AZURE_AD_TENANT_ID || "";

  // Mantengo per compatibilità, se serve
  static readonly REACT_APP_URL: string =
    NetworkInfo.runtimeEnv().REACT_APP_URL || "";
}

export { NetworkInfo, HTTPMethod };