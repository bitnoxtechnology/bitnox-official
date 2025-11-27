"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import SignupForm from "@/components/forms/SignupForm";
import AuthOTPForm from "@/components/forms/AuthOTPForm";

type SignupStep = "credentials" | "otp" | "success";

const Signup = () => {
  const [step, setStep] = useState<SignupStep>("credentials");
  const [emailForOTP, setEmailForOTP] = useState("");

  const handleCredentialsSuccess = (email: string) => {
    setEmailForOTP(email);
    setStep("otp");
  };

  const handleVerificationSuccess = () => {
    setStep("success");
    setTimeout(() => {
      window.location.href = "/dashboard";
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
            <h1 className="auth-title">Join Bitnox</h1>
            <p className="auth-subtitle">
              Start your journey with cutting-edge technology solutions
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
              <SignupForm onSuccess={handleCredentialsSuccess} />
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
              <h2>Welcome to Bitnox!</h2>
              <p>Your account has been created successfully.</p>
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

export default Signup;
