"use client";

import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { otpSchema, type OTPFormType } from "@/lib/validations/auth-validator";
import { authService } from "@/lib/services/auth-service";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface Props {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const AuthOTPForm: React.FC<Props> = ({ email, onVerified, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResendOTP, setIsLoadingResendOTP] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const form = useForm<OTPFormType>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    // reset form when email changes
    form.reset();
    setResendCountdown(0);
  }, [email, form]);

  const onSubmit = async (data: OTPFormType) => {
    setIsLoading(true);
    try {
      const res = await authService.verifyOTP({ email, otp: data.otp });
      if (res.success) {
        toast.success("Login successful!");
        onVerified();
      }
    } catch (err: unknown) {
      const e = err as { message?: string; error?: string };
      toast.error(e?.message || e?.error || "Invalid OTP. Please try again.");
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setIsLoadingResendOTP(true);
    try {
      await authService.resendOTP(email);
      toast.success("OTP resent successfully!");
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const e = err as { message?: string; error?: string };
      toast.error(e?.message || e?.error || "Failed to resend OTP.");
    } finally {
      setIsLoadingResendOTP(false);
    }
  };

  return (
    <>
      <div className="auth-form-header">
        <h2>Verify Your Email</h2>
        <p>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <FieldGroup>
          <FieldLabel>One-Time Password</FieldLabel>
          <FieldDescription>
            Check your email for the verification code
          </FieldDescription>
          <Controller
            name="otp"
            control={form.control}
            render={({ field }) => (
              <div className="otp-input-wrapper">
                <InputOTP
                  {...field}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  onComplete={() => form.handleSubmit(onSubmit)()}
                  disabled={isLoading || isLoadingResendOTP}
                  className="w-full!"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="size-12" />
                    <InputOTPSlot index={1} className="size-12" />
                    <InputOTPSlot index={2} className="size-12" />
                    <InputOTPSlot index={3} className="size-12" />
                    <InputOTPSlot index={4} className="size-12" />
                    <InputOTPSlot index={5} className="size-12" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          disabled={isLoading || isLoadingResendOTP || !form.formState.isValid}
          className="auth-submit-button"
        >
          {isLoading ? (
            <>
              <span className="spinner-small" />
              Verifying...
            </>
          ) : (
            <>
              Verify & Login
              <ArrowRight size={18} />
            </>
          )}
        </Button>

        <div className="otp-resend">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCountdown > 0 || isLoading || isLoadingResendOTP}
            className="otp-resend-button"
          >
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : "Resend OTP"}
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          disabled={isLoading || isLoadingResendOTP}
          className="back-button"
        >
          ← Back to Credentials
        </button>
      </form>
    </>
  );
};

export default AuthOTPForm;
