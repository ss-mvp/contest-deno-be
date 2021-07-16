import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';
import { Clever } from '../../interfaces';

/**
 * A Clever SSO API Client for use with version 2.1 of their API. This client does not handle
 * features like rostering, but rather just the SSO flow for users who want to "Log In With Clever"
 * on your application.
 */
@Service()
export default class CleverClient {
  constructor({ apiVersion = 'v2.1', ...config }: Clever.client.IConfig) {
    const baseURL = `https://api.clever.com/${apiVersion}`;
    this.api = axios.create({
      baseURL,
    });
    this.basic =
      'Basic ' +
      Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(
        'base64'
      );
    this.redirectURI = config.redirectURI;
    this.buttonURI = `https://clever.com/oauth/authorize?redirect_uri=${encodeURI(
      config.redirectURI
    )}&response_type=code&client_id=${encodeURI(config.clientId)}`;
  }

  /** The Clever API */
  private api: AxiosInstance;
  /** The URI of your frontend Clever Redirect Page */
  private redirectURI: string;
  /** The basic auth that uses your client's config to get your user's token */
  private basic: string;
  /** This is the link that should open when a user clicks "Log in With Clever" */
  private buttonURI: string;

  /**
   * Returns the URL to redirect to when pressing "Log In With Clever" on your frontend client
   */
  public getLoginButtonURI() {
    return this.buttonURI;
  }

  /**
   * Uses the `code` query parameter passed when redirected to a Clever
   * redirect URI to get an access token for subsequent requests.
   *
   * @param code The `code` query param from a Clever redirect link
   * @returns the user's access token
   */
  public async getToken(code: string): Promise<{ access_token: string }> {
    try {
      const reqBody = {
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectURI,
      };
      const { data: response } = await axios.post(
        'https://clever.com/oauth/tokens',
        reqBody,
        {
          headers: {
            Authorization: this.basic,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log({ reqBody, response });
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * After using the redirect code to authenticate, pass the returned token into
   * this function to get information about the current authorized user, including
   * their type and unique Clever ID.
   *
   * @param token the token returned from `this.getToken()`
   * @returns information about the current authorized user
   */
  public async getUserInfo(token: string): Promise<Clever.api.IUserInfo> {
    try {
      const { data: response } = await this.api.get('/me', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * After getting the user's information with their authorization token,
   * we can get information about their profile from this function, including
   * their name and email address
   *
   * @param user the user from `this.getUserInfo()`
   * @param token the token returned from `this.getToken()`
   * @returns the user's profile including name and email address
   */
  public async getUserProfile(
    user: Clever.api.IUserInfo,
    token: string
  ): Promise<Clever.api.IProfile> {
    try {
      const { data: response } = await this.api.get(
        `/${user.type}s/${user.data.id}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
