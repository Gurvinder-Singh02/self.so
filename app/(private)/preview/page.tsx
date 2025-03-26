import { auth } from "@clerk/nextjs/server";
import PreviewClient from "./client";
import {
  createUsernameLookup,
  getResume,
  getUsernameById,
  storeResume,
} from "../../../lib/server/redisActions";
import { generateResumeObject } from "@/lib/server/generateResumeObject";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoadingFallback from "../../../components/LoadingFallback";
import { scrapePdfContent } from "@/lib/server/scrapePdfContent";

async function ResumeIngestion({ userId }: { userId: string }) {
  const resume = await getResume(userId);

  if (!resume || !resume.file || !resume.file.url) redirect("/resume");

  if (!resume.fileContent) {
    const fileContent = await scrapePdfContent(resume?.file.url);
    await storeResume(userId, {
      ...resume,
      fileContent: fileContent,
      resumeData: null,
    });
  }

  return (
    <Suspense
      fallback={
        <LoadingFallback message="Processing content with AI to tailor your profile..." />
      }
    >
      <LLMProcessing userId={userId} />
    </Suspense>
  );
}

async function LLMProcessing({ userId }: { userId: string }) {
  let resume = await getResume(userId);

  if (!resume?.fileContent) redirect("/upload");

  if (!resume.resumeData) {
    const resumeObject = await generateResumeObject(resume?.fileContent);
    storeResume(userId, {
      ...resume,
      resumeData: resumeObject,
    });
    resume.resumeData = resumeObject;
  }

  // we set the username only if it wasn't already set for this user meaning it's new user
  const foundUsername = await getUsernameById(userId);

  if (!foundUsername) {
    const username =
      resume.resumeData.header.name ||
      "user"
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-") +
        "-" +
        Math.random().toString(36).substring(2, 8);

    const creation = await createUsernameLookup({
      userId,
      username,
    });

    if (!creation) redirect("/resume?error=usernameCreationFailed");
  }

  return <PreviewClient />;
}

export default async function Preview() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  return (
    <>
      <Suspense
        fallback={
          <LoadingFallback message="Scraping and reading your resume carefully..." />
        }
      >
        <ResumeIngestion userId={userId} />
      </Suspense>
    </>
  );
}
