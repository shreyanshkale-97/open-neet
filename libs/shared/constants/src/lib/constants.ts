// ─────────────────────────────────────────────────────────────────────────
// NEET Curriculum Constants
// These are the official NEET 2024 syllabus subjects, units, and topics
// ─────────────────────────────────────────────────────────────────────────

export const NEET_CURRICULUM = {
  PHYSICS: {
    name: 'Physics',
    units: {
      MECHANICS: {
        name: 'Mechanics',
        topics: [
          "Units and Measurements",
          "Motion in a Straight Line",
          "Motion in a Plane",
          "Laws of Motion",
          "Work, Energy and Power",
          "Systems of Particles and Rotational Motion",
          "Gravitation",
        ],
      },
      THERMAL_PHYSICS: {
        name: 'Thermal Physics',
        topics: [
          "Thermal Properties of Matter",
          "Thermodynamics",
          "Kinetic Theory",
        ],
      },
      OSCILLATIONS_WAVES: {
        name: 'Oscillations and Waves',
        topics: [
          "Oscillations",
          "Waves",
        ],
      },
      ELECTROSTATICS: {
        name: 'Electrostatics',
        topics: [
          "Electric Charges and Fields",
          "Electrostatic Potential and Capacitance",
        ],
      },
      CURRENT_ELECTRICITY: {
        name: 'Current Electricity',
        topics: ["Current Electricity"],
      },
      MAGNETISM: {
        name: 'Magnetism',
        topics: [
          "Moving Charges and Magnetism",
          "Magnetism and Matter",
          "Electromagnetic Induction",
          "Alternating Current",
        ],
      },
      OPTICS: {
        name: 'Optics',
        topics: [
          "Ray Optics and Optical Instruments",
          "Wave Optics",
        ],
      },
      MODERN_PHYSICS: {
        name: 'Modern Physics',
        topics: [
          "Dual Nature of Radiation and Matter",
          "Atoms",
          "Nuclei",
          "Semiconductor Electronics",
        ],
      },
    },
  },

  CHEMISTRY: {
    name: 'Chemistry',
    units: {
      PHYSICAL_CHEMISTRY: {
        name: 'Physical Chemistry',
        topics: [
          "Some Basic Concepts of Chemistry",
          "Structure of Atom",
          "States of Matter",
          "Thermodynamics",
          "Equilibrium",
          "Redox Reactions",
          "Electrochemistry",
          "Chemical Kinetics",
          "Surface Chemistry",
          "Solutions",
        ],
      },
      INORGANIC_CHEMISTRY: {
        name: 'Inorganic Chemistry',
        topics: [
          "Classification of Elements and Periodicity",
          "Chemical Bonding and Molecular Structure",
          "Hydrogen",
          "s-Block Elements",
          "p-Block Elements",
          "d-Block and f-Block Elements",
          "Coordination Compounds",
        ],
      },
      ORGANIC_CHEMISTRY: {
        name: 'Organic Chemistry',
        topics: [
          "Organic Chemistry – Basic Principles",
          "Hydrocarbons",
          "Haloalkanes and Haloarenes",
          "Alcohols, Phenols and Ethers",
          "Aldehydes, Ketones and Carboxylic Acids",
          "Nitrogen-Containing Compounds",
          "Biomolecules",
          "Polymers",
          "Chemistry in Everyday Life",
        ],
      },
    },
  },

  BOTANY: {
    name: 'Botany',
    units: {
      DIVERSITY_PLANTS: {
        name: 'Diversity in Living World',
        topics: [
          "The Living World",
          "Biological Classification",
          "Plant Kingdom",
        ],
      },
      PLANT_MORPHOLOGY: {
        name: 'Plant Morphology',
        topics: [
          "Morphology of Flowering Plants",
          "Anatomy of Flowering Plants",
        ],
      },
      CELL_BIOLOGY: {
        name: 'Cell Biology',
        topics: [
          "Cell: The Unit of Life",
          "Cell Cycle and Cell Division",
          "Biomolecules",
        ],
      },
      PLANT_PHYSIOLOGY: {
        name: 'Plant Physiology',
        topics: [
          "Transport in Plants",
          "Mineral Nutrition",
          "Photosynthesis in Higher Plants",
          "Respiration in Plants",
          "Plant Growth and Development",
        ],
      },
      REPRODUCTION_PLANTS: {
        name: 'Reproduction in Plants',
        topics: [
          "Reproduction in Organisms",
          "Sexual Reproduction in Flowering Plants",
        ],
      },
      GENETICS_EVOLUTION: {
        name: 'Genetics and Evolution',
        topics: [
          "Principles of Inheritance and Variation",
          "Molecular Basis of Inheritance",
          "Evolution",
        ],
      },
      ECOLOGY: {
        name: 'Ecology and Environment',
        topics: [
          "Organisms and Populations",
          "Ecosystem",
          "Biodiversity and Conservation",
          "Environmental Issues",
        ],
      },
    },
  },

  ZOOLOGY: {
    name: 'Zoology',
    units: {
      DIVERSITY_ANIMALS: {
        name: 'Diversity in Living World',
        topics: [
          "Animal Kingdom",
        ],
      },
      ANIMAL_PHYSIOLOGY: {
        name: 'Structural Organisation in Animals',
        topics: [
          "Structural Organisation in Animals",
        ],
      },
      HUMAN_PHYSIOLOGY: {
        name: 'Human Physiology',
        topics: [
          "Digestion and Absorption",
          "Breathing and Exchange of Gases",
          "Body Fluids and Circulation",
          "Excretory Products and Elimination",
          "Locomotion and Movement",
          "Neural Control and Coordination",
          "Chemical Coordination and Integration",
        ],
      },
      REPRODUCTION_HUMANS: {
        name: 'Reproduction in Animals',
        topics: [
          "Human Reproduction",
          "Reproductive Health",
        ],
      },
      BIOLOGY_HUMAN_WELFARE: {
        name: 'Biology and Human Welfare',
        topics: [
          "Human Health and Diseases",
          "Strategies for Enhancement in Food Production",
          "Microbes in Human Welfare",
        ],
      },
      BIOTECHNOLOGY: {
        name: 'Biotechnology',
        topics: [
          "Biotechnology – Principles and Processes",
          "Biotechnology and its Applications",
        ],
      },
    },
  },
} as const;

