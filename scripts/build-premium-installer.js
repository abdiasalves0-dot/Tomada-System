const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRootDir = path.join(__dirname, '..');
const installerDir = path.join(projectRootDir, 'installer');

// Helper to recursively copy directories
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
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando compilação do Tomada Planner + Instalador Premium...');

  // 1. Compilar o aplicativo principal ofuscado
  console.log('\n--- Passo 1: Compilando e ofuscando o aplicativo principal ---');
  execSync('node scripts/build-obfuscated.js', { stdio: 'inherit', cwd: projectRootDir });

  // 2. Preparar diretório de arquivos no instalador
  console.log('\n--- Passo 2: Preparando arquivos para o instalador ---');
  const appFilesDir = path.join(installerDir, 'app-files');
  if (fs.existsSync(appFilesDir)) {
    try {
      fs.rmSync(appFilesDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
    } catch (e) {
      console.warn('Aviso ao limpar installer/app-files:', e.message);
    }
  }
  if (!fs.existsSync(appFilesDir)) {
    fs.mkdirSync(appFilesDir, { recursive: true });
  }

  const compiledAppDir = path.join(projectRootDir, 'dist', 'win-unpacked');
  if (!fs.existsSync(compiledAppDir)) {
    throw new Error('Erro: Aplicativo principal compilado não encontrado em dist/win-unpacked');
  }

  console.log('Copiando arquivos compilados para o pacote do instalador...');
  copyDirSync(compiledAppDir, appFilesDir);

  // 3. Instalar dependências e compilar o instalador
  console.log('\n--- Passo 3: Compilando o instalador premium (Web/Electron) ---');
  execSync('npm install', { stdio: 'inherit', cwd: installerDir });
  execSync('npm run build', { stdio: 'inherit', cwd: installerDir });

  // 4. Copiar o instalador premium final para a pasta dist raiz
  console.log('\n--- Passo 4: Movendo o Instalador Premium para a pasta dist raiz ---');
  const srcInstaller = path.join(installerDir, 'dist', 'Tomada Setup.exe');
  const destInstaller = path.join(projectRootDir, 'dist', 'Tomada Planner Setup.exe');
  if (fs.existsSync(srcInstaller)) {
    fs.copyFileSync(srcInstaller, destInstaller);
  }

  console.log('\n🎉 INSTALADOR PREMIUM (Tomada Planner Setup.exe) COMPILADO COM SUCESSO!');
  console.log(`Local do arquivo final: ${destInstaller}`);
}

main().catch(err => {
  console.error('\n❌ Erro durante o processo de compilação:', err.message);
  process.exit(1);
});
