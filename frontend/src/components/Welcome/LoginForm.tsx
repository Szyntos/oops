import { useState } from "react";
import { useLogin } from "../../hooks/auth/useLogin";

export const LoginForm = () => {
  const { loginWithCredentials, resetPassword } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginWithCredentials({ email, password });
      setLoginError("");
    } catch (error) {
      console.error("ERROR: ", error);
      setLoginError((error as Error).message);
    }
  };

  const handleResetPasword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await resetPassword(email);
    } catch (error) {
      console.error("ERROR: ", error);
      setLoginError((error as Error).message);
    }
  };

  return (
    <div>
      <h2>Twoja historia zaczyna się tutaj</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {loginError && <p className="error">{loginError}</p>}
        <button type="submit">Login</button>
        <button onClick={handleResetPasword}>Reset password</button>
      </form>
    </div>
  );
};
