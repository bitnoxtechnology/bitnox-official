"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import LoginForm from "@/components/forms/LoginForm";
import AuthOTPForm from "@/components/forms/AuthOTPForm";

type LoginStep = "credentials" | "otp" | "success";

const Login = () => {
  const [step, setStep] = useState<LoginStep>("credentials");
  const [emailForOTP, setEmailForOTP] = useState("");

  const handleCredentialsSuccess = (email: string) => {
    setEmailForOTP(email);
    setStep("otp");
  };

  const handleVerificationSuccess = () => {
    setStep("success");
    setTimeout(() => {
      window.location.href = "/admin";
    }, 2000);
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-branding">
          <div className="auth-branding-content">
            <h1 className="auth-title">Welcome Back to Bitnox</h1>
            <p className="auth-subtitle">
              Securely access your account with cutting-edge technology
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <CheckCircle2 className="feature-icon" />
                <span>Secure Authentication</span>
              </div>
              <div className="auth-feature">
                <CheckCircle2 className="feature-icon" />
                <span>Lightning Fast Setup</span>
              </div>
              <div className="auth-feature">
                <CheckCircle2 className="feature-icon" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          {step === "credentials" && (
            <div className="auth-form-wrapper">
              <LoginForm onSuccess={handleCredentialsSuccess} />
            </div>
          )}

          {step === "otp" && (
            <div className="auth-form-wrapper">
              <AuthOTPForm
                email={emailForOTP}
                onVerified={handleVerificationSuccess}
                onBack={handleBackToCredentials}
              />
            </div>
          )}

          {step === "success" && (
            <div className="auth-success">
              <div className="success-icon">
                <CheckCircle2 size={64} />
              </div>
              <h2>Welcome back to Bitnox!</h2>
              <p>You have successfully logged in.</p>
              <p className="success-email">Email: {emailForOTP}</p>
              <div className="success-redirect">
                <p>Redirecting to dashboard...</p>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
