"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useUser } from "../context/UserContext";

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
  upload_cv: string;
  profilepic: string;
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

function ProfilePageContent() {
  // ✅ Form default empty values
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
    upload_cv: "",
    profilepic: "",
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

  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);

  // const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  // ⭐ Load Local Storage UserID
  const { user } = useUser();
  useEffect(() => {

    if (user?.userid) {
      setStoredUserId(String(user.userid));
    }
    if (user) {
      setStoredUserId(String(user.userid || user.user_id || ""));
    }
  }, []);

  // ⭐ Fetch States
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

        if (data.status && Array.isArray(data.data)) {
          const formatted = data.data.map((s: ApiState) => ({
            id: String(s.stateid),
            name: s.statename,
          }));
          setStates(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchStates();
  }, []);

  // ⭐ Fetch Profile
  useEffect(() => {
    if (!storedUserId) return;

    async function fetchProfile() {
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
        console.log("API Response:", json.data[0]);
        console.log("🔥 Profile Response:", json);

        if (json.status && json.data.length > 0) {
          const p = json.data[0];

          // ⭐ Map ALL FIELDS CORRECTLY
          setFormData({
            userid: String(p.userid) ?? "",
            referby: p.referby ?? "",
            full_name: p.full_name ?? "",
            emailid: p.emailid ?? "",
            mobileno: p.mobileno ?? "",
            dob: p.dob ? p.dob.split("T")[0] : "",
            city_name: p.city_name ?? "",
            stateid: String(p.stateid) ?? "",
            statename: p.statename ?? "",
            pincode: p.pincode ?? "",
            upload_cv: p.upload_cv ?? "",
            profilepic: p.profilepic ?? "",
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

          if (p.profilepic) setPhotoPreview(p.profilepic);
        }
      } catch (err) {
        console.error("❌ Fetch Profile Error:", err);
      }
    }

    fetchProfile();
  }, [storedUserId]);


  console.log("🔥 Get Profile:", formData);

  // ✅ Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleCv = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setCvFile(f);
  };

  // client-side validation
  const validate = (): string | null => {
    const required: (keyof UserProfile)[] = [
      "full_name",
      "mobileno",
      "emailid",
      "dob",
      "aadharnumber",
      "applicant_address",
      "highest_qualification",
      "professional_qualification",
      "teaching_exp",
      "relative_working",
      "relative_name",
      "relative_number",
      "city_name",
      "stateid",
      "pincode",
      "referby",
    ];

    // for (const k of required) {
    //   if (!String(((user as unknown) as Record<string, unknown>)[k] ?? "").trim())
    //     return `${k.replace(/_/g, " ")} is required`;
    // }

    // Profile photo required only on first time
    if (!formData.fileimg && !photoFile) {
      return "Please select a profile photo";
    }

    // CV required only on first time
    if (!formData.file && !cvFile) {
      return "Please upload your CV";
    }

    if (!/^\d{10}$/.test(formData.mobileno)) return "Mobile must be 10 digits";
    if (!/^\S+@\S+\.\S+$/.test(formData.emailid)) return "Enter a valid email";

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      alert(v);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      fd.append("userid", formData.userid);
      fd.append("referby", formData.referby);
      fd.append("full_name", formData.full_name);
      fd.append("emailid", formData.emailid);
      fd.append("mobileno", formData.mobileno);
      fd.append("dob", formData.dob);
      fd.append("city_name", formData.city_name);
      fd.append("stateid", formData.stateid);
      fd.append("pincode", formData.pincode);
      fd.append("aadharnumber", formData.aadharnumber);
      fd.append("applicant_address", formData.applicant_address);
      fd.append("highest_qualification", formData.highest_qualification);
      fd.append("professional_qualification", formData.professional_qualification);
      fd.append("teaching_exp", formData.teaching_exp);
      fd.append("relative_working", formData.relative_working);
      fd.append("relative_name", formData.relative_name);
      fd.append("relative_number", formData.relative_number);

      // files
      if (photoFile) {
        fd.append("fileimg", photoFile);   // correct backend name
      }

      if (cvFile) {
        fd.append("file", cvFile);         // correct backend name
      }


      const res = await fetch("https://njportal.thenoncoders.in/api/v1/update_profile", {
        method: "POST",
        headers: {
          // DO NOT set Content-Type (browser sets boundary for FormData)
          "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
        },
        body: fd,
      });


      if (res.status === 401) {
        alert("Unauthorized (401). Check your x-api-key.");
        setLoading(false);
        return;
      }

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("update_profile failed", payload);
        alert("Update failed: " + (payload?.message ?? res.statusText));
        setLoading(false);
        return;
      }

      if (payload?.status === true) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed: " + (payload?.message || "Unknown error"));
      }
      async function refreshProfile() {
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
        if (json.status && Array.isArray(json.data) && json.data.length > 0) {
          const newProfile = json.data[0];

          // ⭐ ONLY ONE setFormData (correct mapping)
          setFormData({
            userid: String(newProfile.userid) ?? "",
            referby: newProfile.referby ?? "",
            full_name: newProfile.full_name ?? "",
            emailid: newProfile.emailid ?? "",
            mobileno: newProfile.mobileno ?? "",
            dob: newProfile.dob ? newProfile.dob.split("T")[0] : "",
            city_name: newProfile.city_name ?? "",
            stateid: String(newProfile.stateid) ?? "",
            statename: newProfile.statename ?? "",
            pincode: newProfile.pincode ?? "",
            upload_cv: newProfile.upload_cv ?? "",
            profilepic: newProfile.profilepic ?? "",
            aadharnumber: newProfile.aadharnumber ?? "",
            applicant_address: newProfile.applicant_address ?? "",
            highest_qualification: newProfile.highest_qualification ?? "",
            professional_qualification: newProfile.professional_qualification ?? "",
            teaching_exp: newProfile.teaching_exp ?? "",
            relative_working: newProfile.relative_working ?? "",
            relative_name: newProfile.relative_name ?? "",
            relative_number: newProfile.relative_number ?? "",
            fileimg: newProfile.profilepic,
            file: newProfile.upload_cv,
          });

          // photo preview update
          if (newProfile.profilepic) {
            setPhotoPreview(newProfile.profilepic);        
          }

          // save to local
          localStorage.setItem("user_profile", JSON.stringify(newProfile));
        }
      }

      await refreshProfile();

      // Stop editing mode


      // ProfilePageContent();

      console.log("Sending:", formData);


      setIsEditing(false);
    } catch (err) {
      console.error("submit error:", err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }

  };



  // UI helpers
  const inputBase =
    "w-full px-4 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="min-h-screen mt-13 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl  overflow-hidden"
      >
        {/* header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Candidate Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Fill your details — all fields are required</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  // reset previews if cancel editing
                  setPhotoFile(null);
                  setCvFile(null);
                  setPhotoPreview(formData.fileimg ?? null);
                }
                setIsEditing((s) => !s);
              }}
              className="px-4 py-2 rounded-lg bg-white border shadow hover:shadow-md text-indigo-700"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>

            {isEditing && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>

        {/* body */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* left: visual + uploads */}
          <div className="col-span-1 flex flex-col items-center gap-6">
            <div className="w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-gray-200">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : formData.fileimg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.fileimg} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-3">
                  <div className="text-sm font-medium text-indigo-700">No Photo</div>
                  <div className="text-xs text-gray-400">Upload to preview</div>
                </div>
              )}
            </div>

            <label className="w-full">
              <div className="text-sm font-medium text-gray-700 mb-2">Profile Photo *</div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                disabled={!isEditing}
                required={!formData.fileimg && !photoFile}
                className="w-full text-sm text-gray-600"
              />
            </label>

            <div className="w-full">
              <div className="text-sm font-medium text-gray-700 mb-2">CV Upload *</div>
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCv}
                    disabled={!isEditing}
                    required={!formData.file && !cvFile}
                    className="w-full text-sm text-gray-600"
                  />
                </label>
                <div className="text-xs text-gray-500">
                  {cvFile ? cvFile.name : formData.file ? extractFilename(formData.file) : "No file"}
                </div>
              </div>
            </div>
          </div>

          {/* right: form fields two-column grid across 2/3 width */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Refer By *</label>
                <input
                  name="referby"
                  value={formData.referby}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input
                  name="mobileno"
                  value={formData.mobileno}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  inputMode="numeric"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email ID *</label>
                <input
                  name="emailid"
                  value={formData.emailid}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  type="email"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  type="date"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhar Number *</label>
                <input
                  name="aadharnumber"
                  value={formData.aadharnumber}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <textarea
                  name="applicant_address"
                  value={formData.applicant_address}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  rows={3}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Highest Qualification *</label>
                <input
                  name="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Professional Qualification *</label>
                <input
                  name="professional_qualification"
                  value={formData.professional_qualification}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teaching Experience *</label>
                <input
                  name="teaching_exp"
                  value={formData.teaching_exp}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  name="city_name"
                  value={formData.city_name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <select
                  name="stateid"
                  value={formData.stateid}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={inputBase}
                >
                  <option value="">Select State</option>
                  {states.length > 0 ? (
                    states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading states...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode *</label>
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                  className={inputBase}
                />
              </div>


              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relative Working *</label>
                  <input
                    name="relative_working"
                    value={formData.relative_working}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    required
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relative Name *</label>
                  <input
                    name="relative_name"
                    value={formData.relative_name}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    required
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relative Number *</label>
                  <input
                    name="relative_number"
                    value={formData.relative_number}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    required
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- Helpers ---------- */

function extractFilename(url?: string) {
  if (!url) return "";
  try {
    const parts = url.split("/");
    return parts[parts.length - 1];
  } catch {
    return url;
  }
}
