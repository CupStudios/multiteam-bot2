// NOTE: compatibility alias; previous command source exported `verficha` while the file/help text used `verbio`.
const verbio = require('./verbio');

module.exports = {
  ...verbio,
  name: 'verficha'
};
