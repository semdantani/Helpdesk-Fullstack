import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useComplaintStore from "../store/useComplaintStore";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("User");

  // Admin Form Modal States
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [solutionText, setSolutionText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // User Solution View Modal State
  const [viewSolutionModal, setViewSolutionModal] = useState(null);

  const {
    complaints,
    isLoading,
    fetchComplaints,
    updateStatus,
    deleteComplaint,
    initializeSignalR,
  } = useComplaintStore();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const decoded = jwtDecode(token);
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      "User";
    setUserRole(role);

    fetchComplaints(token);
    initializeSignalR();
  }, [token, fetchComplaints, initializeSignalR, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openSolveModal = (complaint) => {
    setCurrentComplaint(complaint);
    setSolutionText(complaint.solution || "");
    setIsSolveModalOpen(true);
  };

  const handleAiHelp = async () => {
    if (!currentComplaint) return;
    setIsAiLoading(true);
    setSolutionText("Generating AI Solution... ✨");

    try {
      const response = await axios.get(
        `http://helpdeskapi-sem.somee.com/api/Complaints/${currentComplaint.id}/ai-solution`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSolutionText(response.data.solution);
    } catch (err) {
      setSolutionText("Failed to get AI response. Please type manually.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSolveSubmit = async () => {
    if (!solutionText.trim()) {
      alert("Please enter a solution before submitting.");
      return;
    }
    await updateStatus(currentComplaint.id, "Resolved", solutionText, token);
    setIsSolveModalOpen(false);
    setCurrentComplaint(null);
    setSolutionText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              {userRole === "Admin" ? "Admin Dashboard" : "My Complaints"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track support tickets
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Tickets</h2>
            {userRole === "User" && (
              <button
                onClick={() => navigate("/create-complaint")}
                className="px-4 py-2 bg-blue-600 text-white text-sm cursor-pointer font-medium rounded-md hover:bg-blue-700"
              >
                + New Complaint
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>
                      {/* Column 1: Issue */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">
                          {complaint.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {complaint.description}
                        </div>
                      </td>

                      {/* Column 2: Status (User click karke solution dekh sakta hai) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userRole === "User" ? (
                          complaint.status === "Resolved" ? (
                            <button
                              onClick={() => setViewSolutionModal(complaint)}
                              className="px-3 cursor-pointer py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full hover:bg-green-200 shadow-sm transition cursor-pointer"
                            >
                              Solved (View Solution)
                            </button>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full cursor-not-allowed">
                              Pending
                            </span>
                          )
                        ) : (
                          // Admin Status View
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${complaint.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {complaint.status || "Pending"}
                          </span>
                        )}
                      </td>

                      {/* Column 3: Actions (Admin: Solve, User: Delete) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userRole === "Admin" ? (
                          complaint.status !== "Resolved" ? (
                            <button
                              onClick={() => openSolveModal(complaint)}
                              className="bg-blue-600 cursor-pointer text-white hover:bg-blue-700 px-4 py-2 rounded-md shadow-sm transition"
                            >
                              Solve Complaint
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md font-bold cursor-not-allowed"
                            >
                              Solved
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this complaint?",
                                )
                              )
                                deleteComplaint(complaint.id, token);
                            }}
                            className="text-red-600 cursor-pointer bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- ADMIN: SOLVE FORM MODAL --- */}
      {isSolveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Resolve Complaint #{currentComplaint?.id}
            </h3>

            {/* UPAR AI BUTTON */}
            <div className="mb-4">
              <button
                onClick={handleAiHelp}
                disabled={isAiLoading}
                className="w-full cursor-pointer py-2 bg-purple-100 text-purple-700 font-bold rounded-md hover:bg-purple-200 transition border border-purple-300"
              >
                {isAiLoading ? "Analyzing Issue..." : "✨ Use AI Assistant"}
              </button>
            </div>

            {/* BEECH ME TEXTAREA */}
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write the solution here..."
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              disabled={isAiLoading}
            ></textarea>

            {/* NEECHE SUBMIT BUTTON */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setIsSolveModalOpen(false)}
                className="px-4 cursor-pointer py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSolveSubmit}
                className="px-4 cursor-pointer py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                disabled={isAiLoading}
              >
                Submit Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- USER: VIEW SOLUTION MODAL --- */}
      {viewSolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <h3 className="text-xl font-bold text-gray-800">
                Issue Resolved
              </h3>
            </div>

            <p className="text-sm text-gray-500 font-semibold mb-2">
              Message from Admin:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md text-gray-800 whitespace-pre-wrap">
              {viewSolutionModal.solution || "No message provided."}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewSolutionModal(null)}
                className="px-4 cursor-pointer py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
