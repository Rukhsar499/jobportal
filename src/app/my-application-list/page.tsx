"use client";
import { useEffect, useState } from "react";

interface Application {
  job_title: string;
  job_short_description: string;
  applicationdate: string;
  Txn_Status: string;
  PaidStatus: boolean;
}

export default function MyApplications() {

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
  const stored = localStorage.getItem("user_info");
  if (stored) {
    const parsed = JSON.parse(stored);
    console.log("🔥 Parsed User:", parsed);

    setUserId(parsed.userid || parsed.user_id || null);
    console.log("🔥 Setting UserId:", parsed.userid);
  }
}, []);

  useEffect(() => {
    console.log("📦 LocalStorage user_info:", localStorage.getItem("user_info"));
    console.log("🆔 Current userId state:", userId);
    if (!userId) return;

    async function fetchApplications() {
      try {
        const res = await fetch(
          `https://njportal.thenoncoders.in/api/v1/get_myapplications?userid=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
            },
          }
        );
        console.log("Loaded userId:", userId);
        const data = await res.json();
        console.log("Applications:", data);

        if (data.status && Array.isArray(data.data)) {
          setApplications(data.data);
        } else {
          setApplications([]);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [userId]);

  const getStatusColor = (status: string | null, paid: boolean) => {
    const s = status ? status.toLowerCase() : "";

    if (s.includes("success")) return "bg-green-100 text-green-700";
    if (s.includes("cancel")) return "bg-red-100 text-red-700";
    if (s.includes("pending")) return "bg-yellow-100 text-yellow-700";

    if (!paid) return "bg-gray-100 text-gray-700";

    return "bg-blue-100 text-blue-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg font-medium">Loading your applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg font-medium">
          You haven’t applied for any vacancies yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-20 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app, index) => (
          <div
            key={index}
            className="bg-[#ed7a0011]  rounded-xl shadow-sm p-5 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{app.job_title}</h2>
            <p className="text-sm text-gray-500 mb-3">
              {app.job_short_description.length > 80
                ? app.job_short_description.slice(0, 80) + "..."
                : app.job_short_description}
            </p>

            <p className="text-sm text-gray-500 mb-2">
              Applied On:{" "}
              <span className="font-medium">
                {new Date(app.applicationdate).toLocaleDateString("en-IN")}
              </span>
            </p>

            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                app.Txn_Status,
                app.PaidStatus
              )}`}
            >
              {app.Txn_Status
                ? app.Txn_Status === "success"
                  ? "Selected / Payment Success"
                  : app.Txn_Status === "userCancelled"
                    ? "Cancelled by User"
                    : app.Txn_Status
                : "Not Paid / Not Attempted"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
