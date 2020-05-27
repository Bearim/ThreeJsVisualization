function buildTowerScene(columnMesh, triangleMesh, boxMesh) {
    var scene = new THREE.Scene();

    var light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    var additionalLight = new THREE.PointLight(0xffffff, 0.5);
    scene.add(additionalLight);

    scene.add(columnMesh);
    scene.add(triangleMesh);
    scene.add(boxMesh);

    return scene;
}

function buildTowerSceneFromJSON(parameters) {
    var columnHeight = parameters.column.height;
    var boxHeight = calculateFigureHeight(columnHeight, parameters.box.height);
    var triangleHeight = calculateFigureHeight(columnHeight, parameters.triangle.height);

    var columnMesh = buildColumnMesh(columnHeight, parameters.column.radius);
    var boxMesh = buildBoxMesh(boxHeight, parameters.box.width, parameters.box.length);
    var triangleMesh = buildTriangleMesh(triangleHeight, parameters.triangle.sideLength);

    return buildTowerScene(columnMesh, triangleMesh, boxMesh);
}