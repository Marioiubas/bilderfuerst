// Verify exported GLBs: parse the JSON chunk (nodes, meshes, triangles, materials, images, extensions)
// and load each file through three.js GLTFLoader in Node (images decoded via sharp).
// Usage: node scripts/blender/verify-glb.mjs public/models/film-cartridge-v2.glb [more.glb …]
import fs from 'node:fs';
import sharp from 'sharp';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

globalThis.self ??= globalThis;
globalThis.createImageBitmap = async (blob) => {
  const m = await sharp(Buffer.from(await blob.arrayBuffer())).metadata();
  return {width: m.width, height: m.height, close() {}};
};

function chunks(buf) {
  const json = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8'));
  const binStart = 20 + buf.readUInt32LE(12) + 8;
  return {json, bin: buf.subarray(binStart)};
}

async function inspect(file) {
  const buf = fs.readFileSync(file);
  const {json, bin} = chunks(buf);
  const tris = (json.meshes ?? []).map((m) => ({
    name: m.name,
    tris: m.primitives.reduce((s, p) => s + (p.indices !== undefined ? json.accessors[p.indices].count / 3 : json.accessors[p.attributes.POSITION].count / 3), 0),
    verts: m.primitives.reduce((s, p) => s + json.accessors[p.attributes.POSITION].count, 0),
    attributes: [...new Set(m.primitives.flatMap((p) => Object.keys(p.attributes)))],
    materials: m.primitives.map((p) => json.materials?.[p.material]?.name),
  }));
  const images = [];
  for (const img of json.images ?? []) {
    const bv = json.bufferViews[img.bufferView];
    const data = bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
    const meta = await sharp(data).metadata();
    images.push({name: img.name, mime: img.mimeType, size: `${meta.width}x${meta.height}`, bytes: bv.byteLength});
  }
  const report = {
    file, bytes: buf.length,
    extensionsUsed: json.extensionsUsed ?? [], extensionsRequired: json.extensionsRequired ?? [],
    nodes: json.nodes.map((n) => n.name),
    triangles: tris.reduce((s, m) => s + m.tris, 0), vertices: tris.reduce((s, m) => s + m.verts, 0), meshes: tris,
    materials: (json.materials ?? []).map((m) => ({name: m.name, alphaMode: m.alphaMode ?? 'OPAQUE', doubleSided: !!m.doubleSided, ext: Object.keys(m.extensions ?? {})})),
    images, cameras: (json.cameras ?? []).map((c) => c.perspective ?? c.orthographic),
  };
  // three.js load
  const gltf = await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), '');
  const box = new THREE.Box3().setFromObject(gltf.scene);
  report.three = {
    ok: true, sceneChildren: gltf.scene.children.map((c) => c.name),
    bounds: {min: box.min.toArray().map((v) => +v.toFixed(4)), max: box.max.toArray().map((v) => +v.toFixed(4))},
    named: Object.fromEntries(['SlotExit', 'LeaderTip', 'Camera_Window'].map((n) => [n, gltf.scene.getObjectByName(n)?.getWorldPosition(new THREE.Vector3()).toArray().map((v) => +v.toFixed(4))]).filter(([, v]) => v)),
    materialTypes: [...new Set((() => { const t = []; gltf.scene.traverse((o) => { if (o.material) t.push(`${o.material.name}:${o.material.type}`); }); return t; })())],
  };
  return report;
}

for (const f of process.argv.slice(2)) console.log(JSON.stringify(await inspect(f), null, 1));
