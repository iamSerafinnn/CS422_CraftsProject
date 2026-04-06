import React, { useMemo, useState } from "react";

const initialInventory = [
  { id: 1, name: "Green Beads", quantity: 73, unit: "pcs" },
  { id: 2, name: "Red Beads", quantity: 43, unit: "pcs" },
  { id: 3, name: "Blue Silk Thread", quantity: 12, unit: "spools" },
  { id: 4, name: "Rose Fabric Pattern", quantity: 8, unit: "sheets" },
];

const initialProjects = [
  {
    id: 1,
    name: "Flower Dress",
    notes: "Dress reference sketch and materials for custom order.",
    reference: "Dress reference sketch",
    tasks: [
      { id: 1, text: "Measure client", done: true, materials: [{ itemId: 4, amount: 1 }] },
      { id: 2, text: "Cut fabric", done: true, materials: [{ itemId: 3, amount: 1 }] },
      { id: 3, text: "Sew body", done: false, materials: [{ itemId: 3, amount: 2 }] },
      { id: 4, text: "Add bead details", done: false, materials: [{ itemId: 1, amount: 5 }, { itemId: 2, amount: 3 }] },
    ],
  },
  {
    id: 2,
    name: "Rose Carpet",
    notes: "Test project for material planning.",
    reference: "Pattern board",
    tasks: [
      { id: 1, text: "Choose yarn colors", done: false, materials: [] },
      { id: 2, text: "Start base layer", done: false, materials: [] },
    ],
  },
];

function calculateProgress(project) {
  if (!project.tasks.length) return 0;
  const done = project.tasks.filter((t) => t.done).length;
  return Math.round((done / project.tasks.length) * 100);
}

