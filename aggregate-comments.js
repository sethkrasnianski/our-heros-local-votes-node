const fs = require('fs');
const pad = require('pad');
const chalk = require('chalk');
const calc = require('./calculate-votes');
const getComments = require('./get-comments');

function readPDSFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('./police-departments.json', (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(JSON.parse(data));
    });
  });
}

console.log('Starting...');
getComments().then((comments) => {
  return readPDSFile()
    .then((pds) => {
      const calculations = calc(pds, comments);
      console.log('\n');
      console.log(chalk.green('Vote Report:'));
      calculations
        .sort((a, b) => {
          return a.votes - b.votes;
        })
        .reverse()
        .forEach((calculation) => {
          console.log(pad(calculation.name, 15), calculation.votes);
        });
      console.log('\n');
    });
});
