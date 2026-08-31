---
name: Imported backend runtime constraints
description: Environment assumptions that affect compiling and starting the imported WorkBloom Spring Boot backend.
---

The imported backend must be compiled against the Java runtime available in Replit rather than assuming the JDK target declared by the source project. Full Spring context tests also require the configured PostgreSQL service to be running.

**Why:** The source project targeted a newer Java release than the active Replit JDK, and context initialization could not complete when the local database port was unavailable.

**How to apply:** Check the active JDK before compiling imported Maven projects, and separate code/build verification from database-backed startup verification.