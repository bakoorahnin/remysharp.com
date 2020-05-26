const slugify = require('slugify');
const fs = require('fs-extra');
const { parse } = require('path');
const through = (_) => _.inputPath;
const { glob, globFor } = require('./glob');
const { output } = require('./globals.js');
const permalink = require('./permalink');

module.exports = {
  loadFromGlob,
  loadContent,
};

async function loadFromGlob(pattern, transform, permalink) {
  return loadContent(await glob(globFor(pattern)), transform, permalink);
}

async function loadContent(files, transform = through, processPermalink) {
  const contents = await Promise.all(
    files.map((filename) => fs.readFile(filename, 'utf8'))
  );

  return Promise.all(
    files.map(async (inputPath, i) => {
      const input = contents[i];
      const res = {
        inputPath,
        slug: slugify(parse(inputPath).name),
        dirname: inputPath.split('/').slice(-2).shift(),
        input,
      };

      // adds .output and .data
      await transform(res);

      res.outputPath = permalink(res, processPermalink);

      res.url = res.outputPath
        .replace(output, '')
        .replace(/(\/index)?\.html$/, '');
      // console.log(output, res.url, res.outputPath);

      return res;
    })
  );
}
