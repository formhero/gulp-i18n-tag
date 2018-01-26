/* eslint-disable import/no-extraneous-dependencies */
const through = require('through2');
const { parse } = require('babylon');
/* eslint-enable */
const File = require('vinyl');

/**
 * Build ordered tokens from a template literal string.
 * e.g. t`Hello, ${firstName} ${lastName}!` becomes "Hello, ${0} ${1}!",
 * so your translations could swap the order -- "${1}, ${0}. Hallo!"
 */
const insertTokens = ({ quasi: { quasis } }) => quasis
  .map(({ value: { cooked } }) => cooked)
  .reduce((a, e, i, { length }) => {
    if (i === length - 1) return a + e;
    return `${a + e}\${${i}}`;
  }, '');

// AST tree traversal to build a flat array of tagged templates
const findTags = ob => Object.values(ob).reduce((a, e) => {
  if (e && typeof e === 'object') {
    if (Array.isArray(e)) {
      return a.concat(
        ...e.filter(v => v && v.type === 'TaggedTemplateExpression'),
        ...e.map(v => v && findTags(v)),
      );
    }
    if (e.type === 'TaggedTemplateExpression') return a.concat(e);
    return a.concat(findTags(e)).filter(v => v);
  }
  return a;
}, []);

export default function parseAst({ fileName = 'translations.json', tagNames = ['t'] } = {}) {
  let tags = [];

  return through.obj((file, encoding, cb) => {
    const src = file.contents.toString(encoding);

    const ast = parse(src, {
      sourceType: 'module',
      plugins: [
        'classProperties',
        'objectRestSpread',
      ],
    });

    tags = tags.concat(findTags(ast)
      .filter(({ tag: { name } }) => tagNames.includes(name))
      .map(insertTokens));

    cb();
  }, function doneTranslating(cb) {
    /* eslint-disable */
    // Hashmap of all the unique translations
    const tagHash = tags.reduce((a, e) => (a[e] = e, a), {});
    /* eslint-enable */

    const outFile = new File({
      cwd: '/',
      base: '/i18n/',
      path: `/i18n/${fileName}`,
      // We'll be nice and pretty-print this JSON. Humans will read this, and the app should
      // never need the default translations
      contents: Buffer.from(JSON.stringify(tagHash, undefined, '  ')),
    });

    // Send back this newly built translations json to the pipe.
    this.push(outFile);
    cb(null, outFile);
  });
}
