#!/usr/bin/env node

'use strict';

var Zip = require('adm-zip');
var chalk = require('chalk');
var fs = require('fs-extra');
var path = require('path');
var bytes = require('bytes');
var prettyms = require('pretty-ms');
var tnValidate = require('tn-validate');
var tnTime = require('tn-time');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Zip__default = /*#__PURE__*/_interopDefaultLegacy(Zip);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var bytes__default = /*#__PURE__*/_interopDefaultLegacy(bytes);
var prettyms__default = /*#__PURE__*/_interopDefaultLegacy(prettyms);

const backupConfigs = async () => {
    const configpath = path__default["default"].join(process.cwd(), 'backup.configs.json');
    if (!fs__default["default"].existsSync(configpath)) {
        return console.log(chalk__default["default"].bgRed.whiteBright(' ERROR '), chalk__default["default"].visible('Could not find'), chalk__default["default"].yellow.bold.italic('backup.configs.json'), chalk__default["default"].visible('file into the'), chalk__default["default"].cyan.bold.italic('root'), chalk__default["default"].visible('folder\n'));
    }
    let config;
    try {
        config = fs__default["default"].readJSONSync(configpath);
    }
    catch {
        return console.log(chalk__default["default"].bgRed.whiteBright(' ERROR '), chalk__default["default"].visible('Invalid config file'), chalk__default["default"].red.bold.italic('backup.configs.json\n'));
    }
    return config;
};

const backupFileLister = (config) => {
    const { base, excludes } = config;
    const basepath = path__default["default"].join(process.cwd(), base);
    return recursivelist(basepath, basepath, excludes);
};
const recursivelist = (basepath, ffpath, excludes) => {
    const list = [];
    fs__default["default"].readdirSync(ffpath).forEach((dirent) => {
        const fullpath = path__default["default"].join(ffpath, dirent);
        const relpath = path__default["default"].relative(basepath, fullpath);
        const isExcluded = checkExclution(fullpath, excludes);
        if (isExcluded)
            return;
        const isdir = fs__default["default"].lstatSync(fullpath).isDirectory();
        if (!isdir)
            return list.push({ directory: false, fullpath, relfolder: path__default["default"].dirname(relpath) });
        list.push({ directory: true, fullpath, relfolder: relpath + '/' });
        list.push(...recursivelist(basepath, fullpath, excludes));
    });
    return list.sort((a, b) => a.fullpath.length - b.fullpath.length);
};
const checkExclution = (ffpath, excludes) => {
    for (const exclude of excludes) {
        if (tnValidate.isString(exclude)) {
            const excpath = path__default["default"].join(process.cwd(), exclude);
            if (excpath == ffpath)
                return true;
        }
        else {
            const regexp = new RegExp(exclude.regexp);
            if (ffpath.match(regexp))
                return true;
        }
    }
    return false;
};

const backupPath = (save) => {
    const { filename, frequency } = save;
    const maxtime = 6307200000000; // 200 years
    const moment = tnTime.time();
    let dispdate;
    let dateid;
    if (frequency === 'everytime') {
        dispdate = moment.format('dd.mm.Y-HH.ii.ss');
        const roundtime = new Date(moment.format('d-M-Y H:i:s')).getTime();
        dateid = Math.round((maxtime - roundtime) / 1000);
    }
    else if (frequency === 'minutely') {
        dispdate = moment.format('dd.mm.Y-HH.ii');
        const roundtime = new Date(moment.format('d-M-Y H:i')).getTime();
        dateid = Math.round((maxtime - roundtime) / (1000 * 60));
    }
    else if (frequency === 'hourly') {
        dispdate = moment.format('dd.mm.Y-HH.00');
        const roundtime = new Date(moment.format('d-M-Y H:{00}')).getTime();
        dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60));
    }
    else if (frequency === 'daily') {
        dispdate = moment.format('dd.mm.Y');
        const roundtime = new Date(moment.format('d-M-Y')).getTime();
        dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60 * 24));
    }
    else if (frequency === 'monthly') {
        dispdate = moment.format('MM-Y');
        const roundtime = new Date(moment.format('1-M-Y')).getTime();
        dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60 * 24 * 30));
    }
    else if (frequency === 'yearly') {
        dispdate = moment.format('Y');
        const roundtime = new Date(moment.format('1-{Jan}-Y')).getTime();
        dateid = Math.round((maxtime - roundtime) / (1000 * 60 * 60 * 24 * 364));
    }
    const savepath = path__default["default"].join(save.path, dateid + `-${filename}-` + dispdate + '.zip');
    return path__default["default"].isAbsolute(savepath) ? savepath : path__default["default"].join(process.cwd(), savepath);
};

console.clear();
run();
async function run() {
    const config = await backupConfigs();
    if (!config)
        return;
    const startzip = new Date().getTime();
    const zip = new Zip__default["default"]();
    const filelist = backupFileLister(config);
    filelist.forEach(({ directory, fullpath, relfolder }) => {
        if (directory)
            return zip.addFile(relfolder, null);
        zip.addLocalFile(fullpath, relfolder === '.' ? '' : relfolder);
    });
    const size = zip.getEntries().map((en) => en.getData().length).reduce((a, b) => a + b, 0); // prettier-ignore
    const comSize = zip.getEntries().map((en) => en.getCompressedData().length).reduce((a, b) => a + b, 0); // prettier-ignore
    const comPercent = (comSize * 100) / size;
    config.saves.forEach((save) => {
        const savepath = backupPath(save);
        fs__default["default"].ensureDirSync(path__default["default"].dirname(savepath));
        zip.writeZip(savepath);
    });
    const endzip = new Date().getTime();
    console.log();
    console.log(chalk__default["default"].bgGreen.black('       Backup Successful       '), '\n');
    console.log(chalk__default["default"].bold('    Files       '), chalk__default["default"].dim(':'), filelist.filter(i => !i.directory).length); // prettier-ignore
    console.log(chalk__default["default"].bold('    Folders     '), chalk__default["default"].dim(':'), filelist.filter(i => i.directory).length); // prettier-ignore
    console.log(chalk__default["default"].bold('    Time        '), chalk__default["default"].dim(':'), chalk__default["default"].red.bold(prettyms__default["default"](endzip - startzip))); // prettier-ignore
    console.log(chalk__default["default"].bold('    Saves       '), chalk__default["default"].dim(':'), config.saves.length); // prettier-ignore
    console.log(chalk__default["default"].bold('    Size        '), chalk__default["default"].dim(':'), bytes__default["default"](size, { unitSeparator: ' ', fixedDecimals: true })); // prettier-ignore
    console.log(chalk__default["default"].bold('    Zipped      '), chalk__default["default"].dim(':'), bytes__default["default"](comSize, { unitSeparator: ' ', fixedDecimals: true })); // prettier-ignore
    console.log(chalk__default["default"].bold('    Ratio       '), chalk__default["default"].dim(':'), comPercent.toFixed(2) + ' %'); // prettier-ignore
    const barsize = 31;
    const bars = Math.round((comPercent / 100) * barsize);
    console.log('\n' + chalk__default["default"].bgWhite(' '.repeat(bars)) + chalk__default["default"].bgGrey(' '.repeat(barsize - bars)));
    console.log();
}
