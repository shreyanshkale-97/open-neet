// ─── NMC NEET UG 2026/2027 Comprehensive Question Bank Dataset ───
// High-Yield NCERT Questions mapped to Difficulty Levels 1-10, Diagrams, and Question Types

export interface BankQuestionOption {
  optionLabel: 'A' | 'B' | 'C' | 'D';
  optionText: string;
}

export interface BankQuestionItem {
  id: string;
  subjectId: 'physics' | 'chemistry' | 'botany' | 'zoology';
  unitId: string;
  unitName: string;
  chapterName: string;
  questionText: string;
  difficulty: number; // 1 to 10 scale
  difficultyCategory: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'SINGLE_CORRECT' | 'ASSERTION_REASON' | 'STATEMENT_BASED' | 'MATCH_FOLLOWING' | 'DIAGRAM';
  options: BankQuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  hasImage?: boolean;
  imageUrl?: string;
  svgDiagram?: string; // Inline SVG diagram representation
  ncertReference: string; // e.g. "NCERT Class 12 Physics, Page 78"
}

export const NEET_QUESTION_BANK_DATASET: BankQuestionItem[] = [
  // ─────────────────────────────────────────────────────────────
  // PHYSICS QUESTIONS (Difficulty 1-10)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bank_phy_001',
    subjectId: 'physics',
    unitId: 'phy_u10',
    unitName: 'Electrostatics',
    chapterName: 'Electric Field, Potential & Capacitance',
    questionText: 'A parallel plate capacitor with air between plates has a capacitance of 8 pF. What will be the capacitance if the distance between plates is reduced by half and the space between them is filled with a dielectric constant K = 6?',
    difficulty: 4,
    difficultyCategory: 'MEDIUM',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: '48 pF' },
      { optionLabel: 'B', optionText: '96 pF' },
      { optionLabel: 'C', optionText: '24 pF' },
      { optionLabel: 'D', optionText: '12 pF' },
    ],
    correctOption: 'B',
    explanation: 'Original capacitance C0 = ε0 A / d = 8 pF. New capacitance C = K ε0 A / (d/2) = 2 K C0 = 2 × 6 × 8 = 96 pF.',
    ncertReference: 'NCERT Class 12 Physics, Chapter 2 (Electrostatic Potential and Capacitance)',
  },
  {
    id: 'bank_phy_002',
    subjectId: 'physics',
    unitId: 'phy_u11',
    unitName: 'Current Electricity',
    chapterName: 'Electric Current, Circuits & Meters',
    questionText: 'In the circuit shown below, the current I flowing through the 4 Ω resistor is:',
    difficulty: 6,
    difficultyCategory: 'MEDIUM',
    questionType: 'DIAGRAM',
    hasImage: true,
    svgDiagram: `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="150" fill="#0B0F17" rx="8"/><path d="M 30 75 L 80 75 M 120 75 L 180 75 M 220 75 L 270 75 M 30 75 L 30 120 L 270 120 L 270 75" stroke="#6366F1" stroke-width="2" fill="none"/><rect x="80" y="60" width="40" height="30" stroke="#10B981" stroke-width="2" fill="#131B2A"/><text x="100" y="80" fill="#FFF" font-size="12" text-anchor="middle">4 Ω</text><rect x="180" y="60" width="40" height="30" stroke="#10B981" stroke-width="2" fill="#131B2A"/><text x="200" y="80" fill="#FFF" font-size="12" text-anchor="middle">2 Ω</text><line x1="140" y1="110" x2="140" y2="130" stroke="#FFF" stroke-width="3"/><line x1="150" y1="105" x2="150" y2="135" stroke="#FFF" stroke-width="1.5"/><text x="145" y="95" fill="#A5B4FC" font-size="12" text-anchor="middle">12 V</text></svg>`,
    options: [
      { optionLabel: 'A', optionText: '1.0 A' },
      { optionLabel: 'B', optionText: '2.0 A' },
      { optionLabel: 'C', optionText: '3.0 A' },
      { optionLabel: 'D', optionText: '4.0 A' },
    ],
    correctOption: 'B',
    explanation: 'Total resistance R_eq = 4 Ω + 2 Ω = 6 Ω. Total current I = V / R_eq = 12 V / 6 Ω = 2.0 A.',
    ncertReference: 'NCERT Class 12 Physics, Chapter 3 (Current Electricity)',
  },
  {
    id: 'bank_phy_003',
    subjectId: 'physics',
    unitId: 'phy_u14',
    unitName: 'Electromagnetic Waves & Optics',
    chapterName: 'EM Waves & Ray Optics',
    questionText: 'Given below are two statements:\nStatement I: A convex lens placed in a liquid of refractive index equal to that of the lens behaves like a plane glass sheet.\nStatement II: The focal length of a lens becomes infinite when immersed in a medium of identical refractive index.',
    difficulty: 5,
    difficultyCategory: 'MEDIUM',
    questionType: 'STATEMENT_BASED',
    options: [
      { optionLabel: 'A', optionText: 'Both Statement I and Statement II are correct.' },
      { optionLabel: 'B', optionText: 'Both Statement I and Statement II are incorrect.' },
      { optionLabel: 'C', optionText: 'Statement I is correct but Statement II is incorrect.' },
      { optionLabel: 'D', optionText: 'Statement I is incorrect but Statement II is correct.' },
    ],
    correctOption: 'A',
    explanation: 'By Lens Maker Formula, 1/f = ((n_lens / n_medium) - 1) * (1/R1 - 1/R2). If n_lens = n_medium, 1/f = 0 => f = ∞. Thus, the lens acts as a plane sheet.',
    ncertReference: 'NCERT Class 12 Physics, Chapter 9 (Ray Optics)',
  },
  {
    id: 'bank_phy_004',
    subjectId: 'physics',
    unitId: 'phy_u15',
    unitName: 'Modern Physics & Semiconductors',
    chapterName: 'Dual Nature of Matter & Photoelectric Effect',
    questionText: 'Given below are two statements:\nAssertion (A): The stopping potential in a photoelectric experiment depends on the frequency of incident light and is independent of intensity.\nReason (R): Maximum kinetic energy of emitted photoelectrons increases linearly with the frequency of incident radiation above threshold frequency.',
    difficulty: 7,
    difficultyCategory: 'HARD',
    questionType: 'ASSERTION_REASON',
    options: [
      { optionLabel: 'A', optionText: 'Both (A) and (R) are correct and (R) is the correct explanation of (A).' },
      { optionLabel: 'B', optionText: 'Both (A) and (R) are correct but (R) is NOT the correct explanation of (A).' },
      { optionLabel: 'C', optionText: '(A) is correct but (R) is incorrect.' },
      { optionLabel: 'D', optionText: '(A) is incorrect but (R) is correct.' },
    ],
    correctOption: 'A',
    explanation: 'Einstein photoelectric equation: e V0 = h ν - Φ. Since KE_max = e V0 increases linearly with frequency ν, stopping potential V0 depends directly on frequency and explains why it is independent of intensity.',
    ncertReference: 'NCERT Class 12 Physics, Chapter 11 (Dual Nature)',
  },
  {
    id: 'bank_phy_005',
    subjectId: 'physics',
    unitId: 'phy_u2',
    unitName: 'Kinematics',
    chapterName: 'Motion in a Plane & Projectile Motion',
    questionText: 'A ball is projected at an angle of 45° to the horizontal with an initial velocity of 20 m/s. Taking g = 10 m/s², the maximum height attained by the ball is:',
    difficulty: 3,
    difficultyCategory: 'EASY',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: '5 m' },
      { optionLabel: 'B', optionText: '10 m' },
      { optionLabel: 'C', optionText: '15 m' },
      { optionLabel: 'D', optionText: '20 m' },
    ],
    correctOption: 'B',
    explanation: 'H_max = u² sin²(θ) / (2g) = (20)² sin²(45°) / (2 × 10) = 400 × (1/2) / 20 = 10 m.',
    ncertReference: 'NCERT Class 11 Physics, Chapter 4 (Motion in a Plane)',
  },

  // ─────────────────────────────────────────────────────────────
  // CHEMISTRY QUESTIONS (Difficulty 1-10)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bank_chem_001',
    subjectId: 'chemistry',
    unitId: 'chem_u2',
    unitName: 'Chemical Bonding & Periodic Properties',
    chapterName: 'Chemical Bonding & Molecular Structure',
    questionText: 'Which of the following molecules has a linear shape and zero dipole moment according to VSEPR theory?',
    difficulty: 3,
    difficultyCategory: 'EASY',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: 'SO₂' },
      { optionLabel: 'B', optionText: 'CO₂' },
      { optionLabel: 'C', optionText: 'H₂O' },
      { optionLabel: 'D', optionText: 'NO₂' },
    ],
    correctOption: 'B',
    explanation: 'CO₂ has sp hybridization with linear geometry O=C=O (180° angle). The individual C=O bond dipoles cancel out, resulting in µ = 0 D.',
    ncertReference: 'NCERT Class 11 Chemistry, Chapter 4 (Chemical Bonding)',
  },
  {
    id: 'bank_chem_002',
    subjectId: 'chemistry',
    unitId: 'chem_u5',
    unitName: 'Inorganic Chemistry',
    chapterName: 'Coordination Compounds',
    questionText: 'Match List I with List II for complex ions:\nList I: A. [Fe(CN)₆]³⁻, B. [Fe(H₂O)₆]³⁺, C. [Ni(CN)₄]²⁻, D. [NiCl₄]²⁻\nList II: I. dsp² (Square planar, Diamagnetic), II. sp³ (Tetrahedral, Paramagnetic), III. d²sp³ (Octahedral, Paramagnetic), IV. sp³d² (Octahedral, High spin)',
    difficulty: 8,
    difficultyCategory: 'HARD',
    questionType: 'MATCH_FOLLOWING',
    options: [
      { optionLabel: 'A', optionText: 'A-III, B-IV, C-I, D-II' },
      { optionLabel: 'B', optionText: 'A-I, B-II, C-III, D-IV' },
      { optionLabel: 'C', optionText: 'A-IV, B-III, C-II, D-I' },
      { optionLabel: 'D', optionText: 'A-II, B-I, C-IV, D-III' },
    ],
    correctOption: 'A',
    explanation: '[Fe(CN)6]3- is low-spin d2sp3 (Paramagnetic, 1 unpaired e-). [Fe(H2O)6]3+ is high-spin sp3d2. [Ni(CN)4]2- is dsp2 square planar. [NiCl4]2- is sp3 tetrahedral.',
    ncertReference: 'NCERT Class 12 Chemistry, Chapter 9 (Coordination Compounds)',
  },
  {
    id: 'bank_chem_003',
    subjectId: 'chemistry',
    unitId: 'chem_u6',
    unitName: 'Organic Chemistry Principles',
    chapterName: 'Organic Compounds with Functional Groups',
    questionText: 'An organic compound A (C₃H₆O) forms a yellow precipitate when treated with I₂ and NaOH. Compound A gives a positive Tollens’ test. Compound A is:',
    difficulty: 6,
    difficultyCategory: 'MEDIUM',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: 'Propanone (Acetone)' },
      { optionLabel: 'B', optionText: 'Propanal' },
      { optionLabel: 'C', optionText: 'Acetaldehyde (Ethanal)' },
      { optionLabel: 'D', optionText: 'Prop-2-en-1-ol' },
    ],
    correctOption: 'C',
    explanation: 'Acetaldehyde (CH3CHO) has a CH3C=O group (gives positive iodoform test) and is an aldehyde (gives positive Tollens’ silver mirror test).',
    ncertReference: 'NCERT Class 12 Chemistry, Chapter 12 (Aldehydes, Ketones & Carboxylic Acids)',
  },
  {
    id: 'bank_chem_004',
    subjectId: 'chemistry',
    unitId: 'chem_u3',
    unitName: 'Chemical Thermodynamics & Equilibrium',
    chapterName: 'Equilibrium (Chemical & Ionic)',
    questionText: 'Given below are two statements:\nAssertion (A): Addition of an inert gas at constant volume to an equilibrium mixture has no effect on the equilibrium position.\nReason (R): Addition of inert gas at constant volume does not change the partial pressures or molar concentrations of the reacting species.',
    difficulty: 5,
    difficultyCategory: 'MEDIUM',
    questionType: 'ASSERTION_REASON',
    options: [
      { optionLabel: 'A', optionText: 'Both (A) and (R) are correct and (R) is the correct explanation of (A).' },
      { optionLabel: 'B', optionText: 'Both (A) and (R) are correct but (R) is NOT the correct explanation of (A).' },
      { optionLabel: 'C', optionText: '(A) is correct but (R) is incorrect.' },
      { optionLabel: 'D', optionText: '(A) is incorrect but (R) is correct.' },
    ],
    correctOption: 'A',
    explanation: 'At constant volume, V is fixed, so n_i / V for each reactant/product remains unchanged when inert gas is added. Thus, total pressure increases but partial pressures of reactants/products remain constant.',
    ncertReference: 'NCERT Class 11 Chemistry, Chapter 7 (Equilibrium)',
  },

  // ─────────────────────────────────────────────────────────────
  // BOTANY QUESTIONS (Difficulty 1-10)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bank_bot_001',
    subjectId: 'botany',
    unitId: 'bot_u5',
    unitName: 'Plant Reproduction & Genetics',
    chapterName: 'Molecular Basis of Inheritance',
    questionText: 'During DNA replication in E. coli, the enzyme responsible for unwinding the double helix at the replication fork is:',
    difficulty: 2,
    difficultyCategory: 'EASY',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: 'DNA Polymerase I' },
      { optionLabel: 'B', optionText: 'DNA Helicase' },
      { optionLabel: 'C', optionText: 'DNA Ligase' },
      { optionLabel: 'D', optionText: 'RNA Primase' },
    ],
    correctOption: 'B',
    explanation: 'DNA Helicase breaks the hydrogen bonds between complementary base pairs to unwind the double helix at the replication fork.',
    ncertReference: 'NCERT Class 12 Biology, Chapter 6 (Molecular Basis of Inheritance)',
  },
  {
    id: 'bank_bot_002',
    subjectId: 'botany',
    unitId: 'bot_u5',
    unitName: 'Plant Reproduction & Genetics',
    chapterName: 'Principles of Inheritance & Variation',
    questionText: 'In a dihybrid cross between yellow round seed pea plants (YyRr) and green wrinkled seed pea plants (yyrr), the phenotypic ratio of offspring will be:',
    difficulty: 4,
    difficultyCategory: 'MEDIUM',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: '9 : 3 : 3 : 1' },
      { optionLabel: 'B', optionText: '1 : 1 : 1 : 1' },
      { optionLabel: 'C', optionText: '3 : 1' },
      { optionLabel: 'D', optionText: '9 : 7' },
    ],
    correctOption: 'B',
    explanation: 'This is a dihybrid test cross (YyRr × yyrr). The resulting phenotypic ratio is 1 Yellow Round : 1 Yellow Wrinkled : 1 Green Round : 1 Green Wrinkled (1:1:1:1).',
    ncertReference: 'NCERT Class 12 Biology, Chapter 5 (Principles of Inheritance)',
  },
  {
    id: 'bank_bot_003',
    subjectId: 'botany',
    unitId: 'bot_u4',
    unitName: 'Plant Physiology',
    chapterName: 'Photosynthesis & Plant Respiration',
    questionText: 'Given below are two statements:\nStatement I: C4 plants are thermally more efficient and possess Kranz anatomy.\nStatement II: The primary CO2 acceptor in C4 plants is phosphoenolpyruvate (PEP) located in bundle sheath cells.',
    difficulty: 6,
    difficultyCategory: 'MEDIUM',
    questionType: 'STATEMENT_BASED',
    options: [
      { optionLabel: 'A', optionText: 'Both Statement I and Statement II are correct.' },
      { optionLabel: 'B', optionText: 'Both Statement I and Statement II are incorrect.' },
      { optionLabel: 'C', optionText: 'Statement I is correct but Statement II is incorrect.' },
      { optionLabel: 'D', optionText: 'Statement I is incorrect but Statement II is correct.' },
    ],
    correctOption: 'C',
    explanation: 'Statement I is correct (C4 plants have Kranz anatomy and higher thermal optimum). Statement II is INCORRECT because PEP acceptor is located in MESOPHYLL cells, not bundle sheath cells.',
    ncertReference: 'NCERT Class 11 Biology, Chapter 13 (Photosynthesis in Higher Plants)',
  },
  {
    id: 'bank_bot_004',
    subjectId: 'botany',
    unitId: 'bot_u6',
    unitName: 'Ecology & Environment',
    chapterName: 'Organisms, Ecosystem & Biodiversity',
    questionText: 'Which of the following is an example of an In-situ conservation strategy for biodiversity?',
    difficulty: 2,
    difficultyCategory: 'EASY',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: 'Botanical Gardens' },
      { optionLabel: 'B', optionText: 'Zoological Parks' },
      { optionLabel: 'C', optionText: 'National Parks & Biosphere Reserves' },
      { optionLabel: 'D', optionText: 'Cryopreservation of Gametes' },
    ],
    correctOption: 'C',
    explanation: 'National Parks, Biosphere Reserves, and Wildlife Sanctuaries conserve species within their natural ecosystem (In-situ). Botanical gardens and cryopreservation are Ex-situ.',
    ncertReference: 'NCERT Class 12 Biology, Chapter 15 (Biodiversity and Conservation)',
  },

  // ─────────────────────────────────────────────────────────────
  // ZOOLOGY QUESTIONS (Difficulty 1-10)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bank_zoo_001',
    subjectId: 'zoology',
    unitId: 'zoo_u2',
    unitName: 'Human Physiology',
    chapterName: 'Body Fluids & Circulation',
    questionText: 'In a standard ECG waveform shown below, the QRS complex represents:',
    difficulty: 3,
    difficultyCategory: 'EASY',
    questionType: 'DIAGRAM',
    hasImage: true,
    svgDiagram: `<svg width="300" height="120" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="120" fill="#0B0F17" rx="8"/><path d="M 20 60 L 60 60 Q 75 40 90 60 L 105 75 L 120 15 L 135 95 L 150 60 Q 180 40 210 60 L 280 60" stroke="#10B981" stroke-width="2.5" fill="none"/><text x="80" y="35" fill="#A5B4FC" font-weight="bold">P</text><text x="100" y="85" fill="#EF4444" font-weight="bold">Q</text><text x="120" y="10" fill="#EF4444" font-weight="bold">R</text><text x="138" y="110" fill="#EF4444" font-weight="bold">S</text><text x="195" y="35" fill="#A5B4FC" font-weight="bold">T</text></svg>`,
    options: [
      { optionLabel: 'A', optionText: 'Depolarisation of Atria' },
      { optionLabel: 'B', optionText: 'Depolarisation of Ventricles' },
      { optionLabel: 'C', optionText: 'Repolarisation of Ventricles' },
      { optionLabel: 'D', optionText: 'Repolarisation of Atria' },
    ],
    correctOption: 'B',
    explanation: 'The P-wave represents atrial depolarisation. The QRS complex represents ventricular depolarisation (which initiates ventricular contraction). The T-wave represents ventricular repolarisation.',
    ncertReference: 'NCERT Class 11 Biology, Chapter 18 (Body Fluids and Circulation)',
  },
  {
    id: 'bank_zoo_002',
    subjectId: 'zoology',
    unitId: 'zoo_u5',
    unitName: 'Biotechnology & Human Health',
    chapterName: 'Biotechnology - Principles & Processes',
    questionText: 'Which restriction endonuclease produces sticky ends with 5′-overhangs by cleaving the palindromic sequence 5′-G↓AATTC-3′?',
    difficulty: 4,
    difficultyCategory: 'MEDIUM',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: 'HindIII' },
      { optionLabel: 'B', optionText: 'EcoRI' },
      { optionLabel: 'C', optionText: 'BamHI' },
      { optionLabel: 'D', optionText: 'SmaI' },
    ],
    correctOption: 'B',
    explanation: 'EcoRI recognizes 5′-GAATTC-3′ and cuts between G and A, producing sticky complementary overhangs.',
    ncertReference: 'NCERT Class 12 Biology, Chapter 11 (Biotechnology Principles)',
  },
  {
    id: 'bank_zoo_003',
    subjectId: 'zoology',
    unitId: 'zoo_u3',
    unitName: 'Human Reproduction & Health',
    chapterName: 'Human Reproduction System',
    questionText: 'Given below are two statements:\nAssertion (A): Corpus luteum secretes large amounts of progesterone which is essential for maintenance of the endometrium.\nReason (R): In the absence of fertilization, corpus luteum degenerates into corpus albicans causing disintegration of endometrium and menstruation.',
    difficulty: 5,
    difficultyCategory: 'MEDIUM',
    questionType: 'ASSERTION_REASON',
    options: [
      { optionLabel: 'A', optionText: 'Both (A) and (R) are correct and (R) is the correct explanation of (A).' },
      { optionLabel: 'B', optionText: 'Both (A) and (R) are correct but (R) is NOT the correct explanation of (A).' },
      { optionLabel: 'C', optionText: '(A) is correct but (R) is incorrect.' },
      { optionLabel: 'D', optionText: '(A) is incorrect but (R) is correct.' },
    ],
    correctOption: 'B',
    explanation: 'Both statements are scientifically correct NCERT facts. However, (R) explains what happens when fertilization fails, rather than explaining why progesterone is required for endometrial maintenance.',
    ncertReference: 'NCERT Class 12 Biology, Chapter 3 (Human Reproduction)',
  },
  {
    id: 'bank_zoo_004',
    subjectId: 'zoology',
    unitId: 'zoo_u5',
    unitName: 'Biotechnology & Human Health',
    chapterName: 'Human Health and Disease',
    questionText: 'The active form of Entamoeba histolytica feeds upon:',
    difficulty: 3,
    difficultyCategory: 'EASY',
    questionType: 'SINGLE_CORRECT',
    options: [
      { optionLabel: 'A', optionText: 'Mucosa and submucosa of colon only' },
      { optionLabel: 'B', optionText: 'Erythrocytes, mucosa and submucosa of colon' },
      { optionLabel: 'C', optionText: 'Food matter in large intestine' },
      { optionLabel: 'D', optionText: 'Intestinal flora only' },
    ],
    correctOption: 'B',
    explanation: 'Trophozoite (active stage of Entamoeba histolytica) secretes histolysin, invading mucosa/submucosa of the large intestine and ingesting RBCs.',
    ncertReference: 'NCERT Class 12 Biology, Chapter 8 (Human Health and Disease)',
  },
];
