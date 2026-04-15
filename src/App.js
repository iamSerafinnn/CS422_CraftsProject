import React, { useMemo, useState } from "react";
import logo from "./CraftTracksLogo.png";

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
    materials: [
      { itemId: 1, needed: 20, used: 18 },
      { itemId: 2, needed: 10, used: 4 },
      { itemId: 4, needed: 3, used: 1 }
    ],
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
    materials: [],
    tasks: [
      { id: 1, text: "Choose yarn colors", done: false, materials: [] },
      { id: 2, text: "Start base layer", done: false, materials: [] },
    ],
  },
];

  const initialNewProject = {
    id: Date.now(),
    name: `New Project 0`,
    notes: "",
    reference: "No image uploaded",
    materials: [],
    tasks: [{ id: Date.now() + 1, text: "First task", done: false, materials: [] }],
  };

function calculateProgress(project) {
  if (!project.tasks.length) return 0;
  const done = project.tasks.filter((t) => t.done).length;
  return Math.round((done / project.tasks.length) * 100);
}

function calculateUsedAcrossProjects(projects) {
  const used = {};
  projects.forEach((project) => {
    (project.materials || []).forEach((mat) => {
      if (!used[mat.itemId]) used[mat.itemId] = 0;
      used[mat.itemId] += mat.used;
    });
  });
  return used;
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
  const [newMaterialItemId, setNewMaterialItemId] = useState("");
  const [newMaterialQty, setNewMaterialQty] = useState("");

  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");

  const [newProjectName, setNewProjectName] = useState(initialNewProject.name);
  const [newProjectNotes, setNewProjectNotes] = useState(initialNewProject.notes);
  const [newProjectReferences, setNewProjectReferences] = useState(initialNewProject.reference);
  const [newProjectMaterials, setNewProjectMaterials] = useState(initialNewProject.materials);
  const [newProjectTasks, setNewProjectTasks] = useState(initialNewProject.tasks);

  const usedAcrossProjects = calculateUsedAcrossProjects(projects);
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
    localStorage.setItem('inventory', JSON.stringify([...inventory, item]));
    setNewItemName("");
    setNewItemQty("1");
    setNewItemUnit("");
    setSearch("");
    setView("inventory");
  }

  function startAddItem() {
    setSearch("");
    setView("item");
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

  function startEditingItem(item) {
    setEditingItemId(item.id);
    setEditedItemName(item.name);
  }
  
  function cancelEditingItem() {
    setEditingItemId(null);
    setEditedItemName("");
  }
  
  function saveEditedItemName(id) {
    const trimmedName = editedItemName.trim();
    if (!trimmedName) return;
  
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, name: trimmedName } : item
      )
    );
    localStorage.setItem('inventory', JSON.stringify(inventory));
  
    setEditingItemId(null);
    setEditedItemName("");
  }

  function startEditingTask(task) {
    setEditingTaskId(task.id);
    setEditedTaskName(task.text);
  }
  
  function cancelEditingTask() {
    setEditingTaskId(null);
    setEditedTaskName("");
  }
  
  function saveEditedTaskName(taskId) {
    const trimmedName = editedTaskName.trim();
    if (!trimmedName) return;
  
    setProjects(
      projects.map((project) =>
        project.id !== selectedProjectId
          ? project
          : {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, text: trimmedName } : task
              ),
            }
      )
    );
    localStorage.setItem('projects', JSON.stringify(projects));
  
    setEditingTaskId(null);
    setEditedTaskName("");
  }

  function addProject() {
    const project = {
      id: Date.now(),
      name: newProjectName || `New Project ${projects.length + 1}`,
      notes: newProjectNotes || "",
      reference: newProjectReferences || "No image uploaded",
      materials: newProjectMaterials || [],
      tasks: newProjectTasks || [{ id: Date.now() + 1, text: "First task", done: false, materials: [] }],
    };

    setProjects([...projects, project]);
    localStorage.setItem('projects', JSON.stringify([...projects, project]));
    setSearch("");
    setNewProjectName(initialNewProject.name);
    setNewProjectNotes(initialNewProject.notes);
    setNewProjectReferences(initialInventory.reference);
    setNewProjectMaterials(initialNewProject.materials);
    setNewProjectTasks(initialNewProject.tasks);
    setView("projects");
  }

  function startAddProject() {
    setSearch("");
    setView("newProject");
  }

  function deleteProject() {
    if (!selectedProject) return;
  
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedProject.name}"?`
    );
  
    if (!confirmDelete) return;
  
    const updatedProjects = projects.filter(
      (project) => project.id !== selectedProjectId
    );
  
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  
    if (updatedProjects.length > 0) {
      setSelectedProjectId(updatedProjects[0].id);
      setSearch("");
      setView("projects");
    } else {
      setSelectedProjectId(null);
      setSearch("");
      setView("projects");
    }
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
    )
    localStorage.setItem('projects', JSON.stringify(projects));
  };

  function changeMaterialUsed(itemId, delta) {
    setProjects(
      projects.map((project) => {
        if (project.id !== selectedProjectId) return project;
        return {
          ...project,
          materials: project.materials.map((mat) => {
            if (mat.itemId !== itemId) return mat;

            const inventoryItem = inventory.find((i) => i.id === itemId);
            const maxUsed = inventoryItem ? inventoryItem.quantity : 0;
            const newUsed = Math.max(0, Math.min(maxUsed, mat.used + delta));

            return {
              ...mat,
              used: newUsed
            };
          })
        };
      })
    )
    localStorage.setItem('projects', JSON.stringify(projects));
  };

  function addMaterial() {
    if (!newMaterialItemId || !newMaterialQty) return;
    const itemId = Number(newMaterialItemId);
    const qty = Number(newMaterialQty);
    setProjects(
      projects.map((project) => {
        if (project.id !== selectedProjectId) return project;
        const existing = (project.materials || []).find((mat) => mat.itemId === itemId);
        if (existing) {
          return {
            ...project,
            materials: project.materials.map((mat) =>
              mat.itemId === itemId
                ? { ...mat, needed: mat.needed + qty }
                : mat
            )
          };
        }
        return {
          ...project,
          materials: [
            ...(project.materials || []),
            {
              itemId,
              needed: qty,
              used: 0
            }
          ]
        };
      })
    );
    localStorage.setItem('projects', JSON.stringify(projects));
    setNewMaterialItemId("");
    setNewMaterialQty("");
  }

  function removeMaterial(itemId) {
    setProjects(
      projects.map((project) =>
        project.id !== selectedProjectId
          ? project
          : {
              ...project,
              materials: (project.materials || []).filter((mat) => mat.itemId !== itemId)
            }
      )
    );
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src={logo} alt="CraftTrack logo" style={styles.logo} />
            <div>
              <p style={styles.smallTitle}>CS 422 · CraftTrack</p>
              <h1 style={styles.mainTitle}>Craft Project Manager Prototype</h1>
              <p style={styles.subtitle}>
                Inventory, projects, task lists, and project progress in one place.
              </p>
            </div>
          </div>
          <div style={styles.tabRow}>
                <button
                  style={view === "inventory" ? styles.activeTab : styles.tab}
                  onClick={() => {setSearch(""); setView("inventory");}}
                >
                  Inventory
                </button>
                <button
                  style={view === "projects" ? styles.activeTab : styles.tab}
                  onClick={() => {setSearch(""); setView("projects");}}
                >
                  Projects
                </button>
              </div>
        </div>

        <div style={styles.layout}>

          <div style={styles.main}>
            {view === "inventory" && (
              <div style={styles.card}>
                <h2>Inventory Browser</h2>
                <div style={styles.section}>
                  <input
                    style={styles.search}
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button style={styles.primaryButton} onClick={startAddItem}>
                    + New Item
                  </button>
                </div>

                
                <div style={styles.scrollBox}>
                  {filteredInventory.length === 0 ? (
                    <p>No items found.</p>
                  ) : (
                    filteredInventory.map((item) => {
                      const used = usedAcrossProjects[item.id] || 0;
                      const available = item.quantity - used;
                      return (
                        <div key={item.id} style={styles.listItem}>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            {editingItemId === item.id ? (
                              <div style={styles.editRow}>
                                <input
                                  style={styles.inlineInput}
                                  type="text"
                                  value={editedItemName}
                                  onChange={(e) => setEditedItemName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      saveEditedItemName(item.id);
                                    }
                                  }}
                                />
                                <button
                                  style={styles.saveButton}
                                  onClick={() => saveEditedItemName(item.id)}
                                >
                                  Save
                                </button>
                                <button
                                  style={styles.smallButton}
                                  onClick={cancelEditingItem}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={styles.nameRow}>
                                <strong>{item.name}</strong>
                                <button
                                  style={styles.editButton}
                                  onClick={() => startEditingItem(item)}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                      
                            <p style={styles.mutedText}>
                              Total: {item.quantity} {item.unit} | Used: {used} | Available: {available}
                            </p>
                          </div>
                      
                          <div style={styles.actions}>
                            <button
                              style={styles.smallButton}
                              onClick={() => changeQty(item.id, -1)}
                            >
                              -
                            </button>
                            <span style={styles.qty}>{item.quantity}</span>
                            <button
                              style={styles.smallButton}
                              onClick={() => changeQty(item.id, 1)}
                            >
                              +
                            </button>
                            <button
                              style={styles.deleteButton}
                              onClick={() => deleteItem(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {view === "projects" && (
              <div style={styles.card}>
                <h2>Projects Browser</h2>
                <div style={styles.section}>
                  <input
                    style={styles.search}
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                <button style={styles.primaryButton} onClick={startAddProject}>
                    + New Project
                </button>  
                </div>
                <div style={styles.projectScroll}>
                  <div style={styles.projectGrid}>
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        style={styles.projectCard}
                        onClick={() => {
                          setSearch("");
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



                <div style={styles.materialsSection}>

                  <div style={styles.materialBox}>
                  <h3>Items Needed</h3>
                  <div style={{ marginBottom: "12px" }}>
                    <select
                      style={styles.input}
                      value={newMaterialItemId}
                      onChange={(e) => setNewMaterialItemId(e.target.value)}
                    >
                      <option value="">Select item</option>

                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Quantity needed"
                      value={newMaterialQty}
                      onChange={(e) => setNewMaterialQty(e.target.value)}
                    />
                    <button style={styles.primaryButtonFull} onClick={addMaterial}>
                      Add Material
                    </button>
                  </div>

                  {!selectedProject.materials || selectedProject.materials.length === 0 ? (
                    <p style={styles.mutedText}>No materials added yet.</p>
                  ) : (
                    selectedProject.materials.map((mat) => {
                      const item = inventory.find((i) => i.id === mat.itemId);
                      if (!item) return null;
                      return (
                        <div key={mat.itemId} style={styles.itemRow}>
                          <span>{item.name}</span>
                          <div style={styles.actions}>
                            <span style={styles.itemAmount}>
                              {mat.needed} {item.unit}
                            </span>
                            <button
                              style={styles.deleteButton}
                              onClick={() => removeMaterial(mat.itemId)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={styles.materialBox}>
                  <h3>Items Used</h3>
                  {!selectedProject.materials || selectedProject.materials.length === 0 ? (
                    <p style={styles.mutedText}>No materials added yet.</p>
                  ) : (
                    selectedProject.materials.map((mat) => {
                      const item = inventory.find((i) => i.id === mat.itemId);
                      if (!item) return null;
                      const available = item.quantity - mat.used;
                      return (
                        <div key={mat.itemId} style={styles.itemRow}>
                          <div>
                            <strong>{item.name}</strong>
                            <p style={styles.mutedText}>
                              Used: {mat.used} {item.unit} | Available: {available} {item.unit}
                            </p>
                          </div>

                          <div style={styles.actions}>
                            <button
                              style={styles.smallButton}
                              onClick={() => changeMaterialUsed(mat.itemId, -1)}
                            >
                              -
                            </button>
                            <span style={styles.qty}>{mat.used}</span>
                            <button
                              style={styles.smallButton}
                              onClick={() => changeMaterialUsed(mat.itemId, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

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

                    <div style={{ flex: 1, marginLeft: "10px" }}>
                      {editingTaskId === task.id ? (
                        <div style={styles.editRow}>
                          <input
                            style={styles.inlineInput}
                            type="text"
                            value={editedTaskName}
                            onChange={(e) => setEditedTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEditedTaskName(task.id);
                              }
                            }}
                          />
                          <button
                            style={styles.saveButton}
                            onClick={() => saveEditedTaskName(task.id)}
                          >
                            Save
                          </button>
                          <button
                            style={styles.smallButton}
                            onClick={cancelEditingTask}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={styles.nameRow}>
                          <span
                            style={{
                              textDecoration: task.done ? "line-through" : "none",
                              color: task.done ? "#777" : "#111",
                            }}
                          >
                            {task.text}
                          </span>

                          <button
                            style={styles.editButton}
                            onClick={() => startEditingTask(task)}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div style={styles.deleteProjectRow}>
                  <button style={styles.deleteProjectButton} onClick={deleteProject}>
                    Delete Project
                  </button>
                </div>
              </div>
            )}

            {view === "newProject" && (
              // ISSUES SO FAR:
              // - Cannot affect the new project's tasks, materials, or references
              <div style={styles.card}>
                <h2>New Project Details</h2>

                <label style={styles.label}>Project Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder={initialNewProject.name}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />

                <label style={styles.label}>Project Notes</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Input project notes here..."
                  value={newProjectNotes}
                  onChange={(e) => setNewProjectNotes(e.target.value)}
                />

                <div style={styles.referenceBox}>
                  <strong>Reference Frame:</strong>
                  <p>{newProjectReferences}</p>
                </div>

                <div style={styles.materialsSection}>

                  <div style={styles.materialBox}>
                  <h3>Items Needed</h3>
                  <div style={{ marginBottom: "12px" }}>
                    <select
                      style={styles.input}
                      value={newMaterialItemId}
                      onChange={(e) => setNewMaterialItemId(e.target.value)}
                    >
                      <option value="">Select item</option>

                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Quantity needed"
                      value={newMaterialQty}
                      onChange={(e) => setNewMaterialQty(e.target.value)}
                    />
                    <button style={styles.primaryButtonFull} onClick={addMaterial}>
                      Add Material
                    </button>
                  </div>

                  {!newProjectMaterials || newProjectMaterials.length === 0 ? (
                    <p style={styles.mutedText}>No materials added yet.</p>
                  ) : (
                    newProjectMaterials.materials.map((mat) => {
                      const item = inventory.find((i) => i.id === mat.itemId);
                      if (!item) return null;
                      return (
                        <div key={mat.itemId} style={styles.itemRow}>
                          <span>{item.name}</span>
                          <div style={styles.actions}>
                            <span style={styles.itemAmount}>
                              {mat.needed} {item.unit}
                            </span>
                            <button
                              style={styles.deleteButton}
                              onClick={() => removeMaterial(mat.itemId)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={styles.materialBox}>
                  <h3>Items Used</h3>
                  {!newProjectMaterials || newProjectMaterials.length === 0 ? (
                    <p style={styles.mutedText}>No materials added yet.</p>
                  ) : (
                    newProjectMaterials.map((mat) => {
                      const item = inventory.find((i) => i.id === mat.itemId);
                      if (!item) return null;
                      const available = item.quantity - mat.used;
                      return (
                        <div key={mat.itemId} style={styles.itemRow}>
                          <div>
                            <strong>{item.name}</strong>
                            <p style={styles.mutedText}>
                              Used: {mat.used} {item.unit} | Available: {available} {item.unit}
                            </p>
                          </div>

                          <div style={styles.actions}>
                            <button
                              style={styles.smallButton}
                              onClick={() => changeMaterialUsed(mat.itemId, -1)}
                            >
                              -
                            </button>
                            <span style={styles.qty}>{mat.used}</span>
                            <button
                              style={styles.smallButton}
                              onClick={() => changeMaterialUsed(mat.itemId, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

                <div style={styles.taskHeader}>
                  <h3>Task Checklist</h3>
                  <button style={styles.primaryButton} onClick={addTask}>
                    Add Task
                  </button>
                </div>

                {newProjectTasks.map((task) => (
                  <div key={task.id} style={styles.taskItem}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />

                    <div style={{ flex: 1, marginLeft: "10px" }}>
                      {editingTaskId === task.id ? (
                        <div style={styles.editRow}>
                          <input
                            style={styles.inlineInput}
                            type="text"
                            value={editedTaskName}
                            onChange={(e) => setEditedTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEditedTaskName(task.id);
                              }
                            }}
                          />
                          <button
                            style={styles.saveButton}
                            onClick={() => saveEditedTaskName(task.id)}
                          >
                            Save
                          </button>
                          <button
                            style={styles.smallButton}
                            onClick={cancelEditingTask}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={styles.nameRow}>
                          <span
                            style={{
                              textDecoration: task.done ? "line-through" : "none",
                              color: task.done ? "#777" : "#111",
                            }}
                          >
                            {task.text}
                          </span>

                          <button
                            style={styles.editButton}
                            onClick={() => startEditingTask(task)}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div style={styles.deleteProjectRow}>
                  <button style={styles.primaryButtonFull} onClick={addProject}>
                    Add Project
                  </button>
                </div>
              </div>
            )}

            {view === "item" && (
              <div style={styles.card}>
                <h2>Add Inventory Item</h2>
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
                  placeholder="Unit (e.g. pcs, yd)"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                />
                <button style={styles.primaryButtonFull} onClick={addItem}>
                  Add Item
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
  logo: {
    width: 120,
    height: 120
  },
  scrollBox: {
    maxHeight: "454px",
    overflowY: "auto",
    marginTop: "10px",
    paddingRight: "6px"
  },
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
    gridTemplateColumns: "1fr",
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
  search: {
    width: "85%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "10px",
    marginRight: "12px",
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
  projectScroll: {
    maxHeight: "454px",
    overflowX: "auto",
    paddingBottom: "8px"
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
  materialsSection: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginTop: "20px"
},
materialBox: {
  backgroundColor: "#f8f6f0",
  borderRadius: "14px",
  padding: "16px"
},
itemRow: {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid #e5e5e5"
},
itemAmount: {
  fontWeight: "bold",
  color: "#51565dff"
},
nameRow: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
},

editRow: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
},

inlineInput: {
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  minWidth: "180px",
},

editButton: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "1px solid #1f6feb",
  backgroundColor: "#eef5ff",
  color: "#1f6feb",
  cursor: "pointer",
},

saveButton: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "1px solid #2f8f46",
  backgroundColor: "#eefbf1",
  color: "#2f8f46",
  cursor: "pointer",
},

deleteProjectRow: {
  marginTop: "24px",
  display: "flex",
  justifyContent: "flex-end",
},

deleteProjectButton: {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid #c94a4a",
  backgroundColor: "#fff1f1",
  color: "#a22",
  cursor: "pointer",
  fontWeight: "bold",
},
};

export default App;