"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  signupSchema,
  type SignupFormType,
} from "@/lib/validations/signup-validator";
import { signupService } from "@/lib/services/signup-service";

interface Props {
  onSuccess: (email: string) => void;
}

const SignupForm: React.FC<Props> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormType>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (data: SignupFormType) => {
    setIsLoading(true);
    try {
      await signupService.signup({ name: data.name, email: data.email });
      toast.success(`OTP sent to ${data.email}`);
      onSuccess(data.email);
    } catch (err: unknown) {
      const e = err as { message?: string; error?: string };
      toast.error(
        e?.message || e?.error || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-form-header">
        <h2>Create Account</h2>
        <p>Sign up with your details to get started</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <div className="auth-input-wrapper">
                  <User className="auth-input-icon" size={20} />
                  <Input
                    {...field}
                    id="name"
                    placeholder="John Doe"
                    aria-invalid={fieldState.invalid}
                    className="ps-10!"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" size={20} />
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    aria-invalid={fieldState.invalid}
                    className="pl-10!"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading || !form.formState.isValid}
          className="auth-submit-button"
        >
          {isLoading ? (
            <>
              <span className="spinner-small" />
              Sending OTP...
            </>
          ) : (
            <>
              Continue to OTP
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default SignupForm;
