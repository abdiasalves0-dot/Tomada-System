const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function renderAssets() {
  const svgPath = path.join(__dirname, '..', 'tomada', 'SVG', '1Prancheta 1.svg');
  const assetsDir = path.join(__dirname, '..', 'assets');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Criar imagem de fundo para a Sidebar (164x314) com a cor #1C1A14
  const sidebarBg = await sharp({
    create: {
      width: 164,
      height: 314,
      channels: 4,
      background: '#1C1A14'
    }
  });

  // Redimensionar o logo SVG para caber na Sidebar (largura 100px)
  const logoResizedSidebar = await sharp(svgPath)
    .resize(100)
    .toBuffer();

  // Compor o logo no centro da Sidebar
  await sidebarBg
    .composite([{ input: logoResizedSidebar, top: 107, left: 32 }])
    .png()
    .toFile(path.join(assetsDir, 'installer-sidebar.png'));

  // 2. Criar imagem de fundo para o Header (150x57) com a cor #1C1A14
  const headerBg = await sharp({
    create: {
      width: 150,
      height: 57,
      channels: 4,
      background: '#1C1A14'
    }
  });

  // Redimensionar o logo SVG para caber no Header (altura 36px)
  const logoResizedHeader = await sharp(svgPath)
    .resize({ height: 36 })
    .toBuffer();

  // Compor o logo centralizado verticalmente e alinhado à esquerda
  await headerBg
    .composite([{ input: logoResizedHeader, top: 10, left: 15 }])
    .png()
    .toFile(path.join(assetsDir, 'installer-header.png'));

  console.log('Imagens do instalador geradas com sucesso usando a biblioteca sharp!');
}

renderAssets().catch(err => {
  console.error('Erro ao gerar imagens com sharp:', err);
});
