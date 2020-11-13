const common = require('../common.js');

module.exports = {
    name: 'strike',
    description: `function to log a strike for a user`,
    execute(message, args){
        common.strike(message, args, false);
    }
}