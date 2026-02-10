// Mock data for frontend-only development
// Will be replaced with API calls when backend is integrated

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "review" | "completed" | "archived";
  phase: string;
  progress: number;
  startDate: string;
  endDate: string;
  taskCount: number;
  completedTasks: number;
  teamSize: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  lane: string;
  phase: string;
  status: "pending" | "active" | "completed" | "blocked";
  assignee?: string;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Lane {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface Phase {
  id: string;
  name: string;
  order: number;
}

export interface Workflow {
  id: string;
  projectId: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  lanes: Lane[];
  phases: Phase[];
  status: "draft" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  workflowId?: string;
  nodeId?: string;
  assignee: string;
  assigneeType: "person" | "agent";
  status: "todo" | "in-progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  lane: string;
  phase: string;
  tags: string[];
  documentsCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "other";
  size: number;
  version: number;
  status: "draft" | "submitted" | "under-review" | "approved" | "rejected";
  submittedBy: string;
  reviewNote?: string;
  taskId?: string;
  projectId: string;
  uploadedAt: string;
  reviewedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: "active" | "paused" | "idle" | "error";
  model: string;
  tasksCompleted: number;
  tasksActive: number;
  lastActive: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  type: "staff" | "consultant";
  email: string;
  avatar?: string;
  department: string;
  activeTasks: number;
  completedTasks: number;
  status: "available" | "busy" | "away";
}

export interface Activity {
  id: string;
  type: "task_completed" | "document_submitted" | "document_approved" | "document_rejected" | "agent_output" | "workflow_started" | "comment";
  message: string;
  actor: string;
  timestamp: string;
  projectId?: string;
}

// --- Mock Data ---

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Country Strategy Evaluation - Tanzania",
    description: "Comprehensive evaluation of AfDB's country strategy and program in Tanzania (2015-2024)",
    status: "active",
    phase: "Data Collection",
    progress: 45,
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    taskCount: 24,
    completedTasks: 11,
    teamSize: 6,
    priority: "high",
  },
  {
    id: "p2",
    name: "Gender Mainstreaming Impact Assessment",
    description: "Evaluation of gender mainstreaming across AfDB lending operations 2018-2024",
    status: "active",
    phase: "Analysis",
    progress: 62,
    startDate: "2025-06-15",
    endDate: "2026-03-31",
    taskCount: 18,
    completedTasks: 11,
    teamSize: 4,
    priority: "medium",
  },
  {
    id: "p3",
    name: "Infrastructure Portfolio Review",
    description: "Thematic evaluation of transport infrastructure investments in West Africa",
    status: "planning",
    phase: "Scoping",
    progress: 15,
    startDate: "2026-01-15",
    endDate: "2026-12-31",
    taskCount: 8,
    completedTasks: 1,
    teamSize: 3,
    priority: "medium",
  },
  {
    id: "p4",
    name: "Climate Adaptation Fund Evaluation",
    description: "Mid-term evaluation of the Africa Climate Adaptation Fund effectiveness",
    status: "review",
    phase: "Draft Report",
    progress: 85,
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    taskCount: 22,
    completedTasks: 19,
    teamSize: 5,
    priority: "critical",
  },
];

