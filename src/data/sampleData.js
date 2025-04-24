export const competencyData = [
  { subject: "Leadership", A: 120, B: 110, C: 140, D: 90, fullMark: 150 },
  { subject: "Situation Management", A: 98, B: 130, C: 110, D: 100, fullMark: 150 },
  { subject: "Quality of Healthcare", A: 86, B: 130, C: 70, D: 120, fullMark: 150 },
  { subject: "Relationship Building", A: 99, B: 100, C: 120, D: 110, fullMark: 150 },
]

export const subCompetencyLeadership = [
  { subject: "Mentoring", A: 110, B: 90, C: 120, D: 85, fullMark: 150 },
  { subject: "Taking Initiative", A: 130, B: 100, C: 130, D: 95, fullMark: 150 },
  { subject: "Conflict Management", A: 90, B: 120, C: 100, D: 110, fullMark: 150 },
  { subject: "Ambition", A: 105, B: 95, C: 125, D: 100, fullMark: 150 },
]

export const subCompetencySituation = [
  { subject: "Crisis Response", A: 95, B: 125, C: 105, D: 90, fullMark: 150 },
  { subject: "Decision Making", A: 100, B: 135, C: 115, D: 105, fullMark: 150 },
  { subject: "Resource Allocation", A: 105, B: 130, C: 100, D: 95, fullMark: 150 },
  { subject: "Stress Management", A: 90, B: 125, C: 120, D: 110, fullMark: 150 },
]

export const subCompetencyQuality = [
  { subject: "Patient Safety", A: 90, B: 135, C: 75, D: 125, fullMark: 150 },
  { subject: "Protocol Adherence", A: 85, B: 130, C: 70, D: 120, fullMark: 150 },
  { subject: "Documentation", A: 80, B: 125, C: 65, D: 115, fullMark: 150 },
  { subject: "Continuous Improvement", A: 90, B: 130, C: 75, D: 120, fullMark: 150 },
]

export const subCompetencyRelationship = [
  { subject: "Patient Communication", A: 105, B: 95, C: 125, D: 115, fullMark: 150 },
  { subject: "Team Collaboration", A: 100, B: 105, C: 120, D: 110, fullMark: 150 },
  { subject: "Conflict Resolution", A: 95, B: 100, C: 115, D: 105, fullMark: 150 },
  { subject: "Empathy", A: 95, B: 100, C: 120, D: 110, fullMark: 150 },
]

export const barData = [
  { name: "New Delhi", Leadership: 120, SituationManagement: 98, QualityOfHealthcare: 86, RelationshipBuilding: 99 },
  { name: "Jaipur", Leadership: 110, SituationManagement: 130, QualityOfHealthcare: 130, RelationshipBuilding: 100 },
  { name: "Patiala", Leadership: 140, SituationManagement: 110, QualityOfHealthcare: 70, RelationshipBuilding: 120 },
  { name: "Salt Lake", Leadership: 90, SituationManagement: 100, QualityOfHealthcare: 120, RelationshipBuilding: 110 },
  { name: "Gurugram", Leadership: 105, SituationManagement: 115, QualityOfHealthcare: 95, RelationshipBuilding: 105 },
  { name: "Ghaziabad", Leadership: 95, SituationManagement: 125, QualityOfHealthcare: 85, RelationshipBuilding: 115 },
  { name: "Bengaluru", Leadership: 115, SituationManagement: 105, QualityOfHealthcare: 105, RelationshipBuilding: 95 },
  { name: "Jayanagar", Leadership: 100, SituationManagement: 110, QualityOfHealthcare: 90, RelationshipBuilding: 110 },
  { name: "Baner Pune", Leadership: 110, SituationManagement: 100, QualityOfHealthcare: 100, RelationshipBuilding: 100 },
  { name: "Mangalore", Leadership: 105, SituationManagement: 95, QualityOfHealthcare: 95, RelationshipBuilding: 105 },
  { name: "Panaji", Leadership: 95, SituationManagement: 105, QualityOfHealthcare: 105, RelationshipBuilding: 95 },
  { name: "Vijayawada", Leadership: 100, SituationManagement: 100, QualityOfHealthcare: 100, RelationshipBuilding: 100 },
  { name: "Salem", Leadership: 115, SituationManagement: 105, QualityOfHealthcare: 105, RelationshipBuilding: 95 },
  { name: "Mysuru", Leadership: 105, SituationManagement: 115, QualityOfHealthcare: 95, RelationshipBuilding: 105 },
  { name: "Pune", Leadership: 110, SituationManagement: 110, QualityOfHealthcare: 110, RelationshipBuilding: 90 }
]

