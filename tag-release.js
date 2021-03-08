const { argv } = process;
const { execSync } = require('child_process');
const Changelog = require('generate-changelog');
const fs = require('fs');

if (argv.length <= 2) {
  console.log('Missing version tag name');
  return;
}

const lastTag =
  argv.length >= 4
    ? argv[3]
    : execSync('git describe --tags --abbrev=0').toString().replace('\n', '');
const newTag = argv[2];
const versionRegex = /^v(\d+\.)?(\d+\.)?(\d+)$/g;

if (!lastTag.match(versionRegex) || !newTag.match(versionRegex)) {
  console.log(`Invalid version tag names: ${lastTag} - ${newTag}`);
  return;
}

console.log(`Old tag: ${lastTag}, New tag: ${newTag}`);

execSync(`git tag ${newTag}`);

// TODO: add version tag to CHANGELOG
// eslint-disable-next-line consistent-return
return Changelog.generate({
  repoUrl: 'https://github.com/myin142/youtube-player',
  tag: `${lastTag}...${newTag}`,
}).then((changelog) => {
  return fs.writeFileSync('./CHANGELOG.md', changelog);
});
