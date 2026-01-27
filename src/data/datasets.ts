import { Dataset, FilterOptions } from "@/types/dataset";

export const datasets: Dataset[] = [
  {
    id: "embodied-navigation-v1",
    name: "Embodied Navigation Dataset",
    author: "robotics-lab",
    description: "A large-scale dataset for embodied navigation tasks, containing RGB-D images, semantic maps, and trajectory annotations from simulated indoor environments.",
    tags: ["robotics", "navigation", "embodied-ai", "simulation"],
    downloads: 15420,
    likes: 342,
    updatedAt: "2026-01-15",
    size: "45.2 GB",
    format: "parquet",
    license: "Apache 2.0",
    task: "Embodied Navigation",
    rows: 1250000,
    splits: [
      { name: "train", rows: 1000000 },
      { name: "validation", rows: 125000 },
      { name: "test", rows: 125000 }
    ],
    features: [
      { name: "image_rgb", type: "Image" },
      { name: "image_depth", type: "Image" },
      { name: "semantic_map", type: "Array2D" },
      { name: "action", type: "ClassLabel" },
      { name: "position", type: "Sequence[float]" }
    ],
    previewData: [
      { id: 1, action: "forward", position: "[1.2, 3.4, 0.0]", episode: "ep_001" },
      { id: 2, action: "turn_left", position: "[1.2, 3.4, 0.5]", episode: "ep_001" },
      { id: 3, action: "forward", position: "[1.5, 3.4, 0.5]", episode: "ep_001" }
    ]
  },
  {
    id: "manipulation-grasp-2024",
    name: "Robotic Manipulation Grasping",
    author: "grasp-research",
    description: "Comprehensive dataset for robotic grasping and manipulation, featuring point clouds, grasp poses, and success labels across diverse objects.",
    tags: ["manipulation", "grasping", "point-cloud", "robotics"],
    downloads: 8932,
    likes: 256,
    updatedAt: "2026-01-10",
    size: "28.7 GB",
    format: "hdf5",
    license: "MIT",
    task: "Manipulation",
    rows: 850000,
    splits: [
      { name: "train", rows: 680000 },
      { name: "validation", rows: 85000 },
      { name: "test", rows: 85000 }
    ],
    features: [
      { name: "point_cloud", type: "Array3D" },
      { name: "grasp_pose", type: "Sequence[float]" },
      { name: "success", type: "bool" },
      { name: "object_class", type: "ClassLabel" }
    ],
    previewData: [
      { id: 1, object_class: "mug", success: true, grasp_quality: 0.92 },
      { id: 2, object_class: "bottle", success: true, grasp_quality: 0.88 },
      { id: 3, object_class: "box", success: false, grasp_quality: 0.34 }
    ]
  },
  {
    id: "humanoid-motion-capture",
    name: "Humanoid Motion Capture Dataset",
    author: "motion-ai",
    description: "High-quality motion capture data for humanoid robot learning, includes full-body joint angles, velocities, and contact forces.",
    tags: ["motion-capture", "humanoid", "locomotion", "imitation-learning"],
    downloads: 12105,
    likes: 489,
    updatedAt: "2026-01-20",
    size: "12.3 GB",
    format: "json",
    license: "CC-BY-4.0",
    task: "Locomotion",
    rows: 2400000,
    splits: [
      { name: "train", rows: 2000000 },
      { name: "validation", rows: 200000 },
      { name: "test", rows: 200000 }
    ],
    features: [
      { name: "joint_positions", type: "Sequence[float]" },
      { name: "joint_velocities", type: "Sequence[float]" },
      { name: "contact_forces", type: "Sequence[float]" },
      { name: "motion_type", type: "ClassLabel" }
    ],
    previewData: [
      { id: 1, motion_type: "walking", frame: 0, duration_sec: 2.5 },
      { id: 2, motion_type: "running", frame: 0, duration_sec: 1.8 },
      { id: 3, motion_type: "jumping", frame: 0, duration_sec: 0.9 }
    ]
  },
  {
    id: "indoor-scene-understanding",
    name: "Indoor Scene Understanding",
    author: "scene-lab",
    description: "Multi-modal indoor scene dataset with 3D reconstructions, semantic labels, instance segmentation, and object relationships.",
    tags: ["scene-understanding", "3d-reconstruction", "segmentation", "indoor"],
    downloads: 21340,
    likes: 612,
    updatedAt: "2026-01-18",
    size: "78.5 GB",
    format: "parquet",
    license: "Apache 2.0",
    task: "Scene Understanding",
    rows: 450000,
    splits: [
      { name: "train", rows: 360000 },
      { name: "validation", rows: 45000 },
      { name: "test", rows: 45000 }
    ],
    features: [
      { name: "rgb_image", type: "Image" },
      { name: "depth_image", type: "Image" },
      { name: "semantic_mask", type: "Image" },
      { name: "instance_mask", type: "Image" },
      { name: "scene_graph", type: "JSON" }
    ],
    previewData: [
      { id: 1, scene_type: "living_room", num_objects: 24, area_sqm: 28.5 },
      { id: 2, scene_type: "kitchen", num_objects: 31, area_sqm: 15.2 },
      { id: 3, scene_type: "bedroom", num_objects: 18, area_sqm: 22.0 }
    ]
  },
  {
    id: "task-instruction-following",
    name: "Task Instruction Following",
    author: "nlp-robotics",
    description: "Natural language instructions paired with robot action sequences for instruction-following agents in household environments.",
    tags: ["instruction-following", "nlp", "embodied-ai", "household"],
    downloads: 9876,
    likes: 378,
    updatedAt: "2026-01-12",
    size: "5.8 GB",
    format: "json",
    license: "MIT",
    task: "Instruction Following",
    language: "English",
    rows: 180000,
    splits: [
      { name: "train", rows: 144000 },
      { name: "validation", rows: 18000 },
      { name: "test", rows: 18000 }
    ],
    features: [
      { name: "instruction", type: "string" },
      { name: "action_sequence", type: "Sequence[string]" },
      { name: "scene_id", type: "string" },
      { name: "success", type: "bool" }
    ],
    previewData: [
      { id: 1, instruction: "Pick up the red cup from the table", num_actions: 5, success: true },
      { id: 2, instruction: "Navigate to the kitchen and open the fridge", num_actions: 12, success: true },
      { id: 3, instruction: "Find the remote control on the sofa", num_actions: 8, success: false }
    ]
  },
  {
    id: "sim2real-transfer",
    name: "Sim2Real Transfer Dataset",
    author: "transfer-lab",
    description: "Paired simulation and real-world data for domain adaptation in robotic manipulation tasks.",
    tags: ["sim2real", "domain-adaptation", "manipulation", "transfer-learning"],
    downloads: 6543,
    likes: 234,
    updatedAt: "2026-01-08",
    size: "34.2 GB",
    format: "hdf5",
    license: "CC-BY-NC-4.0",
    task: "Domain Adaptation",
    rows: 520000,
    splits: [
      { name: "sim_train", rows: 400000 },
      { name: "real_train", rows: 50000 },
      { name: "real_test", rows: 70000 }
    ],
    features: [
      { name: "sim_image", type: "Image" },
      { name: "real_image", type: "Image" },
      { name: "action", type: "Sequence[float]" },
      { name: "domain", type: "ClassLabel" }
    ],
    previewData: [
      { id: 1, domain: "simulation", task: "pick_place", objects: 3 },
      { id: 2, domain: "real", task: "pick_place", objects: 3 },
      { id: 3, domain: "simulation", task: "stacking", objects: 5 }
    ]
  },
  {
    id: "multi-robot-coordination",
    name: "Multi-Robot Coordination",
    author: "swarm-robotics",
    description: "Dataset for multi-agent coordination tasks including formation control, collaborative transport, and distributed exploration.",
    tags: ["multi-agent", "coordination", "swarm", "collaborative"],
    downloads: 4521,
    likes: 167,
    updatedAt: "2026-01-05",
    size: "18.9 GB",
    format: "parquet",
    license: "Apache 2.0",
    task: "Multi-Agent",
    rows: 320000,
    splits: [
      { name: "train", rows: 256000 },
      { name: "validation", rows: 32000 },
      { name: "test", rows: 32000 }
    ],
    features: [
      { name: "agent_states", type: "Sequence[Array]" },
      { name: "global_state", type: "Array2D" },
      { name: "joint_action", type: "Sequence[int]" },
      { name: "reward", type: "float" }
    ],
    previewData: [
      { id: 1, num_agents: 4, task: "formation", success_rate: 0.94 },
      { id: 2, num_agents: 6, task: "transport", success_rate: 0.87 },
      { id: 3, num_agents: 8, task: "exploration", success_rate: 0.91 }
    ]
  },
  {
    id: "tactile-sensing-objects",
    name: "Tactile Sensing Object Dataset",
    author: "tactile-research",
    description: "High-resolution tactile sensor data from GelSight and BioTac sensors during object manipulation and texture recognition.",
    tags: ["tactile", "sensing", "texture", "gelsight"],
    downloads: 3245,
    likes: 145,
    updatedAt: "2026-01-03",
    size: "8.7 GB",
    format: "hdf5",
    license: "MIT",
    task: "Tactile Perception",
    rows: 95000,
    splits: [
      { name: "train", rows: 76000 },
      { name: "validation", rows: 9500 },
      { name: "test", rows: 9500 }
    ],
    features: [
      { name: "tactile_image", type: "Image" },
      { name: "force_readings", type: "Sequence[float]" },
      { name: "material", type: "ClassLabel" },
      { name: "object_id", type: "string" }
    ],
    previewData: [
      { id: 1, material: "wood", hardness: "hard", texture: "smooth" },
      { id: 2, material: "fabric", hardness: "soft", texture: "rough" },
      { id: 3, material: "metal", hardness: "hard", texture: "smooth" }
    ]
  },
  {
    id: "outdoor-terrain-navigation",
    name: "Outdoor Terrain Navigation",
    author: "field-robotics",
    description: "Off-road and outdoor terrain dataset for autonomous navigation including LiDAR, IMU, GPS, and terrain classification.",
    tags: ["outdoor", "terrain", "lidar", "autonomous-driving"],
    downloads: 7823,
    likes: 289,
    updatedAt: "2026-01-22",
    size: "156.3 GB",
    format: "rosbag",
    license: "CC-BY-4.0",
    task: "Outdoor Navigation",
    rows: 680000,
    splits: [
      { name: "train", rows: 544000 },
      { name: "validation", rows: 68000 },
      { name: "test", rows: 68000 }
    ],
    features: [
      { name: "lidar_scan", type: "PointCloud" },
      { name: "imu_data", type: "Sequence[float]" },
      { name: "gps_position", type: "Sequence[float]" },
      { name: "terrain_class", type: "ClassLabel" }
    ],
    previewData: [
      { id: 1, terrain: "grass", traversability: 0.85, slope_deg: 5.2 },
      { id: 2, terrain: "gravel", traversability: 0.72, slope_deg: 8.7 },
      { id: 3, terrain: "mud", traversability: 0.45, slope_deg: 3.1 }
    ]
  },
  {
    id: "human-robot-interaction",
    name: "Human-Robot Interaction Dataset",
    author: "hri-lab",
    description: "Multi-modal dataset capturing human-robot interactions including speech, gestures, gaze, and robot responses in collaborative scenarios.",
    tags: ["hri", "interaction", "gesture", "speech"],
    downloads: 5678,
    likes: 223,
    updatedAt: "2026-01-25",
    size: "22.4 GB",
    format: "json",
    license: "CC-BY-NC-4.0",
    task: "Human-Robot Interaction",
    language: "English",
    rows: 45000,
    splits: [
      { name: "train", rows: 36000 },
      { name: "validation", rows: 4500 },
      { name: "test", rows: 4500 }
    ],
    features: [
      { name: "video", type: "Video" },
      { name: "audio", type: "Audio" },
      { name: "gesture_labels", type: "Sequence[string]" },
      { name: "robot_action", type: "string" },
      { name: "interaction_success", type: "bool" }
    ],
    previewData: [
      { id: 1, gesture: "pointing", speech: "Get that item", robot_response: "acknowledged" },
      { id: 2, gesture: "waving", speech: "Hello robot", robot_response: "greeted" },
      { id: 3, gesture: "stop", speech: "Stop moving", robot_response: "halted" }
    ]
  },
  {
    id: "deformable-object-manipulation",
    name: "Deformable Object Manipulation",
    author: "soft-robotics",
    description: "Dataset for manipulating deformable objects like cloth, rope, and dough with visual observations and action sequences.",
    tags: ["deformable", "cloth", "manipulation", "soft-objects"],
    downloads: 2987,
    likes: 134,
    updatedAt: "2026-01-14",
    size: "15.6 GB",
    format: "hdf5",
    license: "MIT",
    task: "Deformable Manipulation",
    rows: 125000,
    splits: [
      { name: "train", rows: 100000 },
      { name: "validation", rows: 12500 },
      { name: "test", rows: 12500 }
    ],
    features: [
      { name: "rgb_image", type: "Image" },
      { name: "depth_image", type: "Image" },
      { name: "mesh_state", type: "Array3D" },
      { name: "action", type: "Sequence[float]" }
    ],
    previewData: [
      { id: 1, object: "cloth", task: "folding", complexity: "medium" },
      { id: 2, object: "rope", task: "knotting", complexity: "hard" },
      { id: 3, object: "dough", task: "shaping", complexity: "medium" }
    ]
  },
  {
    id: "visual-language-navigation",
    name: "Visual-Language Navigation",
    author: "vln-research",
    description: "Large-scale dataset for vision-and-language navigation with natural language instructions and panoramic observations.",
    tags: ["vln", "navigation", "language", "vision"],
    downloads: 18234,
    likes: 567,
    updatedAt: "2026-01-26",
    size: "42.1 GB",
    format: "json",
    license: "Apache 2.0",
    task: "Vision-Language Navigation",
    language: "English",
    rows: 380000,
    splits: [
      { name: "train", rows: 300000 },
      { name: "val_seen", rows: 40000 },
      { name: "val_unseen", rows: 40000 }
    ],
    features: [
      { name: "instruction", type: "string" },
      { name: "panorama", type: "Image" },
      { name: "path", type: "Sequence[string]" },
      { name: "scan_id", type: "string" }
    ],
    previewData: [
      { id: 1, instruction: "Walk past the dining table and enter the kitchen", path_length: 6 },
      { id: 2, instruction: "Go upstairs and turn right into the bedroom", path_length: 9 },
      { id: 3, instruction: "Exit through the front door and wait on the porch", path_length: 4 }
    ]
  }
];

