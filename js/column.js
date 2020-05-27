function buildColumnMesh(height, radius) {
    var cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 1300);
    var cilynderMaterial = new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: true});
    return new THREE.Mesh(cylinderGeometry, cilynderMaterial);
}