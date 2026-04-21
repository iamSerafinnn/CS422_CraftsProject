import React, { useMemo, useState } from "react";
import logo from "./CraftTracksLogo.png";
import { Rnd } from "react-rnd";

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
  },
  {
    id: 2,
    name: "Rose Carpet",
    notes: "Test project for material planning.",
    reference: "Pattern board",
    materials: [],
  },
];

const initialWorkspaces = {
    1: [
      {
        id: 101,
        x: 30,
        y: 30,
        width: 260,
        height: 180,
        type: "checklist",
        color: "#1f6feb",
        content: [
          { text: "Cut rose fabric", done: true },
          { text: "Pin pattern pieces", done: true },
          { text: "Sew initial seams", done: false },
        ],
      },
    ],

    2: [
      {
        id: 201,
        x: 40,
        y: 40,
        width: 260,
        height: 180,
        type: "checklist",
        color: "#1f6feb",
        content: [
          { text: "Measure carpet base", done: true },
          { text: "Align rose pattern tiles", done: false },
          { text: "Stitch sections", done: false },
        ],
      },
    ],
  };

  const initialNewProject = {
    id: Date.now(),
    name: `New Project 0`,
    notes: "",
    reference: "No image uploaded",
    materials: [],
  };

function calculateProgress(project, workspaceBoxes = []) {
  const checklistItems = workspaceBoxes
    .filter((b) => b.type === "checklist")
    .flatMap((b) => b.content || []);

  const score = checklistItems.length
    ? checklistItems.filter((i) => i.done).length / checklistItems.length
    : 0;

  return Math.round(score * 100);
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
  const [projectWorkspaces, setProjectWorkspaces] = useState(initialWorkspaces);
  const [inventory, setInventory] = useState(initialInventory);
  const [projects, setProjects] = useState(initialProjects);
  
  const [selectedProjectId, setSelectedProjectId] = useState(1);
    const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );
  const [search, setSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newMaterialItemId, setNewMaterialItemId] = useState("");
  const [newMaterialQty, setNewMaterialQty] = useState("");

  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState("");

  const [newProjectName, setNewProjectName] = useState(initialNewProject.name);
  const [newProjectNotes, setNewProjectNotes] = useState(initialNewProject.notes);
  const [newProjectReferences, setNewProjectReferences] = useState(initialNewProject.reference);
  const [newProjectMaterials, setNewProjectMaterials] = useState(initialNewProject.materials);

  const usedAcrossProjects = calculateUsedAcrossProjects(projects);
  const workspaceBoxes = projectWorkspaces[selectedProjectId] || [];

  const [newBoxType, setNewBoxType] = useState("text");
  const [newBoxColor, setNewBoxColor] = useState("#1f6feb"); // default blue

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

  function setWorkspaceBoxes(updatedBoxes) {
    setProjectWorkspaces(prev => ({
      ...prev,
      [selectedProjectId]: updatedBoxes
    }));
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

  function addProject() {
    const project = {
    id: Date.now(),
    name: newProjectName || `New Project ${projects.length + 1}`,
    notes: newProjectNotes || "",
    reference: newProjectReferences || "No image uploaded",
    materials: newProjectMaterials || []
  };

    setProjects([...projects, project]);
    localStorage.setItem('projects', JSON.stringify([...projects, project]));
    setSearch("");
    setNewProjectName(initialNewProject.name);
    setNewProjectNotes(initialNewProject.notes);
    setNewProjectReferences(initialInventory.reference);
    setNewProjectMaterials(initialNewProject.materials);
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
                          setView("workspace"); // NEW VIEW
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <h3>{project.name}</h3>

                          <button
                            style={styles.settingsButton}
                            onClick={(e) => {
                              e.stopPropagation(); // IMPORTANT: prevents triggering card click
                              setSelectedProjectId(project.id);
                              setView("project"); // OLD DETAILS VIEW
                            }}
                          >
                            ⚙️
                          </button>
                        </div>
                        <p style={styles.mutedText}>Workspace-based progress</p>
                        <div style={styles.progressBarOuter}>
                          <div
                            style={{
                              ...styles.progressBarInner,
                              width: `${calculateProgress(project, projectWorkspaces[project.id] || [])}%`,
                            }}
                          ></div>
                        </div>
                        <p>{calculateProgress(project, projectWorkspaces[project.id] || [])}% complete</p>
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
                      width: `${calculateProgress(selectedProject, [])}%`,
                    }}
                  ></div>
                </div>
                <p>{calculateProgress(selectedProject, [])}% complete</p>



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

                <div style={styles.deleteProjectRow}>
                  <button style={styles.deleteProjectButton} onClick={deleteProject}>
                    Delete Project
                  </button>
                </div>
              </div>
            )}

            {view === "workspace" && selectedProject && (
              <div style={styles.workspacePage}>
                <h2>{selectedProject.name} Workspace</h2>

                <p>{calculateProgress(selectedProject, workspaceBoxes)}% complete</p>

                <div style={styles.progressBarOuter}>
                  <div
                    style={{
                      ...styles.progressBarInner,
                      width: `${calculateProgress(selectedProject, workspaceBoxes)}%`,
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
  
                  <select
                    style={styles.input}
                    value={newBoxType}
                    onChange={(e) => setNewBoxType(e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="checklist">Checklist</option>
                    <option value="photo">Photo</option>
                  </select>

                  <input
                    type="color"
                    value={newBoxColor}
                    onChange={(e) => setNewBoxColor(e.target.value)}
                    title="Pick tab color"
                  />

                  <button
                    style={styles.primaryButton}
                    onClick={() => {
                      setWorkspaceBoxes([
                        ...workspaceBoxes,
                        {
                          id: Date.now(),
                          x: 50,
                          y: 50,
                          width: 250,
                          height: 180,
                          type: newBoxType,
                          color: newBoxColor, // NEW
                          content:
                            newBoxType === "checklist"
                              ? [{ text: "New task", done: false }]
                              : newBoxType === "photo"
                              ? null
                              : "New Box"
                        }
                      ]);
                    }}
                  >
                    + Add Box
                  </button>

                </div>

                <div
                  style={{
                    position: "relative",
                    height: "1000px",
                    border: "1px solid #ccc",
                    marginTop: "20px"
                  }}
                >
                  {workspaceBoxes.map((box) => (
                    <Rnd
                      key={box.id}
                      size={{ width: box.width, height: box.height }}
                      position={{ x: box.x, y: box.y }}
                      onDragStop={(e, d) => {
                        const updated = workspaceBoxes.map(b =>
                          b.id === box.id ? { ...b, x: d.x, y: d.y } : b
                        );
                        setWorkspaceBoxes(updated);
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        const updated = workspaceBoxes.map(b =>
                          b.id === box.id
                            ? {
                                ...b,
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                                x: position.x,
                                y: position.y
                              }
                            : b
                        );
                        setWorkspaceBoxes(updated);
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          height: "100%",
                          border: "1px solid #ddd",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        {/* TAB HEADER */}
                        <div
                          style={{
                            background: box.color || "#1f6feb",
                            color: "white",
                            padding: "6px 10px",
                            borderTopLeftRadius: "4px",
                            borderTopRightRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <span>{box.type.toUpperCase()}</span>

                          <button
                            onClick={() => {
                              const confirmDelete = window.confirm("Delete this box?");
                              if (!confirmDelete) return;

                              setWorkspaceBoxes(workspaceBoxes.filter(b => b.id !== box.id));
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: "bold"
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* CONTENT */}
                        <div style={{ padding: "10px", flex: 1 }}>
                          
                          {box.type === "text" && (
                            <textarea
                              value={box.content}
                              onChange={(e) => {
                                const updated = workspaceBoxes.map(b =>
                                  b.id === box.id ? { ...b, content: e.target.value } : b
                                );
                                setWorkspaceBoxes(updated);
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                outline: "none",
                                resize: "none"
                              }}
                            />
                          )}

                          {box.type === "checklist" && (
                            <div>
                              {box.content.map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: "6px" }}>
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => {
                                      const updated = workspaceBoxes.map(b => {
                                        if (b.id !== box.id) return b;
                                        const newContent = [...b.content];
                                        newContent[i].done = !newContent[i].done;
                                        return { ...b, content: newContent };
                                      });
                                      setWorkspaceBoxes(updated);
                                    }}
                                  />

                                  <input
                                    type="text"
                                    value={item.text}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const updated = workspaceBoxes.map(b => {
                                          if (b.id !== box.id) return b;

                                          const newContent = [...b.content];
                                          newContent.splice(i + 1, 0, {
                                            text: "",
                                            done: false
                                          });

                                          return { ...b, content: newContent };
                                        });

                                        setWorkspaceBoxes(updated);
                                      }
                                    }}
                                    onChange={(e) => {
                                      const updated = workspaceBoxes.map(b => {
                                        if (b.id !== box.id) return b;
                                        const newContent = [...b.content];
                                        newContent[i].text = e.target.value;
                                        return { ...b, content: newContent };
                                      });
                                      setWorkspaceBoxes(updated);
                                    }}
                                    style={{ flex: 1, border: "none", outline: "none" }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {box.type === "photo" && (
                            <div>
                              {/* Only show file input if no image has been selected yet */}
                              {!box.content && (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      const updated = workspaceBoxes.map((b) =>
                                        b.id === box.id
                                          ? { ...b, content: reader.result }
                                          : b
                                      );
                                      setWorkspaceBoxes(updated);
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              )}

                              {box.content && (
                                <img
                                  src={box.content}
                                  alt="uploaded"
                                  style={{ width: "100%", marginTop: "10px" }}
                                />
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </Rnd>
                  ))}
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
  settingsButton: {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px"
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
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    margin: 0,
    padding: "0 24px",
    overflowX: "hidden",
  },
  header: {
    width: "100%",
    backgroundColor: "white",
    padding: "24px 24px",   // keep consistent horizontal padding
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    boxSizing: "border-box" // ✅ important alignment fix
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
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tabRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    paddingRight: "8px" // ✅ adds breathing room from edge
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
    flex: 1,
    minWidth: 0,
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
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",          // ✅ ADD THIS
    boxSizing: "border-box" // (safe alignment fix)
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
  workspacePage: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "white",
    padding: "24px",
    boxSizing: "border-box",
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
  overflowY: "auto",
  overflowX: "hidden",
  paddingBottom: "8px",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "20px",
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