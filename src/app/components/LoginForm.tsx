"use client";
import { useState, useEffect, useRef } from "react";
import { apiPost } from "../../lib/apiClient";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LoginFormData {
  email: string;
  password: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  login_data?: {
    userid: number;
    username: string;
    user_emailid: string;
    user_mobileno: string;
  };
}
interface GenerateOtpResponse {
  status: boolean;
  message: string;
}
interface UpdatePasswordResponse {
  status: boolean;
  message: string;
}

export default function LoginForm() {

  const { setUser } = useUser();
  const router = useRouter();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);
  const [alreadyLogged, setAlreadyLogged] = useState<string | null>(null);


  // Forgot Password popup
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popupMsg, setPopupMsg] = useState("");
  const [popupLoading, setPopupLoading] = useState(false);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, [setUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setAlreadyLogged(parsedUser.username);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await apiPost<ApiResponse, LoginFormData>(
        "v1/validate_login",
        formData
      );

      if (res.status && res.login_data) {
        const userData = {
          userid: res.login_data.userid,
          username: res.login_data.username,
          user_emailid: res.login_data.user_emailid,
          user_mobileno: res.login_data.user_mobileno,
        };

        // ✅ Step 1: Save normal user (existing code)
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        // ✅ Step 2: ALSO save user_info (for Profile page compatibility)
        const userInfo = {
          user_id: res.login_data.userid,
          userid: res.login_data.userid,
          name: res.login_data.username,
          mobile_no: res.login_data.user_mobileno,
          email: res.login_data.user_emailid,
        };
        localStorage.setItem("user_info", JSON.stringify(userInfo));

        // ✅ Optional welcome message
        setWelcomeUser(res.login_data.username);

        // ✅ Step 3: Reload after success
        setTimeout(() => {
          setWelcomeUser(null);
          window.location.reload();
        }, 1000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 1: Generate OTP
  const handleGenerateOtp = async () => {
    if (!email) return setPopupMsg("Please enter your registered email");

    setPopupLoading(true);
    setPopupMsg("");

    try {
      const res = await apiPost<GenerateOtpResponse, { username: string; user_emailid: string }>(
        "v1/generateotp",
        {
          username: email,   // dynamic: user input
          user_emailid: email // dynamic: user input
        }
      );

      if (res.status) {
        setPopupMsg("OTP sent to your email!");
        setStep("reset");
      } else {
        setPopupMsg(res.message || "Email not found");
      }
    } catch (err) {
      console.error(err);
      setPopupMsg("Something went wrong");
    } finally {
      setPopupLoading(false);
    }
  };

  // 🔹 Step 2: Update Password
  const handleUpdatePassword = async () => {
    if (!otp || !newPassword || !confirmPassword)
      return setPopupMsg("All fields are required");
    if (newPassword !== confirmPassword)
      return setPopupMsg("Passwords do not match");

    setPopupLoading(true);

    try {
      // Call proxy with endpoint "updatepassword" and body { email, otp, new_password }
      const res = await apiPost<UpdatePasswordResponse, { emailid: string; newpassword: string }>(
        "v1/updatepassword",
        {
          emailid: email,
          newpassword: newPassword
        }
      );

      if (res.status) {
        setPopupMsg("Password updated successfully! 🎉");
        setTimeout(() => {
          setShowForgotPopup(false);
          setStep("email");
          setEmail("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1200);
      } else {
        setPopupMsg(res.message || "Invalid OTP or error updating password");
      }
    } catch {
      setPopupMsg("Something went wrong");
    } finally {
      setPopupLoading(false);
    }

  };


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pt-6">
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 text-sm border-b border-[#0000008a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border-b border-[#0000008a] text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForgotPopup(true)}
          className="text-blue-600 hover:underline text-sm"
        >
          Forgot Password?
        </button>

        <div className=" text-[12px] text-[#0000008a]">
          <p>New to Narayana Job Portal? Create an account by clicking Register</p>

        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`mt-auto inline-flex items-center justify-center bg-[#1A7EBD] text-white font-medium px-5 py-2 rounded-full hover:bg-[#166ea8] transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>
        </div>
      </form>

      {/* ✅ Forgot Password Popup */}
      {showForgotPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 rounded-sm">
          <div className="bg-[#fff] w-[100%] h-[40%] max-w-2xl rounded-sm shadow-xl  relative animate-fadeIn flex flex-col md:flex-row">

            {/* Left Image Section */}
            <div className="md:w-1/2 flex items-center justify-center bg-[#1a7fbd]">
              <Image src="/assets/img/careers-logo.webp" alt="Logo" width={200} height={40} className="rounded-sm  md:w-[150px] w-[170px]" />
            </div>

            {/* Right Form Section */}
            <div className="md:w-1/2 mt-4 md:mt-0  flex flex-col justify-center p-4">
              <button
                onClick={() => setShowForgotPopup(false)}
                className="absolute -top-3 -right-3 text-[#fff] hover:text-black text-[12px] bg-[#ed7900] rounded-4xl p-5 w-3 h-3 flex justify-center align-middle leading-1 text-center"
              >
                ✖
              </button>

              <h2 className="text-xl font-bold text-[#000] mb-2">Enter Mail</h2>
              {/* <p className="text-[#fff] text-sm mb-4">
                An OTP successfully sent to your email
              </p> */}

              {step === "email" && (
                <>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    className="w-full text-[#000]  border-[#000] border-0 border-b px-3 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7EBD]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    onClick={(e) => { e.preventDefault(); handleGenerateOtp(); }}
                    disabled={popupLoading}
                    className="bg-[#1A7EBD] hover:bg-[#0284c7] text-white font-medium w-full py-2 rounded transition-all"
                  >
                    {popupLoading ? "Sending..." : "Send OTP"}
                  </button>
                </>
              )}

              {step === "reset" && (
                <>
                  <div className="flex justify-between mb-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }} // ✅ no return
                        type="text"
                        maxLength={1}
                        className="w-10 h-10 text-center border-b rounded focus:outline-none focus:ring-2 focus:ring-[#000]"
                        value={otp[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setOtp((prev) => {
                            const newOtp = prev.substring(0, i) + val + prev.substring(i + 1);
                            if (val && i < 5) otpRefs.current[i + 1]?.focus();
                            return newOtp;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            otpRefs.current[i - 1]?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const paste = e.clipboardData.getData("text").slice(0, 6);
                          setOtp(paste.padEnd(6, ""));
                          paste.split("").forEach((digit, index) => {
                            if (otpRefs.current[index]) otpRefs.current[index]!.value = digit;
                          });
                          const lastIndex = paste.length - 1;
                          otpRefs.current[lastIndex]?.focus();
                        }}
                      />
                    ))}
                  </div>

                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full text-[#000]  border-[#000] border-0 border-b px-3 py-2 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full text-[#000]  border-[#000] border-0 border-b px-3 py-2 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#000]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <button
                    onClick={handleUpdatePassword}
                    disabled={popupLoading}
                    className="bg-orange-400 hover:bg-orange-500 text-white font-medium w-full py-2 rounded transition-all"
                  >
                    {popupLoading ? "Updating..." : "Update Password"}
                  </button>
                </>
              )}

              {popupMsg && (
                <p className="text-sm text-gray-500 mt-3">{popupMsg}</p>
              )}
            </div>
          </div>
        </div>
      )}


    </>
  );
}
