/**
 * MediAssist AI — Hospital Internal Database & Clinical Knowledge Graph
 * Source of truth for 15 departments, certified doctor roster, clinical red flags,
 * adaptive question trees, and realistic hospital schedules.
 */

export const HOSPITAL_INFO = {
  name: "MediAssist Multi-Specialty Hospital & Research Center",
  tagline: "Excellence in Clinical Care & AI-Powered Patient Navigation",
  emergencyContact: "911 / 108 / 112",
  erHotline: "+1 (800) 555-9111",
  mainDesk: "+1 (800) 555-0100",
  address: "Building 4, Healthcare Boulevard, Metro Medical District",
  erLocation: "Emergency Wing, Ground Floor (Ambulance Bay Entry, Open 24/7)"
};

export const DEPARTMENTS = [
  {
    id: "general-medicine",
    name: "General Medicine",
    icon: "stethoscope",
    floor: "2nd Floor, Main Wing",
    roomRange: "201 - 215",
    description: "Comprehensive primary care, diagnostic evaluations, acute and chronic illness management.",
    phone: "ext. 2010",
    chief: "Dr. Anil Kumar, MD"
  },
  {
    id: "cardiology",
    name: "Cardiology",
    icon: "heart-pulse",
    floor: "3rd Floor, Heart Pavilion",
    roomRange: "301 - 315",
    description: "Advanced cardiac care, ECG, echocardiography, hypertension and heart disease management.",
    phone: "ext. 3010",
    chief: "Dr. Rajeshwar Rao, MD, DM"
  },
  {
    id: "dermatology",
    name: "Dermatology",
    icon: "sparkles",
    floor: "1st Floor, East Wing",
    roomRange: "120 - 130",
    description: "Clinical skin evaluations, allergic reactions, eczema, psoriasis, and cosmetic dermatology.",
    phone: "ext. 1200",
    chief: "Dr. Sneha Reddy, MD, DNB"
  },
  {
    id: "neurology",
    name: "Neurology",
    icon: "brain",
    floor: "4th Floor, Neuro Sciences",
    roomRange: "401 - 415",
    description: "Evaluation of headaches, migraines, neuropathies, seizure disorders, and stroke recovery.",
    phone: "ext. 4010",
    chief: "Dr. Vikram Sethi, MD, DM (Neuro)"
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    icon: "bone",
    floor: "Ground Floor, South Wing",
    roomRange: "040 - 055",
    description: "Bone and joint health, arthritis, sports injuries, knee and hip replacements, and spine care.",
    phone: "ext. 0450",
    chief: "Dr. Ramesh Babu, MS (Ortho)"
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    icon: "baby",
    floor: "2nd Floor, West Wing",
    roomRange: "230 - 245",
    description: "Child and adolescent healthcare, vaccinations, developmental assessments, and childhood illnesses.",
    phone: "ext. 2300",
    chief: "Dr. Meera Nambiar, MD (Ped)"
  },
  {
    id: "gynecology",
    name: "Gynecology & Obstetrics",
    icon: "flower-2",
    floor: "3rd Floor, Women's Center",
    roomRange: "340 - 355",
    description: "Women's wellness, prenatal and postnatal care, hormonal health, and reproductive medicine.",
    phone: "ext. 3400",
    chief: "Dr. Sunita Deshmukh, MD, FICOG"
  },
  {
    id: "ent",
    name: "ENT (Ear, Nose & Throat)",
    icon: "headset",
    floor: "1st Floor, Main Wing",
    roomRange: "105 - 118",
    description: "Sinus disorders, tonsillitis, hearing evaluations, vertigo, and throat pathologies.",
    phone: "ext. 1050",
    chief: "Dr. K. Srinivas, MS (ENT)"
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    icon: "eye",
    floor: "1st Floor, Vision Wing",
    roomRange: "160 - 175",
    description: "Comprehensive vision testing, cataracts, glaucoma, retinal screenings, and ocular infections.",
    phone: "ext. 1600",
    chief: "Dr. Arvind Chander, MS (Ophth)"
  },
  {
    id: "psychiatry",
    name: "Psychiatry & Behavioral Health",
    icon: "smile",
    floor: "5th Floor, Quiet Pavillion",
    roomRange: "501 - 512",
    description: "Mental wellness counseling, anxiety, mood disorders, stress management, and behavioral health.",
    phone: "ext. 5010",
    chief: "Dr. Radhika Roy, MD (Psychiatry)"
  },
  {
    id: "urology",
    name: "Urology & Nephrology",
    icon: "activity",
    floor: "4th Floor, East Wing",
    roomRange: "430 - 442",
    description: "Kidney stones, urinary tract infections, renal assessments, and prostate health.",
    phone: "ext. 4300",
    chief: "Dr. Suresh Varma, MCh (Uro)"
  },
  {
    id: "gastroenterology",
    name: "Gastroenterology",
    icon: "utensils",
    floor: "3rd Floor, Main Wing",
    roomRange: "320 - 335",
    description: "Digestive tract health, liver function, GERD, abdominal pain evaluations, and endoscopy.",
    phone: "ext. 3200",
    chief: "Dr. Farhan Qureshi, MD, DM (Gastro)"
  },
  {
    id: "pulmonology",
    name: "Pulmonology & Chest Medicine",
    icon: "wind",
    floor: "2nd Floor, Respiratory Wing",
    roomRange: "260 - 275",
    description: "Asthma, chronic bronchitis, allergy-induced coughing, sleep apnea, and lung health.",
    phone: "ext. 2600",
    chief: "Dr. Preeti Khurana, MD, FCCP"
  },
  {
    id: "dentistry",
    name: "Dental Care & Maxillofacial",
    icon: "smile-plus",
    floor: "Ground Floor, Clinic Wing",
    roomRange: "010 - 022",
    description: "Preventative dental care, root canals, oral surgery, toothaches, and gum health.",
    phone: "ext. 0100",
    chief: "Dr. Deepak Mehta, MDS"
  },
  {
    id: "emergency-medicine",
    name: "Emergency Medicine",
    icon: "alert-octagon",
    floor: "Ground Floor, ER Wing",
    roomRange: "Triage & Trauma Bays 1-12",
    description: "Level-1 24/7 Trauma, acute resuscitation, chest pain, stroke, and life-threatening emergencies.",
    phone: "ER Hotline (24/7)",
    chief: "Dr. Marcus Vance, MD (Emergency Medicine)"
  }
];

