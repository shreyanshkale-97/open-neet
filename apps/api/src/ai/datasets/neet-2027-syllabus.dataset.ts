// ─── NMC NEET UG 2026/2027 Official Rationalized Syllabus & Weightage Data Set ───
// Source: National Medical Commission (NMC) NEET UG Curriculum Standards
// Aligned with Rationalized NCERT Class 11 & Class 12 Textbooks

export interface NeetChapterTopic {
  id: string;
  name: string;
  classLevel: 11 | 12;
  highYield: boolean;
  weightagePercent: number; // Estimated exam weightage %
  keyConcepts: string[];
}

export interface NeetUnit {
  id: string;
  unitNumber: number;
  name: string;
  classLevel: 11 | 12;
  weightagePercent: number;
  chapters: NeetChapterTopic[];
}

export interface NeetSubjectSyllabus {
  subjectId: 'physics' | 'chemistry' | 'botany' | 'zoology';
  subjectName: string;
  totalQuestions: number; // 45 for Physics/Chemistry, 45 Botany + 45 Zoology
  totalMarks: number;     // 180 Physics/Chemistry, 180 Botany, 180 Zoology
  sectionAQuestions: number; // 35 compulsory
  sectionBQuestions: number; // 15 (attempt 10)
  units: NeetUnit[];
  deletedTopics: string[]; // Topics removed in NMC rationalized syllabus
}

