import { QueryClient } from "@tanstack/react-query";
import { baseUrl } from "./http-utils";
import AsyncStorage  from '@react-native-async-storage/async-storage';
import { devLog, ensureString, fetchSecrets, fetchSecretsByVerify } from "../common/utils";

class AppContext {
  private queryClient: QueryClient;
  private hotStringCache = new Map<string, string>();
  private _session: any;
  private testing: boolean = true;

  constructor(queryClient: QueryClient, session: any) {
    this.queryClient = queryClient;
    this._session = session;
    this.ensureUpToDate();
  };

  public signIn(jwtToken: any, username: string) {
    this._session.signIn(jwtToken, username);
  }

  public getSession(): any {
    return this._session;
  }

  public setSession(session: any) {
    this._session = session;
  }

  public ensureUpToDate() {
    if (this._session == null || this.testing) {
      return;
    }
    try {
      // this.syncEmail();
      // this.syncJwtToken();
      this.syncCache();
    } catch (error) {
      console.error(error);
    }
  }

  public put(key: string, value: string) {
    if (value == null) {
      this.hotStringCache.delete(key);
      return;
    }
    this.hotStringCache.set(key, value);
    AsyncStorage.setItem(key,value);
  }

  public get(key: string) {
    this.syncCache();
    return this.hotStringCache.get(key);
  }

  public remove(key: string) {
    this.hotStringCache.delete(key);
    AsyncStorage.removeItem(key);
  }

// TODO: Should move this to use similar logic to ctx.tsx
  private syncCache() {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        keys.forEach((key) => {
          AsyncStorage.getItem(key)
            .then((value) => {
               if (value!= null) {
                 this.hotStringCache.set(key, value);
               }
             })
            .catch((error) => {
               console.log(error);
             });
          })
        for (let key of this.hotStringCache.keys()) {
          if (!keys.includes(key)) {
            this.hotStringCache.delete(key);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  public setQueryClient(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  public getQueryClient(): QueryClient {
    return this.queryClient;
  }

  public invalidateUser(session: any) {
    devLog('context invalidating user ' + session.username);
    this.queryClient.removeQueries({queryKey: ['user', ensureString(session.username)]});
  }

  public async getSecrets(session: any): Promise<any> {
    this.setSession(session);
    if (!session.jwt_token) { return; }
    const username = session.username;
    devLog('context updating secrets: ' + username);
    return this.getQueryClient().fetchQuery({
      queryKey: ['secrets'],
      queryFn: () => fetchSecrets(session)
    });
  }

  public async getSecret(session: any, verifyCode: string, secretKey: string, target: string): Promise<string> {
    if (session.jwt_token != null) {
      this.setSession(session);
      const secrets = await this.getSecrets(session);
      devLog('getSecret secrets: ' + secrets);
      return secrets[secretKey];
    }
    const secrets = await fetchSecretsByVerify(verifyCode, target);
    devLog('getSecret secrets: ' + secrets);
    return secrets[secretKey];
  }

  public async getGoogleMapsAPIKey(session: any, verifyCode: string): Promise<string> {
    return this.getSecret(session, verifyCode, 'googleMapsAPIKey', 'googlemaps');
  }

  public getEmail(): string | null {
    if (this._session == null) {
      return null;
    }
    return this._session.username;
  }

  public getJwtToken() {
    devLog('getJwtToken: ' + JSON.stringify(this._session));
    return this._session.jwt_token
  }

  public async getJwtTokenPromise(): Promise<any> {
    const result = await AsyncStorage.getItem('jwtToken');
    if (result!= null) {
      return JSON.parse(result);
    }
    return null;
  }

  public clearJwtToken() {
    this._session.signOut();
  }

  private async getFromStorage(key: string) {
    return await AsyncStorage.getItem(key)
  }

  baseUrl() {
    return baseUrl();
  }

  async waitIsLoggedIn(): Promise<boolean> {
    const username = await this.getFromStorage('username');
    const jwtToken = await this.getFromStorage('jwtToken');
    devLog('checking is logged in username: ' + username + 'jwtToken: ' + jwtToken);
    return username != null && username.length > 0 && jwtToken != null;
  }

  isLoggedIn() {
    const username = this.getEmail();
    const token = this.getJwtToken();
    devLog('checking is logged username: ' + username);
    devLog('checking is logged setting: ' + token);
    const result = username != null && username.length > 0
      && token != null && token.length > 0;
    devLog('checking is logged in: ' + result);
    return result;
  }
};

export default AppContext;