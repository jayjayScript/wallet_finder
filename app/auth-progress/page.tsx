"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthProgress() {
  const router = useRouter();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--gh-canvas, #0d1117)",
      color: "var(--gh-text-primary, #e6edf3)",
      fontFamily: "monospace",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ 
        fontSize: "24px", 
        marginBottom: "40px", 
        letterSpacing: "2px",
        color: "var(--gh-text-primary, #e6edf3)" 
      }}>
        DATA AUTHENTICATION IN PROGRESS{dots}
      </h1>
      
      {/* Huge loader */}
      <div style={{ marginBottom: "50px" }}>
        <div className="custom-loader" style={{
          width: "100px",
          height: "100px",
          border: "8px solid rgba(88, 166, 255, 0.1)",
          borderTop: "8px solid #3fb950",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
      </div>
      
      <p style={{ 
        fontSize: "16px", 
        color: "var(--gh-text-muted, #8b949e)", 
        maxWidth: "400px", 
        lineHeight: "1.5" 
      }}>
        You will receive a confirmation email, this usually takes 24 to 48hrs
      </p>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