export const filterOptions: FilterOptions = {
  tasks: [
    "Embodied Navigation",
    "Manipulation",
    "Locomotion",
    "Scene Understanding",
    "Instruction Following",
    "Domain Adaptation",
    "Multi-Agent",
    "Tactile Perception",
    "Outdoor Navigation",
    "Human-Robot Interaction",
    "Deformable Manipulation",
    "Vision-Language Navigation"
  ],
  sizes: ["< 10 GB", "10-50 GB", "50-100 GB", "> 100 GB"],
  formats: ["parquet", "hdf5", "json", "rosbag"],
  licenses: ["Apache 2.0", "MIT", "CC-BY-4.0", "CC-BY-NC-4.0"],
  languages: ["English", "Multilingual"]
};

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getDatasetById(id: string): Dataset | undefined {
  return datasets.find(d => d.id === id);
}

export function searchDatasets(
  query: string,
  filters: {
    task?: string;
    format?: string;
    license?: string;
  }
): Dataset[] {
  let results = datasets;

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      d =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.description.toLowerCase().includes(lowerQuery) ||
        d.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        d.author.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters.task) {
    results = results.filter(d => d.task === filters.task);
  }

  if (filters.format) {
    results = results.filter(d => d.format === filters.format);
  }

  if (filters.license) {
    results = results.filter(d => d.license === filters.license);
  }

  return results;
}
