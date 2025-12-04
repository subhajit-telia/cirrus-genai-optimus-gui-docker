class HTTPMethod {
  static readonly GET: string = "get";
  static readonly POST: string = "post";
  static readonly PUT: string = "put";
  static readonly PATCH: string = "PATCH";
  static readonly DELETE: string = "delete";
}

class NetworkInfo {
  // static readonly URL: string = import.meta.env.VITE_API_BASE_URL;
  // static readonly ACCESSTOKEN: string = import.meta.env.REMOVED;
  // static readonly AZURE_CLIENT_ID: string = import.meta.env.AZURE_AD_CLIENT_ID;
  // static readonly AZURE_TENANT_ID: string = import.meta.env.AZURE_AD_TENANT_ID;
  // static readonly AZURE_SECRET_ID: string = import.meta.env.AZURE_AD_CLIENT_SECRET;
  // static readonly REACT_APP_URL: string = import.meta.env.REACT_APP_URL;



  private static runtimeEnv(): any {
    return (typeof window !== "undefined" && (window as any).RUNTIME_ENV) || {};
  }

  static readonly URL: string =
    NetworkInfo.runtimeEnv().API_ENDPOINT || import.meta.env.VITE_API_BASE_URL;

  static readonly ACCESSTOKEN: string =
    NetworkInfo.runtimeEnv().API_KEY || import.meta.env.REMOVED;

  static readonly AZURE_CLIENT_ID: string =
    NetworkInfo.runtimeEnv().AZURE_AD_CLIENT_ID || import.meta.env.AZURE_AD_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID;

  static readonly AZURE_TENANT_ID: string =
    NetworkInfo.runtimeEnv().AZURE_AD_TENANT_ID || import.meta.env.AZURE_AD_TENANT_ID || process.env.AZURE_AD_TENANT_ID;

  static readonly AZURE_SECRET_ID: string =
    NetworkInfo.runtimeEnv().AZURE_AD_CLIENT_SECRET || import.meta.env.AZURE_AD_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET;

  // Mantengo per compatibilità, se serve
  static readonly REACT_APP_URL: string =
    NetworkInfo.runtimeEnv().REACT_APP_URL || import.meta.env.REACT_APP_URL;
}

export { NetworkInfo, HTTPMethod };