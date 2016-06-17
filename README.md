# Etherpad lite OAuth2 authentication

## Install

In your etherpad-lite dir:

```bash
npm install ep_oauth2
```

Add to settings.json

```json
"users": {
  "oauth2": {
    "authorizeUrl": "https://services.humanbrainproject.eu/oidc/authorize",
    "tokenURL": "https://services.humanbrainproject.eu/oidc/token",
    "clientID": "YOUR-OIDC-CLIENT-ID",
    "clientSecret": "YOUR-OIDC-CLIENT-SECRET",
    "publicURL": "http://localhost:9001",
    "userinfoURL": "https://services.humanbrainproject.eu/oidc/userinfo",
    "usernameKey": "name"
  }
}
```

Use [http://passportjs.org/](passport) and [https://github.com/jaredhanson/passport-oauth](passport-oauth)
to provide OAuth2 based authentication.

## Inspirations

- [https://github.com/tykeal/ep_ldapauth](ep_ldapauth) plugin

## License

MIT
