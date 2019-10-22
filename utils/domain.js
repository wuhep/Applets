var environment = require('./env').isDevModel;
var domains = {
  api: 'https://apigw-tst.changingedu.com',
  log: 'https://log-tst.changingedu.com',
  mobile: 'https://m-tst.changingedu.com',
  front: 'https://huodong-tst.changingedu.com'
};

for (var k in domains) {
  if (!environment) {
    domains[k] = domains[k].replace(/[.-]tst.changingedu/gi, '.changingedu');
  }
}

module.exports.domains = domains;
module.exports.isTest = environment;