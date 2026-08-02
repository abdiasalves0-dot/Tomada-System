const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildTmpDir = path.join(__dirname, '..', 'build-tmp');
const projectRootDir = path.join(__dirname, '..');

// Helper para copiar diretórios recursivamente
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (e) {
        console.warn(`Aviso ao copiar ${entry.name}:`, e.message);
      }
    }
  }
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(file => {
      const curSource = path.join(source, file);
      const curTarget = path.join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    });
  }
}

function runBuild() {
  console.log('1. Limpando diretórios temporários antigos...');
  if (fs.existsSync(buildTmpDir)) {
    try {
      fs.rmSync(buildTmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
    } catch (e) {
      console.warn('Aviso ao limpar build-tmp:', e.message);
    }
  }

  console.log('2. Preparando estrutura leve do cliente Chromium (Estilo Discord)...');
  fs.mkdirSync(buildTmpDir, { recursive: true });

  // Copiar apenas os arquivos do cliente Electron
  fs.copyFileSync(path.join(projectRootDir, 'package.json'), path.join(buildTmpDir, 'package.json'));
  fs.copyFileSync(path.join(projectRootDir, 'electron-main.js'), path.join(buildTmpDir, 'electron-main.js'));
  if (fs.existsSync(path.join(projectRootDir, 'preload.js'))) {
    fs.copyFileSync(path.join(projectRootDir, 'preload.js'), path.join(buildTmpDir, 'preload.js'));
  }
  if (fs.existsSync(path.join(projectRootDir, 'public'))) {
    copyFolderRecursiveSync(path.join(projectRootDir, 'public'), path.join(buildTmpDir, 'public'));
  }

  console.log('3. Executando electron-builder para gerar o app Chromium...');
  execSync(`npx electron-builder --win --projectDir="${buildTmpDir}"`, { stdio: 'inherit' });

  console.log('4. Copiando executáveis compilados para a pasta dist principal...');
  const rootDistDir = path.join(projectRootDir, 'dist');
  const tmpDistDir = path.join(buildTmpDir, 'dist');
  if (fs.existsSync(tmpDistDir)) {
    copyDirSync(tmpDistDir, rootDistDir);
  }

  console.log('5. Limpando arquivos temporários...');
  if (fs.existsSync(buildTmpDir)) {
    try {
      fs.rmSync(buildTmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
    } catch (e) {
      console.warn('Aviso ao limpar build-tmp final:', e.message);
    }
  }

  console.log('🎉 Compilação do Cliente Chromium (Estilo Discord) concluída com sucesso!');
}

runBuild();
