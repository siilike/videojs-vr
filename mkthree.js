
const fs = require('fs')
const path = require('path')

const INPUT = './node_modules/three/examples/js/'
const OUTPUT = './src/three/'

const dirs =
[
  'controls',
  'effects',
]

const files =
[
  'controls/VRControls.js',
  'controls/OrbitControls.js',
  'controls/DeviceOrientationControls.js',
  'effects/VREffect.js',
]

const globalReplace = function(str, pattern, replacement) {
  return str.replace(new RegExp(pattern, 'g'), replacement);
};

const transform = (m, code) =>
{
  // trun the global modifiction into an import and a local variable definition
  code = code.replace(`THREE.${m} =`, `import * as THREE from 'three';\nvar ${m} =`);

  // change references from the global modification to the local variable
  code = globalReplace(code, `THREE.${m}`, m);

  // export that local variable as default from this module
  code += `\nexport default ${m};`;

  // expose private functions so that users can manually use controls
  // and we can add orientation controls
  if (m === 'OrbitControls') {
    code = globalReplace(code, 'function rotateLeft\\(', 'rotateLeft = function(');
    code = globalReplace(code, 'function rotateUp\\(', 'rotateUp = function(');

    code = globalReplace(code, 'rotateLeft', 'scope.rotateLeft');
    code = globalReplace(code, 'rotateUp', 'scope.rotateUp');
    // comment out the context menu prevent default line...
    code = globalReplace(
      code,
      "scope.domElement.addEventListener\\( 'contextmenu'",
      "\/\/scope.domElement.addEventListener\\( 'contextmenu'"
    );
  }

  return code;
}

fs.rmdirSync(OUTPUT, { recursive: true })

fs.mkdirSync(OUTPUT)
dirs.forEach(d => fs.mkdirSync(OUTPUT + d))

files.forEach(f =>
{
  const code = fs.readFileSync(INPUT + f, 'utf8')

  fs.writeFileSync(OUTPUT + f, transform(f.split("/").reverse()[0].split(".")[0], code))
})

console.log('Done.')
