const childProcess = require('child_process');

const startW2 = () => childProcess.execSync('w2 start');

const stopW2 = () => childProcess.execSync('w2 stop');

const getW2Config = () => {
  const [ip, port] = childProcess
    .execSync('w2 status')
    .toString()
    .match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/)[0]
    .split(':');
  return { ip, port };
};

const isW2Running = () => {
  const status = childProcess.execSync('w2 status').toString();
  return /whistle.*?is running/i.test(status);
};

const getServices = () => {
  return childProcess
    .execSync('networksetup -listallnetworkservices')
    .toString()
    .split('\n')
    .slice(1, -1);
};

const filterValidServices = services => {
  return services.filter(service =>
    /\nip\s?address:/gi.test(
      childProcess.execSync(`networksetup -getinfo "${service}"`).toString()
    )
  );
};

const getValidServices = () => {
  return filterValidServices(getServices());
};

const proxy = ({ ip, port } = getW2Config()) => {
  getValidServices().forEach(service => {
    childProcess.execSync(
      `networksetup -setwebproxy "${service}" "${ip}" "${port}" && networksetup -setwebproxystate "${service}" on`
    );
    childProcess.execSync(
      `networksetup -setsecurewebproxy "${service}" "${ip}" "${port}" && networksetup -setsecurewebproxystate "${service}" on`
    );
    childProcess.execSync(
      `networksetup -setsocksfirewallproxy "${service}" "${ip}" "${port}" && networksetup -setsocksfirewallproxystate "${service}" on`
    );
  });
};

const unproxy = () => {
  getValidServices().forEach(service => {
    childProcess.execSync(
      `networksetup -setwebproxystate "${service}" off && networksetup -setsecurewebproxystate "${service}" off && networksetup -setsocksfirewallproxystate "${service}" off`
    );
  });
};

const isProxying = () => {
  const { ip, port } = getW2Config();
  const services = getValidServices();
  return {
    http: services
      .map(service =>
        childProcess
          .execSync(`networksetup -getwebproxy "${service}"`)
          .toString()
      )
      .every(
        status =>
          /enabled\:\s?yes/gi.test(status) &&
          status.match(/server:\s?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i)[1] ===
            ip &&
          status.match(/port:\s?(\d{1,5})/i)[1] === port
      ),
    https: services
      .map(service =>
        childProcess
          .execSync(`networksetup -getsecurewebproxy "${service}"`)
          .toString()
      )
      .every(
        status =>
          /enabled\:\s?yes/gi.test(status) &&
          status.match(/server:\s?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i)[1] ===
            ip &&
          status.match(/port:\s?(\d{1,5})/i)[1] === port
      ),
    socks: services
      .map(service =>
        childProcess
          .execSync(`networksetup -getsocksfirewallproxy "${service}"`)
          .toString()
      )
      .every(
        status =>
          /enabled\:\s?yes/gi.test(status) &&
          status.match(/server:\s?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i)[1] ===
            ip &&
          status.match(/port:\s?(\d{1,5})/i)[1] === port
      )
  };
};

module.exports = {
  getServices,
  getValidServices,
  filterValidServices,
  proxy,
  unproxy,
  startW2,
  stopW2,
  getW2Config,
  isW2Running,
  isProxying
};