export const INITIAL_DOCTORS = [
  {
    doctor_id: "DOC-101",
    name: "Dr. Anil Kumar",
    specialization: "General Medicine",
    sub_specialization: "Internal Medicine & Fever Management",
    department: "General Medicine",
    experience: 14,
    qualifications: "MBBS, MD (Internal Medicine)",
    languages: ["English", "Telugu", "Hindi"],
    consultation_fee: 50,
    hospital_location: "Main Hospital, 2nd Floor",
    room_number: "204",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    available_time: "09:00 AM - 05:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.8,
    reviews_count: 312,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-102",
    name: "Dr. Priya Sharma",
    specialization: "General Medicine",
    sub_specialization: "Primary Care & Preventative Health",
    department: "General Medicine",
    experience: 9,
    qualifications: "MBBS, DNB (Family Medicine)",
    languages: ["English", "Hindi"],
    consultation_fee: 45,
    hospital_location: "Main Hospital, 2nd Floor",
    room_number: "208",
    available_days: ["Monday", "Wednesday", "Friday"],
    available_time: "10:00 AM - 06:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.9,
    reviews_count: 245,
    avatar: "https://images.unsplash.com/photo-1594824813589-325b7468641a?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-103",
    name: "Dr. Ravi Teja",
    specialization: "General Medicine",
    sub_specialization: "Geriatric Medicine & Chronic Care",
    department: "General Medicine",
    experience: 16,
    qualifications: "MBBS, MD",
    languages: ["English", "Telugu"],
    consultation_fee: 55,
    hospital_location: "Main Hospital, 2nd Floor",
    room_number: "212",
    available_days: ["Tuesday", "Thursday", "Saturday"],
    available_time: "08:30 AM - 04:30 PM",
    appointment_duration: 30,
    online_consultation: false,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.7,
    reviews_count: 189,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-201",
    name: "Dr. Rajeshwar Rao",
    specialization: "Cardiology",
    sub_specialization: "Interventional Cardiology & Arrhythmia",
    department: "Cardiology",
    experience: 20,
    qualifications: "MBBS, MD, DM (Cardiology), FACC",
    languages: ["English", "Telugu", "Hindi"],
    consultation_fee: 80,
    hospital_location: "Heart Pavilion, 3rd Floor",
    room_number: "305",
    available_days: ["Monday", "Tuesday", "Thursday", "Friday"],
    available_time: "10:00 AM - 04:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.95,
    reviews_count: 512,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-202",
    name: "Dr. Ananya Sen",
    specialization: "Cardiology",
    sub_specialization: "Preventative Cardiology & Hypertension",
    department: "Cardiology",
    experience: 11,
    qualifications: "MBBS, MD, DNB (Cardiology)",
    languages: ["English", "Hindi"],
    consultation_fee: 70,
    hospital_location: "Heart Pavilion, 3rd Floor",
    room_number: "308",
    available_days: ["Wednesday", "Friday", "Saturday"],
    available_time: "09:00 AM - 03:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.85,
    reviews_count: 198,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-301",
    name: "Dr. Sneha Reddy",
    specialization: "Dermatology",
    sub_specialization: "Allergic Dermatitis & Clinical Trichology",
    department: "Dermatology",
    experience: 12,
    qualifications: "MBBS, MD (Dermatology), DNB",
    languages: ["English", "Telugu", "Hindi"],
    consultation_fee: 55,
    hospital_location: "East Wing, 1st Floor",
    room_number: "124",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    available_time: "10:00 AM - 05:00 PM",
    appointment_duration: 20,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.9,
    reviews_count: 420,
    avatar: "https://images.unsplash.com/photo-1594824813589-325b7468641a?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-302",
    name: "Dr. Tarun Verma",
    specialization: "Dermatology",
    sub_specialization: "Pediatric Dermatology & Eczema",
    department: "Dermatology",
    experience: 8,
    qualifications: "MBBS, DVD, MD",
    languages: ["English", "Hindi"],
    consultation_fee: 50,
    hospital_location: "East Wing, 1st Floor",
    room_number: "128",
    available_days: ["Tuesday", "Thursday", "Saturday"],
    available_time: "11:00 AM - 06:00 PM",
    appointment_duration: 20,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.75,
    reviews_count: 156,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-401",
    name: "Dr. Vikram Sethi",
    specialization: "Neurology",
    sub_specialization: "Headache Medicine & Epilepsy",
    department: "Neurology",
    experience: 17,
    qualifications: "MBBS, MD (Medicine), DM (Neurology)",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 75,
    hospital_location: "Neuro Sciences, 4th Floor",
    room_number: "406",
    available_days: ["Monday", "Wednesday", "Friday"],
    available_time: "09:30 AM - 04:30 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.9,
    reviews_count: 275,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-501",
    name: "Dr. Ramesh Babu",
    specialization: "Orthopedics",
    sub_specialization: "Knee & Joint Replacement, Sports Arthroscopy",
    department: "Orthopedics",
    experience: 18,
    qualifications: "MBBS, MS (Orthopedics), MCh",
    languages: ["English", "Telugu", "Hindi"],
    consultation_fee: 65,
    hospital_location: "South Wing, Ground Floor",
    room_number: "048",
    available_days: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    available_time: "09:00 AM - 05:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.85,
    reviews_count: 388,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-601",
    name: "Dr. Meera Nambiar",
    specialization: "Pediatrics",
    sub_specialization: "General Pediatrics & Neonatal Care",
    department: "Pediatrics",
    experience: 13,
    qualifications: "MBBS, MD (Pediatrics), DCH",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 50,
    hospital_location: "West Wing, 2nd Floor",
    room_number: "234",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    available_time: "09:00 AM - 04:00 PM",
    appointment_duration: 20,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.92,
    reviews_count: 460,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-701",
    name: "Dr. Sunita Deshmukh",
    specialization: "Gynecology & Obstetrics",
    sub_specialization: "Reproductive Medicine & High-Risk Pregnancy",
    department: "Gynecology & Obstetrics",
    experience: 19,
    qualifications: "MBBS, MS (OBG), FICOG",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 65,
    hospital_location: "Women's Center, 3rd Floor",
    room_number: "348",
    available_days: ["Monday", "Wednesday", "Thursday", "Saturday"],
    available_time: "10:00 AM - 05:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.9,
    reviews_count: 390,
    avatar: "https://images.unsplash.com/photo-1594824813589-325b7468641a?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-801",
    name: "Dr. K. Srinivas",
    specialization: "ENT (Ear, Nose & Throat)",
    sub_specialization: "Rhinology & Sinus Surgery",
    department: "ENT (Ear, Nose & Throat)",
    experience: 15,
    qualifications: "MBBS, MS (ENT), DLO",
    languages: ["English", "Telugu", "Hindi"],
    consultation_fee: 50,
    hospital_location: "Main Wing, 1st Floor",
    room_number: "112",
    available_days: ["Tuesday", "Wednesday", "Friday", "Saturday"],
    available_time: "09:00 AM - 04:00 PM",
    appointment_duration: 20,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.8,
    reviews_count: 220,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-901",
    name: "Dr. Arvind Chander",
    specialization: "Ophthalmology",
    sub_specialization: "Cataract & Glaucoma",
    department: "Ophthalmology",
    experience: 14,
    qualifications: "MBBS, MS (Ophthalmology)",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 50,
    hospital_location: "Vision Wing, 1st Floor",
    room_number: "168",
    available_days: ["Monday", "Tuesday", "Thursday", "Friday"],
    available_time: "09:30 AM - 03:30 PM",
    appointment_duration: 20,
    online_consultation: false,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.85,
    reviews_count: 270,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-1001",
    name: "Dr. Farhan Qureshi",
    specialization: "Gastroenterology",
    sub_specialization: "Hepatology & Acid Reflux Disorders",
    department: "Gastroenterology",
    experience: 16,
    qualifications: "MBBS, MD, DM (Gastroenterology)",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 70,
    hospital_location: "Main Wing, 3rd Floor",
    room_number: "328",
    available_days: ["Monday", "Wednesday", "Friday"],
    available_time: "10:00 AM - 05:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.88,
    reviews_count: 310,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-1101",
    name: "Dr. Preeti Khurana",
    specialization: "Pulmonology & Chest Medicine",
    sub_specialization: "Asthma, COPD & Respiratory Allergies",
    department: "Pulmonology & Chest Medicine",
    experience: 12,
    qualifications: "MBBS, MD (Pulmonary Medicine)",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 65,
    hospital_location: "Respiratory Wing, 2nd Floor",
    room_number: "268",
    available_days: ["Tuesday", "Thursday", "Saturday"],
    available_time: "09:00 AM - 04:00 PM",
    appointment_duration: 30,
    online_consultation: true,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.86,
    reviews_count: 195,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
  },
  {
    doctor_id: "DOC-1201",
    name: "Dr. Deepak Mehta",
    specialization: "Dental Care & Maxillofacial",
    sub_specialization: "Endodontics & Restorative Dentistry",
    department: "Dental Care & Maxillofacial",
    experience: 11,
    qualifications: "BDS, MDS (Conservative Dentistry)",
    languages: ["English", "Hindi", "Telugu"],
    consultation_fee: 40,
    hospital_location: "Clinic Wing, Ground Floor",
    room_number: "016",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    available_time: "09:30 AM - 06:00 PM",
    appointment_duration: 30,
    online_consultation: false,
    in_person_consultation: true,
    current_status: "Active",
    rating: 4.8,
    reviews_count: 230,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
  }
];