export const mockTasks: Task[] = [
  {
    id: "t1", title: "Compile stakeholder interview transcripts", description: "Organize and clean all 23 interview transcripts from field mission",
    workflowId: "w1", assignee: "Sarah Chen", assigneeType: "person", status: "in-progress", priority: "high",
    dueDate: "2026-02-15", lane: "Data Analyst", phase: "Data Collection", tags: ["fieldwork", "interviews"],
    documentsCount: 23, commentsCount: 4, createdAt: "2026-01-20",
  },
  {
    id: "t2", title: "Draft evaluation methodology section", description: "Write the methodology chapter for the approach paper",
    workflowId: "w1", assignee: "Research Agent", assigneeType: "agent", status: "review", priority: "medium",
    dueDate: "2026-02-12", lane: "Task Manager", phase: "Design", tags: ["writing", "methodology"],
    documentsCount: 1, commentsCount: 2, createdAt: "2026-01-15",
  },
  {
    id: "t3", title: "Review consultant TORs", description: "Review and approve Terms of Reference for 3 national consultants",
    workflowId: "w1", assignee: "You", assigneeType: "person", status: "todo", priority: "high",
    dueDate: "2026-02-11", lane: "Principal Officer", phase: "Planning", tags: ["procurement", "hr"],
    documentsCount: 3, commentsCount: 0, createdAt: "2026-02-01",
  },
  {
    id: "t4", title: "Literature review on climate finance", description: "Comprehensive lit review covering climate adaptation financing in Sub-Saharan Africa",
    workflowId: "w2", assignee: "Literature Agent", assigneeType: "agent", status: "in-progress", priority: "medium",
    dueDate: "2026-02-20", lane: "AI Agent", phase: "Data Collection", tags: ["research", "climate"],
    documentsCount: 0, commentsCount: 1, createdAt: "2026-02-05",
  },
  {
    id: "t5", title: "Finalize evaluation matrix", description: "Complete the evaluation questions, criteria, and data sources matrix",
    workflowId: "w1", assignee: "Amina Diallo", assigneeType: "person", status: "done", priority: "high",
    dueDate: "2026-02-08", lane: "Evaluation Officer", phase: "Design", tags: ["methodology"],
    documentsCount: 1, commentsCount: 6, createdAt: "2026-01-10",
  },
  {
    id: "t6", title: "Budget reconciliation Q4", description: "Reconcile Q4 2025 project expenditures against approved budget",
    assignee: "Finance Agent", assigneeType: "agent", status: "done", priority: "low",
    dueDate: "2026-02-05", lane: "AI Agent", phase: "Monitoring", tags: ["finance"],
    documentsCount: 2, commentsCount: 0, createdAt: "2026-01-28",
  },
  {
    id: "t7", title: "Approve field mission travel plan", description: "Review and approve travel logistics for Tanzania field mission (Mar 2026)",
    assignee: "You", assigneeType: "person", status: "todo", priority: "critical",
    dueDate: "2026-02-13", lane: "Principal Officer", phase: "Data Collection", tags: ["travel", "logistics"],
    documentsCount: 1, commentsCount: 0, createdAt: "2026-02-08",
  },
  {
    id: "t8", title: "Peer review approach paper", description: "Internal peer review of the Tanzania CSE approach paper before CODE presentation",
    assignee: "Dr. James Okonkwo", assigneeType: "person", status: "in-progress", priority: "high",
    dueDate: "2026-02-18", lane: "Peer Reviewer", phase: "Review", tags: ["review", "quality"],
    documentsCount: 1, commentsCount: 3, createdAt: "2026-02-03",
  },
];

export const mockDocuments: Document[] = [
  { id: "d1", name: "Tanzania CSE Approach Paper v3.docx", type: "docx", size: 2450000, version: 3, status: "under-review", submittedBy: "Amina Diallo", projectId: "p1", uploadedAt: "2026-02-08T14:30:00Z" },
  { id: "d2", name: "Stakeholder Analysis Matrix.xlsx", type: "xlsx", size: 890000, version: 2, status: "approved", submittedBy: "Sarah Chen", reviewNote: "Good coverage. Include AfDB resident mission staff.", projectId: "p1", uploadedAt: "2026-02-05T09:15:00Z", reviewedAt: "2026-02-06T11:00:00Z" },
  { id: "d3", name: "Field Mission Budget.xlsx", type: "xlsx", size: 340000, version: 1, status: "submitted", submittedBy: "Finance Agent", projectId: "p1", uploadedAt: "2026-02-09T16:45:00Z" },
  { id: "d4", name: "Gender Eval Draft Chapter 4.docx", type: "docx", size: 1800000, version: 1, status: "submitted", submittedBy: "Dr. James Okonkwo", projectId: "p2", uploadedAt: "2026-02-10T08:00:00Z" },
  { id: "d5", name: "Climate Fund ToR - National Consultant.pdf", type: "pdf", size: 560000, version: 1, status: "submitted", submittedBy: "Amina Diallo", projectId: "p4", uploadedAt: "2026-02-09T13:20:00Z" },
  { id: "d6", name: "Literature Review - Climate Finance.pdf", type: "pdf", size: 3200000, version: 1, status: "approved", submittedBy: "Literature Agent", reviewNote: "Comprehensive. Well-structured.", projectId: "p4", uploadedAt: "2026-02-07T10:00:00Z", reviewedAt: "2026-02-08T15:30:00Z" },
];

