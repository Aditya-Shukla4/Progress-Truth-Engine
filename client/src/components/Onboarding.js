"use client";
import { useState } from "react";
import { auth, provider, signInWithPopup } from "../firebase"; // Import Firebase

export default function Onboarding({ apiBase, onLogin }) {
  const [loading, setLoading] = useState(false);

  // Extra Info Form (Sirf naye users ke liye)
  const [needsInfo, setNeedsInfo] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [form, setForm] = useState({ height: "", dietType: "veg" });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Google se data mila (Name, Email)

      console.log("Google User:", user.email);
      setGoogleUser(user);

      // Ab hum try karenge Backend pe login karne ki
      await attemptBackendLogin(user.displayName, user.email, null, null);
    } catch (error) {
      console.error("Login Failed", error);
      alert("Login Failed. Try again.");
    }
  };

  const attemptBackendLogin = async (username, email, height, dietType) => {
    setLoading(true);
    try {
      // Agar height nahi pata, toh backend ko mat bhejo abhi, bas check karo
      // Lekin humare naye backend logic me email se check hota hai.
      // Trick: Hum seedha create call karenge. Agar height missing hai aur user naya hai, toh error aayega ya hume handle karna padega.

      // Better Logic: Pehle check karte hain agar hum bina height ke bhejte hain.
      // Lekin simplicity ke liye: Hum user se Height pehle maang lenge agar wo naya hai?
      // Nahi, flow simple rakhte hain:

      // 1. Google Login -> Check DB via separate route? No, let's keep simple.
      // User form bharega -> Fir "Sign in with Google" dabayega to complete.

      // Actually, standard flow:
      // Click Google -> Get Email.
      // If Email exists in DB -> Login done.
      // If Email NOT in DB -> Show "Enter Height" form -> Then Save.

      // Abhi ke liye:
      if (!height && !needsInfo) {
        // Check if user exists first?
        // Chalo direct try karte hain, agar naya user hai toh height maangenge.
        // Lekin abhi humare paas "Check" route nahi hai.

        // Temporary Jugad: User pehle form bharega (Height), fir Google Login karega.
        setNeedsInfo(true);
        setLoading(false);
        return;
      }

      const payload = {
        username: username,
        email: email,
        height: height || 0, // Fallback
        dietType: dietType || "veg",
      };

      const res = await fetch(`${apiBase}/api/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data._id) {
        onLogin(data._id);
      } else {
        // Shayad validation fail hua (Height missing)
        setNeedsInfo(true);
      }
    } catch (err) {
      alert("Server Error");
    }
    setLoading(false);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (googleUser) {
      attemptBackendLogin(
        googleUser.displayName,
        googleUser.email,
        form.height,
        form.dietType
      );
    }
  };

  if (needsInfo) {
    return (
      <div style={cardStyle}>
        <h2
          style={{
            borderBottom: "1px solid #333",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          COMPLETE PROFILE
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "10px" }}>
          Welcome, {googleUser?.displayName}! Just need a few details.
        </p>
        <form
          onSubmit={handleFinalSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            placeholder="Height (cm)"
            type="number"
            required
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            style={inputStyle}
          />
          <select
            onChange={(e) => setForm({ ...form, dietType: e.target.value })}
            style={inputStyle}
          >
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Veg</option>
            <option value="eggs">Veg + Eggs</option>
          </select>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "SAVING..." : "FINISH SETUP"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h2
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
          marginBottom: "15px",
        }}
      >
        IDENTIFY YOURSELF
      </h2>

      <button
        onClick={handleGoogleLogin}
        style={{
          ...btnStyle,
          backgroundColor: "#fff",
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="G"
          style={{ width: "20px" }}
        />
        SIGN IN WITH GOOGLE
      </button>

      <p
        style={{
          marginTop: "15px",
          fontSize: "0.7rem",
          color: "#666",
          textAlign: "center",
        }}
      >
        Secure Login to keep your data safe forever.
      </p>
    </div>
  );
}

const cardStyle = {
  width: "100%",
  maxWidth: "400px",
  border: "1px solid #333",
  padding: "20px",
  backgroundColor: "#111",
};
const inputStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#222",
  border: "1px solid #444",
  color: "white",
  outline: "none",
};
const btnStyle = {
  width: "100%",
  padding: "15px",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
};