/**
 * Red-Flag Emergency Symptoms Registry
 * If any of these trigger patterns are identified, immediately escalate to Emergency Care.
 */
export const EMERGENCY_RED_FLAGS = [
  {
    id: "severe-chest-pain",
    keywords: ["severe chest pain", "chest pressure", "crushing chest", "heart attack", "radiating to left arm", "chest squeezing"],
    title: "Severe Chest Pain / Possible Cardiac Event",
    action: "Call Emergency Services (911 / 108 / 112) or go to nearest ER immediately."
  },
  {
    id: "severe-shortness-breath",
    keywords: ["cannot breathe", "gasping for air", "severe shortness of breath", "struggling to breathe", "blue lips", "choking"],
    title: "Acute Respiratory Distress",
    action: "Immediate emergency oxygenation and clinical stabilization needed."
  },
  {
    id: "stroke-signs",
    keywords: ["face drooping", "arm weakness", "slurred speech", "sudden paralysis", "cannot speak", "facial numbness on one side", "sudden loss of balance"],
    title: "Possible Acute Stroke (FAST Protocol)",
    action: "Time-critical emergency evaluation required within golden window."
  },
  {
    id: "severe-bleeding",
    keywords: ["severe bleeding", "bleeding that won't stop", "spurting blood", "vomiting blood", "coughing up blood"],
    title: "Uncontrolled Hemorrhage",
    action: "Apply direct firm pressure and call emergency services."
  },
  {
    id: "loss-of-consciousness",
    keywords: ["passed out", "unconscious", "fainted and won't wake up", "collapsed", "blackout unresponsive"],
    title: "Loss of Consciousness / Unresponsive Patient",
    action: "Emergency resuscitation and immediate neurological evaluation required."
  },
  {
    id: "severe-allergic-reaction",
    keywords: ["anaphylaxis", "throat closing", "swollen tongue", "cannot swallow allergic", "hives with breathing difficulty"],
    title: "Severe Allergic Reaction (Anaphylaxis)",
    action: "Administer Epipen if available and dial emergency immediately."
  },
  {
    id: "seizure",
    keywords: ["active seizure", "convulsions", "epileptic fit", "shaking uncontrollably"],
    title: "Active Seizure / Status Epilepticus",
    action: "Keep patient safe from injury, do not restrain, call ER immediately."
  },
  {
    id: "suicidal-emergency",
    keywords: ["suicide", "want to end my life", "kill myself", "severe self-harm"],
    title: "Acute Mental Health Crisis / Emergency",
    action: "Contact Suicide & Crisis Lifeline (988) or Hospital Crisis Intervention Team."
  },
  {
    id: "acute-abdomen",
    keywords: ["severe unbearable stomach pain", "rigid board-like abdomen", "vomiting black coffee ground", "knife-like abdominal pain"],
    title: "Acute Surgical Abdomen",
    action: "Do not eat or drink anything. Proceed directly to Hospital ER."
  }
];

