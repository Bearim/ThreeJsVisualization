function buildColumnMesh(height, radius) {
    var radialSegmentsNumber = 1300;
    var cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, radialSegmentsNumber);
    var cilynderMaterial = new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: true});
    return new THREE.Mesh(cylinderGeometry, cilynderMaterial);
}
