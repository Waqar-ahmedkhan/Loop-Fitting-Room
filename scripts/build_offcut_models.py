#!/usr/bin/env python3
"""Build closed, textured garment approximations from the supplied Offcut cutouts.
Front artwork follows the supplied image; backs and cloth depth are approximations.
"""
from pathlib import Path
import json
import io
import struct
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def build(source):
    image = Image.open(source).convert('RGBA')
    alpha = np.asarray(image.getchannel('A'))
    width, height = image.size
    xs, ys = np.arange(0, width, 5), np.arange(100, height - 5, 5)
    vertices, uv, faces, mapping = [], [], [], {}
    center_x = 270 if source.stem in ('offcut-winged-skull', 'offcut-heavy-black') else 255
    for j, y in enumerate(ys):
        for i, x in enumerate(xs):
            if alpha[y, x] < 160:
                continue
            mapping[(i, j)] = len(vertices)
            px, py = (x - center_x) * .0018, (height - y) * .0018
            z = .036 + .012 * np.cos((x - center_x) / 180) + .004 * np.sin(x / 25 + y / 70)
            vertices.append((px, py, z))
            uv.append((x / width, 1 - y / height))
    for j in range(len(ys) - 1):
        for i in range(len(xs) - 1):
            keys = [(i, j), (i + 1, j), (i, j + 1), (i + 1, j + 1)]
            if not all(key in mapping for key in keys):
                continue
            a, b, c, d = [mapping[key] for key in keys]
            faces.extend([(a, c, b), (b, c, d)])
    count = len(vertices)
    back = [(x, y, -z) for x, y, z in vertices]
    front_faces = list(faces)
    faces.extend([(a + count, c + count, b + count) for a, b, c in front_faces])
    edges = {}
    for face in front_faces:
        for a, b in zip(face, (face[1], face[2], face[0])):
            key = tuple(sorted((a, b)))
            edges[key] = edges.get(key, []) + [(a, b)]
    for edge in edges.values():
        if len(edge) == 1:
            a, b = edge[0]
            faces.extend([(a, b, a + count), (b, b + count, a + count)])
    # Back is neutral fabric: sample a small unprinted hem region instead of duplicating front graphics.
    back_uv = [(0.55, 0.08)] * count
    positions = np.asarray(vertices + back, dtype='<f4')
    texcoords = np.asarray(uv + back_uv, dtype='<f4')
    triangles = np.asarray(faces, dtype='<u4')
    normals = np.zeros_like(positions)
    vectors = np.cross(positions[triangles[:, 1]] - positions[triangles[:, 0]],
                       positions[triangles[:, 2]] - positions[triangles[:, 0]])
    for corner in range(3):
        np.add.at(normals, triangles[:, corner], vectors)
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-10)
    texture = io.BytesIO()
    image.save(texture, format='PNG')
    binary, views = bytearray(), []
    for data in (positions.tobytes(), normals.astype('<f4').tobytes(), texcoords.tobytes(), triangles.tobytes(), texture.getvalue()):
        while len(binary) % 4:
            binary.append(0)
        views.append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data)})
        binary.extend(data)
    document = {
        'asset': {'version': '2.0', 'generator': 'LOOPS image-derived cloth approximation'},
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': source.stem}],
        'buffers': [{'byteLength': len(binary)}], 'bufferViews': views,
        'accessors': [
            {'bufferView': 0, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3',
             'min': positions.min(axis=0).tolist(), 'max': positions.max(axis=0).tolist()},
            {'bufferView': 1, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3'},
            {'bufferView': 2, 'componentType': 5126, 'count': len(texcoords), 'type': 'VEC2'},
            {'bufferView': 3, 'componentType': 5125, 'count': triangles.size, 'type': 'SCALAR'},
        ],
        'images': [{'bufferView': 4, 'mimeType': 'image/png'}],
        'textures': [{'source': 0}],
        'materials': [{'name': 'Printed cotton', 'doubleSided': True,
            'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': .92}}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2},
                                   'indices': 3, 'material': 0}]}],
    }
    encoded = json.dumps(document, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    binary += b'\x00' * (-len(binary) % 4)
    result = struct.pack('<III', 0x46546C67, 2, 28 + len(encoded) + len(binary))
    result += struct.pack('<II', len(encoded), 0x4E4F534A) + encoded
    result += struct.pack('<II', len(binary), 0x004E4942) + binary
    target = ROOT / 'assets/garments' / f'{source.stem}.glb'
    target.write_bytes(result)
    print(f'{target.name}: {len(positions)} vertices, {len(faces)} faces')


if __name__ == '__main__':
    for source in sorted((ROOT / 'assets/product-art').glob('offcut-*.webp')):
        build(source)
