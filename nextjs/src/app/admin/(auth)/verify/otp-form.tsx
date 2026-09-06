"use client";

import { useActionState } from "react";
import { Controller } from "react-hook-form";

import { nextFromLocation } from "@/app/admin/(auth)/next-param";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { idleState } from "@/lib/actions/action-state";
import { cancelLoginAction, resendOtpAction, verifyOtpAction } from "@/lib/actions/auth-actions";
import { otpSchema, type OtpInput } from "@/lib/validations/auth-schema";

/**
 * The six-digit code.
 *
 * Two actions on one screen. The code goes to `verifyOtpAction`; the "send another" button is
 * its own form so that pressing it cannot submit a half-typed code, and so the two have
 * separate pending states.
 *
 * The field has no visible label, and that is the right call for this screen: six boxes under
 * a heading that says what to type into them is the pattern everybody already recognises, and
 * a label above them would be saying it a second time. It does mean the accessible name has
 * to be written by hand. `input-otp` renders one real input across all six slots, so the
 * `aria-label`, the `aria-invalid` and the `aria-describedby` all go on that one field, and a
 * screen reader gets a named box, the state of it and the reason it was rejected.
 */
const ERROR_ID = "otp-code-error";

export function OtpForm() {
  const { form, state, pending, submit } = useActionForm<OtpInput>({
    schema: otpSchema,
    action: verifyOtpAction,
    defaultValues: { code: "" },
  });

  const [resendState, resend, resending] = useActionState(resendOtpAction, idleState);
  const { errors } = form.formState;

  return (
    <div className="space-y-6">
      <form
        action={(formData) => {
          formData.set("next", nextFromLocation());
          submit(formData);
        }}
        className="space-y-6"
        noValidate
      >
        <Field data-invalid={Boolean(errors.code)}>
          <Controller
            control={form.control}
            name="code"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                name="code"
                aria-label="Six digit sign-in code"
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? ERROR_ID : undefined}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                autoFocus
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          <FieldError id={ERROR_ID} className="text-center" errors={[errors.code]} />
        </Field>

        <FormAlert state={state} />

        <SubmitButton pending={pending} pendingLabel="Verifying">
          Sign in
        </SubmitButton>
      </form>

      <form action={resend} className="space-y-4">
        <FormAlert state={resendState} />
        <div className="flex items-center justify-between text-sm">
          <Button
            type="submit"
            variant="link"
            disabled={resending}
            className="text-muted-foreground hover:text-primary h-auto p-0"
          >
            {resending ? "Sending" : "Send another code"}
          </Button>
          <Button
            type="submit"
            formAction={cancelLoginAction}
            variant="link"
            className="text-muted-foreground hover:text-primary h-auto p-0"
          >
            Use a different account
          </Button>
        </div>
      </form>
    </div>
  );
}