export const subBarDataLeadership = [
  { 
    name: "New Delhi", 
    Mentoring: 110, Initiative: 130, ConflictManagement: 90, Ambition: 105,
    CrisisResponse: 95, DecisionMaking: 100, ResourceAllocation: 105, StressManagement: 90,
    PatientSafety: 90, ProtocolAdherence: 85, Documentation: 80, ContinuousImprovement: 90,
    PatientCommunication: 105, TeamCollaboration: 100, ConflictResolution: 95, Empathy: 95
  },
  { 
    name: "Jaipur", 
    Mentoring: 90, Initiative: 100, ConflictManagement: 120, Ambition: 95,
    CrisisResponse: 125, DecisionMaking: 135, ResourceAllocation: 130, StressManagement: 125,
    PatientSafety: 135, ProtocolAdherence: 130, Documentation: 125, ContinuousImprovement: 130,
    PatientCommunication: 95, TeamCollaboration: 105, ConflictResolution: 100, Empathy: 100
  },
  { 
    name: "Patiala", 
    Mentoring: 120, Initiative: 130, ConflictManagement: 100, Ambition: 125,
    CrisisResponse: 105, DecisionMaking: 115, ResourceAllocation: 100, StressManagement: 120,
    PatientSafety: 75, ProtocolAdherence: 70, Documentation: 65, ContinuousImprovement: 75,
    PatientCommunication: 125, TeamCollaboration: 120, ConflictResolution: 115, Empathy: 120
  },
  { 
    name: "Salt Lake", 
    Mentoring: 85, Initiative: 95, ConflictManagement: 110, Ambition: 100,
    CrisisResponse: 90, DecisionMaking: 95, ResourceAllocation: 100, StressManagement: 105,
    PatientSafety: 110, ProtocolAdherence: 105, Documentation: 100, ContinuousImprovement: 110,
    PatientCommunication: 95, TeamCollaboration: 100, ConflictResolution: 105, Empathy: 100
  },
  { 
    name: "Gurugram", 
    Mentoring: 95, Initiative: 110, ConflictManagement: 105, Ambition: 115,
    CrisisResponse: 100, DecisionMaking: 105, ResourceAllocation: 110, StressManagement: 115,
    PatientSafety: 100, ProtocolAdherence: 95, Documentation: 90, ContinuousImprovement: 100,
    PatientCommunication: 105, TeamCollaboration: 110, ConflictResolution: 115, Empathy: 110
  },
  { 
    name: "Ghaziabad", 
    Mentoring: 100, Initiative: 120, ConflictManagement: 95, Ambition: 110,
    CrisisResponse: 110, DecisionMaking: 115, ResourceAllocation: 120, StressManagement: 125,
    PatientSafety: 95, ProtocolAdherence: 90, Documentation: 85, ContinuousImprovement: 95,
    PatientCommunication: 110, TeamCollaboration: 115, ConflictResolution: 120, Empathy: 115
  },
  { 
    name: "Bengaluru", 
    Mentoring: 115, Initiative: 125, ConflictManagement: 85, Ambition: 105,
    CrisisResponse: 115, DecisionMaking: 120, ResourceAllocation: 125, StressManagement: 130,
    PatientSafety: 105, ProtocolAdherence: 100, Documentation: 95, ContinuousImprovement: 105,
    PatientCommunication: 120, TeamCollaboration: 125, ConflictResolution: 130, Empathy: 125
  },
  { 
    name: "Jayanagar", 
    Mentoring: 105, Initiative: 115, ConflictManagement: 95, Ambition: 100,
    CrisisResponse: 105, DecisionMaking: 110, ResourceAllocation: 115, StressManagement: 120,
    PatientSafety: 100, ProtocolAdherence: 95, Documentation: 90, ContinuousImprovement: 100,
    PatientCommunication: 110, TeamCollaboration: 115, ConflictResolution: 120, Empathy: 115
  },
  { 
    name: "Baner Pune", 
    Mentoring: 110, Initiative: 120, ConflictManagement: 90, Ambition: 115,
    CrisisResponse: 110, DecisionMaking: 115, ResourceAllocation: 120, StressManagement: 125,
    PatientSafety: 100, ProtocolAdherence: 95, Documentation: 90, ContinuousImprovement: 100,
    PatientCommunication: 115, TeamCollaboration: 120, ConflictResolution: 125, Empathy: 120
  },
  { 
    name: "Mangalore", 
    Mentoring: 95, Initiative: 105, ConflictManagement: 100, Ambition: 95,
    CrisisResponse: 95, DecisionMaking: 100, ResourceAllocation: 105, StressManagement: 110,
    PatientSafety: 90, ProtocolAdherence: 85, Documentation: 80, ContinuousImprovement: 90,
    PatientCommunication: 100, TeamCollaboration: 105, ConflictResolution: 110, Empathy: 105
  },
  { 
    name: "Panaji", 
    Mentoring: 100, Initiative: 110, ConflictManagement: 105, Ambition: 90,
    CrisisResponse: 100, DecisionMaking: 105, ResourceAllocation: 110, StressManagement: 115,
    PatientSafety: 95, ProtocolAdherence: 90, Documentation: 85, ContinuousImprovement: 95,
    PatientCommunication: 105, TeamCollaboration: 110, ConflictResolution: 115, Empathy: 110
  },
  { 
    name: "Vijayawada", 
    Mentoring: 90, Initiative: 100, ConflictManagement: 110, Ambition: 105,
    CrisisResponse: 90, DecisionMaking: 95, ResourceAllocation: 100, StressManagement: 105,
    PatientSafety: 100, ProtocolAdherence: 95, Documentation: 90, ContinuousImprovement: 100,
    PatientCommunication: 95, TeamCollaboration: 100, ConflictResolution: 105, Empathy: 100
  },
  { 
    name: "Salem", 
    Mentoring: 105, Initiative: 115, ConflictManagement: 95, Ambition: 110,
    CrisisResponse: 105, DecisionMaking: 110, ResourceAllocation: 115, StressManagement: 120,
    PatientSafety: 110, ProtocolAdherence: 105, Documentation: 100, ContinuousImprovement: 110,
    PatientCommunication: 110, TeamCollaboration: 115, ConflictResolution: 120, Empathy: 115
  },
  { 
    name: "Mysuru", 
    Mentoring: 100, Initiative: 110, ConflictManagement: 100, Ambition: 105,
    CrisisResponse: 100, DecisionMaking: 105, ResourceAllocation: 110, StressManagement: 115,
    PatientSafety: 105, ProtocolAdherence: 100, Documentation: 95, ContinuousImprovement: 105,
    PatientCommunication: 105, TeamCollaboration: 110, ConflictResolution: 115, Empathy: 110
  },
  { 
    name: "Pune", 
    Mentoring: 110, Initiative: 120, ConflictManagement: 95, Ambition: 100,
    CrisisResponse: 110, DecisionMaking: 115, ResourceAllocation: 120, StressManagement: 125,
    PatientSafety: 100, ProtocolAdherence: 95, Documentation: 90, ContinuousImprovement: 100,
    PatientCommunication: 115, TeamCollaboration: 120, ConflictResolution: 125, Empathy: 120
  }
]

