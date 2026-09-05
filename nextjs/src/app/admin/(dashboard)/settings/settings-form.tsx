"use client";

import { useJsonField } from "@/components/admin/json-field";
import { FormAlert } from "@/components/forms/form-alert";
import { ImageUpload } from "@/components/forms/image-upload";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BUSINESS } from "@/content/business";
import { saveSiteSettingsFormAction } from "@/lib/actions/settings-actions";
import type { SiteSettingsDTO } from "@/lib/dto";
import type { ImageValue } from "@/lib/validations/image-schema";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validations/site-settings-schema";

/**
 * Site settings.
 *
 * These values are read by every page, so the mistakes they can carry are site-wide mistakes.
 * The NAP block is the one that matters most: it has to match the Google Business Profile
 * character for character, because divergence between the two weakens the local ranking signal
 * that the Event Space page depends on. That is why the fields are required rather than
 * optional and why the note below says so out loud.
 *
 * The social links are all optional and all validated as full URLs. A half-typed handle in one
 * of them puts a broken link in the footer of every page on the site.
 */

/** The social accounts, as one list, so the fields and their labels cannot disagree. */
const SOCIAL_FIELDS = [
  { name: "facebook", label: "Facebook" },
  { name: "instagram", label: "Instagram" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "x", label: "X" },
  { name: "youtube", label: "YouTube" },
  { name: "tiktok", label: "TikTok" },
  { name: "whatsapp", label: "WhatsApp" },
] as const;