// ─── NEET Scoring ─────────────────────────────────────────────────────────

export const NEET_SCORING = {
  CORRECT_MARKS: 4,
  WRONG_MARKS: -1,
  SKIPPED_MARKS: 0,
  TOTAL_QUESTIONS: 180,
  TOTAL_MARKS: 720,
  DURATION_MINUTES: 180,
  SUBJECT_QUESTION_COUNT: 45,
  WEAK_TOPIC_THRESHOLD: 60,    // accuracy % below this = weak topic
  STRONG_TOPIC_THRESHOLD: 80,  // accuracy % above this = strong topic
} as const;

// ─── Queue Names ──────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  AI_GENERATION: 'ai-generation',
  DOCUMENT_PROCESSING: 'document-processing',
  OCR: 'ocr',
  EMBEDDINGS: 'embeddings',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  CLEANUP: 'cleanup',
  ANALYTICS: 'analytics',
} as const;

// ─── Cache Keys ───────────────────────────────────────────────────────────

export const CACHE_KEYS = {
  SUBJECTS_TREE: 'subjects:tree',
  FEATURE_FLAGS: 'feature-flags',
  dashboard: (userId: string) => `dashboard:${userId}`,
  report: (testId: string) => `report:${testId}`,
  aiResult: (jobId: string) => `ai:result:${jobId}`,
  leaderboard: (period: string) => `leaderboard:${period}`,
} as const;

export const CACHE_TTL = {
  SUBJECTS_TREE: 3600,     // 1 hour
  DASHBOARD: 300,           // 5 minutes
  REPORT: 1800,             // 30 minutes
  AI_RESULT: 600,           // 10 minutes
  FEATURE_FLAGS: 60,        // 1 minute
  LEADERBOARD: 600,         // 10 minutes
} as const;
