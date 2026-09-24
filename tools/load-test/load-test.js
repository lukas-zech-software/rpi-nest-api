const autocannon = require('autocannon')
const { oas2har } = require('@har-sdk/oas');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path')
// TODO: Refactor to system tests

const piTarget = process.argv[2]

if (!piTarget) {
  console.error("No target host provided")
  process.exit(1)
  return
}

(async () => {
  const specFile = join(__dirname, '../../spec/rpi-nest-api.spec.json');
  let specFileContent = await readFile(specFile, 'utf-8');
  const parsedSpec = JSON.parse(specFileContent);
  // TODO: Replace target url and port in spec file on generate?
  parsedSpec.servers = [{ url: piTarget }]
  const harRequests = await oas2har(parsedSpec);
  const harObject = {
    log: {
      entries: harRequests.map(request => {
        return { request }
      })
    }
  }

  const result = await autocannon({
    url: parsedSpec.servers[0].url,
    // amount: 1000,
    connections: 5,
    duration: 10,
    har: harObject
  })

  return result

})().then((testResults) => {
  if (process.argv.includes('--verbose') === false) {
    testResults.latencyAverage = testResults.latency.average
    testResults.throughputAverage = testResults.throughput.average
    testResults.requestsTotal = testResults.requests.total

    delete testResults.latency
    delete testResults.throughput
    delete testResults.requests
  }
  console.log(JSON.stringify(testResults,null,2));
}).catch((e) => console.log('error', e))
