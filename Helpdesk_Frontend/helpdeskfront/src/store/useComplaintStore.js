import { create } from "zustand";
import axios from "axios";
import * as signalR from "@microsoft/signalr";

const useComplaintStore = create((set, get) => ({
  complaints: [],
  isLoading: false,
  error: null,

  fetchComplaints: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        "http://helpdeskapi-sem.somee.com/api/Complaints",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      set({ complaints: response.data, isLoading: false });
    } catch (err) {
      set({ error: "Failed to laod cpmplaints.", isLoading: false });
    }
  },

  updateStatus: async (id, newStatus, solutionText, token) => {
    try {
      await axios.put(
        `http://helpdeskapi-sem.somee.com/api/Complaints/${id}/status`,
        {
          status: newStatus,
          solution: solutionText, // Backend ko solution bhej rahe hain
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Frontend me bhi status aur solution update kar diya
      set((state) => ({
        complaints: state.complaints.map((c) =>
          c.id === id ? { ...c, status: newStatus, solution: solutionText } : c,
        ),
      }));
    } catch (err) {
      console.error("Update Failed", err);
    }
  },

  deleteComplaint: async (id, token) => {
    try {
      await axios.delete(
        `http://helpdeskapi-sem.somee.com/api/Complaints/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      set((state) => ({
        complaints: state.complaints.filter((c) => c.id !== id),
      }));
    } catch (err) {
      console.error("Delete failed", err);
    }
  },
  initializeSignalR: () => {
    if (window.signalRConnection) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7225/complaintHub")
      .withAutomaticReconnect()
      .build();

    //global window object mein save kar diya taaki duplicate na bane
    window.signalRConnection = connection;

    connection.on("ReceiveNewComplaint", (newComplaint) => {
      console.log("Live Complaint Received!", newComplaint);

      set((state) => {
        const alreadyExists = state.complaints.some(
          (c) => c.id === newComplaint.id,
        );
        if (alreadyExists) {
          return state;
        }
        return { complaints: [newComplaint, ...state.complaints] };
      });
    });

    connection
      .start()
      .then(() => console.log("SignalR Connected Successfully!"))
      .catch((err) => console.error("SignalR Connection Error:", err));
  },
}));
export default useComplaintStore;
