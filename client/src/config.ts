// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'tqfsm107kd'
const region = 'ap-southeast-2'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-o6dlizfb.au.auth0.com', // Auth0 domain
  clientId: 'nGdcelHUjlTmqYY2iPfPpZCMXwc4Dhhw', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