export const mockAgents: Agent[] = [
  { id: "a1", name: "Research Agent", role: "Literature reviews and research synthesis", description: "Searches academic databases, synthesizes findings, produces structured literature reviews", status: "active", model: "Claude Opus 4.6", tasksCompleted: 12, tasksActive: 2, lastActive: "2026-02-10T10:30:00Z", createdAt: "2025-12-01" },
  { id: "a2", name: "Document Analyst", role: "Document summarization and analysis", description: "Reads uploaded documents, extracts key findings, generates executive summaries", status: "active", model: "Claude Opus 4.6", tasksCompleted: 34, tasksActive: 1, lastActive: "2026-02-10T09:45:00Z", createdAt: "2025-11-15" },
  { id: "a3", name: "Finance Agent", role: "Budget tracking and reconciliation", description: "Monitors project expenditures, reconciles budgets, flags discrepancies", status: "idle", model: "Claude Sonnet 4", tasksCompleted: 8, tasksActive: 0, lastActive: "2026-02-05T16:00:00Z", createdAt: "2026-01-10" },
  { id: "a4", name: "Recruitment Scanner", role: "Consultant candidate screening", description: "Searches for consultant profiles matching TOR requirements, compiles shortlists", status: "paused", model: "Claude Sonnet 4", tasksCompleted: 3, tasksActive: 0, lastActive: "2026-02-02T14:20:00Z", createdAt: "2026-01-20" },
  { id: "a5", name: "Report Drafter", role: "Report section drafting", description: "Drafts evaluation report sections based on data, findings, and templates", status: "active", model: "Claude Opus 4.6", tasksCompleted: 6, tasksActive: 1, lastActive: "2026-02-10T11:00:00Z", createdAt: "2025-12-15" },
];

export const mockPeople: Person[] = [
  { id: "u1", name: "You", role: "Principal Evaluation Officer", type: "staff", email: "you@afdb.org", department: "IDEV.1", activeTasks: 3, completedTasks: 45, status: "available" },
  { id: "u2", name: "Amina Diallo", role: "Evaluation Officer", type: "staff", email: "a.diallo@afdb.org", department: "IDEV.1", activeTasks: 5, completedTasks: 28, status: "busy" },
  { id: "u3", name: "Sarah Chen", role: "Data Analyst", type: "consultant", email: "sarah.chen@email.com", department: "External", activeTasks: 2, completedTasks: 15, status: "available" },
  { id: "u4", name: "Dr. James Okonkwo", role: "Senior Consultant", type: "consultant", email: "j.okonkwo@email.com", department: "External", activeTasks: 3, completedTasks: 22, status: "busy" },
  { id: "u5", name: "Marie Ngoma", role: "Junior Evaluation Analyst", type: "staff", email: "m.ngoma@afdb.org", department: "IDEV.1", activeTasks: 4, completedTasks: 12, status: "available" },
  { id: "u6", name: "Hassan Mbeki", role: "Research Assistant", type: "consultant", email: "h.mbeki@email.com", department: "External", activeTasks: 1, completedTasks: 8, status: "away" },
];

export const mockActivities: Activity[] = [
  { id: "act1", type: "document_submitted", message: "Gender Eval Draft Chapter 4.docx submitted for review", actor: "Dr. James Okonkwo", timestamp: "2026-02-10T08:00:00Z", projectId: "p2" },
  { id: "act2", type: "agent_output", message: "Literature review on climate finance completed (47 sources analyzed)", actor: "Research Agent", timestamp: "2026-02-10T07:30:00Z", projectId: "p4" },
  { id: "act3", type: "task_completed", message: "Evaluation matrix finalized and approved", actor: "Amina Diallo", timestamp: "2026-02-09T17:00:00Z", projectId: "p1" },
  { id: "act4", type: "document_approved", message: "Stakeholder Analysis Matrix approved", actor: "You", timestamp: "2026-02-06T11:00:00Z", projectId: "p1" },
  { id: "act5", type: "workflow_started", message: "Infrastructure Portfolio Review workflow initiated", actor: "You", timestamp: "2026-02-05T09:00:00Z", projectId: "p3" },
  { id: "act6", type: "comment", message: "Added feedback on approach paper methodology section", actor: "You", timestamp: "2026-02-04T15:30:00Z", projectId: "p1" },
  { id: "act7", type: "document_rejected", message: "Budget proposal v1 rejected - missing travel costs", actor: "You", timestamp: "2026-02-03T10:00:00Z", projectId: "p1" },
];