/**
 * Adaptive Clinical Follow-up Tree
 */
export const ADAPTIVE_QUESTIONS = {
  "fever": {
    question: "How high has your temperature been, and do you experience chills?",
    options: ["Mild (99-100°F)", "Moderate (101-102°F)", "High (>103°F)", "Comes and goes with chills"]
  },
  "cough": {
    question: "Is your cough dry or producing phlegm/mucus?",
    options: ["Dry cough", "Cough with clear mucus", "Cough with yellow/green phlegm", "Barking sound / wheezing"]
  },
  "sore throat": {
    question: "How severe is your throat discomfort when swallowing?",
    options: ["Mild scratchiness", "Moderate pain", "Severe pain / difficulty swallowing solids", "Cannot swallow liquids"]
  },
  "stomach pain": {
    question: "Where exactly in your abdomen is the discomfort located?",
    options: ["Upper abdomen", "Lower abdomen", "Right side", "Left side", "Around belly button", "Entire abdomen"]
  },
  "headache": {
    question: "How did the headache develop and where do you feel it?",
    options: ["Gradual dull tension", "Throbbing on one side (migraine-like)", "Behind both eyes / forehead", "Sudden severe onset"]
  },
  "knee pain": {
    question: "Is there visible swelling or difficulty bearing weight?",
    options: ["Mild ache when walking", "Swollen and warm to touch", "Cannot put any weight on it", "Popping or clicking sound"]
  },
  "skin rash": {
    question: "Is the rash accompanied by itching, blistering, or flaking?",
    options: ["Intense itching", "Dry scaly patches", "Raised red bumps / hives", "Spreading quickly"]
  }
};

