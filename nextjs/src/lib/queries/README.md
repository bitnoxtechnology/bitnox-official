# Queries

Cached reads for the public pages.

Every function here is a `"use cache"` boundary that declares a tag from `src/lib/cache.ts`
and returns DTOs from `src/lib/dto.ts`. Nothing else in the application reads a model for a
public page, which is what makes "static by default, invalidated by tag" true rather than
aspirational: the tag is attached in one place per collection, and the admin mutation that
changes the data calls `revalidateTag()` with the same constant.

Server actions and admin screens query their models directly. They are behind a guard, they
are never cached, and routing their reads through here would only add a cache entry that has
to be invalidated immediately.
