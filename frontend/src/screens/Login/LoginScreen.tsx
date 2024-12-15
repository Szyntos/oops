import { useUser } from "../../hooks/common/useUser";
import { Styles } from "../../utils/Styles";
import { LoginForm } from "../../components/Welcome/LoginForm";
// import { SelectedUserInfo } from "../../components/Welcome/SelectedUserInfo";
import { useState, useEffect } from "react";

export const LoginScreen = () => {
  const { user: selectedUser } = useUser();
  const [randomText, setRandomText] = useState("");

  const randomMessages = [
    "The cake is a lie.",
    "War. War never changes.",
    "It's dangerous to go alone! Take this.",
    "Do a barrel roll!",
    "Would you kindly?",
    "I used to be an adventurer like you, then I took an arrow to the knee.",
    "You were almost a Jill sandwich!",
    "Finish him!",
    "Praise the sun!",
    "Thank you, Mario! But our princess is in another castle.",
    "Hey! Listen!",
    "You must construct additional pylons.",
    "Get over here!",
    "You died.",
    "Waka waka waka.",
    "Stay awhile and listen.",
    "What is better: to be born good, or to overcome your evil nature through great effort?",
    "Our lives are measured in years, but their deeds are measured in lives saved.",
    "Glory to mankind.",
    "This is my story.",
    "A man chooses, a slave obeys.",
    "Nothing is true, everything is permitted.",
    "Snake? SNAAAAKE!",
    "This is not your grave... but you are welcome in it.",
    "Hadouken!",
    "The right man in the wrong place can make all the difference in the world.",
    "Requiescat in pace.",
    "I am Error.",
    "Rise and shine, Mr. Freeman.",
    "Prepare to die.",
  ];

  useEffect(() => {
    const generateRandomText = () => {
      const randomIndex = Math.floor(Math.random() * randomMessages.length);
      setRandomText(randomMessages[randomIndex]);
    };

    generateRandomText();
  }, []);

  return (
    <div style={styles.screenContainer}>
      <div style={styles.card}>
        <h1 style={styles.title}>oops... 🤭</h1>
        <p style={styles.welcomeText}>Object Oriented Programming System</p>
        <span style={styles.emoji}>(˶ᵔ ᵕ ᵔ˶)</span>
        {selectedUser && (
          <div style={styles.userInfoContainer}>
            <LoginForm />
          </div>
        )}
        {!selectedUser && (
          <p style={styles.subtitle}>Please log in to access your account</p>
        )}

        <span style={styles.randomisedText}>{randomText}</span>
      </div>
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f0f2f5",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px",
  },
  emoji: {
    fontSize: "22px",
    color: "#444",
    display: "block",
    margin: "20px 0",
  },
  randomisedText: {
    fontSize: "14px",
    color: "#777",
    marginTop: "40px",
    fontStyle: "italic",
  },
  userInfoContainer: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
    background: "#f9fafb",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
  },
  userInfoTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
};
