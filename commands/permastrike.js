const common = require('../common.js');

module.exports = {
    name: 'permastrike',
    description: `function to log a strike for a user`,
    execute(message, args){
        common.strike(message, args, true);
    }
}