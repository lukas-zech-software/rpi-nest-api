const hooks = require('hooks');

const testUserCredentials = {
  username: 'admin',
  password: 'test-default-password',
};

const store = {};

async function getToken() {
  try {
    const response = await fetch('http://localhost:3000/authentication/login', {
      method: 'POST',
      body: JSON.stringify(testUserCredentials),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();
    store.token = json.token;

    hooks.log(`Retrieved login token`);
  } catch (e) {
    hooks.log(`Error while fetching login token ${e}`);
  }
}

hooks.beforeAll(function (transactions, cb) {
  getToken().then(cb);
});

hooks.beforeEach(function (transaction) {
  // always add default charset to expected content-type to avoid adding it on every response in the api spec
  if (transaction.expected.headers['Content-Type']?.includes('charset') === false) {
    transaction.expected.headers['Content-Type'] += '; charset=utf-8';
  }

  // mess with the request parameters to provoke a 400 InvalidRequest
  if (transaction.expected.statusCode === '400') {
    // if the request does not send a body, it cannot be invalid
    if (!transaction.request.body) {
      transaction.skip = true;
    }

    transaction.request.body = JSON.stringify({
      corruptedData: 'data intentionally corrupted by dredd hooks for testing',
    });
  }

  // ignore /authorization-test routes
  if (transaction.fullPath.includes('/authorization-test')) {
      transaction.skip = true;
  }

  // mess with the parameter at the end of the url to provoke a 404 NotFound
  if (transaction.expected.statusCode === '404') {
    // append some string to make id parameter invalid
    transaction.fullPath += '-invalid-id';
  }

  // add api key to all requests, except when we want to test a 401 NotAuthorized request
  if (transaction.expected.statusCode !== '401') {
    transaction.request.headers['Authorization'] = `Bearer ${store.token}`;
  }

  // we can't test unexpected server errors because our software is foolproof and incapable of error
  if (transaction.expected.statusCode === '500') {
    transaction.skip = true;
  }
});

hooks.before('/authentication/login > POST > 200 > application/json', (transaction) => {
  // use the test credentials to test successful login
  // stringify the new body to request
  transaction.request.body = JSON.stringify(testUserCredentials);
});

hooks.before('/authentication/update-password > POST > 200', (transaction) => {
  const requestBody = JSON.parse(transaction.request.body);

  // use the test credentials to test successful password update
  // stringify the new body to request
  transaction.request.body = JSON.stringify(Object.assign(requestBody, testUserCredentials));
});
