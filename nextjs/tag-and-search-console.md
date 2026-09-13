Good — that's the durable one. Nothing to do, then.

Leave GOOGLE_SITE_VERIFICATION empty. It's already blank at .env:40, and it's optionalString in env.ts:73, so Next omits the meta tag rather than emitting an empty one. Don't set it in production either. A DNS-verified property doesn't need a tag on the page, and adding a redundant second method just gives you another thing to keep track of.

The cutover is now safe from the verification angle. Deleting client/ and server/ and deploying the Next.js app can't touch a TXT record.

One thing to watch at cutover
The risk moves from your code to your DNS panel. When you repoint the domain at the new host, how you do it decides whether the TXT record survives:

Editing the A / CNAME records inside Namecheap's Advanced DNS — safe. The TXT record sits untouched alongside them.
Switching nameservers away from Namecheap (to Vercel DNS, Cloudflare, or anywhere else) — the entire zone is abandoned. Every record including the verification TXT stops resolving, and Search Console unverifies the property on its next re-check.
If you end up moving nameservers, copy the TXT record across to the new provider as part of the same change, not afterwards. Google re-checks on its own schedule, so a gap of a few hours is usually survivable, but there's no reason to gamble on the timing.

While you're in there: since the apex is your canonical host, you'll need an A record or Namecheap's ALIAS record for bitnoxsolution.com (a plain CNAME won't work at the apex), plus a CNAME for www pointing wherever you want it to land before it 301s to the apex.

What's actually left
NEXT_PUBLIC_SITE_URL=https://bitnoxsolution.com in the production env.
New GTM container ID into NEXT_PUBLIC_GTM_ID or the admin site settings, with the consent defaults mirrored from the edu container.
Submit https://bitnoxsolution.com/sitemap.xml in the existing property after the new site is live.
