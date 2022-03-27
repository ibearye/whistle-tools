#! /usr/local/bin/node

const utils = require('./utils');
const { program } = require('commander');

program.version('0.1.0');

program.command('start').action(() => {
  if (!utils.isW2Running()) {
    utils.startW2();
  }
  utils.proxy();
});

program.command('stop').action(() => {
  if (utils.isW2Running()) {
    utils.stopW2();
  }

  utils.unproxy();
});

program.command('proxy').action(() => {
  if (!utils.isW2Running()) {
    return console.log('whistle is not running, please start it first!');
  }

  utils.proxy();
});

program.command('unproxy').action(() => {
  utils.unproxy();
});

program.command('status').action(() => {
  const { http, https, socks } = utils.isProxying();
  console.log('WHISTLE:', utils.isW2Running() ? 'Yes' : 'No');
  console.log('HTTP PROXY:', http ? 'Yes' : 'No');
  console.log('HTTPS PROXY:', https ? 'Yes' : 'No');
  console.log('SOCKS PROXY:', socks ? 'Yes' : 'No');
});

program.parse(process.argv);
