"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
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
  loginSchema,
  type LoginFormType,
} from "@/lib/validations/auth-validator";
import { authService } from "@/lib/services/auth-service";
import { Link } from "react-router-dom";

interface Props {
  onSuccess: (email: string) => void;
}

const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);
    try {
      await authService.login({ email: data.email });
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
        <h2>Log in to your account</h2>
        <p>
          Don't have an account?{" "}
          <Link to="/auth/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
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
              Logging in...
            </>
          ) : (
            <>
              Log in
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