export const NEET_2027_SYLLABUS: Record<string, NeetSubjectSyllabus> = {
  physics: {
    subjectId: 'physics',
    subjectName: 'Physics',
    totalQuestions: 45,
    totalMarks: 180,
    sectionAQuestions: 35,
    sectionBQuestions: 15,
    deletedTopics: [
      'Communication Systems',
      'Van de Graaff Generator',
      'Davisson-Germer Experiment',
      'Transistors and Amplifier Circuits',
      'Potentiometer (replaced by Wheatstone Bridge applications)',
    ],
    units: [
      {
        id: 'phy_u1',
        unitNumber: 1,
        name: 'Physics and Measurement',
        classLevel: 11,
        weightagePercent: 3,
        chapters: [
          {
            id: 'phy_c1',
            name: 'Units, Dimensions & Error Analysis',
            classLevel: 11,
            highYield: true,
            weightagePercent: 3,
            keyConcepts: ['SI Units', 'Dimensional Formulae', 'Least Count', 'Error Propagation', 'Vernier Caliper & Screw Gauge'],
          },
        ],
      },
      {
        id: 'phy_u2',
        unitNumber: 2,
        name: 'Kinematics',
        classLevel: 11,
        weightagePercent: 7,
        chapters: [
          {
            id: 'phy_c2',
            name: 'Motion in a Straight Line',
            classLevel: 11,
            highYield: false,
            weightagePercent: 3,
            keyConcepts: ['Frame of Reference', 'Kinematic Equations', 'Relative Velocity 1D', 'Motion Under Gravity'],
          },
          {
            id: 'phy_c3',
            name: 'Motion in a Plane & Projectile Motion',
            classLevel: 11,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Vectors Addition & Resolution', 'Projectile Trajectory & Range', 'Uniform Circular Motion & Centripetal Acceleration'],
          },
        ],
      },
      {
        id: 'phy_u3',
        unitNumber: 3,
        name: 'Laws of Motion',
        classLevel: 11,
        weightagePercent: 6,
        chapters: [
          {
            id: 'phy_c4',
            name: 'Newton’s Laws of Motion & Friction',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Inertia & Momentum', 'Free Body Diagrams', 'Static & Kinetic Friction', 'Banking of Roads'],
          },
        ],
      },
      {
        id: 'phy_u4',
        unitNumber: 4,
        name: 'Work, Energy, and Power',
        classLevel: 11,
        weightagePercent: 6,
        chapters: [
          {
            id: 'phy_c5',
            name: 'Work-Energy Theorem & Collisions',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Work Done by Constant & Variable Force', 'Kinetic & Potential Energy', 'Conservation of Mechanical Energy', 'Elastic & Inelastic Collisions in 1D/2D'],
          },
        ],
      },
      {
        id: 'phy_u5',
        unitNumber: 5,
        name: 'Rotational Motion & System of Particles',
        classLevel: 11,
        weightagePercent: 7,
        chapters: [
          {
            id: 'phy_c6',
            name: 'Centre of Mass & Rigid Body Dynamics',
            classLevel: 11,
            highYield: true,
            weightagePercent: 7,
            keyConcepts: ['Centre of Mass of 2-Particle & Rigid Systems', 'Moment of Inertia & Radius of Gyration', 'Parallel & Perpendicular Axes Theorems', 'Torque & Angular Momentum Conservation'],
          },
        ],
      },
      {
        id: 'phy_u6',
        unitNumber: 6,
        name: 'Gravitation',
        classLevel: 11,
        weightagePercent: 5,
        chapters: [
          {
            id: 'phy_c7',
            name: 'Gravitational Field & Satellites',
            classLevel: 11,
            highYield: true,
            weightagePercent: 5,
            keyConcepts: ['Newton’s Universal Law', 'Variation of g with Height & Depth', 'Gravitational Potential Energy', 'Escape & Orbital Speed of Satellites'],
          },
        ],
      },
      {
        id: 'phy_u7',
        unitNumber: 7,
        name: 'Properties of Bulk Matter',
        classLevel: 11,
        weightagePercent: 7,
        chapters: [
          {
            id: 'phy_c8',
            name: 'Elasticity, Fluids & Thermal Properties',
            classLevel: 11,
            highYield: true,
            weightagePercent: 7,
            keyConcepts: ['Young’s Modulus & Hooke’s Law', 'Pascal’s Law & Hydraulic Lift', 'Bernoulli’s Theorem & Viscosity (Terminal Velocity)', 'Surface Tension & Capillary Rise', 'Thermal Expansion & Stefan-Boltzmann Law'],
          },
        ],
      },
      {
        id: 'phy_u8',
        unitNumber: 8,
        name: 'Thermodynamics & Kinetic Theory',
        classLevel: 11,
        weightagePercent: 8,
        chapters: [
          {
            id: 'phy_c9',
            name: 'Thermodynamics Laws & Heat Processes',
            classLevel: 11,
            highYield: true,
            weightagePercent: 5,
            keyConcepts: ['First Law & Isothermal/Adiabatic Processes', 'Second Law & Carnot Engine Efficiency', 'Specific Heat Capacity'],
          },
          {
            id: 'phy_c10',
            name: 'Kinetic Theory of Gases',
            classLevel: 11,
            highYield: false,
            weightagePercent: 3,
            keyConcepts: ['Ideal Gas Equation', 'RMS Speed & Pressure of Gas', 'Degrees of Freedom & Equipartition of Energy'],
          },
        ],
      },
      {
        id: 'phy_u9',
        unitNumber: 9,
        name: 'Oscillations and Waves',
        classLevel: 11,
        weightagePercent: 7,
        chapters: [
          {
            id: 'phy_c11',
            name: 'Simple Harmonic Motion & Sound Waves',
            classLevel: 11,
            highYield: true,
            weightagePercent: 7,
            keyConcepts: ['SHM Displacement & Energy', 'Simple Pendulum & Spring-Mass System', 'Wave Motion & Principle of Superposition', 'Organ Pipes, Beats & Doppler Effect'],
          },
        ],
      },
      {
        id: 'phy_u10',
        unitNumber: 10,
        name: 'Electrostatics',
        classLevel: 12,
        weightagePercent: 9,
        chapters: [
          {
            id: 'phy_c12',
            name: 'Electric Field, Potential & Capacitance',
            classLevel: 12,
            highYield: true,
            weightagePercent: 9,
            keyConcepts: ['Coulomb’s Law & Gauss’s Theorem', 'Electric Potential Due to Dipole', 'Parallel Plate Capacitor with Dielectric', 'Energy Stored in Capacitor'],
          },
        ],
      },
      {
        id: 'phy_u11',
        unitNumber: 11,
        name: 'Current Electricity',
        classLevel: 12,
        weightagePercent: 9,
        chapters: [
          {
            id: 'phy_c13',
            name: 'Electric Current, Circuits & Meters',
            classLevel: 12,
            highYield: true,
            weightagePercent: 9,
            keyConcepts: ['Drift Velocity & Mobility', 'Ohm’s Law & Temperature Dependence', 'Kirchhoff’s Loop & Junction Rules', 'Wheatstone Bridge & Meter Bridge'],
          },
        ],
      },
      {
        id: 'phy_u12',
        unitNumber: 12,
        name: 'Magnetic Effects of Current & Magnetism',
        classLevel: 12,
        weightagePercent: 8,
        chapters: [
          {
            id: 'phy_c14',
            name: 'Moving Charges, Magnetism & Earth’s Field',
            classLevel: 12,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Biot-Savart Law & Ampere’s Circuital Law', 'Lorentz Force & Cyclotron', 'Magnetic Dipole Moment of Current Loop', 'Para, Dia & Ferromagnetic Materials'],
          },
        ],
      },
      {
        id: 'phy_u13',
        unitNumber: 13,
        name: 'Electromagnetic Induction & Alternating Currents',
        classLevel: 12,
        weightagePercent: 7,
        chapters: [
          {
            id: 'phy_c15',
            name: 'EMI, Lenz Law & AC Circuits',
            classLevel: 12,
            highYield: true,
            weightagePercent: 7,
            keyConcepts: ['Faraday’s Law & Lenz’s Law', 'Self & Mutual Inductance', 'LCR Series Resonance Circuit', 'Power Factor & AC Transformer'],
          },
        ],
      },
      {
        id: 'phy_u14',
        unitNumber: 14,
        name: 'Electromagnetic Waves & Optics',
        classLevel: 12,
        weightagePercent: 12,
        chapters: [
          {
            id: 'phy_c16',
            name: 'EM Waves & Ray Optics',
            classLevel: 12,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Displacement Current & EM Spectrum', 'Reflection & Total Internal Reflection', 'Lens Formula & Prism Deviation', 'Microscope & Astronomical Telescope'],
          },
          {
            id: 'phy_c17',
            name: 'Wave Optics',
            classLevel: 12,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Huygens’ Wavefront Principle', 'Young’s Double Slit Interference', 'Single Slit Diffraction', 'Polarisation & Brewster’s Law'],
          },
        ],
      },
      {
        id: 'phy_u15',
        unitNumber: 15,
        name: 'Modern Physics & Semiconductors',
        classLevel: 12,
        weightagePercent: 12,
        chapters: [
          {
            id: 'phy_c18',
            name: 'Dual Nature of Matter & Photoelectric Effect',
            classLevel: 12,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Photoelectric Equation & Stopping Potential', 'de Broglie Wavelength of Particle'],
          },
          {
            id: 'phy_c19',
            name: 'Atoms & Nuclei',
            classLevel: 12,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Rutherford & Bohr Atomic Model', 'Mass Defect & Binding Energy Per Nucleon', 'Nuclear Fission & Fusion'],
          },
          {
            id: 'phy_c20',
            name: 'Semiconductor Electronics & Logic Gates',
            classLevel: 12,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Intrinsic & Extrinsic Semiconductors', 'p-n Junction Diode & Rectifier', 'Zener Diode as Voltage Regulator', 'Logic Gates (AND, OR, NOT, NAND, NOR)'],
          },
        ],
      },
    ],
  },

  chemistry: {
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    totalQuestions: 45,
    totalMarks: 180,
    sectionAQuestions: 35,
    sectionBQuestions: 15,
    deletedTopics: [
      'Solid State',
      'Surface Chemistry',
      'General Principles and Processes of Isolation of Elements (Metallurgy)',
      'Hydrogen',
      's-Block Elements (Alkali & Alkaline Earth Metals)',
      'Environmental Chemistry',
      'Polymers',
      'Chemistry in Everyday Life',
    ],
    units: [
      {
        id: 'chem_u1',
        unitNumber: 1,
        name: 'Physical Chemistry - Basics & Atomic Structure',
        classLevel: 11,
        weightagePercent: 10,
        chapters: [
          {
            id: 'chem_c1',
            name: 'Some Basic Concepts of Chemistry',
            classLevel: 11,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Mole Concept & Molar Mass', 'Empirical & Molecular Formula', 'Limiting Reagent & Stoichiometry', 'Molarity, Molality & Normality'],
          },
          {
            id: 'chem_c2',
            name: 'Structure of Atom',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Bohr’s Model & Hydrogen Spectrum', 'de Broglie & Heisenberg Uncertainty Principle', 'Quantum Numbers & Electronic Configuration'],
          },
        ],
      },
      {
        id: 'chem_u2',
        unitNumber: 2,
        name: 'Chemical Bonding & Periodic Properties',
        classLevel: 11,
        weightagePercent: 13,
        chapters: [
          {
            id: 'chem_c3',
            name: 'Classification of Elements & Periodicity',
            classLevel: 11,
            highYield: false,
            weightagePercent: 4,
            keyConcepts: ['Periodic Trends (Atomic Radius, Ionization Enthalpy, Electron Gain Enthalpy, Electronegativity)'],
          },
          {
            id: 'chem_c4',
            name: 'Chemical Bonding & Molecular Structure',
            classLevel: 11,
            highYield: true,
            weightagePercent: 9,
            keyConcepts: ['Ionic & Covalent Bonding', 'VSEPR Theory & Molecular Geometry', 'Hybridization (sp, sp2, sp3, sp3d, sp3d2)', 'Molecular Orbital Theory & Bond Order', 'Hydrogen Bonding'],
          },
        ],
      },
      {
        id: 'chem_u3',
        unitNumber: 3,
        name: 'Chemical Thermodynamics & Equilibrium',
        classLevel: 11,
        weightagePercent: 13,
        chapters: [
          {
            id: 'chem_c5',
            name: 'Chemical Thermodynamics',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['First Law & Enthalpy Changes', 'Hess’s Law & Bond Dissociation Energy', 'Second Law, Entropy & Gibbs Free Energy (Spontaneity)'],
          },
          {
            id: 'chem_c6',
            name: 'Equilibrium (Chemical & Ionic)',
            classLevel: 11,
            highYield: true,
            weightagePercent: 7,
            keyConcepts: ['Law of Mass Action & Kp/Kc Relation', 'Le Chatelier’s Principle', 'pH Calculation & Buffer Solutions', 'Solubility Product (Ksp) & Common Ion Effect'],
          },
        ],
      },
      {
        id: 'chem_u4',
        unitNumber: 4,
        name: 'Solutions & Electrochemistry',
        classLevel: 12,
        weightagePercent: 12,
        chapters: [
          {
            id: 'chem_c7',
            name: 'Solutions & Colligative Properties',
            classLevel: 12,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Raoult’s Law & Ideal/Non-ideal Solutions', 'Elevation of Boiling Point & Depression of Freezing Point', 'Osmotic Pressure & Van’t Hoff Factor'],
          },
          {
            id: 'chem_c8',
            name: 'Electrochemistry & Chemical Kinetics',
            classLevel: 12,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Nernst Equation & Cell EMF', 'Kohlrausch’s Law & Molar Conductivity', 'Order & Molecularity of Reaction', 'First Order Integrated Rate Law & Half Life', 'Arrhenius Equation & Activation Energy'],
          },
        ],
      },
      {
        id: 'chem_u5',
        unitNumber: 5,
        name: 'Inorganic Chemistry (p, d, f Blocks & Coordination)',
        classLevel: 12,
        weightagePercent: 22,
        chapters: [
          {
            id: 'chem_c9',
            name: 'p-Block Elements (Groups 13 to 18)',
            classLevel: 12,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Group 13-18 Trends', 'Oxoacids of Phosphorus, Sulfur & Halogens', 'Interhalogen Compounds & Xenon Fluorides'],
          },
          {
            id: 'chem_c10',
            name: 'd- and f-Block Elements',
            classLevel: 12,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Transition Metals Electronic Config & Oxidation States', 'Potassium Dichromate (K2Cr2O7) & Permanganate (KMnO4)', 'Lanthanide Contraction & Actinides'],
          },
          {
            id: 'chem_c11',
            name: 'Coordination Compounds',
            classLevel: 12,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Werner’s Theory & IUPAC Naming', 'Structural & Stereoisomerism', 'Valence Bond Theory & Crystal Field Theory (CFT)', 'Magnetic Moment & Colour of Complexes'],
          },
        ],
      },
      {
        id: 'chem_u6',
        unitNumber: 6,
        name: 'Organic Chemistry Principles & Hydrocarbons',
        classLevel: 11,
        weightagePercent: 15,
        chapters: [
          {
            id: 'chem_c12',
            name: 'Organic Chemistry - Basic Principles & Techniques',
            classLevel: 11,
            highYield: true,
            weightagePercent: 9,
            keyConcepts: ['IUPAC Nomenclature', 'Inductive, Electromeric, Resonance & Hyperconjugation', 'Carbocation, Carbanion & Free Radical Stability', 'Isomerism (Structural & Stereoisomerism)'],
          },
          {
            id: 'chem_c13',
            name: 'Hydrocarbons',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Markovnikov & Anti-Markovnikov Addition', 'Ozonolysis of Alkenes', 'Electrophilic Aromatic Substitution (Benzene Nitration/Friedel-Crafts)'],
          },
        ],
      },
      {
        id: 'chem_u7',
        unitNumber: 7,
        name: 'Organic Compounds with Functional Groups & Biomolecules',
        classLevel: 12,
        weightagePercent: 15,
        chapters: [
          {
            id: 'chem_c14',
            name: 'Haloalkanes, Haloarenes, Alcohols & Phenols',
            classLevel: 12,
            highYield: true,
            weightagePercent: 5,
            keyConcepts: ['SN1 and SN2 Reaction Mechanisms', 'Reimer-Tiemann & Kolbe’s Reactions', 'Acidity of Phenols'],
          },
          {
            id: 'chem_c15',
            name: 'Aldehydes, Ketones, Carboxylic Acids & Amines',
            classLevel: 12,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Nucleophilic Addition (Aldol & Cannizzaro)', 'Tollens’ & Fehling’s Tests', 'Basicity of Amines & Hoffmann Bromamide Reaction', 'Diazonium Coupling Reactions'],
          },
          {
            id: 'chem_c16',
            name: 'Biomolecules & Practical Organic Tests',
            classLevel: 12,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Glucose & Fructose Structure', 'Proteins (Peptide Linkage, Denaturation)', 'DNA/RNA Nucleic Acids', 'Qualitative Analysis of Functional Groups & Salts'],
          },
        ],
      },
    ],
  },

  botany: {
    subjectId: 'botany',
    subjectName: 'Botany',
    totalQuestions: 45,
    totalMarks: 180,
    sectionAQuestions: 35,
    sectionBQuestions: 15,
    deletedTopics: [
      'Reproduction in Organisms',
      'Strategies for Enhancement in Food Production (Plant Breeding)',
      'Environmental Issues (Global Warming, Ozone Depletion)',
      'Transport in Plants (Xylem/Phloem Translocation, Osmosis)',
      'Mineral Nutrition (Essential Micro/Macro Nutrients)',
    ],
    units: [
      {
        id: 'bot_u1',
        unitNumber: 1,
        name: 'Diversity of Plant Life',
        classLevel: 11,
        weightagePercent: 10,
        chapters: [
          {
            id: 'bot_c1',
            name: 'Biological Classification & Plant Kingdom',
            classLevel: 11,
            highYield: true,
            weightagePercent: 10,
            keyConcepts: ['Five Kingdom Classification (Monera, Protista, Fungi)', 'Viruses, Viroids & Lichens', 'Algae, Bryophytes, Pteridophytes & Gymnosperms Lifecycle', 'Alternation of Generations'],
          },
        ],
      },
      {
        id: 'bot_u2',
        unitNumber: 2,
        name: 'Plant Morphology & Anatomy',
        classLevel: 11,
        weightagePercent: 8,
        chapters: [
          {
            id: 'bot_c2',
            name: 'Morphology & Anatomy of Flowering Plants',
            classLevel: 11,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Root, Stem & Leaf Modifications', 'Inflorescence & Floral Formulas (Fabaceae, Solanaceae, Liliaceae, Malvaceae)', 'Meristematic & Permanent Tissues', 'Dicot vs Monocot Root, Stem & Leaf Anatomy'],
          },
        ],
      },
      {
        id: 'bot_u3',
        unitNumber: 3,
        name: 'Cell Biology & Biomolecules',
        classLevel: 11,
        weightagePercent: 15,
        chapters: [
          {
            id: 'bot_c3',
            name: 'Cell Unit of Life & Cell Cycle',
            classLevel: 11,
            highYield: true,
            weightagePercent: 15,
            keyConcepts: ['Prokaryotic vs Eukaryotic Cell Structure', 'Endomembrane System, Mitochondria & Chloroplasts', 'Enzyme Kinetics & Factors Affecting Activity', 'Mitosis & Meiosis (Phases & Crossing Over)'],
          },
        ],
      },
      {
        id: 'bot_u4',
        unitNumber: 4,
        name: 'Plant Physiology',
        classLevel: 11,
        weightagePercent: 12,
        chapters: [
          {
            id: 'bot_c4',
            name: 'Photosynthesis & Plant Respiration',
            classLevel: 11,
            highYield: true,
            weightagePercent: 12,
            keyConcepts: ['Light Reactions & Cyclic/Non-Cyclic Photophosphorylation', 'C3 (Calvin Cycle) vs C4 Pathway & Photorespiration', 'Glycolysis, Krebs Cycle & Electron Transport System', 'Plant Growth Regulators (Auxins, Gibberellins, Cytokinins, ABA, Ethylene)'],
          },
        ],
      },
      {
        id: 'bot_u5',
        unitNumber: 5,
        name: 'Plant Reproduction & Genetics',
        classLevel: 12,
        weightagePercent: 35,
        chapters: [
          {
            id: 'bot_c5',
            name: 'Sexual Reproduction in Flowering Plants',
            classLevel: 12,
            highYield: true,
            weightagePercent: 10,
            keyConcepts: ['Microsporogenesis & Megasporogenesis', 'Pollination Mechanisms & Outbreeding Devices', 'Double Fertilization & Triple Fusion', 'Endosperm & Embryo Development'],
          },
          {
            id: 'bot_c6',
            name: 'Principles of Inheritance & Variation (Mendelian Genetics)',
            classLevel: 12,
            highYield: true,
            weightagePercent: 12,
            keyConcepts: ['Monohybrid & Dihybrid Crosses', 'Incomplete Dominance, Codominance & Multiple Alleles', 'Chromosomal Theory & Sex Determination', 'Pedigree Analysis & Genetic Disorders'],
          },
          {
            id: 'bot_c7',
            name: 'Molecular Basis of Inheritance',
            classLevel: 12,
            highYield: true,
            weightagePercent: 13,
            keyConcepts: ['DNA Replication (Semi-Conservative)', 'Transcription & RNA Processing', 'Genetic Code & Translation', 'Lac Operon & Human Genome Project'],
          },
        ],
      },
      {
        id: 'bot_u6',
        unitNumber: 6,
        name: 'Ecology & Environment',
        classLevel: 12,
        weightagePercent: 20,
        chapters: [
          {
            id: 'bot_c8',
            name: 'Organisms, Ecosystem & Biodiversity',
            classLevel: 12,
            highYield: true,
            weightagePercent: 20,
            keyConcepts: ['Population Growth Curves (Exponential & Logistic)', 'Ecological Pyramids & Energy Flow', 'Nutrient Cycling (Carbon & Phosphorus)', 'Biodiversity Loss & Conservation (In-situ / Ex-situ)'],
          },
        ],
      },
    ],
  },

  zoology: {
    subjectId: 'zoology',
    subjectName: 'Zoology',
    totalQuestions: 45,
    totalMarks: 180,
    sectionAQuestions: 35,
    sectionBQuestions: 15,
    deletedTopics: [
      'Digestion and Absorption (Alimentary canal enzymes removed from NCERT)',
      'Animal Husbandry & Tissue Culture',
    ],
    units: [
      {
        id: 'zoo_u1',
        unitNumber: 1,
        name: 'Animal Diversity & Tissues',
        classLevel: 11,
        weightagePercent: 12,
        chapters: [
          {
            id: 'zoo_c1',
            name: 'Animal Kingdom Classification',
            classLevel: 11,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Levels of Organisation & Symmetry', 'Non-Chordates (Porifera to Echinodermata)', 'Hemichordates & Chordates (Cyclostomata to Mammalia)'],
          },
          {
            id: 'zoo_c2',
            name: 'Structural Organisation in Animals (Frog & Tissues)',
            classLevel: 11,
            highYield: true,
            weightagePercent: 4,
            keyConcepts: ['Epithelial, Connective, Muscular & Neural Tissues', 'Frog Anatomy & Organ Systems'],
          },
        ],
      },
      {
        id: 'zoo_u2',
        unitNumber: 2,
        name: 'Human Physiology',
        classLevel: 11,
        weightagePercent: 30,
        chapters: [
          {
            id: 'zoo_c3',
            name: 'Breathing & Exchange of Gases',
            classLevel: 11,
            highYield: true,
            weightagePercent: 5,
            keyConcepts: ['Respiratory Volumes & Capacities (TV, IRV, ERV, RV)', 'Transport of Oxygen & CO2 (Oxygen Dissociation Curve)'],
          },
          {
            id: 'zoo_c4',
            name: 'Body Fluids & Circulation',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Blood Components & ABO/Rh Grouping', 'Cardiac Cycle, ECG Waveforms & Double Circulation'],
          },
          {
            id: 'zoo_c5',
            name: 'Excretory Products & Their Elimination',
            classLevel: 11,
            highYield: true,
            weightagePercent: 6,
            keyConcepts: ['Nephron Structure & Urine Formation', 'Counter-Current Mechanism & JGA / RAAS Regulation'],
          },
          {
            id: 'zoo_c6',
            name: 'Locomotion & Movement',
            classLevel: 11,
            highYield: true,
            weightagePercent: 5,
            keyConcepts: ['Sliding Filament Theory of Muscle Contraction', 'Human Skeleton & Joints (Fibrous, Cartilaginous, Synovial)'],
          },
          {
            id: 'zoo_c7',
            name: 'Neural Control & Chemical Coordination',
            classLevel: 11,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Conduction of Nerve Impulse & Synapse', 'Endocrine Glands (Pituitary, Thyroid, Adrenal, Pancreas)', 'Hormone Action Mechanism'],
          },
        ],
      },
      {
        id: 'zoo_u3',
        unitNumber: 3,
        name: 'Human Reproduction & Health',
        classLevel: 12,
        weightagePercent: 18,
        chapters: [
          {
            id: 'zoo_c8',
            name: 'Human Reproduction System',
            classLevel: 12,
            highYield: true,
            weightagePercent: 10,
            keyConcepts: ['Male & Female Reproductive System', 'Spermatogenesis & Oogenesis', 'Menstrual Cycle & Hormonal Control', 'Fertilization, Implantation & Parturition'],
          },
          {
            id: 'zoo_c9',
            name: 'Reproductive Health & ART',
            classLevel: 12,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Contraceptive Methods (Barrier, IUDs, Oral Pills)', 'Assisted Reproductive Technologies (IVF, ZIFT, GIFT, ICSI)', 'Sexually Transmitted Infections (STIs)'],
          },
        ],
      },
      {
        id: 'zoo_u4',
        unitNumber: 4,
        name: 'Evolution',
        classLevel: 12,
        weightagePercent: 8,
        chapters: [
          {
            id: 'zoo_c10',
            name: 'Evolution & Origin of Species',
            classLevel: 12,
            highYield: true,
            weightagePercent: 8,
            keyConcepts: ['Evidence for Evolution (Homologous & Analogous Organs)', 'Adaptive Radiation (Darwin’s Finches)', 'Hardy-Weinberg Principle', 'Human Evolutionary Lineage'],
          },
        ],
      },
      {
        id: 'zoo_u5',
        unitNumber: 5,
        name: 'Biotechnology & Human Health',
        classLevel: 12,
        weightagePercent: 32,
        chapters: [
          {
            id: 'zoo_c11',
            name: 'Biotechnology - Principles & Processes',
            classLevel: 12,
            highYield: true,
            weightagePercent: 12,
            keyConcepts: ['Restriction Enzymes & Ligases', 'Recombinant DNA Vectors (pBR322)', 'Polymerase Chain Reaction (PCR) Steps', 'Gel Electrophoresis & Bioreactors'],
          },
          {
            id: 'zoo_c12',
            name: 'Biotechnology Applications',
            classLevel: 12,
            highYield: true,
            weightagePercent: 10,
            keyConcepts: ['Bt Cotton & RNA Interference (RNAi)', 'Recombinant Human Insulin & Gene Therapy', 'Transgenic Animals & Ethical Issues'],
          },
          {
            id: 'zoo_c13',
            name: 'Human Health and Disease',
            classLevel: 12,
            highYield: true,
            weightagePercent: 10,
            keyConcepts: ['Common Diseases (Typhoid, Pneumonia, Malaria, Amoebiasis)', 'Innate vs Acquired Immunity & Antibodies', 'Vaccination, Cancer & HIV/AIDS', 'Drugs & Alcohol Abuse'],
          },
        ],
      },
    ],
  },
};

/**
 * Helper to retrieve syllabus summary or unit lists
 */
export function getNeet2027SyllabusSummary() {
  return {
    examName: 'NEET (UG) 2026/2027',
    regulatingBody: 'National Medical Commission (NMC) / NTA',
    totalDurationMinutes: 200, // 3 hours 20 mins
    totalQuestionsPresented: 200,
    totalQuestionsEvaluated: 180,
    totalMaxScore: 720,
    markingScheme: {
      correctAnswer: 4,
      incorrectAnswer: -1,
      unattempted: 0,
    },
    subjects: Object.values(NEET_2027_SYLLABUS).map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      unitCount: s.units.length,
      chapterCount: s.units.reduce((acc, u) => acc + u.chapters.length, 0),
      totalMarks: s.totalMarks,
      deletedTopicsCount: s.deletedTopics.length,
    })),
  };
}
