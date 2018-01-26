# gulp-i18n-tag
Gulp plugin to extract tagged template literals, for i18n and l10n. Build a translations.json!

## Description
Tagged template literals are a great solution for bringing i18n to your project, by making all your strings
translateable. Rather than dealing with some clunky, custom translations file, or creating a huge amount
of vendor reliance with a custom lib, you can simply tag everything you want translated.

So this:
```javascript
React.createElement('h1', { className: 'hello' }, `Hello, ${name}!`);
```
is as easy to translate as sticking the tag function in front:
```javascript
React.createElement('h1', { className: 'hello' }, t`Hello, ${name}!`);
```

For C, Java, PHP, etc., you could use gettext to find your strings. This is a pretty old solution, but
made it easy to read through all your code and extract what should be translated. JS tagged templates
are new, so we need a solution that both works with them, and modern build scripts like gulp.

This gulp plugin will look at your pipe, parse out all the template literals with a matching tag
name, and build a new JSON file. Running against the above will give you a translations.json:
```json
{
  "Hello, ${0}!": "Hello, ${0}!"
}
```
Which could be loaded directly into a tagging lib like es2015-i18n-tag. This translations.json can
be can used directly, or loaded as the default language to a service like transifex or onesky to
find other people to help translate.

Originally built as part of the FormHero form authoring platform, we've extracted it into its
own module so the public can use it too.

## Usage

Install via npm:
```sh
npm i -D gulp-i18n-tag
```

Configure your gulp tasks:

```javascript
module.exports = function scriptsTasks(gulp, plugins) {
  gulp.task('translate', () => gulp
    .src('app/**/*.js')
    .pipe(i18nTag())
    .pipe(gulp.dest('./i18n'))
    .pipe(through.obj((file, encoding, cb) => {
      cb(null, file);
    }))
    .on('error', console.error));
};
```

### Optional Params:
* fileName <string> Newly built file object's name. default: translations.json
* tagNames <Array> The tag names to parse out from your code. default: ['t']

example:
```javascript
i18nTag({ fileName: 'locales_en.json', tagNames: ['__', 'i18n'] })
```
This will find all template literals tagged `__` or `i18n`, and put their strings in a file `locales_en.json`.
