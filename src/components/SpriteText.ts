import * as THREE from 'three';

export function SpriteText(
  text: string,
  color: string,
  isCenter: boolean,
  explored: boolean,
): THREE.Group {
  const group = new THREE.Group();

  const fontSize = isCenter ? 22 : 14;
  const dotRadius = isCenter ? 4 : 3;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  ctx.font = `${isCenter ? 'bold ' : ''}${fontSize}px Inter, -apple-system, sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const padding = 8;

  canvas.width = (textWidth + padding * 2 + dotRadius * 2 + 6) * 2;
  canvas.height = (fontSize + padding * 2) * 2;

  ctx.scale(2, 2);

  ctx.font = `${isCenter ? 'bold ' : ''}${fontSize}px Inter, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const centerY = (canvas.height / 2) / 2;
  const dotX = padding;
  const textX = dotX + dotRadius * 2 + 5;

  ctx.beginPath();
  ctx.arc(dotX + dotRadius, centerY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (explored) {
    ctx.beginPath();
    ctx.arc(dotX + dotRadius, centerY, dotRadius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (isCenter) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }
  ctx.fillStyle = isCenter ? '#ffffff' : 'rgba(226,232,240,0.85)';
  ctx.fillText(text, textX, centerY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  const scale = isCenter ? 12 : 8;
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(scale * aspect, scale, 1);

  group.add(sprite);

  return group;
}
