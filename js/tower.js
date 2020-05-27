function calculateFigureHeight(columnHeight, figureHeight) {
    return figureHeight - columnHeight/2;
}

function buildCamera(towerParametersJson){
    var towerParameters = JSON.parse(towerParametersJson);

    var fieldOfView = 75;
    var nearestPoint = 0.1;
    var furthestPoint = 4000;
    var camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, nearestPoint, furthestPoint);

    camera.position.x = towerParameters.column.height/2 + 100;
    camera.position.y = towerParameters.column.height/2 + 50;

    return camera
}

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

function buildTowerSceneBasedOnParameters(towerParametersJson) {
    var towerParameters = JSON.parse(towerParametersJson);
    var columnHeight = towerParameters.column.height;
    var boxHeight = calculateFigureHeight(columnHeight, towerParameters.box.height);
    var triangleHeight = calculateFigureHeight(columnHeight, towerParameters.triangle.height);

    var columnMesh = buildColumnMesh(columnHeight, towerParameters.column.radius);
    var boxMesh = buildBoxMesh(boxHeight, towerParameters.box.width, towerParameters.box.length);
    var triangleMesh = buildTriangleMesh(triangleHeight, towerParameters.triangle.sideLength);

    return buildTowerScene(columnMesh, triangleMesh, boxMesh);
}

function buildTower(towerParameters) {
    var renderer = new THREE.WebGLRenderer();
    var scene = buildTowerSceneBasedOnParameters(towerParameters);
    var camera = buildCamera(towerParameters);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    return {renderer: renderer, camera: camera, scene: scene};
}
