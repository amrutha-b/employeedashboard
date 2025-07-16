import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase.from("employees").select("*");
    if (data) setEmployees(data);
  };

  const handleAddEmployee = async () => {
    if (newName && newRole && newEmail && newPhone) {
      const { data, error } = await supabase
        .from("employees")
        .insert([{ name: newName, role: newRole, email: newEmail, phone: newPhone }])
        .select();

      if (!error && data?.length > 0) {
        setNewName("");
        setNewRole("");
        setNewEmail("");
        setNewPhone("");
        setShowAddPage(false);
        fetchEmployees();
        alert("Employee Added Successfully! Email will be sent automatically.");
        handleSendEmail(data[0]);
      } else {
        console.error("Error adding employee:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("employees").delete().eq("id", id);
    fetchEmployees();
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);
    setEditData({ ...emp });
  };

  const handleSaveEdit = async (id) => {
    await supabase
      .from("employees")
      .update({
        name: editData.name,
        role: editData.role,
        email: editData.email,
        phone: editData.phone,
      })
      .eq("id", id);

    setEditId(null);
    fetchEmployees();
    alert("Employee details updated!");
  };

  const handleChangeEdit = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSendEmail = async (employee) => {
    try {
      const response = await fetch("https://amruthaamru.app.n8n.cloud/webhook/send-employee-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (response.ok) {
        console.log("Email sent successfully!");
        alert("Email sent successfully!");
      } else {
        console.error("Failed to send email.");
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email.");
    }
  };

  return (
    <div className="container text-center mt-5">
      {!showAddPage ? (
        <>
          <h2 style={{ color: "#5bc0de" }}>Employee Management Dashboard</h2>
          <p className="text-muted">Manage your team easily and effectively</p>

          <div className="mt-4">
            <div className="p-4 text-white bg-info rounded shadow d-inline-block">
              <h3>{employees.length}</h3>
              <p>Total Employees</p>
            </div>
          </div>

          <button className="btn btn-primary mt-3" onClick={() => setShowAddPage(true)}>
            + Add New Employee
          </button>

          {employees.length > 0 && (
            <div className="mt-5">
              <h4>Employee List</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, index) => (
                    <tr key={emp.id}>
                      <td>{index + 1}</td>
                      <td>
                        {editId === emp.id ? (
                          <input
                            name="name"
                            value={editData.name}
                            onChange={handleChangeEdit}
                            className="form-control"
                          />
                        ) : (
                          emp.name
                        )}
                      </td>
                      <td>
                        {editId === emp.id ? (
                          <input
                            name="role"
                            value={editData.role}
                            onChange={handleChangeEdit}
                            className="form-control"
                          />
                        ) : (
                          emp.role
                        )}
                      </td>
                      <td>
                        {editId === emp.id ? (
                          <input
                            name="email"
                            value={editData.email}
                            onChange={handleChangeEdit}
                            className="form-control"
                          />
                        ) : (
                          emp.email
                        )}
                      </td>
                      <td>
                        {editId === emp.id ? (
                          <input
                            name="phone"
                            value={editData.phone}
                            onChange={handleChangeEdit}
                            className="form-control"
                          />
                        ) : (
                          emp.phone
                        )}
                      </td>
                      <td>
                        {editId === emp.id ? (
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveEdit(emp.id)}>
                            Save
                          </button>
                        ) : (
                          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(emp)}>
                            Edit
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(emp.id)}>
                          Delete
                        </button>
                        <button className="btn btn-info btn-sm" onClick={() => handleSendEmail(emp)}>
                          Send Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 style={{ color: "#5bc0de" }}>Add New Employee</h2>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Full Name"
              className="form-control mb-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email ID"
              className="form-control mb-2"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="form-control mb-2"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Role"
              className="form-control mb-2"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <button className="btn btn-success me-2" onClick={handleAddEmployee}>
              Add Employee & Send Email
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddPage(false)}>
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