// Workflow mock for the BPMN builder
export const mockWorkflow: Workflow = {
  id: "w1",
  projectId: "p1",
  name: "Tanzania CSE Evaluation Process",
  description: "Full evaluation workflow for the Tanzania Country Strategy Evaluation",
  lanes: [
    { id: "l1", name: "Principal Officer", role: "Task Manager / Approver", color: "var(--lane-blue)" },
    { id: "l2", name: "Evaluation Officer", role: "Lead Analyst", color: "var(--lane-green)" },
    { id: "l3", name: "Consultants", role: "External Team", color: "var(--lane-orange)" },
    { id: "l4", name: "AI Agents", role: "Automated Tasks", color: "var(--lane-purple)" },
  ],
  phases: [
    { id: "ph1", name: "Planning", order: 1 },
    { id: "ph2", name: "Design", order: 2 },
    { id: "ph3", name: "Data Collection", order: 3 },
    { id: "ph4", name: "Analysis & Reporting", order: 4 },
    { id: "ph5", name: "Dissemination", order: 5 },
  ],
  nodes: [
    { id: "n1", type: "start", label: "Evaluation Initiated", lane: "l1", phase: "ph1", status: "completed", position: { x: 50, y: 80 } },
    { id: "n2", type: "task", label: "Draft Approach Paper", lane: "l2", phase: "ph1", status: "completed", assignee: "Amina Diallo", position: { x: 200, y: 200 } },
    { id: "n3", type: "task", label: "Literature Review", lane: "l4", phase: "ph1", status: "completed", assignee: "Research Agent", position: { x: 200, y: 400 } },
    { id: "n4", type: "gateway", label: "Approach Approved?", lane: "l1", phase: "ph2", status: "completed", position: { x: 400, y: 80 } },
    { id: "n5", type: "task", label: "Develop Evaluation Matrix", lane: "l2", phase: "ph2", status: "completed", assignee: "Amina Diallo", position: { x: 550, y: 200 } },
    { id: "n6", type: "task", label: "Recruit Consultants", lane: "l1", phase: "ph2", status: "active", assignee: "You", position: { x: 550, y: 80 } },
    { id: "n7", type: "task", label: "Field Mission Prep", lane: "l3", phase: "ph3", status: "active", assignee: "Sarah Chen", position: { x: 750, y: 300 } },
    { id: "n8", type: "task", label: "Stakeholder Interviews", lane: "l3", phase: "ph3", status: "pending", assignee: "Dr. James Okonkwo", position: { x: 900, y: 300 } },
    { id: "n9", type: "agent-task", label: "Data Analysis", lane: "l4", phase: "ph4", status: "pending", assignee: "Document Analyst", position: { x: 1100, y: 400 } },
    { id: "n10", type: "task", label: "Draft Report", lane: "l2", phase: "ph4", status: "pending", assignee: "Amina Diallo", position: { x: 1100, y: 200 } },
    { id: "n11", type: "gateway", label: "Report Approved?", lane: "l1", phase: "ph4", status: "pending", position: { x: 1300, y: 80 } },
    { id: "n12", type: "task", label: "CODE Presentation", lane: "l1", phase: "ph5", status: "pending", assignee: "You", position: { x: 1500, y: 80 } },
    { id: "n13", type: "end", label: "Evaluation Complete", lane: "l1", phase: "ph5", status: "pending", position: { x: 1650, y: 80 } },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n1", target: "n3" },
    { id: "e3", source: "n2", target: "n4" },
    { id: "e4", source: "n3", target: "n4" },
    { id: "e5", source: "n4", target: "n5", label: "Yes" },
    { id: "e6", source: "n4", target: "n6", label: "Yes" },
    { id: "e7", source: "n5", target: "n7" },
    { id: "e8", source: "n6", target: "n7" },
    { id: "e9", source: "n7", target: "n8" },
    { id: "e10", source: "n8", target: "n9" },
    { id: "e11", source: "n8", target: "n10" },
    { id: "e12", source: "n9", target: "n11" },
    { id: "e13", source: "n10", target: "n11" },
    { id: "e14", source: "n11", target: "n12", label: "Approved" },
    { id: "e15", source: "n12", target: "n13" },
  ],
  status: "active",
  createdAt: "2025-09-01",
  updatedAt: "2026-02-10",
};

// Stats for dashboard
export const mockStats = {
  activeProjects: 3,
  pendingReviews: 4,
  activeTasks: 12,
  activeAgents: 3,
  completedThisWeek: 7,
  overdueTasks: 1,
};
