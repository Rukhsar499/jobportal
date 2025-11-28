"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useUser } from "../context/UserContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

interface ApiState {
  stateid: number | string;
  statename: string;
}

interface UserProfile {
  referby: string;
  userid: string;
  full_name: string;
  emailid: string;
  mobileno: string;
  dob: string;
  city_name: string;
  stateid: string;
  statename: string;
  pincode: string;
  // upload_cv: string;
  // profilepic: string;
  aadharnumber: string;
  applicant_address: string;
  highest_qualification: string;
  professional_qualification: string;
  teaching_exp: string;
  relative_working: string;
  relative_name: string;
  relative_number: string;
  fileimg?: string;
  file?: string;
}

/* ============================================
    BASE URL Fix
==============================================*/
const BASE_URL = "https://njportal.thenoncoders.in/";

function fullURL(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return BASE_URL + path;
}

function extractFilename(url?: string) {
  if (!url) return "";
  return url.split("/").pop() || url;
}

/* ============================================
    MAIN COMPONENT
==============================================*/
function ProfilePageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserProfile>({
    userid: "",
    referby: "",
    full_name: "",
    emailid: "",
    mobileno: "",
    dob: "",
    city_name: "",
    stateid: "",
    statename: "",
    pincode: "",
    // upload_cv: "",
    // profilepic: "",
    aadharnumber: "",
    applicant_address: "",
    highest_qualification: "",
    professional_qualification: "",
    teaching_exp: "",
    relative_working: "",
    relative_name: "",
    relative_number: "",
    fileimg: "",
    file: "",
  });

  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "profile" | "address" | "documents"
  >("profile");

  const { user } = useUser();

  /* LOAD USER ID */
  useEffect(() => {
    if (user) {
      setStoredUserId(String(user.userid || user.user_id || ""));
    }
  }, [user]);

  /* FETCH STATE LIST */
  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await fetch(
          "https://njportal.thenoncoders.in/api/v1/get_statelist",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
            },
          }
        );

        const data = await res.json();

        if (data.status) {
          setStates(
            data.data.map((s: ApiState) => ({
              id: String(s.stateid),
              name: s.statename,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchStates();
  }, []);

  /* FETCH PROFILE */
  async function fetchProfile() {
    if (!storedUserId) return;

    try {
      const res = await fetch(
        `https://njportal.thenoncoders.in/api/v1/get_myprofile?userid=${storedUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
          },
        }
      );

      const json = await res.json();

      if (json.status && json.data.length > 0) {
        const p = json.data[0];

        setFormData({
          userid: String(p.userid),
          referby: p.referby ?? "",
          full_name: p.full_name ?? "",
          emailid: p.emailid ?? "",
          mobileno: p.mobileno ?? "",
          dob: p.dob ? p.dob.split("T")[0] : "",
          city_name: p.city_name ?? "",
          stateid: String(p.stateid ?? ""),
          statename: p.statename ?? "",
          pincode: p.pincode ?? "",
          // upload_cv: p.upload_cv ?? "",
          // profilepic: p.profilepic ?? "",
          aadharnumber: p.aadharnumber ?? "",
          applicant_address: p.applicant_address ?? "",
          highest_qualification: p.highest_qualification ?? "",
          professional_qualification: p.professional_qualification ?? "",
          teaching_exp: p.teaching_exp ?? "",
          relative_working: p.relative_working ?? "",
          relative_name: p.relative_name ?? "",
          relative_number: p.relative_number ?? "",
          fileimg: p.profilepic,
          file: p.upload_cv,
        });

        setPhotoPreview(fullURL(p.profilepic));
      }
    } catch (err) {
      console.error("Fetch Profile Error:", err);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [storedUserId]);

  /* INPUT HANDLERS */
  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    setPhotoPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleCv = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setCvFile(f);
  };

  /* VALIDATION */
  const validate = () => {
    if (!formData.full_name) return "Full Name is required";
    if (!/^\d{10}$/.test(formData.mobileno))
      return "Mobile number must be 10 digits";

    // if (!formData.fileimg && !photoFile) return "Upload profile photo";
    // if (!formData.file && !cvFile) return "Upload CV";

    return null;
  };

  /* SUBMIT HANDLER */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const v = validate();
    if (v) return alert(v);

    setLoading(true);

    try {
      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = (formData as any)[key];
        if (typeof value === "string") fd.append(key, value);
      });

      if (photoFile) fd.append("fileimg", photoFile);
      if (cvFile) fd.append("file", cvFile);

      const res = await fetch(
        "https://njportal.thenoncoders.in/api/v1/update_profile",
        {
          method: "POST",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
          },
          body: fd,
        }
      );

      const json = await res.json();

      if (!json.status) {
        alert("Update Failed");
      } else {
        alert("Profile Updated Successfully!");
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  /* ============================================
      UI
  ===============================================*/

  return (
    <div className="min-h-screen mt-13 bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* LEFT SIDE TABS */}
        <div className="bg-white rounded-xl border shadow-sm h-fit">
          <div className="p-4 border-b font-bold text-lg">My Account</div>
          <ul className="p-2 text-sm">
            <li
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-2 cursor-pointer font-medium rounded-lg ${activeTab === "profile"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-100"
                }`}
            >
              Profile Information
            </li>

            <li
              onClick={() => router.push("/my-application-list")}
              className="px-3 py-2 cursor-pointer rounded-lg hover:bg-indigo-100"
            >
              My Application
            </li>

            <li
              onClick={() => setActiveTab("documents")}
              className={`px-3 py-2 cursor-pointer rounded-lg ${activeTab === "documents"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-100"
                }`}
            >
              Documents
            </li>

            <li
            onClick={() => router.push("/")} className="px-3 py-2 hover:bg-indigo-100 cursor-pointer">
              Home
            </li>
          </ul>
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="md:col-span-3">

          {/* ===================== PROFILE TAB ===================== */}
          {activeTab === "profile" && (
            <form
              onSubmit={handleSubmit}
              className="max-w-5xl mx-auto bg-white rounded-3xl shadow overflow-hidden"
            >

              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b">
                <div>
                  <h1 className="text-2xl font-bold">Your Profile</h1>
                  <p className="text-sm text-gray-500">
                    Fill your details — all fields are required
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        fetchProfile();
                      }
                      setIsEditing(!isEditing);
                    }}
                    className="px-4 py-2 bg-white border rounded-lg shadow"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT SIDE UPLOAD */}
                <div className="flex flex-col items-center gap-6">
                  {/* IMAGE */}
                  <div className="w-40 h-40 bg-gray-100 rounded-xl border overflow-hidden flex justify-center items-center">
                    {/* {photoPreview || formData.fileimg ? (
                     <Image
                        src={photoPreview || fullURL(formData.fileimg) || ""}
                        width={300}
                        height={300}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p>No Photo</p>
                    )} */}
                    {photoPreview ? (
                      // Local preview image (no fullURL)
                      <Image
                        src={photoPreview}
                        width={300}
                        height={300}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : formData.fileimg ? (
                      // Server stored image
                      <Image
                        src={fullURL(formData.fileimg)}
                        width={300}
                        height={300}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p>No Photo</p>
                    )}
                  </div>

                  {/* Upload Photo */}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isEditing}
                    onChange={handlePhoto}
                    className="w-full"
                  />

                  {/* Upload CV */}
                  <div className="w-full text-sm text-gray-700">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={!isEditing}
                      onChange={handleCv}
                      className="w-full"
                    />
                    {/* <div className="mt-1 text-xs">
                      {cvFile
                        ? cvFile.name
                        : formData.file
                        ? extractFilename(formData.file)
                        : "No file"}
                    </div> */}
                    <div className="mt-1 text-xs">
                      {cvFile ? (
                        // Local selected file (just filename, no link yet)
                        <span>{cvFile.name}</span>
                      ) : formData.file ? (
                        // Server stored file
                        <a
                          href={fullURL(formData.file)} // fullURL same base url logic
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        <span>No file</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE FORM */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ALL YOUR INPUT FIELDS (unchanged) */}

                  <label className="block">
                    Full Name *
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Mobile Number *
                    <input
                      name="mobileno"
                      value={formData.mobileno}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Email *
                    <input
                      name="emailid"
                      value={formData.emailid}
                      readOnly
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    DOB *
                    <input
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Aadhar *
                    <input
                      name="aadharnumber"
                      value={formData.aadharnumber}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    Address *
                    <textarea
                      name="applicant_address"
                      value={formData.applicant_address}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    ></textarea>
                  </label>

                  <label className="block">
                    Highest Qualification *
                    <input
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Professional Qualification *
                    <input
                      name="professional_qualification"
                      value={formData.professional_qualification}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Teaching Experience *
                    <select
                      name="teaching_exp"
                      value={formData.teaching_exp}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Select</option>
                      <option value="Fresher">Fresher</option>
                      <option value="1-2yrs">1-2yrs</option>
                      <option value="2-3yrs">2-3yrs</option>
                      <option value="3-5yrs">3-5yrs</option>
                      <option value="5-10yrs">5-10yrs</option>
                      <option value="10 or above">10 or above</option>
                    </select>
                  </label>

                  <label className="block">
                    City *
                    <input
                      name="city_name"
                      value={formData.city_name}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    State *
                    <select
                      name="stateid"
                      value={formData.stateid}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    Pincode *
                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Relative Working *
                    <input
                      name="relative_working"
                      value={formData.relative_working}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Relative Name *
                    <input
                      name="relative_name"
                      value={formData.relative_name}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>

                  <label className="block">
                    Relative Number *
                    <input
                      name="relative_number"
                      value={formData.relative_number}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* ===================== ADDRESS TAB ===================== */}
          {activeTab === "address" && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-3">Manage Address</h2>
              <p className="text-gray-600">You can add and edit address here.</p>
            </div>
          )}

          {/* ===================== DOCUMENTS TAB ===================== */}
          {activeTab === "documents" && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-3">Your Documents</h2>

              {formData.file ? (
                <a
                  href={fullURL(formData.file)}
                  target="_blank"
                  className="text-indigo-600 underline"
                >
                  View CV
                </a>
              ) : (
                <p>No documents uploaded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { extractFilename };
