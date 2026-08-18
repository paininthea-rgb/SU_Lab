'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { CanvasAction, SketchShape, Tool } from '@/types/sketch';

type Props = {
  activeTool: Tool;
  shapes: SketchShape[];
  actionRequest?: { id: number; type: CanvasAction } | null;
  onShapesChange?: (shapes: SketchShape[]) => void;
};

type InternalShape = {
  id: string;
  type: SketchShape['type'];
  points: THREE.Vector3[];
  selected: boolean;
  grouped?: string;
  meta?: SketchShape['meta'];
};

const DEFAULT_COLOR = 0xffffff;
const SELECTED_COLOR = 0xfacc15;
const EXTRUSION_COLOR = 0x60a5fa;
const OFFSET_DISTANCE = 1;

export default function SketchCanvas({ activeTool, shapes, actionRequest, onShapesChange }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const activeToolRef = useRef<Tool>(activeTool);
  const orbitRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const panRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const moveRef = useRef<{ active: boolean; lastPoint: THREE.Vector3 | null }>({ active: false, lastPoint: null });
  const sphericalRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 24 });
  const drawingRef = useRef<{ points: THREE.Vector3[]; preview: THREE.Object3D | null }>({ points: [], preview: null });
  const shapesRef = useRef<InternalShape[]>([]);
  const objectMapRef = useRef(new Map<string, THREE.Object3D>());
  const latestActionIdRef = useRef<number>(0);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const labelSpritesRef = useRef<THREE.Sprite[]>([]);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const toSerializable = useCallback(
    (nextShapes: InternalShape[]): SketchShape[] =>
      nextShapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        points: shape.points.map((point) => ({ x: point.x, y: point.y, z: point.z })),
        selected: shape.selected,
        grouped: shape.grouped,
        meta: shape.meta,
      })),
    [],
  );

  const emitShapes = useCallback(() => {
    onShapesChange?.(toSerializable(shapesRef.current));
  }, [onShapesChange, toSerializable]);

  const fromSerializable = useCallback(
    (nextShapes: SketchShape[]): InternalShape[] =>
      nextShapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        points: shape.points.map((point) => new THREE.Vector3(point.x, point.y, point.z)),
        selected: shape.selected,
        grouped: shape.grouped,
        meta: shape.meta,
      })),
    [],
  );

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;

    const { theta, phi, radius } = sphericalRef.current;
    const target = targetRef.current;

    cameraRef.current.position.set(
      target.x + radius * Math.sin(phi) * Math.cos(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.sin(theta),
    );
    cameraRef.current.lookAt(target);
  }, []);

  const getGroundPoint = useCallback((clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current) return null;

    const rect = mountRef.current.getBoundingClientRect();
    pointerRef.current.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
    const point = new THREE.Vector3();

    return raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, point) ? point : null;
  }, []);

  const getWorldHit = useCallback((clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current) return null;

    const rect = mountRef.current.getBoundingClientRect();
    pointerRef.current.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycasterRef.current.params.Line = { threshold: 0.35 };
    raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);

    const hits = raycasterRef.current.intersectObjects(Array.from(objectMapRef.current.values()), true);

    return hits[0] ?? null;
  }, []);

  const createLineMesh = useCallback((p1: THREE.Vector3, p2: THREE.Vector3, color = DEFAULT_COLOR) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([p1.clone(), p2.clone()]);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
  }, []);

  const createCircleMesh = useCallback((center: THREE.Vector3, radius: number, color = DEFAULT_COLOR) => {
    const points: THREE.Vector3[] = [];

    for (let index = 0; index <= 64; index += 1) {
      const angle = (index / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(center.x + Math.cos(angle) * radius, center.y, center.z + Math.sin(angle) * radius),
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
  }, []);

  const createRectangleMesh = useCallback((p1: THREE.Vector3, p2: THREE.Vector3, color = DEFAULT_COLOR) => {
    const corners = [
      new THREE.Vector3(p1.x, 0, p1.z),
      new THREE.Vector3(p2.x, 0, p1.z),
      new THREE.Vector3(p2.x, 0, p2.z),
      new THREE.Vector3(p1.x, 0, p2.z),
      new THREE.Vector3(p1.x, 0, p1.z),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(corners);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
  }, []);

  const createArcMesh = useCallback(
    (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, color = DEFAULT_COLOR) => {
      const center = new THREE.Vector3((p1.x + p2.x) / 2, 0, (p1.z + p2.z) / 2);
      const radius = Math.max(p3.distanceTo(center), 0.01);
      const startAngle = Math.atan2(p1.z - center.z, p1.x - center.x);
      let endAngle = Math.atan2(p2.z - center.z, p2.x - center.x);
      const throughAngle = Math.atan2(p3.z - center.z, p3.x - center.x);

      const normalizeAngle = (angle: number) => {
        let nextAngle = angle;
        while (nextAngle < 0) nextAngle += Math.PI * 2;
        while (nextAngle >= Math.PI * 2) nextAngle -= Math.PI * 2;
        return nextAngle;
      };

      const start = normalizeAngle(startAngle);
      const end = normalizeAngle(endAngle);
      const through = normalizeAngle(throughAngle);

      const isBetween = (value: number, startValue: number, endValue: number) => {
        if (startValue <= endValue) {
          return value >= startValue && value <= endValue;
        }
        return value >= startValue || value <= endValue;
      };

      if (!isBetween(through, start, end)) {
        endAngle += endAngle > startAngle ? -Math.PI * 2 : Math.PI * 2;
      }

      const points: THREE.Vector3[] = [];
      const steps = 48;

      for (let index = 0; index <= steps; index += 1) {
        const angle = startAngle + ((endAngle - startAngle) * index) / steps;
        points.push(new THREE.Vector3(center.x + Math.cos(angle) * radius, 0, center.z + Math.sin(angle) * radius));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color });
      return new THREE.Line(geometry, material);
    },
    [],
  );

  const createExtrusionMesh = useCallback((shape: InternalShape, color = EXTRUSION_COLOR) => {
    const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.75 });
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xe2e8f0 });
    const group = new THREE.Group();
    const height = shape.meta?.height ?? 2;

    if (shape.points.length < 2) {
      return group;
    }

    if (shape.points.length === 2) {
      const [a, b] = shape.points;
      const width = Math.max(Math.abs(b.x - a.x), 0.1);
      const depth = Math.max(Math.abs(b.z - a.z), 0.1);
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((a.x + b.x) / 2, height / 2, (a.z + b.z) / 2);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgesMaterial);
      edges.position.copy(mesh.position);
      group.add(mesh, edges);
      return group;
    }

    const center = shape.points[0];
    const radius = Math.max(center.distanceTo(shape.points[1]), 0.1);
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 48, 1, false);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(center.x, height / 2, center.z);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgesMaterial);
    edges.position.copy(mesh.position);
    group.add(mesh, edges);
    return group;
  }, []);

  const createObjectForShape = useCallback(
    (shape: InternalShape) => {
      const color = shape.selected
        ? SELECTED_COLOR
        : shape.type === 'extrusion'
          ? EXTRUSION_COLOR
          : DEFAULT_COLOR;

      switch (shape.type) {
        case 'line':
          return createLineMesh(shape.points[0], shape.points[1], color);
        case 'circle':
          return createCircleMesh(shape.points[0], shape.points[0].distanceTo(shape.points[1]), color);
        case 'rectangle':
          return createRectangleMesh(shape.points[0], shape.points[1], color);
        case 'arc':
          return createArcMesh(shape.points[0], shape.points[1], shape.points[2], color);
        case 'extrusion':
          return createExtrusionMesh(shape, color);
        default:
          return new THREE.Group();
      }
    },
    [createArcMesh, createCircleMesh, createExtrusionMesh, createLineMesh, createRectangleMesh],
  );

  const clearRenderedShapes = useCallback(() => {
    if (!sceneRef.current) return;

    objectMapRef.current.forEach((object) => {
      sceneRef.current?.remove(object);
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry | undefined;
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        geometry?.dispose?.();
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material?.dispose?.();
        }
      });
    });
    objectMapRef.current.clear();
  }, []);

  const renderShapes = useCallback(() => {
    if (!sceneRef.current) return;

    clearRenderedShapes();

    shapesRef.current.forEach((shape) => {
      const object = createObjectForShape(shape);
      object.userData.shapeId = shape.id;
      sceneRef.current?.add(object);
      objectMapRef.current.set(shape.id, object);
    });
  }, [clearRenderedShapes, createObjectForShape]);

  const setShapes = useCallback(
    (nextShapes: InternalShape[], shouldEmit = true) => {
      shapesRef.current = nextShapes;
      renderShapes();
      if (shouldEmit) {
        emitShapes();
      }
    },
    [emitShapes, renderShapes],
  );

  const clearPreview = useCallback(() => {
    if (drawingRef.current.preview && sceneRef.current) {
      sceneRef.current.remove(drawingRef.current.preview);
    }
    drawingRef.current.preview = null;
  }, []);

  const resetDrawing = useCallback(() => {
    clearPreview();
    drawingRef.current.points = [];
  }, [clearPreview]);

  const updateSelection = useCallback(
    (shapeId: string | null, additive = false) => {
      const nextShapes = shapesRef.current.map((shape) => {
        if (!additive) {
          return { ...shape, selected: shape.id === shapeId };
        }
        if (shape.id === shapeId) {
          return { ...shape, selected: !shape.selected };
        }
        return shape;
      });

      setShapes(nextShapes);
    },
    [setShapes],
  );

  const translateSelectedShapes = useCallback((delta: THREE.Vector3) => {
    const nextShapes = shapesRef.current.map((shape) => {
      if (!shape.selected) return shape;
      return {
        ...shape,
        points: shape.points.map((point) => point.clone().add(delta)),
      };
    });

    shapesRef.current = nextShapes;
    renderShapes();
  }, [renderShapes]);

  const buildOffsetShape = useCallback((shape: InternalShape): InternalShape | null => {
    if (shape.type === 'line') {
      const [a, b] = shape.points;
      const direction = new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize();
      const normal = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(OFFSET_DISTANCE);
      return {
        ...shape,
        id: crypto.randomUUID(),
        selected: false,
        points: shape.points.map((point) => point.clone().add(normal)),
        meta: { ...shape.meta, offsetDistance: OFFSET_DISTANCE, sourceId: shape.id },
      };
    }

    if (shape.type === 'circle') {
      const [center, edge] = shape.points;
      const radius = center.distanceTo(edge) + OFFSET_DISTANCE;
      return {
        ...shape,
        id: crypto.randomUUID(),
        selected: false,
        points: [center.clone(), new THREE.Vector3(center.x + radius, 0, center.z)],
        meta: { ...shape.meta, offsetDistance: OFFSET_DISTANCE, sourceId: shape.id },
      };
    }

    if (shape.type === 'rectangle') {
      const [a, b] = shape.points;
      const center = new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
      const expandPoint = (point: THREE.Vector3) =>
        new THREE.Vector3(
          point.x < center.x ? point.x - OFFSET_DISTANCE : point.x + OFFSET_DISTANCE,
          0,
          point.z < center.z ? point.z - OFFSET_DISTANCE : point.z + OFFSET_DISTANCE,
        );
      return {
        ...shape,
        id: crypto.randomUUID(),
        selected: false,
        points: [expandPoint(a), expandPoint(b)],
        meta: { ...shape.meta, offsetDistance: OFFSET_DISTANCE, sourceId: shape.id },
      };
    }

    if (shape.type === 'arc') {
      const center = new THREE.Vector3((shape.points[0].x + shape.points[1].x) / 2, 0, (shape.points[0].z + shape.points[1].z) / 2);
      const expand = (point: THREE.Vector3) =>
        point
          .clone()
          .sub(center)
          .setLength(point.clone().sub(center).length() + OFFSET_DISTANCE)
          .add(center);
      return {
        ...shape,
        id: crypto.randomUUID(),
        selected: false,
        points: shape.points.map(expand),
        meta: { ...shape.meta, offsetDistance: OFFSET_DISTANCE, sourceId: shape.id },
      };
    }

    return null;
  }, []);

  const buildMirroredShape = useCallback((shape: InternalShape): InternalShape => ({
    ...shape,
    id: crypto.randomUUID(),
    selected: false,
    points: shape.points.map((point) => new THREE.Vector3(-point.x, point.y, point.z)),
    meta: { ...shape.meta, mirroredAxis: 'z', sourceId: shape.id },
  }), []);

  const buildExtrusionShape = useCallback((shape: InternalShape): InternalShape | null => {
    if (!['rectangle', 'circle'].includes(shape.type)) {
      return null;
    }

    return {
      id: crypto.randomUUID(),
      type: 'extrusion',
      points: shape.points.map((point) => point.clone()),
      selected: false,
      grouped: shape.grouped,
      meta: { height: 2, sourceId: shape.id },
    };
  }, []);

  const applyCanvasAction = useCallback(
    (action: CanvasAction) => {
      if (action === 'delete-selected') {
        setShapes(shapesRef.current.filter((shape) => !shape.selected));
        return;
      }

      if (action === 'clear-all') {
        resetDrawing();
        setShapes([]);
        return;
      }

      if (action === 'group') {
        const selectedShapes = shapesRef.current.filter((shape) => shape.selected);
        if (selectedShapes.length < 2) return;
        const groupId = crypto.randomUUID();
        setShapes(
          shapesRef.current.map((shape) =>
            shape.selected ? { ...shape, grouped: groupId } : shape,
          ),
        );
        return;
      }

      if (action === 'offset') {
        const offsets = shapesRef.current.filter((shape) => shape.selected).map(buildOffsetShape).filter(Boolean) as InternalShape[];
        if (offsets.length === 0) return;
        setShapes([...shapesRef.current, ...offsets]);
        return;
      }

      if (action === 'mirror') {
        const mirrored = shapesRef.current.filter((shape) => shape.selected).map(buildMirroredShape);
        if (mirrored.length === 0) return;
        setShapes([...shapesRef.current, ...mirrored]);
        return;
      }

      if (action === 'pushPull') {
        const extrusions = shapesRef.current.filter((shape) => shape.selected).map(buildExtrusionShape).filter(Boolean) as InternalShape[];
        if (extrusions.length === 0) return;
        setShapes([...shapesRef.current, ...extrusions]);
      }
    },
    [buildExtrusionShape, buildMirroredShape, buildOffsetShape, resetDrawing, setShapes],
  );

  useEffect(() => {
    if (!actionRequest || actionRequest.id === latestActionIdRef.current) return;
    latestActionIdRef.current = actionRequest.id;
    applyCanvasAction(actionRequest.type);
  }, [actionRequest, applyCanvasAction]);

  useEffect(() => {
    if (!sceneRef.current) return;
    setShapes(fromSerializable(shapes), false);
  }, [fromSerializable, setShapes, shapes]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const grid = new THREE.GridHelper(80, 80, 0x4b5563, 0x374151);
    scene.add(grid);

    const axes = new THREE.AxesHelper(6);
    scene.add(axes);

    const recolorAxis = (geometry: THREE.BufferGeometry) => {
      const colors: number[] = [];
      const source = [
        new THREE.Color(0xff0000),
        new THREE.Color(0xff0000),
        new THREE.Color(0x00ff00),
        new THREE.Color(0x00ff00),
        new THREE.Color(0x0000ff),
        new THREE.Color(0x0000ff),
      ];
      source.forEach((color) => colors.push(color.r, color.g, color.b));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    };

    recolorAxis(axes.geometry as THREE.BufferGeometry);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(10, 18, 8);
    scene.add(ambient, directional);

    const label = (text: string, position: THREE.Vector3, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = color;
      context.font = 'bold 48px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 48, 48);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }),
      );
      sprite.position.copy(position);
      sprite.scale.set(1, 1, 1);
      labelSpritesRef.current.push(sprite);
      scene.add(sprite);
    };

    label('X', new THREE.Vector3(6.8, 0, 0), '#ef4444');
    label('Y', new THREE.Vector3(0, 6.8, 0), '#22c55e');
    label('Z', new THREE.Vector3(0, 0, 6.8), '#3b82f6');

    const animate = () => {
      animationFrameRef.current = window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / Math.max(height, 1);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    renderShapes();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameRef.current);
      clearRenderedShapes();
      clearPreview();
      labelSpritesRef.current.forEach((sprite) => {
        scene.remove(sprite);
        const material = sprite.material as THREE.SpriteMaterial;
        material.map?.dispose();
        material.dispose();
      });
      labelSpritesRef.current = [];
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [clearPreview, clearRenderedShapes, renderShapes, updateCameraPosition]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const updatePreview = (point: THREE.Vector3) => {
      clearPreview();
      const { points } = drawingRef.current;
      const tool = activeToolRef.current;
      let preview: THREE.Object3D | null = null;

      if (tool === 'line' && points.length === 1) {
        preview = createLineMesh(points[0], point, 0x38bdf8);
      } else if (tool === 'circle' && points.length === 1) {
        preview = createCircleMesh(points[0], points[0].distanceTo(point), 0x38bdf8);
      } else if (tool === 'rectangle' && points.length === 1) {
        preview = createRectangleMesh(points[0], point, 0x38bdf8);
      } else if (tool === 'arc' && points.length === 1) {
        preview = createLineMesh(points[0], point, 0x38bdf8);
      } else if (tool === 'arc' && points.length === 2) {
        preview = createArcMesh(points[0], points[1], point, 0x38bdf8);
      }

      if (preview && sceneRef.current) {
        drawingRef.current.preview = preview;
        sceneRef.current.add(preview);
      }
    };

    const completeShape = (tool: Tool) => {
      const points = drawingRef.current.points.map((point) => point.clone());
      let type: InternalShape['type'] | null = null;
      let requiredPoints = 0;

      if (tool === 'line') {
        type = 'line';
        requiredPoints = 2;
      } else if (tool === 'circle') {
        type = 'circle';
        requiredPoints = 2;
      } else if (tool === 'rectangle') {
        type = 'rectangle';
        requiredPoints = 2;
      } else if (tool === 'arc') {
        type = 'arc';
        requiredPoints = 3;
      }

      if (!type || points.length !== requiredPoints) return;

      setShapes([
        ...shapesRef.current,
        {
          id: crypto.randomUUID(),
          type,
          points,
          selected: false,
        },
      ]);
      resetDrawing();
    };

    const handleMouseDown = (event: MouseEvent) => {
      const tool = activeToolRef.current;

      if (event.button === 1) {
        event.preventDefault();
        if (event.shiftKey) {
          panRef.current = { active: true, lastX: event.clientX, lastY: event.clientY };
        } else {
          orbitRef.current = { active: true, lastX: event.clientX, lastY: event.clientY };
        }
        return;
      }

      if (event.button !== 0) return;

      if (tool === 'select') {
        const hit = getWorldHit(event.clientX, event.clientY);
        updateSelection((hit?.object.userData.shapeId as string | undefined) ?? null, event.shiftKey);
        return;
      }

      if (tool === 'move') {
        const hit = getWorldHit(event.clientX, event.clientY);
        if (hit?.object.userData.shapeId) {
          const hitId = hit.object.userData.shapeId as string;
          if (!shapesRef.current.some((shape) => shape.id === hitId && shape.selected)) {
            updateSelection(hitId, false);
          }
          const point = getGroundPoint(event.clientX, event.clientY);
          moveRef.current = { active: true, lastPoint: point };
        }
        return;
      }

      const point = getGroundPoint(event.clientX, event.clientY);
      if (!point) return;
      drawingRef.current.points.push(point.clone());
      updatePreview(point);
      completeShape(tool);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (orbitRef.current.active) {
        const dx = event.clientX - orbitRef.current.lastX;
        const dy = event.clientY - orbitRef.current.lastY;
        orbitRef.current.lastX = event.clientX;
        orbitRef.current.lastY = event.clientY;
        sphericalRef.current.theta -= dx * 0.01;
        sphericalRef.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, sphericalRef.current.phi + dy * 0.01));
        updateCameraPosition();
        return;
      }

      if (panRef.current.active && cameraRef.current) {
        const dx = event.clientX - panRef.current.lastX;
        const dy = event.clientY - panRef.current.lastY;
        panRef.current.lastX = event.clientX;
        panRef.current.lastY = event.clientY;

        const camera = cameraRef.current;
        const viewDirection = new THREE.Vector3();
        camera.getWorldDirection(viewDirection);
        const right = new THREE.Vector3().crossVectors(viewDirection, camera.up).normalize();
        const up = camera.up.clone().normalize();
        const panScale = sphericalRef.current.radius * 0.0025;
        const delta = right.multiplyScalar(-dx * panScale).add(up.multiplyScalar(dy * panScale));
        targetRef.current.add(delta);
        updateCameraPosition();
        return;
      }

      if (moveRef.current.active) {
        const point = getGroundPoint(event.clientX, event.clientY);
        if (!point || !moveRef.current.lastPoint) return;
        const delta = point.clone().sub(moveRef.current.lastPoint);
        moveRef.current.lastPoint = point;
        translateSelectedShapes(delta);
        return;
      }

      if (['line', 'circle', 'rectangle', 'arc'].includes(activeToolRef.current)) {
        const point = getGroundPoint(event.clientX, event.clientY);
        if (!point || drawingRef.current.points.length === 0) return;
        updatePreview(point);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 1) {
        orbitRef.current.active = false;
        panRef.current.active = false;
      }

      if (event.button === 0 && moveRef.current.active) {
        moveRef.current = { active: false, lastPoint: null };
        emitShapes();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      sphericalRef.current.radius = Math.max(3, Math.min(120, sphericalRef.current.radius + event.deltaY * 0.03));
      updateCameraPosition();
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    mount.addEventListener('mousedown', handleMouseDown);
    mount.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    mount.addEventListener('wheel', handleWheel, { passive: false });
    mount.addEventListener('contextmenu', handleContextMenu);

    return () => {
      mount.removeEventListener('mousedown', handleMouseDown);
      mount.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('wheel', handleWheel);
      mount.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    clearPreview,
    createArcMesh,
    createCircleMesh,
    createLineMesh,
    createRectangleMesh,
    emitShapes,
    getGroundPoint,
    getWorldHit,
    resetDrawing,
    setShapes,
    translateSelectedShapes,
    updateCameraPosition,
    updateSelection,
  ]);

  const cursor = useMemo(() => (activeTool === 'select' ? 'default' : activeTool === 'move' ? 'grab' : 'crosshair'), [activeTool]);

  return <div ref={mountRef} className="h-full w-full" style={{ cursor }} />;
}
