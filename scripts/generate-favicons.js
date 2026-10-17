const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SVG_PATH = path.join(__dirname, '..', 'src', 'app', 'icon.svg');
const svgBuffer = fs.readFileSync(SVG_PATH);

function packIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + dirEntrySize * count;

  let offset = totalHeaderSize;
  const entries = [];
  for (const item of pngBuffers) {
    entries.push({
      width: item.width >= 256 ? 0 : item.width,
      height: item.height >= 256 ? 0 : item.height,
      colorCount: 0,
      reserved: 0,
      planes: 1,
      bitCount: 32,
      bytesInRes: item.buffer.length,
      imageOffset: offset,
      buffer: item.buffer,
    });
    offset += item.buffer.length;
  }

  const out = Buffer.alloc(offset);
  // Header
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // type: 1 = ICO
  out.writeUInt16LE(count, 4); // count

  let entryPos = headerSize;
  for (const e of entries) {
    out.writeUInt8(e.width, entryPos);
    out.writeUInt8(e.height, entryPos + 1);
    out.writeUInt8(e.colorCount, entryPos + 2);
    out.writeUInt8(e.reserved, entryPos + 3);
    out.writeUInt16LE(e.planes, entryPos + 4);
    out.writeUInt16LE(e.bitCount, entryPos + 6);
    out.writeUInt32LE(e.bytesInRes, entryPos + 8);
    out.writeUInt32LE(e.imageOffset, entryPos + 12);

    e.buffer.copy(out, e.imageOffset);
    entryPos += dirEntrySize;
  }

  return out;
}

async function generate() {
  console.log('Rendering raster assets from SVG...');
  
  const sizes = [16, 32, 48, 180, 192, 512];
  const rendered = {};

  for (const size of sizes) {
    rendered[size] = await sharp(svgBuffer, { density: 300 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    console.log(`Rendered ${size}x${size} (${rendered[size].length} bytes)`);
  }

  // Pack ICO with 16, 32, 48
  const icoBuffer = packIco([
    { width: 16, height: 16, buffer: rendered[16] },
    { width: 32, height: 32, buffer: rendered[32] },
    { width: 48, height: 48, buffer: rendered[48] }
  ]);
  console.log(`Packed ICO (${icoBuffer.length} bytes)`);

  const appDir = path.join(__dirname, '..', 'src', 'app');
  const pubDir = path.join(__dirname, '..', 'public');

  if (!fs.existsSync(pubDir)) {
    fs.mkdirSync(pubDir, { recursive: true });
  }

  // Write ICO files
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(pubDir, 'favicon.ico'), icoBuffer);
  console.log('Wrote favicon.ico to src/app and public');

  // Write Apple Touch Icon
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), rendered[180]);
  fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), rendered[180]);
  console.log('Wrote apple-touch-icon.png (180x180)');

  // Write PWA / Android icons
  fs.writeFileSync(path.join(pubDir, 'icon-192.png'), rendered[192]);
  fs.writeFileSync(path.join(pubDir, 'icon-512.png'), rendered[512]);
  console.log('Wrote icon-192.png and icon-512.png');

  // Write SVG copies to public
  fs.writeFileSync(path.join(pubDir, 'icon.svg'), svgBuffer);
  fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgBuffer);
  console.log('Wrote icon.svg and favicon.svg to public');

  console.log('All favicon assets generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
