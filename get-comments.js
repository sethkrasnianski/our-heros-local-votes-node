const fs = require('fs');
const request = require('request-promise');

const TOKEN = process.env.TOKEN;
const PAGE_NAME = process.env.PAGE_NAME;
const VERBOSE = Boolean(process.env.VERBOSE) === true;
const POST_ID = process.env.POST_ID;
const API_URL = 'https://graph.facebook.com/v2.6';
const PATH = `comments?access_token=${TOKEN}`;
const OUTPUT_FILE = './pages.json';

let PAGE_ID = null;

function get(uri) {
  const options = {
    method: 'GET',
    json: true,
    uri
  };

  return request(options);
}

function writeFile(name, data) {
  if (VERBOSE) {
    console.log(`Attempting to write ${name}...`);
  }

  return new Promise((resolve, reject) => {
    fs.unlink(name, (linkErr) => {
      if (linkErr) {
        reject(linkErr);
      } else {
        fs.writeFile(name, JSON.stringify(data), (writeErr) => {
          if (writeErr) {
            reject(writeErr);
          } else {
            if (VERBOSE) {
              console.log(`${name} written...`);
            }
            resolve(data);
          }
        });
      }
    });
  });
}

function getPageId() {
  if (VERBOSE) {
    console.log('Getting page ID...');
  }

  return get(`${API_URL}/${PAGE_NAME}?access_token=${TOKEN}`)
    .then((res) => {
      if (VERBOSE) {
        console.log(`Page ID is ${res.id}...`);
      }
      PAGE_ID = res.id;
      return;
    });
}

function getAllComments() {
  const url = `${API_URL}/${PAGE_ID}_${POST_ID}/${PATH}`;

  if (VERBOSE) {
    console.log('Getting comment count...');
  }

  return get(`${url}&summary=true`)
    .then((res) => {
      const TOTAL_COUNT = res.summary.total_count;
      if (VERBOSE) {
        console.log('Total comments:', TOTAL_COUNT);
        console.log('Getting all comments...');
      }
      return get(`${url}&limit=${TOTAL_COUNT}`);
    });
}

module.exports = function() {
  return getPageId()
    .then(getAllComments)
    .then((res) => {
      console.log('Retrieved all comments...');
      return writeFile(OUTPUT_FILE, res.data);
    })
    .catch((error) => {
      console.error('Error with aggregation:');
      console.error(error);
    });
};