export function SettingsForm({ settings }: { settings: SiteSettingsDTO | null }) {
  const nap = settings?.nap;

  const { form, state, pending, submit } = useActionForm<SiteSettingsInput>({
    schema: siteSettingsSchema,
    action: saveSiteSettingsFormAction,
    defaultValues: {
      nap: {
        // Falls back to the constant that seeded the document, so a database that has not been
        // seeded opens with the real address rather than nine empty fields.
        legalName: nap?.legalName ?? BUSINESS.legalName,
        streetAddress: nap?.streetAddress ?? BUSINESS.streetAddress,
        locality: nap?.locality ?? BUSINESS.locality,
        region: nap?.region ?? BUSINESS.region,
        country: nap?.country ?? BUSINESS.country,
        countryCode: nap?.countryCode ?? BUSINESS.countryCode,
        phone: nap?.phone ?? BUSINESS.phone,
        email: nap?.email ?? BUSINESS.email,
        latitude: String(nap?.latitude ?? BUSINESS.latitude),
        longitude: String(nap?.longitude ?? BUSINESS.longitude),
      },
      socialLinks: {
        facebook: settings?.socialLinks.facebook ?? "",
        instagram: settings?.socialLinks.instagram ?? "",
        linkedin: settings?.socialLinks.linkedin ?? "",
        x: settings?.socialLinks.x ?? "",
        youtube: settings?.socialLinks.youtube ?? "",
        tiktok: settings?.socialLinks.tiktok ?? "",
        whatsapp: settings?.socialLinks.whatsapp ?? "",
      },
      sisterSites: {
        education: settings?.sisterSites.education ?? "https://edu.bitnoxsolution.com",
        cleaning: settings?.sisterSites.cleaning ?? "https://cleaning.bitnoxsolution.com",
      },
      defaultOgImage: settings?.defaultOgImage ? JSON.stringify(settings.defaultOgImage) : "",
      gtmId: settings?.gtmId ?? "",
    },
  });

  const { errors } = form.formState;
  const [ogImage, setOgImage] = useJsonField<SiteSettingsInput, ImageValue>(form, "defaultOgImage");

  return (
    <form action={submit} className="mt-8 max-w-2xl space-y-12" noValidate>
      <section aria-labelledby="nap" className="space-y-5">
        <div>
          <h2 id="nap" className="text-foreground text-sm font-semibold">
            Name, address and phone
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            This has to match the Google Business Profile word for word. It is used in the footer,
            on the contact page and in the structured data that puts the Event Space in local search
            results, and the two records disagreeing weakens all three.
          </p>
        </div>

        <Field data-invalid={Boolean(errors.nap?.legalName)}>
          <FieldLabel htmlFor="legalName">Legal name</FieldLabel>
          <Input id="legalName" {...form.register("nap.legalName")} />
          <FieldError errors={[errors.nap?.legalName]} />
        </Field>

        <Field data-invalid={Boolean(errors.nap?.streetAddress)}>
          <FieldLabel htmlFor="streetAddress">Street address</FieldLabel>
          <Input id="streetAddress" {...form.register("nap.streetAddress")} />
          <FieldError errors={[errors.nap?.streetAddress]} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.nap?.locality)}>
            <FieldLabel htmlFor="locality">Town or city</FieldLabel>
            <Input id="locality" {...form.register("nap.locality")} />
            <FieldError errors={[errors.nap?.locality]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.region)}>
            <FieldLabel htmlFor="region">State or region</FieldLabel>
            <Input id="region" {...form.register("nap.region")} />
            <FieldError errors={[errors.nap?.region]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.country)}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" {...form.register("nap.country")} />
            <FieldError errors={[errors.nap?.country]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.countryCode)}>
            <FieldLabel htmlFor="countryCode">Country code</FieldLabel>
            <Input id="countryCode" maxLength={2} {...form.register("nap.countryCode")} />
            <FieldDescription>Two letters, such as NG.</FieldDescription>
            <FieldError errors={[errors.nap?.countryCode]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.phone)}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" type="tel" {...form.register("nap.phone")} />
            <FieldError errors={[errors.nap?.phone]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...form.register("nap.email")} />
            <FieldError errors={[errors.nap?.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.latitude)}>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input id="latitude" inputMode="decimal" {...form.register("nap.latitude")} />
            <FieldError errors={[errors.nap?.latitude]} />
          </Field>

          <Field data-invalid={Boolean(errors.nap?.longitude)}>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input id="longitude" inputMode="decimal" {...form.register("nap.longitude")} />
            <FieldDescription>
              The coordinates the map and the venue markup use. Take them from the pin on the
              Business Profile rather than from a search.
            </FieldDescription>
            <FieldError errors={[errors.nap?.longitude]} />
          </Field>
        </div>
      </section>

      <section aria-labelledby="sister-sites" className="space-y-5">
        <div>
          <h2 id="sister-sites" className="text-foreground text-sm font-semibold">
            Sister sites
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            The education link appears in the navigation, the hero, the Technology Training page, a
            band on the landing page and the footer. Emptying it blanks all five.
          </p>
        </div>

        <Field data-invalid={Boolean(errors.sisterSites?.education)}>
          <FieldLabel htmlFor="education">Bitnox Education</FieldLabel>
          <Input id="education" {...form.register("sisterSites.education")} />
          <FieldError errors={[errors.sisterSites?.education]} />
        </Field>

        <Field data-invalid={Boolean(errors.sisterSites?.cleaning)}>
          <FieldLabel htmlFor="cleaning">Bitnox Cleaning</FieldLabel>
          <Input id="cleaning" {...form.register("sisterSites.cleaning")} />
          <FieldError errors={[errors.sisterSites?.cleaning]} />
        </Field>
      </section>

      <section aria-labelledby="social" className="space-y-5">
        <div>
          <h2 id="social" className="text-foreground text-sm font-semibold">
            Social accounts
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Full addresses, including https. An account left blank is left out of the footer rather
            than shown as a dead icon.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((social) => (
            <Field key={social.name} data-invalid={Boolean(errors.socialLinks?.[social.name])}>
              <FieldLabel htmlFor={social.name}>{social.label}</FieldLabel>
              <Input
                id={social.name}
                placeholder="https://"
                {...form.register(`socialLinks.${social.name}`)}
              />
              <FieldError errors={[errors.socialLinks?.[social.name]]} />
            </Field>
          ))}
        </div>
      </section>

      <section aria-labelledby="analytics" className="space-y-5">
        <div>
          <h2 id="analytics" className="text-foreground text-sm font-semibold">
            Analytics and sharing
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Both are optional. With no Tag Manager container set, no analytics script is loaded at
            all.
          </p>
        </div>

        <Field data-invalid={Boolean(errors.gtmId)}>
          <FieldLabel htmlFor="gtmId">Tag Manager container</FieldLabel>
          <Input id="gtmId" placeholder="GTM-XXXXXXX" {...form.register("gtmId")} />
          <FieldDescription>
            Overrides the container named in the environment, so analytics can be changed without a
            deploy. Leave it blank on a staging site to keep test traffic out of the real container.
          </FieldDescription>
          <FieldError errors={[errors.gtmId]} />
        </Field>

        <ImageUpload
          name="defaultOgImage"
          label="Default social image"
          folder="site"
          value={ogImage}
          onChange={setOgImage}
          description="Used when a page has no image of its own. It is what appears when a link to the site is pasted into WhatsApp or LinkedIn."
        />
      </section>

      <div className="space-y-3">
        <FormAlert state={state} />
        <SubmitButton pending={pending} pendingLabel="Saving" className="sm:w-auto sm:px-8">
          Save the settings
        </SubmitButton>
      </div>
    </form>
  );
}
