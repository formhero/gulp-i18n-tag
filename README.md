# gulp-i18n-tag
Gulp plugin to extract tagged template literals, for i18n and l10n. Build a translations.json!

## Example Usage
The plugin handles the bundling, since most often you'll have several repetitions of the same string
in different files. i18nTag bundles up all the source files in your pipe, and puts every tagged template
literal with `t` in it into the pipe.

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

### Optional Parms:
* fileName <string> Newly built file object's name. default: translations.json
* tagNames <Array> The tag names to parse out from your code. default: ['t']

example:
```javascript
i18nTag({ fileName: 'locales_en.json', tagNames: ['__', 'i18n'] })
```
This will find all template literals tagged `__` or `i18n`, and put their strings in a file `locales_en.json`.
