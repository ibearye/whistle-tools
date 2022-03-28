#! /usr/local/bin/node

const utils = require('./utils');
const { program } = require('commander');
const path = require('path');

program.version('0.1.0');

program
  .command('start')
  .option('--no-auto-proxy', 'auto proxy after starting', true)
  .action(({ autoProxy }) => {
    if (!utils.isW2Running()) {
      utils.startW2();
    }

    if (autoProxy) {
      utils.proxy();
    }
  });

program.command('stop').action(() => {
  if (utils.isW2Running()) {
    utils.stopW2();
  }

  utils.unproxy();
});

program
  .command('proxy')
  .option('-s --socks', 'proxy socks protocal', false)
  .option('-h --http', 'proxy http protocal', false)
  .option('-H --https', 'proxy https protocol', false)
  .action(({ socks, http, https }) => {
    if (!utils.isW2Running()) {
      return console.log('whistle is not running, please start it first!');
    }

    if (socks || http || https) {
      utils.proxy({ socks, http, https });
    } else {
      utils.proxy();
    }
  });

program
  .command('unproxy')
  .option('-s --socks', 'proxy socks protocal', false)
  .option('-h --http', 'proxy http protocal', false)
  .option('-H --https', 'proxy https protocol', false)
  .action(({ socks, http, https }) => {
    if (socks || http || https) {
      utils.unproxy({ socks, http, https });
    } else {
      utils.unproxy();
    }
  });

program.command('status').action(() => {
  const { http, https, socks } = utils.isProxying();
  console.log('WHISTLE:', utils.isW2Running() ? 'Yes' : 'No');
  console.log('HTTP PROXY:', http ? 'Yes' : 'No');
  console.log('HTTPS PROXY:', https ? 'Yes' : 'No');
  console.log('SOCKS PROXY:', socks ? 'Yes' : 'No');
});

program.command('utils-path').action(() => {
  console.log(path.resolve(__dirname, 'whistle.script_utils'));
});

program.parse(process.argv);
