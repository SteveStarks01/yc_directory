import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import EditStartupForm from "@/components/EditStartupForm";

const EditStartupPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch the startup to edit
  const startup = await client.fetch(
    `*[_type == "startup" && _id == $id][0] {
      _id,
      name,
      tagline,
      description,
      category,
      link,
      pitch,
      image,
      views,
      author->{
        _id,
        userId,
        name,
        username,
        email,
        image,
        bio
      },
      _createdAt
    }`,
    { id }
  );

  if (!startup) {
    notFound();
  }

  // Check if the current user is the author of this startup
  if (startup.author?.userId !== userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <section className="hero_container !min-h-[230px]">
        <h1 className="heading">Edit Your Startup</h1>
        <p className="sub-heading !max-w-3xl">
          Update your startup information and share your progress with the community.
        </p>
      </section>

      <EditStartupForm startup={startup} />
    </>
  );
};

export default EditStartupPage;