/**
 * Configurable Specialty Mapping Rules
 */
export const SPECIALTY_ROUTING_RULES = [
  {
    department: "General Medicine",
    symptoms: ["fever", "cough", "sore throat", "fatigue", "body ache", "flu", "weakness", "cold", "chills"],
    conditions: ["Viral upper respiratory tract infection", "Influenza-like illness", "Acute viral pharyngitis"],
    rationale: "Your constitutional symptoms are commonly evaluated and treated by a General Medicine physician."
  },
  {
    department: "Dermatology",
    symptoms: ["skin rash", "itching", "acne", "eczema", "hives", "skin bumps", "hair loss", "flaking skin"],
    conditions: ["Contact dermatitis", "Allergic eczema", "Urticaria / cutaneous eruption"],
    rationale: "Skin, hair, and scalp presentations are best examined clinically by a board-certified Dermatologist."
  },
  {
    department: "Orthopedics",
    symptoms: ["knee pain", "joint stiffness", "back pain", "sprain", "shoulder ache", "difficulty walking", "swollen joint"],
    conditions: ["Mechanical joint strain", "Tendinopathy / ligament sprain", "Musculoskeletal inflammation"],
    rationale: "Musculoskeletal and joint symptoms should be physically evaluated by an Orthopedic specialist."
  },
  {
    department: "Gastroenterology",
    symptoms: ["stomach pain", "acid reflux", "heartburn", "indigestion", "nausea", "bloating", "vomiting", "diarrhea"],
    conditions: ["Gastroesophageal reflux (GERD)", "Gastritis / dyspepsia", "Gastroenteritis"],
    rationale: "Digestive discomfort and abdominal symptoms are systematically evaluated by a Gastroenterologist."
  },
  {
    department: "Neurology",
    symptoms: ["headache", "migraine", "dizziness", "vertigo", "tingling sensation", "numbness in fingers", "nerve pain"],
    conditions: ["Tension headache", "Migraine with or without aura", "Peripheral paresthesia"],
    rationale: "Persistent cranial or neurosensory symptoms are best investigated by a Neurologist."
  },
  {
    department: "Cardiology",
    symptoms: ["palpitations", "heart racing", "mild chest tightness", "fluttering in chest", "high blood pressure"],
    conditions: ["Benign tachycardia", "Hypertensive elevation", "Cardiovascular stress response"],
    rationale: "Cardiovascular symptoms warrant clinical assessment and resting ECG by a Cardiologist."
  },
  {
    department: "ENT (Ear, Nose & Throat)",
    symptoms: ["earache", "hearing muffled", "sinus pressure", "blocked nose", "ringing in ear", "nasal congestion"],
    conditions: ["Acute sinusitis", "Otitis externa / middle ear effusion", "Eustachian tube congestion"],
    rationale: "Ear, nasal passage, and sinus issues are directly diagnosed by an ENT specialist."
  },
  {
    department: "Pulmonology & Chest Medicine",
    symptoms: ["chronic cough", "wheezing", "asthma flare", "chest congestion", "shallow breath"],
    conditions: ["Hyperreactive airway / asthma", "Acute bronchitis", "Bronchial congestion"],
    rationale: "Lower respiratory and lung-related conditions are managed by a Pulmonology specialist."
  },
  {
    department: "Dental Care & Maxillofacial",
    symptoms: ["toothache", "gum bleeding", "tooth sensitivity", "jaw pain", "broken tooth"],
    conditions: ["Dental pulpitis / cavity", "Gingivitis", "Temporomandibular discomfort"],
    rationale: "Oral cavity and dental symptoms should be examined directly in the Dental Clinic."
  },
  {
    department: "Pediatrics",
    symptoms: ["child fever", "baby cough", "toddler rash", "pediatric ear pain"],
    conditions: ["Pediatric viral illness", "Childhood viral exanthem", "Otitis media"],
    rationale: "Patients under 16 years of age are specially evaluated by our Pediatric physicians."
  }
];

export const INITIAL_PATIENTS = [
  {
    patient_id: "PAT-001",
    name: "John Doe",
    age: 34,
    gender: "Male",
    phone: "+1 (555) 234-5678",
    email: "john.doe@example.com",
    preferred_language: "English",
    created_at: "2026-09-08T10:00:00Z"
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    appointment_id: "MA-20260909-00125",
    patient_id: "PAT-001",
    doctor_id: "DOC-101",
    doctor_name: "Dr. Anil Kumar",
    department: "General Medicine",
    date: "2026-09-09",
    time: "04:00 PM",
    appointment_type: "In-Person Consultation",
    hospital_location: "Main Hospital, 2nd Floor, Room 204",
    status: "Confirmed",
    symptoms_summary: "Fever, cough and sore throat for 3 days",
    consultation_fee: 50,
    created_at: "2026-09-09T09:30:00Z"
  }
];
