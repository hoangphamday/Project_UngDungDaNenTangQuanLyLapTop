const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const thuMucGoc = path.resolve(__dirname, '..');
const thuMucCanKiemTra = [path.join(thuMucGoc, 'src'), path.join(thuMucGoc, 'tests')];
const timFileJs = (thuMuc) => fs.readdirSync(thuMuc, { withFileTypes: true }).flatMap((entry) => {
  const duongDan = path.join(thuMuc, entry.name);
  return entry.isDirectory() ? timFileJs(duongDan) : entry.name.endsWith('.js') ? [duongDan] : [];
});

const files = thuMucCanKiemTra.filter(fs.existsSync).flatMap(timFileJs);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}
console.log(`Da kiem tra cu phap ${files.length} file JavaScript.`);
