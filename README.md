# Etherpad lite OAuth2 authentication

Use [http://passportjs.org/](passport) and [https://github.com/jaredhanson/passport-oauth](passport-oauth)
to provide OAuth2 based authentication to Etherpad lite.

## Install

In your etherpad-lite dir:

```bash
npm install ep_oauth2
```

Configure your backend using `settings.json` or environement variables.

Either add to `settings.json`:

```json
"users": {
  "oauth2": {
    "authorizationURL": "https://services.humanbrainproject.eu/oidc/authorize",
    "tokenURL": "https://services.humanbrainproject.eu/oidc/token",
    "clientID": "YOUR-OIDC-CLIENT-ID",
    "clientSecret": "YOUR-OIDC-CLIENT-SECRET",
    "publicURL": "http://localhost:9001",
    "userinfoURL": "https://services.humanbrainproject.eu/oidc/userinfo",
    "usernameKey": "name",
    "useridKey": "preferred_username"
  }
}
```

or define the following environment variables:

```bash
EP_OAUTH2_AUTHORIZATION_URL=https://services.humanbrainproject.eu/oidc/authorize
EP_OAUTH2_TOKEN_URL=https://services.humanbrainproject.eu/oidc/token
EP_OAUTH2_USERINFO_URL=https://services.humanbrainproject.eu/oidc/userinfo
EP_OAUTH2_USERNAME_KEY=name
EP_OAUTH2_USERID_KEY=preferred_username
EP_OAUTH2_CLIENT_ID=YOUR-OIDC-CLIENT-ID
EP_OAUTH2_CLIENT_SECRET=YOUR-OIDC-CLIENT-SECRET
EP_OAUTH2_PUBLIC_URL=http://localhost:9001
```

Even if you define all the variables through the environment, you must activate
the plugin by adding a minimal entry in settings.json

```json
"users": {
  "oauth2": {}
}
```

## Inspirations

- [https://github.com/tykeal/ep_ldapauth](ep_ldapauth) plugin

## License

MIT
