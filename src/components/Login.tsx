import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../utils/api";
import { addUser } from "../utils/userSlice";
import { useAppDispatch } from "../utils/hooks";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await api.post("/login", { emailId, password });
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await api.post("/signup", {
        firstName,
        lastName,
        emailId,
        password,
      });
      dispatch(addUser(res.data.data));
      navigate("/profile");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md overflow-hidden border border-primary/20 bg-base-100 shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

        <div className="card-body gap-5 p-6 sm:p-8">
          <div className="mb-2 flex flex-col items-center gap-3 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-5xl shadow-inner">
              👨‍💻
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {isLoginForm ? "Welcome Back!" : "Join Dev Connect"}
            </h2>
            <p className="text-sm text-base-content/60">
              {isLoginForm
                ? "Login to connect with amazing developers."
                : "Create your account and grow your network."}
            </p>
          </div>

          {!isLoginForm && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">First Name</span>
                </div>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  className="input input-bordered w-full transition focus:border-primary"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Last Name</span>
                </div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  className="input input-bordered w-full transition focus:border-primary"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>
          )}

          <div className="form-control w-full gap-2">
            <label className="label">
              <span className="label-text font-medium">Email Address</span>
            </label>
            <label className="input input-bordered validator flex w-full items-center gap-3 focus-within:border-primary">
              <svg
                className="h-[1em] opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                placeholder="mail@site.com"
                required
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </label>
            <p className="validator-hint hidden">Enter a valid email address.</p>
          </div>

          <div className="form-control w-full gap-2">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <label className="input input-bordered validator flex w-full items-center gap-3 focus-within:border-primary">
              <svg
                className="h-[1em] opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must contain at least 8 characters, one number, one lowercase and one uppercase letter"
              />
            </label>
            <p className="validator-hint hidden">
              Must contain at least 8 characters, including:
              <br />
              At least one number
              <br />
              At least one lowercase letter
              <br />
              At least one uppercase letter
            </p>
          </div>

          {error && (
            <div className="alert alert-error py-3 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v4m0 4h.01M5.07 19h13.86a2 2 0 0 0 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.34 16a2 2 0 0 0 1.73 3Z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            className="btn btn-primary mt-2 w-full shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-primary/30"
            disabled={isSubmitting}
            onClick={isLoginForm ? handleLogin : handleSignUp}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : isLoginForm ? (
              "Login to Your Account"
            ) : (
              "Create Account"
            )}
            {!isSubmitting && <span className="text-lg">→</span>}
          </button>

          <div className="divider my-0 text-xs text-base-content/40">OR</div>

          <p className="text-center text-sm text-base-content/70">
            {isLoginForm ? "New to Dev Connect?" : "Already have an account?"}
            <button
              type="button"
              className="ml-1 font-bold text-primary transition hover:underline"
              onClick={() => setIsLoginForm((value) => !value)}
            >
              {isLoginForm ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