export const heatMapData = [
  { unit: "Unit A", Leadership: 80, SituationManagement: 65, QualityOfHealthcare: 72, RelationshipBuilding: 88 },
  { unit: "Unit B", Leadership: 75, SituationManagement: 82, QualityOfHealthcare: 91, RelationshipBuilding: 70 },
  { unit: "Unit C", Leadership: 92, SituationManagement: 78, QualityOfHealthcare: 53, RelationshipBuilding: 85 },
  { unit: "Unit D", Leadership: 68, SituationManagement: 71, QualityOfHealthcare: 84, RelationshipBuilding: 79 },
  { unit: "Unit E", Leadership: 88, SituationManagement: 75, QualityOfHealthcare: 90, RelationshipBuilding: 72 },
]

export const topPerformers = [
  { rank: 1, unit: "Unit C", competency: "Leadership", score: 92 },
  { rank: 2, unit: "Unit B", competency: "Quality of Healthcare", score: 91 },
  { rank: 3, unit: "Unit E", competency: "Quality of Healthcare", score: 90 },
  { rank: 4, unit: "Unit A", competency: "Relationship Building", score: 88 },
  { rank: 5, unit: "Unit E", competency: "Leadership", score: 88 },
]

export const regions = ["North", "South", "East", "West"]
export const units = ["Unit A", "Unit B", "Unit C", "Unit D", "Unit E"]
export const departments = ["Nursing", "Administration", "Emergency", "Surgery", "ICU"]
export const mainCompetencies = ["Leadership", "Situation Management", "Quality of Healthcare", "Relationship Building"]

export const subCompetenciesMap = {
  Leadership: ["Mentoring", "Taking Initiative", "Conflict Management", "Ambition"],
  "Situation Management": ["Crisis Response", "Decision Making", "Resource Allocation", "Stress Management"],
  "Quality of Healthcare": ["Patient Safety", "Protocol Adherence", "Documentation", "Continuous Improvement"],
  "Relationship Building": ["Patient Communication", "Team Collaboration", "Conflict Resolution", "Empathy"],
} 