function createTriangle(rightVector, leftVector, estrangementVector) {
    var triangleGeometry = new THREE.Geometry();
    triangleGeometry.vertices.push(rightVector);
    triangleGeometry.vertices.push(leftVector);
    triangleGeometry.vertices.push(estrangementVector);

    triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
    triangleGeometry.computeFaceNormals();

    return new THREE.Mesh(triangleGeometry, new THREE.MeshNormalMaterial());
}

function buildTriangleMesh(height, sideLength) {
    var y = 0, z = 0;
    var v1 = new THREE.Vector3(sideLength, y, sideLength);
    var v2 = new THREE.Vector3(-(sideLength * 2), y, z);
    var v3 = new THREE.Vector3(sideLength, y, -(sideLength));

    var firstTriangleMesh = createTriangle(v1, v2, v3);
    var secondTriangleMesh = createTriangle(v1, v3, v2);

    var singleGeometry = new THREE.Geometry();

    firstTriangleMesh.updateMatrix();
    singleGeometry.merge(firstTriangleMesh.geometry, firstTriangleMesh.matrix);

    secondTriangleMesh.updateMatrix();
    singleGeometry.merge(secondTriangleMesh.geometry, secondTriangleMesh.matrix);

    var triangleMesh = new THREE.Mesh(singleGeometry, new THREE.MeshNormalMaterial());
    triangleMesh.position.set(0, height, 0);
    return triangleMesh;
}
