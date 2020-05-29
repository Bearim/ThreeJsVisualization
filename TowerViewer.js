import React, {Component} from "react";
import {
    AmbientLight,
    BoxGeometry,
    CylinderGeometry,
    Mesh,
    MeshLambertMaterial,
    ObjectLoader,
    PerspectiveCamera,
    PointLight,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export const ViewerConfiguration = {
    fieldOfView: 45,
    nearestPoint: 0.1,
    furthestPoint: 10000
};

class TowerViewer extends Component {

    loader = new ObjectLoader();
    mount;
    renderer;
    scene;
    camera;
    controls;
    current = {
        tower: null,
        devices: []
    };

    componentDidMount() {
        this.configureScene();
        // entry point for data rendering
        this.addExampleComponents(this.tower.height, this.levels, this.devices);
    }

    configureScene = () => {
        this.renderer = new WebGLRenderer();
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(ViewerConfiguration.fieldOfView,
            this.mount.clientWidth / this.mount.clientHeight,
            ViewerConfiguration.nearestPoint,
            ViewerConfiguration.furthestPoint);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);

        const light = new AmbientLight(0xffffff, 0.5);
        light.position.set(100, 100, -100);
        this.scene.add(light);
        const additionalLight = new PointLight(0xffffff, 0.8);
        additionalLight.position.set(100, 200, 100);
        this.scene.add(additionalLight);

        this.camera.position.z = 100; // default position
        /*this.camera.up = new Vector3(0, 0, 1);
        this.controls.target = new Vector3(0, 0, 1);*/
        this.camera.lookAt(0, 0, 0);

        this.mount.appendChild(this.renderer.domElement);

        this.animate();
    };

    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };

    setTower = tower => {
        if (this.current.tower) {
            this.scene.remove(this.current.tower);
        }

        this.current.tower = tower;
        this.scene.add(tower);
        this.camera.position.z = this.getModelHeight(tower) * 1.5;
    };

    addDevice = device => {
        this.current.devices.push(device);
        this.scene.add(device);
    };

    // todo: in custom models there will not be provided height, so need to define other way to get height
    getModelHeight = model => model.geometry.parameters.height;

    removeDevice = device => {
        const index = this.current.devices.indexOf(device);
        this.current.devices.splice(index, 1);
        this.scene.remove(device);
    };

    render() {
        return (
            <div
        style={{width: '800px', height: '900px'}}
        ref={ref => (this.mount = ref)}/>
    )
    }

    /**
     * Following code should be removed before the release, as it only example methods and components.
     */

    loadModelExampleDoNotUse = (path, callback, progress, error) => {
        this.loader.load("models/json/example.json",
            obj => this.scene.add(obj),
            xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
            err => console.error('An error happened: ', err)
        )
    };

    createExampleTower = height => {
        const radialSegmentsNumber = height * 100;
        const widthTop = this.getTowerWidthAtTop(height);
        const widthBottom = this.getTowerWidthByLevelFromTop(height, 0);
        const cylinderGeometry = new CylinderGeometry(widthTop, widthBottom, height, radialSegmentsNumber);
        const cylinderMaterial = new MeshLambertMaterial({color: 0x999999});
        return new Mesh(cylinderGeometry, cylinderMaterial);
    };

    getTowerWidthAtTop = height => height / 300;
    getTowerWidthByLevelFromTop = (height, level) => {
        const topWidth = this.getTowerWidthAtTop(height);
        return (5 - ((level / height) * 5)) * topWidth + topWidth;
    };

    createExampleLevel = (height, levelInfo) => {
        const level = levelInfo.mountLevel;
        const blockHeight = height / 100;
        const halfBlockHeight = blockHeight / 2;
        const widthTop = this.getTowerWidthByLevelFromTop(height, level + halfBlockHeight) * 1.02;
        const widthBottom = this.getTowerWidthByLevelFromTop(height, level - halfBlockHeight) * 1.02;
        const color = levelInfo.status === 'AVAILABLE' ? 0x00aa00 : 0x6666ff;
        const radialSegmentsNumber = 100;
        const cylinderGeometry = new CylinderGeometry(widthTop, widthBottom, blockHeight, radialSegmentsNumber);
        const cylinderMaterial = new MeshLambertMaterial({color: color});
        const mesh = new Mesh(cylinderGeometry, cylinderMaterial);
        mesh.position.set(0, level - (height / 2), 0);
        return mesh;
    };

    createExampleDevice = (height, deviceInfo) => {
        const level = deviceInfo.mountLevel;
        const radius = this.getTowerWidthByLevelFromTop(height, level) * 1.01 + this.convertInchToFeet(deviceInfo.equipment.depth) / 2;
        const color = deviceInfo.status === 'AVAILABLE' ? 0x00ff00 : 0x0000ff;
        const radialSegmentsNumber = 100;
        const geometry = new BoxGeometry(this.convertInchToFeet(deviceInfo.equipment.width), this.convertInchToFeet(deviceInfo.equipment.height), this.convertInchToFeet(deviceInfo.equipment.depth), radialSegmentsNumber);
        const cylinderMaterial = new MeshLambertMaterial({color: color});
        const mesh = new Mesh(geometry, cylinderMaterial);
        mesh.position.set(0, level - (height / 2), radius);
        return mesh;
    };

    convertInchToFeet = inch => inch / 12;

    addExampleComponents = (towerHeight, levels, devices) => {
        // cleanup
        this.current.devices.forEach(this.scene.remove);

        // add new
        this.setTower(this.createExampleTower(towerHeight));
        levels.map(level => this.createExampleLevel(towerHeight, level)).forEach(this.addDevice);
        devices.map(device => this.createExampleDevice(towerHeight, device)).forEach(this.addDevice);
    };

    tower = {
        height: 180
    };

    levels = [{"id":"01a078a0-bf83-4d7f-889f-26d892bee5a3","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":15,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"08a744ed-2658-4729-abf9-64f4d56d9807","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":72,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"1ecc3245-9ddb-4ce7-8ae9-94277e4121c8","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":83,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"283e3e60-b65a-4695-8dd0-03bee8d7b955","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":173,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"cdde1225-17d8-518e-ba1c-ea5f7af52281","name":"Admin ABC","email":"admin.abc@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"4b931e81-83e1-4133-b534-8e1a648226f5","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":139,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"52926a85-7b85-4c35-bbfd-7846b184ca3a","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":114,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"55177967-2dd7-4188-b66d-afa306ca059b","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":45,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"5ba9c368-5093-4572-ac20-d01694f3b68a","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":38,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"5cc63b15-15cd-42bd-b4e2-246bf793c427","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":164,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"774d34d2-c32d-4470-bfc4-6bc09389a18b","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":65,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"917bb810-b94b-4dc9-911f-2b50f93c9b98","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":102,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"aced9366-a2be-434e-856a-24c06573ae20","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":55,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"b52918f7-4719-4666-abc4-d873571850f0","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":25,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"b86460d5-dd8f-43ef-bd07-fd73db16fccd","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":170,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"bf9bcc23-b2df-4155-be7a-65475417193d","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":160,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"cb695137-9d62-471c-8501-47599a281e92","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":60,"status":"BUSY","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"d91f6a61-3171-4882-aafd-3b9481f3c0d0","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":35,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}},{"id":"e73cda5b-e2cd-4bd2-8b57-04aaf192cc31","towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","busUnit":null,"structureId":"A","mountLevel":129,"status":"AVAILABLE","height":null,"centerLine":null,"user":{"id":"b1d4ca09-1cdf-2481-ba41-f4daa7dc156f","name":"Admin XYZ","email":"admin.xyz@gmail.com","emailVerified":false,"roles":[{"id":2,"name":"ADMIN"}]}}];

    devices = [{"id":"01150f31-7fad-421e-a466-a0d3822b67f8","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e887e758-4b85-4bbb-8394-fe96f9772bea","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNHH-1D65C","type":"PANEL","height":96.6,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"A","antennaTech":null,"antennaUseId":null,"azimuthDeg":60,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"0ac2a9e0-5804-49c5-beb8-bcb4fbf82d1e","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"f2c45155-0087-49e8-85f3-a9ab5e2c22b3","group":"ANTENNA","manufacture":"SAMSUNG TELECOMMUNICATIONS","model":"M-MIMO AAU","type":"PANEL","height":41.34,"width":19.7,"depth":5.5,"weight":143.3},"structureId":"A","mountLevel":72,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"F","antennaTech":null,"antennaUseId":null,"azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":75.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"0ba574c1-d91c-48bc-b95b-907a1c6f252c","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7ad4b3df-ff1b-42ac-934c-78ae1c850ebb","group":"ANTENNA","manufacture":"COMMSCOPE","model":"JAHH-65C-R3B","type":"PANEL","height":95.7,"width":13.8,"depth":8.2,"weight":93.9},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"H","antennaTech":null,"antennaUseId":null,"azimuthDeg":300,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"0d8e049f-ef29-4b6e-ad0d-1d3a9825f6f8","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7d3c07d4-9cda-4fe4-b95a-142817975fc1","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNH-1D65C","type":"PANEL","height":96.5,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"C","antennaTech":null,"antennaUseId":null,"azimuthDeg":0,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"174ea5b2-2585-4996-8327-16852a25f65f","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"18d12a74-8f86-47be-a1d1-0e9635308d2e","group":"ANTENNA","manufacture":"SYMMETRICOM","model":"58532A","type":"GPS","height":6.417,"width":3.54,"depth":3.54,"weight":0.4122},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"K","antennaTech":null,"antennaUseId":null,"azimuthDeg":240,"azimuthType":"T","orientation":"M","zcenter":119.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"1cd547fb-bbc4-4966-af0b-6c05883fdfc7","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7ad4b3df-ff1b-42ac-934c-78ae1c850ebb","group":"ANTENNA","manufacture":"COMMSCOPE","model":"JAHH-65C-R3B","type":"PANEL","height":95.7,"width":13.8,"depth":8.2,"weight":93.9},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"G","antennaTech":null,"antennaUseId":null,"azimuthDeg":300,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"1dacc1ba-9517-41a8-9aad-1e68f7dd0904","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"d58035f2-fbd3-436e-8489-958f61a6001c","group":"ANTENNA","manufacture":"COMMSCOPE","model":"DB589-Y","type":"OMNI","height":110.0,"width":1.5,"depth":1.5,"weight":11.5},"structureId":"A","mountLevel":83,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"A","antennaTech":null,"antennaUseId":null,"azimuthDeg":0,"azimuthType":"T","orientation":"U","zcenter":87.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"25e78447-4c24-4eb6-8f93-28413298766a","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"39b00ef7-9c35-445d-a58f-6fb3b066cacd","group":"ANTENNA","manufacture":"ANDREW","model":"TMBXX-6517-A2M","type":"PANEL","height":74.9,"width":12.0,"depth":6.5,"weight":44.4},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"H","antennaTech":null,"antennaUseId":null,"azimuthDeg":120,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"2c529aca-d77a-452e-b01e-8f4cb470ae95","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"16164e9a-600f-440a-9824-1dcb6786ce55","group":"ANTENNA","manufacture":"ANDREW","model":"HP2-102","type":"MICROWAVE/SHROUD","height":24.0,"width":24.0,"depth":21.0,"weight":25.0},"structureId":"A","mountLevel":38,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"A","antennaTech":"MW Link","antennaUseId":"D","azimuthDeg":260,"azimuthType":"T","orientation":"M","zcenter":38.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"302100a4-a1ae-4550-b63b-6039b55bd581","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7ad4b3df-ff1b-42ac-934c-78ae1c850ebb","group":"ANTENNA","manufacture":"COMMSCOPE","model":"JAHH-65C-R3B","type":"PANEL","height":95.7,"width":13.8,"depth":8.2,"weight":93.9},"structureId":"A","mountLevel":102,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"C","antennaTech":null,"antennaUseId":null,"azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":104.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"38fda2b2-032a-4c35-a675-ebe2a095aa94","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e887e758-4b85-4bbb-8394-fe96f9772bea","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNHH-1D65C","type":"PANEL","height":96.6,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":102,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"A","antennaTech":null,"antennaUseId":null,"azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":104.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"3aef7f4a-ddae-4543-bc8a-7c211acace09","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e887e758-4b85-4bbb-8394-fe96f9772bea","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNHH-1D65C","type":"PANEL","height":96.6,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"B","antennaTech":null,"antennaUseId":null,"azimuthDeg":60,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"3b94414d-ae62-4567-8738-20ed07978830","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e887e758-4b85-4bbb-8394-fe96f9772bea","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNHH-1D65C","type":"PANEL","height":96.6,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":102,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"B","antennaTech":null,"antennaUseId":null,"azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":104.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"458c9822-64d3-489f-8005-dee0a4ecea5e","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7ad4b3df-ff1b-42ac-934c-78ae1c850ebb","group":"ANTENNA","manufacture":"COMMSCOPE","model":"JAHH-65C-R3B","type":"PANEL","height":95.7,"width":13.8,"depth":8.2,"weight":93.9},"structureId":"A","mountLevel":102,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"D","antennaTech":null,"antennaUseId":null,"azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":104.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"6abf8d17-60e6-41fd-bb9f-8396580d6a7a","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"dcb2e624-bee7-4cf8-8d1a-40d129a0ebeb","group":"ANTENNA","manufacture":"EMPTY","model":"EMPTY_MOUNT","type":"PANEL","height":0.0,"width":0.0,"depth":0.0,"weight":0.0},"structureId":"A","mountLevel":173,"antennaLegFaceTypeLookupCode":"FaceB","antennaPosition":"B","antennaTech":"Analog","antennaUseId":"D","azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":173.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"70e8c1e5-e3a7-4100-a761-9a42f22b85a6","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"f2c45155-0087-49e8-85f3-a9ab5e2c22b3","group":"ANTENNA","manufacture":"SAMSUNG TELECOMMUNICATIONS","model":"M-MIMO AAU","type":"PANEL","height":41.34,"width":19.7,"depth":5.5,"weight":143.3},"structureId":"A","mountLevel":72,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"B","antennaTech":null,"antennaUseId":null,"azimuthDeg":70,"azimuthType":"T","orientation":"M","zcenter":75.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"79a1d454-b0f2-4899-bdc8-e03654595460","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7ad4b3df-ff1b-42ac-934c-78ae1c850ebb","group":"ANTENNA","manufacture":"COMMSCOPE","model":"JAHH-65C-R3B","type":"PANEL","height":95.7,"width":13.8,"depth":8.2,"weight":93.9},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"C","antennaTech":null,"antennaUseId":null,"azimuthDeg":60,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"7a6d668a-51fc-436d-ac52-429cb758adbf","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"39b00ef7-9c35-445d-a58f-6fb3b066cacd","group":"ANTENNA","manufacture":"ANDREW","model":"TMBXX-6517-A2M","type":"PANEL","height":74.9,"width":12.0,"depth":6.5,"weight":44.4},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"I","antennaTech":null,"antennaUseId":null,"azimuthDeg":240,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"7c8cb73b-8094-433d-b3f8-64d2433a70de","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e2814260-6495-4061-a16d-ee5cedb3c9e2","group":"ANTENNA","manufacture":"KMW COMMUNICATIONS","model":"ET-X-TU-42-15-37-18-IR-RA","type":"PANEL","height":48.0,"width":18.1,"depth":7.1,"weight":50.0},"structureId":"A","mountLevel":72,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"A","antennaTech":null,"antennaUseId":null,"azimuthDeg":70,"azimuthType":"T","orientation":"M","zcenter":75.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"7fc067ef-44b7-4a7e-829a-bf537a769668","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"3957b921-a89a-4665-a30f-97090709ed8a","group":"ANTENNA","manufacture":"KMW COMMUNICATIONS","model":"ET-X-TS-70-15-62-18-IR-RC","type":"PANEL","height":72.0,"width":12.0,"depth":5.9,"weight":39.68},"structureId":"A","mountLevel":72,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"E","antennaTech":null,"antennaUseId":null,"azimuthDeg":180,"azimuthType":"T","orientation":"M","zcenter":75.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"8985e135-646e-40b6-b63a-ccaf5b937981","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7ad4b3df-ff1b-42ac-934c-78ae1c850ebb","group":"ANTENNA","manufacture":"COMMSCOPE","model":"JAHH-65C-R3B","type":"PANEL","height":95.7,"width":13.8,"depth":8.2,"weight":93.9},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"D","antennaTech":null,"antennaUseId":null,"azimuthDeg":60,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"97a94714-f48d-408a-ac0b-1437e14cc423","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"39b00ef7-9c35-445d-a58f-6fb3b066cacd","group":"ANTENNA","manufacture":"ANDREW","model":"TMBXX-6517-A2M","type":"PANEL","height":74.9,"width":12.0,"depth":6.5,"weight":44.4},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"L","antennaTech":null,"antennaUseId":null,"azimuthDeg":240,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"a8942a42-7c72-4022-a1a2-671dac23a565","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"75fe4a00-1b4a-4678-93d2-0f696bb2d9ff","group":"ANTENNA","manufacture":"COMSAT RSI","model":"HP-170B72L-S","type":"MICROWAVE/SHROUD","height":72.0,"width":72.0,"depth":13.0,"weight":128.0},"structureId":"A","mountLevel":164,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"A","antennaTech":"MW Link","antennaUseId":"D","azimuthDeg":100,"azimuthType":"T","orientation":"M","zcenter":165.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"b1361594-e83c-45a4-8a9a-3355f8adb140","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e887e758-4b85-4bbb-8394-fe96f9772bea","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNHH-1D65C","type":"PANEL","height":96.6,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"F","antennaTech":null,"antennaUseId":null,"azimuthDeg":300,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"b5b5ea6b-06e3-41b8-bab7-983208a53e45","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"16164e9a-600f-440a-9824-1dcb6786ce55","group":"ANTENNA","manufacture":"ANDREW","model":"HP2-102","type":"MICROWAVE/SHROUD","height":24.0,"width":24.0,"depth":21.0,"weight":25.0},"structureId":"A","mountLevel":60,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"A","antennaTech":"MW Link","antennaUseId":"D","azimuthDeg":160,"azimuthType":"T","orientation":"M","zcenter":60.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"b6b50234-b3a8-436b-9732-1d978e9406cf","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7d3c07d4-9cda-4fe4-b95a-142817975fc1","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNH-1D65C","type":"PANEL","height":96.5,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"K","antennaTech":null,"antennaUseId":null,"azimuthDeg":240,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"bd8b1e81-6765-442d-823b-0c45439395ee","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"39b00ef7-9c35-445d-a58f-6fb3b066cacd","group":"ANTENNA","manufacture":"ANDREW","model":"TMBXX-6517-A2M","type":"PANEL","height":74.9,"width":12.0,"depth":6.5,"weight":44.4},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"D","antennaTech":null,"antennaUseId":null,"azimuthDeg":0,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"c97e2928-9ab3-4aef-b7cd-26dbbbcaf15e","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"dcb2e624-bee7-4cf8-8d1a-40d129a0ebeb","group":"ANTENNA","manufacture":"EMPTY","model":"EMPTY_MOUNT","type":"PANEL","height":0.0,"width":0.0,"depth":0.0,"weight":0.0},"structureId":"A","mountLevel":173,"antennaLegFaceTypeLookupCode":"FaceA","antennaPosition":"A","antennaTech":"Analog","antennaUseId":"D","azimuthDeg":60,"azimuthType":"T","orientation":"M","zcenter":173.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"ca731984-a953-4290-9df4-df5140fa17a5","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"e887e758-4b85-4bbb-8394-fe96f9772bea","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNHH-1D65C","type":"PANEL","height":96.6,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":147,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"E","antennaTech":null,"antennaUseId":null,"azimuthDeg":300,"azimuthType":"T","orientation":"M","zcenter":149.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"cb95d588-962e-4804-b9f5-bc79e51959e2","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"39b00ef7-9c35-445d-a58f-6fb3b066cacd","group":"ANTENNA","manufacture":"ANDREW","model":"TMBXX-6517-A2M","type":"PANEL","height":74.9,"width":12.0,"depth":6.5,"weight":44.4},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"A","antennaTech":null,"antennaUseId":null,"azimuthDeg":0,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"cf2a51b3-c758-46d6-b3f8-006f3ccb365c","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"3957b921-a89a-4665-a30f-97090709ed8a","group":"ANTENNA","manufacture":"KMW COMMUNICATIONS","model":"ET-X-TS-70-15-62-18-IR-RC","type":"PANEL","height":72.0,"width":12.0,"depth":5.9,"weight":39.68},"structureId":"A","mountLevel":72,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"I","antennaTech":null,"antennaUseId":null,"azimuthDeg":260,"azimuthType":"T","orientation":"M","zcenter":75.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"d303d393-a0f5-4377-8f2c-6916a0de2a8b","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"dcb2e624-bee7-4cf8-8d1a-40d129a0ebeb","group":"ANTENNA","manufacture":"EMPTY","model":"EMPTY_MOUNT","type":"PANEL","height":0.0,"width":0.0,"depth":0.0,"weight":0.0},"structureId":"A","mountLevel":173,"antennaLegFaceTypeLookupCode":"FaceC","antennaPosition":"C","antennaTech":"Analog","antennaUseId":"D","azimuthDeg":300,"azimuthType":"T","orientation":"M","zcenter":173.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"d4607ec7-f60f-496e-8837-84afaf65b738","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"96483170-c54e-4b5e-a34c-fc3ffda470e3","group":"ANTENNA","manufacture":"RAYCAP","model":"TME-RNSNDC-7771-PF-48","type":"RRU","height":20.38,"width":18.86,"depth":5.83,"weight":19.0},"structureId":"A","mountLevel":118,"antennaLegFaceTypeLookupCode":"LegA","antennaPosition":"A","antennaTech":null,"antennaUseId":null,"azimuthDeg":0,"azimuthType":"T","orientation":"M","zcenter":118.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"dd65e3e7-be45-4a6a-ad48-82b794408fe8","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"39b00ef7-9c35-445d-a58f-6fb3b066cacd","group":"ANTENNA","manufacture":"ANDREW","model":"TMBXX-6517-A2M","type":"PANEL","height":74.9,"width":12.0,"depth":6.5,"weight":44.4},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"E","antennaTech":null,"antennaUseId":null,"azimuthDeg":120,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"e30d0750-a211-4d27-a8cb-da70a5ae5c6e","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"7d3c07d4-9cda-4fe4-b95a-142817975fc1","group":"ANTENNA","manufacture":"COMMSCOPE","model":"SBNH-1D65C","type":"PANEL","height":96.5,"width":11.9,"depth":7.1,"weight":49.6},"structureId":"A","mountLevel":114,"antennaLegFaceTypeLookupCode":"LegB","antennaPosition":"G","antennaTech":null,"antennaUseId":null,"azimuthDeg":120,"azimuthType":"T","orientation":"M","zcenter":115.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null},{"id":"e4b70d40-7bf3-4d8f-a64a-4a0e42425b1a","busUnit":839921,"towerId":"02b49cfc-c62c-44f9-872a-1f0cf6d23747","equipment":{"id":"f2c45155-0087-49e8-85f3-a9ab5e2c22b3","group":"ANTENNA","manufacture":"SAMSUNG TELECOMMUNICATIONS","model":"M-MIMO AAU","type":"PANEL","height":41.34,"width":19.7,"depth":5.5,"weight":143.3},"structureId":"A","mountLevel":72,"antennaLegFaceTypeLookupCode":"LegC","antennaPosition":"J","antennaTech":null,"antennaUseId":null,"azimuthDeg":260,"azimuthType":"T","orientation":"M","zcenter":75.0,"zcenterUm":"FT","zlower":null,"zlowerUm":null,"zupper":null,"zupperUm":null}];
}

export default TowerViewer;