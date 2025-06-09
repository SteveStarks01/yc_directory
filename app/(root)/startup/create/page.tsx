import SimpleStartupForm from "@/components/SimpleStartupForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  return (
    <>
      <section className="hero_container !min-h-[230px]">
        <h1 className="heading">Submit Your Startup</h1>
        <p className="sub-heading !max-w-3xl">
          Share your startup idea with the community and get feedback from fellow entrepreneurs.
        </p>
      </section>

      <SimpleStartupForm />
    </>
  );
};

export default Page;