function App() {
  const [view, setView] = useState("inventory");
  const [inventory, setInventory] = useState(() => {
    const localInventory = localStorage.getItem('inventory');

    if (localInventory) {
      return JSON.parse(localInventory);
    }
    else{
      return initialInventory;
    }
  });
  const [projects, setProjects] = useState(() => {
    const localProjects = localStorage.getItem('projects');

    if (localProjects) {
      return JSON.parse(localProjects);
    }
    else {
      return initialProjects;
    }  
  });
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [search, setSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventory, search]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  function addItem() {
    if (!newItemName.trim()) return;

    const item = {
      id: Date.now(),
      name: newItemName.trim(),
      quantity: Number(newItemQty) || 1,
      unit: newItemUnit.trim() || "pcs",
    };

    setInventory([...inventory, item]);
    setNewItemName("");
    setNewItemQty("1");
    setNewItemUnit("");
    localStorage.setItem('inventory', JSON.stringify([...inventory, item]));
  }

  function changeQty(id, delta) {
    setInventory(
      inventory.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }
  

  function deleteItem(id) {
    setInventory(inventory.filter((item) => item.id !== id));
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }

  function deleteProject(id) {
    setProjects(projects.filter((project) => project.id !== id));
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  function addProject() {
    const project = {
      id: Date.now(),
      name: `New Project ${projects.length + 1}`,
      notes: "",
      reference: "No image uploaded",
      tasks: [{ id: Date.now() + 1, text: "First task", done: false, materials: [] }],
    };

    setProjects([...projects, project]);
    setSelectedProjectId(project.id);
    setView("project");
    localStorage.setItem('projects', JSON.stringify([...projects, project]));
  }

  function toggleTask(taskId) {
    setProjects(
      projects.map((project) =>
        project.id !== selectedProjectId
          ? project
          : {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
              ),
            }
      )
    );
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  function addTask() {
    setProjects(
      projects.map((project) =>
        project.id !== selectedProjectId
          ? project
          : {
              ...project,
              tasks: [
                ...project.tasks,
                {
                  id: Date.now(),
                  text: `New task ${project.tasks.length + 1}`,
                  done: false,
                  materials: [],
                },
              ],
            }
      )
    );
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  function grabLocalData() {
    const localInventory = localStorage.getItem('inventory');

    if (localInventory) {
      setInventory(JSON.parse(localInventory));
    }

    const localProjects = localStorage.getItem('projects');

    if (localProjects) {
      setProjects(JSON.parse(localProjects));
    }
  }

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.smallTitle}>CS 422 · CraftTrack</p>
            <h1 style={styles.mainTitle}>Craft Project Manager Prototype</h1>
            <p style={styles.subtitle}>
              Inventory, projects, task lists, and project progress in one place.
            </p>
          </div>
          
        </div>

        <div style={styles.layout}>
          <div style={styles.sidebar}>
            <div style={styles.section}>
              <div style={styles.tabRow}>
              <button
                style={view === "inventory" ? styles.activeTab : styles.tab}
                onClick={() => {setView("inventory"); setSearch(""); grabLocalData();}}
              >
                Inventory
              </button>
              <button
                style={view === "projects" ? styles.activeTab : styles.tab}
                onClick={() => {setView("projects"); setSearch(""); grabLocalData();}}
              >
                Projects
              </button>
              </div>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <p style={styles.statLabel}>Total Items</p>
                <h3>{totalItems}</h3>
              </div>
              <div style={styles.statBox}>
                  <p style={styles.statLabel}>Projects</p>
                  <h3>{projects.length}</h3>
              </div>
            </div>
          </div>

          <div style={styles.main}>
            {view === "inventory" && (
              <div style={styles.card}>
                <h2>Inventory Browser</h2>
                <div style={styles.section}>
                  <div style={styles.tabRow}>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {filteredInventory.length === 0 ? (
                  <p>No items found.</p>
                ) : (
                  filteredInventory.map((item) => (
                    <div key={item.id} style={styles.listItem}>
                      <div>
                        <strong>{item.name}</strong>
                        <p style={styles.mutedText}>
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div style={styles.actions}>
                        <button style={styles.smallButton} onClick={() => changeQty(item.id, -1)}>
                          -
                        </button>
                        <span style={styles.qty}>{item.quantity}</span>
                        <button style={styles.smallButton} onClick={() => changeQty(item.id, 1)}>
                          +
                        </button>
                        <button style={styles.deleteButton} onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <h3>Add Inventory Item</h3>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Quantity"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Item unit"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                />
                <button style={styles.primaryButtonFull} onClick={addItem}>
                  Add Item
                </button>
              </div>
            )}

            {view === "projects" && (
              <div style={styles.card}>
                <div style ={styles.section}>
                    <h2>Projects Browser</h2>
                    <div style = {styles.tabRow}>
                      <input
                      style={styles.input}
                      type="text"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button style={styles.primaryButton} onClick={addProject}>
                      + New Project
                    </button>
                    </div>
                </div>



                <div style={styles.projectGrid}>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      style={styles.projectCard}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setView("project");
                      }}
                    >
                      <h3>{project.name}</h3>
                      <p style={styles.mutedText}>{project.tasks.length} tasks</p>
                      <div style={styles.progressBarOuter}>
                        <div
                          style={{
                            ...styles.progressBarInner,
                            width: `${calculateProgress(project)}%`,
                          }}
                        ></div>
                      </div>
                      <p>{calculateProgress(project)}% complete</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === "project" && selectedProject && (
              <div style={styles.card}>
                <h2>Project Details</h2>

                <label style={styles.label}>Project Name</label>
                <input
                  style={styles.input}
                  type="text"
                  value={selectedProject.name}
                  onChange={(e) =>
                    setProjects(
                      projects.map((project) =>
                        project.id === selectedProjectId
                          ? { ...project, name: e.target.value }
                          : project
                      )
                    )
                  }
                />

                <label style={styles.label}>Project Notes</label>
                <textarea
                  style={styles.textarea}
                  value={selectedProject.notes}
                  onChange={(e) =>
                    setProjects(
                      projects.map((project) =>
                        project.id === selectedProjectId
                          ? { ...project, notes: e.target.value }
                          : project
                      )
                    )
                  }
                />

                <div style={styles.referenceBox}>
                  <strong>Reference Frame:</strong>
                  <p>{selectedProject.reference}</p>
                </div>

                <h3>Progress</h3>
                <div style={styles.progressBarOuter}>
                  <div
                    style={{
                      ...styles.progressBarInner,
                      width: `${calculateProgress(selectedProject)}%`,
                    }}
                  ></div>
                </div>
                <p>{calculateProgress(selectedProject)}% complete</p>

                <div style={styles.taskHeader}>
                  <h3>Task Checklist</h3>
                  <button style={styles.primaryButton} onClick={addTask}>
                    Add Task
                  </button>
                </div>

                {selectedProject.tasks.map((task) => (
                  <div key={task.id} style={styles.taskItem}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span
                      style={{
                        marginLeft: "10px",
                        textDecoration: task.done ? "line-through" : "none",
                        color: task.done ? "#777" : "#111",
                      }}
                    >
                      {task.text}
                    </span>
                  </div>
                ))}
                <button style={styles.deleteButton} onClick={() => {
                  deleteProject(selectedProjectId);
                  setView("projects");
                }}>
                          Delete Project
                        </button>
              </div>


            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f1ea",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  smallTitle: {
    margin: 0,
    color: "#666",
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  mainTitle: {
    margin: "8px 0",
  },
  subtitle: {
    margin: 0,
    color: "#666",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "24px",
  },
  sidebar: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    height: "fit-content",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    marginBottom: "20px",
  },
  tabRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
    cursor: "pointer",
  },
  activeTab: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #1f6feb",
    backgroundColor: "#1f6feb",
    color: "white",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  label: {
    fontWeight: "bold",
    display: "block",
    marginTop: "8px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "20px",
  },
  statBox: {
    backgroundColor: "#f8f6f0",
    padding: "14px",
    borderRadius: "14px",
    textAlign: "center",
  },
  statLabel: {
    margin: 0,
    color: "#666",
    fontSize: "13px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "12px",
    gap: "12px",
    flexWrap: "wrap",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  smallButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #d66",
    backgroundColor: "#fff5f5",
    color: "#a22",
    cursor: "pointer",
  },
  qty: {
    minWidth: "30px",
    textAlign: "center",
    fontWeight: "bold",
  },
  primaryButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#1f6feb",
    color: "white",
    cursor: "pointer",
  },
  primaryButtonFull: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#1f6feb",
    color: "white",
    cursor: "pointer",
    marginTop: "8px",
  },
  mutedText: {
    color: "#666",
    margin: "6px 0 0 0",
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  projectCard: {
    border: "1px solid #ddd",
    borderRadius: "16px",
    padding: "16px",
    cursor: "pointer",
    backgroundColor: "#fafafa",
  },
  progressBarOuter: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e5e5e5",
    borderRadius: "999px",
    overflow: "hidden",
    margin: "10px 0",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#1f6feb",
  },
  referenceBox: {
    backgroundColor: "#f8f6f0",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "16px",
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    marginBottom: "12px",
    gap: "12px",
    flexWrap: "wrap",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    marginBottom: "10px",
  },
};

export default App;