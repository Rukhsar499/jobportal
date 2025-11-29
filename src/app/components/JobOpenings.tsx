"use client";

import { useEffect, useState } from "react";

interface Job {
  job_id: number;
  job_title: string;
  job_short_description: string;
  job_description: string;
  exp_required: string;
  no_of_positions: number;
  minimum_qualification: string;
  last_dateof_application: string;
}

interface FormDataType {
  userid: string;
  username: string;
  user_mobileno: string;
  user_emailid: string;
  jobTitle: string;

  aadhar: string;
  address: string;
  highestQualification: string;
  professionalQualification: string;
  teaching_exp: string;
  relative_working: string;
  relative_name: string;
  relative_number: string;
  photo: File | null;
  cv: File | null;
}

export default function JobOpenings() {
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormDataType>({
    userid: "",
    username: "",
    user_mobileno: "",
    user_emailid: "",
    jobTitle: "",
    aadhar: "",
    address: "",
    highestQualification: "",
    professionalQualification: "",
    teaching_exp: "",
    relative_working: "",
    relative_name: "",
   relative_number: "",
    photo: null,
    cv: null,
  });
  const [savedUser, setSavedUser] = useState<{ userid: number; username: string; user_emailid: string; user_mobileno: string } | null>(null);

  

  // ✅ Load saved user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setSavedUser(parsed);
      } catch (err) {
        console.error("Error parsing stored user:", err);
      }
    }
  }, []);

  // ✅ Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("https://njportal.thenoncoders.in/api/v1/get_joblist", {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
          },
        });
        const data = await res.json();
        if (data.status) setJobs(data.data);
        else console.error("Failed to fetch jobs:", data.message);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);
  
  useEffect(() => {
  const fetchProfileData = async () => {
    if (!savedUser?.userid) return;

    try {
      const res = await fetch(`https://njportal.thenoncoders.in/api/v1/get_profile/${savedUser.userid}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
        },
      });

      const data = await res.json();
      if (data.status) {
        const profile = data.data;

        setFormData((prev) => ({
          ...prev,
          address: profile.address || "",
          highestQualification: profile.highest_qualification || "",
          professionalQualification: profile.professional_qualification || "",
          teaching_exp: profile.teaching_exp || "",
          relative_working: profile.relative_working || "",
          relative_name: profile.relative_name || "",
          relative_number: profile.relative_number || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  fetchProfileData();
}, [savedUser]);


  const handleOpenForm = (jobTitle: string) => {
    // 🔒 Check if user is logged in
    if (!savedUser) {
      alert("Please login first to apply for a job.");
      return; // stop here if not logged in
    }

    setFormData((prev) => ({
      ...prev,
      jobTitle,
      username: savedUser?.username || "",
      user_emailid: savedUser?.user_emailid || "",
      user_mobileno: savedUser?.user_mobileno || "",
    }));

    // ✅ Open form modal
    setIsOpen(true);
    setCurrentStep(1);
  };

  // ✅ Aadhaar validation helper
  const validateAadhaar = (aadhar: string) => /^[2-9]{1}[0-9]{11}$/.test(aadhar);

  // ✅ Step Navigation
  const handleNext = () => {
    // Step 1 → Step 2
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    

    // Step 2 → Step 3 (only if Aadhaar valid)
    if (currentStep === 2) {
      if (!formData.aadhar.trim()) {
        setErrorMessage("Please enter your Aadhaar number before continuing.");
        return;
      }

      if (!validateAadhaar(formData.aadhar)) {
        setErrorMessage("Invalid Aadhaar number. It must be 12 digits and start with 2–9.");
        return;
      }

      setErrorMessage("");
      setCurrentStep(3);
      return;
    }
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(""); // clear error on typing
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    }
  };

  // ✅ Submit form to API
  const handleSubmit = async () => {
    try {
      if (!formData.photo || !formData.cv) {
        alert("Please upload both photo and CV");
        return;
      }
      const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
      if (!aadhaarRegex.test(formData.aadhar)) {
        setErrorMessage("Please enter a valid 12-digit Aadhaar number (starting with 2–9).");
        return;
      }

      const job = jobs.find((j) => j.job_title === formData.jobTitle);
      if (!job) {
        alert("Job not found");
        return;
      }

      const data = new FormData();
      data.append("jobid", job.job_id.toString());
      data.append("applicantid", savedUser?.userid?.toString() || "");
      data.append("full_name", formData.username);
      data.append("mobileno", formData.user_mobileno);
      data.append("emailid", formData.user_emailid);
      data.append("aadharnumber", formData.aadhar);
      data.append("applicant_address", formData.address);
      data.append("highest_qualification", formData.highestQualification);
      data.append("professional_qualification", formData.professionalQualification);
      data.append("teaching_exp", formData.teaching_exp);
      data.append("relative_working", formData.relative_working);
      data.append("relative_name", formData.relative_name);
      data.append("relative_number", formData.relative_number);
      data.append("fileimg", formData.photo);
      data.append("file", formData.cv);

      // 🟢 Step 1: Submit application
      const res = await fetch("https://njportal.thenoncoders.in/api/v1/apply_for_job", {
        method: "POST",
        body: data,
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_INTERNAL_KEY || "",
        },
      });

      const result = await res.json();

      if (result.status) {
        const applicationId = result.data?.application_id || result.application_id;

        if (!applicationId) {
          alert("Application ID not returned from server!");
          return;
        }
        console.log("applicationId:", applicationId)
        // 🟢 Step 2: Initiate payment after application submission
        const paymentRes = await fetch("/api/initiate-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobapplication_id: applicationId,
            name: formData.username,
            email: formData.user_emailid,
            phone: formData.user_mobileno,
          }),
        });

        const paymentData = await paymentRes.json();
        console.log("Payment Response:", paymentData);

        if (paymentData.success && paymentData.redirect) {
          window.location.href = paymentData.redirect;
        } else {
          alert("Payment initiation failed.");
        }
      }
      else {
  // ❌ Show message when already applied
  alert(result.message || "Application already submitted!");
  setIsOpen(false); // modal band bhi kar sakte ho
}
    }
     catch (error) {
      console.error("Error submitting application:", error);
      alert("Something went wrong! Please try again.");
    }
    
  };


  return (
    <section className="py-16 bg-gray-50">
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#000]">Current Job Openings</h2>
      </div>

      {/* Job Cards */}
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.job_id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-6 hover:shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col"
            >
              <h3 className="text-xl font-semibold text-blue-900 mb-4">{job.job_title}</h3>
              <p className="text-gray-500 text-sm mb-3">
                <span className="font-semibold">Description:</span> {job.job_description}
              </p>
              <p className="text-gray-500 text-sm mb-3">
                <span className="font-semibold">Qualification:</span> {job.minimum_qualification}
              </p>
              <p className="text-gray-500 text-sm mb-3">
                <span className="font-semibold">Experience:</span> {job.exp_required}
              </p>
              <p className="text-gray-500 text-sm mb-3">
                <span className="font-semibold">No of positions:</span> {job.no_of_positions}
              </p>
              <p className="text-gray-500 text-sm mb-5">
                <span className="font-semibold">Last Date:</span> {job.last_dateof_application}
              </p>
              <div>
                <button
                  onClick={() => handleOpenForm(job.job_title)}
                  className="mt-auto inline-flex items-center justify-center bg-[#1A7EBD] text-white font-medium px-5 py-2 rounded-full hover:bg-[#166ea8] transition-all"
                >
                  Apply →
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-2 text-gray-500">Loading jobs...</p>
        )}
      </div>

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#00000096] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 relative">
            <h2 className="text-2xl font-bold mb-6 text-center">Application Form</h2>

            {/* Step Indicators */}
            <div className="relative flex items-center justify-between mx-auto mb-6 px-4">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-15 h-15 rounded-full flex items-center justify-center font-semibold z-10 ${currentStep === step ? "bg-[#ed7900] text-white" : step < currentStep ? "bg-[#ed7900] text-white" : "bg-[#1A7EBD] text-white"
                      }`}
                  >
                    {step}
                  </div>
                  {index < 2 && <div className={`flex-1 h-[3px] md:w-[201px] w-[60px] ${currentStep > step ? "bg-blue-400" : "bg-gray-300"}`}></div>}
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <input type="text" name="username" placeholder="Full Name" value={formData.username} onChange={handleChange} className="w-full p-2 text-sm border-b border-[#0000008a]" />
                <input type="tel" name="user_mobileno" placeholder="Phone" value={formData.user_mobileno} onChange={handleChange} className="w-full p-2 text-sm border-b border-[#0000008a]" />
                <input type="email" name="user_emailid" placeholder="Email" value={formData.user_emailid} onChange={handleChange} className="w-full p-2 text-sm border-b border-[#0000008a]" />
                <input type="text" name="jobTitle" value={formData.jobTitle} readOnly className="w-full p-2 bg-gray-100 text-sm border-b border-[#0000008a]" />
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <input
                  type="text"
                  name="aadhar"
                  placeholder="Aadhar Number"
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border-b border-[#0000008a]"
                  maxLength={12}
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}

                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border-b border-[#0000008a]"
                  required
                />

                <select
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border-b border-[#0000008a]"
                  required
                >
                  <option value="">Highest Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor’s">Bachelor’s</option>
                  <option value="Master’s">Master’s</option>
                </select>

                <select
                  name="professionalQualification"
                  value={formData.professionalQualification}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border-b border-[#0000008a]"
                  required
                >
                  <option value="">Professional Qualification</option>
                  <option value="React">React</option>
                  <option value="Node.js">Node.js</option>
                  <option value="Laravel">Laravel</option>
                </select>

                <select
                  name="teaching_exp"
                  value={formData.teaching_exp}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border-b border-[#0000008a]"
                  required
                >
                  <option value="">Teaching Experience</option>
                  <option value="Fresher">Fresher</option>
                  <option value="1-2yrs">1-2yrs</option>
                  <option value="2-3yrs">2-3yrs</option>
                  <option value="3-5yrs">3-5yrs</option>
                  <option value="5-10yrs">5-10yrs</option>
                  <option value="10 or above">10 or above</option>
                </select>

                {/* ✅ Relative Working in Narayana */}
                <div className="flex items-center justify-between space-x-4 mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    Relative working in Narayana?
                  </label>
                  <div className="flex items-center  space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="relative_working"
                        value="yes"
                        checked={formData.relative_working === "yes"}
                        onChange={handleChange}
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="relative_working"
                        value="no"
                        checked={formData.relative_working === "no"}
                        onChange={handleChange}
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

                {/* ✅ Show inputs only if user selects Yes */}
                {formData.relative_working === "yes" && (
                  <div className="flex gap-4 mt-2">
                    <input
                      type="text"
                      name="relative_name"
                      placeholder="Relative’s Name"
                      value={formData.relative_name}
                      onChange={handleChange}
                      className="w-1/2 p-2 text-sm border-b border-[#0000008a]"
                    />
                    <input
                      type="text"
                      name="relative_number"
                      placeholder="Relative’s Phone"
                      value={formData.relative_number}
                      onChange={handleChange}
                      className="w-1/2 p-2 text-sm border-b border-[#0000008a]"
                      maxLength={10}
                    />
                  </div>
                )}
              </div>
            )}




            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="block mb-1">Upload Photo</label>
                  <div className="flex items-center gap-4">
                    <label className="bg-[#1A7EBD] text-white px-4 py-2 rounded cursor-pointer">
                      {formData.photo ? "Change Photo" : "Choose Photo"}
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {formData.photo && <span className="text-gray-700">{formData.photo.name}</span>}
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block mb-1">Upload CV</label>
                  <div className="flex items-center gap-4">
                    <label className="bg-[#1A7EBD] text-white px-4 py-2 rounded cursor-pointer">
                      {formData.cv ? "Change CV" : "Choose CV"}
                      <input
                        type="file"
                        name="cv"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {formData.cv && <span className="text-gray-700">{formData.cv.name}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 && <button onClick={handlePrev} className="bg-[#1A7EBD] text-white font-medium px-5 py-2 rounded-full">Previous →</button>}
              {currentStep < 3 && <button onClick={handleNext} className="bg-[#000] text-white font-medium px-5 py-2 rounded-full">Next →</button>}
              {currentStep === 3 && <button onClick={handleSubmit} className="bg-green-600 text-white font-medium px-5 py-2 rounded-full">Submit & Pay →</button>}
            </div>

            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold">X</button>
          </div>
        </div>
      )}
    </section>
  );
}
