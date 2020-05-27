function buildBoxMesh(height, width, length) {
    var numberOfFragments = 100;
    var heightOfBox = 10;
    var boxGeometry = new THREE.BoxBufferGeometry(width, heightOfBox, length, numberOfFragments, numberOfFragments, numberOfFragments);
    var boxMaterial = new THREE.MeshLambertMaterial({color: 0x0ffff0, wireframe: true});
    var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

    boxMesh.position.set(0, height, 0);
    return boxMesh;
}