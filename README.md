# itinerator

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
serve -s dist
```

### Deploy

```
npm run build
serve -s dist
```

### github

```
# Create build then enter dist and simply add commit and push -f, add CNAME journeydoc.com
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Deploy Heroku

#### static.json

```
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

#### CLI

```
heroku login
heroku create
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
git push heroku main
```
