/**
 * 是否是开发调试环境
 * env = [dev\tst\pre\prod]
 */
const env = 'tst';

module.exports.env = env;
module.exports.isDevModel = env !== 'prod' ? true : false;
